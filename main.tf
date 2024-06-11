terraform {
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
  region = "ap-northeast-1"
  default_tags {
    tags = var.tags
  }
}

variable "tags" {
  type = map(string)
  description = "Default Tags, applied to all resources"
  default = {
    ManagedByTerraform = true
  }
}

variable "domain-name" {
  type = string
  default = "cloudresume-agb.jp"
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
  }

module "backend" {
  source = "./modules/backend"

  account_id  = data.aws_caller_identity.current.account_id
  caller_arn  = data.aws_caller_identity.current.arn
  caller_user = data.aws_caller_identity.current.user_id

  domain-name = var.domain-name
  
  iam-role-cloudfront-manager-arn = module.iam.aws_iam_role_crc-CloudResume_CloudFrontManager_arn
  iam-role-message-sender-arn = module.iam.aws_iam_role_crc-CloudResume_SendMessage_arn
  iam-role-visitor-tracker-arn = module.iam.aws_iam_role_crc-CloudResume_TrackVisitors_arn
  
  s3-bucket-production-arn = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn
  s3-bucket-staging-arn = module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_arn
  api-resource-send-message = module.frontend.aws_api_gateway_resource_crc-api-resource-contact_id
  api-resource-track-visitors = module.frontend.aws_api_gateway_resource_crc-api-resource-visitors_id
}