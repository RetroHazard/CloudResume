import json
import boto3
import os

# Define Environmental Variables
AWS_REGION = os.environ['mailRegion']
# SEND_TO and SEND_AS Addresses must be verified in SES
SEND_TO = os.environ['sendToAddress']
SEND_AS = os.environ['sendFromAddress']

def lambda_handler(event, context):
    # Initialize the SES client
    ses_client = boto3.client('ses', region_name=AWS_REGION)

    try:
        # Parse the JSON body of the request
        body = json.loads(event['body'])

        # Extract form data
        first_name = body.get('firstName')
        last_name = body.get('lastName')
        email = body.get('email')
        subject = body.get('subject')
        message = body.get('message')

        # Construct the email content
        email_subject = f"New contact form submission: {subject}"
        email_body = f"""
        You have a new contact form submission:

        Name: {first_name} {last_name}
        Email: {email}
        Subject: {subject}
        Message: {message}
        """

        # Send the email using SES
        response = ses_client.send_email(
            Source=SEND_AS,
            Destination={
                'ToAddresses': [
                    SEND_TO,
                ],
            },
            Message={
                'Subject': {
                    'Data': email_subject,
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': email_body,
                        'Charset': 'UTF-8'
                    }
                }
            }
        )

        # Construct a success response
        response = {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Form submitted and email sent successfully!',
                'data': {
                    'firstName': first_name,
                    'lastName': last_name,
                    'email': email,
                    'subject': subject,
                    'message': message
                }
            })
        }

        return response

    except Exception as e:
        # Handle any errors that may occur
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
