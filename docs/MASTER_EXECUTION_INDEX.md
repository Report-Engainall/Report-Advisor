# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-09

> Authoritative execution manifest. This document never promotes historical evidence across an exact-HEAD boundary. Pair every evidence batch with the exact Git `HEAD` and exact environment/commit used.

### CURRENT PROJECT STATE
- Current code/test candidate: `05be7614a2308d0ab4bd27e2ecf89aefbf771950`.
- Targeted repair wave: dashboard canonical aggregation guard, OCR executable test isolation, scenario truth guard source normalization, certification ancestry handling for PR merge commits, and durable worker SECURITY DEFINER RPC exposure hardening.
- Exact-head GitHub Actions verification is required; this candidate is **NOT CERTIFIED** until required workflows are green.
- Frozen release candidates remain untouched: protected candidate `14cc7cefc0fad622436b4845a0e4b46a8888e8a9`, exact RC reference `d846821b8d969aaa384ab85487a0dcf264a65aca`.

### IMPLEMENTED / GATED / INTEGRATED
- Restored `RecommendationsPage` and `ForecastsPage` exports required by the intelligence route and corrected `App.tsx` to import them from `IntelligencePages`.
- UI route completeness checker normalizes extensionless lazy imports to `.tsx` before orphan detection.
- OCR confidence workflow installs FastAPI, Pillow, and python-multipart required by the executable OCR test.
- OCR runtime test now keeps its fake PaddleOCR module active through the runtime assertions instead of removing the dependency before `parse_with_ocr()` executes.
- Dashboard adversarial regression now verifies the canonical dashboard snapshot adapter, including `get_dashboard_snapshot`, `topCustomers`, and `topProducts`, instead of asserting the retired top-entities RPC.
- Scenario financial-truth guard test now normalizes source whitespace so multiline JSX remains covered without weakening the required semantic tokens.
- Certification boundary CLI now validates the PR head parent for merge commits while retaining exact candidate ancestry and governance-only restrictions.
- Durable report-execution SECURITY DEFINER RPCs are explicitly restricted to the trusted `service_role`; anon/authenticated execution is revoked by a forward-only migration, and the Phase 2 surface checker recognizes this explicit server-only boundary.
- Master Index is bound to the exact code candidate entering this certification sweep.

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
- Worker RPCs are intentionally server-side primitives; client-side authenticated execution must remain unavailable.

### COMMIT / CI / TEST / UPDATE
- Exact code candidate: `05be7614a2308d0ab4bd27e2ecf89aefbf771950`.
- `2ee86be6c4ce32dce2d81faedfb581371039bb33` corrected the stale dashboard adversarial assertion against retired `get_dashboard_top_entities`.
- `7915db8642132c4c519155be7104dbc1dfba0c28` corrected certification ancestry validation for PR merge commits by checking the PR-head parent rather than incorrectly requiring the candidate to be an ancestor of the base parent.
- `9bff6bc7b85fac41ee0eae1c8cfc13318399c0d1` added the forward-only service-role execution boundary for durable worker SECURITY DEFINER RPCs.
- `05be7614a2308d0ab4bd27e2ecf89aefbf771950` updated the Phase 2 SECURITY DEFINER surface checker to require and recognize that explicit service-role-only worker boundary.
- Additional test repairs in the same candidate wave keep OCR and scenario guards executable without weakening product/security assertions.
- This index-only successor records the new exact code candidate for the certification boundary; it does not alter certification logic or promote runtime evidence.

## BOUNDARY / GOVERNANCE
- No rebuild from scratch.
- No historical migration rewrite.
- No Production alias mutation or rollback action as part of source reconciliation.
- No Staging data fixture is treated as certification unless an actual lifecycle is observed.
- No HTTP 200, UI shell, CI-created run, fixture assertion, simulated JWT, historical deployment, or old SHA can certify the current candidate.
- Browser E2E must use real Chromium, real Supabase authentication, and browser-held sessions; service-role or mocked sessions are prohibited for browser certification.

## PRODUCT / SECURITY BASELINE
- Tenant isolation, `current_company_id()`, RLS, and fail-closed `TENANT_CONTEXT_MISMATCH` behavior remain protected boundaries.
- Canonical import remains the supported business mutation path.
- Import normalization mirrors the database normalization contract.
- Import lifecycle counters are persisted and validated against the live job contract.
- Dashboard top-entity consumption uses the canonical dashboard snapshot rather than a nonexistent RPC.
- Durable worker RPC execution is server-side only and is not exposed to anon/authenticated clients.

## DEEP AUDIT STATUS

### P0 — AUTHENTICATED E2E / TENANT A-B
- Dedicated authenticated Tenant A/B coverage exists in the repository.
- Current exact-head browser/device certification remains NOT PROVEN.

### P1 — DOCUMENT / OCR / IMPORT
- OCR confidence handling is fail-closed and executable tests exist; current runtime-test dependency isolation repair is integrated but requires exact-head execution.
- Import RPC tenant context, canonical business keys, required-field validation, and job lifecycle counter invariants are covered by repository contracts.
- Real authenticated upload → preview → commit → DB read-back → UI read-back → Tenant B denial remains NOT PROVEN on the current candidate.

### P1 — WORKER / QUEUE / WATCHED FOLDER
- Contracts exist for tenant binding, lease fencing, retry/dead-letter and watched-folder lifecycle.
- Durable worker SECURITY DEFINER RPCs are now explicitly service-role-only at the database privilege boundary.
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
