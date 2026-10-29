"""Tests for the CV cache in downloadResume: when a click renders, and when it must not.

boto3 is replaced with in-memory fakes, so this runs without AWS credentials or even boto3
installed. Run from the repository root:  python -m unittest discover -s infrastructure/tests
"""

import copy
import importlib
import json
import os
import re
import sys
import types
import unittest
from datetime import datetime
from unittest import mock
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'infrastructure' / 'codebase'))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from test_renderResume import load_source  # noqa: E402


class ClientError(Exception):
    def __init__(self, status, code):
        super().__init__(code)
        self.response = {'Error': {'Code': code}, 'ResponseMetadata': {'HTTPStatusCode': status}}


class FakeS3:
    def __init__(self):
        self.objects = {}  # key -> (body, etag)
        self.calls = []
        self._version = 0

    def upload(self, key, body):
        self._version += 1
        self.objects[key] = (body, f'"etag-{self._version}"')

    def get_object(self, Bucket, Key, IfNoneMatch=None):
        self.calls.append(('get', Key))
        if Key not in self.objects:
            raise ClientError(404, 'NoSuchKey')
        body, etag = self.objects[Key]
        if IfNoneMatch == etag:
            raise ClientError(304, '304')
        return {'Body': types.SimpleNamespace(read=lambda: body), 'ETag': etag}

    def list_objects_v2(self, Bucket, Prefix, MaxKeys=1000):
        self.calls.append(('list', Prefix))
        keys = sorted(k for k in self.objects if k.startswith(Prefix))[:MaxKeys]
        return {'Contents': [{'Key': k} for k in keys]} if keys else {}

    def put_object(self, Bucket, Key, Body, **kwargs):
        self.calls.append(('put', Key))
        self.upload(Key, Body)
        self.last_put = kwargs

    def delete_objects(self, Bucket, Delete):
        self.calls.append(('delete', [o['Key'] for o in Delete['Objects']]))
        for item in Delete['Objects']:
            self.objects.pop(item['Key'], None)

    def count(self, kind):
        return sum(1 for call in self.calls if call[0] == kind)


class FakeTable:
    def __init__(self):
        self.items = {}

    def get_item(self, Key):
        item = self.items.get(Key['id'])
        return {'Item': item} if item else {}

    def put_item(self, Item):
        self.items[Item['id']] = Item

    def update_item(self, Key, **_):
        item = self.items.setdefault(Key['id'], {'id': Key['id'], 'download_count': 0})
        item['download_count'] += 1
        return {'Attributes': {'download_count': item['download_count']}}


class FakeAliasTable:
    """The contact-alias table, evaluating the few expression shapes downloadResume uses."""

    def __init__(self):
        self.items = {}
        self.down = False
        self.on_pointer_write = None  # lets a test slip a competing mint in first

    def _check(self):
        if self.down:
            raise RuntimeError('DynamoDB unavailable')

    def _holds(self, item, condition, names, values):
        if condition is None:
            return True
        if condition == 'attribute_not_exists(id)':
            return item is None
        if condition == 'attribute_exists(id)':
            return item is not None
        name, value = (part.strip() for part in condition.split('='))
        return item is not None and item.get(names[name]) == values[value]

    def get_item(self, Key, **_):
        self._check()
        item = self.items.get(Key['id'])
        return {'Item': dict(item)} if item else {}

    def put_item(self, Item, ConditionExpression=None, ExpressionAttributeNames=None, ExpressionAttributeValues=None):
        self._check()
        if Item['id'] == '#current' and self.on_pointer_write:
            hook, self.on_pointer_write = self.on_pointer_write, None
            hook()
        existing = self.items.get(Item['id'])
        if not self._holds(existing, ConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues):
            raise ClientError(400, 'ConditionalCheckFailedException')
        self.items[Item['id']] = dict(Item)

    def update_item(
        self, Key, UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues, ConditionExpression=None
    ):
        self._check()
        item = self.items.get(Key['id'])
        if item is None or not self._holds(
            item, ConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues
        ):
            raise ClientError(400, 'ConditionalCheckFailedException')
        for assignment in UpdateExpression.removeprefix('SET ').split(','):
            name, value = (part.strip() for part in assignment.split('='))
            item[ExpressionAttributeNames[name]] = ExpressionAttributeValues[value]

    def live(self):
        pointer = self.items.get('#current')
        return pointer and pointer['address']

    def aliases(self):
        return {k: v for k, v in self.items.items() if not k.startswith('#')}


def at(module, moment):
    """Pin the handler's clock to `moment` (UTC)."""
    real = module.datetime

    class Frozen(real):
        @classmethod
        def now(cls, tz=None):
            return moment.replace(tzinfo=tz) if tz else moment

    module.datetime = Frozen


def load_handler(aliases=None):
    """Import downloadResume against fresh fakes, as a new Lambda container would.

    Pass `aliases` to share one alias table between containers, as production does.
    """
    s3, table, aliases = FakeS3(), FakeTable(), aliases or FakeAliasTable()
    fake_boto3 = types.ModuleType('boto3')
    fake_boto3.client = lambda name: s3 if name == 's3' else object()
    fake_boto3.resource = lambda name: types.SimpleNamespace(
        Table=lambda table_name: aliases if table_name == 'aliases' else table
    )
    fake_exceptions = types.ModuleType('botocore.exceptions')
    fake_exceptions.ClientError = ClientError
    sys.modules['boto3'] = fake_boto3
    sys.modules['botocore'] = types.ModuleType('botocore')
    sys.modules['botocore.exceptions'] = fake_exceptions
    os.environ.update(
        recordTableName='records',
        aliasTableName='aliases',
        contactDomain='example.com',
        allowedOrigin='https://example.com',
        downloadBaseUrl='https://example.com',
        siteBucket='site-bucket',
        cvSourceKey='data/cv-source.json',
        cvObjectPrefix='files/cv',
        signingKeyParameter='/key',
        signingKeyPairId='K1',
        signedUrlTtl='60',
    )
    sys.modules.pop('downloadResume', None)
    module = importlib.import_module('downloadResume')
    # Signing has its own cross-check against OpenSSL (docs/signed-downloads.md); stubbing it
    # keeps these tests about which object gets signed.
    module._signed_url = lambda url, expires: f'{url}?Expires={expires}&Signature=stub&Key-Pair-Id=K1'
    return module, s3, table


def click(module, visitor='visitor-1'):
    response = module.lambda_handler({'queryStringParameters': {'visitorId': visitor}}, None)
    return response['statusCode'], json.loads(response['body'])


class Harness(unittest.TestCase):
    def setUp(self):
        self.module, self.s3, self.table = load_handler()
        self.aliases = self.module.alias_table
        self.source = load_source()
        self.publish(self.source)

    def publish(self, source):
        """What a site deploy does: re-upload data/cv-source.json, which always gets a new ETag."""
        self.s3.upload('data/cv-source.json', json.dumps(source).encode())

    def cv_keys(self):
        return sorted(k for k in self.s3.objects if k.startswith('files/cv/'))


class CvCacheTests(Harness):
    def test_first_click_compiles_and_caches_the_cv(self):
        status, body = click(self.module)

        self.assertEqual(status, 200)
        self.assertEqual(self.s3.count('put'), 1)
        [key] = self.cv_keys()
        folder, name = re.fullmatch(r'files/cv/([0-9a-f]{24})/BRACKEN_ALEXANDER_CV_([0-9a-f]{12})\.pdf', key).groups()
        self.assertTrue(folder.startswith(name))
        self.assertTrue(self.s3.objects[key][0].startswith(b'%PDF-'))
        self.assertEqual(self.s3.last_put['ContentType'], 'application/pdf')
        self.assertEqual(self.s3.last_put['ContentDisposition'], 'attachment')
        self.assertEqual(body['downloadUrl'].split('?')[0], f'https://example.com/{key}')
        self.assertEqual(body['fileName'], f'BRACKEN_ALEXANDER_CV_{name}.pdf')
        self.assertEqual(body['count'], 1)

    def test_repeat_clicks_on_a_warm_container_cost_one_conditional_get(self):
        click(self.module)
        self.s3.calls.clear()

        for n in range(3):
            status, _ = click(self.module, visitor=f'visitor-{n + 2}')
            self.assertEqual(status, 200)

        self.assertEqual(self.s3.calls, [('get', 'data/cv-source.json')] * 3)

    def test_a_cold_container_reuses_the_cv_another_one_rendered(self):
        click(self.module)
        rendered = self.cv_keys()

        objects = self.s3.objects
        self.module, self.s3, self.table = load_handler(aliases=self.aliases)
        self.s3.objects = objects
        status, _ = click(self.module)

        self.assertEqual(status, 200)
        self.assertEqual(self.s3.count('put'), 0)
        self.assertEqual(self.cv_keys(), rendered)

    def test_a_deploy_that_leaves_the_cv_content_alone_does_not_render(self):
        click(self.module)
        changed = copy.deepcopy(self.source)
        changed['career']['Experience'][0]['logo'] = './images/logos/new.png'
        changed['skills']['core_skills'][0]['website'] = 'https://example.org/'
        self.publish(changed)
        self.s3.calls.clear()

        status, _ = click(self.module)

        self.assertEqual(status, 200)
        self.assertEqual(self.s3.count('put'), 0)
        self.assertEqual(self.s3.count('list'), 1)

    def test_a_content_change_renders_once_and_prunes_the_old_cv(self):
        click(self.module)
        [old_key] = self.cv_keys()
        changed = copy.deepcopy(self.source)
        changed['personal']['jobTitle'] = 'Principal Cloud Security Engineer'
        self.publish(changed)

        _, first = click(self.module, visitor='a')
        _, second = click(self.module, visitor='b')

        [new_key] = self.cv_keys()
        self.assertNotEqual(new_key, old_key)
        self.assertEqual(self.s3.count('put'), 2)  # one per content version, not per click
        self.assertIn(new_key, first['downloadUrl'])
        self.assertIn(new_key, second['downloadUrl'])

    def test_a_render_failure_is_a_500_and_is_not_counted(self):
        with mock.patch.object(self.module.renderResume, 'render_pdf', side_effect=RuntimeError('boom')):
            status, body = click(self.module)

        self.assertEqual(status, 500)
        self.assertEqual(body, {'error': 'Internal Server Error'})
        self.assertEqual(self.table.items, {})

    def test_a_missing_source_is_a_500_not_a_stale_cv(self):
        del self.s3.objects['data/cv-source.json']
        status, _ = click(self.module)
        self.assertEqual(status, 500)

    def test_visitor_id_is_still_required(self):
        response = self.module.lambda_handler({'queryStringParameters': None}, None)
        self.assertEqual(response['statusCode'], 400)


class ContactAliasTests(Harness):
    """The forwarding address printed on the CV, and how revoking one reaches the PDF."""

    def pdf_text(self, key):
        from test_renderResume import shown_text

        return shown_text(self.s3.objects[key][0])

    def test_first_click_issues_an_alias_and_prints_it(self):
        click(self.module)

        local = self.aliases.live()
        self.assertRegex(local, r'^abracken\.[a-z2-9]{6}$')
        self.assertEqual(self.aliases.items[local]['status'], 'active')
        [key] = self.cv_keys()
        self.assertIn(f'{local}@example.com', self.pdf_text(key))

    def test_the_alias_is_first_initial_and_surname(self):
        prefix = self.module._alias_prefix
        self.assertEqual(prefix('Alexander Bracken'), 'abracken')
        self.assertEqual(prefix('Zoë  de la Cruz'), 'zcruz')
        self.assertEqual(prefix('Cher'), 'cher')
        self.assertEqual(prefix(''), 'contact')

    def test_the_alias_is_stable_across_clicks_and_containers(self):
        click(self.module)
        first = self.aliases.live()
        click(self.module, visitor='b')
        self.module, self.s3, self.table = load_handler(aliases=self.aliases)
        self.publish(self.source)
        click(self.module, visitor='c')
        self.assertEqual(self.aliases.live(), first)
        self.assertEqual(len([k for k in self.aliases.items if not k.startswith('#')]), 1)

    def test_revoking_reissues_the_address_and_rerenders_on_the_next_click(self):
        click(self.module)
        old = self.aliases.live()
        [old_key] = self.cv_keys()

        # What the "revoke" workflow does.
        self.aliases.items[old]['status'] = 'revoked'
        del self.aliases.items['#current']
        status, body = click(self.module, visitor='b')

        new = self.aliases.live()
        self.assertEqual(status, 200)
        self.assertNotEqual(new, old)
        [new_key] = self.cv_keys()
        self.assertNotEqual(new_key, old_key)
        self.assertIn(new_key, body['downloadUrl'])
        text = self.pdf_text(new_key)
        self.assertIn(f'{new}@example.com', text)
        self.assertNotIn(old, text)

    def test_a_concurrent_mint_loses_cleanly(self):
        def rival():
            self.aliases.items['abracken.rival2'] = {'id': 'abracken.rival2', 'status': 'active'}
            self.aliases.items['#current'] = {'id': '#current', 'address': 'abracken.rival2'}

        self.aliases.on_pointer_write = rival
        click(self.module)

        self.assertEqual(self.aliases.live(), 'abracken.rival2')
        losers = [k for k, v in self.aliases.items.items() if k not in ('#current', 'abracken.rival2')]
        self.assertEqual([self.aliases.items[k]['status'] for k in losers], ['revoked'])
        [key] = self.cv_keys()
        self.assertIn('abracken.rival2@example.com', self.pdf_text(key))

    def test_an_unreachable_alias_table_still_serves_a_cv(self):
        self.aliases.down = True
        status, _ = click(self.module)
        self.assertEqual(status, 200)
        [key] = self.cv_keys()
        self.assertNotIn('@example.com', self.pdf_text(key))

        # Once the table is back, the address returns without waiting for a deploy.
        self.aliases.down = False
        click(self.module, visitor='b')
        [key] = self.cv_keys()
        self.assertIn(f'{self.aliases.live()}@example.com', self.pdf_text(key))

    def test_settings_can_leave_the_address_off(self):
        source = copy.deepcopy(self.source)
        source['cv'] = {'contactEmail': False}
        self.publish(source)

        click(self.module)

        self.assertEqual(self.aliases.items, {})
        [key] = self.cv_keys()
        self.assertNotIn('@example.com', self.pdf_text(key))


class MonthlyRotationTests(Harness):
    """One alias per calendar month; old ones keep forwarding; the CV follows along."""

    def setUp(self):
        super().setUp()
        at(self.module, datetime(2026, 11, 3, 9, 0))

    def test_an_alias_records_the_month_it_was_issued(self):
        click(self.module)
        live = self.aliases.live()
        self.assertEqual(self.aliases.items[live]['month'], '2026-11')
        self.assertEqual(self.aliases.items['#current']['month'], '2026-11')

    def test_the_same_month_reuses_the_alias(self):
        click(self.module)
        first = self.aliases.live()
        at(self.module, datetime(2026, 11, 30, 23, 59))
        click(self.module, visitor='b')
        self.assertEqual(self.aliases.live(), first)
        self.assertEqual(len(self.aliases.aliases()), 1)

    def test_a_new_month_issues_a_new_alias_and_retires_the_old_one(self):
        click(self.module)
        october = self.aliases.live()
        [old_key] = self.cv_keys()

        at(self.module, datetime(2026, 12, 1, 0, 5))
        status, body = click(self.module, visitor='b')

        december = self.aliases.live()
        self.assertEqual(status, 200)
        self.assertNotEqual(december, october)
        self.assertEqual(self.aliases.items[december]['month'], '2026-12')
        self.assertEqual(self.aliases.items[october]['status'], 'retired')
        # The CV is re-rendered with the new address on that same click.
        [new_key] = self.cv_keys()
        self.assertNotEqual(new_key, old_key)
        self.assertIn(new_key, body['downloadUrl'])

    def test_rotation_never_revives_a_hand_revoked_alias(self):
        click(self.module)
        live = self.aliases.live()
        self.aliases.items[live]['status'] = 'revoked'  # revoked by hand, pointer left in place

        at(self.module, datetime(2026, 12, 1, 0, 5))
        click(self.module, visitor='b')

        self.assertEqual(self.aliases.items[live]['status'], 'revoked')

    def test_concurrent_rotations_settle_on_one_alias(self):
        click(self.module)
        november = self.aliases.live()

        def rival():
            self.aliases.items['abracken.rival2'] = {'id': 'abracken.rival2', 'status': 'active', 'month': '2026-12'}
            self.aliases.items['#current'] = {'id': '#current', 'address': 'abracken.rival2', 'month': '2026-12'}

        self.aliases.on_pointer_write = rival
        at(self.module, datetime(2026, 12, 1, 0, 5))
        click(self.module, visitor='b')

        self.assertEqual(self.aliases.live(), 'abracken.rival2')
        statuses = {k: v['status'] for k, v in self.aliases.aliases().items()}
        self.assertEqual(statuses.pop('abracken.rival2'), 'active')
        statuses.pop(november)
        self.assertEqual(list(statuses.values()), ['revoked'])


if __name__ == '__main__':
    unittest.main()
