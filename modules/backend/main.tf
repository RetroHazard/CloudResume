﻿#######################################
# Cloud Resume - Back End Components #
#######################################

terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.52.0"
    }
  }
}
