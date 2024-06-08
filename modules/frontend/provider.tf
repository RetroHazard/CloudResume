provider "aws" {
  region = "ap-northeast-1"
}

terraform {
	required_providers {
		aws = {
			source = "hashicorp/aws"
			version = "~> 5.52.0"
		}
  }
}
