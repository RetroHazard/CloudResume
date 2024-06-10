terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.52.0"
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

variable "domain-name" {
  type = string
  default = "cloudresume-agb.jp"
}

module "frontend" {
  source = "./modules/frontend"
  
  providers = {
    aws = aws.ap-northeast-1
  }

  account_id  = data.aws_caller_identity.current.account_id
  caller_arn  = data.aws_caller_identity.current.arn
  caller_user = data.aws_caller_identity.current.user_id
  
  domain-name = var.domain-name
  
  waf-acl-arn = module.backend.aws_wafv2_web_acl_crc-web-acl_arn
  
  api-lambda-contact-uri = module.backend.aws_lambda_function_crc-sendMessage_uri
  api-lambda-visitors-uri = module.backend.aws_lambda_function_crc-trackVisitors_uri
  }

module "backend" {
  source = "./modules/backend"
  
  providers = {
    aws = aws.us-east-1
  }

  account_id  = data.aws_caller_identity.current.account_id
  caller_arn  = data.aws_caller_identity.current.arn
  caller_user = data.aws_caller_identity.current.user_id

  domain-name = var.domain-name
  
  iam-role-cloudfront-manager-arn = aws_iam_role.crc-CloudFrontManager.arn
  iam-role-message-sender-arn = aws_iam_role.crc-MessageSender.arn
  iam-role-visitor-tracker-arn = aws_iam_role.crc-VisitorTracker.arn
  
  s3-bucket-production-arn = module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn
  s3-bucket-staging-arn = module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_arn
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
        "arn:aws:logs:ap-northeast-1:${data.aws_caller_identity.current.account_id}:log-group:${module.backend.aws_lambda_function_crc-cloudfrontInvalidation_log-group}:*"
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
        "${module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn}",
        "${module.frontend.aws_s3_bucket_crc-agb-s3-website-prod_arn}/*",
        "${module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_arn}",
        "${module.frontend.aws_s3_bucket_crc-agb-s3-website-staging_arn}/*"
      ],
      "Sid": "VisualEditor1"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

}



// IAM Roles
resource "aws_iam_role" "crc-API-CloudWatchLogs" {
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
  managed_policy_arns  = [
    "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
  ]
  max_session_duration = "3600"
  name                 = "CloudResume_API_CloudWatchLogs"
  path                 = "/service-role/"
}

resource "aws_iam_role" "crc-CloudFrontManager" {
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

  managed_policy_arns  = [
    aws_iam_policy.crc-Lambda-LoggingRights.arn, 
    aws_iam_policy.crc-Lambda-CloudFrontInvalidation-AccessPolicy.arn, 
    aws_iam_policy.crc-Lambda-CloudFrontInvalidation-Logging.arn
    ]
  max_session_duration = "3600"
  name                 = "crc-CloudFrontManager"
  path                 = "/service-role/"

}

resource "aws_iam_role" "crc-MessageSender" {
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
  managed_policy_arns  = [
    aws_iam_policy.crc-Lambda-LoggingRights.arn,
    aws_iam_policy.crc-Lambda-SendMessage-AccessPolicy.arn,
    aws_iam_policy.crc-Lambda-SendMessage-Logging.arn
  ]
  max_session_duration = "3600"
  name                 = "crc-MessageSender"
  path                 = "/service-role/"

}

resource "aws_iam_role" "crc-VisitorTracker" {
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
  managed_policy_arns  = [
    aws_iam_policy.crc-Lambda-LoggingRights.arn,
    aws_iam_policy.crc-Lambda-TrackVisitors-AccessPolicy.arn,
    aws_iam_policy.crc-Lambda-TrackVisitors-Logging.arn
  ]
  max_session_duration = "3600"
  name                 = "crc-VisitorTracker"
  path                 = "/service-role/"

}