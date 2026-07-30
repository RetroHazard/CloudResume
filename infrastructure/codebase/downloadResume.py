"""Issues a short-lived CloudFront signed URL for the CV, and records the download.

The PDF lives behind an `ordered_cache_behavior` on `/files/*` whose `trusted_key_groups`
means CloudFront rejects any request without a valid signature at the edge, before the
object body is ever transferred. This function is the only thing that can mint one.

Two properties are load-bearing and easy to break:

  * The URL is built on the site apex, not the `*.cloudfront.net` domain. Same-origin is
    the only condition the HTML spec places on honouring a link's `download` attribute, so
    signing the distribution domain instead would make browsers silently *navigate* to the
    PDF rather than download it, with nothing logged anywhere.
  * The object key comes from configuration, never from the request. A handler that signed
    a caller-supplied key would be a signing oracle for every object in the bucket.
"""

import base64
import hashlib
import json
import logging
import os
import time
from datetime import datetime, timedelta, timezone

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
ssm = boto3.client('ssm')

record_table = dynamodb.Table(os.environ['recordTableName'])
ALLOWED_ORIGIN = os.environ['allowedOrigin']
BASE_URL = os.environ['downloadBaseUrl'].rstrip('/')
OBJECT_KEY = os.environ['resumeObjectKey'].lstrip('/')
KEY_PARAMETER = os.environ['signingKeyParameter']
KEY_PAIR_ID = os.environ['signingKeyPairId']
URL_TTL = int(os.environ['signedUrlTtl'])

# The counter shares the dedupe table. It deliberately carries no `ttl` attribute —
# DynamoDB's TTL sweeper ignores items that lack one, so this row never expires while the
# per-visitor rows above it do.
COUNTER_ID = 'download_count'

# Fetched on first use rather than at import. An SSM failure during module import surfaces
# as an opaque Runtime.ImportModuleError with no usable traceback; deferring it means the
# real exception reaches CloudWatch.
_signing_key = None


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
        expires = int(time.time()) + URL_TTL
        url = _signed_url(f'{BASE_URL}/{OBJECT_KEY}', expires)
    except Exception:
        # Never echo the exception to the caller — it would describe the key material.
        logger.exception('Failed to sign a CV download URL')
        return _response(500, {'error': 'Internal Server Error'})

    count = _record_download(visitor_id)

    return _response(
        200,
        {
            'downloadUrl': url,
            'fileName': OBJECT_KEY.rsplit('/', 1)[-1],
            'expiresAt': expires,
            'count': count,
        },
    )
