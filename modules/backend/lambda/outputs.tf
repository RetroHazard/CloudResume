output "aws_lambda_event_source_mapping_crc-9b7783a0-1f0a-408d-8d07-62e509bfb852_id" {
  value = aws_lambda_event_source_mapping.crc-9b7783a0-1f0a-408d-8d07-62e509bfb852.id
}

output "aws_lambda_function_event_invoke_config_crc-feic_arn-003A-aws-003A-lambda-003A-ap-northeast-1-003A-${data.aws_caller_identity.current.account_id}-003A-function-003A-cloudfrontInvalidation-003A--0024-LATEST_id" {
  value = aws_lambda_function_event_invoke_config.crc-feic_arn-003A-aws-003A-lambda-003A-ap-northeast-1-003A-${data.aws_caller_identity.current.account_id}-003A-function-003A-cloudfrontInvalidation-003A--0024-LATEST.id
}

output "aws_lambda_function_crc-cloudfrontInvalidation_id" {
  value = aws_lambda_function.crc-cloudfrontInvalidation.id
}

output "aws_lambda_function_crc-sendMessage_id" {
  value = aws_lambda_function.crc-sendMessage.id
}

output "aws_lambda_function_crc-trackVisitors_id" {
  value = aws_lambda_function.crc-trackVisitors.id
}

output "aws_lambda_permission_crc-${data.aws_caller_identity.current.account_id}_event_permissions_from_agb-s3-cloudresumechallenge-hosted_for_cloudfrontInvalidation_id" {
  value = aws_lambda_permission.crc-${data.aws_caller_identity.current.account_id}_event_permissions_from_agb-s3-cloudresumechallenge-hosted_for_cloudfrontInvalidation.id
}

output "aws_lambda_permission_crc-${data.aws_caller_identity.current.account_id}_event_permissions_from_agb-s3-cloudresumechallenge-staging_for_cloudfrontInvalidation_id" {
  value = aws_lambda_permission.crc-${data.aws_caller_identity.current.account_id}_event_permissions_from_agb-s3-cloudresumechallenge-staging_for_cloudfrontInvalidation.id
}

output "aws_lambda_permission_crc-6a15043e-cdf0-5fe5-9f60-2b632783e360_id" {
  value = aws_lambda_permission.crc-6a15043e-cdf0-5fe5-9f60-2b632783e360.id
}

output "aws_lambda_permission_crc-7fc9f8bc-795a-5281-8993-9ef519d4b046_id" {
  value = aws_lambda_permission.crc-7fc9f8bc-795a-5281-8993-9ef519d4b046.id
}
