##################
# Begin S3 Block #

output "aws_s3_bucket_crc-agb-s3-website-prod_id" {
  value = aws_s3_bucket.crc-agb-s3-website-prod.id
}

output "aws_s3_bucket_crc-agb-s3-website-prod_arn" {
  value = aws_s3_bucket.crc-agb-s3-website-prod.arn
}

output "aws_s3_bucket_policy_crc-agb-s3-website-prod_id" {
  value = aws_s3_bucket_policy.crc-agb-s3-website-prod.id
}

output "aws_s3_bucket_crc-agb-s3-website-staging_id" {
  value = aws_s3_bucket.crc-agb-s3-website-staging.id
}

output "aws_s3_bucket_crc-agb-s3-website-staging_arn" {
  value = aws_s3_bucket.crc-agb-s3-website-staging.arn
}

output "aws_s3_bucket_policy_crc-agb-s3-website-staging_id" {
  value = aws_s3_bucket_policy.crc-agb-s3-website-staging.id
}

output "aws_s3_bucket_crc-agb-s3-cloudresumechallenge-logging_id" {
  value = aws_s3_bucket.crc-agb-s3-website-logging.id
}

output "aws_s3_bucket_policy_crc-agb-s3-website-logging_id" {
  value = aws_s3_bucket_policy.crc-agb-s3-website-logging.id
}

#  End S3 Block  #
##################


##########################
# Begin CloudFront Block #

output "aws_cloudfront_cache_policy_crc-default-caching-policy_id" {
  value = aws_cloudfront_cache_policy.crc-default-caching-policy.id
}

output "aws_cloudfront_distribution_crc-cf-production-distribution_id" {
  value = aws_cloudfront_distribution.crc-cf-production-distribution.id
}

output "aws_cloudfront_distribution_crc-cf-staging-distribution_id" {
  value = aws_cloudfront_distribution.crc-cf-staging-distribution.id
}

output "aws_cloudfront_function_crc-staging-authorization_arn" {
  value = aws_cloudfront_function.crc-StagingAuthorization.arn
}

#  End CloudFront Block  #
##########################


############################
# Begin Certificates Block #

output "aws_acm_certificate_crc-website-certificate" {
  value = [
    aws_acm_certificate.crc-website-certificate.id,
    aws_acm_certificate.crc-website-certificate.arn
  ]
}

#  End Certificates Block  #
############################


###########################
# Begin Key Manager Block #

output "aws_kms_alias_crc-dnssec-key_id" {
  value = aws_kms_alias.crc-dnssec-key.id
}

output "aws_kms_key_crc-dnssec-key_id" {
  value = aws_kms_key.crc-dnssec-key.id
}

#  End Key Manager Block  #
###########################