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

variable "crc-cf-production-distribution" {
  type = string
}

variable "crc-cf-staging-distribution" {
  type = string
}

variable "crc-cw-lambda-log-group-cloudfrontInvalidation" {
  type = string
}

variable "crc-cw-lambda-log-group-sendMessage" {
  type = string
}

variable "crc-cw-lambda-log-group-trackVisitors" {
  type = string
}

variable "crc-ses-configuration-set" {
  type = string
}

variable "crc-ses-mail-domain" {
  type = string
}

variable "crc-ses-mail-destination" {
  type = string
}