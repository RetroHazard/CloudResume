from __future__ import print_function

import boto3
import time
import os
import json

prodBucket = os.environ.get('prod_bucket')
prodDistribution = os.environ.get('prod_distribution')
devBucket = os.environ.get('dev_bucket')
devDistribution = os.environ.get('dev_distribution')
min_wait_time = 5


def lambda_handler(event, context):
    if not prodDistribution or not devDistribution:
        raise ValueError("Environment variables 'prod_distribution' or 'dev_distribution' are not set.")

    client = boto3.client('cloudfront')

    # Dictionary to hold paths for each distribution
    invalidation_paths = {
        prodDistribution: [],
        devDistribution: []
    }

    for record in event['Records']:
        try:
            message_body = record['body']
            message = json.loads(message_body)  # Parse the message body
            s3_event = message["Records"][0]  # Extract the S3 event details
            bucket_name = s3_event["s3"]["bucket"]["name"]
            object_key = s3_event["s3"]["object"]["key"]
            path = "/" + object_key
            print(f"Bucket: {bucket_name}, Path: {path}")

            # Determine the distribution ID based on the bucket name
            if bucket_name == prodBucket:
                invalidation_paths[prodDistribution].append(path)
            elif bucket_name == devBucket:
                invalidation_paths[devDistribution].append(path)
            else:
                print(f"Bucket {bucket_name} is not configured for cache invalidation.")
                continue

        except json.JSONDecodeError as e:
            print(f"Error parsing message body: {str(e)}")
        except KeyError as e:
            print(f"Error extracting S3 event details: {str(e)}")

    # Wait for the minimum wait time before creating invalidations
    print(f"Waiting for {min_wait_time} seconds to allow more files to accumulate...")
    time.sleep(min_wait_time)

    # Create invalidations in batches
    for distribution_id, paths in invalidation_paths.items():
        if paths:
            try:
                invalidation = client.create_invalidation(
                    DistributionId=distribution_id,
                    InvalidationBatch={
                        'Paths': {
                            'Quantity': len(paths),
                            'Items': paths
                        },
                        'CallerReference': str(time.time())
                    }
                )
                print(f"Invalidation created for distribution {distribution_id}: {invalidation}")
            except Exception as e:
                print(f"Error creating invalidation for paths in distribution {distribution_id}: {str(e)}")
