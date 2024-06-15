data "github_user" "current" {
  username = "RetroHazard"
}

data "github_repository" "current" {
  name = "CloudResume"
  full_name = "RetroHazard/CloudResume"
}