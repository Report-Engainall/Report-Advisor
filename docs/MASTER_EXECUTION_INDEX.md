# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + current PR #41 exact-head candidate

## Execution policy
- FIND → ROOT CAUSE → FIX → REGRESSION → CI → EXACT-HEAD PROOF → INDEX → NEXT FAILURE.
- No historical PASS promotion, scanner-only closure, skip/whitelist, fake runtime/LIVE evidence, or production certification without live evidence.
- UNKNOWN/NULL/MISSING/INSUFFICIENT_DATA never becomes ZERO unless zero is a proven business value.

## Current exact state
- Previous exact candidate: `63dd1b0990d5ad07b761c3a70da427e59c599974`.
- Current application/code HEAD: `0834e891e335594c8c16de49f61b64e18a7c40a1`.
- Branch: `wave-final-exact-ci-16`.
- PR: #41 — Exact CI — final integrated candidate with workflow fixes.
- PR base: `main` at `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Current exact-head CI: PENDING / NOT OBSERVABLE yet for `0834e891e335594c8c16de49f61b64e18a7c40a1`; no PASS is claimed.

## Wave — CI topology closure
### Finding
The exact-head quality run `32921433070` failed in `CI topology and canonical release wiring` because the topology checker classified `production-evidence-boundary.yml` as a second canonical main push workflow alongside `quality.yml`.

### Root cause
The checker treated every unrestricted `main` push workflow as a canonical quality workflow. That was too coarse for the deliberately separate production-evidence boundary, whose purpose is to execute production-boundary fail-closed checks on `main` without becoming the canonical quality gate.

### Fix
- `ce155390f42a6ea96b3e01b1395596d163b7170a`: production evidence boundary explicitly excluded from canonical-quality classification while preserving the one canonical `quality.yml` main push gate.
- `0834e891e335594c8c16de49f61b64e18a7c40a1`: regression hardened the topology contract to require exactly one production evidence boundary, an explicit `main` push trigger, and the direct production certification contract command.

### Regression
The regression is now encoded in `scripts/check-ci-execution-topology.mjs`; exact-head CI must execute it before downstream gates are considered valid.

### CI evidence
- Exact head before fix: `63dd1b0990d5ad07b761c3a70da427e59c599974`.
- Quality Run `32921433070`: FAIL at topology gate; all downstream gates were skipped, while tenant RLS/import, lint, build, performance, intelligence, document, report-truth, production-readiness and resilience steps that executed before/after the failing step were individually successful.
- New exact head: `0834e891e335594c8c16de49f61b64e18a7c40a1`.
- Fresh exact-head CI: PENDING / NOT OBSERVABLE at index update time.

## Latest real closure
- Secondary sales consumers: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Purchase summary and inventory valuation: server-side canonical aggregates; page pagination cannot define business totals.
- Sales/Purchase/Inventory/Receivables exports: canonical row sources, bounded/fail-closed export behavior, multi-page PDF: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Decision missing impact/accuracy semantics: nullable and fail-closed: IMPLEMENTED / REGRESSION.
- Outcome feedback: pure core, persisted identity aligned, explicit tenant scope, missing impact/accuracy preserved as unavailable: IMPLEMENTED / REGRESSION.
- File identity: actual SHA-256 via Web Crypto, no false FNV fallback, fail closed if unavailable, known-vector regression: IMPLEMENTED / REGRESSION.
- BI numeric hardening: invalid/non-finite/negative financial inputs fail closed; chronology validated: IMPLEMENTED / REGRESSION.
- Document intelligence semantic corpus: representative inputs, normalization, evidence provenance, confidence thresholds: IMPLEMENTED / REGRESSION. Real corpus accuracy remains LIVE REQUIRED.

## Failure → root cause → fix — current chain
1. Secondary consumer drift → canonical sales secondary RPC/adapters → fixed and regressed.
2. Purchase page-total drift → server-side purchase summary → fixed and regressed.
3. Inventory UNKNOWN→ZERO → nullable valuation + INSUFFICIENT_DATA → fixed and regressed.
4. Export page/PDF truncation → canonical export RPCs + bounded fail-closed export + multi-page PDF → fixed and regressed.
5. Decision missing impact/accuracy → nullable metrics and unknown gate → fixed and regressed.
6. Typecheck drift → explicit nullable/status typing and Promise-safe boundary → fixed and regressed.
7. Outcome regression browser/Supabase coupling → pure outcome core → fixed and regressed.
8. File-security regression Vite alias coupling → pure file-identity core → fixed and regressed.
9. Batch workflow concurrency contract → concurrency group includes workflow identity → fixed; exact Run `32921316509` PASS.
10. Quality document-resilience command contract → missing npm script → fixed in `c025259e5046e4e097312e697fe66e7c18234f57`.
11. Production boundary certification command contract → workflow used npm package command where the boundary contract requires direct certification script → fixed in `c025259e5046e4e097312e697fe66e7c18234f57`.
12. Production boundary trigger contract → missing `push` main trigger → fixed in `2caeed6cbb6e8447d7b717394fddaca11f7e635d`.
13. CI topology classification drift → production boundary incorrectly counted as canonical quality push → fixed in `ce155390f42a6ea96b3e01b1395596d163b7170a` and regression-hardened in `0834e891e335594c8c16de49f61b64e18a7c40a1`.

## Exact CI evidence
- Baseline verified: Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS.
- Integrated candidate `d3f4bd844cfdc565c05f86506a498e7a6a6981a0`: quality Run `32919443013` FAIL and production-chain Run `32919443019` FAIL; both exposed real workflow-contract issues.
- `63dd1b0990d5ad07b761c3a70da427e59c599974`: quality Run `32921433070` FAIL at topology classification.
- `0834e891e335594c8c16de49f61b64e18a7c40a1`: fresh exact-head CI PENDING / NOT OBSERVABLE; do not claim PASS until a run explicitly references this exact head/PR ancestry.

## Security / tenant
- Canonical browser tenant resolver: `resolveCurrentCompanyId()`.
- Canonical RPCs resolve server-side tenant via `current_company_id()` and reject mismatched caller company IDs.
- Global tenant RLS contract and import RPC tenant-context contract are CI-gated.
- Static closure is strong; Supabase A/B, Storage, Realtime, AI/vector, worker and notification runtime isolation remain LIVE REQUIRED.

## Data truth / cross-surface
- Canonical secondary dashboard metrics and purchase/inventory/export paths are migrated and regression-gated.
- Full Dashboard = Reports = Exports = Analytics = Decisions equivalence is not yet production-certified; remaining non-secondary metrics and real multi-surface runtime execution require further closure.
- Date/status/null/as-of semantics must remain canonical; no consumer may reconstruct business truth from visible page rows.

## Document intelligence
- Contract, semantic foundation, hardening, decision gate, security and operational pipeline are CI-gated.
- Golden corpus contains normalization/evidence/confidence expectations.
- Real PDF/OCR/XLSX/CSV corpus execution is LIVE REQUIRED.

## Import / worker / watcher
- Canonical import is tenant-bound, transactional per chunk, validates before write and enforces business-key safety.
- Remaining runtime proof: duplicate-worker race, stale lease, crash/resume, retry exhaustion, DLQ, replay and side-effect idempotency.
- Watched-folder contract is shared across platforms; Web/PWA is session-bound; persistent Windows/Android native watching and iOS capability proof are LIVE REQUIRED.

## Backup / restore
- Recovery/release contracts exist and are CI-gated.
- Real restore, checksum/integrity verification, rollback timing and measured RPO/RTO are LIVE REQUIRED.

## Observability
- Job/report/decision resilience contracts exist.
- End-to-end production trace user_action_id → request_id → job_id → import_id → evidence_id → report_id → decision_id → outcome_id → tenant_id still requires production telemetry evidence.

## Performance
- Quality Run `32921433070` passed the measured static performance budget before the topology failure stopped the normal sequential gate chain.
- No production latency/load/canary claim without live load evidence.

## Legacy
- `src/lib/queries.ts` remains compatibility legacy and consumers route through `queries-compat.ts`.
- Removal requires zero-consumer proof, regression and rollback safety; no destructive removal yet.

## Production certification status
- IMPLEMENTED: substantial deep closure.
- TESTED: extensive local/regression suite.
- GATED: canonical quality workflow and multiple security/resilience gates.
- INTEGRATED: PR #41 exact ancestry.
- CONSUMER VERIFIED: migrated secondary/export consumers.
- RUNTIME VERIFIED: static/local runtime contracts only; authenticated browser/live runtime not claimed.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED blockers
1. Supabase A/B tenant isolation across DB/Storage/Realtime/AI/vector/import/report/export/decision/worker/notification paths.
2. Authenticated browser E2E with real tenant data.
3. Real PDF/OCR/XLSX/CSV corpus execution and measured extraction quality.
4. Native watched-folder proof on Windows/Android and iOS capability proof.
5. Deployed worker crash/restart/duplicate/stale-lease/DLQ/resume drill.
6. Real backup restore + integrity + rollback + RPO/RTO evidence.
7. Production telemetry trace and PII-redaction verification.
8. Production load/canary/rollback evidence.
9. Browser/native Web Crypto availability matrix.

## Current commits
- `0834e891e335594c8c16de49f61b64e18a7c40a1` — current code + topology regression hardening.
- `ce155390f42a6ea96b3e01b1395596d163b7170a` — production boundary classification fix.
- `c025259e5046e4e097312e697fe66e7c18234f57` — restored document resilience package command and direct production certification command.
- `2caeed6cbb6e8447d7b717394fddaca11f7e635d` — restored production evidence boundary main trigger.

## Next autonomous fronts after exact CI closure
- Re-run full consumer/business-calculation inventory on the integrated ancestry.
- Close remaining export/decision/cross-surface semantic drift that is statically fixable.
- Continue tenant authority sibling sweep across Storage/Realtime/AI/vector/notifications/workers.
- Continue pagination/date/status/UNKNOWN sibling sweep.
- Continue legacy zero-consumer proof and safe removal.
- Continue document/import/worker/watcher/backup/observability hardening in parallel.

Production certification remains explicitly blocked until LIVE evidence exists.
