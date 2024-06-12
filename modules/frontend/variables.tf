data "aws_region" "current" {}

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

variable "sanitized-domain-name" {
  type = string
}

variable "api-current-stage" {
  type = string
}

# Inputs from IAM

variable "api-gateway-cw-logs-role" {
  type = string
}

# Inputs from Backend Module

variable "waf-acl-arn" {
  type = string
}

variable "api-lambda-visitors-uri" {
  type = string
}

variable "api-lambda-contact-uri" {
  type = string
}

variable "ses-mail-from-domain" {
  type = string
}

variable "sqs-cf-invalidation-queue" {
  type = string
}