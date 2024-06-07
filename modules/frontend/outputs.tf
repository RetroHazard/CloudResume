output "aws_s3_bucket_crc-agb-s3-website-prod" {
  value = [
    aws_s3_bucket.crc-agb-s3-website-prod.id,
    aws_s3_bucket.crc-agb-s3-website-prod.arn,
  ]
}

output "aws_s3_bucket_policy_crc-agb-s3-website-prod_id" {
  value = aws_s3_bucket_policy.crc-agb-s3-website-prod.id
}

output "aws_s3_bucket_crc-agb-s3-website-staging_id" {
  value = aws_s3_bucket.crc-agb-s3-website-staging.id
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
