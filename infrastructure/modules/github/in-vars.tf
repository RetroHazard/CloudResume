variable "crc-iam-github-access-key" {
  description = "Access Key ID for GitHub S3 User"
  type        = string
  sensitive   = true
}

variable "crc-iam-github-secret-access-key" {
  description = "Secret Access Key for GitHub S3 User"
  type        = string
  sensitive   = true
}

variable "crc-s3-bucket-prod" {
  description = "S3 Bucket for Production Website"
  type        = string
}

variable "crc-api-endpoint" {
  description = "API Gateway Endpoint (FQDN + Stage)"
  type        = string
}

variable "github-token" {
  description = "Token provided by GitHub Runner to Authenticate GitHub Operations"
  type        = string
  sensitive   = true
}