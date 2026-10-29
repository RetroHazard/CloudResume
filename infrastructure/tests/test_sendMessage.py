"""Tests for sendMessage: a contact form email can be answered with a plain Reply.

Run from the repository root:  python -m unittest discover -s infrastructure/tests
"""

import email
import importlib
import json
import os
import sys
import types
import unittest
from email.policy import default as default_policy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'infrastructure' / 'codebase'))

ORIGIN = 'https://cv.example.com'


def load():
    sent = []
    ses = types.SimpleNamespace(send_email=lambda **kwargs: sent.append(kwargs))
    ssm = types.SimpleNamespace(get_parameter=lambda **_: {'Parameter': {'Value': 'secret'}})
    fake_boto3 = types.ModuleType('boto3')
    fake_boto3.client = lambda name, **_: {'ses': ses, 'ssm': ssm}[name]
    sys.modules['boto3'] = fake_boto3
    os.environ.update(
        mailRegion='us-east-1',
        sendToAddress='real.inbox@gmail.example',
        sendFromAddress='noreply@example.com',
        allowedOrigin=ORIGIN,
        recaptchaSecretParameter='/recaptcha',
    )
    sys.modules.pop('sendMessage', None)
    module = importlib.import_module('sendMessage')
    module._verify_recaptcha = lambda token: True
    return module, sent


def submit(module, **fields):
    body = {
        'token': 't',
        'firstName': 'Zoë',
        'lastName': 'Recruiter',
        'email': 'zoe@recruiter.example',
        'subject': 'Hello',
        'message': 'Are you open to a chat?',
    }
    body.update(fields)
    event = {'headers': {'origin': ORIGIN}, 'body': json.dumps(body), 'queryStringParameters': {}}
    return module.lambda_handler(event, None)


class ReplyToTests(unittest.TestCase):
    def setUp(self):
        self.module, self.sent = load()

    def reply_to(self):
        [call] = self.sent
        return call['Source'], call['ReplyToAddresses']

    def test_reply_goes_to_the_visitor_not_noreply(self):
        self.assertEqual(submit(self.module)['statusCode'], 200)
        source, reply_to = self.reply_to()
        self.assertEqual(source, 'noreply@example.com')
        [entry] = reply_to
        header = email.message_from_string(f'Reply-To: {entry}\n\n', policy=default_policy)['Reply-To']
        self.assertEqual(header.addresses[0].addr_spec, 'zoe@recruiter.example')
        self.assertEqual(header.addresses[0].display_name, 'Zoë Recruiter')

    def test_a_non_ascii_name_is_mime_encoded(self):
        submit(self.module)
        [entry] = self.reply_to()[1]
        self.assertTrue(entry.isascii())

    def test_surrounding_whitespace_is_ignored(self):
        submit(self.module, email='  zoe@recruiter.example \n')
        self.assertTrue(self.reply_to()[1][0].endswith('<zoe@recruiter.example>'))

    def test_an_unusable_address_still_sends_without_reply_to(self):
        for address in ('not-an-address', 'a@b', 'a@b.c\r\nBcc: x@y.z', 'zoë@例え.jp', None, 42, 'x' * 250 + '@a.io'):
            with self.subTest(address=address):
                self.sent.clear()
                self.assertEqual(submit(self.module, email=address)['statusCode'], 200)
                self.assertEqual(self.reply_to()[1], [])


if __name__ == '__main__':
    unittest.main()


class FailureTests(unittest.TestCase):
    def setUp(self):
        self.module, _ = load()

        def refuse(**_):
            raise RuntimeError('Email address is not verified: real.inbox@gmail.example')

        self.module.boto3.client = lambda name, **_: types.SimpleNamespace(send_email=refuse)

    def test_a_send_failure_does_not_echo_the_error_to_the_caller(self):
        with self.assertLogs(self.module.logger, level='ERROR') as logs:
            response = submit(self.module)
        self.assertEqual(response['statusCode'], 500)
        self.assertNotIn('real.inbox', response['body'])
        self.assertEqual(json.loads(response['body']), {'error': 'Message could not be sent'})
        # The detail is kept, in the log.
        self.assertIn('real.inbox@gmail.example', '\n'.join(logs.output))

    def test_a_send_failure_carries_the_cors_header(self):
        with self.assertLogs(self.module.logger, level='ERROR'):
            response = submit(self.module)
        self.assertEqual(response['headers'], {'Access-Control-Allow-Origin': ORIGIN})
