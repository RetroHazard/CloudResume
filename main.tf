terraform {
  backend "s3" {
    bucket = "crc-agb-s3-terraform-state-ugyhqu"
    key = "aws-services1.tfstate"
    dynamodb_table = "terraform-locks"
    region = "us-east-1"
    encrypt = true
    profile = "Sandbox"
  }
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.52.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  profile = "Sandbox"
  assume_role {
    role_arn = var.assume_role
  }
  default_tags {
    tags = var.tags
  }
}

module "iam" {
  source = "./modules/iam"

  account_id  = data.aws_caller_identity.current.account_id
  caller_arn  = data.aws_caller_identity.current.arn
  caller_user = data.aws_caller_identity.current.user_id

  crc-visitor-record_arn = module.backend.aws_dynamodb_table_crc-visitor-record_arn
  crc-visitor-count_arn = module.backend.aws_dynamodb_table_crc-visitor-count_arn

  crc-s3-production-arn = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn
  crc-s3-staging-arn = module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_arn

  crc-cf-production-distribution = module.frontend.aws_cloudfront_distribution_crc-cf-production-distribution_id
  crc-cf-staging-distribution = module.frontend.aws_cloudfront_distribution_crc-cf-staging-distribution_id

  crc-cw-lambda-log-group-cloudfrontInvalidation = module.backend.aws_cloudwatch_log_group_crc-cloudfrontInvalidation_arn
  crc-cw-lambda-log-group-sendMessage            = module.backend.aws_cloudwatch_log_group_crc-sendMessage_arn
  crc-cw-lambda-log-group-trackVisitors          = module.backend.aws_cloudwatch_log_group_crc-trackVisitors_arn

  crc-ses-configuration-set = module.backend.aws_ses_configuration_set_crc-contact-mail_arn
  crc-ses-mail-destination  = module.backend.aws_ses_email_identity_crc-mail-destination_arn
  crc-ses-mail-domain       = module.backend.aws_ses_domain_identity_crc-mail-domain_arn
}

module "frontend" {
  source = "./modules/frontend"

  account_id  = data.aws_caller_identity.current.account_id
  caller_arn  = data.aws_caller_identity.current.arn
  caller_user = data.aws_caller_identity.current.user_id
  
  domain-name = var.domain-name
  
  waf-acl-arn = module.backend.aws_wafv2_web_acl_crc-web-acl_arn
  
  api-lambda-contact-uri = module.backend.aws_lambda_function_crc-sendMessage_uri
  api-lambda-visitors-uri = module.backend.aws_lambda_function_crc-trackVisitors_uri

  api-gateway-cw-logs-role = module.iam.aws_iam_role_crc-api-CloudwatchLogs_arn
}

module "backend" {
  source = "./modules/backend"

  account_id  = data.aws_caller_identity.current.account_id
  caller_arn  = data.aws_caller_identity.current.arn
  caller_user = data.aws_caller_identity.current.user_id

  domain-name = var.domain-name
  
  iam-role-cloudfront-manager-arn = module.iam.aws_iam_role_crc-CloudFrontManager_arn
  iam-role-message-sender-arn = module.iam.aws_iam_role_crc-MessageSender_arn
  iam-role-visitor-tracker-arn = module.iam.aws_iam_role_crc-VisitorTracker_arn

  s3-bucket-production-arn = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn
  s3-bucket-production-name = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_id
  s3-bucket-staging-arn = module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_arn
  s3-bucket-staging-name = module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_id
  api-resource-send-message = module.frontend.aws_api_gateway_resource_crc-api-resource-contact_id
  api-resource-track-visitors = module.frontend.aws_api_gateway_resource_crc-api-resource-visitors_id
  cf-production-distribution = module.frontend.aws_cloudfront_distribution_crc-cf-production-distribution_id
  cf-staging-distribution = module.frontend.aws_cloudfront_distribution_crc-cf-staging-distribution_id
  api-execution-arn = module.frontend.aws_api_gateway_rest_api_crc-rest-api_exec-arn
}