#######################
# Begin Route53 Block #

data "aws_route53_zone" "crc-domain-name" {
  depends_on = [aws_route53_zone.crc-new-hosted-zone]
  name       = var.domain-name
}

data "aws_route53_zone" "crc-new-hosted-zone" {
  zone_id = aws_route53_zone.crc-new-hosted-zone.zone_id
}

data "aws_cloudfront_log_delivery_canonical_user_id" "current" {}

data "aws_canonical_user_id" "current" {}

##################
# Begin S3 Block #

data "aws_iam_policy_document" "crc-agb-s3-website-prod-oac" {
  version = "2012-10-17"

  statement {
    sid       = "S3 Bucket Policy Restricting Access to CloudFront"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.crc-agb-s3-website-prod.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.crc-cf-production-distribution.arn]
    }
  }

  # CloudFront never issues a ListBucket call, and this does not make anything publicly
  # listable — the grant exists purely to change what S3 returns for a key that is not
  # there. Without s3:ListBucket, S3 answers a missing key with 403 AccessDenied rather
  # than 404 NoSuchKey, which is why the distribution's SPA fallback used to have to map
  # 403. That mapping is distribution-wide and cannot be scoped to a single behavior, so
  # it also swallowed the 403 CloudFront returns for an invalid signed URL and handed back
  # the app shell with a 200. Granting ListBucket lets the fallback move to 404, which
  # leaves a rejected signature on /files/* surfacing as a real 403.
  statement {
    sid       = "S3 Bucket Policy Allowing CloudFront to Distinguish Missing Keys"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.crc-agb-s3-website-prod.arn]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.crc-cf-production-distribution.arn]
    }
  }
}

data "aws_iam_policy_document" "crc-agb-s3-website-logging" {
  version = "2012-10-17"

  statement {
    sid       = "S3 Bucket Policy Restricting Access to S3 Logging Service"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.crc-agb-s3-website-logging.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["logging.s3.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceAccount"
      values   = [var.account_id]
    }
  }
}