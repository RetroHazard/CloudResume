data "archive_file" "trackvisitors_lambda_function" {
  type = "zip"
  source_file = "../../../lambda_function_code/trackVisitors.py"
  output_path = "trackVisitors.zip"
}

data "archive_file" "cloudfrontInvalidation_lambda_function" {
  type = "zip"
  source_file = "../../../lambda_function_code/cloudfrontInvalidation.py"
  output_path = "cloudfrontInvalidation.zip"
}

data "archive_file" "sendMessage_lambda_function" {
  type = "zip"
  source_file = "../../../lambda_function_code/sendMessage.py"
  output_path = "sendMessage.zip"
}