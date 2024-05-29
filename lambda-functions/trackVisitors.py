import json
import boto3
import os
from datetime import datetime, timedelta

# Initialize dynamodb boto3 object
dynamodb = boto3.resource('dynamodb')

# Set dynamodb table names from env
count_table_name = os.environ['countTableName']
record_table_name = os.environ['recordTableName']

count_table = dynamodb.Table(count_table_name)
record_table = dynamodb.Table(record_table_name)

def lambda_handler(event, context):
    visitor_id = event['queryStringParameters']['visitorId']
    current_time = datetime.utcnow()
    ttl_time = int((current_time + timedelta(days=1)).timestamp())

    try:
        # Check if the visitor ID exists in the visitor-record table
        visitor_response = record_table.get_item(
            Key={'id': visitor_id}
        )

        if 'Item' in visitor_response:
            # Visitor exists, check the TTL (if it exists, it means it's within 24 hours)
            visitor_count_response = count_table.get_item(
                Key={'id': 'visitor_count'}
            )
            visitor_count = visitor_count_response['Item']['visitor_count']
        else:
            # Visitor does not exist, add to visitor-record with TTL
            record_table.put_item(
                Item={
                    'id': visitor_id,
                    'ttl': ttl_time  # TTL attribute set to 24 hours from current time
                }
            )
            # Increment the visitor counter in visitor-count table
            count_response = count_table.update_item(
                Key={'id': 'visitor_count'},
                UpdateExpression='SET visitor_count = visitor_count + :value',
                ExpressionAttributeValues={':value': 1},
                ReturnValues="UPDATED_NEW"
            )
            visitor_count = count_response['Attributes']['visitor_count']
    except Exception as e:
        # Handle exceptions
        print(e)
        return {
            "isBase64Encoded": False,
            "statusCode": 500,
            "body": json.dumps({"error": "Internal Server Error"})
        }

    # Format dynamodb response into variable
    responseBody = json.dumps({"count": int(visitor_count)})

    # Create API response object
    apiResponse = {
        "isBase64Encoded": False,
        "statusCode": 200,
        "body": responseBody
    }

    # Return API response object
    return apiResponse
