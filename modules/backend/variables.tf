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

variable "domain-name" {
  type = string
}

# Inputs from IAM

variable "iam-role-cloudfront-manager-arn" {
  type = string
}

variable "iam-role-visitor-tracker-arn" {
  type = string
}

variable "iam-role-message-sender-arn" {
  type = string
}

# Inputs from Frontend Module

variable "s3-bucket-production-arn" {
  type = string
}

variable "s3-bucket-staging-arn" {
  type = string
}