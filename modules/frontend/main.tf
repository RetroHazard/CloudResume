#######################################
# Cloud Resume - Front End Components #
#######################################

provider "random" {}

resource "random_string" "bucket_suffix" {
  length = 6
  special = false
  upper = false
}

##################
# Begin S3 Block #

resource "aws_s3_bucket" "crc-agb-s3-website-prod" {
  bucket        = "crc-agb-s3-website-prod-${random_string.bucket_suffix.result}"
  force_destroy = "false"

  object_lock_enabled = "false"
}

resource "aws_s3_bucket_lifecycle_configuration" "crc-agb-s3-website-prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id

  rule {
    id     = "Remove Stale Entries"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }

    expiration {
      expired_object_delete_marker = true
      days                         = 0
    }

    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }
}

resource "aws_s3_bucket_logging" "crc-agb-s3-website-prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id

  target_bucket = aws_s3_bucket.crc-agb-s3-website-logging.id
  target_prefix = "crc_prod_access_log/"
}

resource "aws_s3_bucket_versioning" "crc-agb-s3-website-prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "crc-agb-s3-website-prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id
  policy = "{\"Statement\":[{\"Action\":\"s3:GetObject\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Resource\":\"${aws_s3_bucket.crc-agb-s3-website-prod.arn}/*\",\"Sid\":\"PublicReadGetObject\"}],\"Version\":\"2012-10-17\"}"
}

resource "aws_s3_bucket_website_configuration" "crc-agb-s3-website-prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id

  index_document {
    suffix = "index.html"
  }
}


resource "aws_s3_bucket" "crc-agb-s3-website-staging" {
  bucket        = "crc-agb-s3-website-staging-${random_string.bucket_suffix.result}"
  force_destroy = "false"

  object_lock_enabled = "false"
}

resource "aws_s3_bucket_lifecycle_configuration" "crc-agb-s3-website-staging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-staging.id

  rule {
    id     = "Remove Stale Entries"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }

    expiration {
      expired_object_delete_marker = true
      days                         = 0
    }

    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }
}

resource "aws_s3_bucket_logging" "crc-agb-s3-website-staging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-staging.id

  target_bucket = aws_s3_bucket.crc-agb-s3-website-logging.id
  target_prefix = "crc_stage_access_log/"
}

resource "aws_s3_bucket_versioning" "crc-agb-s3-website-staging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-staging.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "crc-agb-s3-website-staging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-staging.id
  policy = "{\"Statement\":[{\"Action\":\"s3:GetObject\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Resource\":\"${aws_s3_bucket.crc-agb-s3-website-staging.arn}/*\",\"Sid\":\"PublicReadGetObject\"}],\"Version\":\"2012-10-17\"}"
}

resource "aws_s3_bucket_website_configuration" "crc-agb-s3-website-staging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-staging.id

  index_document {
    suffix = "index.html"
  }
}


resource "aws_s3_bucket" "crc-agb-s3-website-logging" {
  bucket        = "crc-agb-s3-website-logging-${random_string.bucket_suffix.result}"
  force_destroy = "false"

  object_lock_enabled = "false"
}

resource "aws_s3_bucket_policy" "crc-agb-s3-website-logging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-logging.id
  policy = "{\"Statement\":[{\"Action\":\"s3:PutObject\",\"Condition\":{\"StringEquals\":{\"aws:SourceAccount\":\"${var.account_id}\"}},\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"logging.s3.amazonaws.com\"},\"Resource\":\"${aws_s3_bucket.crc-agb-s3-website-logging.arn}/*\",\"Sid\":\"S3PolicyStmt-DO-NOT-MODIFY-1716338986157\"}],\"Version\":\"2012-10-17\"}"
}
