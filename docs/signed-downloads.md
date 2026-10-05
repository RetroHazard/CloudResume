# Signed CV downloads

The CV is the one object on the site that is not served as a plain static file. Requests to
`/files/*` carry a CloudFront signature; unsigned ones are rejected at the edge. The
signature is minted per click by a Lambda that also records the download in DynamoDB.

## What this is and is not

It is not a confidentiality control. The PDF is committed to a public repository and can be
pulled from GitHub without touching AWS at all. Nothing here changes that, and it was never
meant to.

What it does buy:

- **Links expire.** Previously the CV sat at a permanent, guessable path — a URL handed out
  two years ago still worked. Signatures are good for 60 seconds.
- **Downloads are countable.** There was no way to measure them short of an Athena query
  over the CloudFront access logs.
- **Egress has a chokepoint.** An unsigned request is refused before any of the body is
  transferred, so the only way to pull the PDF at volume is through `GET /download` — which
  is throttled, and which counts what it hands out.

## Request flow

```
Download CV click
  └─> GET https://api.<domain>/<stage>/download?visitorId=<uuid>
        └─> λ downloadResume
              ├─ crc-download-record   dedupe on visitorId (24h TTL), bump download_count
              ├─ ssm:GetParameter      private key, cached for the life of the container
              └─ returns { downloadUrl, fileName, expiresAt, count }
  └─> browser downloads https://<domain>/files/<cv>.pdf?Expires=…&Signature=…&Key-Pair-Id=…
        └─> CloudFront validates against the trusted key group, then serves from cache
```

## Design notes worth keeping

**The URL is built on the site apex, not the distribution domain.** Browsers only honour a
link's `download` attribute same-origin. Signing `*.cloudfront.net` would make the PDF open
in a viewer instead of saving, and nothing would log an error.

**The object key comes from configuration, never the request.** A handler that signed a
caller-supplied key would be a signing oracle for the whole bucket.

**Telemetry never blocks the download.** The table is provisioned at 1 WCU. A throttled
counter write is logged and swallowed; the URL is still issued.

**The policy JSON is serialised with no spaces.** CloudFront reconstructs the exact string
to verify against, so a stray space fails every URL as an unexplained 403 with nothing in
any log. See `separators=(',', ':')` in `infrastructure/codebase/downloadResume.py`.

**The signer is hand-rolled, and deliberately so.** CloudFront requires RSA-SHA1, the Lambda
python3.12 runtime does not bundle `cryptography`, and every function in this repo is
packaged as a single bare `.py` by `data.archive_file`. Introducing a layer for one modexp
would mean either committing a binary manylinux wheel tree to a public repo or adding a
build step Terraform cannot perform. The padding is EMSA-PKCS1-v1_5, fully deterministic,
with no attacker-controlled input. `CvDownloadButton` covers the frontend; the signer itself
should be cross-checked against OpenSSL whenever it is touched:

```bash
openssl dgst -sha1 -verify signing-key.pub.pem -signature sig.bin policy.txt
```

## Two things that had to be fixed to make this work

**The SPA fallback used to map 403.** Without `s3:ListBucket`, S3 reports a missing key as
`403 AccessDenied` rather than `404 NoSuchKey`, so the distribution mapped 403 → `/index.html`
at 200 to make deep links work. A `custom_error_response` is distribution-wide and cannot be
scoped to one behavior, so that mapping also swallowed the 403 CloudFront returns for a bad
signature — a rejected request would have come back as the React shell with a 200. The bucket
policy now grants `ListBucket` to the distribution (CloudFront never calls it; nothing becomes
publicly listable), which lets the fallback key off 404 and leaves real 403s intact. WAF
blocks were masked the same way and now surface properly too.

**The API deployment never redeployed.** `aws_api_gateway_deployment.triggers.redeployment`
hashed `aws_api_gateway_rest_api.body`, which is only set for OpenAPI-defined APIs and is
null here — so it hashed a constant, and `depends_on` only orders creation. A newly added
route would have been created but never deployed to the stage. The trigger now hashes the
route surface itself; **any new resource, method or integration has to be added to that list
or it will not go live.**

## Key material

**Both halves live in Parameter Store. Nothing key-shaped belongs in this repo.**

| Parameter | Type | Read by |
| --- | --- | --- |
| `/CloudResume/cloudfront/signing-key` | `SecureString` | the Lambda, at cold start |
| `/CloudResume/cloudfront/signing-key.pub` | `String` | Terraform, at plan time |

Terraform never reads the private half — a `data "aws_ssm_parameter"` would put the signing
key into `terraform.tfstate` in cleartext, and the state bucket would then be holding it. It
does read the public half, which is fine: a public key in state is a non-issue.

Keeping them together is the point. An earlier revision committed the public PEM to the repo,
which meant two sources of truth that had to match; when they don't, every signature fails as
an edge 403 with nothing in any log. One bootstrap command now writes both.

### Bootstrap

Required before the first `terraform plan` — the public key is read at plan time, so the plan
fails until this exists. That failure is the intended signal: until the key is in place there
is nothing to deploy.

**Where to run it.** Either your own workstation with the AWS CLI authenticated to the
CloudResume account, or AWS CloudShell opened in that account. **Not** in CI, and not in any
agent or remote session — the private key exists in plaintext for the few seconds between
`genrsa` and `put-parameter`, and it should never pass through a shared runner or a session
transcript. The `mktemp -d` keeps it out of the repo working tree, so it cannot be committed by
accident. You need `ssm:PutParameter` in that account; nothing else.

**Which region.** The same one as the `AWS_TF_DEPLOYMENT_REGION` repository variable. There is a
single unaliased AWS provider (`infrastructure/provider.tf:23-28`), so Terraform reads the public
key in that region, and the Lambda's `boto3.client('ssm')` inherits its own function region,
which is the same one. A parameter written to any other region is invisible to both, and the
symptom is `ParameterNotFound` at runtime rather than anything at plan time.

```bash
# 1. Point at the right account and region, and confirm before writing anything.
export AWS_PROFILE=<your CloudResume profile>
export AWS_REGION=<AWS_TF_DEPLOYMENT_REGION>

aws sts get-caller-identity        # is this the CloudResume account?
echo "$AWS_REGION"                 # does this match the repository variable?

# 2. Generate outside the repo tree.
cd "$(mktemp -d)"
openssl genrsa -out signing-key.pem 2048
openssl rsa -in signing-key.pem -pubout -out signing-key.pub.pem

# 3. Store both halves. Do NOT pass --key-id: the Lambda's kms:Decrypt grant is scoped to
#    the AWS-managed alias/aws/ssm key (modules/iam/data.tf), so a customer-managed key
#    here would deploy cleanly and then fail at runtime with AccessDenied.
aws ssm put-parameter --name /CloudResume/cloudfront/signing-key \
  --type SecureString --value file://signing-key.pem \
  --description "CloudFront signed-URL private key for /files/*"

aws ssm put-parameter --name /CloudResume/cloudfront/signing-key.pub \
  --type String --value file://signing-key.pub.pem \
  --description "CloudFront signed-URL public key for /files/*"

# 4. Confirm the public half round-tripped and still parses as a 2048-bit key.
aws ssm get-parameter --name /CloudResume/cloudfront/signing-key.pub \
  --query Parameter.Value --output text | openssl pkey -pubin -noout -text | head -1

# 5. Destroy the local copies. shred is GNU-only; macOS has no equivalent worth the trouble.
shred -u signing-key.pem signing-key.pub.pem 2>/dev/null || rm -f signing-key.pem signing-key.pub.pem
cd - >/dev/null
```

Re-running any `put-parameter` against a name that already exists needs `--overwrite`; the first
run does not.

CloudFront requires RSA-2048. OpenSSL 3 writes PKCS#8 (`BEGIN PRIVATE KEY`), OpenSSL 1.x writes
PKCS#1 (`BEGIN RSA PRIVATE KEY`); the Lambda parses both, so either is fine.

You are not relying on step 4 to prove the pair works end to end — `cv-download-live.cy.js` does
that against production on the next deploy, which is the point of it being in the smoke set.

### Rotation

The Lambda caches the parsed key for the life of its container, so the order matters — trust
both keys before swapping, and untrust the old one only after containers have cycled.

1. Write the new public key to a second parameter, add a second `aws_cloudfront_public_key`
   for it, and list **both** ids in `aws_cloudfront_key_group.crc-cf-signing-key-group.items`.
   Apply. Both keys are now trusted.
2. Overwrite the private SecureString. New containers sign with the new key; warm ones keep
   signing with the old key, which is still trusted.
3. Once containers have cycled, remove the old resource and parameter. Apply.

`name_prefix` plus `create_before_destroy` on `aws_cloudfront_public_key` exists for this —
`encoded_key` forces replacement, and a fixed name would collide with itself mid-swap.

A rotation only takes effect on a cold start. If it is urgent, force one by redeploying the
function rather than waiting for containers to age out.

## Deploying this

The first deployment of this feature had a one-off checklist — an import to rule out before merging, an
expected plan shape, and two short outage windows during the apply. Those are kept as a historical record
in [`signed-downloads-rollout.md`](signed-downloads-rollout.md); they do not apply to routine changes.

## Concurrency

The account ceiling is 10 concurrent executions across every function, which is itself a hard
bound on what `/download` can cost. What is missing is *isolation*: without a per-function
reservation, a burst on `/download` can consume the whole pool and starve `trackVisitors` and
`sendMessage`. The stage throttle (2 rps / 5 burst on `download/GET`) is what prevents that,
by capping issuance before a request ever reaches Lambda.

If the account's concurrency quota is raised, reinstating
`reserved_concurrent_executions` on `crc-downloadResume` is worth doing — the comment on that
resource says so.

## Operations

### Un-gating in a hurry

`signed_downloads_enabled` is a kill switch for the **direct object URL only**. Turning it off
makes `/files/…pdf` fetchable by hand again, which helps while debugging a signing problem. It
does *not* restore the Download CV button — the button calls `/download` and never touches the
plain path, so if signing is broken the button is broken either way. To restore the button you
need the soft revert below.

It lives in an Actions variable so it can be flipped without a commit:

1. Settings → Secrets and variables → Actions → Variables → set `AWS_TF_SIGNED_DOWNLOADS`
   to `false`.
2. Run the Pipeline workflow via `workflow_dispatch` from `main` with `force_infrastructure`
   checked and `dry_run` off.

The dispatch is required, not optional: changing a repository variable produces no file diff, so
a push would leave the `terraform` job skipped entirely. `api_current_stage` has the same
property, for the same reason.

The value must be exactly `true` or `false`. Anything else fails the job with an explicit error
rather than being guessed at — a switch whose whole purpose is to carry the string `"false"` is
the last place to rely on truthiness. Unset means "use the default in
`infrastructure/variables.tf`", which is `true`.

### Backing the whole thing out

Prefer a **soft revert**: revert the website commits (which restores `resumeLink` and the direct
anchor) and set `AWS_TF_SIGNED_DOWNLOADS=false`. That returns the site to its pre-change
behaviour while leaving the Lambda, table and API route in place doing nothing.

Do not reach for a full `git revert` of the infrastructure unless you actually want the resources
gone: `crc-download-record` sets `deletion_protection_enabled = true`, so the destroy fails and
needs two applies — one to disable protection, one to destroy. A revert also re-crosses the
deep-link window described in [`signed-downloads-rollout.md`](signed-downloads-rollout.md), in the
opposite direction.

Two smoke specs cover this in production and are both in `pnpm cypress:smoke`:
`cv-download-live.cy.js` clicks the real button and fetches the URL it produces, which is what
proves the two halves of the key pair agree; `files-locked.cy.js` proves an unsigned request is
still refused. Either passing alone can coexist with broken gating, so they run as a pair.

Throttling is set by `api_throttle_*` in `infrastructure/variables.tf`: 10 rps / 20 burst
across every method, 2 rps / 5 burst on `download/GET`. These are the only bound on what the
API can be made to cost — `api.<domain>` is an edge-optimized endpoint with its own internal
CloudFront distribution, and the `CloudResume-WebACL` is `CLOUDFRONT`-scoped, so WAF never
covered it. Pair them with an AWS Budgets alarm.

Rough costs per million downloads: ~$35 API Gateway, ~$0.41 Lambda, ~$1 CloudFront requests,
~$11 egress at 133 KB/download. Egress dominates and was already being paid.
