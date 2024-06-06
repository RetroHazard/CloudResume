provider "aws" {}

terraform {
	required_providers {
		aws = {
	    version = "~> 5.52.0"
		}
  }
}
