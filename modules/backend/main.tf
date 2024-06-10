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

resource "aws_ses_configuration_set" "crc-contact-mail" {
  delivery_options {
    tls_policy = "Require"
  }

  name                       = "ContactFormMailer"
  reputation_metrics_enabled = "false"
  sending_enabled            = "true"

  tracking_options {
    custom_redirect_domain = "contact.${var.domain-name}"
  }
}

resource "aws_ses_domain_identity" "crc-mail-domain" {
  domain = var.domain-name
}

resource "aws_ses_email_identity" "crc-mail-destination" {
  email = "a.bracken87+cloudresume_ses@gmail.com"
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
  policy = <<POLICY
{
  "Id": "Policy1717464010087",
  "Statement": [
    {
      "Action": "SQS:SendMessage",
      "Condition": {
        "ArnLike": {
          "aws:SourceArn": [
            "${var.s3-bucket-production-arn}",
            "${var.s3-bucket-staging-arn}"
          ]
        },
        "StringEquals": {
          "aws:SourceAccount": "${var.account_id}"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Service": "s3.amazonaws.com"
      },
      "Resource": "${aws_sqs_queue.crc-cloudfront-invalidation-queue.arn}",
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
        "AWS": "${var.iam-role-cloudfront-manager-arn}"
      },
      "Resource": "${aws_sqs_queue.crc-cloudfront-invalidation-queue.arn}",
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
  maximum_retry_attempts             = "0"
  tumbling_window_in_seconds         = "0"
}

resource "aws_lambda_function_event_invoke_config" "crc-invoke-invalidation-queue" {
  function_name                = aws_lambda_function.crc-cloudfrontInvalidation.arn
  maximum_event_age_in_seconds = "3600"
  maximum_retry_attempts       = "2"
}

resource "aws_lambda_function" "crc-cloudfrontInvalidation" {
  architectures = ["x86_64"]

  environment {
    variables = {
      //todo get buckets and distributions from frontend module
      dev_bucket        = "agb-s3-cloudresumechallenge-staging"
      dev_distribution  = "E37NSQHT5FF2XS"
      prod_bucket       = "agb-s3-cloudresumechallenge-hosted"
      prod_distribution = "ESAPTUQ4RL7CE"
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
    log_group             = "/aws/lambda/${aws_lambda_function.crc-cloudfrontInvalidation.function_name}"
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
}

resource "aws_lambda_function" "crc-sendMessage" {
  architectures = ["x86_64"]

  environment {
    variables = {
      //todo get variables from ses module
      mailRegion      = "ap-northeast-1"
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
    log_group             = "/aws/lambda/${aws_lambda_function.crc-sendMessage.function_name}"
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
    log_group             = "/aws/lambda/${aws_lambda_function.crc-trackVisitors.function_name}"
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
}

resource "aws_lambda_permission" "crc-event-permissions-s3-production" {
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.crc-cloudfrontInvalidation.function_name
  principal      = "s3.amazonaws.com"
  source_account = var.account_id
  source_arn     = var.s3-bucket-production-arn
  statement_id   = aws_lambda_permission.crc-event-permissions-s3-production.statement_id
}

resource "aws_lambda_permission" "crc-event-permissions-s3-staging" {
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.crc-cloudfrontInvalidation.function_name
  principal      = "s3.amazonaws.com"
  source_account = var.account_id
  source_arn     = var.s3-bucket-staging-arn
  statement_id   = aws_lambda_permission.crc-event-permissions-s3-staging.statement_id
}

resource "aws_lambda_permission" "crc-event-permissions-api-visitors" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.crc-trackVisitors.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:ap-northeast-1:339712851438:3nfq1o8esj/*/GET/visitors"
  //todo get api info from frontend
  statement_id  = aws_lambda_permission.crc-event-permissions-api-visitors.statement_id
}

resource "aws_lambda_permission" "crc-event-permissions-api-contact" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.crc-sendMessage.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:ap-northeast-1:339712851438:3nfq1o8esj/*/POST/contact"
  //todo get api info from frontend
  statement_id  = aws_lambda_permission.crc-event-permissions-api-contact.statement_id
}

#  End Lambda Block  #
######################

