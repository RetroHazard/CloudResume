variable "deployment-region" {
  description = "Target Region for Resource Deployment"
  type = string
  default = "us-east-1"
}

variable "aws-profile" {
  description = "AWS CLI Profile to use during Terraform Operations"
  type = string
  default = "Sandbox"
}

variable "aws-access-key" {
  description = "Access Key for AWS Terraform User"
  type = string
  sensitive = true
}

variable "aws-secret-access-key" {
  description = "Secret Access Key for AWS Terraform User"
  type = string
  sensitive = true
}

variable "domain-name" {
  description = "Domain Name to be used for Deployment"
  type    = string
  default = "cloudresume-agb.jp"
}

variable "sanitized-domain-name" {
  description = "Sanitized Domain Name used for the Key Alias"
  type    = string
  default = "cloudresume-agb-jp"
}

variable "api-current-stage" {
  description = "Current Stage Identifier for the API"
  type = string
  default = "v1"
}

variable "assume_role" {
  description = "Role Used for Terraform Actions in AWS"
  type    = string
  sensitive = true
  default = "arn:aws:iam::339712851438:role/crc-devops-terraform-AssumeRole"
}

variable "tags" {
  type = map(string)
  description = "Default Tags, applied to all resources"
  default = {
    ManagedByTerraform = true
  }
}