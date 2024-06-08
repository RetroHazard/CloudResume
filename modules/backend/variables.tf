data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

variable "account_id" {
  type = string
}

variable "caller_arn" {
  type = string
}

variable "caller_user" {
  type = string
}

# Inputs from IAM



# Inputs from Backend Module