# GP-SECRET-001 — Gross Profit live certification secret boundary

Status: **EXTERNAL BLOCKER — runtime credentials unavailable to the certification job**

Recorded against target HEAD: `76d320aa2b714658241506c72d479e4fbdd21e34`

## Exact required configuration

Required by `.github/workflows/phase-e-live-certification.yml` for the Gross Profit runtime step:

- `CERT_SUPABASE_URL`
- `CERT_SUPABASE_ANON_KEY`
- `CERT_TENANT_A_ID`
- `CERT_TENANT_B_ID`
- `CERT_USER_A_JWT`
- `CERT_USER_B_JWT`

Additional live probes require:

- `CERT_TARGET_ENV`
- `CERT_STORAGE_BUCKET`
- `CERT_STORAGE_OBJECT_A`
- `CERT_STORAGE_OBJECT_B`
- `CERT_AI_RETRIEVAL_ENDPOINT`
- `CERT_ALLOW_PRODUCTION`
- `CERT_REALTIME_HEALTH_URL`
- `CERT_BACKUP_DRILL_URL`
- `CERT_OBSERVABILITY_HEALTH_URL`
- `CERT_ROLLBACK_DRILL_URL`

## Exact workflow/job/step

- Workflow: `.github/workflows/phase-e-live-certification.yml`
- Job: `certify`
- Runtime step: `Gross Profit actual production consumer runtime`
- Run observed: `32950330789`, attempt `2`
- Event: `push`
- Branch: `runtime/gross-profit-surface-proof`
- HEAD: `76d320aa2b714658241506c72d479e4fbdd21e34`

## Failure signal

The runner reported the six required Gross Profit variables as empty and the runtime proof terminated fail-closed with exit code `10` before any authenticated query was executed.

## What was verified

1. The workflow uses direct `${{ secrets.NAME }}` references at step-level `env`; there is no `environment:` binding in the job.
2. The run was a repository `push` event, not a fork pull request.
3. The runner identified `Secret source: Actions`.
4. Checkout, npm installation, the static SaaS certification contract, and the source secret audit all passed before the runtime boundary.
5. The runtime artifact was uploaded even though live execution was blocked.
6. The workflow maps the corrected JWT names `CERT_USER_A_JWT` and `CERT_USER_B_JWT` exactly.

## What cannot be verified from repository-only access

GitHub does not expose secret values and this repository integration does not provide a secret-listing/settings endpoint. Therefore the evidence cannot distinguish, with certainty, between:

- repository secrets absent;
- organization secrets with repository access disabled;
- organization/environment policy preventing exposure;
- another external GitHub configuration issue.

However, the repository workflow topology itself does **not** contain an environment boundary that would explain the emptiness. If exact-name repository secrets exist, GitHub Actions should expose them to this step. Thus the current evidence points to configuration outside the committed workflow rather than a workflow-to-environment binding bug.

## Owner action — single boundary action

Configure the six required Gross Profit secrets at repository scope (or grant the repository explicit access to an organization secret set) using the exact names above, then rerun the workflow on the current branch/HEAD.

Do not place secret values in source, artifacts, logs, fixtures, or this record.

## Unblock condition

A fresh exact-HEAD run must show the six required variables as present/non-empty without printing their values, then execute the authenticated Gross Profit consumer proof. Only after that can runtime claims advance beyond `NOT PROVEN`.

## Classification

`EXTERNAL BLOCKER / OWNER ACTION REQUIRED / NOT A PRODUCT BUG`
