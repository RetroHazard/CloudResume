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

output "aws_acm_certificate_crc-website-certificate_id" {
  value = aws_acm_certificate.crc-website-certificate.id
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


#######################
# Begin Route53 Block #

output "aws_route53_zone_crc-hosted-zone_id" {
  value = aws_route53_zone.crc-hosted-zone.id
}

output "aws_route53_key_signing_key_crc-dnssec-ksk_id" {
  value = aws_route53_key_signing_key.crc-dnssec-ksk.id
}

output "aws_route53_hosted_zone_dnssec_crc-hosted-zone_id" {
  value = aws_route53_hosted_zone_dnssec.crc-hosted-zone.id
}

output "aws_route53_record_crc-dns-zone-core-record-NS_id" {
  value = aws_route53_record.crc-dns-zone-core-record-NS.id
}

output "aws_route53_record_crc-dns-zone-core-record-SOA_id" {
  value = aws_route53_record.crc-dns-zone-core-record-SOA.id
}

output "aws_route53_record_crc-dns-zone-api-record-A_id" {
  value = aws_route53_record.crc-dns-zone-api-record-A.id
}

output "aws_route53_record_crc-dns-zone-ses-record-MX_id" {
  value = aws_route53_record.crc-dns-zone-ses-record-MX.id
}

output "aws_route53_record_crc-dns-zone-ses-record-TXT_id" {
  value = aws_route53_record.crc-dns-zone-ses-record-TXT.id
}

output "aws_route53_record_crc-dns-zone-ses-dkim-1-record-CNAME_id" {
  value = aws_route53_record.crc-dns-zone-ses-dkim-1-record-CNAME.id
}

output "aws_route53_record_crc-dns-zone-ses-dkim-2-record-CNAME_id" {
  value = aws_route53_record.crc-dns-zone-ses-dkim-2-record-CNAME.id
}

output "aws_route53_record_crc-dns-zone-ses-dkim-3-record-CNAME_id" {
  value = aws_route53_record.crc-dns-zone-ses-dkim-3-record-CNAME.id
}

output "aws_route53_record_crc-dns-zone-ses-dmarc-record-CNAME_id" {
  value = aws_route53_record.crc-dns-zone-ses-dmarc-record-TXT.id
}

output "aws_route53_record_crc-dns-zone-record-A_id" {
  value = aws_route53_record.crc-dns-zone-record-A.id
}

output "aws_route53_record_crc-dns-zone-www-record-A_id" {
  value = aws_route53_record.crc-dns-zone-www-record-A.id
}

output "aws_route53_record_crc-dns-zone-staging-record-A_id" {
  value = aws_route53_record.crc-dns-zone-staging-record-A.id
}

#  End Route53 Block  #
#######################


###########################
# Begin API Gateway Block #

output "aws_api_gateway_rest_api_crc-rest-api_id" {
  value = aws_api_gateway_rest_api.crc-rest-api.id
}

output "aws_api_gateway_deployment_crc-api-deployment_id" {
  value = aws_api_gateway_deployment.crc-api-deployment.id
}

output "aws_api_gateway_stage_crc-api-stage_id" {
  value = aws_api_gateway_stage.crc-api-stage.id
}

output "aws_api_gateway_resource_crc-api-resource_id" {
  value = aws_api_gateway_resource.crc-api-resource.id
}

output "aws_api_gateway_resource_crc-api-resource-visitors_id" {
  value = aws_api_gateway_resource.crc-api-resource-visitors.id
}

output "aws_api_gateway_resource_crc-api-resource-contact_id" {
  value = aws_api_gateway_resource.crc-api-resource-contact.id
}

output "aws_api_gateway_request_validator_crc-api-param-validator" {
  value = aws_api_gateway_request_validator.crc-api-param-validator.id
}

output "aws_api_gateway_gateway_response_crc-api-response-default-4XX_id" {
  value = aws_api_gateway_gateway_response.crc-api-response-default-4XX.id
}

output "aws_api_gateway_gateway_response_crc-api-response-default-5XX_id" {
  value = aws_api_gateway_gateway_response.crc-api-response-default-5XX.id
}

output "aws_api_gateway_integration_crc-api-visitors-get_id" {
  value = aws_api_gateway_integration.crc-api-visitors-get.id
}

output "aws_api_gateway_integration_crc-api-visitors-options_id" {
  value = aws_api_gateway_integration.crc-api-visitors-options.id
}

output "aws_api_gateway_integration_crc-cpi-contact-options_id" {
  value = aws_api_gateway_integration.crc-cpi-contact-options.id
}

output "aws_api_gateway_integration_crc-api-contact-post_id" {
  value = aws_api_gateway_integration.crc-api-contact-post.id
}

output "aws_api_gateway_integration_response_crc-api-visitors-get_id" {
  value = aws_api_gateway_integration_response.crc-api-visitors-get.id
}

output "aws_api_gateway_integration_response_crc-api-visitors-options_id" {
  value = aws_api_gateway_integration_response.crc-api-visitors-options.id
}

output "aws_api_gateway_integration_response_crc-api-contact-options_id" {
  value = aws_api_gateway_integration_response.crc-api-contact-options.id
}

output "aws_api_gateway_integration_response_crc-api-contact-post_id" {
  value = aws_api_gateway_integration_response.crc-api-contact-post.id
}

output "aws_api_gateway_method_crc-api-visitors-get_id" {
  value = aws_api_gateway_method.crc-api-visitors-get.id
}

output "aws_api_gateway_method_crc-api-visitors-options_id" {
  value = aws_api_gateway_method.crc-api-visitors-options.id
}

output "aws_api_gateway_method_crc-api-contact-options_id" {
  value = aws_api_gateway_method.crc-api-contact-options.id
}

output "aws_api_gateway_method_crc-api-contact-post_id" {
  value = aws_api_gateway_method.crc-api-contact-post.id
}

output "aws_api_gateway_method_response_crc-api-visitors-get_id" {
  value = aws_api_gateway_method_response.crc-api-visitors-get.id
}

output "aws_api_gateway_method_response_crc-api-visitors-options_id" {
  value = aws_api_gateway_method_response.crc-api-visitors-options.id
}

output "aws_api_gateway_method_response_crc-api-contact-options_id" {
  value = aws_api_gateway_method_response.crc-api-contact-options.id
}

output "aws_api_gateway_method_response_crc-api-contact-post_id" {
  value = aws_api_gateway_method_response.crc-api-contact-post.id
}

output "aws_api_gateway_model_crc-api-default-empty-model_id" {
  value = aws_api_gateway_model.crc-api-default-empty-model.id
}

output "aws_api_gateway_model_crc-api-default-error-model_id" {
  value = aws_api_gateway_model.crc-api-default-error-model.id
}

#  End API Gateway Block  #
###########################
