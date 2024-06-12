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
  region = "us-east-1"
  profile = "Sandbox"
  assume_role {
    role_arn = var.assume_role
  }
  default_tags {
    tags = var.tags
  }
}