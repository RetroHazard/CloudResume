terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.52.0"
      configuration_aliases = [aws.ap-northeast-1,aws.us-east-1,aws.global]
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
  alias = "ap-northeast-1"
  default_tags {
    tags = var.tags
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
  default_tags {
    tags = var.tags
  }
}

provider "aws" {
  region = ""
  alias  = "global"
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


# Begin Modules for ap-northeast-1
module "ap-northeast-1_api_gateway" {
  source = "./modules/region/ap-northeast-1/api_gateway"
}

module "ap-northeast-1_dynamodb" {
  source = "./modules/region/ap-northeast-1/dynamodb"
}

module "ap-northeast-1_lambda" {
  source = "./modules/region/ap-northeast-1/lambda"
}

module "ap-northeast-1_s3" {
  source = "./modules/region/ap-northeast-1/s3"
}

module "ap-northeast-1_ses" {
  source = "./modules/region/ap-northeast-1/ses"
}

module "ap-northeast-1_sqs" {
  source = "./modules/region/ap-northeast-1/sqs"
}

# Begin Modules for us-east-1
module "us-east-1_acm" {
  source = "./modules/region/us-east-1/acm"
}

module "us-east-1_kms" {
  source = "./modules/region/us-east-1/kms"
}

module "us-east-1_wafv2_cloudfront" {
  source = "./modules/region/us-east-1/wafv2_cloudfront"
}

# Begin Modules for Global Zone
module "global_cloudfront" {
  source = "./modules/region/global/cloudfront"
}

module "global_iam" {
  source = "./modules/region/global/iam"
}

module "global_route53" {
  source = "./modules/region/global/route53"
}