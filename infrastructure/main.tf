module "iam_github_oidc_provider" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-provider"
  version = "~> 5.0"
}

module "iam_github_s3_oidc_role" {
  source   = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-role"
  version  = "~> 5.0"
  subjects = ["${var.default_tags.GithubOrg}/${var.default_tags.GithubRepo}:*"]
  policies = {
    S3Limited = module.iam.aws_iam_policy_document_crc-github-s3-actions_arn
  }
  path = "/CloudResume/"
  name = "crc-github-s3-oidc-role"
}

module "iam_github_tf_oidc_role" {
  source   = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-role"
  version  = "~> 5.0"
  subjects = ["${var.default_tags.GithubOrg}/${var.default_tags.GithubRepo}:*"]
  policies = {
    LimitedIAM   = module.iam.aws_iam_policy_document_crc-github-terraform-limited-iam_arn,
    AWSPowerUser = "arn:aws:iam::aws:policy/PowerUserAccess"
  }
  path = "/CloudResume/"
  name = "crc-github-tf-oidc-role"
}

module "iam" {
  source = "./modules/iam"

  account_id = data.aws_caller_identity.current.account_id

  crc-s3-production-arn          = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn
  crc-cf-production-distribution = module.frontend.aws_cloudfront_distribution_crc-cf-production-distribution_arn

  crc-visitor-record_arn                         = module.backend.aws_dynamodb_table_crc-visitor-record_arn
  crc-visitor-count_arn                          = module.backend.aws_dynamodb_table_crc-visitor-count_arn
  crc-download-record_arn                        = module.backend.aws_dynamodb_table_crc-download-record_arn
  crc-cw-lambda-log-group-cloudfrontInvalidation = module.backend.aws_cloudwatch_log_group_crc-cloudfrontInvalidation_arn
  crc-cw-lambda-log-group-sendMessage            = module.backend.aws_cloudwatch_log_group_crc-sendMessage_arn
  crc-cw-lambda-log-group-trackVisitors          = module.backend.aws_cloudwatch_log_group_crc-trackVisitors_arn
  crc-cw-lambda-log-group-updateContributions    = module.backend.aws_cloudwatch_log_group_crc-updateContributions_arn
  crc-cw-lambda-log-group-downloadResume         = module.backend.aws_cloudwatch_log_group_crc-downloadResume_arn
  crc-cf-signing-key-parameter-name              = var.cloudfront_signing_key_parameter
  crc-contribution-object-key                    = var.contribution_object_key
  crc-ses-configuration-set                      = module.backend.aws_ses_configuration_set_crc-contact-mail_arn
  crc-ses-mail-destination                       = module.backend.aws_ses_email_identity_crc-mail-destination_arn
  crc-ses-mail-domain                            = module.backend.aws_ses_domain_identity_crc-mail-domain_arn
}

module "frontend" {
  source = "./modules/frontend"

  account_id = data.aws_caller_identity.current.account_id

  domain-name           = var.domain_name
  waf-enabled           = var.waf_enabled
  sanitized-domain-name = var.sanitized_domain_name
  api-current-stage     = var.api_current_stage

  api-gateway-cw-logs-role = module.iam.aws_iam_role_crc-api-CloudwatchLogs_arn

  waf-acl-arn               = module.backend.aws_wafv2_web_acl_crc-web-acl_arn
  api-lambda-contact-uri    = module.backend.aws_lambda_function_crc-sendMessage_uri
  api-lambda-visitors-uri   = module.backend.aws_lambda_function_crc-trackVisitors_uri
  api-lambda-download-uri   = module.backend.aws_lambda_function_crc-downloadResume_uri
  ses-mail-from-domain      = module.backend.aws_ses_domain_mail_from_crc-mail-from-domain
  sqs-cf-invalidation-queue = module.backend.aws_sqs_queue_crc-cloudfront-invalidation-queue_arn

  signed-downloads-enabled             = var.signed_downloads_enabled
  cf-signing-public-key-parameter-name = var.cloudfront_signing_public_key_parameter

  api-throttle-rate-limit           = var.api_throttle_rate_limit
  api-throttle-burst-limit          = var.api_throttle_burst_limit
  api-throttle-download-rate-limit  = var.api_throttle_download_rate_limit
  api-throttle-download-burst-limit = var.api_throttle_download_burst_limit
}

module "backend" {
  source = "./modules/backend"

  account_id = data.aws_caller_identity.current.account_id

  domain-name = var.domain_name
  waf-enabled = var.waf_enabled

  iam-role-cloudfront-manager-arn   = module.iam.aws_iam_role_crc-CloudFrontManager_arn
  iam-role-message-sender-arn       = module.iam.aws_iam_role_crc-MessageSender_arn
  iam-role-visitor-tracker-arn      = module.iam.aws_iam_role_crc-VisitorTracker_arn
  iam-role-contribution-tracker-arn = module.iam.aws_iam_role_crc-ContributionTracker_arn
  iam-role-download-issuer-arn      = module.iam.aws_iam_role_crc-DownloadIssuer_arn

  cf-signing-key-pair-id        = module.frontend.aws_cloudfront_public_key_crc-cf-signing-key_id
  cf-signing-key-parameter-name = var.cloudfront_signing_key_parameter
  resume-object-key             = var.resume_object_key
  signed-url-ttl-seconds        = var.signed_url_ttl_seconds

  contribution-accounts         = var.contribution_accounts
  contribution-object-key       = var.contribution_object_key
  contribution-refresh-schedule = var.contribution_refresh_schedule

  acm-certificate-validation  = module.frontend.aws_acm_certificate_validation_crc-website-certificate-validation
  api-execution-arn           = module.frontend.aws_api_gateway_rest_api_crc-rest-api_exec-arn
  api-resource-send-message   = module.frontend.aws_api_gateway_resource_crc-api-resource-contact_id
  api-resource-track-visitors = module.frontend.aws_api_gateway_resource_crc-api-resource-visitors_id
  cf-production-distribution  = module.frontend.aws_cloudfront_distribution_crc-cf-production-distribution_id
  s3-bucket-production-arn    = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn
  s3-bucket-production-name   = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_id
  r53-ses-verification-mx     = module.frontend.aws_route53_record_crc-ses-verification-record_MX
  r53-ses-verification-txt    = module.frontend.aws_route53_record_crc-ses-verification-record_TXT
}

module "github" {
  source = "./modules/github"

  crc-s3-bucket-prod  = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_id
  crc-api-endpoint    = module.frontend.aws_api_gateway_crc-api-endpoint_fqdn
  crc-s3-oidc-role    = module.iam_github_s3_oidc_role.arn
  crc-tf-oidc-role    = module.iam_github_tf_oidc_role.arn
  github-token        = var.github_token
  github-organization = var.default_tags.GithubOrg
  github-repository   = var.default_tags.GithubRepo
}
