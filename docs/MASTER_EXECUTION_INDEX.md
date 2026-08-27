# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> Evidence states are separate: IMPLEMENTED → REGRESSION-ENFORCED → GATED → INTEGRATED → CONSUMER-VERIFIED → RUNTIME-EVIDENCED → LIVE-VERIFIED → PRODUCTION-CERTIFIED. No promotion without evidence on the exact SHA.

## Current evidence snapshot
- Code HEAD for F50: `95175d5fbe56acb78b83e6f2285aa6412a443687`.
- Exact-head Quality Run: `33093195928`, Job `98591209955`, SHA `95175d5fbe56acb78b83e6f2285aa6412a443687`, **SUCCESS**.
- F49 code evidence remains valid only for `157af422...`; it is not promoted to F50.
- This index update changes the branch tip; its resulting SHA requires its own fresh exact-head CI. No PASS from `95175d5f...` is promoted to this new index SHA.

## F50 — Sales report cross-surface truth boundary
**IMPLEMENTED / REGRESSION-ENFORCED / INTEGRATED / CONSUMER MIGRATED / EXACT-HEAD CI VERIFIED on `95175d5f...`.**
- Finding: `SalesReportPage` summary cards consumed `fetchDashboardKPIs()` while the invoice table consumed a paginated sales dataset, creating separate domain truth paths.
- Root cause: sales-report presentation depended directly on a dashboard aggregate instead of a sales-domain canonical contract.
- Fix: added tenant-authoritative `report_sales_truth()`; added `fetchSalesReportTruth()` adapter; introduced `SalesReportPageCanonical`; migrated `/reports/sales` in `App.tsx` to the canonical page.
- Semantic contract: missing invoice total/paid evidence yields `INSUFFICIENT_DATA` and NULL financial totals; cancelled/canceled/void invoices are excluded server-side.
- Export classification: the sales page remains an explicit current-view export; pagination is not used to calculate summary truth.
- Regression: `scripts/check-sales-cross-surface-truth.mjs` verifies canonical adapter consumption, absence of dashboard KPI dependency in the sales page, tenant authority, fail-closed semantics, and current-view export labeling.
- Exact-head gate: Quality Run `33093195928` / Job `98591209955` succeeded on this exact SHA; the dedicated Sales cross-surface truth step passed before Typecheck/Lint/Build and the remaining quality chain.
- Remaining: Dashboard itself must converge to the same sales-domain source before BI ↔ Decision ↔ Analytics ↔ Export equivalence can be called closed; runtime/live proof remains required.

## F49 — Family liquidity profit-share fail-closed
**IMPLEMENTED / REGRESSION-ENFORCED / EXACT-HEAD CI VERIFIED on `157af422...`.**
- Finding: `totalProfit` previously treated missing family profit evidence as zero, allowing known families to receive a normalized `profitShare` despite incomplete coverage.
- Root cause: partial evidence was collapsed into a numeric denominator.
- Fix: `allHaveProfit` is now required; incomplete coverage produces `profitShare = null` and explicit `profit_share=INSUFFICIENT_DATA` evidence.
- Consumer family: family liquidity / commercial-priority analysis.
- Regression gate: `scripts/check-financial-aggregation-consumers.mjs` enforces the fail-closed contract and ran successfully in Quality Run `33091460802`.
- Runtime: not executed; live evidence remains required.

## F48 — Aging analytics fail-closed presentation
**IMPLEMENTED / REGRESSION-WIRED / historically CI VERIFIED on prior exact SHA.** Analytics derives `isCalculated` from canonical snapshot status and gates bucket data/chart rendering. Remaining: incomplete-real-data runtime and cross-surface equivalence.

## F47 — Receivables empty-page sentinel leakage
**FIXED / REGRESSION-WIRED / historically CI VERIFIED.** Adapter filters transport sentinel rows while retaining aggregate metadata. Remaining: real >page-size runtime, export equivalence and cross-surface proof.

## F46 — Dashboard secondary truth
**IMPLEMENTED / REAL CONSUMER MIGRATED / REGRESSION-ENFORCED / historically CI VERIFIED.** Remaining: zero-consumer legacy removal and runtime proof.

## F45 — Executive metrics compatibility removal
Zero-consumer scan found no runtime consumer for `get_executive_metrics(uuid,date,date)`; exact-signature drop migration added. Runtime migration execution remains separate evidence.

## Receivables Truth
**IMPLEMENTED / REGRESSION-ENFORCED / ROUTE CONSUMER MIGRATED.** Canonical `report_receivables_snapshot` owns aggregate truth independently of page boundaries and derives tenant from `current_company_id()`. Incomplete rows remain `INCOMPLETE`; missing financial evidence is `INSUFFICIENT_DATA`; `UNDATED` is explicit; cancelled/canceled/void are excluded. Remaining: zero-consumer legacy proof, >page-size runtime, export equivalence and cross-surface proof.

## Profitability Truth
**PARTIAL / FAIL-CLOSED.** Canonical `report_profitability_truth` derives tenant from `current_company_id()`; missing revenue/cost/quantity and multi-currency evidence fail closed to NULL totals. Remaining: explicit discounts/returns/currency-conversion/rounding contract and Dashboard/BI/Decision/Export equivalence.

## Export Truth
**PARTIAL.** Explicit scopes: `CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET`; browser report export is current-view; static gate detects ambiguous exporter names and pagination/client-aggregation mixing. Remaining: repository-wide consumer inventory, canonical full/filtered implementations, pagination→export regression.

## BI ↔ Decision ↔ Analytics ↔ Export
**OPEN.** No runtime evidence proves equivalent records/totals/counts/date/as-of/tenant/NULL semantics across all surfaces. Sales report summary now has its own canonical sales-domain boundary, but Dashboard still has an independent dashboard truth function; convergence remains required.

## Tenant Security sibling sweep
**REGRESSION-WIRED / CI VERIFIED on covered static contracts.** Static gates cover SECURITY DEFINER tenant authority and legacy consumer boundaries. This is not A/B runtime isolation proof.

## Worker / Reliability
**IMPLEMENTED / REGRESSION-WIRED / CI VERIFIED on covered static contracts / LIVE REQUIRED.** Durable runner uses deterministic `jobId:stage:sourceHash` idempotency keys; unsafe post-side-effect failures require manual reconciliation. Remaining: real crash/restart/stale lease/duplicate worker/DLQ/resume/receipt drills.

## Storage / Realtime / AI / Vector
**STATIC/CONTRACT ONLY — NO RUNTIME EVIDENCE.** Required: tenant A/B denial, signed URL isolation, realtime event isolation, vector metadata/retrieval/cache/deletion isolation.

## Semantic NULL / UNKNOWN / MISSING / ZERO
**ACTIVE.** F49 and F50 close concrete financial semantic conversions; repository-wide implicit conversion sweep remains open. Search inventory continues to show additional `?? 0` patterns in intelligence/analytics code and each must be classified as business-zero or insufficient-data before promotion.

## Document Intelligence
**REGRESSION/GATED FOUNDATION; REAL CORPUS NOT VERIFIED.** Real OCR/PDF/XLSX/CSV execution remains LIVE REQUIRED.

## Inventory / Data Truth
**IMPLEMENTED / REGRESSION-WIRED IN COVERED ROUTES; CROSS-SURFACE OPEN.**

## Database / Migration Safety
**ACTIVE.** Receivables replacement uses the exact existing function signature and preserves authenticated execute grants. Sales truth adds an exact no-argument `report_sales_truth()` SECURITY DEFINER function with explicit public revoke/authenticated grant and tenant derivation from `current_company_id()`. Full dependency/signature/grant/RLS/security-definer audit remains required.

## Runtime / LIVE evidence
**NO RUNTIME EVIDENCE.** Authenticated browser, tenant A/B DB+Storage+Realtime+AI/vector, worker recovery, native watcher, backup restore/RPO/RTO, real document corpus, production telemetry/load/canary/rollback and crypto matrix remain required.

## Production Certification
**NOT PRODUCTION CERTIFIED.** Static/CI evidence is insufficient.

## Historical evidence — retained, not promoted
- `33089346132` / `c2f4a019...`: SUCCESS for pre-F48 exact head.
- `33091051060` / `4fc80ec...`: SUCCESS for the index-only snapshot before F49.
- `33091460802` / `157af422...`: **SUCCESS, exact-head Quality for F49**.
- `33093195928` / `95175d5f...`: **SUCCESS, exact-head Quality for F50**.
- Prior failures remain retained in earlier index history and are not deleted by this snapshot.

## Active execution matrix
| Front | State | Next proof |
|---|---|---|
| Exact-head CI | ACTIVE | fresh quality CI for this resulting index tip |
| Receivables | ACTIVE | zero-consumer + >page-size runtime |
| Sales cross-surface | IMPLEMENTED / CI VERIFIED | Dashboard convergence + runtime equivalence |
| Analytics presentation | REGRESSION-WIRED | incomplete-data runtime |
| Profitability | ACTIVE | explicit financial contract + cross-surface equivalence |
| Export | ACTIVE | full consumer inventory + pagination regression |
| BI/Decision/Analytics | ACTIVE | invariant regression + runtime equivalence |
| Tenant siblings | CI VERIFIED / LIVE OPEN | Storage/Realtime/AI/vector A/B drills |
| Worker reliability | CI VERIFIED / LIVE OPEN | crash/restart/stale lease/duplicate/DLQ/resume |
| NULL semantics | ACTIVE | global implicit conversion classification/fixes |
| Documents | ACTIVE | real corpus execution |
| Runtime/LIVE | BLOCKED | deployment/authenticated environment |
| Production certification | BLOCKED | LIVE + production evidence |

## Completion percentage — evidence-weighted
**Current engineering completion estimate: ~73%.** F50 closes one real consumer source-of-truth boundary and is exact-head CI-gated; the estimate remains below the production threshold because cross-surface convergence, runtime/live proof, and production evidence are still materially incomplete.

Lifecycle truth: IMPLEMENTED **high** · REGRESSION-ENFORCED **high** · GATED **high on covered exact SHA, current index tip pending** · INTEGRATED **substantial** · CONSUMER-VERIFIED **partial-to-strong on covered routes** · RUNTIME-EVIDENCED **NONE** · LIVE-VERIFIED **NOT VERIFIED** · PRODUCTION-CERTIFIED **NOT CERTIFIED**.

## Next autonomous wave
1. Fresh exact-head quality CI for this resulting index tip; record only that SHA.
2. Dashboard convergence: make dashboard sales metrics consume the sales-domain canonical source or prove an explicit domain transformation.
3. Repository-wide financial `?? 0` / `|| 0` semantic classification and root-cause fixes.
4. Export consumer inventory and pagination→export regression.
5. Tenant Storage/Realtime/AI/vector adversarial runtime harness.
6. Worker state-machine recovery drills.
7. Document real-corpus execution harness.
8. Convert CI-stable families into concrete runtime drills; never label LIVE without evidence.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** F50 is CI-verified on `95175d5f...`; this new index commit itself is pending fresh exact-head CI. Runtime/live/production evidence remains absent.