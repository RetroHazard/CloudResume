#######################################
# Cloud Resume - Back End Components #
#######################################

########################################
# Begin Web Application Firewall Block #

resource "aws_wafv2_web_acl" "crc-web-acl" {
  description = "Web Application Protection for the Cloud Resume"
  name        = "CloudResume-WebACL"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "AWS-AWSManagedRulesAmazonIpReputationList"
    priority = "3"

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = "true"
      metric_name                = "AWS-AWSManagedRulesAmazonIpReputationList"
      sampled_requests_enabled   = "true"
    }
  }

  rule {
    name     = "AWS-AWSManagedRulesAnonymousIpList"
    priority = "2"

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAnonymousIpList"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = "true"
      metric_name                = "AWS-AWSManagedRulesAnonymousIpList"
      sampled_requests_enabled   = "true"
    }
  }

  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = "0"

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = "true"
      metric_name                = "AWS-AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = "true"
    }
  }

  rule {
    name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
    priority = "1"

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = "true"
      metric_name                = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
      sampled_requests_enabled   = "true"
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = "true"
    metric_name                = "CloudResume-WebACL"
    sampled_requests_enabled   = "true"
  }
}

#  End Web Application Firewall Block  #
########################################


########################
# Begin DynamoDB Block #

resource "aws_dynamodb_table" "crc-visitor-count" {
  attribute {
    name = "id"
    type = "S"
  }

  billing_mode                = "PROVISIONED"
  deletion_protection_enabled = "true"
  hash_key                    = "id"
  name                        = "crc-visitor-count"

  point_in_time_recovery {
    enabled = "false"
  }

  read_capacity  = "1"
  stream_enabled = "false"
  table_class    = "STANDARD"
  
  write_capacity = "1"
}

resource "aws_dynamodb_table" "crc-visitor-record" {
  attribute {
    name = "id"
    type = "S"
  }

  billing_mode                = "PROVISIONED"
  deletion_protection_enabled = "true"
  hash_key                    = "id"
  name                        = "crc-visitor-record"

  point_in_time_recovery {
    enabled = "false"
  }

  read_capacity  = "1"
  stream_enabled = "false"
  table_class    = "STANDARD"

  ttl {
    attribute_name = "ttl"
    enabled        = "true"
  }

  write_capacity = "1"
}

#  End DynamoDB Block  #
########################


#####################
#  Begin SES Block  #

resource "random_string" "configuration_suffix" {
  length = 6
  special = false
  upper = false
}

resource "aws_ses_configuration_set" "crc-contact-mail" {
  depends_on = [
    var.acm-certificate-validation,
    var.r53-ses-verification-mx,
    var.r53-ses-verification-txt,
    aws_ses_domain_identity.crc-mail-domain,
    aws_ses_domain_mail_from.crc-mail-from-domain
  ]
  delivery_options {
    tls_policy = "Require"
  }

  name                       = "ContactFormConfiguration-${random_string.configuration_suffix.result}"
  reputation_metrics_enabled = "false"
  sending_enabled            = "true"

  tracking_options {
    custom_redirect_domain = "contact.${var.domain-name}"
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_ses_domain_identity" "crc-mail-domain" {
  domain = var.domain-name
}

resource "aws_ses_email_identity" "crc-mail-destination" {
  email = "a.bracken87+cloudresume_ses@gmail.com"
}

resource "aws_ses_domain_mail_from" "crc-mail-from-domain" {
  domain           = aws_ses_domain_identity.crc-mail-domain.domain
  mail_from_domain = "contact.${aws_ses_domain_identity.crc-mail-domain.domain}"
}

#  End SES Block  #
###################


###################
# Begin SQS Block #

resource "aws_sqs_queue" "crc-cloudfront-invalidation-queue" {
  content_based_deduplication       = "false"
  delay_seconds                     = "0"
  fifo_queue                        = "false"
  kms_data_key_reuse_period_seconds = "300"
  max_message_size                  = "262144"
  message_retention_seconds         = "345600"
  name                              = "CloudFrontInvalidationQueue"
  receive_wait_time_seconds         = "0"
  sqs_managed_sse_enabled           = "true"
  visibility_timeout_seconds        = "60"
}

resource "aws_sqs_queue_policy" "crc_cloudfront_invalidation_queue_policy" {
  queue_url = aws_sqs_queue.crc-cloudfront-invalidation-queue.id
  policy = jsonencode({
    "Id": "Policy1717464010087",
    "Statement": [
      {
        "Action": "SQS:SendMessage",
        "Condition": {
          "ArnLike": {
            "aws:SourceArn": [
              var.s3-bucket-production-arn,
              var.s3-bucket-staging-arn
            ]
          },
          "StringEquals": {
            "aws:SourceAccount": var.account_id
          }
        },
        "Effect": "Allow",
        "Principal": {
          "Service": "s3.amazonaws.com"
        },
        "Resource": data.aws_sqs_queue.crc_cloudfront_invalidation_queue.arn,
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
          "AWS": var.iam-role-cloudfront-manager-arn
        },
        "Resource": data.aws_sqs_queue.crc_cloudfront_invalidation_queue.arn,
        "Sid": "Stmt1717464008331"
      }
    ],
    "Version": "2012-10-17"
  })
}

#  End SQS Block  #
###################


######################
# Begin Lambda Block #

resource "aws_lambda_event_source_mapping" "crc-sqs-invalidation-queue" {
  batch_size                         = "15"
  bisect_batch_on_function_error     = "false"
  enabled                            = "true"
  event_source_arn                   = aws_sqs_queue.crc-cloudfront-invalidation-queue.arn
  function_name                      = aws_lambda_function.crc-cloudfrontInvalidation.arn
  function_response_types            = ["ReportBatchItemFailures"]
  maximum_batching_window_in_seconds = "5"
}

resource "aws_lambda_function_event_invoke_config" "crc-invoke-invalidation-queue" {
  function_name                = aws_lambda_function.crc-cloudfrontInvalidation.arn
  maximum_event_age_in_seconds = "3600"
  maximum_retry_attempts       = "2"
}

resource "aws_cloudwatch_log_group" "crc-cloudfrontInvalidation-log-group" {
  name              = "/aws/lambda/cloudfrontInvalidation"
  retention_in_days = 14
}

resource "aws_lambda_function" "crc-cloudfrontInvalidation" {
  architectures = ["x86_64"]

  environment {
    variables = {
      dev_bucket        = var.s3-bucket-staging-name
      dev_distribution  = var.cf-staging-distribution
      prod_bucket       = var.s3-bucket-production-name
      prod_distribution = var.cf-production-distribution
    }
  }

  ephemeral_storage {
    size = "512"
  }

  function_name = "cloudfrontInvalidation"
  handler       = "cloudfrontInvalidation.lambda_handler"

  logging_config {
    application_log_level = "INFO"
    log_format            = "JSON"
    log_group             = aws_cloudwatch_log_group.crc-cloudfrontInvalidation-log-group.name
    system_log_level      = "INFO"
  }

  memory_size                    = "128"
  package_type                   = "Zip"
  filename                       = data.archive_file.cloudfrontInvalidation_lambda_function_code.output_path
  source_code_hash               = data.archive_file.cloudfrontInvalidation_lambda_function_code.output_base64sha256
  reserved_concurrent_executions = "-1"
  role                           = var.iam-role-cloudfront-manager-arn
  runtime                        = "python3.12"
  skip_destroy                   = "false"
  timeout                        = "60"

  depends_on = [
    aws_cloudwatch_log_group.crc-cloudfrontInvalidation-log-group
  ]
}

resource "aws_cloudwatch_log_group" "crc-sendMessage-log-group" {
  name              = "/aws/lambda/sendMessage"
  retention_in_days = 14
}

resource "aws_lambda_function" "crc-sendMessage" {
  architectures = ["x86_64"]

  environment {
    variables = {
      mailRegion      = data.aws_region
      sendFromAddress = "noreply@${aws_ses_domain_identity.crc-mail-domain.domain}"
      sendToAddress   = aws_ses_email_identity.crc-mail-destination.email
    }
  }

  ephemeral_storage {
    size = "512"
  }

  function_name = "sendMessage"
  handler       = "sendMessage.lambda_handler"

  logging_config {
    application_log_level = "INFO"
    log_format            = "JSON"
    log_group             = aws_cloudwatch_log_group.crc-sendMessage-log-group.name
    system_log_level      = "INFO"
  }

  memory_size                    = "128"
  package_type                   = "Zip"
  filename                       = data.archive_file.sendMessage_lambda_function_code.output_path
  source_code_hash               = data.archive_file.sendMessage_lambda_function_code.output_base64sha256
  reserved_concurrent_executions = "-1"
  role                           = var.iam-role-message-sender-arn
  runtime                        = "python3.12"
  skip_destroy                   = "false"
  timeout                        = "3"

  depends_on = [
    aws_cloudwatch_log_group.crc-sendMessage-log-group
  ]
}

resource "aws_cloudwatch_log_group" "crc-trackVisitors-log-group" {
  name              = "/aws/lambda/trackVisitors"
  retention_in_days = 14
}

resource "aws_lambda_function" "crc-trackVisitors" {
  architectures = ["x86_64"]

  environment {
    variables = {
      countTableName  = aws_dynamodb_table.crc-visitor-count.id
      recordTableName = aws_dynamodb_table.crc-visitor-record.id
    }
  }

  ephemeral_storage {
    size = "512"
  }

  function_name = "trackVisitors"
  handler       = "trackVisitors.lambda_handler"

  logging_config {
    application_log_level = "INFO"
    log_format            = "JSON"
    log_group             = aws_cloudwatch_log_group.crc-trackVisitors-log-group.name
    system_log_level      = "INFO"
  }

  memory_size                    = "128"
  package_type                   = "Zip"
  filename                       = data.archive_file.trackvisitors_lambda_function_code.output_path
  source_code_hash               = data.archive_file.trackvisitors_lambda_function_code.output_base64sha256
  reserved_concurrent_executions = "-1"
  role                           = var.iam-role-visitor-tracker-arn
  runtime                        = "python3.12"
  skip_destroy                   = "false"
  timeout                        = "3"

  depends_on = [
  aws_cloudwatch_log_group.crc-trackVisitors-log-group
  ]
}

resource "aws_lambda_permission" "crc-event-permissions-s3-production" {
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.crc-cloudfrontInvalidation.function_name
  principal      = "s3.amazonaws.com"
  source_account = var.account_id
  source_arn     = var.s3-bucket-production-arn
  statement_id   = uuid()
}

resource "aws_lambda_permission" "crc-event-permissions-s3-staging" {
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.crc-cloudfrontInvalidation.function_name
  principal      = "s3.amazonaws.com"
  source_account = var.account_id
  source_arn     = var.s3-bucket-staging-arn
  statement_id   = uuid()
}

resource "aws_lambda_permission" "crc-event-permissions-api-visitors" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.crc-trackVisitors.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api-execution-arn}/*/GET/visitors"
  statement_id  = uuid()
}

resource "aws_lambda_permission" "crc-event-permissions-api-contact" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.crc-sendMessage.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api-execution-arn}/*/POST/contact"
  statement_id  = uuid()
}

#  End Lambda Block  #
######################

