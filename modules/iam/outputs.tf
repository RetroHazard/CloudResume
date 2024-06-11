###################
# Begin IAM Outputs

// IAM Policies
output "aws_iam_policy_crc-Lambda-CloudfrontInvalidation-AccessPolicy" {
  value = aws_iam_policy.crc-Lambda-CloudfrontInvalidation-AccessPolicy.id
}

output "aws_iam_policy_crc-Lambda-CloudfrontInvalidation-Logging_id" {
  value = aws_iam_policy.crc-Lambda-CloudfrontInvalidation-Logging.id
}

output "aws_iam_policy_crc-Lambda-SendMessage-AccessPolicy_id" {
  value = aws_iam_policy.crc-Lambda-SendMessage-AccessPolicy.id
}

output "aws_iam_policy_crc-Lambda-SendMessage-Logging_id" {
  value = aws_iam_policy.crc-Lambda-SendMessage-Logging.id
}

output "aws_iam_policy_crc-Lambda-TrackVisitors-Logging_id" {
  value = aws_iam_policy.crc-Lambda-TrackVisitors-Logging.id
}

output "aws_iam_policy_crc-Lambda-TrackVisitors-AccessPolicy_id" {
  value = aws_iam_policy.crc-Lambda-TrackVisitors-AccessPolicy.id
}

output "aws_iam_policy_crc-CloudResume_S3GitHubActions_id" {
  value = aws_iam_policy.crc-S3-GitHubActions.id
}

// IAM Roles
output "aws_iam_role_crc-api-CloudwatchLogs_id" {
  value = aws_iam_role.crc-api-CloudwatchLogs.id
}

output "aws_iam_role_crc-CloudFrontManager_id" {
  value = aws_iam_role.crc-CloudfrontManager.id
}

output "aws_iam_role_crc-CloudFrontManager_arn" {
  value = aws_iam_role.crc-CloudfrontManager.arn
}

output "aws_iam_role_crc-MessageSender_id" {
  value = aws_iam_role.crc-MessageSender.id
}

output "aws_iam_role_crc-MessageSender_arn" {
  value = aws_iam_role.crc-MessageSender.arn
}

output "aws_iam_role_crc-VisitorTracker_id" {
  value = aws_iam_role.crc-VisitorTracker.id
}

output "aws_iam_role_crc-VisitorTracker_arn" {
  value = aws_iam_role.crc-VisitorTracker.arn
}