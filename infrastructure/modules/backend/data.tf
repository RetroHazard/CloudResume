######################
# Begin Lambda Block #

data "archive_file" "trackvisitors_lambda_function_code" {
  type             = "zip"
  source_file      = "${path.root}/codebase/trackVisitors.py"
  output_path      = "${path.root}/codepacks/trackVisitors.zip"
  output_file_mode = "0666"
}

# Two files rather than one: the handler imports the CV renderer it falls back to when no
# PDF matching the current site data has been cached yet.
data "archive_file" "downloadResume_lambda_function_code" {
  type = "zip"

  source {
    content  = file("${path.root}/codebase/downloadResume.py")
    filename = "downloadResume.py"
  }

  source {
    content  = file("${path.root}/codebase/renderResume.py")
    filename = "renderResume.py"
  }

  output_path      = "${path.root}/codepacks/downloadResume.zip"
  output_file_mode = "0666"
}

data "archive_file" "forwardMail_lambda_function_code" {
  type             = "zip"
  source_file      = "${path.root}/codebase/forwardMail.py"
  output_path      = "${path.root}/codepacks/forwardMail.zip"
  output_file_mode = "0666"
}

data "archive_file" "cloudfrontInvalidation_lambda_function_code" {
  type             = "zip"
  source_file      = "${path.root}/codebase/cloudfrontInvalidation.py"
  output_path      = "${path.root}/codepacks/cloudfrontInvalidation.zip"
  output_file_mode = "0666"
}

data "archive_file" "sendMessage_lambda_function_code" {
  type             = "zip"
  source_file      = "${path.root}/codebase/sendMessage.py"
  output_path      = "${path.root}/codepacks/sendMessage.zip"
  output_file_mode = "0666"
}

data "archive_file" "updateContributions_lambda_function_code" {
  type             = "zip"
  source_file      = "${path.root}/codebase/updateContributions.py"
  output_path      = "${path.root}/codepacks/updateContributions.zip"
  output_file_mode = "0666"
}

###################
# Begin SQS Block #

data "aws_sqs_queue" "crc_cloudfront_invalidation_queue" {
  depends_on = [aws_sqs_queue.crc-cloudfront-invalidation-queue]
  name       = aws_sqs_queue.crc-cloudfront-invalidation-queue.name
}

data "aws_iam_policy_document" "crc_cloudfront_invalidation_queue_policy" {
  statement {
    sid       = "Queue Policy Allowing S3 Events on Prod Bucket to Publish Messages"
    effect    = "Allow"
    actions   = ["SQS:SendMessage"]
    resources = [data.aws_sqs_queue.crc_cloudfront_invalidation_queue.arn]

    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }

    condition {
      test     = "ArnLike"
      variable = "aws:SourceArn"
      values   = [var.s3-bucket-production-arn]
    }
  }

  statement {
    sid    = "Queue Policy Allowing CloudFront Invalidation Function to Manage Queue"
    effect = "Allow"
    actions = [
      "SQS:ChangeMessageVisibility",
      "SQS:DeleteMessage",
      "SQS:ReceiveMessage",
      "SQS:GetQueueAttributes"
    ]
    resources = [data.aws_sqs_queue.crc_cloudfront_invalidation_queue.arn]

    principals {
      type        = "AWS"
      identifiers = [var.iam-role-cloudfront-manager-arn]
    }

  }
}

#############################
# Begin Inbound Mail Block #

locals {
  mail-object-prefix    = "inbound/"
  mail-receipt-rule     = "contact-forward"
  mail-receipt-rule-arn = "arn:aws:ses:${data.aws_region.current.region}:${var.account_id}:receipt-rule-set/CloudResume-Inbound:receipt-rule/contact-forward"
}

# SES writes each received message here before invoking forwardMail. Scoped to this account
# and this one receipt rule, so no other SES customer can deliver into the bucket.
data "aws_iam_policy_document" "crc-agb-s3-mail" {
  statement {
    sid       = "AllowSESToStoreReceivedMail"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.crc-agb-s3-mail.arn}/${local.mail-object-prefix}*"]

    principals {
      type        = "Service"
      identifiers = ["ses.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [var.account_id]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [local.mail-receipt-rule-arn]
    }
  }
}

#  End Inbound Mail Block  #
#############################
