resource "aws_iam_policy" "crc-CloudResume_CloudFrontInvalidation" {
  name = "CloudResume_CloudFrontInvalidation"
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
        "arn:aws:cloudfront::339712851438:distribution/ESAPTUQ4RL7CE",
        "arn:aws:cloudfront::339712851438:distribution/E37NSQHT5FF2XS"
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

  tags = {
    Name    = "CloudFrontInvalidator"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "CloudFrontInvalidator"
    Project = "CloudResume"
  }
}

resource "aws_iam_policy" "crc-CloudResume_LambdaBasicLoggingRights" {
  name = "CloudResume_LambdaBasicLoggingRights"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "logs:CreateLogGroup",
      "Effect": "Allow",
      "Resource": "arn:aws:logs:ap-northeast-1:339712851438:*"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  tags = {
    Name    = "LambdaLogging"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "LambdaLogging"
    Project = "CloudResume"
  }
}

resource "aws_iam_policy" "crc-CloudResume_LambdaEmailSendPolicy" {
  name = "CloudResume_LambdaEmailSendPolicy"
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
        "arn:aws:ses:ap-northeast-1:339712851438:configuration-set/ContactFormMailer",
        "arn:aws:ses:ap-northeast-1:339712851438:identity/a.bracken87+cloudresume_ses@gmail.com",
        "arn:aws:ses:ap-northeast-1:339712851438:identity/cloudresume-agb.jp"
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

resource "aws_iam_policy" "crc-CloudResume_LambdaLogging_CloudFrontInvalidator" {
  name = "CloudResume_LambdaLogging_CloudFrontInvalidator"
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
        "arn:aws:logs:ap-northeast-1:339712851438:log-group:/aws/lambda/cloudfrontInvalidation:*"
      ],
      "Sid": "Statement1"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  tags = {
    Name    = "CloudFrontInvalidator_Logger"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "CloudFrontInvalidator_Logger"
    Project = "CloudResume"
  }
}

resource "aws_iam_policy" "crc-CloudResume_LambdaLogging_SendMessage" {
  name = "CloudResume_LambdaLogging_SendMessage"
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
        "arn:aws:logs:ap-northeast-1:339712851438:log-group:/aws/lambda/sendMessage:*"
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

resource "aws_iam_policy" "crc-CloudResume_LambdaLogging_TrackVisitors" {
  name = "CloudResume_LambdaLogging_TrackVisitors"
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
        "arn:aws:logs:ap-northeast-1:339712851438:log-group:/aws/lambda/trackVisitors:*"
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

resource "aws_iam_policy" "crc-CloudResume_Lambda_DBUpdater" {
  name = "CloudResume_Lambda_DBUpdater"
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
        "arn:aws:dynamodb:ap-northeast-1:339712851438:table/crc-visitor-count",
        "arn:aws:dynamodb:ap-northeast-1:339712851438:table/crc-visitor-record"
      ],
      "Sid": "VisualEditor0"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  tags = {
    Name    = "DynamoDBUpdater"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "DynamoDBUpdater"
    Project = "CloudResume"
  }
}

resource "aws_iam_policy" "crc-CloudResume_S3GitHubActions" {
  name = "CloudResume_S3GitHubActions"
  path = "/"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "s3:*",
      "Effect": "Allow",
      "Resource": [
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

  tags = {
    Name    = "S3GitHubActions"
    Project = "CloudResume"
  }

  tags_all = {
    Name    = "S3GitHubActions"
    Project = "CloudResume"
  }
}

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

  tags = {
    Project = "CloudResume"
  }

  tags_all = {
    Project = "CloudResume"
  }
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

  managed_policy_arns  = ["arn:aws:iam::339712851438:policy/CloudResume_CloudFrontInvalidation", "arn:aws:iam::339712851438:policy/CloudResume_LambdaBasicLoggingRights", "arn:aws:iam::339712851438:policy/CloudResume_LambdaLogging_CloudFrontInvalidator", "arn:aws:iam::339712851438:policy/service-role/AWSLambdaTracerAccessExecutionRole-6d76afb3-0381-49c5-9c2f-dd57dc56dac5", "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"]
  max_session_duration = "3600"
  name                 = "CloudResume_CloudFrontManager"
  path                 = "/service-role/"

  tags = {
    Project = "CloudResume"
  }

  tags_all = {
    Project = "CloudResume"
  }
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
  managed_policy_arns  = ["arn:aws:iam::339712851438:policy/CloudResume_LambdaBasicLoggingRights", "arn:aws:iam::339712851438:policy/CloudResume_LambdaEmailSendPolicy", "arn:aws:iam::339712851438:policy/CloudResume_LambdaLogging_SendMessage", "arn:aws:iam::339712851438:policy/service-role/AWSLambdaTracerAccessExecutionRole-04c4257a-4904-4246-84c8-542bb9418cbf", "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"]
  max_session_duration = "3600"
  name                 = "CloudResume_SendMessage"
  path                 = "/"

  tags = {
    Project = "CloudResume"
  }

  tags_all = {
    Project = "CloudResume"
  }
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
  managed_policy_arns  = ["arn:aws:iam::339712851438:policy/CloudResume_LambdaBasicLoggingRights", "arn:aws:iam::339712851438:policy/CloudResume_LambdaLogging_TrackVisitors", "arn:aws:iam::339712851438:policy/CloudResume_Lambda_DBUpdater", "arn:aws:iam::339712851438:policy/service-role/AWSLambdaTracerAccessExecutionRole-26787255-679b-481d-b2fa-243b20da804a", "arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy"]
  max_session_duration = "3600"
  name                 = "CloudResume_TrackVisitors"
  path                 = "/"

  tags = {
    Project = "CloudResume"
  }

  tags_all = {
    Project = "CloudResume"
  }
}

resource "aws_iam_user" "crc-AIDAU6GDWXXXKJN63YR22" {
  force_destroy = "false"
  name          = "CloudResume_TerraformOrchestrator"
  path          = "/"

  tags = {
    AKIAU6GDWXXXBYZHQLUN = "Administrative Control for Terraform"
    Project              = "CloudResume"
  }

  tags_all = {
    AKIAU6GDWXXXBYZHQLUN = "Administrative Control for Terraform"
    Project              = "CloudResume"
  }
}

resource "aws_iam_user" "crc-AIDAU6GDWXXXMWUJTXQ36" {
  force_destroy = "false"
  name          = "CloudResume_GitHubS3"
  path          = "/"

  tags = {
    AKIAU6GDWXXXLB5RWJNB = "GitHub Actions Push to S3"
    Project              = "CloudResume"
  }

  tags_all = {
    AKIAU6GDWXXXLB5RWJNB = "GitHub Actions Push to S3"
    Project              = "CloudResume"
  }
}
