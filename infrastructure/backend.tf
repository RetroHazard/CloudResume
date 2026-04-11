terraform {
  backend "s3" {
    bucket         = "crc-s3-terraform-state-7ahwqu"
    key            = "aws-services.tfstate"
    use_lockfile   = true
    region         = "us-east-1"
    encrypt        = true
  }
}