resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_7lmgms2aww5lulqi3rmfffwqocwkmjck-002E-_domainkey-002E-cloudresume-agb-002E-jp-002E-_CNAME_" {
  multivalue_answer_routing_policy = "false"
  name                             = "7lmgms2aww5lulqi3rmfffwqocwkmjck._domainkey.cloudresume-agb.jp"
  records                          = ["7lmgms2aww5lulqi3rmfffwqocwkmjck.dkim.amazonses.com"]
  ttl                              = "300"
  type                             = "CNAME"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71__dmarc-002E-cloudresume-agb-002E-jp-002E-_TXT_" {
  multivalue_answer_routing_policy = "false"
  name                             = "_dmarc.cloudresume-agb.jp"
  records                          = ["v=DMARC1; p=none;"]
  ttl                              = "300"
  type                             = "TXT"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_api-002E-cloudresume-agb-002E-jp-002E-_A_" {
  alias {
    evaluate_target_health = "false"
    name                   = "d9zhaw4xflnb4.cloudfront.net"
    zone_id                = "Z2FDTNDATAQYW2"
  }

  multivalue_answer_routing_policy = "false"
  name                             = "api.cloudresume-agb.jp"
  type                             = "A"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp-002E-_A_" {
  alias {
    evaluate_target_health = "false"
    name                   = "dwjelrheir4cw.cloudfront.net"
    zone_id                = "Z2FDTNDATAQYW2"
  }

  multivalue_answer_routing_policy = "false"
  name                             = "cloudresume-agb.jp"
  type                             = "A"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp-002E-_NS_" {
  multivalue_answer_routing_policy = "false"
  name                             = "cloudresume-agb.jp"
  records                          = ["ns-1451.awsdns-53.org.", "ns-1674.awsdns-17.co.uk.", "ns-237.awsdns-29.com.", "ns-541.awsdns-03.net."]
  ttl                              = "172800"
  type                             = "NS"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp-002E-_SOA_" {
  multivalue_answer_routing_policy = "false"
  name                             = "cloudresume-agb.jp"
  records                          = ["ns-541.awsdns-03.net. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"]
  ttl                              = "900"
  type                             = "SOA"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_contact-002E-cloudresume-agb-002E-jp-002E-_MX_" {
  multivalue_answer_routing_policy = "false"
  name                             = "contact.cloudresume-agb.jp"
  records                          = ["10 feedback-smtp.ap-northeast-1.amazonses.com"]
  ttl                              = "300"
  type                             = "MX"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_contact-002E-cloudresume-agb-002E-jp-002E-_TXT_" {
  multivalue_answer_routing_policy = "false"
  name                             = "contact.cloudresume-agb.jp"
  records                          = ["v=spf1 include:amazonses.com ~all"]
  ttl                              = "300"
  type                             = "TXT"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_nngjyxusg7376yfuxcrx6h6p4ljavsru-002E-_domainkey-002E-cloudresume-agb-002E-jp-002E-_CNAME_" {
  multivalue_answer_routing_policy = "false"
  name                             = "nngjyxusg7376yfuxcrx6h6p4ljavsru._domainkey.cloudresume-agb.jp"
  records                          = ["nngjyxusg7376yfuxcrx6h6p4ljavsru.dkim.amazonses.com"]
  ttl                              = "300"
  type                             = "CNAME"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_s2k3jbjkxqkzok5u2vxthw7gi5deossm-002E-_domainkey-002E-cloudresume-agb-002E-jp-002E-_CNAME_" {
  multivalue_answer_routing_policy = "false"
  name                             = "s2k3jbjkxqkzok5u2vxthw7gi5deossm._domainkey.cloudresume-agb.jp"
  records                          = ["s2k3jbjkxqkzok5u2vxthw7gi5deossm.dkim.amazonses.com"]
  ttl                              = "300"
  type                             = "CNAME"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_staging-002E-cloudresume-agb-002E-jp-002E-_A_" {
  alias {
    evaluate_target_health = "false"
    name                   = "d3bk1gv4z5d6hz.cloudfront.net"
    zone_id                = "Z2FDTNDATAQYW2"
  }

  multivalue_answer_routing_policy = "false"
  name                             = "staging.cloudresume-agb.jp"
  type                             = "A"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_record" "tfer--Z03405071SXF625TZSK71_www-002E-cloudresume-agb-002E-jp-002E-_A_" {
  alias {
    evaluate_target_health = "false"
    name                   = "dwjelrheir4cw.cloudfront.net"
    zone_id                = "Z2FDTNDATAQYW2"
  }

  multivalue_answer_routing_policy = "false"
  name                             = "www.cloudresume-agb.jp"
  type                             = "A"
  zone_id                          = "${aws_route53_zone.tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp.zone_id}"
}

resource "aws_route53_zone" "tfer--Z03405071SXF625TZSK71_cloudresume-agb-002E-jp" {
  comment       = "Hosted Zone for Cloud Resume Project\nDomain Registered via onamae.com"
  force_destroy = "false"
  name          = "cloudresume-agb.jp"
}
