terraform {
  required_version = "~> 1.8"
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  owner = var.github-organization
  token = var.github-token
}