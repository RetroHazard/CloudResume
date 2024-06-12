variable "domain-name" {
  type    = string
  default = "silentskies.site"
}

variable "sanitized-domain-name" {
  type    = string
  default = "silent-skies-site"
}

variable "assume_role" {
  type    = string
  default = "arn:aws:iam::730335615519:role/DevOpsTerraform_AssumeRole"
}

variable "tags" {
  type = map(string)
  description = "Default Tags, applied to all resources"
  default = {
    ManagedByTerraform = true
  }
}