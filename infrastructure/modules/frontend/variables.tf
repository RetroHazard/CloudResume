data "aws_region" "current" {}

variable "account_id" {
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

variable "api-lambda-download-uri" {
  type = string
}

variable "ses-mail-from-domain" {
  type = string
}

variable "sqs-cf-invalidation-queue" {
  type = string
}

variable "waf-enabled" {
  type = bool
}

variable "signed-downloads-enabled" {
  type = bool
}

# API Throttling

variable "api-throttle-rate-limit" {
  type = number
}

variable "api-throttle-burst-limit" {
  type = number
}

variable "api-throttle-download-rate-limit" {
  type = number
}

variable "api-throttle-download-burst-limit" {
  type = number
}