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

data "aws_iam_policy_document" "crc-s3-github-actions" {
  statement {
    sid    = "VisualEditor1"
    effect = "Allow"
    actions = ["s3:*"]
    resources = [
      var.crc-s3-production-arn,
      "${var.crc-s3-production-arn}/*",
      var.crc-s3-staging-arn,
      "${var.crc-s3-staging-arn}/*"
    ]
  }
}