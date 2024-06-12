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
  name = aws_sqs_queue.crc-cloudfront-invalidation-queue.name
}