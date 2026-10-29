"""Forwards mail sent to the CV's contact address on to the real inbox, and nothing else.

The CV never prints the real address. downloadResume issues a random forwarding alias
(`abracken.k7q2mx@<domain>`) and records it in the alias table. SES receives mail for the
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
workflow reports. Abusive drops are also tallied per day, and an alias that reaches the
configured limit triggers an alert email with a link to the revoke workflow (see _watch).
Revoking is always done by hand.

Aliases rotate monthly (see downloadResume), and each records the month it was issued. A
forwarded message says which month in its From line, e.g. "Zoë Recruiter via CV (Nov 2026)",
so the age of the CV the sender is holding is visible at a glance.
"""

import email.utils
import logging
import os
import re
from datetime import datetime, timezone
from email.parser import BytesHeaderParser
from email.policy import default as default_policy

import boto3
from botocore.exceptions import ClientError

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

# Abuse alerts. When an alias has this many messages dropped as abuse in one UTC day, the
# real inbox gets an email with a link to the revoke workflow. 0 turns alerts off. Only scan
# failures count: mail to an already-revoked alias is not evidence of new abuse.
ABUSE_ALERT_THRESHOLD = int(os.environ.get('abuseAlertThreshold', '0'))
ABUSE_REASONS = {'virus', 'spam', 'dmarc', 'unauthenticated'}
REVOKE_URL = os.environ.get('revokeWorkflowUrl', '')

_MONTHS = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')

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


def rewrite(raw, alias, issued=None):
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
    label = _month_label(issued)
    via = f' ({label})' if label else ''
    reply_to = by_name.get('reply-to') or by_name.get('from')
    kept = [line for line in lines if _header_name(line) not in _STRIP]
    added = [
        b'From: ' + email.utils.formataddr((f'{shown} via CV{via}', SEND_FROM), charset='utf-8').encode('ascii'),
        b'X-CV-Alias: ' + alias.encode('ascii', 'replace'),
    ]
    if issued:
        added.append(b'X-CV-Issued: ' + issued.encode('ascii', 'replace'))
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


def _conditional_failed(err):
    return err.response.get('Error', {}).get('Code') == 'ConditionalCheckFailedException'


def _record_abuse(alias, day):
    """Count one abusive message against `alias` for `day` (UTC). Returns the day's total.

    The tally lives on the alias row as (abuse_day, abuse_count) and starts over on the first
    abusive message of a new day, so the row never grows a field per day.
    """
    names = {'#c': 'abuse_count', '#d': 'abuse_day'}
    try:
        updated = alias_table.update_item(
            Key={'id': alias},
            UpdateExpression='ADD #c :one',
            ConditionExpression='#d = :day',
            ExpressionAttributeNames=names,
            ExpressionAttributeValues={':one': 1, ':day': day},
            ReturnValues='UPDATED_NEW',
        )
        return int(updated['Attributes']['abuse_count'])
    except ClientError as err:
        if not _conditional_failed(err):
            raise
    alias_table.update_item(
        Key={'id': alias},
        UpdateExpression='SET #d = :day, #c = :one',
        ConditionExpression='attribute_exists(id)',
        ExpressionAttributeNames=names,
        ExpressionAttributeValues={':one': 1, ':day': day},
    )
    return 1


def _abuse_alert(alias, count, day, issued):
    address = f'{alias}@{CONTACT_DOMAIN}'
    text = (
        f'{address} (issued {issued or "unknown"}) has received {count} messages on {day} (UTC) '
        'that were dropped as spam, malware or spoofed mail.\r\n\r\n'
        'Nothing has been changed: the address still forwards clean mail. If it looks abused, '
        'revoke it from the "CV contact address" workflow (action: revoke, address: '
        f'{address}):\r\n\r\n{REVOKE_URL}\r\n\r\n'
        'Revoking the address currently on the CV makes the next CV download issue a new one.\r\n'
    )
    return (
        b'From: ' + email.utils.formataddr(('CV contact forwarder', SEND_FROM)).encode('ascii') + b'\r\n'
        b'Subject: ' + f'[CV] {address} is attracting abuse'.encode('ascii', 'replace') + b'\r\n'
        b'Content-Type: text/plain; charset=utf-8\r\n'
        b'MIME-Version: 1.0\r\n\r\n' + text.encode('utf-8')
    )


def _watch(alias, item, reason):
    """Tally an abusive message for an alias and email an alert when it reaches the threshold.

    Revocation itself is always a person's decision (the CV contact workflow), so this only
    alerts, once per alias per day: exactly when the day's count reaches the threshold.

    Never raises: the message is already being dropped, and a failure here must not turn into
    a Lambda error that SES would retry.
    """
    if not ABUSE_ALERT_THRESHOLD or reason not in ABUSE_REASONS:
        return
    try:
        day = datetime.now(timezone.utc).date().isoformat()
        count = _record_abuse(alias, day)
        if count == ABUSE_ALERT_THRESHOLD:
            alert = _abuse_alert(alias, count, day, item.get('month'))
            ses.send_raw_email(Source=SEND_FROM, Destinations=[FORWARD_TO], RawMessage={'Data': alert})
            logger.warning('Abuse alert sent for alias %s: %d drops on %s', alias, count, day)
    except Exception:
        logger.exception('Abuse tracking failed for alias %s', alias)


def _month_label(month):
    """'2026-11' -> 'Nov 2026'; anything else -> ''."""
    try:
        year, number = month.split('-')
        return f'{_MONTHS[int(number) - 1]} {int(year)}'
    except (AttributeError, ValueError, IndexError):
        return ''


def _alias_item(local):
    if not local or local.startswith('#'):
        return None
    return alias_table.get_item(Key={'id': local}).get('Item')


def handle(record):
    mail, receipt = record['mail'], record['receipt']
    message_id = mail['messageId']
    aliases = [a for a in (_local_part(r) for r in receipt.get('recipients', [])) if a]
    items = {alias: _alias_item(alias) for alias in aliases}
    statuses = {alias: (item or {}).get('status') for alias, item in items.items()}
    live = [alias for alias, status in statuses.items() if status in FORWARDING_STATUSES]
    reason = rejection_reason(receipt)

    if reason or not live:
        for alias in aliases:
            if statuses[alias] is not None:
                _count(alias, 'dropped', reason or statuses[alias])
            if statuses[alias] in FORWARDING_STATUSES:
                _watch(alias, items[alias], reason)
        logger.info(
            'Dropped %s: %s',
            message_id,
            reason or 'no forwarding alias among recipients',
            extra={'statuses': statuses},
        )
        return 'dropped'

    alias = live[0]
    address = f'{alias}@{CONTACT_DOMAIN}'
    issued = (items[alias] or {}).get('month')
    raw = s3.get_object(Bucket=MAIL_BUCKET, Key=f'{MAIL_PREFIX}{message_id}')['Body'].read()
    message = rewrite(raw, address, issued=issued)
    if len(message) > MAX_FORWARD_BYTES:
        message = _too_large_notice(address, mail)

    ses.send_raw_email(Source=SEND_FROM, Destinations=[FORWARD_TO], RawMessage={'Data': message})
    _count(alias, 'forwarded')
    logger.info('Forwarded %s sent to %s', message_id, address)
    return 'forwarded'


def lambda_handler(event, context):
    return [handle(record['ses']) for record in event.get('Records', [])]
