# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> Evidence states are separate: IMPLEMENTED → REGRESSION-ENFORCED → GATED → INTEGRATED → CONSUMER-VERIFIED → RUNTIME-EVIDENCED → LIVE-VERIFIED → PRODUCTION-CERTIFIED. No promotion without evidence on the exact SHA.

## Current exact-head state
- Code HEAD before this index commit: `3f742b26cc492bf4984e60e4fa0be5b58aeaede7`.
- This index update changes the branch tip; therefore the resulting commit is **CI PENDING** until a new quality run is observed on its exact SHA.
- No CI PASS is inherited from an earlier SHA.

## F48 — Aging analytics fail-closed presentation
**IMPLEMENTED / REGRESSION-WIRED / CI PENDING.**
- Finding: analytics could retain financial aging buckets in presentation when canonical receivables truth was incomplete/insufficient.
- Root cause: bucket visualization was not explicitly gated on `CALCULATED` status.
- Fix: analytics derives `isCalculated` from canonical snapshot status and gates bucket data and chart rendering.
- Regression: `scripts/check-analytics-truth-contract.mjs` asserts the calculated-state guard and fail-closed chart behavior.
- Remaining: exact-head CI; incomplete-real-data runtime; cross-surface equivalence.

## F47 — Receivables empty-page sentinel leakage
**FIXED / REGRESSION-WIRED / CI VERIFIED historically at `c2f4a019...`.**
- Root cause: transport metadata and business rows were not separated at the adapter boundary.
- Fix: adapter filters `row.id != null` while retaining aggregate metadata.
- Regression: empty-page contract asserts sentinel filtering.
- Remaining: real >page-size runtime, export equivalence, cross-surface proof.

## F46 — Dashboard secondary truth
**IMPLEMENTED / REAL CONSUMER MIGRATED / REGRESSION-ENFORCED / CI VERIFIED historically at `c2f4a019...`.** Remaining: zero-consumer legacy removal and runtime proof.

## F45 — Executive metrics compatibility removal
Zero-consumer scan found no runtime consumer for `get_executive_metrics(uuid,date,date)`; exact-signature drop migration added. Run `33085041491` / Job `98562277560` on `89367a9...` was SUCCESS for F45 only. Runtime migration execution remains separate evidence.

## Receivables Truth
**IMPLEMENTED / REGRESSION-ENFORCED / ROUTE CONSUMER MIGRATED / historically CI VERIFIED at `c2f4a019...`.** Canonical `report_receivables_snapshot` owns aggregate truth independently of page boundaries and derives tenant from `current_company_id()`. Incomplete rows remain `INCOMPLETE`; missing financial evidence is `INSUFFICIENT_DATA`; `UNDATED` is explicit; cancelled/canceled/void are excluded. Remaining: zero-consumer legacy proof, >page-size runtime, export equivalence and cross-surface proof.

## Profitability Truth
**PARTIAL / FAIL-CLOSED / historically CI VERIFIED at `c2f4a019...`.** Canonical `report_profitability_truth` derives tenant from `current_company_id()`; missing revenue/cost/quantity and multi-currency evidence fail closed to NULL totals. Remaining: explicit discounts/returns/currency-conversion/rounding contract and Dashboard/BI/Decision/Export equivalence.

## Export Truth
**PARTIAL / historically CI VERIFIED at `c2f4a019...`.** Explicit scopes: `CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET`; browser report export is current-view; static gate detects ambiguous exporter names and pagination/client-aggregation mixing. Remaining: repository-wide consumer inventory, canonical full/filtered implementations, pagination→export regression.

## BI ↔ Decision ↔ Analytics ↔ Export
**OPEN.** No runtime evidence proves equivalent records/totals/counts/date/as-of/tenant/NULL semantics across all surfaces.

## Tenant Security sibling sweep
**REGRESSION-WIRED / historically CI VERIFIED at `c2f4a019...`.** Static gate scans SQL migrations for SECURITY DEFINER functions accepting caller-supplied tenant identity without `current_company_id()` or explicit `TENANT_AUTHORITY: TRUSTED_INTERNAL`. This is not A/B runtime isolation proof.

## Worker / Reliability
**IMPLEMENTED / REGRESSION-WIRED / historically CI VERIFIED at `c2f4a019...` / LIVE REQUIRED.** Durable runner uses deterministic `jobId:stage:sourceHash` idempotency keys; unsafe post-side-effect failures require manual reconciliation. Remaining: real crash/restart/stale lease/duplicate worker/DLQ/resume/receipt drills.

## Storage / Realtime / AI / Vector
**STATIC/CONTRACT ONLY — NO RUNTIME EVIDENCE.** Required: tenant A/B denial, signed URL isolation, realtime event isolation, vector metadata/retrieval/cache/deletion isolation.

## Semantic NULL / UNKNOWN / MISSING / ZERO
**ACTIVE.** Receivables, Profitability, Outcome, Dashboard secondary and Analytics presentation hardenings exist. Repository-wide implicit conversion sweep remains open.

## Document Intelligence
**REGRESSION/GATED FOUNDATION; REAL CORPUS NOT VERIFIED.** Real OCR/PDF/XLSX/CSV execution remains LIVE REQUIRED.

## Inventory / Data Truth
**IMPLEMENTED / REGRESSION-WIRED IN COVERED ROUTES; CROSS-SURFACE OPEN.**

## Database / Migration Safety
**ACTIVE.** Receivables replacement uses the exact existing function signature and preserves authenticated execute grants. Full dependency/signature/grant/RLS/security-definer audit remains required.

## Runtime / LIVE evidence
**NO RUNTIME EVIDENCE.** Authenticated browser, tenant A/B DB+Storage+Realtime+AI/vector, worker recovery, native watcher, backup restore/RPO/RTO, real document corpus, production telemetry/load/canary/rollback and crypto matrix remain required.

## Production Certification
**NOT PRODUCTION CERTIFIED.** Static/CI evidence is insufficient.

## Historical evidence — retained, not promoted
- `32910806786` / `25eef521...`: historical quality PASS.
- `32912319688` / `1773cbd...`: historical quality SUCCESS.
- `33084224087` / `fedf631...`: historical exact-head SUCCESS.
- `33085041491` / `89367a9...`: exact-head SUCCESS for F45.
- `33085371844` / `3561bf3...`: exact-head FAILURE at Dashboard secondary regression.
- `33085904618` / `e3bb2ea...`: exact-head FAILURE at Dashboard secondary regression.
- `33086226689` / `c103d249...`: exact-head FAILURE at stale effective-financial regression.
- `33086322239` / `1fe8eb2...`: exact-head FAILURE at the same stale regression.
- `33087319123` / `4ef95a5...`: SUCCESS for prior code/index state.
- `33087625052` / `f7419f3...`: SUCCESS for prior code/index state.
- `33089165530` / `b86b33b2...`: SUCCESS for prior code/index state.
- `33089346132` / `c2f4a019...`: SUCCESS, exact-head quality CI for pre-F48 state.

## Active execution matrix
| Front | State | Next proof |
|---|---|---|
| Exact-head CI | ACTIVE | fresh quality CI for resulting tip |
| Receivables | ACTIVE | zero-consumer + >page-size runtime |
| Dashboard secondary | ACTIVE | zero-consumer legacy removal + runtime |
| Analytics presentation | REGRESSION-WIRED | exact-head CI + incomplete-data runtime |
| Profitability | ACTIVE | explicit financial contract + cross-surface equivalence |
| Export | ACTIVE | full consumer inventory + pagination regression |
| BI/Decision/Analytics | ACTIVE | invariant regression + runtime equivalence |
| Tenant siblings | CI VERIFIED / LIVE OPEN | Storage/Realtime/AI/vector A/B drills |
| Worker reliability | CI VERIFIED / LIVE OPEN | crash/restart/stale lease/duplicate/DLQ/resume |
| NULL semantics | ACTIVE | global implicit conversion sweep |
| Documents | ACTIVE | real corpus execution |
| Runtime/LIVE | BLOCKED | deployment/authenticated environment |
| Production certification | BLOCKED | LIVE + production evidence |

## Completion percentage — evidence-weighted
**Current engineering completion estimate: ~71%.** This is not a certification score. Core implementation/regression/gating is advanced; consumer verification is partial; runtime/live/production evidence is largely absent.

Lifecycle truth: IMPLEMENTED **high** · REGRESSION-ENFORCED **high** · GATED **historically high, current tip pending** · INTEGRATED **substantial** · CONSUMER-VERIFIED **partial** · RUNTIME-EVIDENCED **NONE** · LIVE-VERIFIED **NOT VERIFIED** · PRODUCTION-CERTIFIED **NOT CERTIFIED**.

## Next autonomous wave
1. Fresh exact-head quality CI for the resulting index tip; record only that SHA.
2. Receivables zero-consumer inventory and safe legacy proof.
3. Cross-surface invariant regression for tenant/date/as-of/status/NULL semantics.
4. Repository-wide exporter consumer classification and pagination→export regression.
5. Tenant Storage/Realtime/AI/vector sibling hardening.
6. Worker state-machine recovery analysis and LIVE harness.
7. Repository-wide NULL/UNKNOWN/MISSING/ZERO semantic sweep.
8. Convert CI-stable families into concrete runtime drills; never label LIVE without evidence.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Prior CI success proves `c2f4a019...` only. Current resulting tip is pending fresh exact-head CI. Runtime/live/production evidence remains absent.