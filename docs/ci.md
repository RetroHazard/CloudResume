# CI/CD

One workflow, [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), covers both stacks across
both halves of the lifecycle: `pull_request` runs the checks and a plan, `push` to `main` runs
whatever the PR did not already prove and then applies and deploys. `dependency-review.yml` stays
standalone because it needs `pull-requests: write` and is already a registered required check.

## Job graph

```
                       changes
                          │
    ┌──────────┬──────────┼───────────┬────────────┐
    ▼          ▼          ▼           ▼            ▼
web-checks  web-e2e   terraform    py-lint    actionlint
 typecheck  build +   fmt/validate   ruff      (.github
 prettier   preview   plan                      changed)
 vitest     cypress   apply ──[main only, if the plan is non-empty]
    │          │      ↳ secrets_changed? applied?
    │          │          │
    ├──────────┴──────────┴─────┬──────────────┐
    ▼                           ▼              │
mark-verified              web-deploy          │
  (PR only)                build-prod          │
  web/ruff/actionlint      + s3 sync           │
  markers                       │              │
                                ▼              │
                              smoke ◀──[also on an apply with no deploy]
                                │              │
                                └──────────────┤
                                               ▼
                                             ci-ok
                                            (always)
```

`web-deploy` runs when `website` changed **or** the plan rewrote the Actions secrets — see below.
`smoke` runs when `web-deploy` succeeded **or** the apply actually ran.

`ci-ok` is the single required status check. Everything else can be renamed without touching branch
protection, and a job skipped by `if:` — the normal outcome for a stack that did not change — counts
as a pass. It depends on the deploy jobs as well as the checks, so on a push it is also the one
status that says whether the deploy landed; before they were listed, a failed production deploy left
the commit green. `needs:` only orders jobs, so this cannot cause a deploy on a PR — `web-deploy`'s
own `if:` requires `refs/heads/main` and a `push`/`workflow_dispatch` event, and on a PR it is
skipped. `mark-verified` is deliberately **not** a dependency: a marker upload is an optimisation,
and failing to write one must not fail the gate.

## Why things are the way they are

**Gating lives in the `changes` job, not in a workflow-level `paths:` filter.** A workflow filtered
out by `paths` emits no check runs at all, so a required check from it stays pending forever and the
PR can never merge. A job skipped by `if:` reports `skipped`, which branch protection treats as
success.

**Checks do not re-run after a merge.** When a group of checks passes on a PR, `mark-verified`
uploads a marker artifact named for a digest of the trees those checks read. On a later run,
`changes` looks that name up and skips the jobs on a hit. Because `actions/checkout` resolves
`refs/pull/N/merge` on a `pull_request` event, the tree the PR proved is already the merged tree — so
a squash merge lands byte-identical content and the marker hits. If `main` moved and touched one of
those trees, the digest differs and the checks correctly re-run.

There are three digests. The whole `.github` tree is in all of them, so editing a workflow or bumping
a pinned tool version conservatively invalidates every marker it could affect:

| Marker | Digest over | Gates |
| --- | --- | --- |
| `verified-web-<digest>` | `website/` + `.github/` | `web-checks`, `web-e2e` |
| `verified-ruff-<digest>` | `infrastructure/` + `ruff.toml` + `.github/` | `py-lint` |
| `verified-actionlint-<digest>` | `.github/` | `actionlint` |

**A digest has to cover exactly the jobs whose trigger gates it.** The two linters would happily
share one — both are cheap and tree-pure — but their triggers differ, and `mark-verified` may only
write a marker on a run where the jobs it certifies were allowed to execute. An
infrastructure-only PR skips `actionlint`, because `.github` did not change; a shared marker would
then claim `actionlint` had passed on that content, and a later revert of `.github` back to that
exact tree would skip it on content it had never checked. One marker per trigger condition, and each
upload step repeats its job's own `if:`, so a marker means "this job reached a verdict on this
content". If the job was skipped while its trigger held, that can only be because its own marker
already existed, and the re-upload just refreshes it.

`ruff.toml` is in the `ruff` digest, and in the `infrastructure` path filter, even though it sits at
the repository root: it configures the lint over `infrastructure/codebase/`, so changing
`line-length` or the target version has to re-run `py-lint` on code whose rules just moved.

Three things keep the lookup honest: expired artifacts are filtered out (they stay listed with a
tombstone flag), markers whose producing run came from a fork are rejected on `repository_id`, and
any lookup error falls through to running the checks. `workflow_dispatch` takes a `force_checks`
input to ignore markers entirely.

`mark-verified` gates on `!cancelled()` plus a per-job `result != 'failure'` rather than job-level
`success()`. `success()` could not express "the website checks passed but the linter failed", and it
does not lift the implicit "skip me if an upstream was skipped" rule, so the job never ran at all on
a PR where a marker had already hit. A consequence of it now running in that case is useful:
re-pushing identical content re-uploads the marker with `overwrite: true`, resetting its 30-day
retention instead of letting a long-lived branch lose its marker to expiry.

Every check gated this way has to be a pure function of the tree, which is why the Terraform **plan**
is never marker-skipped: it depends on live AWS state and drift, not just on file content.
`terraform validate` and `fmt -check` *are* tree-pure and could be, but they cost seconds and guard
an apply, so they run every time.

> If you ever add `ref: ${{ github.event.pull_request.head.sha }}` to the checkout in `changes`, the
> digest stops matching the merge result and no marker will ever hit again.

**Build and deploy are one job.** `VITE_AWS_API_ENDPOINT` is baked into the bundle at build time, and
`AWS_API_ENDPOINT` is one of the Actions secrets Terraform writes back via `github_actions_secret`
in `modules/github`. Secrets resolve when a job starts, so the build — not merely the upload — has to
run after the apply, or a run that changes the endpoint ships a bundle pointing at the old one.

**An infrastructure-only change can also require a deploy.** The same fact cuts the other way: if an
apply rewrites `AWS_API_ENDPOINT`, the bundle already in S3 is stale even though nothing under
`website/` changed, and the site starts calling an endpoint that no longer exists. The endpoint is
`https://<api record>/<stage>`, so it moves whenever `domain_name` or `api_current_stage` does — and
`api_current_stage` comes from a repository *variable*, so it can move with no diff at all.
`AWS_S3_BUCKET_PROD` has the same property, being the upload target.

So `web-deploy` runs on `website == 'true' || terraform.outputs.secrets_changed == 'true'`, where
that second output comes from reading the saved plan for `github_actions_secret` resources with a
`create`, `update` or `delete` action. Gating on the plan rather than on `infrastructure == 'true'`
is what keeps every Lambda edit and IAM tweak from re-uploading the whole site and paying for a
CloudFront invalidation it does not need. The check fails safe: an unreadable plan, a `terraform
show` that errors, anything that does not parse as a confident zero, all resolve to "assume it
changed", because a missed rebuild breaks the site while a needless one costs a few minutes.

The one case it cannot see is an apply that succeeded while the deploy after it failed — the replay
plans clean, so nothing signals that the bundle is behind. `workflow_dispatch` with `force_website`
is the recovery path.

**The smoke test hangs off both.** That narrow deploy gate is right for deciding whether to re-upload
the bundle and wrong for deciding whether production needs checking. `smoke` used to need only
`web-deploy`, so every Lambda edit, API Gateway change, CloudFront behaviour and IAM tweak applied
straight to production with nothing running afterwards — and reported green, because a skipped job
counts as a pass. It now runs on `web-deploy.result == 'success' || terraform.outputs.applied ==
'true'`, where `applied` is read off the `Apply` step's own `outcome`. That step's `if:` already
encodes every condition — `main`, a non-empty plan, not a dry run — and a step excluded by `if:`
reports `skipped`, so the empty-plan, PR and dry-run paths all resolve to `false` without a second
copy of the expression to keep in sync.

One job rather than one per stack: an apply can break the site and a deploy can break the API
contract, so both paths want the same specs, and a run that changes both stacks would otherwise
smoke test the same site twice. `web-deploy` is tested for `!= 'failure'` rather than `== 'success'`
alongside the `||`, because it is legitimately skipped on the apply-only path.

`ci-ok` asserts the pairing positively, in both directions: if `web-deploy` succeeded **or** the
apply ran, `smoke` must have succeeded. `toJSON(needs)` carries job outputs as well as results, so
the same blob the gate already reads holds `applied`. Everything else in that job treats a skip as a
pass — correct for a stack that did not change, and exactly what hid the smoke test not running
across four consecutive deploys (#121–#123). This is the one place the distinction is worth failing
over.

**What the smoke test covers.** `pnpm cypress:smoke` runs six specs against
`https://<domain>`, all of them skipping themselves when pointed at a local preview:

| Spec | Proves |
| --- | --- |
| `navigation.cy.js` | CloudFront serves 200 on the apex, every SPA route, and the 404 fallback |
| `visitor-counter.cy.js` | the counter renders (API stubbed) |
| `files-locked.cy.js` | the edge rejects an unsigned `/files/*` |
| `bucket-locked.cy.js` | the S3 origin rejects an anonymous read — the other half of the CloudFront-only policy, and the only thing testing it, since there is no `aws_s3_bucket_public_access_block` on the prod bucket |
| `cv-download-live.cy.js` | a real signed URL fetches the PDF: API GW → Lambda → SSM → DynamoDB → CloudFront key group all agree |
| `api-live.cy.js` | `GET /visitors` returns JSON with a numeric `count` and the right CORS origin; both request validators still reject a missing querystring at the gateway; `POST /contact` reaches its Lambda |

The two live API specs need `CYPRESS_API_ENDPOINT`, `CYPRESS_S3_BUCKET` and `CYPRESS_AWS_REGION` in
addition to `CYPRESS_BASE_URL`; every request they make is anonymous, so no AWS credentials are
involved. `/contact` is probed with a deliberately foreign `Origin`, which `sendMessage` refuses
before it ever constructs an SES client — that is what proves the route is alive without emailing a
human on every deploy. The 403 assertion checks the body text as well as the status, because API
Gateway answers a request for a route that does not exist with a 403 of its own.

Both live specs reuse a fixed identifier (`ci-smoke-test`) for the `visitorId` and `uuid`
querystrings. `trackVisitors` and `downloadResume` both write a record with a 24-hour TTL and only
count on a miss, so repeat deploys are absorbed by the dedupe rather than inflating the public
counters once per push to `main`.

**`terraform apply` consumes the saved plan** rather than re-planning, so what lands is what was
reviewed a step earlier. The plan is handed straight from the plan step to the apply step within one
job, and is never carried between runs. Reusing a PR's plan for the post-merge apply would eliminate
the second plan, but a plan file is not a build artifact: it holds every value the plan touched in
cleartext, `TF_VAR_github_token` among them, and this repository is public. It is also pinned to the
state's lineage and serial, so anything applied in between makes it `stale` rather than merely out of
date, and a PR-time plan describes AWS as it was then rather than at merge.

**An empty plan skips the apply.** `terraform plan` runs with `-detailed-exitcode`, which
distinguishes "succeeded, nothing to do" (0) from "succeeded, changes planned" (2); errors are still
1. The `Apply` step is gated on the latter, so a push whose diff changes no resources does not
re-take the state lock and re-refresh every resource in order to write nothing.

The step deliberately drops `-e` for that one command (`… || code=$?`) because the default shell here
is `bash -e {0}`, which would otherwise treat the successful exit 2 as fatal before the exit code
could be read.

**`setup-terraform`'s wrapper has to stay off for that to work.** It is on by default, and it maps
`terraform plan`'s exit code 2 to 0 — sensible in isolation, since 2 is not an error, and fatal here
because 2 is the entire signal. With it on, every non-empty plan read as empty, `changes` was always
`false`, and the `Apply` step's gate never opened: a push to `main` reported green having applied
nothing. Nothing in this workflow reads the `stdout`/`stderr`/`exitcode` outputs the wrapper exists
to provide, so `terraform-wrapper: 'false'` costs nothing. The Plan step now also re-reads the saved
plan whenever the exit code claims "empty" and fails if it actually holds resource changes, so a
regression is loud rather than invisible.

The wrapper was not the only thing stopping a plan from ever being empty. The root module used
to export `caller_arn` and `caller_user`, both derived from `aws_caller_identity`, whose
assumed-role ARN and `user_id` embed the *session* name — `GitHubTerraform` on a plan,
`GitHubTerraformApply` on the old deploy job, something else from a laptop. They differed on
essentially every run, so every plan carried a `Changes to Outputs` diff and `-detailed-exitcode`
returned 2 regardless of whether a resource moved. Both are removed
(`infrastructure/outputs.tf`); `account_id` stays, being stable and already an input to the
modules. Attributing a change to the job that made it is CloudTrail's job, via the
`role-session-name` set in `.github/actions/setup-terraform` — and unlike an output, which only
ever records the most recent apply, CloudTrail keeps the history.

The apply that removes them will itself show one last `Changes to Outputs`; plans after that can
be genuinely empty, and the skip is real for the first time.

The one thing the skip gives up is that applying an empty plan is also what persists a refresh, so
drift Terraform noticed but had nothing to change about stays in the state file until the next real
apply. That costs nothing, since every plan refreshes from AWS again anyway.

**The fork and Dependabot guards on the Terraform job apply to `pull_request` only.** Fork and
Dependabot PRs hold neither `secrets.PAT` nor an OIDC token, so without the guards they would fail
red on a job they could never have run. On a push, `github.actor` is whoever caused the push — so a
Dependabot PR that auto-merges an `infrastructure/` bump arrives on `main` as `dependabot[bot]`, and
an unscoped guard would skip the apply and report green having deployed nothing.

**Deploy and marker conditions test `!= 'failure'`, not `== 'success'`.** `!cancelled()` lifts the
implicit "skip me if an upstream was skipped" rule for every `needs:` at once, so each has to be
re-asserted by hand — and `terraform` is legitimately skipped on a website-only change, as are the
website checks and the linters whenever a marker hit.

## Manual runs

`workflow_dispatch` inputs:

| Input | Purpose |
| --- | --- |
| `force_website` | Run and deploy the website regardless of what changed. This is the CDN-invalidation escape hatch: re-uploading `index.html` is what enqueues the `cloudfrontInvalidation` Lambda. It is also how you recover a bundle left stale by an apply whose deploy failed, or by an `api_current_stage` change made through the repository variable rather than a commit. |
| `force_infrastructure` | Run Terraform regardless of what changed. Also the only way to apply a change made through a repository *variable* rather than a commit — `api_current_stage` and `signed_downloads_enabled` both move with no file diff, so a push would leave the job skipped. |
| `force_checks` | Ignore verification markers. |
| `dry_run` | **Off by default** — a manual dispatch is a real deploy. Turn it on to rehearse instead: `aws s3 sync --dryrun` and `terraform show` in place of `apply`. `--dryrun` is a real CLI flag, so OIDC, bucket permissions and the prune logic are all still exercised for real. |

## Local equivalents

```bash
cd website
pnpm typecheck        # tsc --noEmit
pnpm format:check     # prettier --check .
pnpm test             # vitest run --coverage
pnpm build-dev && pnpm preview   # then pnpm cypress:run in another shell

# The smoke set against production. Without the three extra variables the two live
# API specs skip themselves, exactly as they do in the PR e2e job.
CYPRESS_BASE_URL=https://<domain> \
CYPRESS_API_ENDPOINT=<api endpoint> \
CYPRESS_S3_BUCKET=<prod bucket> \
CYPRESS_AWS_REGION=<region> \
pnpm cypress:smoke

ruff check infrastructure/codebase/ && ruff format --check infrastructure/codebase/
actionlint
cd infrastructure && terraform fmt -check -recursive && terraform validate
```

## What this replaced

`main` used to be served by `website.yml` and `infrastructure.yml`, with `infrastructure-test.yml`
planning on PRs. All three are gone. What they cost, and what replaced it:

`infrastructure.yml` ran `validation` → `planning` → `deploy` as three jobs, each repeating checkout,
the OIDC assume, the Terraform install and `terraform init`. The `planning` job printed a plan and
threw it away, and `deploy` ran `apply -auto-approve`, which planned a third time — so what landed
was never what had been reviewed. All three pinned `terraform_version: latest`, meaning a HashiCorp
release could change an apply with no repo change; the version is now pinned in one place, in
`.github/actions/setup-terraform`. An infrastructure change now costs one init and one plan, and the
apply consumes that plan.

`website.yml` gated on a `check_infrastructure` job that polled
`gh run list --workflow="Terraform" --branch=main --limit=1` — the *latest* Terraform run on main
regardless of commit, so a failure from days earlier blocked every subsequent deploy, and on a
website-only push it read a run that had nothing to do with the commit. That is now a plain `needs:`
edge. Four jobs each re-ran `pnpm install`, one of them (`setup`) only to install and throw the result
away because it existed to carry an `if:` gate; the build reached `deploy` smuggled through
`actions/cache` keyed on `github.sha`. Unit tests re-ran post-merge on content the PR had already
proved — the markers above are what fixed that. And the post-deploy Cypress job carried
`continue-on-error: true`, so it rendered green whatever happened; `smoke` does not, and runs a
subset rather than the full suite.

Deleting `infrastructure-test.yml` also removed a second plan against the same remote state on every
infrastructure PR, where whichever job reached the S3 lock second had to wait for the other.

`dependency-review.yml` stays standalone, as above.

The two README badges collapsed into one, `ci.yml/badge.svg?branch=main&event=push`. The `event=push`
matters — without it the badge reflects the most recent run of *any* event on the branch, so a failed
PR run would show the site as broken. The label follows the workflow name, so it reads "Pipeline".

One rule to keep in mind for any future change here: required status checks are matched by **job
display name**, and GitHub's branch-protection UI only offers names it has seen in the last ~7 days.
So a renamed gate job cannot be pre-registered — it has to report once before it can be required,
which means renaming `ci-ok`'s display name away from `CI` would block every PR until branch
protection was updated to match. That is why the *workflow* is named "Pipeline" and the job is named
"CI", rather than the other way round.

`.git-blame-ignore-revs` needs no setting — GitHub reads it from the repository root automatically
once it is on the default branch, so the prettier reformat drops out of the blame view on merge.
Local git does not read it (config is not part of the repo), so each clone needs
`git config blame.ignoreRevsFile .git-blame-ignore-revs`.
