resource "aws_cloudfront_cache_policy" "crc-08627262-05a9-4f76-9ded-b50ca2e3a84f" {
  comment     = "Policy for Elemental MediaPackage Origin"
  default_ttl = "86400"
  max_ttl     = "31536000"
  min_ttl     = "0"
  name        = "Managed-Elemental-MediaPackage"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    enable_accept_encoding_brotli = "false"
    enable_accept_encoding_gzip   = "true"

    headers_config {
      header_behavior = "whitelist"

      headers {
        items = ["origin"]
      }
    }

    query_strings_config {
      query_string_behavior = "whitelist"

      query_strings {
        items = ["aws.manifestfilter", "end", "m", "start"]
      }
    }
  }
}

resource "aws_cloudfront_cache_policy" "crc-1c6db51a-a33f-469a-8245-dae26771f530" {
  comment     = "Amplify cache policy for image optimization"
  default_ttl = "0"
  max_ttl     = "31536000"
  min_ttl     = "0"
  name        = "Managed-Amplify-ImageOptimization"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    enable_accept_encoding_brotli = "true"
    enable_accept_encoding_gzip   = "true"

    headers_config {
      header_behavior = "whitelist"

      headers {
        items = ["Accept", "Authorization", "Host"]
      }
    }

    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

resource "aws_cloudfront_cache_policy" "crc-2e54312d-136d-493c-8eb9-b001f22f67d2" {
  comment     = "Policy for Amplify Origin"
  default_ttl = "2"
  max_ttl     = "600"
  min_ttl     = "2"
  name        = "Managed-Amplify"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }

    enable_accept_encoding_brotli = "true"
    enable_accept_encoding_gzip   = "true"

    headers_config {
      header_behavior = "whitelist"

      headers {
        items = ["Authorization", "CloudFront-Viewer-Country", "Host"]
      }
    }

    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

resource "aws_cloudfront_cache_policy" "crc-4135ea2d-6df8-44a3-9df3-4b5a84be39ad" {
  comment     = "Policy with caching disabled"
  default_ttl = "0"
  max_ttl     = "0"
  min_ttl     = "0"
  name        = "Managed-CachingDisabled"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    enable_accept_encoding_brotli = "false"
    enable_accept_encoding_gzip   = "false"

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_cache_policy" "crc-4cc15a8a-d715-48a4-82b8-cc0b614638fe" {
  comment     = "Policy for origins that return Cache-Control headers and serve different content based on values present in the query string."
  default_ttl = "0"
  max_ttl     = "31536000"
  min_ttl     = "0"
  name        = "UseOriginCacheControlHeaders-QueryStrings"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }

    enable_accept_encoding_brotli = "true"
    enable_accept_encoding_gzip   = "true"

    headers_config {
      header_behavior = "whitelist"

      headers {
        items = ["host", "origin", "x-http-method", "x-http-method-override", "x-method-override"]
      }
    }

    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

resource "aws_cloudfront_cache_policy" "crc-4d1d2f1d-3a71-49ad-9e08-7ea5d843a556" {
  comment     = "Default Amplify cache policy"
  default_ttl = "0"
  max_ttl     = "31536000"
  min_ttl     = "0"
  name        = "Managed-Amplify-Default"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }

    enable_accept_encoding_brotli = "true"
    enable_accept_encoding_gzip   = "true"

    headers_config {
      header_behavior = "whitelist"

      headers {
        items = ["Accept", "Authorization", "CloudFront-Viewer-Country", "Host"]
      }
    }

    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

resource "aws_cloudfront_cache_policy" "crc-658327ea-f89d-4fab-a63d-7e88639e58f6" {
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

resource "aws_cloudfront_cache_policy" "crc-7e5fad67-ee98-4ad0-b05a-394999eefc1a" {
  comment     = "Amplify cache policy for static content"
  default_ttl = "0"
  max_ttl     = "31536000"
  min_ttl     = "0"
  name        = "Managed-Amplify-StaticContent"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    enable_accept_encoding_brotli = "true"
    enable_accept_encoding_gzip   = "true"

    headers_config {
      header_behavior = "whitelist"

      headers {
        items = ["Authorization", "Host"]
      }
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_cache_policy" "crc-83da9c7e-98b4-4e11-a168-04f0df8e2c65" {
  comment     = "Policy for origins that return Cache-Control headers. Query strings are not included in the cache key."
  default_ttl = "0"
  max_ttl     = "31536000"
  min_ttl     = "0"
  name        = "UseOriginCacheControlHeaders"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }

    enable_accept_encoding_brotli = "true"
    enable_accept_encoding_gzip   = "true"

    headers_config {
      header_behavior = "whitelist"

      headers {
        items = ["host", "origin", "x-http-method", "x-http-method-override", "x-method-override"]
      }
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_cache_policy" "crc-a6bad946-36c3-4c33-aa98-362c74a7fb13" {
  comment     = "Default Amplify cache policy without cookies"
  default_ttl = "0"
  max_ttl     = "31536000"
  min_ttl     = "0"
  name        = "Managed-Amplify-DefaultNoCookies"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    enable_accept_encoding_brotli = "true"
    enable_accept_encoding_gzip   = "true"

    headers_config {
      header_behavior = "whitelist"

      headers {
        items = ["Accept", "Authorization", "CloudFront-Viewer-Country", "Host"]
      }
    }

    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

resource "aws_cloudfront_cache_policy" "crc-b2884449-e4de-46a7-ac36-70bc7f1ddd6d" {
  comment     = "Default policy when compression is disabled"
  default_ttl = "86400"
  max_ttl     = "31536000"
  min_ttl     = "1"
  name        = "Managed-CachingOptimizedForUncompressedObjects"

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    enable_accept_encoding_brotli = "false"
    enable_accept_encoding_gzip   = "false"

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_distribution" "crc-E37NSQHT5FF2XS" {
  aliases = ["staging.cloudresume-agb.jp"]
  comment = "Staging Distribution for Cloud Resume Challenge"

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cache_policy_id = aws_cloudfront_cache_policy.crc-658327ea-f89d-4fab-a63d-7e88639e58f6.id
    cached_methods  = ["GET", "HEAD"]
    compress        = "true"
    default_ttl     = "0"

    function_association {
      event_type   = "viewer-request"
      function_arn = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:function/StagingAuthorization"
    }

    max_ttl                = "0"
    min_ttl                = "0"
    smooth_streaming       = "false"
    target_origin_id       = "agb-s3-cloudresumechallenge-staging.s3-website-ap-northeast-1.amazonaws.com"
    viewer_protocol_policy = "redirect-to-https"
  }

  enabled         = "true"
  http_version    = "http2"
  is_ipv6_enabled = "true"

  logging_config {
    bucket          = "agb-s3-cloudresumechallenge-logging.s3.amazonaws.com"
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

    domain_name = "agb-s3-cloudresumechallenge-staging.s3-website-ap-northeast-1.amazonaws.com"
    origin_id   = "agb-s3-cloudresumechallenge-staging.s3-website-ap-northeast-1.amazonaws.com"

    origin_shield {
      enabled              = "true"
      origin_shield_region = "ap-northeast-1"
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
    acm_certificate_arn            = "arn:aws:acm:us-east-1:${data.aws_caller_identity.current.account_id}:certificate/d2c204b7-bb92-437a-b2d8-a9dcd55aea97"
    cloudfront_default_certificate = "false"
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }

  web_acl_id = "arn:aws:wafv2:us-east-1:${data.aws_caller_identity.current.account_id}:global/webacl/CloudResume-WebACL/c38b9d17-1bdf-4d05-ad66-edee4866bbbc"
}

resource "aws_cloudfront_distribution" "crc-ESAPTUQ4RL7CE" {
  aliases = ["*.cloudresume-agb.jp", "www.cloudresume-agb.jp"]
  comment = "Production Distribution for Cloud Resume Challenge"

  custom_error_response {
    error_caching_min_ttl = "10"
    error_code            = "403"
    response_code         = "400"
    response_page_path    = "/"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cache_policy_id        = aws_cloudfront_cache_policy.crc-658327ea-f89d-4fab-a63d-7e88639e58f6.id
    cached_methods         = ["GET", "HEAD"]
    compress               = "true"
    default_ttl            = "0"
    max_ttl                = "0"
    min_ttl                = "0"
    smooth_streaming       = "false"
    target_origin_id       = "agb-s3-cloudresumechallenge-hosted.s3-website-ap-northeast-1.amazonaws.com"
    viewer_protocol_policy = "redirect-to-https"
  }

  enabled         = "true"
  http_version    = "http2"
  is_ipv6_enabled = "false"

  logging_config {
    bucket          = "agb-s3-cloudresumechallenge-logging.s3.amazonaws.com"
    include_cookies = "false"
    prefix          = "cf_crc_"
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

    domain_name = "agb-s3-cloudresumechallenge-hosted.s3-website-ap-northeast-1.amazonaws.com"
    origin_id   = "agb-s3-cloudresumechallenge-hosted.s3-website-ap-northeast-1.amazonaws.com"

    origin_shield {
      enabled              = "true"
      origin_shield_region = "ap-northeast-1"
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

  tags = {
    Project = "CloudResumeChallenge"
  }

  tags_all = {
    Project = "CloudResumeChallenge"
  }

  viewer_certificate {
    acm_certificate_arn            = "arn:aws:acm:us-east-1:${data.aws_caller_identity.current.account_id}:certificate/d2c204b7-bb92-437a-b2d8-a9dcd55aea97"
    cloudfront_default_certificate = "false"
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }

  web_acl_id = "arn:aws:wafv2:us-east-1:${data.aws_caller_identity.current.account_id}:global/webacl/CloudResume-WebACL/c38b9d17-1bdf-4d05-ad66-edee4866bbbc"
}
