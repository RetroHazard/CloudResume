##########################
# Begin Core IAM Resources

// IAM Policies
resource "aws_iam_policy" "crc-Lambda-TrackVisitors-AccessPolicy" {
  name = "crc-Lambda-TrackVisitors-AccessPolicy"
  path = "/"

  policy = data.aws_iam_policy_document.crc-lambda-TrackVisitors-access-policy.json
}

resource "aws_iam_policy" "crc-Lambda-TrackVisitors-Logging" {
  name = "crc-Lambda-TrackVisitors-Logging"
  path = "/"

  policy = data.aws_iam_policy_document.crc-lambda-TrackVisitors-logging-policy.json
}

resource "aws_iam_policy" "crc-Lambda-CloudfrontInvalidation-AccessPolicy" {
  name = "crc-CloudFrontInvalidation-AccessPolicy"
  path = "/"

  policy = data.aws_iam_policy_document.crc-lambda-CloudfrontInvalidation-access-policy.json
}

resource "aws_iam_policy" "crc-Lambda-CloudfrontInvalidation-Logging" {
  name = "crc-Lambda-CloudFrontInvalidation-Logging"
  path = "/"

  policy = data.aws_iam_policy_document.crc-lambda-CloudfrontInvalidation-logging-policy.json
}

resource "aws_iam_policy" "crc-Lambda-SendMessage-AccessPolicy" {
  name = "crc-Lambda-SendMessage-AccessPolicy"
  path = "/"

  policy = data.aws_iam_policy_document.crc-lambda-SendMessage-access-policy.json
}

resource "aws_iam_policy" "crc-Lambda-SendMessage-Logging" {
  name = "crc-Lambda-SendMessage-Logging"
  path = "/"

  policy = data.aws_iam_policy_document.crc-lambda-SendMessage-logging-policy.json
}

resource "aws_iam_policy" "crc-S3-GitHubActions" {
  name = "crc-s3-github-actions"
  path = "/"

  policy = data.aws_iam_policy_document.crc-s3-github-actions.json
}

// IAM Roles
resource "aws_iam_role" "crc-api-CloudwatchLogs" {
  description        = "Allows API Gateway to publish to CloudWatch Logs."
  assume_role_policy = data.aws_iam_policy_document.crc-LambdaAPI-assume-role-policy.json
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
  ]
  max_session_duration = 3600
  name                 = "CloudResume_API_CloudWatchLogs"
  path                 = "/"
}

resource "aws_iam_role" "crc-CloudfrontManager" {
  description        = "Allows Lambda to Manage Cloudfront Invalidations and Publish to CloudWatch"
  assume_role_policy = data.aws_iam_policy_document.crc-LambdaAPI-assume-role-policy.json
  managed_policy_arns = [
    aws_iam_policy.crc-Lambda-CloudfrontInvalidation-AccessPolicy.arn,
    aws_iam_policy.crc-Lambda-CloudfrontInvalidation-Logging.arn
  ]
  max_session_duration = 3600
  name                 = "crc-CloudFrontManager"
  path                 = "/"
}

resource "aws_iam_role" "crc-MessageSender" {
  description        = "Allows Lambda to Send Messages using SES and Publish to CloudWatch"
  assume_role_policy = data.aws_iam_policy_document.crc-LambdaAPI-assume-role-policy.json
  managed_policy_arns = [
    aws_iam_policy.crc-Lambda-SendMessage-AccessPolicy.arn,
    aws_iam_policy.crc-Lambda-SendMessage-Logging.arn,
  ]
  max_session_duration = 3600
  name                 = "crc-MessageSender"
  path                 = "/"
}

resource "aws_iam_role" "crc-VisitorTracker" {
  description        = "Allows Lambda to Manage DynamoDB Tables and Publish to CloudWatch"
  assume_role_policy = data.aws_iam_policy_document.crc-LambdaAPI-assume-role-policy.json
  managed_policy_arns = [
    aws_iam_policy.crc-Lambda-TrackVisitors-AccessPolicy.arn,
    aws_iam_policy.crc-Lambda-TrackVisitors-Logging.arn,
  ]
  max_session_duration = 3600
  name                 = "crc-VisitorTracker"
  path                 = "/"
}
