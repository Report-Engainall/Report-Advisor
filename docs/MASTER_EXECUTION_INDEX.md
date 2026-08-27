# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> Evidence states are separate: IMPLEMENTED → REGRESSION-ENFORCED → GATED → INTEGRATED → CONSUMER-VERIFIED → RUNTIME-EVIDENCED → LIVE-VERIFIED → PRODUCTION-CERTIFIED. No promotion without evidence on the exact SHA.

## Current exact-head state
- Current code tip before this index commit: `bbef0a9afd86a1eefe26c3e70d2f78f1c7c1fdf5`.
- **No exact-head CI PASS is claimed for `bbef0a9...`.** The current SHA has no observable workflow/status result yet.
- Prior Run `33087625052` / Job `98571519282` succeeded only on its prior recorded SHA and is not evidence for `bbef0a9...`.
- This index update creates a new tip; that resulting tip must receive its own exact-head CI before any current-tip PASS claim.

## F47 — Receivables empty-page sentinel leakage
**FIXED / REGRESSION-WIRED / CURRENT-TIP CI PENDING.**
- Finding: the canonical Receivables RPC emits a metadata sentinel row when a requested page is empty, while the adapter previously mapped every returned row into `snapshot.rows`.
- Root cause: transport metadata and domain business rows were not separated at the adapter boundary.
- Fix: `src/lib/receivables-truth.ts` filters `row.id != null` before mapping business rows while retaining aggregate metadata from the first RPC row.
- Regression: `scripts/check-receivables-empty-page-contract.mjs` now requires the sentinel filter and includes an explicit sentinel fixture proving zero business rows are exposed.
- Remaining: exact-tip CI, real >page-size runtime proof, export equivalence and cross-surface evidence.

## F46 — Dashboard secondary truth
**IMPLEMENTED / REAL CONSUMER MIGRATED / REGRESSION-ENFORCED / PRIOR CI-PROVEN / CURRENT TIP PENDING.** `report_dashboard_secondary_truth(integer)` + `src/lib/dashboard-secondary-truth.ts` own secondary truth with `current_company_id()`. Legacy Dashboard secondary consumers are no longer imported. Remaining: zero-consumer legacy function removal and runtime proof.

## F45 — Executive metrics compatibility removal
- Zero-consumer scan found no runtime consumer for `get_executive_metrics(uuid,date,date)`.
- Exact-signature drop migration added.
- Run `33085041491` / Job `98562277560` on `89367a9...`: **SUCCESS** for F45 only.
- Runtime migration execution remains separate evidence.

## Receivables Truth
**IMPLEMENTED / REGRESSION-ENFORCED / ROUTE CONSUMER MIGRATED / CURRENT-TIP CI PENDING.**
- Canonical `report_receivables_snapshot` owns aggregate truth independently of page boundaries and derives tenant from `current_company_id()`.
- Incomplete rows are retained as `INCOMPLETE`; missing financial evidence produces `INSUFFICIENT_DATA`, not zero.
- `UNDATED` is explicit; cancelled/canceled/void are excluded.
- Source-level finding corrected: reporting `as-of` is enforced at invoice source and incomplete rows are counted consistently.
- New adapter-level F47 is fixed and regression-wired.
- Remaining: exact-tip CI, zero-consumer legacy removal, >page-size runtime proof, export equivalence and cross-surface proof.

## Profitability Truth
**PARTIAL / FAIL-CLOSED / CURRENT TIP PENDING.** Canonical `report_profitability_truth` derives tenant from `current_company_id()`; missing line revenue/cost/quantity or multi-currency evidence fails closed to NULL totals. Remaining: explicit discounts/returns/currency-conversion/rounding contract and equivalence across Dashboard/BI/Decision/Export.

## Export Truth
**PARTIAL.** Scope is explicit: `CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET`. Browser report export is explicitly current-view. Existing static export gate detects ambiguous exporter names and pagination/client-aggregation mixing. Remaining: repository-wide consumer inventory, canonical full/filtered implementations and pagination→export regression across every exporter.

## BI ↔ Decision ↔ Analytics ↔ Export
**OPEN.** Canonical BI/Analytics sources and Decision/Outcome hardening exist, but no runtime evidence proves equivalent records/totals/counts/date/as-of/tenant/NULL semantics across all surfaces.

## Tenant Security sibling sweep
**ACTIVE / HIGH RISK.** Existing browser/source and DB/RLS contracts remain active. New regression gate `test:tenant-sibling-boundaries` scans all SQL migrations for SECURITY DEFINER functions that accept caller-supplied tenant identity without `current_company_id()` or an explicit `TENANT_AUTHORITY: TRUSTED_INTERNAL` boundary. Gate is wired into `quality.yml` but is unexecuted on the current tip, so no PASS is claimed.

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
**ACTIVE.** Receivables replacement uses the exact existing function signature and preserves authenticated execute grants. Full dependency/signature/grant/RLS/security-definer audit remains required; the new sibling gate extends this sweep.

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
| Exact-head CI | ACTIVE | run CI for resulting current tip; no PASS yet |
| Receivables | ACTIVE | exact-tip CI + zero-consumer + >page-size runtime |
| Dashboard secondary | ACTIVE | zero-consumer legacy removal + runtime |
| Profitability | ACTIVE | financial contract + cross-surface equivalence |
| Export | ACTIVE | full consumer inventory + pagination regression |
| BI/Decision/Analytics | ACTIVE | invariant regression across surfaces |
| Tenant siblings | ACTIVE | execute new SQL sibling gate; then Storage/Realtime/AI/vector sweep |
| Worker reliability | ACTIVE | live failure/recovery drills |
| NULL semantics | ACTIVE | global implicit conversion sweep |
| Documents | ACTIVE | real corpus execution |
| Runtime/LIVE | BLOCKED | deployment/authenticated environment |
| Production certification | BLOCKED | required LIVE/production evidence |

## Next autonomous wave
1. Obtain exact-head CI for the resulting current tip and record only the exact SHA result.
2. If the tenant sibling gate fails, classify each SECURITY DEFINER boundary, fix at the source, add regression, and rerun on a new exact SHA.
3. Sweep Receivables legacy consumers and prove zero-consumer status before removal.
4. Build invariant-level cross-surface regression for tenant/date/as-of/status/NULL semantics.
5. Complete exporter consumer classification and pagination truncation regression.
6. Extend tenant sibling evidence into Storage/Realtime/AI/vector and background paths.
7. Complete worker state-machine recovery analysis and LIVE harness.
8. Convert CI-stable families into concrete runtime drills; do not label LIVE without evidence.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** F47 exposed and fixed a real adapter/domain-boundary defect; regression is wired. A new tenant SECURITY DEFINER sibling gate is wired but unexecuted. No runtime/live/production evidence is claimed. The resulting index tip requires its own exact-head CI.
