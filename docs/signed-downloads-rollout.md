# Signed CV downloads — rollout notes

Kept as a record of how the signed-download change (#119) was first deployed. It describes the state of
the repository and the AWS account **at that time** — the plan counts, the checks before merging and the
transient windows during the first apply are not a procedure to follow today. For how the feature works
and how to operate it, see [`signed-downloads.md`](signed-downloads.md).

## Rollout

## Check one thing before merging

`aws_cloudwatch_log_group.crc-api-execution-logs` declares
`API-Gateway-Execution-Logs_<api-id>/<stage>`. API Gateway creates that group *implicitly* the
first time execution logging is enabled, and never deletes it when logging is turned back off.

Terraform has never enabled logging — `aws_api_gateway_method_settings` did not exist before this
change — but `aws_api_gateway_account.crc-api-logging-role` did, and that account-level role is a
prerequisite for nothing else. If execution logging was ever switched on by hand, the group is
already there and `CreateLogGroup` fails with `ResourceAlreadyExistsException`, **partway through
the apply**, after the CloudFront update and the deployment replacement have landed.

```bash
aws logs describe-log-groups \
  --log-group-name-prefix "API-Gateway-Execution-Logs_" --region <deployment_region>
```

Non-empty for this API id → `terraform import` the group before merging. Not a code change.

## What the plan should look like

Roughly **24 to add, 3 to change, 1 to destroy**. The three changes are the CloudFront
distribution, the S3 bucket policy, and the API stage (`deployment_id` → known after apply). Two
lines are worth actually reading:

- `aws_cloudfront_distribution` **must say update in place.** It has no `ForceNew` arguments, so a
  replacement would mean something is wrong — and it would mint a new CloudFront domain and break
  the Route53 alias.
- `aws_api_gateway_deployment` **is expected to be replaced.** `triggers` is `ForceNew`, which is
  the whole point of the redeployment idiom and is the inert-trigger fix landing.
  `create_before_destroy` orders it create → repoint the stage → destroy the old one, which is
  what avoids `BadRequestException: Active stages pointing to this deployment`.

## Two windows during the apply, both accepted

**Deep links break for a few minutes.** `data.aws_iam_policy_document.crc-agb-s3-website-prod-oac`
references the distribution ARN, so Terraform's graph updates the distribution *before* the bucket
policy. `wait_for_deployment` defaults true, so the provider blocks 3–10 minutes while the new
config reaches edges — and during that time missing keys still return 403 (no `ListBucket` yet)
while the distribution no longer maps 403. `/skills`, `/projects` and friends serve S3's
AccessDenied XML. `/` is fine, being a real object. Recovery is ~10s after the policy lands
(`error_caching_min_ttl`).

The obvious fix does not work, and it is worth writing down why so nobody tries it. Shipping the
`ListBucket` grant alone in an earlier change is *not* a no-op: the moment it is live, S3 answers
missing keys with 404, and the distribution has no 404 mapping yet, so deep links break the other
way instead. The only gapless transition carries **both** `custom_error_response` blocks through an
interim apply — which masks signed-URL 403s on `/files/*`, i.e. the exact bug this change fixes,
and which `files-locked.cy.js` now asserts against. The gapless path would fail the new smoke test.
A few minutes of broken deep links on a deploy you are watching is the cheaper trade.

**The old bundle's direct link 403s.** `trusted_key_groups` goes live during the apply, but the new
bundle only ships in `web-deploy` afterwards, so the currently-live page's plain `/files/…pdf`
anchor is dead in that gap.

## If the plan fails

- `ParameterNotFound` — the bootstrap has not run **in `AWS_TF_DEPLOYMENT_REGION`**. Region, not
  permissions: the Terraform role carries `PowerUserAccess`, whose `NotAction` covers only
  `iam:*`, `organizations:*` and `account:*`, so `ssm:GetParameter` is allowed. An
  `AccessDeniedException` here would mean an SCP or permission boundary, which is not something
  this repo configures.
- `no matching KMS alias found` on `data.aws_kms_alias.ssm` — `alias/aws/ssm` does not exist in
  that region. Writing the SecureString creates it, so the bootstrap covers this; but note it
  surfaces *after* the parameter read, so a region mistake produces two failures in sequence
  rather than one.
- `InvalidParameterValueException: Specified ReservedConcurrentExecutions ... below its minimum
  value of [10]` — this account's total Lambda concurrency limit is 10, and AWS refuses any
  reservation that would leave less than 10 unreserved, so no per-function reservation is
  possible at all. `downloadResume` therefore runs unreserved like every other function here.
  The stage throttle is the real bound; see "Concurrency" in [`signed-downloads.md`](signed-downloads.md#concurrency).
