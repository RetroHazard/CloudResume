resource "aws_sqs_queue" "crc-CloudFrontInvalidationQueue" {
  content_based_deduplication       = "false"
  delay_seconds                     = "0"
  fifo_queue                        = "false"
  kms_data_key_reuse_period_seconds = "300"
  max_message_size                  = "262144"
  message_retention_seconds         = "345600"
  name                              = "CloudFrontInvalidationQueue"

  policy = <<POLICY
{
  "Id": "Policy1717464010087",
  "Statement": [
    {
      "Action": "SQS:SendMessage",
      "Condition": {
        "ArnLike": {
          "aws:SourceArn": [
            "arn:aws:s3:::agb-s3-cloudresumechallenge-hosted",
            "arn:aws:s3:::agb-s3-cloudresumechallenge-staging"
          ]
        },
        "StringEquals": {
          "aws:SourceAccount": "339712851438"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Resource": "arn:aws:sqs:ap-northeast-1:339712851438:CloudFrontInvalidationQueue",
      "Sid": "Stmt1717463975055"
    },
    {
      "Action": [
        "SQS:ChangeMessageVisibility",
        "SQS:DeleteMessage",
        "SQS:ReceiveMessage",
        "SQS:GetQueueAttributes"
      ],
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::339712851438:role/service-role/CloudResume_CloudFrontManager"
      },
      "Resource": "arn:aws:sqs:ap-northeast-1:339712851438:CloudFrontInvalidationQueue",
      "Sid": "Stmt1717464008331"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  receive_wait_time_seconds  = "0"
  sqs_managed_sse_enabled    = "true"
  visibility_timeout_seconds = "60"
}
