# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-09

> Authoritative execution manifest. This document never promotes historical evidence across an exact-HEAD boundary. Pair every evidence batch with the exact Git `HEAD` and exact environment/commit used.

### CURRENT PROJECT STATE
- Current code/test candidate: `2c3d7b10809c147696fe854533105828e10c71d5`.
- This candidate contains only targeted CI/product contract repairs: restored intelligence route page exports, UI route import normalization, and OCR workflow runtime dependencies.
- The candidate is undergoing exact-HEAD GitHub Actions verification. It is **NOT CERTIFIED** until the required workflows are green.
- Frozen release candidates remain untouched: protected candidate `14cc7cefc0fad622436b4845a0e4b46a8888e8a9`, exact RC reference `d846821b8d969aaa384ab85487a0dcf264a65aca`.

### IMPLEMENTED / GATED / INTEGRATED
- Implemented: `RecommendationsPage` and `ForecastsPage` exports required by the intelligence route.
- Implemented: UI route completeness checker now normalizes extensionless lazy imports to `.tsx` before orphan detection.
- Implemented: OCR confidence workflow installs the runtime dependencies actually imported by its executable test (`FastAPI` and `Pillow`).
- Integrated: all three repairs are present in the exact candidate above and are being evaluated by the repository CI matrix.
- Gated: certification-boundary integrity requires this exact candidate to be recorded here and rejects non-governance drift.

### RUNTIME / PRODUCTION EVIDENCE
- Current exact-head authenticated browser A/B tenant isolation: NOT PROVEN.
- Current exact-head production runtime: NOT PROVEN.
- Backup/restore and rollback drill: NOT PROVEN.
- Real Arabic document end-to-end Golden Corpus runtime: NOT PROVEN.
- These states are preserved intentionally; CI green does not manufacture missing operational evidence.

### REMAINING / BLOCKERS
- Complete the current exact-head CI matrix and repair any real failures found by executed jobs.
- Certification boundary must pass against the exact successor commit containing this index update.
- LIVE runtime certification remains a separate operational gate after CI closure.

### LIVE REQUIRED
- Real Chromium authenticated Tenant A/B E2E on the exact release candidate.
- Production runtime evidence and release smoke.
- Backup/restore integrity and isolated restore verification.
- Measured recovery/performance evidence where release policy requires it.

### RISKS
- CI infrastructure delays may leave jobs queued; queued is not PASS.
- Historical evidence cannot be promoted to the current candidate.
- Tenant/security fail-closed behavior must not be weakened to satisfy a test.

### COMMIT / CI / TEST / UPDATE
- Candidate entering this sweep: `2c3d7b10809c147696fe854533105828e10c71d5`.
- CI runs triggered for this candidate include Quality `34396384774`, OCR Confidence Contract `34396384730`, UI Route Completeness `34396384813`, and Final Certification Gate `34396384720`.
- UI Route Completeness has completed PASS on the candidate.
- OCR Confidence Contract was executing its real OCR runtime step at the last observation.
- Quality was still executing at the last observation.
- Final Certification Gate correctly rejected the candidate before this index update because the Master Index did not yet bind the exact candidate; this is a governance-boundary failure being corrected by this index-only successor commit.
- This update intentionally changes only the Master Index; it does not weaken the certification checker or promote runtime evidence.

## BOUNDARY / GOVERNANCE
- No rebuild from scratch.
- No historical migration rewrite.
- No Production alias mutation or rollback action as part of source reconciliation.
- No Staging data fixture is treated as certification unless an actual lifecycle is observed.
- No HTTP 200, UI shell, CI-created run, fixture assertion, simulated JWT, historical deployment, or old SHA can certify the current candidate.
- Browser E2E must use real Chromium, real Supabase authentication, and browser-held sessions; service-role or mocked sessions are prohibited for certification.

## PRODUCT / SECURITY BASELINE
- Staging Supabase project `fnqbvfuwbdpwvhcgzksl` remains the database verification environment.
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
- OCR confidence handling is fail-closed and covered by executable tests; current workflow dependency repair is under exact-head CI verification.
- Import RPC tenant context, canonical business keys, required-field validation, and job lifecycle counter invariants are covered by repository contracts.
- Real authenticated upload → preview → commit → DB read-back → UI read-back → Tenant B denial remains NOT PROVEN on the current candidate.

### P1 — WORKER / QUEUE / WATCHED FOLDER
- Contracts exist for tenant binding, lease fencing, retry/dead-letter and watched-folder lifecycle.
- Actual crash/recovery and watched-folder operational drills remain NOT PROVEN.

### P1 — DECISION / EVIDENCE / OUTCOME
- Tenant/provenance/state boundaries are contractually guarded.
- Current authenticated browser lifecycle evidence remains NOT PROVEN.

### P2 — UI / PERFORMANCE / OBSERVABILITY / RECOVERY
- UI route contract is green for the candidate in run `34396384813`.
- Performance, observability, backup/restore, rollback and production smoke remain operational gates and are not promoted from source-only evidence.

## CI EXECUTION POLICY
- GitHub Actions is the execution authority for repository CI.
- A queued or in-progress job is not PASS.
- A failed job is a real finding until its logs establish otherwise.
- No workflow bypass, skip, mocked runtime, or weakened security contract may be used to manufacture green status.
- Final certification requires exact-HEAD evidence and the Master Index boundary to agree.
