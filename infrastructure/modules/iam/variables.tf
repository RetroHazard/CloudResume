data "aws_region" "current" {}

variable "account_id" {
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

variable "crc-cf-production-distribution" {
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

variable "crc-cw-lambda-log-group-updateContributions" {
  type = string
}

variable "crc-cw-lambda-log-group-downloadResume" {
  type = string
}

variable "crc-download-record_arn" {
  type = string
}

variable "crc-cf-signing-key-parameter-name" {
  type = string
}

variable "crc-contribution-object-key" {
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