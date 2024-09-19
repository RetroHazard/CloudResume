data "aws_region" "current" {}

variable "account_id" {
  type = string
}

variable "domain-name" {
  type = string
}

variable "waf-enabled" {
  type = bool
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

variable "s3-bucket-production-name" {
  type = string
}

variable "api-resource-track-visitors" {
  type = string
}

variable "api-resource-send-message" {
  type = string
}

variable "cf-production-distribution" {
  type = string
}

variable "api-execution-arn" {
  type = string
}

variable "r53-ses-verification-txt" {
  type = string
}

variable "r53-ses-verification-mx" {
  type = string
}

variable "acm-certificate-validation" {
  type = string
}