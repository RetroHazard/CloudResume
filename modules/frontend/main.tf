#######################################
# Cloud Resume - Front End Components #
#######################################

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
  target_prefix = "crc_access_log-prod/"
}

resource "aws_s3_bucket_versioning" "crc-agb-s3-website-prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "crc_agb_s3_website_prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "PublicReadGetObject"
        Effect = "Allow"
        Principal = "*"
        Action = "s3:GetObject"
        Resource = "${aws_s3_bucket.crc-agb-s3-website-prod.arn}/*"
      }
    ]
  })
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
  target_prefix = "crc_access_log-stage/"
}

resource "aws_s3_bucket_versioning" "crc-agb-s3-website-staging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-staging.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "crc-agb-s3-website-staging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-staging.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "PublicReadGetObject"
        Effect = "Allow"
        Principal = "*"
        Action = "s3:GetObject"
        Resource = "${aws_s3_bucket.crc-agb-s3-website-staging.arn}/*"
      }
    ]
  })
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
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "S3PolicyStmt-DO-NOT-MODIFY"
        Effect = "Allow"
        Principal = {
          Service = "logging.s3.amazonaws.com"
        }
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.crc-agb-s3-website-logging.arn}/*"
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = var.account_id
          }
        }
      }
    ]
  })
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
  aliases = ["*.${data.aws_route53_zone.crc-domain-name}", "www.${data.aws_route53_zone.crc-domain-name}"]
  comment = "Production Distribution for Cloud Resume"

  custom_error_response {
    error_caching_min_ttl = "10"
    error_code            = "403"
    response_code         = "400"
    response_page_path    = "/"
  }

  default_cache_behavior {
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

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.crc-website-certificate.arn
    cloudfront_default_certificate = "false"
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }
  web_acl_id = var.waf-acl-arn
}

resource "aws_cloudfront_distribution" "crc-cf-staging-distribution" {
  aliases = ["staging.${data.aws_route53_zone.crc-domain-name}"]
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

    max_ttl                = "0"
    min_ttl                = "0"
    smooth_streaming       = "false"
    target_origin_id       = aws_s3_bucket.crc-agb-s3-website-staging.website_endpoint
    viewer_protocol_policy = "redirect-to-https"
  }

  enabled         = "true"
  http_version    = "http2"
  is_ipv6_enabled = "true"

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

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.crc-website-certificate.arn
    cloudfront_default_certificate = "false"
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }
  web_acl_id = var.waf-acl-arn
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


############################
# Begin Certificates Block #

resource "aws_acm_certificate" "crc-website-certificate" {
  provider = aws.us-east-1
  domain_name   = "*.${data.aws_route53_zone.crc-domain-name}"
  key_algorithm = "RSA_2048"

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }
  
  subject_alternative_names = ["*.${data.aws_route53_zone.crc-domain-name}"]

  validation_method = "DNS"
}

#  End Certificates Block  #
############################


###########################
# Begin Key Manager Block #

resource "aws_kms_alias" "crc-dnssec-key" {
  provider = aws.us-east-1
  name          = "alias/cloudresume_dnssec"
  target_key_id = aws_kms_key.crc-dnssec-key.key_id
}

resource "aws_kms_key" "crc-dnssec-key" {
  provider = aws.us-east-1

  customer_master_key_spec = "ECC_NIST_P256"
  description              = "Keys used for the purpose of signing DNSSEC"
  enable_key_rotation      = "false"
  is_enabled               = "true"
  key_usage                = "SIGN_VERIFY"
  multi_region             = "false"
  policy = jsonencode({
    Statement = [
      {
        Action = [
          "kms:DescribeKey",
          "kms:GetPublicKey",
          "kms:Sign",
        ],
        Effect = "Allow"
        Principal = {
          Service = "dnssec-route53.amazonaws.com"
        }
        Sid      = "Allow Route 53 DNSSEC Service",
        Resource = "*"
      },
      {
        Action = "kms:CreateGrant",
        Effect = "Allow"
        Principal = {
          Service = "dnssec-route53.amazonaws.com"
        }
        Sid      = "Allow Route 53 DNSSEC Service to CreateGrant",
        Resource = "*"
        Condition = {
          Bool = {
            "kms:GrantIsForAWSResource" = "true"
          }
        }
      },
      {
        Action = "kms:*"
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Resource = "*"
        Sid      = "IAM User Permissions"
      },
    ]
    Version = "2012-10-17"
  })
}

#  End Key Manager Block  #
###########################


#######################
# Begin Route53 Block #

data "aws_route53_zone" "crc-domain-name" {
  name = var.domain-name
}

data "aws_route53_zone" "crc-hosted-zone"{
  zone_id = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_ses_domain_identity" "crc-ses-domain-id" {
  domain = var.domain-name
}

resource "aws_ses_domain_dkim" "crc-ses-domain-dkim" {
  domain = aws_ses_domain_identity.crc-ses-domain-id.domain
}

resource "aws_route53_zone" "crc-hosted-zone" {
  comment       = "Hosted Zone for Cloud Resume Project"
  force_destroy = "false"
  name          = data.aws_route53_zone.crc-domain-name
}

resource "aws_route53_key_signing_key" "crc-dnssec-ksk" {
  name = data.aws_route53_zone.crc-domain-name
  hosted_zone_id = data.aws_route53_zone.crc-domain-name.id
  key_management_service_arn = aws_kms_key.crc-dnssec-key.arn
}

resource "aws_route53_hosted_zone_dnssec" "crc-hosted-zone" {
  depends_on = [
    aws_route53_key_signing_key.crc-dnssec-ksk
  ]
  hosted_zone_id = aws_route53_key_signing_key.crc-dnssec-ksk.hosted_zone_id
}

resource "aws_route53_record" "crc-dns-zone-core-record-NS" {
  name    = data.aws_route53_zone.crc-hosted-zone.name
  records = data.aws_route53_zone.crc-hosted-zone.name_servers
  ttl     = "172800"
  type    = "NS"
  zone_id = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-core-record-SOA" {
  name = data.aws_route53_zone.crc-hosted-zone.name
  records = [
    "${data.aws_route53_zone.crc-hosted-zone.name_servers[0]}. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
  ]
  ttl     = "900"
  type    = "SOA"
  zone_id = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-api-record-A" {
  alias {
    evaluate_target_health = "false"
    //todo get from api gateway
    name                   = "d9zhaw4xflnb4.cloudfront.net"
    zone_id                = aws_route53_zone.crc-hosted-zone.zone_id
  }

  name                             = "api.${data.aws_route53_zone.crc-domain-name}"
  type                             = "A"
  zone_id                          = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-ses-record-MX" {
  name                             = "contact.${data.aws_route53_zone.crc-domain-name}"
  //todo Get Record from SES
  records                          = ["10 feedback-smtp.ap-northeast-1.amazonses.com"]
  ttl                              = "300"
  type                             = "MX"
  zone_id                          = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-ses-record-TXT" {
  name                             = "contact.${data.aws_route53_zone.crc-domain-name}"
  //todo Get Record from SES
  records                          = ["v=spf1 include:amazonses.com ~all"]
  ttl                              = "300"
  type                             = "TXT"
  zone_id                          = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-ses-dkim-record-CNAME" {
  count  = length(aws_ses_domain_dkim.crc-ses-domain-dkim.dkim_tokens)
  name   = "${element(aws_ses_domain_dkim.crc-ses-domain-dkim.dkim_tokens, count.index)}._domainkey.${aws_ses_domain_identity.crc-ses-domain-id.domain}"
  records = ["${element(aws_ses_domain_dkim.crc-ses-domain-dkim.dkim_tokens, count.index)}.dkim.amazonses.com"]
  ttl    = "600"
  type   = "CNAME"
  zone_id = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-ses-dmarc-record-TXT" {
  name    = "_dmarc.${aws_ses_domain_identity.crc-ses-domain-id.domain}"
  records = ["v=DMARC1; p=none;"]
  ttl     = "300"
  type    = "TXT"
  zone_id = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-record-A" {
  alias {
    evaluate_target_health = "false"
    name                   = aws_cloudfront_distribution.crc-cf-production-distribution.domain_name
    zone_id                = aws_route53_zone.crc-hosted-zone.zone_id
  }

  name                             = data.aws_route53_zone.crc-domain-name
  type                             = "A"
  zone_id                          = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-www-record-A" {
  alias {
    evaluate_target_health = "false"
    name                   = aws_cloudfront_distribution.crc-cf-production-distribution.domain_name
    zone_id                = aws_route53_zone.crc-hosted-zone.zone_id
  }

  name                             = "www.${data.aws_route53_zone.crc-domain-name}"
  type                             = "A"
  zone_id                          = aws_route53_zone.crc-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-staging-record-A" {
  alias {
    evaluate_target_health = "false"
    name                   = aws_cloudfront_distribution.crc-cf-staging-distribution.domain_name
    zone_id                = aws_route53_zone.crc-hosted-zone.zone_id
  }

  name                             = "staging.${data.aws_route53_zone.crc-domain-name}"
  type                             = "A"
  zone_id                          = aws_route53_zone.crc-hosted-zone.zone_id
}

#  End Route53 Block  #
#######################


###########################
# Begin API Gateway Block #

resource "aws_api_gateway_rest_api" "crc-rest-api" {
  api_key_source               = "AUTHORIZER"
  description                  = "MultiPurpose API for CloudResume Site"
  disable_execute_api_endpoint = "true"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  name = "CloudResume_API"
}

resource "aws_api_gateway_deployment" "crc-api-deployment" {
  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.crc-rest-api.body))
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "crc-api-stage" {
  cache_cluster_enabled = "false"
  deployment_id         = aws_api_gateway_deployment.crc-api-deployment.id
  rest_api_id           = aws_api_gateway_deployment.crc-api-deployment.rest_api_id
  stage_name            = aws_api_gateway_deployment.crc-api-deployment.stage_name
}

resource "aws_api_gateway_resource" "crc-api-resource" {
  parent_id   = ""
  path_part   = ""
  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_resource" "crc-api-resource-visitors" {
  parent_id   = aws_api_gateway_rest_api.crc-rest-api.root_resource_id
  path_part   = "visitors"
  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_resource" "crc-api-resource-contact" {
  parent_id   = aws_api_gateway_rest_api.crc-rest-api.root_resource_id
  path_part   = "contact"
  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_request_validator" "crc-api-param-validator" {
  name                        = aws_api_gateway_request_validator.crc-api-param-validator.id
  rest_api_id                 = aws_api_gateway_rest_api.crc-rest-api.id
  validate_request_body       = false
  validate_request_parameters = true
}

resource "aws_api_gateway_gateway_response" "crc-api-response-default-4XX" {
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_type = "DEFAULT_4XX"
  rest_api_id   = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_gateway_response" "crc-api-response-default-5XX" {
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }

  response_type = "DEFAULT_5XX"
  rest_api_id   = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_integration" "crc-api-visitors-get" {
  cache_namespace         = aws_api_gateway_resource.crc-api-resource-visitors.id
  connection_type         = "INTERNET"
  content_handling        = "CONVERT_TO_TEXT"
  http_method             = "GET"
  integration_http_method = "POST"
  passthrough_behavior    = "WHEN_NO_MATCH"
  resource_id             = aws_api_gateway_resource.crc-api-resource-visitors.id
  rest_api_id             = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds    = "29000"
  type                    = "AWS_PROXY"
  uri                     = var.api-lambda-visitors-uri
}

resource "aws_api_gateway_integration" "crc-api-visitors-options" {
  cache_namespace      = aws_api_gateway_resource.crc-api-resource-visitors.id
  connection_type      = "INTERNET"
  http_method          = "OPTIONS"
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }

  resource_id          = aws_api_gateway_resource.crc-api-resource-visitors.id
  rest_api_id          = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds = "29000"
  type                 = "MOCK"
}

resource "aws_api_gateway_integration" "crc-cpi-contact-options" {
  cache_namespace      = aws_api_gateway_resource.crc-api-resource-contact.id
  connection_type      = "INTERNET"
  http_method          = "OPTIONS"
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }

  resource_id          = aws_api_gateway_resource.crc-api-resource-contact.id
  rest_api_id          = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds = "29000"
  type                 = "MOCK"
}

resource "aws_api_gateway_integration" "crc-api-contact-post" {
  cache_namespace         = aws_api_gateway_resource.crc-api-resource-contact.id
  connection_type         = "INTERNET"
  content_handling        = "CONVERT_TO_TEXT"
  http_method             = "POST"
  integration_http_method = "POST"
  passthrough_behavior    = "WHEN_NO_MATCH"
  resource_id             = aws_api_gateway_resource.crc-api-resource-contact.id
  rest_api_id             = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds    = "29000"
  type                    = "AWS_PROXY"
  uri                     = var.api-lambda-contact-uri
}

resource "aws_api_gateway_integration_response" "crc-api-visitors-get" {
  http_method = "GET"
  resource_id = aws_api_gateway_resource.crc-api-resource-visitors.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "crc-api-visitors-options" {
  http_method = "OPTIONS"
  resource_id = aws_api_gateway_resource.crc-api-resource-visitors.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "crc-api-contact-options" {
  http_method = "OPTIONS"
  resource_id = aws_api_gateway_resource.crc-api-resource-contact.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "crc-api-contact-post" {
  http_method = "POST"
  resource_id = aws_api_gateway_resource.crc-api-resource-contact.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method" "crc-api-visitors-get" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "GET"

  request_parameters = {
    "method.request.querystring.visitorId" = "true"
  }

  request_validator_id = aws_api_gateway_request_validator.crc-api-param-validator.id
  resource_id          = aws_api_gateway_resource.crc-api-resource-visitors.id
  rest_api_id          = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_method" "crc-api-visitors-options" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "OPTIONS"
  resource_id      = aws_api_gateway_resource.crc-api-resource-visitors.id
  rest_api_id      = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_method" "crc-api-contact-options" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "OPTIONS"
  resource_id      = aws_api_gateway_resource.crc-api-resource-contact.id
  rest_api_id      = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_method" "crc-api-contact-post" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "POST"

  request_parameters = {
    "method.request.querystring.uuid" = "true"
  }

  request_validator_id = aws_api_gateway_request_validator.crc-api-param-validator.id
  resource_id          = aws_api_gateway_resource.crc-api-resource-contact.id
  rest_api_id          = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_method_response" "crc-api-visitors-get" {
  http_method = "GET"
  resource_id = aws_api_gateway_resource.crc-api-resource-visitors.id

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "false"
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method_response" "crc-api-visitors-options" {
  http_method = "OPTIONS"
  resource_id = aws_api_gateway_resource.crc-api-resource-visitors.id

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "false"
    "method.response.header.Access-Control-Allow-Methods" = "false"
    "method.response.header.Access-Control-Allow-Origin"  = "false"
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method_response" "crc-api-contact-options" {
  http_method = "OPTIONS"
  resource_id = aws_api_gateway_resource.crc-api-resource-contact.id

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "false"
    "method.response.header.Access-Control-Allow-Methods" = "false"
    "method.response.header.Access-Control-Allow-Origin"  = "false"
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method_response" "crc-api-contact-post" {
  http_method = "POST"
  resource_id = aws_api_gateway_resource.crc-api-resource-contact.id

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "false"
    "method.response.header.Access-Control-Allow-Methods" = "false"
    "method.response.header.Access-Control-Allow-Origin"  = "false"
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_model" "crc-api-default-empty-model" {
  content_type = "application/json"
  description  = "This is a default empty schema model"
  name         = "Empty"
  rest_api_id  = aws_api_gateway_rest_api.crc-rest-api.id
  schema       = "{\n  \"$schema\": \"http://json-schema.org/draft-04/schema#\",\n  \"title\" : \"Empty Schema\",\n  \"type\" : \"object\"\n}"
}

resource "aws_api_gateway_model" "crc-api-default-error-model" {
  content_type = "application/json"
  description  = "This is a default error schema model"
  name         = "Error"
  rest_api_id  = aws_api_gateway_rest_api.crc-rest-api.id
  schema       = "{\n  \"$schema\" : \"http://json-schema.org/draft-04/schema#\",\n  \"title\" : \"Error Schema\",\n  \"type\" : \"object\",\n  \"properties\" : {\n    \"message\" : { \"type\" : \"string\" }\n  }\n}"
}

#  End API Gateway Block  #
###########################
