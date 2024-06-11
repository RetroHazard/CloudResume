variable "service" {
  type    = string
  default = "abc"
}

variable "domain-name" {
  type    = string
  default = "cloudresume-agb.jp"
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