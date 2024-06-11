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


variable "crc-visitor-record_arn" {
  type = string
}

variable "crc-visitor-count_arn" {
  type = string
}

variable "crc-s3-production-arn" {
  type = string
}

variable "crc-s3-staging-arn" {
  type = string
}