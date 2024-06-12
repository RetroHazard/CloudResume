#  End Key Manager Block  #
###########################


#######################
# Begin Route53 Block #

data "aws_route53_zone" "crc-domain-name" {
  depends_on = [aws_route53_zone.crc-hosted-zone]
  name = var.domain-name
}

data "aws_route53_zone" "crc-hosted-zone"{
  zone_id = aws_route53_zone.crc-hosted-zone.zone_id
}

data aws_cloudfront_log_delivery_canonical_user_id current {}

data aws_canonical_user_id current {}