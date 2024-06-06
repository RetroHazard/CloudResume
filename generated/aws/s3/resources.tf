resource "aws_s3_bucket" "tfer--agb-s3-cloudresumechallenge-hosted" {
  bucket        = "agb-s3-cloudresumechallenge-hosted"
  force_destroy = "false"

  grant {
    id          = "a2c989d7fea1279277fa4af05a765aa2495a3578215b45f6eb142bac0fa6f764"
    permissions = ["FULL_CONTROL"]
    type        = "CanonicalUser"
  }

  lifecycle_rule {
    abort_incomplete_multipart_upload_days = "7"
    enabled                                = "true"

    expiration {
      days                         = "0"
      expired_object_delete_marker = "true"
    }

    id = "Remove Stale Entries"

    noncurrent_version_expiration {
      days = "7"
    }
  }

  logging {
    target_bucket = "agb-s3-cloudresumechallenge-logging"
    target_prefix = "crc_access_log/"
  }

  object_lock_enabled = "false"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "s3:GetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Resource": "arn:aws:s3:::agb-s3-cloudresumechallenge-hosted/*",
      "Sid": "PublicReadGetObject"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  request_payer = "BucketOwner"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }

      bucket_key_enabled = "true"
    }
  }

  tags = {
    Category    = "File Storage"
    CreatedBy   = "Manual"
    Project     = "CloudResumeChallenge"
    Purpose     = "Hosting"
    ServiceType = "S3"
  }

  tags_all = {
    Category    = "File Storage"
    CreatedBy   = "Manual"
    Project     = "CloudResumeChallenge"
    Purpose     = "Hosting"
    ServiceType = "S3"
  }

  versioning {
    enabled    = "true"
    mfa_delete = "false"
  }

  website {
    index_document = "index.html"
  }
}

resource "aws_s3_bucket" "tfer--agb-s3-cloudresumechallenge-logging" {
  bucket        = "agb-s3-cloudresumechallenge-logging"
  force_destroy = "false"

  grant {
    id          = "a2c989d7fea1279277fa4af05a765aa2495a3578215b45f6eb142bac0fa6f764"
    permissions = ["FULL_CONTROL"]
    type        = "CanonicalUser"
  }

  grant {
    id          = "c4c1ede66af53448b93c283ce9448c4ba468c9432aa01d700d3878632f77d2d0"
    permissions = ["FULL_CONTROL"]
    type        = "CanonicalUser"
  }

  lifecycle_rule {
    abort_incomplete_multipart_upload_days = "7"
    enabled                                = "true"

    expiration {
      days                         = "7"
      expired_object_delete_marker = "false"
    }

    id = "cf_crc - Delete After 7 Days"

    noncurrent_version_expiration {
      days = "7"
    }

    prefix = "cf_crc_/"
  }

  lifecycle_rule {
    abort_incomplete_multipart_upload_days = "7"
    enabled                                = "true"

    expiration {
      days                         = "7"
      expired_object_delete_marker = "false"
    }

    id = "crc_access_log - Delete After 7 Days"

    noncurrent_version_expiration {
      days = "7"
    }

    prefix = "crc_access_log/"
  }

  object_lock_enabled = "false"

  policy = <<POLICY
{
  "Id": "S3-Console-Auto-Gen-Policy-1716338986262",
  "Statement": [
    {
      "Action": "s3:PutObject",
      "Condition": {
        "StringEquals": {
          "aws:SourceAccount": "339712851438"
        }
      },
      "Effect": "Allow",
      "Principal": {
        "Service": "logging.s3.amazonaws.com"
      },
      "Resource": "arn:aws:s3:::agb-s3-cloudresumechallenge-logging/*",
      "Sid": "S3PolicyStmt-DO-NOT-MODIFY-1716338986157"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  request_payer = "BucketOwner"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }

      bucket_key_enabled = "true"
    }
  }

  tags = {
    Category    = "File Storage"
    CreatedBy   = "Manual"
    Project     = "CloudResumeChallenge"
    Purpose     = "Logging"
    ServiceType = "S3"
  }

  tags_all = {
    Category    = "File Storage"
    CreatedBy   = "Manual"
    Project     = "CloudResumeChallenge"
    Purpose     = "Logging"
    ServiceType = "S3"
  }

  versioning {
    enabled    = "true"
    mfa_delete = "false"
  }
}

resource "aws_s3_bucket" "tfer--agb-s3-cloudresumechallenge-staging" {
  bucket        = "agb-s3-cloudresumechallenge-staging"
  force_destroy = "false"

  grant {
    id          = "a2c989d7fea1279277fa4af05a765aa2495a3578215b45f6eb142bac0fa6f764"
    permissions = ["FULL_CONTROL"]
    type        = "CanonicalUser"
  }

  lifecycle_rule {
    abort_incomplete_multipart_upload_days = "7"
    enabled                                = "true"

    expiration {
      days                         = "0"
      expired_object_delete_marker = "true"
    }

    id = "Remove Stale Entries"

    noncurrent_version_expiration {
      days = "7"
    }
  }

  object_lock_enabled = "false"

  policy = <<POLICY
{
  "Statement": [
    {
      "Action": "s3:GetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Resource": "arn:aws:s3:::agb-s3-cloudresumechallenge-staging/*",
      "Sid": "PublicReadGetObject"
    }
  ],
  "Version": "2012-10-17"
}
POLICY

  request_payer = "BucketOwner"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }

      bucket_key_enabled = "true"
    }
  }

  versioning {
    enabled    = "true"
    mfa_delete = "false"
  }

  website {
    index_document = "index.html"
  }
}

resource "aws_s3_bucket_policy" "tfer--agb-s3-cloudresumechallenge-hosted" {
  bucket = "agb-s3-cloudresumechallenge-hosted"
  policy = "{\"Statement\":[{\"Action\":\"s3:GetObject\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Resource\":\"arn:aws:s3:::agb-s3-cloudresumechallenge-hosted/*\",\"Sid\":\"PublicReadGetObject\"}],\"Version\":\"2012-10-17\"}"
}

resource "aws_s3_bucket_policy" "tfer--agb-s3-cloudresumechallenge-logging" {
  bucket = "agb-s3-cloudresumechallenge-logging"
  policy = "{\"Id\":\"S3-Console-Auto-Gen-Policy-1716338986262\",\"Statement\":[{\"Action\":\"s3:PutObject\",\"Condition\":{\"StringEquals\":{\"aws:SourceAccount\":\"339712851438\"}},\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"logging.s3.amazonaws.com\"},\"Resource\":\"arn:aws:s3:::agb-s3-cloudresumechallenge-logging/*\",\"Sid\":\"S3PolicyStmt-DO-NOT-MODIFY-1716338986157\"}],\"Version\":\"2012-10-17\"}"
}

resource "aws_s3_bucket_policy" "tfer--agb-s3-cloudresumechallenge-staging" {
  bucket = "agb-s3-cloudresumechallenge-staging"
  policy = "{\"Statement\":[{\"Action\":\"s3:GetObject\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Resource\":\"arn:aws:s3:::agb-s3-cloudresumechallenge-staging/*\",\"Sid\":\"PublicReadGetObject\"}],\"Version\":\"2012-10-17\"}"
}
