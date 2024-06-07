data "archive_file" "trackvisitors_lambda_function_code" {
  type        = "zip"
  source_file = "${path.root}/codebase/trackVisitors.py"
  output_path = "${path.root}/packaged/trackVisitors.zip"
}

data "archive_file" "cloudfrontInvalidation_lambda_function_code" {
  type        = "zip"
  source_file = "${path.root}/codebase/cloudfrontInvalidation.py"
  output_path = "${path.root}/packaged/cloudfrontInvalidation.zip"
}

data "archive_file" "sendMessage_lambda_function_code" {
  type        = "zip"
  source_file = "${path.root}/codebase/sendMessage.py"
  output_path = "${path.root}/packaged/sendMessage.zip"
}