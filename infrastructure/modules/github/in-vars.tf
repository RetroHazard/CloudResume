variable "github-organization" {
  description = "GitHub User/Organization to Operate as"
  type        = string
}

variable "github-repository" {
  description = "GitHub Repository to store Secrets/Variables in"
  type        = string
}

variable "crc-s3-bucket-prod" {
  description = "S3 Bucket for Production Website"
  type        = string
}

variable "crc-api-endpoint" {
  description = "API Gateway Endpoint (FQDN + Stage)"
  type        = string
}

variable "crc-s3-oidc-role" {
  description = "Role created by OIDC Module for GitHub to Assume"
  type        = string
  sensitive   = true
}

variable "crc-tf-oidc-role" {
  description = "Role create by OIDC Module for Terraform to Assume"
  type        = string
  sensitive   = true
}

variable "github-token" {
  description = "Token provided by GitHub Runner to Authenticate GitHub Operations"
  type        = string
  sensitive   = true
}
