from __future__ import print_function

import boto3
import time
import os

distribution = os.environ.get('prod_distribution')

def lambda_handler(event, context):
    if not distribution:
        raise ValueError("Environment variable 'prod_distribution' is not set.")

    client = boto3.client('cloudfront')

    for item in event["Records"]:
        path = "/" + item["s3"]["object"]["key"]
        print(path)
        try:
            invalidation = client.create_invalidation(
                DistributionId=distribution,
                InvalidationBatch={
                    'Paths': {
                        'Quantity': 1,
                        'Items': [path]
                    },
                    'CallerReference': str(time.time())
                }
            )
            print("Invalidation created: ", invalidation)
        except Exception as e:
            print(f"Error creating invalidation for path {path}: {str(e)}")
