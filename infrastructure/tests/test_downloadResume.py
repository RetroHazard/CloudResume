"""Tests for the CV cache in downloadResume: when a click renders, and when it must not.

boto3 is replaced with in-memory fakes, so this runs without AWS credentials or even boto3
installed. Run from the repository root:  python -m unittest discover -s infrastructure/tests
"""

import copy
import importlib
import json
import os
import sys
import types
import unittest
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


def load_handler():
    """Import downloadResume against fresh fakes, as a new Lambda container would."""
    s3, table = FakeS3(), FakeTable()
    fake_boto3 = types.ModuleType('boto3')
    fake_boto3.client = lambda name: s3 if name == 's3' else object()
    fake_boto3.resource = lambda name: types.SimpleNamespace(Table=lambda _: table)
    fake_exceptions = types.ModuleType('botocore.exceptions')
    fake_exceptions.ClientError = ClientError
    sys.modules['boto3'] = fake_boto3
    sys.modules['botocore'] = types.ModuleType('botocore')
    sys.modules['botocore.exceptions'] = fake_exceptions
    os.environ.update(
        recordTableName='records',
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


class CvCacheTests(unittest.TestCase):
    def setUp(self):
        self.module, self.s3, self.table = load_handler()
        self.source = load_source()
        self.publish(self.source)

    def publish(self, source):
        """What a site deploy does: re-upload data/cv-source.json, which always gets a new ETag."""
        self.s3.upload('data/cv-source.json', json.dumps(source).encode())

    def cv_keys(self):
        return sorted(k for k in self.s3.objects if k.startswith('files/cv/'))

    def test_first_click_compiles_and_caches_the_cv(self):
        status, body = click(self.module)

        self.assertEqual(status, 200)
        self.assertEqual(self.s3.count('put'), 1)
        [key] = self.cv_keys()
        self.assertRegex(key, r'^files/cv/[0-9a-f]{24}/BRACKEN_ALEXANDER_Resume\.pdf$')
        self.assertTrue(self.s3.objects[key][0].startswith(b'%PDF-'))
        self.assertEqual(self.s3.last_put['ContentType'], 'application/pdf')
        self.assertEqual(body['downloadUrl'].split('?')[0], f'https://example.com/{key}')
        self.assertEqual(body['fileName'], 'BRACKEN_ALEXANDER_Resume.pdf')
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
        self.module, self.s3, self.table = load_handler()
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


if __name__ == '__main__':
    unittest.main()
