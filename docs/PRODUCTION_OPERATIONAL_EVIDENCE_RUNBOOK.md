# Production Operational Evidence Runbook

## Purpose

This runbook converts the remaining certification blockers into executable evidence procedures. Source-level contracts are prerequisites, not substitutes for live evidence.

## Evidence identity

Every operational evidence bundle must record:
- exact application/source SHA;
- deployment identifier and environment;
- timestamp with timezone;
- operator/action identity;
- tenant identity where applicable;
- test case identifier;
- expected result;
- observed result;
- artifact/log/screenshot reference;
- PASS/FAIL and blocker classification.

Evidence from a different SHA, environment, tenant, or deployment must not be promoted.

## P0-A — Authenticated Runtime

1. Open the exact deployed candidate.
2. Authenticate with an authorized test account.
3. Record session establishment and deployed SHA.
4. Execute dashboard read, product read, permitted write, import, report/evidence read, and logout/session-expiry checks.
5. Capture browser console/network failures and server/runtime evidence.
6. Repeat with each required role.
7. Any 401/403/5xx outside the expected authorization matrix is a failure.

## P0-B — Tenant A/B Isolation

1. Authenticate Actor A against Tenant A and Actor B against Tenant B.
2. Record both tenant IDs and sessions.
3. Verify own-tenant reads/writes/imports/reports succeed where authorized.
4. Attempt cross-tenant read, write, import, report, evidence, storage, and RPC access from both actors.
5. Verify every unauthorized cross-tenant operation is denied and no response leaks protected data.
6. Capture request/response evidence and database-side evidence where available.

## P1-C — Production Runtime / Deployment Identity

1. Identify the production deployment and source SHA.
2. Verify the runtime reports the same SHA as the certified candidate.
3. Verify required public configuration exists without exposing secrets.
4. Verify Supabase connectivity and authenticated RPC paths.
5. Execute production smoke checks.
6. Record Vercel deployment, runtime health, browser evidence, and exact SHA.

## P1-D — Backup / Restore / Rollback

### Backup
- Create a controlled backup of the test/production-approved dataset.
- Record artifact identity and integrity checksum.
- Verify the backup contains required schema/data boundaries.

### Restore
- Restore into the approved isolated target.
- Verify migration parity and row/business invariants.
- Verify tenant isolation after restore.
- Run authenticated smoke and critical report/import checks.
- Record measured RPO/RTO.

### Rollback
- Deploy the approved candidate transition in a controlled environment.
- Trigger the approved rollback procedure.
- Verify deployment/source identity, application health, authentication, data compatibility, and tenant isolation after rollback.
- Do not mutate the production alias merely to manufacture evidence.

## P1-E — Arabic Document/OCR Golden Corpus

1. Use the approved Arabic PDF corpus.
2. Record file hashes.
3. Execute extraction/OCR.
4. Compare normalized text, fields, confidence, classification, and canonical values against Golden Truth.
5. Record false-positive/false-negative cases.
6. Preserve input hash, output artifact, confidence, and evidence lineage.

## P1-F — Import / Reconciliation

1. Execute the approved realistic workbook.
2. Verify validation, dedupe, SKU reconciliation, conflicts, canonical mapping, pricing, inventory, and lineage.
3. Include malformed rows, duplicate SKU, missing cost/source data, and conflicting records.
4. Verify incomplete source data cannot silently become false business truth.
5. Reconcile output totals and evidence to the source dataset.

## P1-G — Worker Runtime

Exercise claim, heartbeat, checkpoint, retry, failure, dead-letter, resume, and tenant-boundary behavior. Confirm unauthorized clients cannot invoke lifecycle authority and that evidence is preserved across retries/resume.

## P2-H — Performance

Run production-like concurrency and large imports. Capture P95 read/write/preview, error rate, queue latency, memory/CPU where available, and degradation behavior. Compare against the project's declared budgets rather than inventing new thresholds.

## P2-I — Operations / UX

Verify health visibility, actionable errors, recovery UX, RTL, mobile layout, PWA installation, slow-network behavior, offline behavior where supported, image loading, and session recovery. Record defects with exact route and reproduction steps.

## P2-J — Business Acceptance

An independent operator executes the core business journey end-to-end and signs the evidence bundle. Acceptance must cover authentication, product discovery, customer-specific pricing, import/reconciliation, reports, intelligence, evidence, and recovery expectations.

## Fail-closed rules

- No evidence = not certified.
- Wrong SHA = not certified.
- Wrong environment/deployment = not certified.
- Source-level contract cannot substitute for live drill evidence.
- Historical PASS cannot be promoted to a new SHA.
- Production alias must not be changed solely to satisfy a gate.
