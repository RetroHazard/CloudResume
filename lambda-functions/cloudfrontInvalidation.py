from __future__ import print_function

import boto3
import time
import os

distribution=os.environ['prod_distribution']

def lambda_handler(event, context):
    for items in event["Records"]:
        path = "/" + items["s3"]["object"]["key"]
    print(path)
    client = boto3.client('cloudfront')
    invalidation = client.create_invalidation(
        DistributionId=distribution,
        InvalidationBatch={
            'Paths': {
                'Quantity': 1,
                'Items': [path]
        },
        'CallerReference': str(time.time())
    })