data "aws_caller_identity" "current" {}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "caller_arn" {
  value = data.aws_caller_identity.current.arn
}

output "caller_user" {
  value = data.aws_caller_identity.current.user_id
}

###################
# Begin IAM Outputs

// IAM Policies
output "aws_iam_policy_crc-Lambda-CloudFrontInvalidation-AccessPolicy" {
  value = [
    aws_iam_policy.crc-Lambda-CloudFrontInvalidation-AccessPolicy.id,
    aws_iam_policy.crc-Lambda-CloudFrontInvalidation-AccessPolicy.arn,
    aws_iam_policy.crc-Lambda-CloudFrontInvalidation-AccessPolicy.name
  ]
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
  value = aws_iam_role.crc-CloudResume_API_CloudWatchLogs.id
}

output "aws_iam_role_crc-CloudResume_CloudFrontManager_id" {
  value = aws_iam_role.crc-CloudResume_CloudFrontManager.id
}

output "aws_iam_role_crc-CloudResume_SendMessage_id" {
  value = aws_iam_role.crc-CloudResume_SendMessage.id
}

output "aws_iam_role_crc-CloudResume_TrackVisitors_id" {
  value = aws_iam_role.crc-CloudResume_TrackVisitors.id
}

// IAM Users
output "aws_iam_user_crc-AIDAU6GDWXXXKJN63YR22_id" {
  value = aws_iam_user.crc-AIDAU6GDWXXXKJN63YR22.id
}

output "aws_iam_user_crc-AIDAU6GDWXXXMWUJTXQ36_id" {
  value = aws_iam_user.crc-AIDAU6GDWXXXMWUJTXQ36.id
}
