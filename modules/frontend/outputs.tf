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

output "aws_route53_record_crc-dns-zone-prod-record-A_id" {
  value = aws_route53_record.crc-dns-zone-prod-www-record-A.id
}

output "aws_route53_record_crc-dns-zone-prod-www-record-A_id" {
  value = aws_route53_record.crc-dns-zone-prod-www-record-A.id
}

output "aws_route53_record_crc-dns-zone-staging-record-A_id" {
  value = aws_route53_record.crc-dns-zone-staging-record-A.id
}


output "aws_route53_record_crc-Z03405071SXF625TZSK71_nngjyxusg7376yfuxcrx6h6p4ljavsru-002E-_domainkey-002E-cloudresume-agb-002E-jp-002E-_CNAME__id" {
  value = aws_route53_record.crc-Z03405071SXF625TZSK71_nngjyxusg7376yfuxcrx6h6p4ljavsru-002E-_domainkey-002E-cloudresume-agb-002E-jp-002E-_CNAME_.id
}

output "aws_route53_record_crc-Z03405071SXF625TZSK71_s2k3jbjkxqkzok5u2vxthw7gi5deossm-002E-_domainkey-002E-cloudresume-agb-002E-jp-002E-_CNAME__id" {
  value = aws_route53_record.crc-Z03405071SXF625TZSK71_s2k3jbjkxqkzok5u2vxthw7gi5deossm-002E-_domainkey-002E-cloudresume-agb-002E-jp-002E-_CNAME_.id
}

output "aws_route53_record_crc-Z03405071SXF625TZSK71_7lmgms2aww5lulqi3rmfffwqocwkmjck-002E-_domainkey-002E-cloudresume-agb-002E-jp-002E-_CNAME__id" {
  value = aws_route53_record.crc-Z03405071SXF625TZSK71_7lmgms2aww5lulqi3rmfffwqocwkmjck-002E-_domainkey-002E-cloudresume-agb-002E-jp-002E-_CNAME_.id
}

output "aws_route53_record_crc-Z03405071SXF625TZSK71__dmarc-002E-cloudresume-agb-002E-jp-002E-_TXT__id" {
  value = aws_route53_record.crc-Z03405071SXF625TZSK71__dmarc-002E-cloudresume-agb-002E-jp-002E-_TXT_.id
}












#  End Route53 Block  #
#######################