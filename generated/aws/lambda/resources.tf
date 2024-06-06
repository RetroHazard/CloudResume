resource "aws_lambda_event_source_mapping" "tfer--9b7783a0-1f0a-408d-8d07-62e509bfb852" {
  batch_size                         = "15"
  bisect_batch_on_function_error     = "false"
  enabled                            = "true"
  event_source_arn                   = "arn:aws:sqs:ap-northeast-1:339712851438:CloudFrontInvalidationQueue"
  function_name                      = "arn:aws:lambda:ap-northeast-1:339712851438:function:cloudfrontInvalidation"
  function_response_types            = ["ReportBatchItemFailures"]
  maximum_batching_window_in_seconds = "5"
  maximum_record_age_in_seconds      = "0"
  maximum_retry_attempts             = "0"
  parallelization_factor             = "0"
  tumbling_window_in_seconds         = "0"
}

resource "aws_lambda_function" "tfer--cloudfrontInvalidation" {
  architectures = ["x86_64"]

  environment {
    variables = {
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
  handler       = "lambda_function.lambda_handler"
  layers        = ["arn:aws:lambda:ap-northeast-1:580247275435:layer:LambdaInsightsExtension:79"]

  logging_config {
    application_log_level = "INFO"
    log_format            = "JSON"
    log_group             = "/aws/lambda/cloudfrontInvalidation"
    system_log_level      = "INFO"
  }

  memory_size                    = "128"
  package_type                   = "Zip"
  filename                       = data.archive_file.cloudfrontInvalidation_lambda_function.output_path
  source_code_hash               = data.archive_file.cloudfrontInvalidation_lambda_function.output_base64sha256
  reserved_concurrent_executions = "-1"
  role                           = "arn:aws:iam::339712851438:role/service-role/CloudResume_CloudFrontManager"
  runtime                        = "python3.12"
  skip_destroy                   = "false"
  timeout                        = "60"

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "tfer--sendMessage" {
  architectures = ["x86_64"]

  environment {
    variables = {
      mailRegion      = "ap-northeast-1"
      sendFromAddress = "noreply@cloudresume-agb.jp"
      sendToAddress   = "a.bracken87+cloudresume_ses@gmail.com"
    }
  }

  ephemeral_storage {
    size = "512"
  }

  function_name = "sendMessage"
  handler       = "lambda_function.lambda_handler"
  layers        = ["arn:aws:lambda:ap-northeast-1:580247275435:layer:LambdaInsightsExtension:79"]

  logging_config {
    application_log_level = "INFO"
    log_format            = "JSON"
    log_group             = "/aws/lambda/sendMessage"
    system_log_level      = "INFO"
  }

  memory_size                    = "128"
  package_type                   = "Zip"
  filename                       = data.archive_file.sendMessage_lambda_function.output_path
  source_code_hash               = data.archive_file.sendMessage_lambda_function.output_base64sha256
  reserved_concurrent_executions = "-1"
  role                           = "arn:aws:iam::339712851438:role/CloudResume_SendMessage"
  runtime                        = "python3.12"
  skip_destroy                   = "false"
  timeout                        = "3"

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "tfer--trackVisitors" {
  architectures = ["x86_64"]

  environment {
    variables = {
      countTableName  = "crc-visitor-count"
      recordTableName = "crc-visitor-record"
    }
  }

  ephemeral_storage {
    size = "512"
  }

  function_name = "trackVisitors"
  handler       = "lambda_function.lambda_handler"
  layers        = ["arn:aws:lambda:ap-northeast-1:580247275435:layer:LambdaInsightsExtension:79"]

  logging_config {
    application_log_level = "INFO"
    log_format            = "JSON"
    log_group             = "/aws/lambda/trackVisitors"
    system_log_level      = "INFO"
  }

  memory_size                    = "128"
  package_type                   = "Zip"
  filename                       = data.archive_file.trackvisitors_lambda_function.output_path
  source_code_hash               = data.archive_file.trackvisitors_lambda_function.output_base64sha256
  reserved_concurrent_executions = "-1"
  role                           = "arn:aws:iam::339712851438:role/CloudResume_TrackVisitors"
  runtime                        = "python3.12"
  skip_destroy                   = "false"
  timeout                        = "3"

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function_event_invoke_config" "tfer--feic_arn-003A-aws-003A-lambda-003A-ap-northeast-1-003A-339712851438-003A-function-003A-cloudfrontInvalidation-003A--0024-LATEST" {
  function_name                = "arn:aws:lambda:ap-northeast-1:339712851438:function:cloudfrontInvalidation"
  maximum_event_age_in_seconds = "3600"
  maximum_retry_attempts       = "2"
}

resource "aws_lambda_permission" "tfer--339712851438_event_permissions_from_agb-s3-cloudresumechallenge-hosted_for_cloudfrontInvalidation" {
  action         = "lambda:InvokeFunction"
  function_name  = "arn:aws:lambda:ap-northeast-1:339712851438:function:cloudfrontInvalidation"
  principal      = "s3.amazonaws.com"
  source_account = "339712851438"
  source_arn     = "arn:aws:s3:::agb-s3-cloudresumechallenge-hosted"
  statement_id   = "339712851438_event_permissions_from_agb-s3-cloudresumechallenge-hosted_for_cloudfrontInvalidation"
}

resource "aws_lambda_permission" "tfer--339712851438_event_permissions_from_agb-s3-cloudresumechallenge-staging_for_cloudfrontInvalidation" {
  action         = "lambda:InvokeFunction"
  function_name  = "arn:aws:lambda:ap-northeast-1:339712851438:function:cloudfrontInvalidation"
  principal      = "s3.amazonaws.com"
  source_account = "339712851438"
  source_arn     = "arn:aws:s3:::agb-s3-cloudresumechallenge-staging"
  statement_id   = "339712851438_event_permissions_from_agb-s3-cloudresumechallenge-staging_for_cloudfrontInvalidation"
}

resource "aws_lambda_permission" "tfer--6a15043e-cdf0-5fe5-9f60-2b632783e360" {
  action        = "lambda:InvokeFunction"
  function_name = "arn:aws:lambda:ap-northeast-1:339712851438:function:trackVisitors"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:ap-northeast-1:339712851438:3nfq1o8esj/*/GET/visitors"
  statement_id  = "6a15043e-cdf0-5fe5-9f60-2b632783e360"
}

resource "aws_lambda_permission" "tfer--7fc9f8bc-795a-5281-8993-9ef519d4b046" {
  action        = "lambda:InvokeFunction"
  function_name = "arn:aws:lambda:ap-northeast-1:339712851438:function:sendMessage"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:ap-northeast-1:339712851438:3nfq1o8esj/*/POST/contact"
  statement_id  = "7fc9f8bc-795a-5281-8993-9ef519d4b046"
}
