###################
# Begin IAM Outputs

// IAM Policies
output "aws_iam_policy_crc-Lambda-CloudFrontInvalidation-AccessPolicy" {
  value = aws_iam_policy.crc-Lambda-CloudFrontInvalidation-AccessPolicy.id
}

output "aws_iam_policy_crc-Lambda-CloudFrontInvalidation-Logging_id" {
  value = aws_iam_policy.crc-Lambda-CloudFrontInvalidation-Logging.id
}

output "aws_iam_policy_crc-Lambda-LoggingRights_id" {
  value = aws_iam_policy.crc-Lambda-LoggingRights.id
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
output "aws_iam_role_crc-CloudResume_API_CloudWatchLogs_id" {
  value = aws_iam_role.crc-API-CloudWatchLogs.id
}

output "aws_iam_role_crc-CloudResume_CloudFrontManager_id" {
  value = aws_iam_role.crc-CloudFrontManager.id
}

output "aws_iam_role_crc-CloudResume_CloudFrontManager_arn" {
  value = aws_iam_role.crc-CloudFrontManager.arn
}

output "aws_iam_role_crc-CloudResume_SendMessage_id" {
  value = aws_iam_role.crc-MessageSender.id
}

output "aws_iam_role_crc-CloudResume_SendMessage_arn" {
  value = aws_iam_role.crc-MessageSender.arn
}

output "aws_iam_role_crc-CloudResume_TrackVisitors_id" {
  value = aws_iam_role.crc-VisitorTracker.id
}

output "aws_iam_role_crc-CloudResume_TrackVisitors_arn" {
  value = aws_iam_role.crc-VisitorTracker.arn
}