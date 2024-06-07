terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.52.0"
      configuration_aliases = [aws.ap-northeast-1,aws.us-east-1,aws.global]
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
  alias = "ap-northeast-1"
  default_tags {
    tags = var.tags
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
  default_tags {
    tags = var.tags
  }
}

provider "aws" {
  region = ""
  alias  = "global"
  default_tags {
    tags = var.tags
  }
}

variable "tags" {
  type = map(string)
  description = "Default Tags, applied to all resources"
  default = {
    ManagedByTerraform = true
  }
}

module "frontend" {
  source = "./modules/frontend"

  account_id  = data.aws_caller_identity.current.account_id
  caller_arn  = data.aws_caller_identity.current.arn
  caller_user = data.aws_caller_identity.current.user_id
  }

module "backend" {
  source = "./modules/backend"

  account_id  = data.aws_caller_identity.current.account_id
  caller_arn  = data.aws_caller_identity.current.arn
  caller_user = data.aws_caller_identity.current.user_id
  }


##########################
# Begin Core IAM Resources

// IAM Policies
resource "aws_iam_policy" "crc-Lambda-TrackVisitors-AccessPolicy" {
  name = "crc-Lambda-TrackVisitors-AccessPolicy"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:dynamodb:ap-northeast-1:${data.aws_caller_identity.current.account_id}:table/crc-visitor-count",
        "arn:aws:dynamodb:ap-northeast-1:${data.aws_caller_identity.current.account_id}:table/crc-visitor-record"
      ],
      "Sid": "VisualEditor0"
    }
  ],
  "Version": "2012-10-17"
}
POLICY
}

resource "aws_iam_policy" "crc-Lambda-TrackVisitors-Logging" {
  name = "crc-Lambda-TrackVisitors-Logging"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:ap-northeast-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/trackVisitors:*"
      ],
      "Sid": "Statement1"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  tags = {
    Name    = "TrackVisitors_Logger"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "TrackVisitors_Logger"
    Project = "CloudResume"
  }
}

resource "aws_iam_policy" "crc-Lambda-CloudFrontInvalidation-AccessPolicy" {
  name = "crc-CloudFrontInvalidation-AccessPolicy"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/ESAPTUQ4RL7CE",
        "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/E37NSQHT5FF2XS"
      ],
      "Sid": "Stmt1505004397098"
    },
    {
      "Action": [
        "s3:Get*",
        "s3:List*"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::agb-s3-cloudresumechallenge-hosted",
        "arn:aws:s3:::agb-s3-cloudresumechallenge-hosted/*",
        "arn:aws:s3:::agb-s3-cloudresumechallenge-staging",
        "arn:aws:s3:::agb-s3-cloudresumechallenge-staging/*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
POLICY

}

resource "aws_iam_policy" "crc-Lambda-CloudFrontInvalidation-Logging" {
  name = "crc-Lambda-CloudFrontInvalidation-Logging"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:ap-northeast-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/cloudfrontInvalidation:*"
      ],
      "Sid": "Statement1"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

}

resource "aws_iam_policy" "crc-Lambda-SendMessage-AccessPolicy" {
  name = "crc-Lambda-SendMessage-AccessPolicy"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "ses:SendEmail",
        "ses:SendTemplatedEmail",
        "ses:SendRawEmail"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:ses:ap-northeast-1:${data.aws_caller_identity.current.account_id}:configuration-set/ContactFormMailer",
        "arn:aws:ses:ap-northeast-1:${data.aws_caller_identity.current.account_id}:identity/a.bracken87+cloudresume_ses@gmail.com",
        "arn:aws:ses:ap-northeast-1:${data.aws_caller_identity.current.account_id}:identity/cloudresume-agb.jp"
      ],
      "Sid": "VisualEditor0"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  tags = {
    Name    = "SESSendPolicy"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "SESSendPolicy"
    Project = "CloudResume"
  }
}

resource "aws_iam_policy" "crc-Lambda-SendMessage-Logging" {
  name = "crc-Lambda-SendMessage-Logging"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:ap-northeast-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/sendMessage:*"
      ],
      "Sid": "Statement1"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  tags = {
    Name    = "SendMessage_Logger"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "SendMessage_Logger"
    Project = "CloudResume"
  }
}

resource "aws_iam_policy" "crc-Lambda-LoggingRights" {
  name = "crc-Lambda-LoggingRights"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "logs:CreateLogGroup",
      "Effect": "Allow",
      "Resource": "arn:aws:logs:ap-northeast-1:${data.aws_caller_identity.current.account_id}:log-group:*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

}

resource "aws_iam_policy" "crc-S3-GitHubActions" {
  name = "crc-S3-GitHubActions"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "s3:*",
      "Effect": "Allow",
      "Resource": [
        "${module.frontend.}"
        "arn:aws:s3:::agb-s3-cloudresumechallenge-hosted",
        "arn:aws:s3:::agb-s3-cloudresumechallenge-hosted/*",
        "arn:aws:s3:::agb-s3-cloudresumechallenge-staging",
        "arn:aws:s3:::agb-s3-cloudresumechallenge-staging/*"
      ],
      "Sid": "VisualEditor1"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

}



// IAM Roles
resource "aws_iam_role" "crc-CloudResume_API_CloudWatchLogs" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows API Gateway to push logs to CloudWatch Logs."
  managed_policy_arns  = ["arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"]
  max_session_duration = "3600"
  name                 = "CloudResume_API_CloudWatchLogs"
  path                 = "/"
}

resource "aws_iam_role" "crc-CloudResume_CloudFrontManager" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  managed_policy_arns  = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/CloudResume_CloudFrontInvalidation", "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/CloudResume_LambdaBasicLoggingRights", "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/CloudResume_LambdaLogging_CloudFrontInvalidator", "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/service-role/AWSLambdaTracerAccessExecutionRole-6d76afb3-0381-49c5-9c2f-dd57dc56dac5", "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"]
  max_session_duration = "3600"
  name                 = "CloudResume_CloudFrontManager"
  path                 = "/service-role/"

}

resource "aws_iam_role" "crc-CloudResume_SendMessage" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows Lambda functions to call AWS services on your behalf."
  managed_policy_arns  = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/CloudResume_LambdaBasicLoggingRights", "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/CloudResume_LambdaEmailSendPolicy", "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/CloudResume_LambdaLogging_SendMessage", "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/service-role/AWSLambdaTracerAccessExecutionRole-04c4257a-4904-4246-84c8-542bb9418cbf", "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"]
  max_session_duration = "3600"
  name                 = "CloudResume_SendMessage"
  path                 = "/"

}

resource "aws_iam_role" "crc-CloudResume_TrackVisitors" {
  assume_role_policy = <<POLICY
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  description          = "Allows Lambda functions to call AWS services on your behalf."
  managed_policy_arns  = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/CloudResume_LambdaBasicLoggingRights", "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/CloudResume_LambdaLogging_TrackVisitors", "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/CloudResume_Lambda_DBUpdater", "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/service-role/AWSLambdaTracerAccessExecutionRole-26787255-679b-481d-b2fa-243b20da804a", "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"]
  max_session_duration = "3600"
  name                 = "CloudResume_TrackVisitors"
  path                 = "/"

}


// IAM Users
resource "aws_iam_user" "crc-AIDAU6GDWXXXKJN63YR22" {
  force_destroy = "false"
  name          = "CloudResume_TerraformOrchestrator"
  path          = "/"

  tags = {
    AKIAU6GDWXXXBYZHQLUN = "Administrative Control for Terraform"
  }

  tags_all = {
    AKIAU6GDWXXXBYZHQLUN = "Administrative Control for Terraform"
  }
}

resource "aws_iam_user" "crc-AIDAU6GDWXXXMWUJTXQ36" {
  force_destroy = "false"
  name          = "CloudResume_GitHubS3"
  path          = "/"

  tags = {
    AKIAU6GDWXXXLB5RWJNB = "GitHub Actions Push to S3"
  }

  tags_all = {
    AKIAU6GDWXXXLB5RWJNB = "GitHub Actions Push to S3"
  }
}
