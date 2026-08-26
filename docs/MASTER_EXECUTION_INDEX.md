# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26

## Truth rules
- PASS is bound to an exact SHA + exact CI run/job. Historical PASS is never transferred.
- UNKNOWN / MISSING / INSUFFICIENT_DATA is never silently converted to business ZERO.
- Domain truth belongs to domain-level canonical implementations, not page-local calculations.
- RUNTIME/LIVE/PRODUCTION_CERTIFIED are separate from local implementation and CI proof.

## Execution identity
- Requested baseline: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
- Active PR: **#27 — Wave 07 — Truth Certification + Canonical/RPC Deep Verification**.
- Original execution branch: `execution-wave-07-truth-certification`.
- Closure work branch: `execution-wave-closure-export-decision`.
- Previous code/regression HEAD: `9ed5dea134bfd85e61470eed4f09b0eb1c4d71ea`.
- Current exact application/CI HEAD: `515361c68329fc51b382de7392a2cf114e31ee41`.
- Exact-head CI for `515361c...`: **IN PROGRESS** — Wave 09 run `32920541240`, job `98033126242`; no PASS is claimed yet. The Wave 09 behavioral regression step has completed successfully; Typecheck is still running.

## REAL CLOSURE EXECUTED

### 1. Inventory export truth — IMPLEMENTED
Root cause: inventory export reconstructed valuation in the page from `quantity * unit_cost`, creating duplicate business truth and risking UNKNOWN→ZERO drift.

Fix:
- `supabase/migrations/20260826140000_inventory_export_truth.sql` adds tenant-authoritative `get_inventory_export_truth(uuid)`.
- `src/lib/report-export-data.ts` consumes the canonical RPC and preserves nullable value/status.
- `src/pages/ReportsPage.tsx` renders inventory export from canonical rows; no page-local inventory export valuation remains.

### 2. CI gate integrity — IMPLEMENTED
Root cause: the Wave 07 branch had removed established quality gates from `.github/workflows/quality.yml`.

Fix:
- Restored import tenant-context/business-key, lint, build, performance, intelligence/production, analysis runtime, document runtime, report-truth, production-readiness and full-resilience gates.
- Kept Wave 08 and Wave 09 truth regressions in the canonical quality job.
- No skip, whitelist, checker weakening or expected-result manipulation.

### 3. Executive decision consumer migration — IMPLEMENTED
Root cause: `src/pages/ExecutiveCommandCenterPage.tsx` still called legacy `fetchDashboardKPIs()` and exposed a period selector that did not affect the all-time canonical query, creating a misleading date contract.

Fix:
- Migrated the command center to `fetchCanonicalDashboardKPIs()`.
- Removed the unused 7/30/90 period selector rather than pretending the canonical all-time metric was period-filtered.
- Added fail-closed handling: incomplete/null canonical metrics do not produce decision cards or fabricated status values.

### 4. Secondary canonical RPC contract gap — FIXED
Finding: `src/lib/canonical-secondary-data-truth.ts` called `get_sales_monthly_truth`, `get_sales_top_customers`, `get_sales_top_products`, and `get_sales_category_breakdown`, but those exact RPC names were not present in repository SQL. This was an implementation/runtime contract gap, not a scanner finding.

Root cause: adapter contract and SQL function naming diverged.

Fix:
- Added `supabase/migrations/20260826150000_secondary_consumer_domain_truth.sql` with tenant-authoritative server-side implementations for monthly trend, top customers, top products and category breakdown.
- Preserved nullable cost/profit semantics instead of converting missing cost to zero.
- Added status exclusion for cancelled/void sales.
- Added tenant/date/product/invoice indexes appropriate to these bounded aggregates.
- Added `supabase/migrations/20260826150500_secondary_consumer_rpc_compat.sql` exposing the exact public RPC names consumed by the adapter, with authenticated-only grants and server-side tenant assertion.

### 5. Behavioral regression — IMPLEMENTED
`execution-wave-09-cross-surface-closure.mjs` now asserts:
- inventory export uses canonical row values;
- canonical inventory export is tenant-authoritative;
- executive command center uses canonical KPI source;
- legacy `fetchDashboardKPIs` and obsolete period selector are absent from that consumer;
- existing secondary, RFM/ABC, aging, nullable and decision fail-closed invariants remain enforced;
- secondary canonical RPC implementation has server-side tenant authority;
- exact secondary adapter RPC names are implemented;
- cancelled/void records are excluded by secondary canonical sales aggregates.

The Wave 09 behavioral regression completed successfully on exact HEAD `515361c...` in run `32920541240`, job `98033126242`.

### 6. Quality integration — IMPLEMENTED
`.github/workflows/quality.yml` directly runs the Wave 09 regression and all restored downstream quality gates.

## Capability matrix
| Capability | Implemented | Tested | Regression | Gated | Consumer verified | Runtime | LIVE | Production |
|---|---|---|---|---|---|---|---|---|
| Inventory export canonical truth | YES | IN PROGRESS exact-head | YES | YES | YES (source proof) | NO | NO | NO |
| Export truth overall | YES | IN PROGRESS exact-head | YES | YES | YES (source proof) | NO | NO | NO |
| CI gate integrity | YES | IN PROGRESS exact-head | YES | YES | YES | NO | NO | NO |
| Executive decision consumer | YES | IN PROGRESS exact-head | YES | YES | YES (source proof) | NO | NO | NO |
| Secondary domain aggregates | YES | IN PROGRESS exact-head | YES | YES | YES (adapter/source proof) | NO | NO | NO |
| Dashboard/secondary canonical truth | YES | YES | YES | YES | YES | NO | NO | NO |
| RFM/ABC domain truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Aging as-of truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Decision fail-closed truth | YES | YES | YES | YES | YES (code path) | PARTIAL | NO | NO |
| Tenant/RLS boundary | Existing + hardened | YES | YES | YES | PARTIAL | PARTIAL | REQUIRED | NO |
| Cross-surface runtime equivalence | PARTIAL | YES (static) | YES (static) | YES | PARTIAL | REQUIRED | REQUIRED | NO |

## Legacy closure
- Secondary legacy wrappers remain where compatibility is still required.
- Removal rule: SEARCH → MIGRATE → REGRESSION → ZERO CONSUMERS → REMOVE.
- Executive command center has zero consumer dependency on `fetchDashboardKPIs` after this migration.
- No destructive deletion was performed without dependency proof.

## Exact-head CI truth
- Current HEAD `515361c68329fc51b382de7392a2cf114e31ee41`: **IN PROGRESS**.
- Exact Wave 09 run: `32920541240`; exact job: `98033126242`.
- Wave 09 behavioral regression step: **SUCCESS**.
- Typecheck: **IN PROGRESS** at last observation.
- Previous PASS evidence is not transferred.
- The final certification state must use the eventual exact SHA/run/job after all index updates and fixes.

## LIVE REQUIRED
1. Authenticated Dashboard → Reports → Exports → Decisions equivalence against real tenant data.
2. Supabase A/B DB/Storage/Realtime/AI-vector isolation.
3. Deployed worker crash/restart/stale lease/DLQ/resume and duplicate-side-effect drill.
4. Real backup restore/migration replay/rollback/RPO/RTO.
5. Native Windows/Android/iOS watcher proof.
6. Real PDF/OCR/XLSX/CSV/corrupt/ambiguous corpus accuracy.
7. Production telemetry trace with tenant context and PII redaction.
8. Production-scale load/canary/rollback.

## Remaining work — NOW
- Complete exact-head CI for `515361c...`; if it fails, fix the actual failure and move to the new exact SHA.
- Continue sibling sweep for remaining business calculations and export/decision consumers.
- Continue date/status equivalence for metrics not yet covered by explicit domain contracts.
- Complete Decision → Evidence → Recommendation → Decision → Outcome → Feedback runtime provenance.
- Remove legacy paths only after zero-consumer proof.
- After the implementation head stabilizes, make one final Master Index commit and obtain CI evidence for that final index SHA; never claim PASS on an earlier SHA.

## Completion truth
**NOT CERTIFIED.** Real export, executive-consumer, secondary-domain RPC and adapter-contract fixes are implemented and regression-wired. Exact-head CI for `515361c...` is currently in progress; runtime/live evidence and Production Certification are not claimed.
