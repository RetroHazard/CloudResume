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

  # CloudWatch Logs stops honouring log-stream ARNs (`<group>:*`) for log-group-level
  # actions on 26 April 2027, so CreateLogGroup needs the bare log-group ARN as well.
  # The statement above stays for the stream-scoped actions (CreateLogStream, PutLogEvents).
  statement {
    sid    = "AllowFunctionToCreateLogGroup"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup"
    ]
    resources = [
      var.crc-cw-lambda-log-group-trackVisitors
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

  # See crc-lambda-TrackVisitors-logging-policy for why this is a separate statement.
  statement {
    sid    = "AllowFunctionToCreateLogGroup"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup"
    ]
    resources = [
      var.crc-cw-lambda-log-group-downloadResume
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

  # Resolve the live contact alias, and mint a replacement after one is rotated or revoked.
  statement {
    sid    = "AllowFunctionToIssueContactAliases"
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem"
    ]
    resources = [
      var.crc-mail-alias_arn
    ]
  }

  statement {
    sid    = "AllowFunctionToReadCvSource"
    effect = "Allow"
    actions = [
      "s3:GetObject"
    ]
    resources = [
      "${var.crc-s3-production-arn}/${var.crc-cv-source-object-key}"
    ]
  }

  # Write and prune the generated CVs, and nothing else in the bucket.
  statement {
    sid    = "AllowFunctionToCacheGeneratedCvs"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject"
    ]
    resources = [
      "${var.crc-s3-production-arn}/${var.crc-cv-object-prefix}/*"
    ]
  }

  # Listing is how the function asks "is this digest already rendered?". It is scoped to the
  # CV prefix, so the function cannot enumerate the rest of the site.
  statement {
    sid    = "AllowFunctionToFindGeneratedCvs"
    effect = "Allow"
    actions = [
      "s3:ListBucket"
    ]
    resources = [
      var.crc-s3-production-arn
    ]
    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values   = ["${var.crc-cv-object-prefix}/*"]
    }
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

  # See crc-lambda-TrackVisitors-logging-policy for why this is a separate statement.
  statement {
    sid    = "AllowFunctionToCreateLogGroup"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup"
    ]
    resources = [
      var.crc-cw-lambda-log-group-sendMessage
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
      local.ses-destination-identity-arn,
      var.crc-ses-mail-domain
    ]
  }

  # Same arrangement as the CloudFront signing key above: read at runtime, never through a
  # data source, so the secret stays out of Terraform state.
  statement {
    sid    = "AllowFunctionToReadRecaptchaSecret"
    effect = "Allow"
    actions = [
      "ssm:GetParameter"
    ]
    resources = [
      "arn:aws:ssm:${data.aws_region.current.region}:${var.account_id}:parameter${var.crc-recaptcha-secret-parameter-name}"
    ]
  }

  statement {
    sid    = "AllowFunctionToDecryptRecaptchaSecret"
    effect = "Allow"
    actions = [
      "kms:Decrypt"
    ]
    resources = [
      data.aws_kms_alias.ssm.target_key_arn
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

  # See crc-lambda-TrackVisitors-logging-policy for why this is a separate statement.
  statement {
    sid    = "AllowFunctionToCreateLogGroup"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup"
    ]
    resources = [
      var.crc-cw-lambda-log-group-cloudfrontInvalidation
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

  # See crc-lambda-TrackVisitors-logging-policy for why this is a separate statement.
  statement {
    sid    = "AllowFunctionToCreateLogGroup"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup"
    ]
    resources = [
      var.crc-cw-lambda-log-group-updateContributions
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

data "aws_iam_policy_document" "crc-lambda-ForwardMail-logging-policy" {
  statement {
    sid    = "AllowFunctionToWriteToCloudwatch"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${var.crc-cw-lambda-log-group-forwardMail}:*"
    ]
  }

  # See crc-lambda-TrackVisitors-logging-policy for why this is a separate statement.
  statement {
    sid    = "AllowFunctionToCreateLogGroup"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup"
    ]
    resources = [
      var.crc-cw-lambda-log-group-forwardMail
    ]
  }
}

data "aws_iam_policy_document" "crc-lambda-ForwardMail-access-policy" {
  statement {
    sid    = "AllowFunctionToReadReceivedMail"
    effect = "Allow"
    actions = [
      "s3:GetObject"
    ]
    resources = [
      "${var.crc-mail-bucket-arn}/*"
    ]
  }

  # Read an alias's status and count what happened to its mail. No PutItem or DeleteItem:
  # the forwarder can never create, revive, revoke or remove an address.
  statement {
    sid    = "AllowFunctionToCheckAliases"
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:UpdateItem"
    ]
    resources = [
      var.crc-mail-alias_arn
    ]
  }

  # Only as the site's own domain, and only to the one verified destination. Even a bug
  # here cannot turn the function into an open relay.
  statement {
    sid    = "AllowFunctionToForwardMail"
    effect = "Allow"
    actions = [
      "ses:SendRawEmail"
    ]
    resources = [
      local.ses-destination-identity-arn,
      var.crc-ses-mail-domain
    ]
  }
}

# An email identity's ARN embeds the address itself. It is built here from the sensitive
# variable, rather than taken from the identity resource's computed `arn`, which would carry
# the address into the published plan unredacted.
locals {
  ses-destination-identity-arn = "arn:aws:ses:${data.aws_region.current.region}:${var.account_id}:identity/${var.crc-ses-mail-destination-email}"
}
