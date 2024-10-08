##################
# Begin S3 Block #

output "aws_s3_bucket_crc-agb-s3-website-prod_id" {
  value = aws_s3_bucket.crc-agb-s3-website-prod.id
}

output "aws_s3_bucket_crc-agb-s3-website-prod_arn" {
  value = aws_s3_bucket.crc-agb-s3-website-prod.arn
}

#  End S3 Block  #
##################


##########################
# Begin CloudFront Block #

output "aws_cloudfront_distribution_crc-cf-production-distribution_id" {
  value = aws_cloudfront_distribution.crc-cf-production-distribution.id
}

output "aws_cloudfront_distribution_crc-cf-production-distribution_arn" {
  value = aws_cloudfront_distribution.crc-cf-production-distribution.arn
}

#  End CloudFront Block  #
##########################


############################
# Begin Certificates Block #

output "aws_acm_certificate_validation_crc-website-certificate-validation" {
  value = aws_acm_certificate_validation.crc-website-certificate-validation.id
}

#  End Certificates Block  #
############################


###########################
# Begin Key Manager Block #



#  End Key Manager Block  #
###########################


#######################
# Begin Route53 Block #

output "aws_route53_record_crc-ses-verification-record_TXT" {
  value = aws_route53_record.crc-dns-zone-ses-record-TXT.id
}

output "aws_route53_record_crc-ses-verification-record_MX" {
  value = aws_route53_record.crc-dns-zone-ses-record-MX.id
}

#  End Route53 Block  #
#######################


###########################
# Begin API Gateway Block #

output "aws_api_gateway_rest_api_crc-rest-api_exec-arn" {
  value = aws_api_gateway_rest_api.crc-rest-api.execution_arn
}

output "aws_api_gateway_resource_crc-api-resource-visitors_id" {
  value = aws_api_gateway_resource.crc-api-resource-visitors.id
}

output "aws_api_gateway_resource_crc-api-resource-contact_id" {
  value = aws_api_gateway_resource.crc-api-resource-contact.id
}

output "aws_api_gateway_crc-api-endpoint_fqdn" {
  value = "https://${aws_route53_record.crc-dns-zone-api-record-A.name}/${aws_api_gateway_stage.crc-api-stage.stage_name}"
}

#  End API Gateway Block  #
###########################
