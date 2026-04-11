##########################
# Begin Core IAM Resources

// IAM Policies
resource "aws_iam_policy" "crc-Lambda-TrackVisitors-AccessPolicy" {
  name = "crc-Lambda-TrackVisitors-AccessPolicy"
  path = "/CloudResume/"

  policy = data.aws_iam_policy_document.crc-lambda-TrackVisitors-access-policy.json

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_policy" "crc-Lambda-TrackVisitors-Logging" {
  name = "crc-Lambda-TrackVisitors-Logging"
  path = "/CloudResume/"

  policy = data.aws_iam_policy_document.crc-lambda-TrackVisitors-logging-policy.json

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_policy" "crc-Lambda-CloudfrontInvalidation-AccessPolicy" {
  name = "crc-CloudFrontInvalidation-AccessPolicy"
  path = "/CloudResume/"

  policy = data.aws_iam_policy_document.crc-lambda-CloudfrontInvalidation-access-policy.json

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_policy" "crc-Lambda-CloudfrontInvalidation-Logging" {
  name = "crc-Lambda-CloudFrontInvalidation-Logging"
  path = "/CloudResume/"

  policy = data.aws_iam_policy_document.crc-lambda-CloudfrontInvalidation-logging-policy.json

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_policy" "crc-Lambda-SendMessage-AccessPolicy" {
  name = "crc-Lambda-SendMessage-AccessPolicy"
  path = "/CloudResume/"

  policy = data.aws_iam_policy_document.crc-lambda-SendMessage-access-policy.json

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_policy" "crc-Lambda-SendMessage-Logging" {
  name = "crc-Lambda-SendMessage-Logging"
  path = "/CloudResume/"

  policy = data.aws_iam_policy_document.crc-lambda-SendMessage-logging-policy.json

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_policy" "crc-GitHub-S3Actions" {
  name = "crc-s3-github-actions"
  path = "/CloudResume/"

  policy = data.aws_iam_policy_document.crc-github-s3-actions.json

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_policy" "crc-GitHub-Terraform-LimitedIAM" {
  name = "crc-github-terraform-limited-iam"
  path = "/CloudResume/"

  policy = data.aws_iam_policy_document.crc-github-terraform-limited-iam.json

  lifecycle {
    create_before_destroy = false
  }
}

// IAM Roles
resource "aws_iam_role" "crc-api-CloudwatchLogs" {
  description          = "Allows API Gateway to publish to CloudWatch Logs."
  force_detach_policies = true
  assume_role_policy   = data.aws_iam_policy_document.crc-function-assume-role-policy.json
  max_session_duration = 3600
  name                 = "CloudResume_API_CloudWatchLogs"
  path                 = "/CloudResume/"

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_role_policy_attachment" "crc-api-CloudwatchLogs-policy" {
  role       = aws_iam_role.crc-api-CloudwatchLogs.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_iam_role" "crc-CloudfrontManager" {
  description          = "Allows Lambda to Manage Cloudfront Invalidations and Publish to CloudWatch"
  force_detach_policies = true
  assume_role_policy   = data.aws_iam_policy_document.crc-function-assume-role-policy.json
  max_session_duration = 3600
  name                 = "crc-CloudFrontManager"
  path                 = "/CloudResume/"

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_role_policy_attachment" "crc-CloudfrontManager-access-policy" {
  role       = aws_iam_role.crc-CloudfrontManager.name
  policy_arn = aws_iam_policy.crc-Lambda-CloudfrontInvalidation-AccessPolicy.arn
}

resource "aws_iam_role_policy_attachment" "crc-CloudfrontManager-logging-policy" {
  role       = aws_iam_role.crc-CloudfrontManager.name
  policy_arn = aws_iam_policy.crc-Lambda-CloudfrontInvalidation-Logging.arn
}

resource "aws_iam_role" "crc-MessageSender" {
  description          = "Allows Lambda to Send Messages using SES and Publish to CloudWatch"
  force_detach_policies = true
  assume_role_policy   = data.aws_iam_policy_document.crc-function-assume-role-policy.json
  max_session_duration = 3600
  name                 = "crc-MessageSender"
  path                 = "/CloudResume/"

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_role_policy_attachment" "crc-MessageSender-access-policy" {
  role       = aws_iam_role.crc-MessageSender.name
  policy_arn = aws_iam_policy.crc-Lambda-SendMessage-AccessPolicy.arn
}

resource "aws_iam_role_policy_attachment" "crc-MessageSender-logging-policy" {
  role       = aws_iam_role.crc-MessageSender.name
  policy_arn = aws_iam_policy.crc-Lambda-SendMessage-Logging.arn
}

resource "aws_iam_role" "crc-VisitorTracker" {
  description          = "Allows Lambda to Manage DynamoDB Tables and Publish to CloudWatch"
  force_detach_policies = true
  assume_role_policy   = data.aws_iam_policy_document.crc-function-assume-role-policy.json
  max_session_duration = 3600
  name                 = "crc-VisitorTracker"
  path                 = "/CloudResume/"

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_iam_role_policy_attachment" "crc-VisitorTracker-access-policy" {
  role       = aws_iam_role.crc-VisitorTracker.name
  policy_arn = aws_iam_policy.crc-Lambda-TrackVisitors-AccessPolicy.arn
}

resource "aws_iam_role_policy_attachment" "crc-VisitorTracker-logging-policy" {
  role       = aws_iam_role.crc-VisitorTracker.name
  policy_arn = aws_iam_policy.crc-Lambda-TrackVisitors-Logging.arn
}
