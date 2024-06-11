########################################
# Begin Web Application Firewall Block #

output "aws_wafv2_web_acl_crc-web-acl_id" {
  value = aws_wafv2_web_acl.crc-web-acl.id
}

output "aws_wafv2_web_acl_crc-web-acl_arn" {
  value = aws_wafv2_web_acl.crc-web-acl.arn
}


#  End Web Application Firewall Block  #
########################################


########################
# Begin DynamoDB Block #

output "aws_dynamodb_table_crc-visitor-count_id" {
  value = aws_dynamodb_table.crc-visitor-count.id
}

output "aws_dynamodb_table_crc-visitor-count_arn" {
  value = aws_dynamodb_table.crc-visitor-count.arn
}

output "aws_dynamodb_table_crc-visitor-record_id" {
  value = aws_dynamodb_table.crc-visitor-record.id
}

output "aws_dynamodb_table_crc-visitor-record_arn" {
  value = aws_dynamodb_table.crc-visitor-record.arn
}

#  End DynamoDB Block  #
########################


###################
# Begin SES Block #

output "aws_ses_configuration_set_crc-contact-mail_arn" {
  value = aws_ses_configuration_set.crc-contact-mail.arn
}

output "aws_ses_domain_identity_crc-mail-domain_arn" {
  value = aws_ses_domain_identity.crc-mail-domain.arn
}

output "aws_ses_email_identity_crc-mail-destination_arn" {
  value = aws_ses_email_identity.crc-mail-destination.arn
}

#  End SES Block  #
###################


###################
# Begin SQS Block #

output "aws_sqs_queue_crc-crc-cloudfront-invalidation-queue_arn" {
  value = aws_sqs_queue.crc-cloudfront-invalidation-queue.arn
}

output "aws_sqs_queue_crc-cloudfront-invalidation-queue_id" {
  value = aws_sqs_queue.crc-cloudfront-invalidation-queue.id
}

#  End SQS Block  #
###################


######################
# Begin Lambda Block #

output "aws_lambda_event_source_mapping_crc-sqs-invalidation-queue_id" {
  value = aws_lambda_event_source_mapping.crc-sqs-invalidation-queue.id
}

output "aws_lambda_function_event_invoke_config_crc-invoke-invalidation-queue_id" {
  value = aws_lambda_function_event_invoke_config.crc-invoke-invalidation-queue.id
}

output "aws_cloudwatch_log_group_crc-cloudfrontInvalidation_arn" {
  value = aws_cloudwatch_log_group.crc-cloudfrontInvalidation-log-group.arn
}

output "aws_lambda_function_crc-cloudfrontInvalidation_id" {
  value = aws_lambda_function.crc-cloudfrontInvalidation.id
}

output "aws_lambda_function_crc-cloudfrontInvalidation_uri" {
  value = aws_lambda_function.crc-cloudfrontInvalidation.invoke_arn
}

output "aws_cloudwatch_log_group_crc-sendMessage_arn" {
  value = aws_cloudwatch_log_group.crc-sendMessage-log-group.arn
}

output "aws_lambda_function_crc-sendMessage_id" {
  value = aws_lambda_function.crc-sendMessage.id
}

output "aws_lambda_function_crc-sendMessage_uri" {
  value = aws_lambda_function.crc-sendMessage.invoke_arn
}

output "aws_cloudwatch_log_group_crc-trackVisitors_arn" {
  value = aws_cloudwatch_log_group.crc-trackVisitors-log-group.arn
}

output "aws_lambda_function_crc-trackVisitors_id" {
  value = aws_lambda_function.crc-trackVisitors.id
}

output "aws_lambda_function_crc-trackVisitors_uri" {
  value = aws_lambda_function.crc-trackVisitors.invoke_arn
}

output "aws_lambda_permission_crc-event-permissions-s3-production_id" {
  value = aws_lambda_permission.crc-event-permissions-s3-production.id
}

output "aws_lambda_permission_crc-event-permissions-s3-staging_id" {
  value = aws_lambda_permission.crc-event-permissions-s3-staging.id
}

output "aws_lambda_permission_crc-event-permissions-api-visitors_id" {
  value = aws_lambda_permission.crc-event-permissions-api-visitors.id
}

output "aws_lambda_permission_crc-event-permissions-api-contact_id" {
  value = aws_lambda_permission.crc-event-permissions-api-contact.id
}

#  End Lambda Block  #
######################

