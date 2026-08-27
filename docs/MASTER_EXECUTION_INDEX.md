# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> Evidence states are separate: IMPLEMENTED → REGRESSION-ENFORCED → GATED → INTEGRATED → CONSUMER-VERIFIED → RUNTIME-EVIDENCED → LIVE-VERIFIED → PRODUCTION-CERTIFIED. No promotion without evidence on the exact SHA.

## Current exact-head state
- Current code HEAD: `8ab145fcce48aa24e589a72dbbf59bc6b1dd0ee1`.
- Quality Run `33086397054` / Job `98567084473`: **IN_PROGRESS** on exactly `8ab145f...`; no PASS claimed.
- Previous Run `33086322239` / Job on `1fe8eb2...`: **FAIL** because `check-effective-financial-truth-fail-closed.mjs` still expected the four legacy Dashboard sibling consumers after their migration. This was a stale regression gate, not a product defect.
- Previous Run `33086226689` / Job `98566482933` on `c103d249...`: **FAIL** at the same stale gate; all gates before it passed.
- Earlier Dashboard secondary regression failures `33085904618` / `e3bb2ea...` and `33085371844` / `3561bf3...` remain historical evidence; they exposed test-contract defects and were not accepted as flaky.

## F46 — Dashboard secondary truth
### FIND
Dashboard secondary consumers were performing browser-side trend/ranking/category business aggregation through legacy query functions.
### ROOT CAUSE
Primary KPI truth was canonicalized while secondary business-truth consumers remained on the legacy query surface.
### FIX
`report_dashboard_secondary_truth(integer)` + `src/lib/dashboard-secondary-truth.ts` now own trend/top-customer/top-product/category truth with tenant authority from `current_company_id()`.
`DashboardPage` consumes the adapter; legacy secondary functions are no longer imported by the page.
### SEMANTIC HARDENING
A follow-up finding showed that the RPC itself could still expose partial numeric rankings/categories while its overall status was `INSUFFICIENT_DATA`. Migration `20260827161000_dashboard_secondary_truth_fail_closed.sql` now nulls financial ranking/category/trend values whenever incomplete transactional evidence exists.
### REGRESSION
`scripts/check-dashboard-secondary-truth.mjs` verifies canonical adapter/RPC/tenant markers, legacy consumer absence, direct transactional-read absence, fail-closed refinement, and exactly one presentation-only aging reduction.
`scripts/check-effective-financial-truth-fail-closed.mjs` was corrected to require absence of the four migrated legacy sibling consumers rather than their presence.
### STATUS
**IMPLEMENTED / REAL CONSUMER MIGRATED / REGRESSION-ENFORCED / CURRENT EXACT-HEAD CI PENDING.** Legacy function zero-consumer/removal and runtime proof remain open.

## F45 — Executive metrics compatibility removal
- Zero-consumer scan covered source/runtime files and found no runtime consumer for `get_executive_metrics(uuid,date,date)`.
- Exact-signature drop migration added.
- Quality Run `33085041491` / Job `98562277560` on `89367a9...`: **SUCCESS**, including zero-consumer and downstream quality gates.
- Current status: **ZERO-CONSUMER-PROVEN / REGRESSION-WIRED**; runtime migration execution remains separate evidence.

## Receivables Truth
**IMPLEMENTED / REGRESSION-ENFORCED / ROUTE CONSUMER MIGRATED / CURRENT CI PENDING.**
- Canonical `report_receivables_snapshot` owns aggregate truth independently of page boundaries.
- Incomplete rows are retained as `INCOMPLETE`; missing financial evidence produces `INSUFFICIENT_DATA` rather than disappearance or zero.
- `UNDATED` is explicit; cancelled/canceled/void are excluded.
- `/reports/receivables` consumes `ReceivablesReportPageCanonical`.
- Remaining: zero-consumer legacy removal, >page-size runtime proof, export equivalence, cross-surface proof.

## Profitability Truth
**PARTIAL / FAIL-CLOSED / CURRENT CI PENDING.**
- Canonical `report_profitability_truth` derives tenant from `current_company_id()`.
- Missing line revenue/cost/quantity and multi-currency evidence fail closed to NULL business totals.
- Profitability report consumes the canonical service.
- Remaining: explicit contract for discounts/returns/currency conversion/rounding and behavioral equivalence against Dashboard/BI/Decision/Export.

## Export Truth
**PARTIAL.**
- Export scope is explicit: `CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET`.
- Sales/purchases/inventory browser exports are explicitly current-page exports.
- Remaining: repository-wide exporter consumer inventory and canonical full/filtered dataset implementations plus pagination→export regression across every exporter.

## BI ↔ Decision ↔ Analytics ↔ Export
**OPEN.**
- Canonical BI/Analytics sources exist and Decision/Outcome evidence hardening exists.
- No runtime evidence yet proves identical records/totals/counts/date/as-of/tenant/NULL semantics across all surfaces.
- Any intentional transformation must be documented before equivalence can be certified.

## Tenant Security sibling sweep
**ACTIVE / HIGH RISK.**
- Database/browser/import/alternative-group paths have canonical session-derived tenant controls in covered families.
- Remaining sibling paths: Storage object paths/signed URLs, Realtime channels/payloads, AI/vector metadata/retrieval/cache/deletion, exports/downloads, workers/queues/cron/cache and background aggregation.
- Static proof is not adversarial A/B runtime proof.

## Worker / Reliability
**IMPLEMENTED / REGRESSION-WIRED / LIVE REQUIRED.**
- Durable runner tracks side-effect boundary and deterministic `jobId:stage:sourceHash` idempotency keys.
- Automatic retry is prohibited after an unsafe replay boundary; such failures require manual reconciliation.
- DB checkpoint state machine validates stage order, source hash, evidence-key monotonicity and worker lease ownership.
- Remaining: real crash-before/during/after side-effect drills, stale lease, duplicate worker, DLQ, resume and receipt evidence.

## Storage / Realtime / AI / Vector
**STATIC/CONTRACT WORK ONLY — NO RUNTIME EVIDENCE.**
Required proof remains tenant A/B adversarial access denial, signed URL isolation, realtime event isolation, vector metadata/retrieval/cache/deletion isolation.

## Semantic NULL / UNKNOWN / MISSING / ZERO
**ACTIVE.**
Known hardenings include Receivables incomplete evidence, Profitability fail-closed totals, outcome missing impact/accuracy, and Dashboard secondary fail-closed values. Repository-wide implicit conversion sweep remains open.

## Document Intelligence
**REGRESSION/GATED FOUNDATION; REAL CORPUS NOT VERIFIED.**
Golden corpus contracts cover schema/normalization/evidence/confidence. Real OCR/PDF/XLSX/CSV execution evidence remains LIVE REQUIRED.

## Inventory / Data Truth
**IMPLEMENTED / REGRESSION-WIRED IN COVERED ROUTES; CROSS-SURFACE OPEN.**
Canonical inventory snapshot separates page display from business metrics and retains incomplete valuation semantics. Inventory intelligence tenant-authority RPC signatures were moved away from caller-supplied tenant IDs.

## Database / Migration Safety
**ACTIVE.**
Exact signatures are used for destructive drops in covered migrations. Full migration dependency/signature/grant/RLS/security-definer audit remains required before destructive cleanup.

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

## Active execution matrix
| Front | State | Blocker / next proof |
|---|---|---|
| Exact-head CI | ACTIVE | Run `33086397054` on `8ab145f...` |
| Dashboard secondary | ACTIVE | exact-head CI → zero-consumer legacy removal |
| Receivables | ACTIVE | legacy zero-consumer + runtime page-boundary proof |
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
1. Consume Run `33086397054` exact-head result; if failure, extract exact error → root cause → fix → regression → new exact SHA.
2. Continue legacy secondary query zero-consumer inventory; remove only after proof.
3. Build invariant-level cross-surface regression for identical tenant/date/as-of/status/NULL semantics.
4. Complete exporter consumer classification and pagination truncation regression.
5. Sweep caller-supplied tenant authority and indirect tenant sources across background/storage/realtime/vector paths.
6. Complete worker state-machine sibling recovery analysis and LIVE harness.
7. Convert every CI-stable family into a concrete runtime drill; do not label LIVE without evidence.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** The current wave is materially deeper than CI-only closure, but exact current-head CI, remaining legacy removal, cross-surface equivalence, runtime/live evidence and production evidence are still outstanding.
