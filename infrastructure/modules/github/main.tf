variable "github-repository" {
  description = "GitHub Repository to store Secrets and Variables in"
  type        = string
  default     = "CloudResume"
}

resource "github_actions_secret" "aws-s3-key" {
  repository      = var.github-repository
  secret_name     = "AWS_S3_ACCESS_KEY"
  plaintext_value = var.crc-iam-github-access-key
}

resource "github_actions_secret" "aws-s3-secret" {
  repository      = var.github-repository
  secret_name     = "AWS_S3_SECRET_ACCESS_KEY"
  plaintext_value = var.crc-iam-github-secret-access-key
}

resource "github_actions_secret" "aws-s3-bucket-prod" {
  repository      = var.github-repository
  secret_name     = "AWS_S3_BUCKET_PROD"
  plaintext_value = var.crc-s3-bucket-prod
}

resource "github_actions_secret" "aws-api-endpoint" {
  repository      = var.github-repository
  secret_name     = "AWS_API_ENDPOINT"
  plaintext_value = var.crc-api-endpoint
}