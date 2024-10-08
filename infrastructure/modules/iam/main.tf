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

// IAM Policy Attachment
resource "aws_iam_group_policy_attachment" "crc-iam-github-users" {
  group      = aws_iam_group.crc-iam-github-users.name
  policy_arn = aws_iam_policy.crc-S3-GitHubActions.arn
}

// IAM Roles
resource "aws_iam_role" "crc-api-CloudwatchLogs" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  description = "Allows API Gateway to push logs to CloudWatch Logs."
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
  ]
  max_session_duration = "3600"
  name                 = "CloudResume_API_CloudWatchLogs"
  path                 = "/"
}

resource "aws_iam_role" "crc-CloudfrontManager" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  managed_policy_arns = [
    aws_iam_policy.crc-Lambda-CloudfrontInvalidation-AccessPolicy.arn,
    aws_iam_policy.crc-Lambda-CloudfrontInvalidation-Logging.arn
  ]
  max_session_duration = "3600"
  name                 = "crc-CloudFrontManager"
  path                 = "/"

}

resource "aws_iam_role" "crc-MessageSender" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  description = "Allows Lambda functions to call AWS services on your behalf."
  managed_policy_arns = [
    aws_iam_policy.crc-Lambda-SendMessage-AccessPolicy.arn,
    aws_iam_policy.crc-Lambda-SendMessage-Logging.arn,
  ]
  max_session_duration = "3600"
  name                 = "crc-MessageSender"
  path                 = "/"

}

resource "aws_iam_role" "crc-VisitorTracker" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  description = "Allows Lambda functions to call AWS services on your behalf."
  managed_policy_arns = [
    aws_iam_policy.crc-Lambda-TrackVisitors-AccessPolicy.arn,
    aws_iam_policy.crc-Lambda-TrackVisitors-Logging.arn,
  ]
  max_session_duration = "3600"
  name                 = "crc-VisitorTracker"
  path                 = "/"

}

// IAM Users

resource "aws_iam_user" "crc-iam-github-actions" {
  name = "crc-s3-github-actions"
}

// IAM Groups
resource "aws_iam_group" "crc-iam-github-users" {
  name = "GitHubUsers"
}

resource "aws_iam_user_group_membership" "crc-iam-assign-github-actions" {
  groups = [aws_iam_group.crc-iam-github-users.name]
  user   = aws_iam_user.crc-iam-github-actions.name
}

resource "aws_iam_access_key" "crc-iam-github-key" {
  user = aws_iam_user.crc-iam-github-actions.name
}