#  End Key Manager Block  #
###########################

##########################
# Begin CloudFront Block #

data "template_file" "crc-cf-staging-auth" {
  template = file("${path.root}/codebase/stagingAuthorization.js")

  vars = {
    STAGINGUSER = var.staging-user
    STAGINGPASS = var.staging-pass
  }
}

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
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.crc-agb-s3-website-prod.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.crc-cf-production-distribution.arn]
    }
  }
}

data "aws_iam_policy_document" "crc-agb-s3-website-staging-oac" {

  version = "2012-10-17"
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.crc-agb-s3-website-staging.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.crc-cf-staging-distribution.arn]
    }
  }
}
