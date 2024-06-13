variable "domain-name" {
  type    = string
  default = "cloudresume-agb.jp"
}

variable "sanitized-domain-name" {
  type    = string
  default = "cloud-resume-agb-jp"
}

variable "api-current-stage" {
  type = string
  default = "v1"
}

variable "assume_role" {
  type    = string
  default = "arn:aws:iam::339712851438:role/crc-devops-terraform-AssumeRole"
}

variable "tags" {
  type = map(string)
  description = "Default Tags, applied to all resources"
  default = {
    ManagedByTerraform = true
  }
}