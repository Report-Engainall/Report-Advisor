# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Historical requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9`; it is not current evidence.
- Exact-head CI `33084224087` / Job `98559343666` on `fedf63182c66b4c7fc0e8106a62017886e3e90ba`: **SUCCESS**. All quality steps completed, including File security regressions, Decision evidence, typecheck, lint, build and performance.
- Exact-head CI `33085041491` / Job `98562277560` on `89367a9b7b214b0f65f59aede3a4cea4b1170387`: **SUCCESS**. Zero-consumer executive metrics gate and all downstream quality steps passed.
- Exact-head CI `33085371844` / Job `98563464419` on `3561bf3ba796eb7fb8acd327fb2035c09c18e267`: **FAIL** at the newly introduced Dashboard secondary truth gate. Root cause was the regression's own over-specific assertion requiring a literal `aging.reduce()` pattern; the implementation intentionally retained that presentation-only aggregation but formatting changed the match. This was a regression-test defect, not a product truth failure.
- Current code head: `b32cfe4e42f3f41fcb7378fe77bbca898fb71019`.
- Exact-head CI `33085502221` is queued/in progress for `b32cfe4...`; no PASS is claimed yet.
- Base remains `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- PR #45 remains open; mergeability/review state is repository state, not application certification.

## F46 — Dashboard secondary truth / browser aggregation sibling family
### FIND
`DashboardPage` was consuming `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, and `fetchCategoryBreakdown` from `src/lib/queries.ts`. Those functions read transactional datasets directly and performed client-side grouping/summing. This was a genuine sibling of the already-closed primary dashboard KPI truth.
### ROOT CAUSE
The primary dashboard KPI RPC had been canonicalized while the secondary trend/ranking/category consumer family remained on legacy browser-side calculations.
### FIX
Added `supabase/migrations/20260827160000_dashboard_secondary_truth.sql` with tenant-authoritative `public.report_dashboard_secondary_truth(integer)` and `src/lib/dashboard-secondary-truth.ts` as the adapter. `DashboardPage` now consumes the canonical adapter and suppresses incomplete financial chart rows instead of converting missing evidence to zero.
### CONSUMERS
The real DashboardPage consumer was migrated. Legacy secondary query implementations remain only in `src/lib/queries.ts` pending zero-consumer proof/removal.
### REGRESSION
Added `scripts/check-dashboard-secondary-truth.mjs` and wired it into quality. The gate rejects reintroduction of the legacy secondary functions/direct transactional reads and requires the canonical RPC/adapter plus tenant/fail-closed markers.
### EXACT-HEAD CI
- `33084224087` / `fedf631...`: SUCCESS baseline before this batch.
- `33085371844` / `3561bf3...`: FAIL at Dashboard secondary truth due to a false regression assertion requiring a formatting-sensitive `aging.reduce()` literal.
- Fix: `b32cfe4...` removes the brittle exact-format dependency while preserving the explicit exception for presentation-only aging bucket summation.
- `33085502221` / `b32cfe4...`: queued/in progress; pending exact-head result.
### STATUS
**IMPLEMENTED / REAL CONSUMER MIGRATED / REGRESSION-WIRED; CURRENT EXACT-HEAD CI PENDING.** Legacy zero-consumer removal and runtime proof remain open.

## F45 — Zero-consumer executive metrics compatibility removal
### FIND
The historical `public.get_executive_metrics(uuid,date,date)` RPC remained as an unnecessary compatibility/business-truth path.
### ROOT CAUSE
Legacy compatibility survived after runtime consumers disappeared and preserved a caller-shaped tenant API.
### ZERO-CONSUMER PROOF
`check-executive-metrics-zero-consumer.mjs` scans 790 source/runtime files and found no runtime consumer.
### FIX
Added exact-signature `DROP FUNCTION IF EXISTS public.get_executive_metrics(uuid, date, date);` migration and quality gate.
### EXACT-HEAD CI
`33085041491` / `89367a9b...`: SUCCESS, including the zero-consumer gate and all downstream quality steps.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / ZERO-CONSUMER-PROVEN; runtime migration execution remains required.**

## F44 — File-security pure-boundary regression
**GATED on `fedf631...`; current `b32cfe4...` revalidation pending.**

## Receivables
**IMPLEMENTED + REGRESSION-WIRED + ROUTE-CONSUMER-MIGRATED; CURRENT EXACT-HEAD CI PENDING.**
- Server-side snapshot truth; session-derived tenant authority; cancelled/canceled/void exclusion.
- `UNDATED` and `INCOMPLETE` retained; aggregate metrics independent of display pagination.
- Remaining: runtime >page-size proof, full export equivalence, cross-surface equivalence.

## Profitability
**PARTIAL / FAIL-CLOSED IMPLEMENTATION + REGRESSION-WIRED; CURRENT EXACT-HEAD CI PENDING.**
- Missing cost/incomplete/multi-currency evidence fails closed to `NULL` business totals.
- Remaining: complete discounts/returns/currency/rounding/source-record contract and cross-surface proof.

## Tenant / Security
- Canonical browser/server tenant authority covers several families.
- **OPEN:** Storage, Realtime, AI/vector, export/download, worker/cache indirect-path sweep and adversarial A/B runtime proof.

## Worker / Reliability
- Deterministic stage idempotency/recovery boundaries exist in covered runners.
- **LIVE REQUIRED:** real crash/restart, stale lease, duplicate worker, DLQ and replay drills.

## Cross-Surface Equivalence
**OPEN.** Primary canonical truth and analytics sources exist, but no exact-data runtime proof establishes Dashboard = Report = Analytics = BI = Export = Decision under identical tenant/date/as-of/status/NULL/currency/source-record semantics.

## Export Truth
**PARTIAL.** Scope classification is machine-enforced for encountered exporter implementations. Full repository consumer inventory and behavioral full/filtered dataset proof remain open.

## Semantic NULL / UNKNOWN sweep
**ACTIVE.** Fail-closed families exist, but repository-wide implicit conversion sibling scan remains open.

## Storage / Realtime / AI / Vector
**STATIC GATES ONLY / LIVE REQUIRED.** Required evidence: object path/signed URL authorization, realtime channel/payload isolation, vector metadata/retrieval/cache/deletion isolation.

## Runtime / LIVE
**NO RUNTIME EVIDENCE.** CI/static checks do not substitute for authenticated browser, tenant A/B, worker recovery, storage/realtime/vector, real document corpus, backup/restore or production telemetry evidence.

## Production Certification
**NOT PRODUCTION CERTIFIED.**

## Next active fronts
1. Verify exact-head CI for `b32cfe4...`.
2. If green, update the Index to the resulting exact SHA and continue zero-consumer proof/removal of legacy secondary query functions.
3. Continue repository-wide export consumer inventory and behavioral full/filtered dataset proof.
4. Build invariant-level BI ↔ Decision ↔ Analytics ↔ Export equivalence regression.
5. Continue NULL/UNKNOWN/MISSING/EMPTY/ZERO sibling sweep.
6. Continue tenant indirect-path sweep across Storage/Realtime/AI/vector/Exports/Workers/Caches.
7. Complete worker state-machine/recovery sibling sweep and LIVE harness.
8. Prepare authenticated runtime proof for pagination/as-of/tenant/export invariants.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current work has materially reduced duplicate business truth, but exact current-head CI, runtime/live evidence, cross-surface behavioral equivalence, remaining legacy query removal, and production evidence are still outstanding.
