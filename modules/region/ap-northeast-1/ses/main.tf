resource "aws_ses_configuration_set" "tfer--ContactFormMailer" {
  delivery_options {
    tls_policy = "Require"
  }

  name                       = "ContactFormMailer"
  reputation_metrics_enabled = "false"
  sending_enabled            = "true"

  tracking_options {
    custom_redirect_domain = "contact.cloudresume-agb.jp"
  }
}

resource "aws_ses_configuration_set" "tfer--my-first-configuration-set" {
  name                       = "my-first-configuration-set"
  reputation_metrics_enabled = "true"
  sending_enabled            = "true"
}

resource "aws_ses_domain_identity" "tfer--cloudresume-agb-002E-jp" {
  domain = "cloudresume-agb.jp"
}

resource "aws_ses_email_identity" "tfer--a-002E-bracken87-002B-cloudresume_ses-0040-gmail-002E-com" {
  email = "a.bracken87+cloudresume_ses@gmail.com"
}
