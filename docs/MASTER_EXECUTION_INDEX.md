# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Historical requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9`; it is not current evidence.
- Exact-head CI `33084224087` / Job `98559343666` on `fedf63182c66b4c7fc0e8106a62017886e3e90ba`: **SUCCESS**. All quality steps completed, including File security regressions, Decision evidence, typecheck, lint, build and performance.
- Current code head after the dashboard secondary-truth closure wave: `584cd528518ee7e043d2ef3a71ebd5737a36665d`.
- Base remains `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- PR #45 remains open; mergeability/review state is repository state, not application certification.
- Exact-head CI for `584cd528...` is pending. No earlier successful SHA is reused as evidence for the current head.

## F46 — Dashboard secondary truth / browser aggregation sibling family
### FIND
`DashboardPage` was still consuming `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, and `fetchCategoryBreakdown` from `src/lib/queries.ts`. Those functions read transactional datasets directly and performed client-side grouping/summing. This was a genuine sibling of the already-closed primary dashboard KPI truth: canonical KPIs existed, but secondary dashboard surfaces still owned their own business calculations.
### ROOT CAUSE
The earlier canonicalization wave closed the main KPI RPC but did not migrate the secondary dashboard consumer family. The result was a split truth model: primary KPI truth was server-authoritative while trend/ranking/category truth remained browser-derived.
### FIX
Added `supabase/migrations/20260827160000_dashboard_secondary_truth.sql` with tenant-authoritative `public.report_dashboard_secondary_truth(integer)`. The RPC derives trend, top customers, top products and category metrics under `public.current_company_id()` and exposes `INSUFFICIENT_DATA` when required financial evidence is incomplete. Added `src/lib/dashboard-secondary-truth.ts` as the canonical adapter. `DashboardPage` now consumes the adapter and suppresses incomplete financial chart rows rather than converting missing evidence to zero.
### CONSUMERS
The real `DashboardPage` consumer was migrated. The legacy secondary query functions remain only in `src/lib/queries.ts` as compatibility implementations pending repository-wide zero-consumer proof; they are no longer imported by `DashboardPage`.
### REGRESSION
Added `scripts/check-dashboard-secondary-truth.mjs`, which fails if the Dashboard page reintroduces the legacy secondary functions or direct transactional secondary reads, and requires the canonical adapter/RPC and explicit tenant/fail-closed markers.
### EXACT-HEAD CI
`33084224087` / `98559343666` on `fedf631...`: SUCCESS for the pre-wave baseline. The new dashboard-secondary gate and implementation were added after that run. Current `584cd528...` therefore remains pending exact-head CI.
### STATUS
**IMPLEMENTED / REAL CONSUMER MIGRATED / REGRESSION-WIRED; CURRENT EXACT-HEAD CI PENDING.** Legacy zero-consumer removal of the old query functions and runtime proof remain open.

## F45 — Zero-consumer executive metrics compatibility removal
### FIND
The historical `public.get_executive_metrics(uuid,date,date)` RPC remained as a compatibility path after newer canonical report truth boundaries existed.
### ROOT CAUSE
Legacy compatibility was preserved beyond the point where repository consumers required it; its API shape encoded caller-supplied tenant identity.
### ZERO-CONSUMER PROOF
Repository search found only historical SQL definitions/migrations and no runtime/page/service/API/worker consumer. `scripts/check-executive-metrics-zero-consumer.mjs` now guards against resurrection.
### FIX
Added `supabase/migrations/20260827153000_drop_zero_consumer_executive_metrics.sql` with exact-signature `DROP FUNCTION IF EXISTS public.get_executive_metrics(uuid, date, date);` and gated the zero-consumer proof in quality.
### EXACT-HEAD CI
`33084224087` / `98559343666` on `fedf631...`: SUCCESS. The removal batch was created afterward; current head remains pending.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / ZERO-CONSUMER-PROVEN; CURRENT EXACT-HEAD CI PENDING.** Runtime migration execution remains required.

## F44 — File-security pure-boundary regression
**GATED on `fedf631...`; current `584cd528...` revalidation pending.**
- Pure SHA-256 primitive isolated from Vite/Supabase alias graph.
- File-security regression passed in exact run `33084224087` on `fedf631...`.

## F42 — Receivables snapshot empty-page / incomplete-evidence contract
**REGRESSION-WIRED / CONSUMER-VERIFIED STATICALLY; runtime >page-size and cross-surface evidence remain open.**

## F35 — Financial semantic fail-closed sibling family
**IMPLEMENTED / REGRESSION-WIRED; exact current SHA pending.**

## F37/F40/F43 — Export Truth family
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-INVENTORIED; behavioral pagination→export and full/filtered export equivalence remain open.**

## F38 — Receivables consumer retry
**IMPLEMENTED / REGRESSION-WIRED; runtime retry evidence remains required.**

## F39 — Analytics browser-truth sibling family
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-MIGRATED / LEGACY-REMOVED; exact current SHA revalidation pending.**

## F41 — Zero-consumer legacy financial intelligence calculator
**REMOVED / ZERO-CONSUMER-PROVEN; exact current SHA revalidation pending.**

## Receivables
**IMPLEMENTED + REGRESSION-WIRED + ROUTE-CONSUMER-MIGRATED; CURRENT EXACT-HEAD CI PENDING.**
- Server-side snapshot truth; session-derived tenant authority; cancelled/canceled/void exclusion.
- `UNDATED` and `INCOMPLETE` retained; aggregate metrics independent of page display.
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
1. Verify exact-head CI for `584cd528...`; repair the next failure at root cause.
2. Prove zero consumers of the migrated `queries.ts` secondary functions and remove them safely if unused.
3. Continue repository-wide export consumer inventory and behavioral full/filtered dataset proof.
4. Build invariant-level BI ↔ Decision ↔ Analytics ↔ Export equivalence regression.
5. Continue NULL/UNKNOWN/MISSING/EMPTY/ZERO sibling sweep.
6. Continue tenant indirect-path sweep across Storage/Realtime/AI/vector/Exports/Workers/Caches.
7. Complete worker state-machine/recovery sibling sweep and LIVE harness.
8. Prepare authenticated runtime proof for pagination/as-of/tenant/export invariants.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Significant canonicalization and regression hardening are now present, but current exact-head CI, runtime/live evidence, cross-surface behavioral equivalence, legacy secondary query removal, and production evidence remain outstanding.
