##########################
# Begin Core IAM Resources

// IAM Policy Documents
data "aws_iam_policy_document" "crc-lambda-TrackVisitors-logging-policy" {
  statement {
      sid    = "Statement1"
      effect = "Allow"

      actions = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      resources = [
        "${var.crc-cw-lambda-log-group-trackVisitors}:*"
      ]
    }
}

data "aws_iam_policy_document" "crc-lambda-TrackVisitors-access-policy" {
  statement {
  sid = "VisualEditor0"
  effect = "Allow"
  actions = [
    "dynamodb:PutItem",
    "dynamodb:GetItem",
    "dynamodb:UpdateItem"
  ]
  resources = [
    var.crc-visitor-count_arn,
    var.crc-visitor-record_arn
  ]
  }
}

data "aws_iam_policy_document" "crc-lambda-SendMessage-logging-policy" {
  statement {
    sid    = "Statement1"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${var.crc-cw-lambda-log-group-sendMessage}:*"
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-SendMessage-access-policy" {
  statement {
    sid    = "VisualEditor0"
    effect = "Allow"
    actions = [
      "ses:SendEmail",
      "ses:SendTemplatedEmail",
      "ses:SendRawEmail"
    ]
    resources = [
      var.crc-ses-configuration-set,
      var.crc-ses-mail-destination,
      var.crc-ses-mail-domain
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-CloudfrontInvalidation-logging-policy" {
  statement {
    sid    = "Statement1"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${var.crc-cw-lambda-log-group-cloudfrontInvalidation}:*"
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-CloudfrontInvalidation-access-policy" {
  statement {
    sid = "Stmt1505004397098"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations"
    ]
    resources = [
      var.crc-cf-production-distribution,
      var.crc-cf-staging-distribution
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:Get*",
      "s3:List*"
    ]
    resources = [
      var.crc-s3-production-arn,
      "${var.crc-s3-production-arn}/*",
      var.crc-s3-staging-arn,
      "${var.crc-s3-staging-arn}/*"
    ]
  }
}

// IAM Policies
resource "aws_iam_policy" "crc-Lambda-TrackVisitors-AccessPolicy" {
  name = "crc-Lambda-TrackVisitors-AccessPolicy"
  path = "/"

  policy = jsonencode(data.aws_iam_policy_document.crc-lambda-TrackVisitors-access-policy.json)
}

resource "aws_iam_policy" "crc-Lambda-TrackVisitors-Logging" {
  name = "crc-Lambda-TrackVisitors-Logging"
  path = "/"

  policy = jsonencode(data.aws_iam_policy_document.crc-lambda-TrackVisitors-logging-policy.json)
}

resource "aws_iam_policy" "crc-Lambda-CloudfrontInvalidation-AccessPolicy" {
  name = "crc-CloudFrontInvalidation-AccessPolicy"
  path = "/"

  policy = jsonencode(data.aws_iam_policy_document.crc-lambda-CloudfrontInvalidation-access-policy.json)
}

resource "aws_iam_policy" "crc-Lambda-CloudfrontInvalidation-Logging" {
  name = "crc-Lambda-CloudFrontInvalidation-Logging"
  path = "/"

  policy = jsonencode(data.aws_iam_policy_document.crc-lambda-CloudfrontInvalidation-logging-policy.json)
}

resource "aws_iam_policy" "crc-Lambda-SendMessage-AccessPolicy" {
  name = "crc-Lambda-SendMessage-AccessPolicy"
  path = "/"

  policy = jsonencode(data.aws_iam_policy_document.crc-lambda-SendMessage-access-policy.json)
}

resource "aws_iam_policy" "crc-Lambda-SendMessage-Logging" {
  name = "crc-Lambda-SendMessage-Logging"
  path = "/"

  policy = data.aws_iam_policy_document.crc-lambda-SendMessage-logging-policy.json
}

resource "aws_iam_policy" "crc-S3-GitHubActions" {
  name = "crc-S3-GitHubActions"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "s3:*",
      "Effect": "Allow",
      "Resource": [
        "${var.crc-s3-production-arn}",
        "${var.crc-s3-production-arn}/*",
        "${var.crc-s3-staging-arn}",
        "${var.crc-s3-staging-arn}/*"
      ],
      "Sid": "VisualEditor1"
    }
  ],
  "Version": "2012-10-17"
}
POLICY
}

// IAM Policy Attachment
resource "aws_iam_role_policy_attachment" "crc-cloudwatch-VisitorTracker" {
  policy_arn = aws_iam_role.crc-VisitorTracker.arn
  role       = aws_iam_role.crc-VisitorTracker.name
}

resource "aws_iam_role_policy_attachment" "crc-cloudwatch-MessageSender" {
  policy_arn = aws_iam_role.crc-MessageSender.arn
  role       = aws_iam_role.crc-MessageSender.name
}

resource "aws_iam_role_policy_attachment" "crc-cloudwatch-CloudfrontManager" {
  policy_arn = aws_iam_role.crc-CloudfrontManager.arn
  role       = aws_iam_role.crc-CloudfrontManager.name
}

// IAM Roles
resource "aws_iam_role" "crc-api-CloudwatchLogs" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  description          = "Allows API Gateway to push logs to CloudWatch Logs."
  managed_policy_arns  = [
    "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
  ]
  max_session_duration = "3600"
  name                 = "CloudResume_API_CloudWatchLogs"
  path                 = "/service-role/"
}

resource "aws_iam_role" "crc-CloudfrontManager" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  managed_policy_arns  = [
    aws_iam_policy.crc-Lambda-CloudfrontInvalidation-AccessPolicy.arn,
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
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  description          = "Allows Lambda functions to call AWS services on your behalf."
  managed_policy_arns  = [
    aws_iam_policy.crc-Lambda-SendMessage-AccessPolicy.arn,
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
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  description          = "Allows Lambda functions to call AWS services on your behalf."
  managed_policy_arns  = [
    aws_iam_policy.crc-Lambda-TrackVisitors-AccessPolicy.arn,
  ]
  max_session_duration = "3600"
  name                 = "crc-VisitorTracker"
  path                 = "/"

}