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
| `force_website` | Run and deploy the website regardless of what changed. This is the CDN-invalidation escape hatch: re-uploading `index.html` is what enqueues the `cloudfrontInvalidation` Lambda. |
| `force_infrastructure` | Run Terraform regardless of what changed. |
| `force_checks` | Ignore verification markers. |
| `dry_run` | Exercise the deploy path without mutating anything — `aws s3 sync --dryrun` and `terraform show` in place of `apply`. `--dryrun` is a real CLI flag, so OIDC, bucket permissions and the prune logic are all still exercised for real. |

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
`website.yml` and `infrastructure.yml`, and `infrastructure-test.yml` still runs its own plan on
PRs, so PRs get one cycle of duplicate checks. That is deliberate — required status checks are
matched by **job display name**, and deleting the old workflows before deregistering their names
deadlocks the repo: every PR would wait on a check nothing can produce, including the PR that fixes
it. GitHub's branch-protection UI also only offers names it has seen in the last ~7 days, so the new
ones cannot be pre-registered.

In order:

1. Open a PR so `ci-ok` reports at least once.
2. Branch protection on `main`: add `ci-ok` to the required status checks. Leave `validation`,
   `planning` and `Dependency Review` required for now — all of them still report.
3. Remove `validation` and `planning` from the required list.
4. Then, in one commit:
   - add `push: { branches: [main] }` to `ci.yml`'s `on:` block;
   - delete `website.yml`, `infrastructure.yml`, `infrastructure-test.yml`;
   - replace the two README badges with
     `.../actions/workflows/ci.yml/badge.svg?branch=main&event=push`. The `event=push` matters —
     without it the badge reflects the most recent run of *any* event on the branch, so a failed PR
     run would show the site as broken.
5. Optionally enable "Require branches to be up to date before merging", so a PR's checks are
   always checks of the tree that will actually land.

Also worth setting once: Settings → General → "Ignore revisions in blame view", pointed at
[`.git-blame-ignore-revs`](../.git-blame-ignore-revs), so the prettier reformat does not dominate
`git blame`.
