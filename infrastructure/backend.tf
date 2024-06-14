terraform {
    backend "s3" {
        bucket          = "crc-s3-terraform-state-7ahwqu"
        key             = "aws-services.tfstate"
        dynamodb_table  = "crc-terraform-locks"
        region          = var.deployment-region
        encrypt         = true
        profile         = "crc-terraformer"
  }
}