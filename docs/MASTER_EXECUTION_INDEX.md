# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> Evidence states are separate: IMPLEMENTED → REGRESSION-ENFORCED → GATED → INTEGRATED → CONSUMER-VERIFIED → RUNTIME-EVIDENCED → LIVE-VERIFIED → PRODUCTION-CERTIFIED. No promotion without evidence on the exact SHA.

## Current exact-head state
- Current code HEAD: `e06b3bad23361eeec298ddab3cd6647283d361dc`.
- Exact-head CI: **NO PASS OBSERVED** for `e06b3bad...`; the prior quality run `33086397054` was on `8ab145f...` and is not evidence for this HEAD.
- Historical failures remain retained: `33086322239` / `1fe8eb2...` failed on a stale effective-financial regression gate; `33086226689` / `c103d249...` failed at the same stale gate.

## F46 — Dashboard secondary truth
### FIND
Dashboard secondary consumers were performing browser-side trend/ranking/category business aggregation through legacy query functions.
### ROOT CAUSE
Primary KPI truth was canonicalized while secondary business-truth consumers remained on the legacy query surface.
### FIX
`report_dashboard_secondary_truth(integer)` + `src/lib/dashboard-secondary-truth.ts` now own trend/top-customer/top-product/category truth with tenant authority from `current_company_id()`. `DashboardPage` consumes the adapter; legacy secondary functions are no longer imported by the page.
### SEMANTIC HARDENING
Migration `20260827161000_dashboard_secondary_truth_fail_closed.sql` nulls financial ranking/category/trend values whenever incomplete transactional evidence exists.
### REGRESSION
`scripts/check-dashboard-secondary-truth.mjs` verifies canonical adapter/RPC/tenant markers, legacy consumer absence, direct transactional-read absence, fail-closed refinement, and presentation-only aging reduction. `scripts/check-effective-financial-truth-fail-closed.mjs` was corrected to require absence of migrated legacy sibling consumers.
### STATUS
**IMPLEMENTED / REAL CONSUMER MIGRATED / REGRESSION-ENFORCED / CURRENT EXACT-HEAD CI PENDING.** Legacy function zero-consumer/removal and runtime proof remain open.

## F45 — Executive metrics compatibility removal
- Zero-consumer scan found no runtime consumer for `get_executive_metrics(uuid,date,date)`.
- Exact-signature drop migration added.
- Quality Run `33085041491` / Job `98562277560` on `89367a9...`: **SUCCESS**, including zero-consumer and downstream quality gates.
- Status: **ZERO-CONSUMER-PROVEN / REGRESSION-WIRED**; runtime migration execution remains separate evidence.

## Receivables Truth
**IMPLEMENTED / REGRESSION-ENFORCED / ROUTE CONSUMER MIGRATED / CURRENT EXACT-HEAD CI PENDING.**
- Canonical `report_receivables_snapshot` owns aggregate truth independently of page boundaries and derives tenant from `current_company_id()`.
- Incomplete rows are retained as `INCOMPLETE`; missing financial evidence produces `INSUFFICIENT_DATA`, not zero.
- `UNDATED` is explicit; cancelled/canceled/void are excluded.
- **New finding:** the prior contract did not enforce the reporting `as-of` date at the invoice source and counted incomplete rows inconsistently for pagination metadata.
- **Fix:** `20260827163000_receivables_truth_date_boundary.sql` now applies `si.invoice_date::date <= p_as_of_date`, excludes `SETTLED` rows from receivables truth while retaining incomplete rows, counts all retained receivable rows in `total_rows`, and keeps `total_outstanding` NULL when incomplete evidence exists.
- **Regression:** `scripts/check-receivables-truth-contract.mjs` now enforces the explicit as-of boundary, settled exclusion, retained incomplete evidence, pagination independence, and fail-closed totals.
- Remaining: zero-consumer legacy removal, >page-size runtime proof, export equivalence, cross-surface proof, exact-head CI.

## Profitability Truth
**PARTIAL / FAIL-CLOSED / CURRENT EXACT-HEAD CI PENDING.**
- Canonical `report_profitability_truth` derives tenant from `current_company_id()`.
- Missing line revenue/cost/quantity and multi-currency evidence fail closed to NULL business totals.
- Remaining: explicit contract for discounts/returns/currency conversion/rounding and behavioral equivalence against Dashboard/BI/Decision/Export.

## Export Truth
**PARTIAL.**
- Export scope is explicit: `CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET`.
- Sales/purchases/inventory browser exports are explicitly current-page exports.
- Remaining: repository-wide exporter inventory, canonical full/filtered dataset implementations, and pagination→export regression across every exporter.

## BI ↔ Decision ↔ Analytics ↔ Export
**OPEN.**
- Canonical BI/Analytics sources and Decision/Outcome hardening exist.
- No runtime evidence proves identical records/totals/counts/date/as-of/tenant/NULL semantics across all surfaces.
- Intentional transformations must be documented before equivalence certification.

## Tenant Security sibling sweep
**ACTIVE / HIGH RISK.**
- Covered database/browser/import/alternative-group paths use session-derived tenant controls.
- Remaining siblings: Storage paths/signed URLs, Realtime channels/payloads, AI/vector metadata/retrieval/cache/deletion, exports/downloads, workers/queues/cron/cache and background aggregation.
- Static proof is not adversarial A/B runtime proof.

## Worker / Reliability
**IMPLEMENTED / REGRESSION-WIRED / LIVE REQUIRED.**
- Durable runner tracks side-effect boundary and deterministic `jobId:stage:sourceHash` idempotency keys.
- Unsafe post-side-effect failures require manual reconciliation rather than automatic replay.
- DB checkpoint state machine validates stage order, source hash, evidence-key monotonicity and worker lease ownership.
- Remaining: real crash-before/during/after-side-effect drills, stale lease, duplicate worker, DLQ, resume and receipt evidence.

## Storage / Realtime / AI / Vector
**STATIC/CONTRACT WORK ONLY — NO RUNTIME EVIDENCE.**
Required proof: tenant A/B adversarial access denial, signed URL isolation, realtime event isolation, vector metadata/retrieval/cache/deletion isolation.

## Semantic NULL / UNKNOWN / MISSING / ZERO
**ACTIVE.**
Known hardenings include Receivables incomplete evidence, Profitability fail-closed totals, outcome missing impact/accuracy, and Dashboard secondary fail-closed values. Repository-wide implicit conversion sweep remains open.

## Document Intelligence
**REGRESSION/GATED FOUNDATION; REAL CORPUS NOT VERIFIED.**
Golden corpus contracts cover schema/normalization/evidence/confidence. Real OCR/PDF/XLSX/CSV execution evidence remains LIVE REQUIRED.

## Inventory / Data Truth
**IMPLEMENTED / REGRESSION-WIRED IN COVERED ROUTES; CROSS-SURFACE OPEN.**
Canonical inventory snapshot separates page display from business metrics and retains incomplete valuation semantics. Inventory intelligence tenant-authority RPC signatures moved away from caller-supplied tenant IDs.

## Database / Migration Safety
**ACTIVE.**
Receivables migration uses the exact existing function signature before replacement and preserves authenticated execute grants. Full migration dependency/signature/grant/RLS/security-definer audit remains required.

## Runtime / LIVE evidence
**NO RUNTIME EVIDENCE.**
Required: authenticated browser with real data; tenant A/B DB+Storage+Realtime+AI/vector; worker crash/recovery; native watcher; backup restore/RPO/RTO; real document corpus; production telemetry/load/canary/rollback; crypto capability matrix.

## Production Certification
**NOT PRODUCTION CERTIFIED.** CI/static contracts do not constitute production certification.

## Historical evidence — retained, not promoted
- `32910806786` / `25eef521...`: historical quality PASS; not current-head evidence.
- `32912319688` / `1773cbd...`: historical quality SUCCESS; not current-head evidence.
- `33084224087` / `fedf631...`: historical exact-head SUCCESS.
- `33085041491` / `89367a9...`: exact-head SUCCESS for F45.
- `33085371844` / `3561bf3...`: exact-head FAILURE at Dashboard secondary regression.
- `33085904618` / `e3bb2ea...`: exact-head FAILURE at Dashboard secondary regression.
- `33086226689` / `c103d249...`: exact-head FAILURE at stale effective-financial regression.
- `33086322239` / `1fe8eb2...`: exact-head FAILURE at the same stale regression.
- `33086397054` / `8ab145f...`: historical current-wave run; not evidence for current HEAD `e06b3bad...`.

## Active execution matrix
| Front | State | Blocker / next proof |
|---|---|---|
| Exact-head CI | ACTIVE | CI for `e06b3bad...` required; no PASS claimed |
| Dashboard secondary | ACTIVE | exact-head CI → zero-consumer legacy removal |
| Receivables | ACTIVE | exact-head CI → legacy zero-consumer + runtime page-boundary proof |
| Profitability | ACTIVE | financial contract + cross-surface equivalence |
| Export | ACTIVE | full consumer inventory + full/filtered truth |
| BI/Decision/Analytics | ACTIVE | invariant regression across surfaces |
| Tenant siblings | ACTIVE | Storage/Realtime/AI/vector/worker sweep |
| Worker reliability | ACTIVE | live failure/recovery drills |
| NULL semantics | ACTIVE | repository-wide implicit conversion sweep |
| Documents | ACTIVE | real corpus execution |
| Runtime/LIVE | BLOCKED | deployment/authenticated environment |
| Production certification | BLOCKED | all required LIVE/production evidence |

## Next autonomous wave
1. Consume/create exact-head CI evidence for `e06b3bad...`; if failure, extract exact error → root cause → fix → regression → new exact SHA.
2. Sweep Receivables sibling consumers and prove zero legacy consumers before removal.
3. Build invariant-level cross-surface regression for identical tenant/date/as-of/status/NULL semantics.
4. Complete exporter consumer classification and pagination truncation regression.
5. Sweep caller-supplied tenant authority and indirect tenant sources across background/storage/realtime/vector paths.
6. Complete worker state-machine sibling recovery analysis and LIVE harness.
7. Convert every CI-stable family into a concrete runtime drill; do not label LIVE without evidence.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current wave has a new Receivables source-level correction, but exact current-head CI, legacy removal, cross-surface equivalence, runtime/live evidence and production evidence remain outstanding.
