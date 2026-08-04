##########################
# Begin Core IAM Resources

// Lambda Policy Documents
data "aws_iam_policy_document" "crc-lambda-TrackVisitors-logging-policy" {
  statement {
    sid    = "AllowFunctionToWriteToCloudwatch"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${var.crc-cw-lambda-log-group-trackVisitors}:*"
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-TrackVisitors-access-policy" {
  statement {
    sid    = "AllowFunctionToReadWriteToDynamoDB"
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem"
    ]
    resources = [
      var.crc-visitor-count_arn,
      var.crc-visitor-record_arn
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-DownloadResume-logging-policy" {
  statement {
    sid    = "AllowFunctionToWriteToCloudwatch"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${var.crc-cw-lambda-log-group-downloadResume}:*"
    ]
  }
}

# The signing key is a SecureString read at runtime, never through a Terraform data
# source — `data "aws_ssm_parameter"` writes the decrypted value into state in cleartext,
# and the state bucket would then hold the CloudFront private key. Terraform only ever
# learns the parameter's *name*, so the ARN here is constructed rather than looked up.
data "aws_iam_policy_document" "crc-lambda-DownloadResume-access-policy" {
  statement {
    sid    = "AllowFunctionToRecordDownloads"
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem"
    ]
    resources = [
      var.crc-download-record_arn
    ]
  }

  statement {
    sid    = "AllowFunctionToReadSigningKey"
    effect = "Allow"
    actions = [
      "ssm:GetParameter"
    ]
    resources = [
      "arn:aws:ssm:${data.aws_region.current.region}:${var.account_id}:parameter${var.crc-cf-signing-key-parameter-name}"
    ]
  }

  # The AWS-managed alias/aws/ssm key delegates authorisation to IAM, so decryption has to
  # be granted here. Resolving it through an alias data source exposes no secret material.
  statement {
    sid    = "AllowFunctionToDecryptSigningKey"
    effect = "Allow"
    actions = [
      "kms:Decrypt"
    ]
    resources = [
      data.aws_kms_alias.ssm.target_key_arn
    ]
  }
}

data "aws_kms_alias" "ssm" {
  name = "alias/aws/ssm"
}

data "aws_iam_policy_document" "crc-lambda-SendMessage-logging-policy" {
  statement {
    sid    = "AllowFunctionToWriteToCloudwatch"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${var.crc-cw-lambda-log-group-sendMessage}:*"
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-SendMessage-access-policy" {
  statement {
    sid    = "AllowFunctionToGenerateEmails"
    effect = "Allow"
    actions = [
      "ses:SendEmail",
      "ses:SendTemplatedEmail",
      "ses:SendRawEmail"
    ]
    resources = [
      var.crc-ses-configuration-set,
      var.crc-ses-mail-destination,
      var.crc-ses-mail-domain
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-CloudfrontInvalidation-logging-policy" {
  statement {
    sid    = "AllowFunctionToWriteToCloudwatch"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${var.crc-cw-lambda-log-group-cloudfrontInvalidation}:*"
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-CloudfrontInvalidation-access-policy" {
  statement {
    sid    = "AllowCloudfrontActionsToRefreshCache"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations"
    ]
    resources = [
      var.crc-cf-production-distribution
    ]
  }

  statement {
    sid    = "AllowS3ActionsForCloudfrontInvalidations"
    effect = "Allow"
    actions = [
      "s3:Get*",
      "s3:List*"
    ]
    resources = [
      var.crc-s3-production-arn,
      "${var.crc-s3-production-arn}/*"
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-UpdateContributions-logging-policy" {
  statement {
    sid    = "AllowFunctionToWriteToCloudwatch"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${var.crc-cw-lambda-log-group-updateContributions}:*"
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-UpdateContributions-access-policy" {
  statement {
    sid    = "AllowFunctionToPublishContributionData"
    effect = "Allow"
    actions = [
      "s3:PutObject"
    ]
    resources = [
      "${var.crc-s3-production-arn}/${var.crc-contribution-object-key}"
    ]
  }
}

// Role Policy Documents
data "aws_iam_policy_document" "crc-function-assume-role-policy" {
  statement {
    sid     = "AssumeRolePolicyForLambdaAndAPIGateway"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"
      identifiers = [
        "apigateway.amazonaws.com",
        "lambda.amazonaws.com"
      ]
    }
  }
}

// GitHub Policy Documents
data "aws_iam_policy_document" "crc-github-s3-actions" {
  statement {
    sid    = "AllowAccessToGitHubRunnerForS3Upload"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]
    resources = [
      var.crc-s3-production-arn,
      "${var.crc-s3-production-arn}/*"
    ]
  }
}

data "aws_iam_policy_document" "crc-github-terraform-limited-iam" {
  statement {
    sid    = "AllowLimitedIAMAccessForTerraformOperations"
    effect = "Allow"
    actions = [
      "iam:CreateInstanceProfile",
      "iam:List*",
      "iam:Untag*",
      "iam:Tag*",
      "iam:RemoveRoleFromInstanceProfile",
      "iam:DeletePolicy",
      "iam:CreateRole",
      "iam:AttachRolePolicy",
      "iam:PutRolePolicy",
      "iam:AddRoleToInstanceProfile",
      "iam:PassRole",
      "iam:Get*",
      "iam:DetachRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:CreatePolicyVersion",
      "iam:DeleteInstanceProfile",
      "iam:DeleteRole",
      "iam:UpdateRoleDescription",
      "iam:CreatePolicy",
      "iam:CreateServiceLinkedRole",
      "iam:UpdateRole",
      "iam:DeleteServiceLinkedRole",
      "iam:DeletePolicyVersion",
      "iam:SetDefaultPolicyVersion",
      "iam:AttachUserPolicy",
      "iam:DetachUserPolicy",
      "iam:PutUserPolicy",
      "iam:DeleteUserPolicy",
      "iam:AddUserToGroup",
      "iam:AttachGroupPolicy",
      "iam:CreateGroup",
      "iam:DeleteGroup",
      "iam:DeleteGroupPolicy",
      "iam:DetachGroupPolicy",
      "iam:GetGroup",
      "iam:GetGroupPolicy",
      "iam:ListAttachedGroupPolicies",
      "iam:ListGroupPolicies",
      "iam:ListGroups",
      "iam:ListGroupsForUser",
      "iam:PutGroupPolicy",
      "iam:RemoveUserFromGroup",
      "iam:UpdateGroup",
      "iam:GenerateServiceLastAccessedDetails",
      "iam:UpdateAssumeRolePolicy",
      "iam:UpdateAccessKey",
      "iam:CreateUser",
      "iam:DeleteUser",
      "iam:DeleteAccessKey",
      "iam:CreateAccessKey",
      "iam:CreateOpenIDConnectProvider",
      "iam:DeleteOpenIDConnectProvider",
      "iam:UpdateOpenIDConnectProviderThumbprint",
      "iam:AddClientIDToOpenIDConnectProvider",
      "iam:RemoveClientIDFromOpenIDConnectProvider"
    ]
    resources = ["*"]
  }
}
