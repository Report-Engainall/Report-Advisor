# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution manifest. Because embedding this file's own commit SHA would make the SHA self-invalidating, the exact current candidate is always the Git `HEAD` of the relevant checkout/ref. Pair this manifest with `git rev-parse HEAD` for every evidence batch.

### CURRENT REPAIR CANDIDATE
- Repair branch: `repair/currency-analytics-truth-46156969`.
- Base boundary: `46156969f506d7fb6c3c75fde419c6de76f6e14d`.
- Current exact candidate after certification-consumer anti-forgery hardening: `ba8fea36925fbac60a053b9067fbae2976444d2c`.
- PR #316: OPEN / DRAFT / NOT MERGED.
- Certification: NOT CERTIFIED.
- Historical evidence is never promoted to the subsequent exact HEAD.

### BOUNDARY / GOVERNANCE
- Main release boundary remains separate from this repair candidate until review/merge.
- Historical evidence is valid only for its recorded SHA.
- No deployment, test, DB result, or prior RC is reused across a changed exact head.
- Browser E2E uses real Chromium, real Supabase authentication when credentials exist, and browser-held access tokens; service-role and mocked sessions are prohibited.
- The browser workflow uses scoped path triggers and `workflow_dispatch`; broad push triggers are prohibited by the CI topology contract.
- PASS requires correct behavior + correct data + correct security + persistence + evidence + exact HEAD.
- QUEUED/PENDING/RUNNING is never PASS.

### CERTIFICATION ANTI-FORGERY WAVE
- `scripts/certification-consumer-validation.mjs` now enforces the mandatory evidence contract as executable semantic input rather than a string/status declaration.
- Mandatory contracts are exactly: `tenant`, `backup`, `rollback`, `artifact`, `security`.
- Each contract must be an object with `status=validated`, exact source SHA, manifest ID, certification run ID, artifact fingerprint, evidence reference, evidence SHA-256 fingerprint, proof type, and non-stale verification timestamp.
- Evidence references are constrained beneath the consumer evidence root and their actual bytes are re-hashed before acceptance.
- `scripts/check-live-production-evidence-boundary.mjs` now invokes the executable mandatory-evidence validator before emitting consumption proof.
- `scripts/certification-consumer-antiforgery.test.mjs` provides an executable adversarial suite covering missing, empty, null, wrong-type, stale, wrong-SHA, wrong-manifest, wrong-run, wrong-artifact-fingerprint, wrong-evidence-fingerprint, unknown/duplicate contract, and tampered-artifact mutations.
- Release certification workflow now runs the anti-forgery suite before evidence generation.
- These changes are structural hardening only until fresh exact-head CI executes them; they do not create runtime tenant/backup/rollback/artifact/security evidence.
- Certification consumer remains `NOT PROVEN` until fresh exact-head CI proves the suite and the real mandatory runtime evidence contracts are independently produced and consumed.

### CURRENT E2E STATUS
| Area | Status | Required evidence |
|---|---|---|
| Real Chromium | BUILT / current-head CI pending | exact-head CI |
| Authenticated browser login | BLOCKED / NOT PROVEN | current-head run with real credentials |
| Tenant A | NOT PROVEN | real browser session + `current_company_id()` |
| Tenant B | NOT PROVEN | real browser session + B credential |
| A/B isolation | PARTIAL / NOT PROVEN IN BROWSER | browser cross-tenant read/mutate attempts |
| 29 route discovery | NOT PROVEN on current head | browser run |
| CRUD persistence | NOT PROVEN on current head | browser action + DB truth |
| Import | NOT PROVEN on current head | upload/preview/commit + DB truth |
| OCR/document | NOT PROVEN | real corpus runtime |
| Evidence/decision | NOT PROVEN | authenticated browser flow |
| Reporting/export | PARTIAL | live export RPC grants repaired; browser output unproven |
| Realtime/workers | NOT PROVEN | runtime lifecycle evidence |
| Recovery | NOT PROVEN | backup/restore/rollback drill |
| Negative security | PARTIAL | DB RLS adversarial evidence; browser A/B pending |

### CERTIFICATION RULE
No HTTP 200, UI success message, fixture PASS, simulated DB JWT, historical deployment, queued workflow, or old SHA may certify the current candidate. Final certification requires exact-head evidence for every required product surface and zero unresolved local actionable debt.

### CURRENT DISPOSITION
| Domain | Status |
|---|---|
| Certification consumer semantic validation | NOT PROVEN — fresh CI required |
| Certification anti-forgery test-of-test | NOT PROVEN — fresh CI required |
| Canonical certification path | INTERNAL GAP — consumer now consumes executable evidence validation, but canonical producer/evaluator unification remains to be proven |
| Real mandatory runtime evidence | NOT PROVEN |
| Authenticated Browser E2E | NOT PROVEN / BLOCKED — EXTERNAL credentials |
| Golden binary corpus | NOT PROVEN where real artifacts are absent |
| Production runtime | BLOCKED — EXTERNAL |
| Backup / Restore | BLOCKED — EXTERNAL |
| Rollback | BLOCKED — EXTERNAL |
| Production Certification | NOT CERTIFIED |
