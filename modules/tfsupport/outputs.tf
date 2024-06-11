output "aws_s3_bucket_crc-s3-terraform-state_id" {
  value = aws_s3_bucket.crc-s3-terraform-state.id
}

output "aws_dynamodb_table_crc-terraform-locks_name" {
  value = aws_dynamodb_table.crc-ddb-terraform-state-lock.name
}