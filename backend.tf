terraform {
    backend "s3" {
    bucket = "crc-agb-s3-terraform-state-ugyhqu"
    key = "aws-services1.tfstate"
    dynamodb_table = "terraform-locks"
    region = "us-east-1"
    encrypt = true
    profile = "Sandbox"
  }
}