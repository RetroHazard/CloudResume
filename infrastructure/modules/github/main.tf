resource "github_actions_secret" "aws-s3-key" {
  repository  = data.github_repository.current.full_name
  secret_name = "AWS_S3_ACCESS_KEY"
  encrypted_value = var.crc-iam-github-access-key
}

resource "github_actions_secret" "aws-s3-secret" {
  repository  = data.github_repository.current.full_name
  secret_name = "AWS_S3_SECRET_ACCESS_KEY"
  encrypted_value = var.crc-iam-github-secret-access-key
}

resource "github_actions_variable" "aws-s3-bucket-prod" {
  repository    = data.github_repository.current.full_name
  variable_name = "AWS_S3_BUCKET_PROD"
  value         = var.crc-s3-bucket-prod
}

resource "github_actions_variable" "aws-s3-bucket-stage" {
  repository    = data.github_repository.current.full_name
  variable_name = "AWS_S3_BUCKET_STAGE"
  value         = var.crc-s3-bucket-stage
}