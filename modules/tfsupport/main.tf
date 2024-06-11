provider "aws" {
  region = "us-east-1"
}

#########################
# Begin Terraform Support

resource "random_string" "bucket_suffix" {
  length = 6
  special = false
  upper = false
}

resource "aws_s3_bucket" "crc-s3-terraform-state" {
  bucket = "crc-agb-s3-terraform-state-${random_string.bucket_suffix.result}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "crc-s3-terraform-state" {
  bucket = aws_s3_bucket.crc-s3-terraform-state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_dynamodb_table" "crc-ddb-terraform-state-lock" {
  name = "crc-terraform-locks"
  read_capacity = 1
  write_capacity = 1
  hash_key = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# End Terraform Support
#######################