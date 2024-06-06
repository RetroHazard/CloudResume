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
  alias  = "global"
  default_tags {
    tags = var.tags
  }
}


module "ap-northeast-1" {
  source = "./modules/region/ap-northeast-1"
}

module "us-east-1" {
  source = "./modules/region/us-east-1"
}

module "global" {
  source = "./modules/region/global"
}

variable "tags" {
  type = map(string)
  description = "Default Tages, applied to all resources"
  default = {
    ManagedByTerraform = true
  }
}
