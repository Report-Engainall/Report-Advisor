# Master Execution Index — Current Delta — 2026-08-26 — Gross Profit

## Scope

Continuation of PR #49 on `hardening/gross-profit-truth-closure-f5`. Historical SHAs are not certification evidence for this delta.

## HEAD chain

- Starting point requested: `b4ee47691a6903d6f22dafa16bfd196631111db0`.
- `67dc6991ae30101d71184f20d43098154c9d9b1f`: Reports migration + full-report export path was committed; exact-head Quality run `32947648998` exposed an existing JSX defect in `ExecutiveCommandCenterPage` and therefore did not certify this HEAD.
- `6f1761788e7ae6652edc53ecd6b179a289eaeb32`: fixed that real CI failure in `ExecutiveCommandCenterPage.tsx`.

## Evidence

### Run `32947648998` — HEAD `67dc6991...`

- checkout identity: PASS
- topology: PASS
- gross-profit truth consumer regression: PASS
- report-truth: PASS
- typecheck: FAIL — `ExecutiveCommandCenterPage.tsx(25,1430): JSX element 'div' has no corresponding closing tag`
- lint: FAIL on same JSX parse error
- build: FAIL as downstream consequence of same JSX syntax defect
- performance: FAIL because build did not produce `dist/index.html`; classified as downstream consequence, not an independent root cause.

### Root cause / fix

`ExecutiveCommandCenterPage.tsx` had an unbalanced JSX tree around the command-center sections. The closing structure was repaired without changing the canonical financial source. This is a genuine current-HEAD failure and is not attributed to an older SHA.

## Gross Profit consumer closure work

Reports sales consumers were migrated from:

- `fetchDashboardKPIs`
- `fetchMonthlyTrend`
- `fetchTopCustomers`

To:

- `fetchCanonicalDashboardKPIs`
- `fetchCanonicalMonthlyTrend`
- `fetchCanonicalTopCustomers`

The sales report export now uses `fetchAllSalesInvoicesForReportExport`, which pages through the complete dataset independently of the presentation page size.

Canonical financial formula remains:

- Revenue = `SUM(sale_items.line_total)`
- Cost = `SUM(sale_items.cost_price * sale_items.quantity)` when required cost data is complete.
- Gross Profit = Revenue - Cost.
- Missing/NULL required cost => `INSUFFICIENT_DATA`, never zero.

## Deterministic fixture

The fixture covers normal sales, missing cost, NULL cost, discount-bearing row, multiple invoices/customers, date boundaries, tenant A/B and 25 export rows versus a 20-row presentation page. Its reference values are:

- Tenant A complete: Revenue 630, Cost 380, Gross Profit 250, Quantity 9.
- Tenant A with missing cost: Revenue 705, Cost NULL, Gross Profit NULL, Quantity 10, `INSUFFICIENT_DATA`.
- Tenant B: Revenue 900, Cost 540, Gross Profit 360, Quantity 9.

Important: the existing fixture is deterministic business-truth validation, not authenticated browser/runtime proof. Cross-surface runtime equivalence therefore remains NOT PROVEN until actual surface execution is available.

## Current classification

- Root Cause: PROVEN.
- Reports divergent consumers: FIXED in source.
- Export presentation-page coupling: FIXED in source for Sales Report export.
- Regression gate: PASS on HEAD `67dc699...` before the later JSX fix; must be re-run for `6f176178...`.
- Exact-head CI for `6f176178...`: IN PROGRESS / not yet certified at ledger write time.
- Numeric cross-surface equivalence: NOT PROVEN.
- Runtime tenant isolation: NOT PROVEN.
- Production certification: NOT PROVEN.

## Non-claims

Discounts, Tax, Returns, and Currency semantics remain UNKNOWN and are intentionally untouched.
