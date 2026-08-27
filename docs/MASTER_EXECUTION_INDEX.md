# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Previous requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9` — its quality failure was a real TypeScript/topology failure and is historical only.
- Active branch advanced through the successor closure wave; current exact HEAD after this batch: `0ccfaa764f4be85dea6eeb1151196d9707764a3a`.
- Fresh quality run for this branch is triggered by the push and is the only valid CI evidence for the new HEAD. No PASS is claimed until its exact SHA completes.

## F35 — Financial semantic fail-closed sibling family
### FIND
A deeper sibling pattern was found after the nullable CCC fix: several server-side report contracts could return `status='INSUFFICIENT_DATA'` while still returning apparently valid numeric business totals derived from only the valid subset. That creates a new form of `missing evidence → partial truth presented as complete truth`.

### ROOT CAUSE
Quality status was calculated independently from aggregate projection. The projection layer did not make the financial values conditional on the final truth status, so incomplete rows could be excluded from the calculation while the resulting partial numbers were still surfaced.

### FIX
Added `supabase/migrations/20260827131500_financial_truth_fail_closed.sql`:
- `report_profitability_truth`: when evidence is incomplete, zero-row, or multi-currency, category and total revenue/cost/profit/margin/quantity values become `NULL`; quality counters remain explicit.
- `report_dashboard_truth`: financial/receivable/payable/inventory KPI values become `NULL` whenever the aggregate quality state is insufficient.
- `report_inventory_snapshot`: inventory valuation becomes `NULL` whenever any inventory row lacks quantity or unit cost; row count/quality counters remain available.
- Existing tenant authority and cancelled/void exclusion are preserved.

### REGRESSION
Updated `scripts/check-profitability-truth-contract.mjs` to require the fail-closed projection markers and the canonical service/consumer wiring.
Existing BI regression remains responsible for the direct nullable CCC contract.

### CONSUMER FAMILY
- `ReportsPage` profitability consumer → canonical `fetchProfitabilityTruth()`.
- Dashboard KPI consumer → canonical `fetchDashboardKPIs()` → `report_dashboard_truth`.
- Inventory report consumer → canonical `fetchInventoryReportSnapshot()` → `report_inventory_snapshot`.
- Remaining BI/Decision/Analytics/Export consumers still require cross-surface equivalence proof.

### STATUS
**IMPLEMENTED / REGRESSION-ENFORCED / CI PENDING.** Not Consumer-Certified or Runtime-Certified until exact-head CI and downstream equivalence evidence exist.

## Receivables
**IMPLEMENTED + REGRESSION-ENFORCED + ROUTE-CONSUMER-MIGRATED; EXACT-HEAD CI PENDING.**
- Server-side snapshot truth.
- Session-derived tenant authority.
- Cancelled/canceled/void exclusion.
- `UNDATED` and `INCOMPLETE` retained explicitly.
- Metrics independent of display pagination.
- Remaining: full export equivalence, large-dataset runtime proof, and cross-surface equivalence.

## Profitability
**PARTIAL / FAIL-CLOSED IMPLEMENTATION + REGRESSION-ENFORCED; EXACT-HEAD CI PENDING.**
- Missing cost/evidence no longer becomes financial zero.
- Incomplete or multi-currency canonical report now returns `NULL` business totals with `INSUFFICIENT_DATA` rather than partial-looking totals.
- Remaining full financial contract: revenue/cost/quantity/discount/returns/cancelled/void/date/tenant/currency/rounding and source-record equivalence across every consumer.

## Tenant / Security
- Browser authority: `resolveCurrentCompanyId()`.
- Inventory intelligence and alternative-group sensitive RPCs no longer accept caller-supplied tenant authority in the new contracts.
- Import wrapper validates session tenant against the execution boundary.
- Storage, Realtime, AI/vector, export/download, worker and cache indirect paths remain open for adversarial/runtime proof.

## Worker / Reliability
- Deterministic stage idempotency key and recovery boundary exist.
- Automatic retry is blocked after side-effect/recovery boundary; manual reconciliation is explicit.
- Folder job ledger rejects duplicate concurrent starts and terminal resurrection.
- **LIVE REQUIRED:** actual crash/restart, stale lease, duplicate worker, DLQ and replay drill.

## Cross-Surface Equivalence
**OPEN.** Canonical sources now exist for major dashboard/inventory/receivables/profitability surfaces, but the system is not yet certified as:
`BI = Decision = Analytics = Export` under identical tenant/date/status/NULL/currency/source-record semantics.

## Export Truth
**PARTIAL.** Current-page exports are explicitly named/scoped. Full and filtered-full exports still require a complete consumer-family scan and pagination→export regression proof.

## Semantic NULL / UNKNOWN sweep
**ACTIVE.** Confirmed patterns include:
- missing cost → zero (fixed in CCC producers);
- missing receivables financial fields → dropped rows (fixed);
- incomplete profitability/dashboard/inventory evidence → partial numeric presentation (fixed in F35);
- outcome missing impact/accuracy → zero (fixed previously).
Remaining repository-wide sibling scan is open.

## Storage / Realtime / AI / Vector
**STATIC GATES ONLY / LIVE REQUIRED.** No runtime cross-tenant proof is claimed. Required evidence covers object paths/signed URLs, realtime channels/payloads/subscriptions, vector metadata/retrieval/cache/deletion isolation.

## Runtime / LIVE
**NO RUNTIME EVIDENCE for F35.** Required drills remain authenticated browser E2E, >page-size Inventory/Receivables datasets, tenant A/B adversarial isolation, worker crash/recovery, storage/realtime/vector isolation, real document corpus and production telemetry.

## Production Certification
**NOT PRODUCTION CERTIFIED.** Static implementation, regressions and CI do not constitute production certification.

## Exact-head CI rule
Only the CI result whose `head_sha` exactly equals the current Code HEAD may promote a capability to `CI-GATED`. Historical PASSes remain historical.

## Next active fronts
1. Exact-head CI for `0ccfaa764f4be85dea6eeb1151196d9707764a3a`.
2. Continue tenant-sensitive RPC sibling sweep.
3. Complete full Export Truth consumer-family scan.
4. Complete BI ↔ Decision ↔ Analytics ↔ Export equivalence contracts.
5. Continue repository-wide NULL/UNKNOWN/MISSING/EMPTY/ZERO semantic sweep.
6. Complete worker failure-state/recovery sibling sweep and prepare LIVE crash drill.
7. Storage/Realtime/AI/vector adversarial isolation contracts.
8. Runtime evidence harnesses for every CI-stable capability.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current wave contains real root-cause fixes and regressions, but exact-head CI is pending and runtime/live/production evidence remains outstanding.
