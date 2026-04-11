# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloud Resume Challenge — a Single Page React App backed by AWS infrastructure managed with Terraform. The repo has two independent workstreams: `website/` (React frontend) and `infrastructure/` (Terraform IaC).

## Website Commands

All commands run from the `website/` directory.

```bash
# Install dependencies
npm ci

# Development server (uses development JSON data)
npm run start-dev

# Production preview (uses production JSON data)
npm run start-prod

# Run tests (with coverage update)
npm run test

# Build
npm run build-dev   # outputs to build/dev/
npm run build-prod  # outputs to build/prod/
```

### Environment Variables (required for production build)
- `REACT_APP_RECAPTCHA_SITE_KEY` — Google reCAPTCHA site key
- `REACT_APP_AWS_API_ENDPOINT` — API Gateway endpoint URL

## Infrastructure Commands

All commands run from the `infrastructure/` directory.

```bash
terraform init
terraform validate
terraform plan -input=false
terraform apply -auto-approve
```

Terraform variables are expected as env vars prefixed `TF_VAR_` — see `.github/workflows/infrastructure.yml` for the full list. There is no local `.tfvars` file.

## Architecture

### Frontend (`website/src/`)

- **Data loading**: `REACT_APP_DATA_SET` env var (`development` or `production`) controls which JSON dataset is loaded. `jsonLoader.jsx` uses webpack `require.context` to load from `assets/json/{dataset}/`. This means dev and prod can have different data without code changes.
- **Component pattern**: Pages in `pages/{PageName}/index.jsx` compose shared components from `components/`. Most pages wrap content in `<DataLoader file="...">` (render-prop pattern) to async-load their JSON data.
- **Styling**: Tailwind CSS with `tailwind-merge` for conditional class merging.
- **Routing**: React Router v6 with all routes defined in `App.js`.

### Backend Lambda Functions (`infrastructure/codebase/`)

Three Python Lambda functions deployed via Terraform:
- `trackVisitors.py` — DynamoDB-backed visitor counter with 24h deduplication TTL via UUID per visitor
- `sendMessage.py` — Contact form handler using SES + SQS
- `cloudfrontInvalidation.py` — Triggered by S3 deploys to invalidate CloudFront cache
- `stagingAuthorization.js` — CloudFront Lambda@Edge for staging environment HTTP basic auth

### Infrastructure Modules (`infrastructure/modules/`)

Four interdependent modules wired together in `main.tf`:
- `frontend` — S3, CloudFront distribution, WAF (optional), API Gateway, Route53, ACM
- `backend` — Lambda functions, DynamoDB tables, SES, SQS, CloudWatch
- `iam` — All IAM roles, policies, and the GitHub Actions deploy user
- `github` — Writes AWS credentials and config as GitHub Actions secrets via Terraform GitHub provider

Module outputs are cross-referenced extensively (e.g., `module.backend.X` passed into `module.frontend`). The `github` module provisions the repo secrets used by CI/CD.

### CI/CD

- **Website workflow** (`.github/workflows/website.yml`): Waits for Terraform to complete, runs Jest tests, builds production bundle, syncs to S3.
- **Terraform workflow** (`.github/workflows/infrastructure.yml`): validate → plan → apply on push to `main` under `infrastructure/**`.
- **Drift detection** (`.github/workflows/detectdrift.yml`): Scheduled Terraform plan to detect infrastructure drift.

## Testing

Tests live in `website/src/__tests__/` and use Jest + React Testing Library. Each test file corresponds to a component. Run a single test file:

```bash
cd website && npx react-scripts test --testPathPattern="NavBar" --watchAll=false
```
