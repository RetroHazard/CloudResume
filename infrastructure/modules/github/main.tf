variable "github-repository" {
  description = "GitHub Repository to store Secrets/Variables in"
  type        = string
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

resource "github_actions_secret" "aws-s3-oidc-role" {
  repository      = var.github-repository
  secret_name     = "AWS_S3_OIDC_ROLE"
  plaintext_value = var.crc-s3-oidc-role
}