"""Tests for forwardMail: what gets forwarded, what gets dropped, and what a forward looks like.

Run from the repository root:  python -m unittest discover -s infrastructure/tests
"""

import email
import importlib
import os
import sys
import types
import unittest
from email.policy import default as default_policy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'infrastructure' / 'codebase'))

RAW = (
    b'Return-Path: <bounce@recruiter.example>\r\n'
    b'Received: from mx.recruiter.example by inbound-smtp.us-east-1.amazonaws.com\r\n'
    b'DKIM-Signature: v=1; a=rsa-sha256; d=recruiter.example;\r\n'
    b'\tb=abc123\r\n'
    b'From: =?utf-8?q?Zo=C3=AB_Recruiter?= <zoe@recruiter.example>\r\n'
    b'To: alexander.k7q2mx@example.com\r\n'
    b'Subject: Senior role at Example Corp\r\n'
    b'Message-ID: <original@recruiter.example>\r\n'
    b'MIME-Version: 1.0\r\n'
    b'Content-Type: text/plain; charset=utf-8\r\n'
    b'\r\n'
    b'Hi Alexander,\r\n\r\nAre you open to a chat?\r\n'
)

PASS = {'status': 'PASS'}


def receipt(recipients=('alexander.k7q2mx@example.com',), **verdicts):
    base = {
        'recipients': list(recipients),
        'spamVerdict': PASS,
        'virusVerdict': PASS,
        'spfVerdict': PASS,
        'dkimVerdict': PASS,
        'dmarcVerdict': PASS,
    }
    base.update(verdicts)
    return base


class FakeTable:
    def __init__(self, items):
        self.items = items
        self.updates = []

    def get_item(self, Key):
        item = self.items.get(Key['id'])
        return {'Item': item} if item else {}

    def update_item(self, Key, **kwargs):
        self.updates.append((Key['id'], kwargs['ExpressionAttributeNames']))


def load(aliases):
    sent, objects = [], {'inbound/msg-1': RAW}
    table = FakeTable(aliases)
    s3 = types.SimpleNamespace(
        get_object=lambda Bucket, Key: {'Body': types.SimpleNamespace(read=lambda: objects[Key])}
    )
    ses = types.SimpleNamespace(send_raw_email=lambda **kwargs: sent.append(kwargs))
    fake_boto3 = types.ModuleType('boto3')
    fake_boto3.client = lambda name: {'s3': s3, 'ses': ses}[name]
    fake_boto3.resource = lambda name: types.SimpleNamespace(Table=lambda _: table)
    sys.modules['boto3'] = fake_boto3
    os.environ.update(
        aliasTableName='aliases',
        mailBucket='mail-bucket',
        mailPrefix='inbound/',
        contactDomain='Example.com',
        sendFromAddress='noreply@example.com',
        forwardToAddress='real.inbox@gmail.example',
    )
    sys.modules.pop('forwardMail', None)
    module = importlib.import_module('forwardMail')
    return module, sent, table, objects


def deliver(module, **kwargs):
    event = {'Records': [{'ses': {'mail': {'messageId': 'msg-1'}, 'receipt': receipt(**kwargs)}}]}
    return module.lambda_handler(event, None)


class ForwardingTests(unittest.TestCase):
    def setUp(self):
        self.module, self.sent, self.table, self.objects = load(
            {
                'alexander.k7q2mx': {'id': 'alexander.k7q2mx', 'status': 'active'},
                'alexander.old111': {'id': 'alexander.old111', 'status': 'retired'},
                'alexander.bad999': {'id': 'alexander.bad999', 'status': 'revoked'},
            }
        )

    def forwarded(self):
        [call] = self.sent
        return call, email.message_from_bytes(call['RawMessage']['Data'], policy=default_policy)

    def test_live_alias_is_forwarded_to_the_real_inbox_only(self):
        self.assertEqual(deliver(self.module), ['forwarded'])
        call, message = self.forwarded()
        self.assertEqual(call['Destinations'], ['real.inbox@gmail.example'])
        self.assertEqual(call['Source'], 'noreply@example.com')
        self.assertEqual(self.table.updates[0][0], 'alexander.k7q2mx')

    def test_reply_goes_to_the_original_sender(self):
        deliver(self.module)
        _, message = self.forwarded()
        self.assertEqual(message['Reply-To'].addresses[0].addr_spec, 'zoe@recruiter.example')
        self.assertEqual(message['From'].addresses[0].addr_spec, 'noreply@example.com')
        self.assertEqual(message['From'].addresses[0].display_name, 'Zoë Recruiter via CV')
        self.assertEqual(message['X-CV-Alias'], 'alexander.k7q2mx@example.com')

    def test_body_and_ordinary_headers_survive_untouched(self):
        deliver(self.module)
        call, message = self.forwarded()
        raw = call['RawMessage']['Data']
        self.assertTrue(raw.endswith(b'\r\n\r\nHi Alexander,\r\n\r\nAre you open to a chat?\r\n'))
        self.assertEqual(message['Subject'], 'Senior role at Example Corp')
        self.assertEqual(message['To'], 'alexander.k7q2mx@example.com')
        self.assertIsNotNone(message['Received'])

    def test_headers_that_would_break_resending_are_removed(self):
        deliver(self.module)
        call, message = self.forwarded()
        for name in ('DKIM-Signature', 'Return-Path', 'Message-ID'):
            with self.subTest(header=name):
                self.assertIsNone(message[name])
        # The folded continuation of the stripped DKIM header must go with it.
        self.assertNotIn(b'b=abc123', call['RawMessage']['Data'])
        self.assertEqual(len(message.get_all('From')), 1)

    def test_retired_aliases_still_forward(self):
        self.assertEqual(deliver(self.module, recipients=['Alexander.Old111@example.com']), ['forwarded'])

    def test_revoked_and_unknown_aliases_are_dropped_silently(self):
        for recipient in ('alexander.bad999@example.com', 'admin@example.com', 'x@elsewhere.example'):
            with self.subTest(recipient=recipient):
                self.assertEqual(deliver(self.module, recipients=[recipient]), ['dropped'])
        self.assertEqual(self.sent, [])

    def test_the_pointer_row_is_not_an_address(self):
        self.table.items['#current'] = {'id': '#current', 'address': 'alexander.k7q2mx', 'status': 'active'}
        self.assertEqual(deliver(self.module, recipients=['#current@example.com']), ['dropped'])

    def test_failed_scans_are_dropped_and_counted(self):
        cases = {
            'virus': {'virusVerdict': {'status': 'FAIL'}},
            'spam': {'spamVerdict': {'status': 'FAIL'}},
            'dmarc': {'dmarcVerdict': {'status': 'FAIL'}, 'dmarcPolicy': 'REJECT'},
            'unauthenticated': {'spfVerdict': {'status': 'FAIL'}, 'dkimVerdict': {'status': 'FAIL'}},
        }
        for reason, verdicts in cases.items():
            with self.subTest(reason=reason):
                self.table.updates.clear()
                self.assertEqual(deliver(self.module, **verdicts), ['dropped'])
                self.assertEqual(self.table.updates[0][1]['#r'], f'dropped_{reason}')
        self.assertEqual(self.sent, [])

    def test_a_soft_dmarc_failure_alone_is_still_forwarded(self):
        self.assertEqual(deliver(self.module, dmarcVerdict={'status': 'FAIL'}, dmarcPolicy='NONE'), ['forwarded'])

    def test_oversized_mail_becomes_a_notice(self):
        self.objects['inbound/msg-1'] = RAW + b'x' * (self.module.MAX_FORWARD_BYTES + 1)
        deliver(self.module)
        call, message = self.forwarded()
        self.assertLess(len(call['RawMessage']['Data']), 4096)
        self.assertIn('too large', message['Subject'])

    def test_bare_lf_messages_are_handled(self):
        self.objects['inbound/msg-1'] = RAW.replace(b'\r\n', b'\n')
        deliver(self.module)
        call, message = self.forwarded()
        self.assertEqual(message['Reply-To'].addresses[0].addr_spec, 'zoe@recruiter.example')
        self.assertNotIn(b'\r\n', call['RawMessage']['Data'].split(b'\n\n', 1)[1])


if __name__ == '__main__':
    unittest.main()
