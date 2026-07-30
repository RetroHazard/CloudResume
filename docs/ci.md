# CI/CD

One workflow, [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), covers both stacks, plus
`dependency-review.yml` which stays standalone because it needs `pull-requests: write` and is
already a registered required check.

## Job graph

```
                       changes
                          │
    ┌──────────┬──────────┼───────────┬────────────┐
    ▼          ▼          ▼           ▼            ▼
web-checks  web-e2e   terraform    py-lint    actionlint
 typecheck  build +   fmt/validate   ruff      (.github
 prettier   preview   plan                      changed)
 vitest     cypress   apply ──[main only]
    │          │      ↳ secrets_changed?
    │          │          │
    ├──────────┴──────────┴─────┬──────────────┐
    ▼                           ▼              ▼
mark-verified              web-deploy        ci-ok
  (PR only)                build-prod       (always)
                           + s3 sync
                                │
                                ▼
                            web-smoke
```

`web-deploy` runs when `website` changed **or** the plan rewrote the Actions secrets — see below.

`ci-ok` is the single required status check. Everything else can be renamed without touching branch
protection, and a job skipped by `if:` — the normal outcome for a stack that did not change — counts
as a pass.

## Why things are the way they are

**Gating lives in the `changes` job, not in a workflow-level `paths:` filter.** A workflow filtered
out by `paths` emits no check runs at all, so a required check from it stays pending forever and the
PR can never merge. A job skipped by `if:` reports `skipped`, which branch protection treats as
success.

**Checks do not re-run after a merge.** When the website checks pass on a PR, `mark-verified`
uploads a marker artifact named for a digest of the `website/` tree plus the `.github` tree. On a
later run, `changes` looks that name up and skips the jobs on a hit. Because `actions/checkout`
resolves `refs/pull/N/merge` on a `pull_request` event, the tree the PR proved is already the merged
tree — so a squash merge lands byte-identical content and the marker hits. If `main` moved and
touched `website/`, the digest differs and the checks correctly re-run.

Three things keep that honest: expired artifacts are filtered out (they stay listed with a tombstone
flag), markers whose producing run came from a fork are rejected on `repository_id`, and any lookup
error falls through to running the checks. `workflow_dispatch` takes a `force_checks` input to
ignore markers entirely.

It is deliberately **not** applied to Terraform. A plan depends on live AWS state and drift, not just
on file content, so it is not a pure function of the tree.

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

**`terraform apply` consumes the saved plan** rather than re-planning, so what lands is what was
reviewed a step earlier.

**Deploy conditions test `!= 'failure'`, not `== 'success'`.** `!cancelled()` lifts the implicit
"skip me if an upstream was skipped" rule for every `needs:` at once, so each has to be re-asserted
by hand — and `terraform` is legitimately skipped on a website-only change, as are the website checks
whenever a marker hit.

## Manual runs

`workflow_dispatch` inputs:

| Input | Purpose |
| --- | --- |
| `force_website` | Run and deploy the website regardless of what changed. This is the CDN-invalidation escape hatch: re-uploading `index.html` is what enqueues the `cloudfrontInvalidation` Lambda. It is also how you recover a bundle left stale by an apply whose deploy failed, or by an `api_current_stage` change made through the repository variable rather than a commit. |
| `force_infrastructure` | Run Terraform regardless of what changed. |
| `force_checks` | Ignore verification markers. |
| `dry_run` | **Off by default** — a manual dispatch is a real deploy. Turn it on to rehearse instead: `aws s3 sync --dryrun` and `terraform show` in place of `apply`. `--dryrun` is a real CLI flag, so OIDC, bucket permissions and the prune logic are all still exercised for real. |

## Local equivalents

```bash
cd website
pnpm typecheck        # tsc --noEmit
pnpm format:check     # prettier --check .
pnpm test             # vitest run --coverage
pnpm build-dev && pnpm preview   # then pnpm cypress:run in another shell

ruff check infrastructure/codebase/ && ruff format --check infrastructure/codebase/
actionlint
cd infrastructure && terraform fmt -check -recursive && terraform validate
```

## Remaining cutover steps

`ci.yml` currently triggers on `pull_request` and `workflow_dispatch` only. `main` is still served by
`website.yml` and `infrastructure.yml`, and `infrastructure-test.yml` still runs its own plan on PRs,
so PRs get one cycle of duplicate checks. Both Terraform jobs plan the same remote state, and
whichever reaches it second is refused the S3 state lock, so every plan and apply in both workflows
passes `-lock-timeout=5m` to wait rather than fail.

Branch protection is already settled: **`CI` is the sole required status check**, and "Require
branches to be up to date before merging" is on. Because none of the legacy check names
(`validation`, `planning`) are required, deleting their workflows cannot leave a required check
pending — so what remains is a single commit:

- add `push: { branches: [main] }` to `ci.yml`'s `on:` block;
- delete `website.yml`, `infrastructure.yml`, `infrastructure-test.yml`;
- replace the two README badges with
  `.../actions/workflows/ci.yml/badge.svg?branch=main&event=push`. The `event=push` matters — without
  it the badge reflects the most recent run of *any* event on the branch, so a failed PR run would
  show the site as broken. The badge label follows the workflow name, so it will read "Pipeline"
  unless overridden with `&label=`.

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
