data "archive_file" "trackvisitors_lambda_function_code" {
  type        = "zip"
  source_file = "${path.module}/codebase/trackVisitors.py"
  output_path = "${path.module}/packaged/trackVisitors.zip"
}

data "archive_file" "cloudfrontInvalidation_lambda_function_code" {
  type        = "zip"
  source_file = "${path.module}/codebase/cloudfrontInvalidation.py"
  output_path = "${path.module}/packaged/cloudfrontInvalidation.zip"
}

data "archive_file" "sendMessage_lambda_function_code" {
  type        = "zip"
  source_file = "${path.module}/codebase/sendMessage.py"
  output_path = "${path.module}/packaged/sendMessage.zip"
}
