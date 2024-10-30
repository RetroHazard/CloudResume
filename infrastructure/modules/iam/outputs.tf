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

// IAM Policy Documents
output "aws_iam_policy_document_crc-github-s3-actions_arn" {
  value = aws_iam_policy.crc-GitHub-S3Actions.arn
}

output "aws_iam_policy_document_crc-github-terraform-limited-iam_arn" {
  value = aws_iam_policy.crc-GitHub-Terraform-LimitedIAM.arn
}