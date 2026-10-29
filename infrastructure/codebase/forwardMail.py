"""Forwards mail sent to the CV's contact address on to the real inbox, and nothing else.

The CV never prints the real address. downloadResume issues a random forwarding alias
(`alexander.k7q2mx@<domain>`) and records it in the alias table. SES receives mail for the
whole domain, stores the raw message in a private bucket and invokes this function, which:

  * drops anything SES scored as a virus or spam, or that fails authentication badly enough
    to be a spoof (DMARC reject, or SPF and DKIM both failing);
  * drops anything not addressed to an alias that is `active` or `retired`. Revoked and
    unknown addresses are dropped silently rather than bounced: a bounce to a forged sender
    is backscatter, and it would confirm to a spammer that the domain is live;
  * otherwise re-sends the message to the real inbox. SES will only send as an identity it
    has verified, so the From becomes `"<sender> via CV" <noreply@domain>` and the sender
    moves to Reply-To, which keeps a plain Reply working. The body is passed through
    byte-for-byte; only header lines are touched.

Every outcome is counted on the alias's row, which is what `status` in the CV contact
workflow reports, and what tells you an address has started attracting abuse.
"""

import email.utils
import logging
import os
import re
from datetime import datetime, timezone
from email.parser import BytesHeaderParser
from email.policy import default as default_policy

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')
ses = boto3.client('ses')
alias_table = boto3.resource('dynamodb').Table(os.environ['aliasTableName'])

MAIL_BUCKET = os.environ['mailBucket']
MAIL_PREFIX = os.environ['mailPrefix']
CONTACT_DOMAIN = os.environ['contactDomain'].lower()
SEND_FROM = os.environ['sendFromAddress']
FORWARD_TO = os.environ['forwardToAddress']

FORWARDING_STATUSES = {'active', 'retired'}

# SES v1 SendRawEmail rejects anything larger. Bigger messages are announced, not forwarded.
MAX_FORWARD_BYTES = 10 * 1024 * 1024

# Headers that either identify the original transmission (and would fail verification once
# SES re-signs the message) or that SES refuses to send on someone else's behalf.
_STRIP = {
    'from',
    'reply-to',
    'sender',
    'return-path',
    'message-id',
    'bcc',
    'dkim-signature',
    'domainkey-signature',
    'arc-seal',
    'arc-message-signature',
    'arc-authentication-results',
    'authentication-results',
    'received-spf',
}


def rejection_reason(receipt):
    """Why SES's own scan says this message must not be forwarded, or None."""

    def verdict(name):
        return (receipt.get(name) or {}).get('status')

    if verdict('virusVerdict') == 'FAIL':
        return 'virus'
    if verdict('spamVerdict') == 'FAIL':
        return 'spam'
    if verdict('dmarcVerdict') == 'FAIL' and receipt.get('dmarcPolicy') == 'REJECT':
        return 'dmarc'
    if verdict('spfVerdict') == 'FAIL' and verdict('dkimVerdict') == 'FAIL':
        return 'unauthenticated'
    return None


def _local_part(address):
    local, _, domain = address.strip().lower().rpartition('@')
    return local if domain == CONTACT_DOMAIN else None


def _split_headers(raw):
    """Raw message -> (header lines, newline, body). Each line keeps its folded continuations."""
    match = re.search(rb'\r?\n\r?\n', raw)
    head, body = (raw[: match.start()], raw[match.end() :]) if match else (raw, b'')
    newline = b'\r\n' if b'\r\n' in head or not head else b'\n'
    lines = []
    for line in head.split(newline):
        if line[:1] in (b' ', b'\t') and lines:
            lines[-1] += newline + line
        elif line:
            lines.append(line)
    return lines, newline, body


def _header_name(line):
    return line.split(b':', 1)[0].strip().decode('ascii', 'replace').lower()


def _header_value(line):
    return line.split(b':', 1)[1].lstrip() if b':' in line else b''


def rewrite(raw, alias):
    """Re-address a received message for forwarding. The body is returned untouched."""
    lines, newline, body = _split_headers(raw)
    by_name = {}
    for line in lines:
        by_name.setdefault(_header_name(line), line)

    parsed = BytesHeaderParser(policy=default_policy).parsebytes(newline.join(lines) + newline * 2)
    name, address = email.utils.parseaddr(str(parsed.get('From', '')))
    shown = re.sub(r'[\r\n"]+', ' ', name or address or 'Unknown sender').strip()

    # Reply-To carries the original header bytes verbatim, so an encoded display name or an
    # address list survives exactly as the sender wrote it.
    reply_to = by_name.get('reply-to') or by_name.get('from')
    kept = [line for line in lines if _header_name(line) not in _STRIP]
    added = [
        b'From: ' + email.utils.formataddr((f'{shown} via CV', SEND_FROM), charset='utf-8').encode('ascii'),
        b'X-CV-Alias: ' + alias.encode('ascii', 'replace'),
    ]
    if reply_to:
        added.append(b'Reply-To: ' + _header_value(reply_to))
    return newline.join(added + kept) + newline * 2 + body


def _too_large_notice(alias, mail):
    common = mail.get('commonHeaders') or {}
    sender = ', '.join(common.get('from') or [mail.get('source', 'unknown')])
    subject = common.get('subject', '(no subject)')
    text = (
        f'A message to {alias} was too large to forward.\r\n\r\n'
        f'From: {sender}\r\nSubject: {subject}\r\n\r\n'
        f'The original is kept for a short while in s3://{MAIL_BUCKET}/{MAIL_PREFIX}{mail["messageId"]}.\r\n'
    )
    return (
        b'From: ' + email.utils.formataddr(('CV contact forwarder', SEND_FROM)).encode('ascii') + b'\r\n'
        b'Subject: [CV] Message too large to forward\r\n'
        b'Content-Type: text/plain; charset=utf-8\r\n'
        b'MIME-Version: 1.0\r\n\r\n' + text.encode('utf-8')
    )


def _count(alias, outcome, reason=None):
    """Best-effort telemetry on the alias row; never blocks or fails delivery."""
    try:
        names = {'#n': outcome, '#last': 'last_received'}
        values = {':one': 1, ':now': datetime.now(timezone.utc).isoformat()}
        expression = 'ADD #n :one SET #last = :now'
        if reason:
            names['#r'] = f'dropped_{reason}'
            expression = 'ADD #n :one, #r :one SET #last = :now'
        alias_table.update_item(
            Key={'id': alias},
            UpdateExpression=expression,
            ConditionExpression='attribute_exists(id)',
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
        )
    except Exception:
        logger.warning('Could not record %s for alias %s', outcome, alias, exc_info=True)


def _status(local):
    if not local or local.startswith('#'):
        return None
    item = alias_table.get_item(Key={'id': local}).get('Item')
    return item.get('status') if item else None


def handle(record):
    mail, receipt = record['mail'], record['receipt']
    message_id = mail['messageId']
    aliases = [a for a in (_local_part(r) for r in receipt.get('recipients', [])) if a]
    statuses = {alias: _status(alias) for alias in aliases}
    live = [alias for alias, status in statuses.items() if status in FORWARDING_STATUSES]
    reason = rejection_reason(receipt)

    if reason or not live:
        for alias in aliases:
            if statuses[alias] is not None:
                _count(alias, 'dropped', reason or statuses[alias])
        logger.info(
            'Dropped %s: %s',
            message_id,
            reason or 'no forwarding alias among recipients',
            extra={'statuses': statuses},
        )
        return 'dropped'

    alias = live[0]
    address = f'{alias}@{CONTACT_DOMAIN}'
    raw = s3.get_object(Bucket=MAIL_BUCKET, Key=f'{MAIL_PREFIX}{message_id}')['Body'].read()
    message = rewrite(raw, address)
    if len(message) > MAX_FORWARD_BYTES:
        message = _too_large_notice(address, mail)

    ses.send_raw_email(Source=SEND_FROM, Destinations=[FORWARD_TO], RawMessage={'Data': message})
    _count(alias, 'forwarded')
    logger.info('Forwarded %s sent to %s', message_id, address)
    return 'forwarded'


def lambda_handler(event, context):
    return [handle(record['ses']) for record in event.get('Records', [])]
