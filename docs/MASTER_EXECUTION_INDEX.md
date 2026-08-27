# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-28  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `parallel/batch-48-data-truth`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Main contains the integrated deep-closure wave through commit `c7b21db4d68e396fa6ceefe3f6fdc15b1a8b8d4c` before this branch's work.
- Current batch branch contains Batch 48 data-truth hardening through the indexed HEAD recorded below.
- Exact-head CI must be evaluated against the current SHA; no historical run is promoted.
- Runtime, LIVE, and production certification remain unclaimed.

## Batch — invoice page-read tenant/security closure
Finding: `fetchSalesInvoices()` and `fetchPurchaseInvoices()` were bounded paginated display reads but did not explicitly bind their query predicates to the authoritative tenant context, unlike sibling reads.

Classification: `SECURITY/TENANT ISSUE + PERFORMANCE/DETERMINISM`

Root cause: invoice list reads relied on downstream RLS alone while the shared query boundary lacked an explicit fail-closed tenant context and deterministic tie-break ordering.

Fix:
- `src/lib/queries.ts` requires `resolveCurrentCompanyId()` before either invoice read.
- Both queries explicitly constrain `company_id` to the resolved tenant.
- Both retain hard page-size bounds (1..500).
- Both use deterministic `invoice_date DESC, id ASC` ordering before range pagination.

Regression: `scripts/check-tenant-adversarial-contract.mjs` covers tenant context, explicit company predicates and bounded deterministic pagination.

Status: `IMPLEMENTED → REGRESSION GUARD`; exact-head CI/runtime/live pending.

## P0 — Data Quality
Browser business-quality aggregation was migrated to `get_data_quality_snapshot()` with tenant authority from `current_company_id()`. Legacy bridge/page removal was preceded by repository consumer proof.

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF IN REPOSITORY → REGRESSION`; exact-head CI/database/runtime pending.

## P1 — Dashboard Intelligence tenant boundary
Direct browser reads of recommendations/alerts were replaced by `get_dashboard_intelligence(p_limit)`, deriving tenant authority from `current_company_id()`, with fixed search_path, bounded output and authenticated-only execution.

Regression: `src/lib/dashboard-canonical.intelligence.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/live runtime pending.

## P1 — Forecast read boundary
Direct `forecasts` table read was replaced by `get_forecast_snapshot(p_limit)`, tenant-authoritative, explicitly projected, bounded and deterministic.

Regression: `src/lib/queries.forecast.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime pending.

## P1 — Export tenant authority hardening
Finding: `get_inventory_export_rows(p_company_id, ...)` did not assert the caller-supplied company id matched server tenant authority.

Fix:
- Added `supabase/migrations/20260826080000_export_tenant_authority_hardening.sql`.
- Inventory export fails closed on `TENANT_CONTEXT_MISMATCH` and derives data from `current_company_id()`.
- Export RPCs have fixed `search_path`, anonymous execution revoked, and authenticated execution explicitly granted.

Regression: `src/lib/export-tenant-authority.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI and live A/B export isolation pending.

## DB-only legacy candidate — get_sales_secondary_metrics
`supabase/migrations/20260826003000_sales_secondary_canonical_analytics.sql` still defines it. Repository consumer search found no source consumer, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## Batch — queries-compat tenant/canonical boundary regression
Finding: `src/lib/queries-compat.ts` is intentionally retained as a compatibility boundary, but it still owns several direct tenant-scoped operations and canonical export adapters; these paths require a permanent guard against accidental reintroduction of browser business truth or caller-controlled tenant authority.

Root cause: compatibility modules are high-risk drift points because they preserve old import surfaces while newer canonical services evolve independently.

Fix:
- Added `scripts/check-queries-compat-boundary.mjs`.
- The regression requires all secondary analytics exports to delegate to canonical implementations.
- It rejects direct sales-table aggregation and calls to the legacy `get_sales_secondary_metrics` RPC.
- It requires authoritative `resolveCurrentCompanyId()` / `TENANT_REQUIRED` fail-closed semantics.
- It checks tenant-scoped alerts, recommendations and import-job paths retain the shared tenant guard.
- It checks export compatibility retains the bounded `p_max_rows: 10000` contract.

Consumer state: compatibility remains only where repository consumers require the old import surface; business truth remains owned by canonical `queries.ts`/RPC paths.

Legacy state: no destructive removal of `queries-compat.ts`; DB-only secondary analytics remains protected by external-consumer risk.

Regression execution: **NOT EXECUTED in this environment**. The repository was updated with the guard, but no local checkout/runtime was available to execute it here; this is explicitly not counted as PASS.

Exact-head CI: **PENDING / NOT OBSERVED for the post-index SHA**.

Status: `IMPLEMENTED → REGRESSION ADDED → CI PENDING`; not CLOSED.

## Batch 48 — ABC/XYZ Data Truth
Finding: the ABC/XYZ classifier accepted non-finite numeric inputs, allowing `NaN`/`Infinity` to contaminate classification and downstream evidence.

Root cause: the classifier had numeric business calculations but no explicit finite-input boundary before sorting, cumulative value calculation, or coefficient-of-variation calculation.

Canonical fix:
- `src/lib/free-toolbox/abc-xyz.ts` now rejects non-finite `annualValue` and non-finite demand values with `RangeError`.
- Existing negative annual-value normalization and cumulative classification semantics are retained.

Regression:
- `scripts/abc-xyz-runtime.test.ts` exercises normal classification and rejection of `NaN`, `Infinity`, `-Infinity`, and non-finite demand.
- `package.json` exposes `test:abc-xyz-runtime`.
- `scripts/check-abc-xyz-truth.mjs` requires both the implementation boundary and executable runtime regression wiring.

Consumer proof: **NOT YET VERIFIED**. Repository search did not establish a complete current-HEAD consumer graph; therefore no `CONSUMER VERIFIED` claim is made.

Legacy proof: **NOT CLOSED**. No consumer-free proof exists for deletion of any related compatibility path.

Current exact code HEAD before this index commit: `8754b36bddefa88ae2811871ad9607367718ba5c`.

Exact-head CI at that SHA: **NOT OBSERVED (`check_runs = 0`)**. No historical PASS is promoted.

Current batch state: `IMPLEMENTED → REGRESSION WIRED → GATE WIRED → CONSUMER VERIFICATION OPEN → EXACT-HEAD CI PENDING`.

LIVE required: real authenticated consumer execution, A/B tenant isolation where classification data is tenant-scoped, and real corpus evidence for downstream reports/exports if this classifier feeds production surfaces.

## Parallel remaining fronts
### Front A — Canonical Data Truth
- Full `queries-compat.ts` function/consumer graph.
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.
- ABC/XYZ consumer graph and cross-surface metric equivalence.

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
- TESTED/REGRESSION: repository behavioral/contract evidence exists; execution must be separately evidenced.
- GATED: **NO CLAIM** for current HEAD until exact-head CI evidence exists.
- CONSUMER VERIFIED: only where consumer evidence is explicit.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue independent fronts without waiting for CI: cross-surface BI/Decision/Export truth, NULL semantics, tenant/security sibling discovery, and reliability/performance contract closure. Exact-head CI is a certification barrier, not a reason to pause independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
