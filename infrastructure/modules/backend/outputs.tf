########################################
# Begin Web Application Firewall Block #

output "aws_wafv2_web_acl_crc-web-acl_arn" {
  value = var.waf-enabled && length(aws_wafv2_web_acl.crc-web-acl) > 0 ? aws_wafv2_web_acl.crc-web-acl[0].arn : null
}


#  End Web Application Firewall Block  #
########################################


########################
# Begin DynamoDB Block #

output "aws_dynamodb_table_crc-visitor-count_arn" {
  value = aws_dynamodb_table.crc-visitor-count.arn
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

output "aws_ses_domain_mail_from_crc-mail-from-domain" {
  value = aws_ses_domain_mail_from.crc-mail-from-domain.mail_from_domain
}

#  End SES Block  #
###################


###################
# Begin SQS Block #

output "aws_sqs_queue_crc-cloudfront-invalidation-queue_arn" {
  value = aws_sqs_queue.crc-cloudfront-invalidation-queue.arn
}

#  End SQS Block  #
###################


######################
# Begin Lambda Block #

output "aws_cloudwatch_log_group_crc-cloudfrontInvalidation_arn" {
  value = aws_cloudwatch_log_group.crc-cloudfrontInvalidation-log-group.arn
}

output "aws_cloudwatch_log_group_crc-sendMessage_arn" {
  value = aws_cloudwatch_log_group.crc-sendMessage-log-group.arn
}

output "aws_lambda_function_crc-sendMessage_uri" {
  value = aws_lambda_function.crc-sendMessage.invoke_arn
}

output "aws_cloudwatch_log_group_crc-trackVisitors_arn" {
  value = aws_cloudwatch_log_group.crc-trackVisitors-log-group.arn
}

output "aws_lambda_function_crc-trackVisitors_uri" {
  value = aws_lambda_function.crc-trackVisitors.invoke_arn
}

#  End Lambda Block  #
######################

