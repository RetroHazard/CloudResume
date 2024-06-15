variable "github_repository" {
  description = "GitHub Repository to store Secrets and Variables in"
  type = string
  default = "RetroHazard/CloudResume"
}

resource "github_actions_secret" "aws-s3-key" {
  repository  = var.github_repository
  secret_name = "AWS_S3_ACCESS_KEY"
  plaintext_value = var.crc-iam-github-access-key
}

resource "github_actions_secret" "aws-s3-secret" {
  repository  = var.github_repository
  secret_name = "AWS_S3_SECRET_ACCESS_KEY"
  plaintext_value = var.crc-iam-github-secret-access-key
}

resource "github_actions_variable" "aws-s3-bucket-prod" {
  repository    = var.github_repository
  variable_name = "AWS_S3_BUCKET_PROD"
  value         = var.crc-s3-bucket-prod
}

resource "github_actions_variable" "aws-s3-bucket-stage" {
  repository    = var.github_repository
  variable_name = "AWS_S3_BUCKET_STAGE"
  value         = var.crc-s3-bucket-stage
}