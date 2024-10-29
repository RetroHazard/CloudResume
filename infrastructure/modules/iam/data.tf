##########################
# Begin Core IAM Resources

// Lambda Policy Documents
data "aws_iam_policy_document" "crc-lambda-TrackVisitors-logging-policy" {
  statement {
    sid    = "Allow Function to Write to Cloudwatch"
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
    sid    = "Allow Function to Read/Write to Specified DynamoDB Resources"
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
    sid    = "Allow Function to Write to Cloudwatch"
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
    sid    = "Allow Function to Generate Emails"
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
    sid    = "Allow Function to Write to Cloudwatch"
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
    sid    = "Allow Cloudfront Actions to Refresh Cache"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations"
    ]
    resources = [
      var.crc-cf-production-distribution
    ]
  }

  statement {
    sid    = "Allow S3 Actions to Determine Cloudfront Invalidations"
    effect = "Allow"
    actions = [
      "s3:Get*",
      "s3:List*"
    ]
    resources = [
      var.crc-s3-production-arn,
      "${var.crc-s3-production-arn}/*"
    ]
  }
}

// GitHub Policy Documents
data "aws_iam_policy_document" "crc-s3-github-actions" {
  statement {
    sid    = "Allow S3 Access to GitHub Runner"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket"
    ]
    resources = [
      var.crc-s3-production-arn,
      "${var.crc-s3-production-arn}/*"
    ]
  }
}