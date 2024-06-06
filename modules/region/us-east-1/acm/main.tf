resource "aws_acm_certificate" "tfer--d2c204b7-bb92-437a-b2d8-a9dcd55aea97_-002A--002E-cloudresume-agb-002E-jp" {
  domain_name   = "*.cloudresume-agb.jp"
  key_algorithm = "RSA_2048"

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }

  subject_alternative_names = ["*.cloudresume-agb.jp"]

  tags = {
    Name    = "cloudresume-agb.jp"
    Project = "CloudResumeChallenge"
  }

  tags_all = {
    Name    = "cloudresume-agb.jp"
    Project = "CloudResumeChallenge"
  }

  validation_method = "DNS"
}
