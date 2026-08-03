data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

# caller_arn and caller_user used to be exported here and were deliberately removed.
# Both derive from aws_caller_identity, whose assumed-role ARN and user_id embed the
# *session* name — GitHubTerraform on a plan, GitHubTerraformApply on the old deploy job,
# something else again from a laptop. So they differed on essentially every run, every
# plan carried a "Changes to Outputs" diff, and `plan -detailed-exitcode` could never
# report a genuinely empty plan. That silently disabled the skip-the-apply-on-no-changes
# optimisation the pipeline is built around (see docs/ci.md).
#
# Nothing read them. Attributing a change to the job that made it is what CloudTrail plus
# the role-session-name in .github/actions/setup-terraform is for, and unlike a Terraform
# output that records only the most recent apply, CloudTrail keeps the whole history.
#
# The account id stays: it is stable, and the modules already take it as an input.