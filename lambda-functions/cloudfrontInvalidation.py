from __future__ import print_function

import boto3
import time
import os
from botocore.config import Config

prodDistribution = os.environ.get('prod_distribution')
devDistribution = os.environ.get('dev_distribution')

# Configure retries
config = Config(
    retries={
        'max_attempts': 10,  # Increase the number of retry attempts
        'mode': 'standard'
    }
)


def lambda_handler(event, context):
    if not prodDistribution or not devDistribution:
        raise ValueError("Environment variables 'prod_distribution' or 'dev_distribution' are not set.")

    client = boto3.client('cloudfront', config=config)

    for item in event["Records"]:
        bucket_name = item["s3"]["bucket"]["name"]
        path = "/" + item["s3"]["object"]["key"]
        print(f"Bucket: {bucket_name}, Path: {path}")

        # Determine the distribution ID based on the bucket name
        if bucket_name == 'agb-s3-cloudresumechallenge-hosted':
            distribution_id = prodDistribution
        elif bucket_name == 'agb-s3-cloudresumechallenge-staging':
            distribution_id = devDistribution
        else:
            print(f"Bucket {bucket_name} is not configured for cache invalidation.")
            continue

        try:
            invalidation = client.create_invalidation(
                DistributionId=distribution_id,
                InvalidationBatch={
                    'Paths': {
                        'Quantity': 1,
                        'Items': [path]
                    },
                    'CallerReference': str(time.time())
                }
            )
            print(f"Invalidation created for {bucket_name}: {invalidation}")
        except Exception as e:
            print(f"Error creating invalidation for path {path} in bucket {bucket_name}: {str(e)}")

        # Introduce a delay of 2000ms (2 seconds) to avoid rate limit issues
        time.sleep(2)
