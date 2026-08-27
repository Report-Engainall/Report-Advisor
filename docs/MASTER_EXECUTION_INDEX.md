# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Repository: `Report-Engainall/Report-Advisor`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Current execution state
- Baseline deep-closure HEAD: `c7b21db4d68e396fa6ceefe3f6fdc15b1a8b8d4c`.
- Forecast regression contract fix: `728b344f57c304ab5e66744db40624d3d4a2c8a3`.
- PR: `#64`, branch `fix/forecast-regression-canonical`, currently Draft/Open.
- Exact-head production-chain guard for `728b344f...`: Run `33104660444`, Job `98631162091`, conclusion `success`.
- This guard PASS is valid only for the named SHA and is not equivalent to Full CI, Runtime, LIVE, or Production Certification.

## Batch — Forecast canonical regression contract closure
Finding: `dashboard-canonical-regression` asserted a retired Forecast table-scan contract (`MAX_FORECAST_ROWS`/range/count) while production code had migrated to canonical `get_forecast_snapshot`.

Root cause: regression contract drift after canonical Forecast migration; the test was guarding the retired implementation rather than the current business-truth boundary.

Fix:
- `scripts/check-dashboard-canonical.mjs` now asserts the canonical `get_forecast_snapshot` path and bounded canonical limit behavior.
- Production `src/lib/queries.ts` remains RPC-backed and fail-closed; no client-side table-scan fallback was introduced.
- Commit: `728b344f57c304ab5e66744db40624d3d4a2c8a3`.

Consumer state: Forecast consumers continue through the canonical query boundary; no legacy Forecast consumer was intentionally restored.

Regression: dashboard canonical regression updated to match the canonical RPC contract.

CI evidence: Exact-head `production-chain-guard` PASS on `728b344f...`, Run `33104660444`, Job `98631162091`. Full CI/behavioral regression evidence for this SHA is not claimed from this guard alone.

Certification state: `IMPLEMENTED → REGRESSION → EXACT-HEAD GUARD VERIFIED`; `GATED FULL CI`, `CONSUMER VERIFIED`, `RUNTIME VERIFIED`, `LIVE VERIFIED`, and `PRODUCTION CERTIFIED` remain unclaimed.

## Batch — TypeScript consumer contract repair
Finding: `InventoryPageCanonical.tsx` imported missing `@/lib/report-truth` and also referenced obsolete row field names.

Root cause: consumer migration landed against a stale/nonexistent module contract.

Fix: migrated the consumer to the existing canonical dashboard truth boundary and corrected `lowStock`, `outOfStock`, `unknownRows`, and canonical `row.value` usage; removed unused `exportRows`.

Commit: `30e2ac746adf9aac20e585d501890c9f02e0223f`.

Regression/CI: Typecheck, lint and build were subsequently observed passing in the following merge-ref quality run; those historical results are not promoted as Exact-Head certification for later SHAs.

Status: `IMPLEMENTED → REGRESSION`; Exact-head certification is governed by the current SHA.

## Prior deep-closure families
### P0 — Data Quality
Browser business-quality aggregation was migrated to `get_data_quality_snapshot()` with tenant authority from `current_company_id()`. The legacy bridge and page were removed after repository consumer proof. Regression guard checks canonical RPC consumption and legacy absence.

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF IN REPOSITORY → REGRESSION`; exact-head database/runtime pending.

### P1 — Dashboard Intelligence tenant boundary
Direct browser reads of recommendations/alerts were replaced by `get_dashboard_intelligence(p_limit)`, deriving tenant authority from `current_company_id()`, using fixed search_path, bounded output and authenticated-only execution.

Regression: `src/lib/dashboard-canonical.intelligence.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/live runtime pending.

### P1 — Export tenant authority hardening
Inventory export now fails closed on tenant mismatch and derives data from `current_company_id()`. Export RPCs received fixed search_path, anonymous revocation and authenticated execution grants.

Regression: `src/lib/export-tenant-authority.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; live A/B export isolation pending.

### DB-only legacy candidate — get_sales_secondary_metrics
`supabase/migrations/20260826003000_sales_secondary_canonical_analytics.sql` still defines it. Repository consumer search found no source consumer, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## Parallel remaining fronts
### Front A — Canonical Data Truth
- `queries-compat.ts` full function/consumer graph.
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.

### Front B — Consumer + Legacy Closure
- zero-consumer proof for compatibility functions.
- duplicate business engines.
- DB-only legacy candidates with external-consumer risk.

### Front C — BI / Decision / Export
- cross-surface equivalence.
- Forecast/Demand Velocity/Inventory Intelligence.
- export metric/date/status/as-of/filter equivalence.

### Front D — Security / Tenant
- RPC grants/search_path/RLS.
- Storage/Realtime/AI-vector.
- workers, notifications and generated files.

### Front E — Performance
- unbounded reads.
- query plans/indexes.
- N+1 and payload bounds.

### Front F — Reliability
- worker/watcher/queue/retry/idempotency/DLQ/recovery.
- backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
- authenticated E2E.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists.
- GATED: only after full exact-head CI evidence.
- CONSUMER VERIFIED: only where real consumer evidence is explicit.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue independent fronts without waiting for CI: `queries-compat.ts` consumer graph, cross-surface BI/Decision/Export truth, NULL semantics, tenant/security sibling discovery, and Full CI evidence for PR #64. Exact-head CI is a certification barrier, not a reason to pause independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
