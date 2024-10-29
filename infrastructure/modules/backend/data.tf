######################
# Begin Lambda Block #

data "archive_file" "trackvisitors_lambda_function_code" {
  type        = "zip"
  source_file = "${path.root}/codebase/trackVisitors.py"
  output_path = "${path.root}/codepacks/trackVisitors.zip"
}

data "archive_file" "cloudfrontInvalidation_lambda_function_code" {
  type        = "zip"
  source_file = "${path.root}/codebase/cloudfrontInvalidation.py"
  output_path = "${path.root}/codepacks/cloudfrontInvalidation.zip"
}

data "archive_file" "sendMessage_lambda_function_code" {
  type        = "zip"
  source_file = "${path.root}/codebase/sendMessage.py"
  output_path = "${path.root}/codepacks/sendMessage.zip"
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
