variable "aws_access_key" {
  description = "Access Key for AWS Terraform User"
  type = string
  sensitive = true
}

variable "aws_secret_access_key" {
  description = "Secret Access Key for AWS Terraform User"
  type = string
  sensitive = true
}

variable "assume_role_target" {
  description = "Role Used for Terraform Actions in AWS"
  type    = string
  sensitive = true
}

variable "deployment_region" {
  description = "Target Region for Resource Deployment"
  type = string
}

variable "hosted_zone_id" {
  description = "Target Hosted Zone to Import during initialization"
  type = string
}

variable "domain_name" {
  description = "Domain Name to be used for Deployment"
  type    = string
}

variable "sanitized_domain_name" {
  description = "Sanitized Domain Name used for the Key Alias"
  type    = string
}

variable "api_current_stage" {
  description = "Current Stage Identifier for the API"
  type = string
}

variable "tags" {
  type = map(string)
  description = "Default Tags, applied to all resources"
  default = {
    ManagedByTerraform = true
  }
}