variable "github_token" {
  description = "Token provided by GitHub Runner to Authenticate GitHub Operations"
  type        = string
  sensitive   = true
}

variable "deployment_region" {
  description = "Target Region for Resource Deployment"
  type        = string
}

variable "domain_name" {
  description = "Domain Name to be used for Deployment"
  type        = string
}

variable "sanitized_domain_name" {
  description = "Sanitized Domain Name used for the Key Alias"
  type        = string
}

variable "api_current_stage" {
  description = "Current Stage Identifier for the API"
  type        = string
}

variable "default_tags" {
  type        = map(string)
  description = "Default Tags, applied to all resources"
  default = {
    ManagedByTerraform = "true",
    GithubRepo         = "CloudResume",
    GithubOrg          = "RetroHazard"
  }
}

variable "waf_enabled" {
  type    = bool
  default = false
}

variable "contribution_accounts" {
  description = "GitHub Accounts merged into the Contribution Heatmap"
  type        = list(string)
  default     = ["RetroHazard", "BitMEX-abracken"]
}

variable "contribution_object_key" {
  description = "S3 Object Key the Contribution Data is Published to"
  type        = string
  default     = "data/contributions.json"
}

variable "contribution_refresh_schedule" {
  description = "EventBridge Schedule Expression for Refreshing Contribution Data"
  type        = string
  default     = "rate(6 hours)"
}

variable "signed_downloads_enabled" {
  description = "Whether /files/* requires a CloudFront signature. Set in CI from the AWS_TF_SIGNED_DOWNLOADS repository variable so it can be flipped without a commit; this default applies to local runs and when that variable is unset. Turning it off is a kill switch for the direct object URL only — it does not restore the Download CV button, which calls /download regardless. See docs/signed-downloads.md"
  type        = bool
  default     = true
}

variable "cv_source_object_key" {
  description = "S3 Object Key of the CV source data the website build publishes. downloadResume compiles the CV from it"
  type        = string
  default     = "data/cv-source.json"
}

variable "cv_object_prefix" {
  description = "S3 Key Prefix generated CVs are cached under, one folder per content digest. Must sit under files/ so the objects are only reachable through signed URLs"
  type        = string
  default     = "files/cv"

  validation {
    condition     = startswith(var.cv_object_prefix, "files/") && !endswith(var.cv_object_prefix, "/")
    error_message = "cv_object_prefix must sit under files/ (the signed-URL behaviour) and carry no trailing slash."
  }
}

variable "cloudfront_signing_key_parameter" {
  description = "SSM SecureString Parameter holding the CloudFront signing private key. Populated out of band — Terraform reads the name only, never the value"
  type        = string
  default     = "/CloudResume/cloudfront/signing-key"
}

variable "cloudfront_signing_public_key_parameter" {
  description = "SSM String Parameter holding the CloudFront signing public key, written by the same bootstrap that stores the private half. Read at plan time, so it must exist before the first apply"
  type        = string
  default     = "/CloudResume/cloudfront/signing-key.pub"
}

variable "recaptcha_secret_parameter" {
  description = "SSM SecureString Parameter holding the reCAPTCHA secret key that sendMessage verifies tokens with. Populated out of band, like the signing key — Terraform reads the name only, never the value"
  type        = string
  default     = "/CloudResume/recaptcha/secret-key"
}

variable "signed_url_ttl_seconds" {
  description = "Lifetime of a signed CV download URL. Gates only the initial request, not the transfer"
  type        = number
  default     = 60
}

variable "api_throttle_rate_limit" {
  description = "Steady-state request rate ceiling applied to every API method"
  type        = number
  default     = 10
}

variable "api_throttle_burst_limit" {
  description = "Burst ceiling applied to every API method"
  type        = number
  default     = 20
}

variable "api_throttle_download_rate_limit" {
  description = "Steady-state request rate ceiling for GET /download, which mints signed URLs"
  type        = number
  default     = 2
}

variable "api_throttle_download_burst_limit" {
  description = "Burst ceiling for GET /download"
  type        = number
  default     = 5
}
variable "mail_retention_days" {
  description = "Days a message received for the CV contact alias is kept in the private mail bucket after forwarding"
  type        = number
  default     = 7
}

variable "contact_destination_email" {
  description = "The real inbox behind the contact form and the CV's forwarding alias. Supplied from the CONTACT_DESTINATION_EMAIL Actions secret, so it is never committed, and marked sensitive so it is redacted from the plans the pipeline publishes"
  type        = string
  sensitive   = true

  # Without this, a missing secret would arrive as "" and the plan would replace the SES
  # identity with an empty one instead of failing.
  validation {
    condition     = can(regex("^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$", var.contact_destination_email))
    error_message = "contact_destination_email is not an email address. In CI it comes from the CONTACT_DESTINATION_EMAIL repository secret; locally, set TF_VAR_contact_destination_email."
  }
}
