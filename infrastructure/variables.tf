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