# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-09

> Authoritative execution manifest. This document never promotes historical evidence across an exact-HEAD boundary. Pair every evidence batch with the exact Git `HEAD` and exact environment/commit used.

### CURRENT PROJECT STATE
- Current code/test candidate: `2ee86be6c4ce32dce2d81faedfb581371039bb33`.
- Targeted repair: dashboard adversarial regression now guards the canonical `get_dashboard_snapshot` contract and no longer requires the retired `get_dashboard_top_entities` RPC.
- Exact-head GitHub Actions verification is required; this candidate is **NOT CERTIFIED** until required workflows are green.
- Frozen release candidates remain untouched: protected candidate `14cc7cefc0fad622436b4845a0e4b46a8888e8a9`, exact RC reference `d846821b8d969aaa384ab85487a0dcf264a65aca`.

### IMPLEMENTED / GATED / INTEGRATED
- Restored `RecommendationsPage` and `ForecastsPage` exports required by the intelligence route and corrected `App.tsx` to import them from `IntelligencePages`.
- UI route completeness checker normalizes extensionless lazy imports to `.tsx` before orphan detection.
- OCR confidence workflow installs FastAPI, Pillow, and python-multipart required by the executable OCR test.
- Dashboard adversarial regression now verifies the canonical dashboard snapshot adapter, including `get_dashboard_snapshot`, `topCustomers`, and `topProducts`, instead of asserting the retired top-entities RPC.
- Master Index is bound to the exact code candidate entering this certification sweep.
- Certification boundary checker remains unchanged and fail-closed.

### RUNTIME / PRODUCTION EVIDENCE
- Current exact-head authenticated browser A/B tenant isolation: NOT PROVEN.
- Current exact-head production runtime: NOT PROVEN.
- Backup/restore and rollback drill: NOT PROVEN.
- Real Arabic document end-to-end Golden Corpus runtime: NOT PROVEN.
- CI green will certify repository contracts only; it will not manufacture missing operational evidence.

### REMAINING / BLOCKERS
- Complete exact-head CI matrix and repair any real executed failures.
- Maintain exact candidate binding in this index after every code-changing repair.
- LIVE runtime certification remains a separate operational gate after CI closure.

### LIVE REQUIRED
- Real Chromium authenticated Tenant A/B E2E on the exact release candidate.
- Production runtime evidence and release smoke.
- Backup/restore integrity and isolated restore verification.
- Measured recovery/performance evidence where release policy requires it.

### RISKS
- Queued/in-progress workflows are not PASS.
- Historical evidence cannot be promoted to the current candidate.
- Tenant/security fail-closed behavior must not be weakened to satisfy CI.

### COMMIT / CI / TEST / UPDATE
- Exact code candidate: `2ee86be6c4ce32dce2d81faedfb581371039bb33`.
- Predecessor `519439fd76016eb39cdddbc815c472741ad5341a` exposed a real stale test assertion: `dashboard-truth-adversarial-regression.mjs` required `get_dashboard_top_entities` in the adapter even though the canonical adapter now calls `get_dashboard_snapshot` and reads `topCustomers/topProducts`.
- Corrective code commit `2ee86be6c4ce32dce2d81faedfb581371039bb33` updates only that adversarial guard to assert the current canonical contract and explicitly reject the retired RPC in the adapter.
- This index-only successor records the new exact code candidate for the certification boundary; it does not alter certification logic or promote runtime evidence.

## BOUNDARY / GOVERNANCE
- No rebuild from scratch.
- No historical migration rewrite.
- No Production alias mutation or rollback action as part of source reconciliation.
- No Staging data fixture is treated as certification unless an actual lifecycle is observed.
- No HTTP 200, UI shell, CI-created run, fixture assertion, simulated JWT, historical deployment, or old SHA can certify the current candidate.
- Browser E2E must use real Chromium, real Supabase authentication, and browser-held sessions; service-role or mocked sessions are prohibited.

## PRODUCT / SECURITY BASELINE
- Tenant isolation, `current_company_id()`, RLS, and fail-closed `TENANT_CONTEXT_MISMATCH` behavior remain protected boundaries.
- Canonical import remains the supported business mutation path.
- Import normalization mirrors the database normalization contract.
- Import lifecycle counters are persisted and validated against the live job contract.
- Dashboard top-entity consumption uses the canonical dashboard snapshot rather than a nonexistent RPC.

## DEEP AUDIT STATUS

### P0 — AUTHENTICATED E2E / TENANT A-B
- Dedicated authenticated Tenant A/B coverage exists in the repository.
- Current exact-head browser/device certification remains NOT PROVEN.

### P1 — DOCUMENT / OCR / IMPORT
- OCR confidence handling is fail-closed and executable tests exist; current workflow dependency repair is integrated but requires exact-head execution.
- Import RPC tenant context, canonical business keys, required-field validation, and job lifecycle counter invariants are covered by repository contracts.
- Real authenticated upload → preview → commit → DB read-back → UI read-back → Tenant B denial remains NOT PROVEN on the current candidate.

### P1 — WORKER / QUEUE / WATCHED FOLDER
- Contracts exist for tenant binding, lease fencing, retry/dead-letter and watched-folder lifecycle.
- Actual crash/recovery and watched-folder operational drills remain NOT PROVEN.

### P1 — DECISION / EVIDENCE / OUTCOME
- Tenant/provenance/state boundaries are contractually guarded.
- Current authenticated browser lifecycle evidence remains NOT PROVEN.

### P2 — UI / PERFORMANCE / OBSERVABILITY / RECOVERY
- UI route contract passed on predecessor candidates; current exact-head revalidation is required.
- Performance, observability, backup/restore, rollback and production smoke remain operational gates and are not promoted from source-only evidence.

## CI EXECUTION POLICY
- GitHub Actions is the execution authority for repository CI.
- A queued or in-progress job is not PASS.
- A failed job is a real finding until its logs establish otherwise.
- No workflow bypass, skip, mocked runtime, or weakened security contract may be used to manufacture green status.
- Final certification requires exact-HEAD evidence and the Master Index boundary to agree.
