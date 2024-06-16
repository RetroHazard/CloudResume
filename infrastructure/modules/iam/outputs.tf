###################
# Begin IAM Outputs

// IAM Roles
output "aws_iam_role_crc-api-CloudwatchLogs_arn" {
  value = aws_iam_role.crc-api-CloudwatchLogs.arn
}

output "aws_iam_role_crc-CloudFrontManager_arn" {
  value = aws_iam_role.crc-CloudfrontManager.arn
}

output "aws_iam_role_crc-MessageSender_arn" {
  value = aws_iam_role.crc-MessageSender.arn
}

output "aws_iam_role_crc-VisitorTracker_arn" {
  value = aws_iam_role.crc-VisitorTracker.arn
}

output "aws_iam_user_crc-iam-github-actions_arn" {
  value = aws_iam_user.crc-iam-github-actions.arn
}

output "aws_iam_access_key_crc-iam-github-key_key-id" {
  value     = aws_iam_access_key.crc-iam-github-key.id
  sensitive = true
}

output "aws_iam_access_key_crc-iam-github-key_secret-key" {
  value     = aws_iam_access_key.crc-iam-github-key.secret
  sensitive = true
}