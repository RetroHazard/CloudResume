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

#  End S3 Block  #
##################


##########################
# Begin CloudFront Block #

resource "aws_cloudfront_cache_policy" "crc-default-caching-policy" {
  comment     = "Policy with caching enabled. Supports Gzip and Brotli compression."
  default_ttl = "86400"
  max_ttl     = "31536000"
  min_ttl     = "1"
  name        = "Managed-CachingOptimized"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    enable_accept_encoding_brotli = "true"
    enable_accept_encoding_gzip   = "true"

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_distribution" "crc-cf-production-distribution" {
  aliases = ["*.cloudresume-agb.jp", "www.cloudresume-agb.jp"]
  comment = "Production Distribution for Cloud Resume"

  custom_error_response {
    error_caching_min_ttl = "10"
    error_code            = "403"
    response_code         = "400"
    response_page_path    = "/"
  }

  default_cache_behavior { // todo: get bucket from terraform
    allowed_methods        = ["GET", "HEAD"]
    cache_policy_id        = aws_cloudfront_cache_policy.crc-default-caching-policy.id
    cached_methods         = ["GET", "HEAD"]
    compress               = "true"
    default_ttl            = "0"
    max_ttl                = "0"
    min_ttl                = "0"
    smooth_streaming       = "false"
    target_origin_id       = aws_s3_bucket.crc-agb-s3-website-prod.website_endpoint
    viewer_protocol_policy = "redirect-to-https"
  }

  enabled         = "true"
  http_version    = "http2"
  is_ipv6_enabled = "false"

  logging_config {
    bucket          = aws_s3_bucket.crc-agb-s3-website-logging.website_domain
    include_cookies = "false"
    prefix          = "cf_crc_production/"
  }

  origin {
    connection_attempts = "3"
    connection_timeout  = "10"

    custom_origin_config {
      http_port                = "80"
      https_port               = "443"
      origin_keepalive_timeout = "5"
      origin_protocol_policy   = "http-only"
      origin_read_timeout      = "30"
      origin_ssl_protocols     = ["SSLv3", "TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    domain_name = aws_s3_bucket.crc-agb-s3-website-prod.bucket_domain_name
    origin_id   = aws_s3_bucket.crc-agb-s3-website-prod.id

    origin_shield {
      enabled              = "true"
      origin_shield_region = aws_s3_bucket.crc-agb-s3-website-prod.region
    }
  }


  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  retain_on_delete = "false"
  staging          = "false"

  viewer_certificate { // todo: get arn from terraform
    acm_certificate_arn            = "arn:aws:acm:us-east-1:${data.aws_caller_identity.current.account_id}:certificate/d2c204b7-bb92-437a-b2d8-a9dcd55aea97"
    cloudfront_default_certificate = "false"
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }

  web_acl_id = "arn:aws:wafv2:us-east-1:${data.aws_caller_identity.current.account_id}:global/webacl/CloudResume-WebACL/c38b9d17-1bdf-4d05-ad66-edee4866bbbc"
}

resource "aws_cloudfront_distribution" "crc-cf-staging-distribution" {
  aliases = ["staging.cloudresume-agb.jp"]
  comment = "Staging Distribution for Cloud Resume"

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cache_policy_id = aws_cloudfront_cache_policy.crc-default-caching-policy.id
    cached_methods  = ["GET", "HEAD"]
    compress        = "true"
    default_ttl     = "0"

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.crc-StagingAuthorization.arn
    }
// todo: get bucket from terraform
    max_ttl                = "0"
    min_ttl                = "0"
    smooth_streaming       = "false"
    target_origin_id       = aws_s3_bucket.crc-agb-s3-website-staging.website_endpoint
    viewer_protocol_policy = "redirect-to-https"
  }

  enabled         = "true"
  http_version    = "http2"
  is_ipv6_enabled = "true"
// todo: get bucket from terraform
  logging_config {
    bucket          = aws_s3_bucket.crc-agb-s3-website-staging.bucket_domain_name
    include_cookies = "false"
    prefix          = "cf_crc_staging/"
  }

  origin {
    connection_attempts = "3"
    connection_timeout  = "10"

    custom_origin_config {
      http_port                = "80"
      https_port               = "443"
      origin_keepalive_timeout = "5"
      origin_protocol_policy   = "http-only"
      origin_read_timeout      = "30"
      origin_ssl_protocols     = ["SSLv3", "TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    domain_name = aws_s3_bucket.crc-agb-s3-website-staging.bucket_domain_name
    origin_id   = aws_s3_bucket.crc-agb-s3-website-staging.id

    origin_shield {
      enabled              = "true"
      origin_shield_region = aws_s3_bucket.crc-agb-s3-website-staging.region
    }
  }

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  retain_on_delete = "false"
  staging          = "false"

  viewer_certificate { // TODO: Update ARN
    acm_certificate_arn            = "arn:aws:acm:us-east-1:${data.aws_caller_identity.current.account_id}:certificate/d2c204b7-bb92-437a-b2d8-a9dcd55aea97"
    cloudfront_default_certificate = "false"
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }

  web_acl_id = "arn:aws:wafv2:us-east-1:${data.aws_caller_identity.current.account_id}:global/webacl/CloudResume-WebACL/c38b9d17-1bdf-4d05-ad66-edee4866bbbc"
}

resource "aws_cloudfront_function" "crc-StagingAuthorization" {
  name    = "StagingAuthorization"
  runtime = "cloudfront-js-1.0"
  comment = "Simple Authorization for Access to Staging Distribution"
  publish = true
  code    = file("${path.root}/codebase/stagingAuthorization.js")
}

#  End CloudFront Block  #
##########################
