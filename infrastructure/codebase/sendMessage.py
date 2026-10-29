import json
import logging
import os
import re
import urllib.parse
import urllib.request
from email.utils import formataddr

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ssm = boto3.client('ssm')

AWS_REGION = os.environ['mailRegion']
SEND_TO = os.environ['sendToAddress']
SEND_AS = os.environ['sendFromAddress']
ALLOWED_ORIGIN = os.environ['allowedOrigin']
RECAPTCHA_SECRET_PARAMETER = os.environ['recaptchaSecretParameter']

# Google reports the hostname the token was solved on. Checking it here means a token
# minted on some other site that embeds the same public site key is refused even if
# "Verify the origin of reCAPTCHA solutions" is ever switched off in the admin console.
ALLOWED_HOSTNAME = urllib.parse.urlparse(ALLOWED_ORIGIN).hostname

# Deliberately loose: one @, a dotted domain, nothing that could end the address early.
# SES itself is the real judge; this only keeps an obvious typo from failing the send.
_ADDRESS = re.compile(r'[^@\s<>",;]+@[^@\s<>",;]+\.[^@\s<>",;]+')

VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
VERIFY_TIMEOUT_SECONDS = 3

# Fetched on first use rather than at import, for the same reason as downloadResume: an
# SSM failure during import surfaces as an opaque Runtime.ImportModuleError.
_recaptcha_secret = None


def _secret():
    global _recaptcha_secret
    if _recaptcha_secret is None:
        parameter = ssm.get_parameter(Name=RECAPTCHA_SECRET_PARAMETER, WithDecryption=True)
        _recaptcha_secret = parameter['Parameter']['Value']
    return _recaptcha_secret


def _verify_recaptcha(token):
    """Ask Google whether the token is genuine. Fails closed: anything short of a clean
    success on our own hostname is a rejection.

    Tokens are single-use and expire after two minutes, so a replayed or stale token fails
    here too — the frontend fetches a fresh one on every submit.
    """
    if not isinstance(token, str) or not token:
        return False
    data = urllib.parse.urlencode({'secret': _secret(), 'response': token}).encode('ascii')
    with urllib.request.urlopen(VERIFY_URL, data=data, timeout=VERIFY_TIMEOUT_SECONDS) as response:
        result = json.loads(response.read())
    if not result.get('success') or result.get('hostname') != ALLOWED_HOSTNAME:
        logger.info(
            'reCAPTCHA rejected: success=%s hostname=%s errors=%s',
            result.get('success'),
            result.get('hostname'),
            result.get('error-codes'),
        )
        return False
    return True


def _reply_to(first_name, last_name, address):
    """The sender as a Reply-To entry, or None if the address isn't one SES would accept.

    SES rejects the whole send over a malformed Reply-To, so a bad address only costs the
    convenience of Reply; it is still printed in the body. SES also needs an ASCII address
    (no SMTPUTF8) and a MIME-encoded name when the name isn't plain ASCII.
    """
    address = address.strip() if isinstance(address, str) else ''
    if not address.isascii() or len(address) > 254:
        return None
    if not _ADDRESS.fullmatch(address):
        return None
    name = ' '.join(part for part in (first_name, last_name) if isinstance(part, str) and part)
    name = re.sub(r'[\r\n"]+', ' ', name).strip()
    return formataddr((name, address), charset='utf-8')


def _rejected(status, error):
    # Carries the CORS header so the browser hands the status to the page rather than
    # reporting an opaque network failure.
    return {
        'statusCode': status,
        'headers': {'Access-Control-Allow-Origin': ALLOWED_ORIGIN},
        'body': json.dumps({'error': error}),
    }


def lambda_handler(event, context):
    # Initialize the SES client
    ses_client = boto3.client('ses', region_name=AWS_REGION)

    try:
        # Verify the request origin
        origin = event['headers'].get('Origin') or event['headers'].get('origin')
        if origin != ALLOWED_ORIGIN:
            return {'statusCode': 403, 'body': json.dumps({'error': 'Forbidden: Invalid origin'})}

        # Parse the JSON body of the request
        body = json.loads(event['body'])

        # Before anything reaches SES: the page's reCAPTCHA only gates the form UI, and
        # this endpoint is public, so it is the check here that actually stops a bot.
        try:
            verified = _verify_recaptcha(body.get('token'))
        except Exception:
            logger.exception('reCAPTCHA verification could not be completed')
            return _rejected(503, 'Verification unavailable')
        if not verified:
            return _rejected(403, 'Forbidden: reCAPTCHA verification failed')

        # Extract form data
        first_name = body.get('firstName')
        last_name = body.get('lastName')
        email = body.get('email')
        subject = body.get('subject')
        message = body.get('message')

        # Extract UUID from the query string parameters
        query_string_parameters = event.get('queryStringParameters', {})
        uuid = query_string_parameters.get('uuid', 'UUID not provided')

        # Construct the email content
        email_subject = f'New contact form submission: {subject}'
        email_body = f"""
        You have a new contact form submission:

        Name: {first_name} {last_name}
        Email: {email}
        Subject: {subject}
        Message: {message}
        UUID: {uuid}
        """

        # Send the email using SES. SES only sends as a verified identity, so the From stays
        # noreply; Reply-To carries the visitor's address so a plain Reply goes to them.
        reply_to = _reply_to(first_name, last_name, email)
        ses_client.send_email(
            Source=SEND_AS,
            Destination={
                'ToAddresses': [
                    SEND_TO,
                ],
            },
            ReplyToAddresses=[reply_to] if reply_to else [],
            Message={
                'Subject': {'Data': email_subject, 'Charset': 'UTF-8'},
                'Body': {'Text': {'Data': email_body, 'Charset': 'UTF-8'}},
            },
        )

        # Construct a success response
        api_response = {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
            },
            'body': json.dumps(
                {
                    'message': 'Form submitted and email sent successfully!',
                }
            ),
        }

        return api_response

    except Exception as e:
        # Handle any errors that may occur
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
