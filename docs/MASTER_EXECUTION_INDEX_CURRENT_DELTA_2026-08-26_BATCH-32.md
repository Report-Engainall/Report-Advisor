# Master Execution Index — Batch 32

## Exact state
- Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`
- Previous exact HEAD: `8e84ef2c3869d7a6b7a89872cb2ddf730ff7520a`
- Current Code HEAD: `fbafd36b981405f9763b1ae4c89b45be59449686`
- PR: #45
- Branch: `wave/parallel-compat-closure-20260826`

## Failure Family: Report business aggregation / display pagination

### FIND
`ReportsPage.tsx` was deriving purchase totals from `fetchPurchaseInvoices(0,20)` and inventory value/count/low-stock/out-of-stock metrics from the client dataset. Missing inventory quantity/cost was coerced into zero for valuation.

### ROOT CAUSE
Display retrieval and business aggregation were coupled in the report page. Page-size semantics could therefore become business truth.

### FIX
- Added `report_purchase_summary()` with session-derived tenant authority and server-side totals/counts/supplier count/average.
- Added canonical `report_inventory_snapshot()` with server-side totals, valuation, incomplete-row count, low-stock count, out-of-stock count and bounded display page.
- Migrated `ReportsPage.tsx` to consume `fetchPurchaseReportSummary()` and `fetchInventoryReportSnapshot()`.
- Business cards no longer reduce the display page.
- Missing inventory valuation remains `NULL`/`INSUFFICIENT_DATA`; it is not converted to zero.
- Export labels were changed to explicitly identify the current-page export where full export truth has not yet been migrated.

### REGRESSION
`check-report-truth-contract.mjs` now requires the canonical report snapshot consumers and rejects the old first-page/browser-reduction patterns.

### STATUS
**IMPLEMENTED / CONSUMER MIGRATED / REGRESSION ENFORCED / CI PENDING**.

## Failure Family: Inventory intelligence tenant authority

### STATUS
**IMPLEMENTED / REGRESSION ENFORCED / EXACT-HEAD CI PENDING**.

The previous exact-head evidence at `8e84ef2...` had integrity-batch, batch-integrity-guards, production-chain-guard, file-engine-header-contract, file-intelligence-security and ci-bootstrap-smoke all PASS on that exact SHA. Quality was still IN_PROGRESS at that SHA. Those results do not certify `fbafd36...`.

## CI state
For current `fbafd36...`, the GitHub Actions query currently returns `0 runs` for this SHA. Therefore current CI is **NOT OBSERVABLE**, not PASS.

## Runtime / LIVE / Production
- Runtime evidence: none for the new report consumer path.
- LIVE: `LIVE REQUIRED` for deployed authenticated browser + real tenant/database behavior.
- Production certification: **NOT CLAIMED**.

## Remaining gaps in this family
1. Full export truth still requires a canonical server-side export contract rather than current-page export.
2. Receivables and profitability still contain client-side aggregations that need the same cross-surface treatment.
3. Cross-surface equivalence with BI/Decision/Analytics remains open.
4. Exact-head quality/typecheck certification for `fbafd36...` is pending/not observable.
