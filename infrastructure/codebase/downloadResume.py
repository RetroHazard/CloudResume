"""Issues a short-lived CloudFront signed URL for the CV, and records the download.

The PDF lives behind an `ordered_cache_behavior` on `/files/*` whose `trusted_key_groups`
means CloudFront rejects any request without a valid signature at the edge, before the
object body is ever transferred. This function is the only thing that can mint one.

Two properties are load-bearing and easy to break:

  * The URL is built on the site apex, not the `*.cloudfront.net` domain. Same-origin is
    the only condition the HTML spec places on honouring a link's `download` attribute, so
    signing the distribution domain instead would make browsers silently *navigate* to the
    PDF rather than download it, with nothing logged anywhere.
  * The object key is derived server-side, never from the request. A handler that signed
    a caller-supplied key would be a signing oracle for every object in the bucket.

The PDF itself is no longer a hand-maintained file. The site build publishes the data it
renders as `data/cv-source.json`, and this function compiles that into a CV (renderResume)
on demand, caching the result in S3 under a digest of its content. A click only pays for a
render when the site has changed since the last one; otherwise it costs a conditional GET
that S3 answers with a 304.

The CV's contact address is a forwarding alias issued here as well (see _contact_address and
forwardMail.py), so revoking one shows up on the next download.
"""

import base64
import hashlib
import json
import logging
import os
import re
import secrets
import time
from datetime import datetime, timedelta, timezone

import boto3
from botocore.exceptions import ClientError

import renderResume

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
ssm = boto3.client('ssm')
s3 = boto3.client('s3')

record_table = dynamodb.Table(os.environ['recordTableName'])
alias_table = dynamodb.Table(os.environ['aliasTableName'])
ALLOWED_ORIGIN = os.environ['allowedOrigin']
BASE_URL = os.environ['downloadBaseUrl'].rstrip('/')
SITE_BUCKET = os.environ['siteBucket']
CV_SOURCE_KEY = os.environ['cvSourceKey'].lstrip('/')
CV_PREFIX = os.environ['cvObjectPrefix'].strip('/')
KEY_PARAMETER = os.environ['signingKeyParameter']
KEY_PAIR_ID = os.environ['signingKeyPairId']
URL_TTL = int(os.environ['signedUrlTtl'])
CONTACT_DOMAIN = os.environ['contactDomain']

# The alias table's pointer to the live address. Rotating or revoking deletes it.
ALIAS_POINTER = '#current'

# The counter shares the dedupe table. It deliberately carries no `ttl` attribute —
# DynamoDB's TTL sweeper ignores items that lack one, so this row never expires while the
# per-visitor rows above it do.
COUNTER_ID = 'download_count'

# Fetched on first use rather than at import. An SSM failure during module import surfaces
# as an opaque Runtime.ImportModuleError with no usable traceback; deferring it means the
# real exception reaches CloudWatch.
_signing_key = None

# What this container last resolved the CV to: the source object's ETag and parsed body, the
# UTC day the model was built on (certification expiry is date-dependent), the contact alias
# it printed, and the PDF key all of that mapped to.
_cv = {'etag': None, 'source': None, 'day': None, 'contact': None, 'key': None}


def _read_tlv(buf, index):
    """Read one ASN.1 tag-length-value triple, returning (tag, value, next_index)."""
    tag = buf[index]
    index += 1
    length = buf[index]
    index += 1
    if length & 0x80:
        count = length & 0x7F
        length = int.from_bytes(buf[index : index + count], 'big')
        index += count
    return tag, buf[index : index + length], index + length


def _rsa_private_numbers(der):
    """Pull (modulus, private exponent) out of a PKCS#1 RSAPrivateKey body.

    RSAPrivateKey ::= SEQUENCE { version, modulus, publicExponent, privateExponent, ... }
    """
    _, sequence, _ = _read_tlv(der, 0)
    _, _, index = _read_tlv(sequence, 0)
    _, modulus, index = _read_tlv(sequence, index)
    _, _, index = _read_tlv(sequence, index)
    _, private_exponent, _ = _read_tlv(sequence, index)
    return int.from_bytes(modulus, 'big'), int.from_bytes(private_exponent, 'big')


def _parse_private_key(pem):
    """Accept either PEM encoding openssl might have produced.

    `openssl genrsa` emits PKCS#1 ("BEGIN RSA PRIVATE KEY") on 1.x and PKCS#8
    ("BEGIN PRIVATE KEY") on 3.x, and the difference is invisible until signing fails.
    """
    body = ''.join(line for line in pem.strip().splitlines() if '-----' not in line)
    der = base64.b64decode(body)
    if 'BEGIN RSA PRIVATE KEY' in pem:
        return _rsa_private_numbers(der)

    # PKCS#8 PrivateKeyInfo ::= SEQUENCE { version, AlgorithmIdentifier, OCTET STRING }
    _, sequence, _ = _read_tlv(der, 0)
    _, _, index = _read_tlv(sequence, 0)
    _, _, index = _read_tlv(sequence, index)
    _, pkcs1, _ = _read_tlv(sequence, index)
    return _rsa_private_numbers(pkcs1)


# DER prefix for an EMSA-PKCS1-v1_5 DigestInfo wrapping a SHA-1 digest.
_SHA1_DIGEST_INFO = bytes.fromhex('3021300906052b0e03021a05000414')


def _sign_sha1(message, modulus, private_exponent):
    """RSASSA-PKCS1-v1_5 over SHA-1 — the only scheme CloudFront accepts.

    The Lambda python3.12 runtime bundles boto3 but not `cryptography`, and every function
    in this repo is packaged as a single bare .py by `data.archive_file`. Rather than
    introduce a layer purely for one modexp, the padding is built by hand. It is fully
    deterministic and no attacker-controlled input reaches it; `openssl dgst -sha1 -verify`
    cross-checks it in the test suite.
    """
    digest_info = _SHA1_DIGEST_INFO + hashlib.sha1(message).digest()
    size = (modulus.bit_length() + 7) // 8
    padded = b'\x00\x01' + b'\xff' * (size - len(digest_info) - 3) + b'\x00' + digest_info
    signature = pow(int.from_bytes(padded, 'big'), private_exponent, modulus)
    return signature.to_bytes(size, 'big')


def _cloudfront_b64(raw):
    """CloudFront's URL-safe base64 variant: + = / become - _ ~."""
    return base64.b64encode(raw).decode('ascii').translate(str.maketrans('+=/', '-_~'))


def _signing_numbers():
    global _signing_key
    if _signing_key is None:
        parameter = ssm.get_parameter(Name=KEY_PARAMETER, WithDecryption=True)
        _signing_key = _parse_private_key(parameter['Parameter']['Value'])
    return _signing_key


def _signed_url(url, expires):
    """Build a canned-policy signed URL.

    `separators` is not cosmetic. CloudFront reconstructs this exact string from the
    Expires value and the resource to verify the signature, so a single stray space makes
    every URL fail as an unexplained 403 at the edge with nothing in any log.
    """
    policy = json.dumps(
        {'Statement': [{'Resource': url, 'Condition': {'DateLessThan': {'AWS:EpochTime': expires}}}]},
        separators=(',', ':'),
    )
    modulus, private_exponent = _signing_numbers()
    signature = _cloudfront_b64(_sign_sha1(policy.encode('utf-8'), modulus, private_exponent))
    return f'{url}?Expires={expires}&Signature={signature}&Key-Pair-Id={KEY_PAIR_ID}'


def _cv_exists(key):
    # ListObjectsV2 rather than HeadObject: without s3:ListBucket, S3 reports a missing key
    # as 403 rather than 404, and ListBucket can be scoped to the CV prefix this way.
    listing = s3.list_objects_v2(Bucket=SITE_BUCKET, Prefix=key, MaxKeys=1)
    return any(item['Key'] == key for item in listing.get('Contents', []))


def _prune_superseded(current_folder):
    """Remove CVs rendered from older site data. Best effort: a leftover file costs pennies.

    Only runs right after a render, i.e. when the content has just changed. A visitor whose
    signed URL for the old file is still inside its TTL can lose that one download; a retry
    mints a URL for the new file.
    """
    try:
        listing = s3.list_objects_v2(Bucket=SITE_BUCKET, Prefix=f'{CV_PREFIX}/')
        stale = [{'Key': o['Key']} for o in listing.get('Contents', []) if not o['Key'].startswith(current_folder)]
        if stale:
            s3.delete_objects(Bucket=SITE_BUCKET, Delete={'Objects': stale, 'Quiet': True})
            logger.info('Pruned %d superseded CV object(s)', len(stale))
    except Exception:
        logger.exception('Failed to prune superseded CVs')


# Unambiguous lowercase letters and digits: the address may be read off paper and retyped.
_ALIAS_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'


def _mint_alias(full_name):
    """Create a new forwarding alias and make it the live one. Returns its address.

    Two containers can race here, e.g. on the first clicks after a rotation. The pointer is
    written with a condition, so exactly one alias wins; a loser's alias is revoked before
    anyone can have seen it, and the winner is read back.
    """
    first = re.sub(r'[^a-z0-9]', '', renderResume._ascii((full_name or '').split(' ')[0]).lower()) or 'contact'
    local = f'{first}.{"".join(secrets.choice(_ALIAS_ALPHABET) for _ in range(6))}'
    now = datetime.now(timezone.utc).isoformat()
    alias_table.put_item(
        Item={'id': local, 'status': 'active', 'created': now},
        ConditionExpression='attribute_not_exists(id)',
    )
    try:
        alias_table.put_item(
            Item={'id': ALIAS_POINTER, 'address': local, 'since': now},
            ConditionExpression='attribute_not_exists(id)',
        )
    except ClientError as err:
        if err.response.get('Error', {}).get('Code') != 'ConditionalCheckFailedException':
            raise
        alias_table.update_item(
            Key={'id': local},
            UpdateExpression='SET #s = :revoked, #t = :now, #r = :why',
            ExpressionAttributeNames={'#s': 'status', '#t': 'revoked', '#r': 'reason'},
            ExpressionAttributeValues={':revoked': 'revoked', ':now': now, ':why': 'lost a concurrent mint'},
        )
        return _contact_address(full_name, mint=False)
    logger.info('Minted CV contact alias %s', local)
    return f'{local}@{CONTACT_DOMAIN}'


def _contact_address(full_name, mint=True):
    """The forwarding address the CV should print right now, minting one if there is none.

    Revoking or rotating an alias (the CV contact workflow) deletes the pointer, so the next
    click mints a replacement. Because the address is part of the CV model, that also changes
    the content digest and the CV is re-rendered with the new address.

    Fails open: if the table is unreachable the CV goes out without an address rather than
    not at all. The digest then differs from the with-address CV, so the address returns on
    the first click after the table recovers.
    """
    try:
        pointer = alias_table.get_item(Key={'id': ALIAS_POINTER}).get('Item')
        if pointer:
            return f'{pointer["address"]}@{CONTACT_DOMAIN}'
        return _mint_alias(full_name) if mint else None
    except Exception:
        logger.exception('Could not resolve the CV contact alias; rendering without one')
        return None


def _current_cv_key():
    """Return the S3 key of a CV matching what the site is serving now, rendering one if needed.

    Three tiers, cheapest first:

      1. The source is unchanged since this container last looked (S3 answers the
         conditional GET with a 304), and so is the contact alias -> reuse the key already
         resolved. No body, no render.
      2. The source changed, but its CV content did not (a new logo, an icon, a link) ->
         the digest matches a PDF that is already in the bucket. One LIST, no render.
      3. The content changed -> render once, store it, and every later click is tier 1 or 2.

    The contact alias is looked up on every click (one GetItem) so that revoking it takes
    effect on the very next download rather than whenever a container recycles.

    The key embeds a digest of the rendered content, so a stored PDF is immutable and can
    never be served stale from CloudFront's cache.
    """
    today = datetime.now(timezone.utc).date()
    request = {'Bucket': SITE_BUCKET, 'Key': CV_SOURCE_KEY}
    if _cv['etag']:
        request['IfNoneMatch'] = _cv['etag']
    try:
        response = s3.get_object(**request)
        source, etag, unchanged = json.loads(response['Body'].read()), response['ETag'], False
    except ClientError as err:
        if err.response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 304:
            raise
        source, etag, unchanged = _cv['source'], _cv['etag'], True

    contact = None
    if renderResume.settings_from(source)['contactEmail']:
        contact = _contact_address((source.get('personal') or {}).get('fullName', ''))

    if unchanged and _cv['day'] == today and _cv['contact'] == contact:
        return _cv['key']

    model = renderResume.build_model(source, BASE_URL, today=today, contact_email=contact)
    folder = f'{CV_PREFIX}/{renderResume.content_digest(model)[:24]}/'
    key = folder + renderResume.file_name(model)

    if not _cv_exists(key):
        started = time.monotonic()
        pdf = renderResume.render_pdf(model)
        s3.put_object(
            Bucket=SITE_BUCKET,
            Key=key,
            Body=pdf,
            ContentType='application/pdf',
            CacheControl='public, max-age=31536000, immutable',
            Metadata={'renderer-version': renderResume.RENDERER_VERSION},
        )
        logger.info('Rendered %s (%d bytes) in %.0f ms', key, len(pdf), (time.monotonic() - started) * 1000)
        _prune_superseded(folder)

    _cv.update(etag=etag, source=source, day=today, contact=contact, key=key)
    return key


def _record_download(visitor_id):
    """Best-effort telemetry. Returns the running total, or None if it could not be read.

    Deliberately swallows its own failures: the table is provisioned at 1 WCU, and a
    throttled counter write must not turn into a user who cannot download a CV.
    """
    now = datetime.now(timezone.utc)
    try:
        seen = 'Item' in record_table.get_item(Key={'id': visitor_id})
        if seen:
            counter = record_table.get_item(Key={'id': COUNTER_ID})
            return int(counter['Item']['download_count']) if 'Item' in counter else None

        record_table.put_item(
            Item={
                'id': visitor_id,
                'ttl': int((now + timedelta(days=1)).timestamp()),
                'last_download': now.isoformat(),
            }
        )
        # if_not_exists self-seeds the counter. The sibling crc-visitor-count table has to
        # be primed by hand because its update assumes the attribute already exists.
        updated = record_table.update_item(
            Key={'id': COUNTER_ID},
            UpdateExpression='SET download_count = if_not_exists(download_count, :zero) + :one',
            ExpressionAttributeValues={':zero': 0, ':one': 1},
            ReturnValues='UPDATED_NEW',
        )
        return int(updated['Attributes']['download_count'])
    except Exception:
        logger.exception('Failed to record CV download for visitor %s', visitor_id)
        return None


def _response(status, payload):
    return {
        'statusCode': status,
        'headers': {'Access-Control-Allow-Origin': ALLOWED_ORIGIN},
        'body': json.dumps(payload),
    }


def lambda_handler(event, context):
    # API Gateway's request validator already requires visitorId, but a direct invoke
    # bypasses it and must not raise a KeyError.
    visitor_id = (event.get('queryStringParameters') or {}).get('visitorId')
    if not visitor_id:
        return _response(400, {'error': 'visitorId is required'})

    # Sign before recording, and the asymmetry between the two failure modes is deliberate:
    # a telemetry failure must never deny a download, but a download that never happened
    # must never be counted. Recording first would inflate download_count on every failed
    # signature and burn the visitor's 24h dedupe row for a file they never received.
    try:
        object_key = _current_cv_key()
    except Exception:
        logger.exception('Failed to resolve or render the CV')
        return _response(500, {'error': 'Internal Server Error'})

    try:
        expires = int(time.time()) + URL_TTL
        url = _signed_url(f'{BASE_URL}/{object_key}', expires)
    except Exception:
        # Never echo the exception to the caller — it would describe the key material.
        logger.exception('Failed to sign a CV download URL')
        return _response(500, {'error': 'Internal Server Error'})

    count = _record_download(visitor_id)

    return _response(
        200,
        {
            'downloadUrl': url,
            'fileName': object_key.rsplit('/', 1)[-1],
            'expiresAt': expires,
            'count': count,
        },
    )
