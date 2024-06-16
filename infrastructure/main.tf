import {
  to = module.frontend.aws_route53_zone.crc-hosted-zone
  id = var.hosted_zone_id
}

module "iam" {
  source = "./modules/iam"
  
  crc-s3-production-arn                           = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn
  crc-s3-staging-arn                              = module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_arn
  crc-cf-production-distribution                  = module.frontend.aws_cloudfront_distribution_crc-cf-production-distribution_arn
  crc-cf-staging-distribution                     = module.frontend.aws_cloudfront_distribution_crc-cf-staging-distribution_arn

  crc-visitor-record_arn                          = module.backend.aws_dynamodb_table_crc-visitor-record_arn
  crc-visitor-count_arn                           = module.backend.aws_dynamodb_table_crc-visitor-count_arn
  crc-cw-lambda-log-group-cloudfrontInvalidation  = module.backend.aws_cloudwatch_log_group_crc-cloudfrontInvalidation_arn
  crc-cw-lambda-log-group-sendMessage             = module.backend.aws_cloudwatch_log_group_crc-sendMessage_arn
  crc-cw-lambda-log-group-trackVisitors           = module.backend.aws_cloudwatch_log_group_crc-trackVisitors_arn
  crc-ses-configuration-set                       = module.backend.aws_ses_configuration_set_crc-contact-mail_arn
  crc-ses-mail-destination                        = module.backend.aws_ses_email_identity_crc-mail-destination_arn
  crc-ses-mail-domain                             = module.backend.aws_ses_domain_identity_crc-mail-domain_arn
}

module "frontend" {
  source = "./modules/frontend"

  account_id                = data.aws_caller_identity.current.account_id
  
  domain-name               = var.domain_name
  sanitized-domain-name     = var.sanitized_domain_name
  api-current-stage         = var.api_current_stage
  
  api-gateway-cw-logs-role  = module.iam.aws_iam_role_crc-api-CloudwatchLogs_arn
  
  waf-acl-arn               = module.backend.aws_wafv2_web_acl_crc-web-acl_arn
  api-lambda-contact-uri    = module.backend.aws_lambda_function_crc-sendMessage_uri
  api-lambda-visitors-uri   = module.backend.aws_lambda_function_crc-trackVisitors_uri
  ses-mail-from-domain      = module.backend.aws_ses_domain_mail_from_crc-mail-from-domain
  sqs-cf-invalidation-queue = module.backend.aws_sqs_queue_crc-cloudfront-invalidation-queue_arn
}

module "backend" {
  source = "./modules/backend"

  account_id                      = data.aws_caller_identity.current.account_id

  domain-name                     = var.domain_name
  
  iam-role-cloudfront-manager-arn = module.iam.aws_iam_role_crc-CloudFrontManager_arn
  iam-role-message-sender-arn     = module.iam.aws_iam_role_crc-MessageSender_arn
  iam-role-visitor-tracker-arn    = module.iam.aws_iam_role_crc-VisitorTracker_arn

  acm-certificate-validation      = module.frontend.aws_acm_certificate_validation_crc-website-certificate-validation
  api-execution-arn               = module.frontend.aws_api_gateway_rest_api_crc-rest-api_exec-arn
  api-resource-send-message       = module.frontend.aws_api_gateway_resource_crc-api-resource-contact_id
  api-resource-track-visitors     = module.frontend.aws_api_gateway_resource_crc-api-resource-visitors_id
  cf-production-distribution      = module.frontend.aws_cloudfront_distribution_crc-cf-production-distribution_id
  cf-staging-distribution         = module.frontend.aws_cloudfront_distribution_crc-cf-staging-distribution_id
  s3-bucket-production-arn        = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn
  s3-bucket-production-name       = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_id
  s3-bucket-staging-arn           = module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_arn
  s3-bucket-staging-name          = module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_id
  r53-ses-verification-mx         = module.frontend.aws_route53_record_crc-ses-verification-record_MX
  r53-ses-verification-txt        = module.frontend.aws_route53_record_crc-ses-verification-record_TXT
}

module "github" {
  source = "./modules/github"

  crc-iam-github-access-key        = module.iam.aws_iam_access_key_crc-iam-github-key_key-id
  crc-iam-github-secret-access-key = module.iam.aws_iam_access_key_crc-iam-github-key_secret-key
  crc-s3-bucket-prod               = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_id
  crc-s3-bucket-stage              = module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_id
  crc-api-endpoint                 = module.frontend.aws_api_gateway_crc-api-endpoint_fqdn
  github-token                     = var.github_token
}