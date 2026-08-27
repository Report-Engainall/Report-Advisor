# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> Evidence states are separate: IMPLEMENTED → REGRESSION-ENFORCED → GATED → INTEGRATED → CONSUMER-VERIFIED → RUNTIME-EVIDENCED → LIVE-VERIFIED → PRODUCTION-CERTIFIED. No promotion without evidence on the exact SHA.

## Current exact-head state
- Code HEAD being indexed: `af2fa390b4c5f2b215e889ab76f8aabd4cc58452`.
- This index update is a new commit after that code state; therefore the resulting branch tip must receive its own exact-head CI before any current-tip PASS claim.
- Exact-head CI Run `33087625052` / Job `98571519282`: **SUCCESS on exactly `f7419f3d...`** only. It does not certify `af2fa390...` or the resulting index tip.
- Historical failures remain retained: `33086322239` / `1fe8eb2...` and `33086226689` / `c103d249...` failed at the stale effective-financial regression gate.

## F46 — Dashboard secondary truth
**IMPLEMENTED / REAL CONSUMER MIGRATED / REGRESSION-ENFORCED / PRIOR CI-PROVEN / CURRENT TIP PENDING.** `report_dashboard_secondary_truth(integer)` + `src/lib/dashboard-secondary-truth.ts` own secondary business truth with `current_company_id()`. Legacy Dashboard secondary consumers are no longer imported. Fail-closed source semantics are enforced. Remaining: zero-consumer legacy function removal and runtime proof.

## F45 — Executive metrics compatibility removal
- Zero-consumer scan found no runtime consumer for `get_executive_metrics(uuid,date,date)`.
- Exact-signature drop migration added.
- Run `33085041491` / Job `98562277560` on `89367a9...`: **SUCCESS** for F45 only.
- Runtime migration execution remains separate evidence.

## Receivables Truth
**IMPLEMENTED / REGRESSION-ENFORCED / ROUTE CONSUMER MIGRATED / PRIOR EXACT-HEAD CI-PROVEN / CURRENT TIP PENDING.**
- Canonical `report_receivables_snapshot` owns aggregate truth independently of page boundaries and derives tenant from `current_company_id()`.
- Incomplete rows are retained as `INCOMPLETE`; missing financial evidence produces `INSUFFICIENT_DATA`, not zero.
- `UNDATED` is explicit; cancelled/canceled/void are excluded.
- **Finding:** prior contract did not enforce reporting `as-of` at invoice source and counted incomplete rows inconsistently for pagination metadata.
- **Fix:** `20260827163000_receivables_truth_date_boundary.sql` applies `si.invoice_date::date <= p_as_of_date`, retains incomplete rows, excludes settled rows, counts all retained rows in `total_rows`, and keeps `total_outstanding` NULL when incomplete evidence exists.
- **Regression:** `scripts/check-receivables-truth-contract.mjs` enforces the as-of boundary, settled exclusion, retained incomplete evidence and pagination/fail-closed invariants.
- Remaining: current-tip CI, zero-consumer legacy removal, >page-size runtime proof, export equivalence and cross-surface proof.

## Profitability Truth
**PARTIAL / FAIL-CLOSED / CURRENT TIP PENDING.** Canonical `report_profitability_truth` derives tenant from `current_company_id()`; missing line revenue/cost/quantity or multi-currency evidence fails closed to NULL totals. Remaining: explicit discounts/returns/currency-conversion/rounding contract and equivalence across Dashboard/BI/Decision/Export.

## Export Truth
**PARTIAL.** Scope is explicit: `CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET`. Browser report export is explicitly current-view. Remaining: repository-wide exporter inventory, canonical full/filtered implementations and pagination→export regression across every exporter.

## BI ↔ Decision ↔ Analytics ↔ Export
**OPEN.** Canonical BI/Analytics sources and Decision/Outcome hardening exist, but no runtime evidence proves equivalent records/totals/counts/date/as-of/tenant/NULL semantics across all surfaces.

## Tenant Security sibling sweep
**ACTIVE / HIGH RISK.** Covered DB/browser/import/alternative-group paths use session-derived tenant controls. Remaining: Storage paths/signed URLs, Realtime channels/payloads, AI/vector metadata/retrieval/cache/deletion, exports/downloads, workers/queues/cron/cache/background aggregation. Static proof is not A/B adversarial runtime proof.

## Worker / Reliability
**IMPLEMENTED / REGRESSION-WIRED / LIVE REQUIRED.** Durable runner uses deterministic `jobId:stage:sourceHash` idempotency keys and unsafe post-side-effect failures require manual reconciliation. Remaining: real crash/restart/stale lease/duplicate worker/DLQ/resume/receipt drills.

## Storage / Realtime / AI / Vector
**STATIC/CONTRACT WORK ONLY — NO RUNTIME EVIDENCE.** Required: tenant A/B adversarial denial, signed URL isolation, realtime event isolation, vector metadata/retrieval/cache/deletion isolation.

## Semantic NULL / UNKNOWN / MISSING / ZERO
**ACTIVE.** Receivables, Profitability, Outcome and Dashboard secondary hardenings exist. Repository-wide implicit conversion sweep remains open.

## Document Intelligence
**REGRESSION/GATED FOUNDATION; REAL CORPUS NOT VERIFIED.** Real OCR/PDF/XLSX/CSV execution evidence remains LIVE REQUIRED.

## Inventory / Data Truth
**IMPLEMENTED / REGRESSION-WIRED IN COVERED ROUTES; CROSS-SURFACE OPEN.**

## Database / Migration Safety
**ACTIVE.** Receivables replacement uses the exact existing function signature and preserves authenticated execute grants. Full dependency/signature/grant/RLS/security-definer audit remains required.

## Runtime / LIVE evidence
**NO RUNTIME EVIDENCE.** Authenticated browser, tenant A/B DB+Storage+Realtime+AI/vector, worker crash/recovery, native watcher, backup restore/RPO/RTO, real document corpus, production telemetry/load/canary/rollback and crypto matrix remain required.

## Production Certification
**NOT PRODUCTION CERTIFIED.** Static/CI evidence is insufficient.

## Historical evidence — retained, not promoted
- `32910806786` / `25eef521...`: historical quality PASS; not current-head evidence.
- `32912319688` / `1773cbd...`: historical quality SUCCESS; not current-head evidence.
- `33084224087` / `fedf631...`: historical exact-head SUCCESS.
- `33085041491` / `89367a9...`: exact-head SUCCESS for F45.
- `33085371844` / `3561bf3...`: exact-head FAILURE at Dashboard secondary regression.
- `33085904618` / `e3bb2ea...`: exact-head FAILURE at Dashboard secondary regression.
- `33086226689` / `c103d249...`: exact-head FAILURE at stale effective-financial regression.
- `33086322239` / `1fe8eb2...`: exact-head FAILURE at the same stale regression.
- `33086397054` / `8ab145f...`: historical superseded state.
- `33087319123` / `4ef95a5...`: SUCCESS, exact-head CI for prior code/index state.
- `33087625052` / `f7419f3...`: SUCCESS, exact-head CI for prior code/index state.

## Active execution matrix
| Front | State | Next proof |
|---|---|---|
| Exact-head CI | ACTIVE | CI for resulting current tip; no PASS yet |
| Dashboard secondary | ACTIVE | zero-consumer legacy removal + runtime |
| Receivables | ACTIVE | current-tip CI + zero-consumer + runtime page-boundary |
| Profitability | ACTIVE | financial contract + cross-surface equivalence |
| Export | ACTIVE | full consumer inventory + pagination regression |
| BI/Decision/Analytics | ACTIVE | invariant regression across surfaces |
| Tenant siblings | ACTIVE | Storage/Realtime/AI/vector/worker sweep |
| Worker reliability | ACTIVE | live failure/recovery drills |
| NULL semantics | ACTIVE | global implicit conversion sweep |
| Documents | ACTIVE | real corpus execution |
| Runtime/LIVE | BLOCKED | deployment/authenticated environment |
| Production certification | BLOCKED | required LIVE/production evidence |

## Next autonomous wave
1. Obtain exact-head CI for the resulting current tip and record only the exact SHA result.
2. Sweep Receivables legacy consumers and prove zero-consumer status before removal.
3. Build invariant-level cross-surface regression for tenant/date/as-of/status/NULL semantics.
4. Complete exporter consumer classification and pagination truncation regression.
5. Sweep caller-supplied tenant authority and indirect tenant sources across background/storage/realtime/vector paths.
6. Complete worker state-machine recovery analysis and LIVE harness.
7. Convert CI-stable families into concrete runtime drills; do not label LIVE without evidence.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** A real Receivables source-level boundary defect was corrected and regression-enforced. Current branch tip still requires its own exact-head CI evidence, and runtime/live/production evidence remains outstanding.
