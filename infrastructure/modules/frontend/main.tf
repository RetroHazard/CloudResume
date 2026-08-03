#######################################
# Cloud Resume - Front End Components #
#######################################

resource "random_string" "bucket_suffix" {
  length  = 6
  special = false
  upper   = false
}

##################
# Begin S3 Block #

resource "aws_s3_bucket" "crc-agb-s3-website-prod" {
  bucket        = "crc-agb-s3-website-prod-${random_string.bucket_suffix.result}"
  force_destroy = "false"

  object_lock_enabled = "false"
}

resource "aws_s3_bucket_policy" "crc-agb-s3-website-prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id
  policy = data.aws_iam_policy_document.crc-agb-s3-website-prod-oac.json
}

resource "aws_s3_bucket_lifecycle_configuration" "crc-agb-s3-website-prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id

  rule {
    id     = "Remove Stale Entries"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }

    expiration {
      expired_object_delete_marker = true
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

resource "aws_s3_bucket_notification" "crc-agb-s3-website-prod" {
  bucket = aws_s3_bucket.crc-agb-s3-website-prod.id

  queue {
    events    = ["s3:ObjectCreated:*"]
    queue_arn = var.sqs-cf-invalidation-queue
  }
}


resource "aws_s3_bucket" "crc-agb-s3-website-logging" {
  bucket        = "crc-agb-s3-website-logging-${random_string.bucket_suffix.result}"
  force_destroy = "false"

  object_lock_enabled = "false"
}

resource "aws_s3_bucket_policy" "crc-agb-s3-website-logging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-logging.id
  policy = data.aws_iam_policy_document.crc-agb-s3-website-logging.json
}

resource "aws_s3_bucket_ownership_controls" "crc-agb-s3-website-logging" {
  bucket = aws_s3_bucket.crc-agb-s3-website-logging.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "crc-agb-s3-website-logging" {
  depends_on = [aws_s3_bucket_ownership_controls.crc-agb-s3-website-logging]

  bucket = aws_s3_bucket.crc-agb-s3-website-logging.id
  access_control_policy {
    grant {
      grantee {
        id   = data.aws_cloudfront_log_delivery_canonical_user_id.current.id
        type = "CanonicalUser"
      }
      permission = "FULL_CONTROL"
    }
    owner {
      id = data.aws_canonical_user_id.current.id
    }
  }

}

#  End S3 Block  #
##################


##########################
# Begin CloudFront Block #

resource "aws_cloudfront_distribution" "crc-cf-production-distribution" {
  depends_on = [aws_acm_certificate_validation.crc-website-certificate-validation]
  aliases    = [var.domain-name]
  comment    = "Production Distribution for Cloud Resume"

  # Client-side routing fallback. A key that isn't in the bucket comes back 404 —
  # that 404 is what every deep link (`/skills`, `/projects`) hits, and it has
  # to resolve to the app shell for the router to take over.
  #
  # It resolves as 200: these are real pages, and answering them 400 told
  # crawlers, link previewers and anything else reading the status line that
  # the site was rejecting its own URLs.
  #
  # This used to map 403, because without s3:ListBucket S3 reports a missing key as
  # AccessDenied rather than NoSuchKey. The bucket policy now grants ListBucket to the
  # distribution for exactly that reason (see data.tf), so the fallback can key off 404
  # instead. That matters beyond tidiness: a custom_error_response applies to the whole
  # distribution and cannot be scoped to one behavior, so while it mapped 403 it also
  # swallowed the 403 CloudFront returns for a missing or expired signature on /files/*,
  # handing back the app shell with a 200. WAF blocks were masked the same way.
  custom_error_response {
    error_caching_min_ttl = "10"
    error_code            = "404"
    response_code         = "200"
    response_page_path    = "/index.html"
  }

  # The CV is the one object on the site that is not free to fetch. Requests without a
  # valid signature are rejected at the edge before any of the body is transferred, so a
  # scraper cannot run up egress without first going through the /download endpoint —
  # which is throttled and counted.
  #
  # Reusing Managed-CachingOptimized is deliberate: Expires, Signature and Key-Pair-Id are
  # CloudFront-reserved, stripped before the cache key is computed and never forwarded to
  # S3. The object still caches once at the edge, and every viewer's signature is still
  # validated per request.
  ordered_cache_behavior {
    path_pattern           = "/files/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    target_origin_id       = aws_s3_bucket.crc-agb-s3-website-prod.id
    viewer_protocol_policy = "redirect-to-https"

    # A kill switch for the direct object URL, and nothing more. Turning it off makes
    # /files/…pdf fetchable by hand again, which is useful while debugging a signing
    # problem — but it does NOT restore the Download CV button, because the button calls
    # /download and never touches the plain path. If signing is broken, the button is
    # broken either way; this just means you can still get at the PDF.
    trusted_key_groups = var.signed-downloads-enabled ? [aws_cloudfront_key_group.crc-cf-signing-key-group.id] : []

    response_headers_policy_id = aws_cloudfront_response_headers_policy.crc-cf-cv-download.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = aws_s3_bucket.crc-agb-s3-website-prod.id
    viewer_protocol_policy = "redirect-to-https"
  }

  enabled             = "true"
  default_root_object = "index.html"
  http_version        = "http2"
  is_ipv6_enabled     = "false"

  logging_config {
    bucket          = aws_s3_bucket.crc-agb-s3-website-logging.bucket_domain_name
    include_cookies = "false"
    prefix          = "cf_crc_production/"
  }

  origin {
    connection_attempts = "3"
    connection_timeout  = "10"

    domain_name              = aws_s3_bucket.crc-agb-s3-website-prod.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.crc-agb-s3-website-prod.id
    origin_access_control_id = aws_cloudfront_origin_access_control.crc-cf-production-oac.id

    origin_shield {
      enabled              = "true"
      origin_shield_region = aws_s3_bucket.crc-agb-s3-website-prod.bucket_region
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
  web_acl_id = var.waf-enabled ? var.waf-acl-arn : null
}

resource "aws_cloudfront_origin_access_control" "crc-cf-production-oac" {
  name                              = aws_s3_bucket.crc-agb-s3-website-prod.id
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Sourced from Parameter Store rather than a committed PEM — see data.tf for why.
#
# nonsensitive() because the provider marks every parameter value sensitive regardless of
# type. Left alone, a key rotation would render in the plan as "(sensitive value)", which
# is precisely the diff worth reading. This one is a public key.
#
# name_prefix plus create_before_destroy is what makes rotation possible at all.
# encoded_key forces replacement, and a fixed name would collide with itself mid-swap.
resource "aws_cloudfront_public_key" "crc-cf-signing-key" {
  comment     = "Public half of the signed-URL key pair for /files/*"
  encoded_key = nonsensitive(data.aws_ssm_parameter.crc-cf-signing-public-key.value)
  name_prefix = "crc-cf-signing-key-"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudfront_key_group" "crc-cf-signing-key-group" {
  comment = "Key group trusted to sign /files/* URLs"
  items   = [aws_cloudfront_public_key.crc-cf-signing-key.id]
  name    = "crc-cf-signing-key-group"
}

# Makes the download a download regardless of the link's `download` attribute, which
# browsers only honour same-origin and drop silently otherwise.
resource "aws_cloudfront_response_headers_policy" "crc-cf-cv-download" {
  name    = "crc-cf-cv-download"
  comment = "Forces the CV to download rather than render in the browser's PDF viewer"

  custom_headers_config {
    items {
      header   = "Content-Disposition"
      value    = "attachment"
      override = true
    }
  }
}


#  End CloudFront Block  #
##########################


############################
# Begin Certificates Block #

resource "aws_acm_certificate" "crc-website-certificate" {
  domain_name               = var.domain-name
  subject_alternative_names = ["*.${var.domain-name}"]
  key_algorithm             = "RSA_2048"
  validation_method         = "DNS"

  tags = {
    Name = var.domain-name
  }

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "crc-website-certificate-validation" {
  certificate_arn         = aws_acm_certificate.crc-website-certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.crc-new-hosted-zone-validation-record : record.fqdn]
}

resource "aws_ses_domain_identity" "crc-ses-domain-id" {
  domain = var.domain-name
}

resource "aws_ses_domain_dkim" "crc-ses-domain-dkim" {
  domain = aws_ses_domain_identity.crc-ses-domain-id.domain
}

resource "aws_route53_zone" "crc-new-hosted-zone" {
  comment       = "Cloud Resume Domain"
  force_destroy = false
  name          = var.domain-name

  lifecycle {
    prevent_destroy       = true
    create_before_destroy = true
  }
}

/* Deprecated as per #61
resource "aws_route53_key_signing_key" "crc-dnssec-ksk" {
  name                       = var.domain-name
  hosted_zone_id             = data.aws_route53_zone.crc-domain-name.id
  status                     = "ACTIVE"
  key_management_service_arn = aws_kms_key.crc-dnssec-key.arn
}

resource "aws_route53_hosted_zone_dnssec" "crc-new-hosted-zone" {
  depends_on = [
    aws_route53_key_signing_key.crc-dnssec-ksk
  ]
  hosted_zone_id = aws_route53_key_signing_key.crc-dnssec-ksk.hosted_zone_id
}
*/

resource "aws_route53_health_check" "crc-website-health-check-prod" {
  depends_on = [
    aws_cloudfront_distribution.crc-cf-production-distribution
  ]
  reference_name    = "crc-website-prod"
  fqdn              = var.domain-name
  port              = 443
  resource_path     = "/index.html"
  type              = "HTTPS"
  failure_threshold = "5"
  request_interval  = "30"
  enable_sni        = true
}

resource "aws_route53_record" "crc-new-hosted-zone-validation-record" {
  for_each = {
    for dvo in aws_acm_certificate.crc-website-certificate.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.crc-new-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-api-record-A" {
  alias {
    evaluate_target_health = "false"
    name                   = aws_api_gateway_domain_name.crc-api-domain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.crc-api-domain.cloudfront_zone_id
  }

  name    = "api.${var.domain-name}"
  type    = "A"
  zone_id = aws_route53_zone.crc-new-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-ses-record-MX" {
  name    = var.ses-mail-from-domain
  records = ["10 feedback-smtp.${data.aws_region.current.region}.amazonses.com"]
  ttl     = "600"
  type    = "MX"
  zone_id = aws_route53_zone.crc-new-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-ses-record-TXT" {
  name    = var.ses-mail-from-domain
  records = ["v=spf1 include:amazonses.com -all"]
  ttl     = "600"
  type    = "TXT"
  zone_id = aws_route53_zone.crc-new-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-ses-dkim-record-CNAME" {
  count   = 3
  name    = "${aws_ses_domain_dkim.crc-ses-domain-dkim.dkim_tokens[count.index]}._domainkey"
  records = ["${aws_ses_domain_dkim.crc-ses-domain-dkim.dkim_tokens[count.index]}.dkim.amazonses.com"]
  ttl     = "600"
  type    = "CNAME"
  zone_id = aws_route53_zone.crc-new-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-ses-dmarc-record-TXT" {
  name    = "_dmarc.${aws_ses_domain_identity.crc-ses-domain-id.domain}"
  records = ["v=DMARC1; p=none;"]
  ttl     = "300"
  type    = "TXT"
  zone_id = aws_route53_zone.crc-new-hosted-zone.zone_id
}

resource "aws_route53_record" "crc-dns-zone-record-A" {
  alias {
    evaluate_target_health = "false"
    name                   = aws_cloudfront_distribution.crc-cf-production-distribution.domain_name
    zone_id                = aws_cloudfront_distribution.crc-cf-production-distribution.hosted_zone_id
  }

  name    = var.domain-name
  type    = "A"
  zone_id = aws_route53_zone.crc-new-hosted-zone.zone_id
}

#  End Route53 Block  #
#######################


###########################
# Begin API Gateway Block #

resource "aws_api_gateway_account" "crc-api-logging-role" {
  cloudwatch_role_arn = var.api-gateway-cw-logs-role
}

resource "aws_api_gateway_rest_api" "crc-rest-api" {
  description                  = "MultiPurpose API for CloudResume Site"
  disable_execute_api_endpoint = "true"

  name = "CloudResume_API"
}

resource "aws_api_gateway_domain_name" "crc-api-domain" {
  depends_on      = [aws_acm_certificate_validation.crc-website-certificate-validation]
  domain_name     = "api.${var.domain-name}"
  certificate_arn = aws_acm_certificate.crc-website-certificate.arn
  endpoint_configuration {
    types = ["EDGE"]
  }
}

resource "aws_api_gateway_base_path_mapping" "crc-api-domain-deploy" {
  api_id      = aws_api_gateway_rest_api.crc-rest-api.id
  stage_name  = aws_api_gateway_stage.crc-api-stage.stage_name
  domain_name = aws_api_gateway_domain_name.crc-api-domain.domain_name
  base_path   = aws_api_gateway_stage.crc-api-stage.stage_name
}

resource "aws_api_gateway_stage" "crc-api-stage" {
  cache_cluster_enabled = "false"
  deployment_id         = aws_api_gateway_deployment.crc-api-deployment.id
  rest_api_id           = aws_api_gateway_deployment.crc-api-deployment.rest_api_id
  stage_name            = var.api-current-stage
}

resource "aws_api_gateway_deployment" "crc-api-deployment" {
  depends_on = [
    aws_api_gateway_integration.crc-api-visitors-get,
    aws_api_gateway_method.crc-api-visitors-options,
    aws_api_gateway_integration.crc-api-contact-post,
    aws_api_gateway_method.crc-api-contact-options,
    aws_api_gateway_integration.crc-api-download-get,
    aws_api_gateway_method.crc-api-download-options
  ]

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id

  # This used to hash `aws_api_gateway_rest_api.crc-rest-api.body`. That attribute is only
  # set when an API is defined from an OpenAPI document; this one is built from discrete
  # resources, so it is null, jsonencode(null) is the constant string "null", and the
  # trigger never changed. depends_on only orders creation — it does not replace an
  # existing deployment — so a newly added route would have been created but never
  # deployed to the stage, answering 403 Missing Authentication Token indefinitely.
  #
  # Hashing the route surface itself is the documented pattern. Any new resource, method
  # or integration has to be added here or it will not go live.
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.crc-api-resource-visitors,
      aws_api_gateway_method.crc-api-visitors-get,
      aws_api_gateway_integration.crc-api-visitors-get,
      aws_api_gateway_method.crc-api-visitors-options,
      aws_api_gateway_integration.crc-api-visitors-options,
      aws_api_gateway_resource.crc-api-resource-contact,
      aws_api_gateway_method.crc-api-contact-post,
      aws_api_gateway_integration.crc-api-contact-post,
      aws_api_gateway_method.crc-api-contact-options,
      aws_api_gateway_integration.crc-api-contact-options,
      aws_api_gateway_resource.crc-api-resource-download,
      aws_api_gateway_method.crc-api-download-get,
      aws_api_gateway_integration.crc-api-download-get,
      aws_api_gateway_method.crc-api-download-options,
      aws_api_gateway_integration.crc-api-download-options,
    ]))
  }
  lifecycle {
    create_before_destroy = true
  }
}

# api.<domain> is an edge-optimized endpoint with its own internal CloudFront distribution
# and no WAF in front of it (the CloudResume-WebACL is CLOUDFRONT-scoped and only ever
# covered the website distribution, and waf_enabled defaults to false in any case). These
# throttles are therefore the only thing bounding what the API can be made to cost.
resource "aws_api_gateway_method_settings" "crc-api-throttle-all" {
  # The log group must exist before logging_level turns logging on, or API Gateway creates
  # it implicitly first and Terraform then fails trying to create one that already exists.
  depends_on = [
    aws_api_gateway_account.crc-api-logging-role,
    aws_cloudwatch_log_group.crc-api-execution-logs
  ]

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  stage_name  = aws_api_gateway_stage.crc-api-stage.stage_name
  method_path = "*/*"

  settings {
    throttling_rate_limit  = var.api-throttle-rate-limit
    throttling_burst_limit = var.api-throttle-burst-limit
    metrics_enabled        = true
    data_trace_enabled     = false
    logging_level          = "ERROR"
  }
}

# Tighter than the default, because each call here mints a credential for a paid egress
# path. depends_on is required rather than cosmetic: both resources PATCH the same stage,
# and without ordering the wildcard can land second and overwrite this override.
resource "aws_api_gateway_method_settings" "crc-api-throttle-download" {
  depends_on = [aws_api_gateway_method_settings.crc-api-throttle-all]

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  stage_name  = aws_api_gateway_stage.crc-api-stage.stage_name
  method_path = "download/GET"

  settings {
    throttling_rate_limit  = var.api-throttle-download-rate-limit
    throttling_burst_limit = var.api-throttle-download-burst-limit
  }
}

# Enabling logging_level above makes API Gateway create this group implicitly, with
# never-expire retention — it would be the only unbounded log group in the account, since
# every Lambda group here is pinned to 14 days. Declaring it keeps that from happening.
resource "aws_cloudwatch_log_group" "crc-api-execution-logs" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.crc-rest-api.id}/${var.api-current-stage}"
  retention_in_days = 14
}



resource "aws_api_gateway_request_validator" "crc-api-param-validator" {
  name                        = "validate-request-parameters"
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

resource "aws_api_gateway_resource" "crc-api-resource-download" {
  parent_id   = aws_api_gateway_rest_api.crc-rest-api.root_resource_id
  path_part   = "download"
  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
}


// Track Visitors GET
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

resource "aws_api_gateway_integration" "crc-api-visitors-get" {
  depends_on = [aws_api_gateway_method.crc-api-visitors-get]

  cache_namespace         = aws_api_gateway_resource.crc-api-resource-visitors.id
  connection_type         = "INTERNET"
  content_handling        = "CONVERT_TO_TEXT"
  http_method             = aws_api_gateway_method.crc-api-visitors-get.http_method
  integration_http_method = "POST"
  passthrough_behavior    = "WHEN_NO_MATCH"
  resource_id             = aws_api_gateway_resource.crc-api-resource-visitors.id
  rest_api_id             = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds    = "29000"
  type                    = "AWS_PROXY"
  uri                     = var.api-lambda-visitors-uri
}

resource "aws_api_gateway_integration_response" "crc-api-visitors-get" {
  depends_on = [
    aws_api_gateway_integration.crc-api-visitors-get,
    aws_api_gateway_method_response.crc-api-visitors-get
  ]

  http_method = aws_api_gateway_method.crc-api-visitors-get.http_method
  resource_id = aws_api_gateway_resource.crc-api-resource-visitors.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method_response" "crc-api-visitors-get" {
  http_method = aws_api_gateway_method.crc-api-visitors-get.http_method
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


// Track Visitors OPTIONS
resource "aws_api_gateway_method" "crc-api-visitors-options" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "OPTIONS"
  resource_id      = aws_api_gateway_resource.crc-api-resource-visitors.id
  rest_api_id      = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_integration" "crc-api-visitors-options" {
  depends_on = [aws_api_gateway_method.crc-api-visitors-options]

  cache_namespace      = aws_api_gateway_resource.crc-api-resource-visitors.id
  connection_type      = "INTERNET"
  http_method          = aws_api_gateway_method.crc-api-visitors-options.http_method
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }

  resource_id          = aws_api_gateway_resource.crc-api-resource-visitors.id
  rest_api_id          = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds = "29000"
  type                 = "MOCK"
}

resource "aws_api_gateway_integration_response" "crc-api-visitors-options" {
  depends_on = [
    aws_api_gateway_integration.crc-api-visitors-options,
    aws_api_gateway_method_response.crc-api-visitors-options
  ]

  http_method = aws_api_gateway_method.crc-api-visitors-options.http_method
  resource_id = aws_api_gateway_resource.crc-api-resource-visitors.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method_response" "crc-api-visitors-options" {
  http_method = aws_api_gateway_method.crc-api-visitors-options.http_method
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


// Sign CV Download GET
resource "aws_api_gateway_method" "crc-api-download-get" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "GET"

  request_parameters = {
    "method.request.querystring.visitorId" = "true"
  }

  request_validator_id = aws_api_gateway_request_validator.crc-api-param-validator.id
  resource_id          = aws_api_gateway_resource.crc-api-resource-download.id
  rest_api_id          = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_integration" "crc-api-download-get" {
  depends_on = [aws_api_gateway_method.crc-api-download-get]

  cache_namespace         = aws_api_gateway_resource.crc-api-resource-download.id
  connection_type         = "INTERNET"
  content_handling        = "CONVERT_TO_TEXT"
  http_method             = aws_api_gateway_method.crc-api-download-get.http_method
  integration_http_method = "POST"
  passthrough_behavior    = "WHEN_NO_MATCH"
  resource_id             = aws_api_gateway_resource.crc-api-resource-download.id
  rest_api_id             = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds    = "29000"
  type                    = "AWS_PROXY"
  uri                     = var.api-lambda-download-uri
}

# Inert for an AWS_PROXY integration — the Lambda's own headers pass straight through —
# but both existing routes carry the pair, and omitting it only here would read as an
# oversight rather than a decision.
resource "aws_api_gateway_integration_response" "crc-api-download-get" {
  depends_on = [
    aws_api_gateway_integration.crc-api-download-get,
    aws_api_gateway_method_response.crc-api-download-get
  ]

  http_method = aws_api_gateway_method.crc-api-download-get.http_method
  resource_id = aws_api_gateway_resource.crc-api-resource-download.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method_response" "crc-api-download-get" {
  http_method = aws_api_gateway_method.crc-api-download-get.http_method
  resource_id = aws_api_gateway_resource.crc-api-resource-download.id

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "false"
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}


// Sign CV Download OPTIONS
resource "aws_api_gateway_method" "crc-api-download-options" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "OPTIONS"
  resource_id      = aws_api_gateway_resource.crc-api-resource-download.id
  rest_api_id      = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_integration" "crc-api-download-options" {
  depends_on = [aws_api_gateway_method.crc-api-download-options]

  cache_namespace      = aws_api_gateway_resource.crc-api-resource-download.id
  connection_type      = "INTERNET"
  http_method          = aws_api_gateway_method.crc-api-download-options.http_method
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }

  resource_id          = aws_api_gateway_resource.crc-api-resource-download.id
  rest_api_id          = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds = "29000"
  type                 = "MOCK"
}

resource "aws_api_gateway_integration_response" "crc-api-download-options" {
  depends_on = [
    aws_api_gateway_integration.crc-api-download-options,
    aws_api_gateway_method_response.crc-api-download-options
  ]

  http_method = aws_api_gateway_method.crc-api-download-options.http_method
  resource_id = aws_api_gateway_resource.crc-api-resource-download.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method_response" "crc-api-download-options" {
  http_method = aws_api_gateway_method.crc-api-download-options.http_method
  resource_id = aws_api_gateway_resource.crc-api-resource-download.id

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


// Send Message POST
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

resource "aws_api_gateway_integration" "crc-api-contact-post" {
  depends_on = [aws_api_gateway_method.crc-api-contact-post]

  cache_namespace         = aws_api_gateway_resource.crc-api-resource-contact.id
  connection_type         = "INTERNET"
  content_handling        = "CONVERT_TO_TEXT"
  http_method             = aws_api_gateway_method.crc-api-contact-post.http_method
  integration_http_method = "POST"
  passthrough_behavior    = "WHEN_NO_MATCH"
  resource_id             = aws_api_gateway_resource.crc-api-resource-contact.id
  rest_api_id             = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds    = "29000"
  type                    = "AWS_PROXY"
  uri                     = var.api-lambda-contact-uri
}

resource "aws_api_gateway_integration_response" "crc-api-contact-post" {
  depends_on = [
    aws_api_gateway_integration.crc-api-contact-post,
    aws_api_gateway_method_response.crc-api-contact-post
  ]

  http_method = aws_api_gateway_method.crc-api-contact-post.http_method
  resource_id = aws_api_gateway_resource.crc-api-resource-contact.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method_response" "crc-api-contact-options" {
  http_method = aws_api_gateway_method.crc-api-contact-options.http_method
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


// Send Message OPTIONS
resource "aws_api_gateway_method" "crc-api-contact-options" {
  api_key_required = "false"
  authorization    = "NONE"
  http_method      = "OPTIONS"
  resource_id      = aws_api_gateway_resource.crc-api-resource-contact.id
  rest_api_id      = aws_api_gateway_rest_api.crc-rest-api.id
}

resource "aws_api_gateway_integration" "crc-api-contact-options" {
  depends_on = [aws_api_gateway_method.crc-api-contact-options]

  cache_namespace      = aws_api_gateway_resource.crc-api-resource-contact.id
  connection_type      = "INTERNET"
  http_method          = aws_api_gateway_method.crc-api-contact-options.http_method
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }

  resource_id          = aws_api_gateway_resource.crc-api-resource-contact.id
  rest_api_id          = aws_api_gateway_rest_api.crc-rest-api.id
  timeout_milliseconds = "29000"
  type                 = "MOCK"
}

resource "aws_api_gateway_integration_response" "crc-api-contact-options" {
  depends_on = [
    aws_api_gateway_integration.crc-api-contact-options,
    aws_api_gateway_method_response.crc-api-contact-options
  ]

  http_method = aws_api_gateway_method.crc-api-contact-options.http_method
  resource_id = aws_api_gateway_resource.crc-api-resource-contact.id

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }

  rest_api_id = aws_api_gateway_rest_api.crc-rest-api.id
  status_code = "200"
}

resource "aws_api_gateway_method_response" "crc-api-contact-post" {
  http_method = aws_api_gateway_method.crc-api-contact-post.http_method
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


#  End API Gateway Block  #
###########################
