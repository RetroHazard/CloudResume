terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
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
  region      = var.deployment-region
  profile     = var.aws-profile
  access_key  = var.aws-access-key
  secret_key  = var.aws-secret-access-key
  assume_role {
    role_arn  = var.assume_role
  }
  default_tags {
    tags      = var.tags
  }
}