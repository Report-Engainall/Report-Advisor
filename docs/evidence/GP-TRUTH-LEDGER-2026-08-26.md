# Gross Profit Truth Closure Ledger — 2026-08-26

Append-only record. Never treat an earlier PASS as evidence for a later HEAD.

## FIND — semantic divergence

Production KPI previously summed `sale_items.line_total`, while semantic metric defined `net_sales = SUM(sales_invoices.total)`.

## ROOT CAUSE

There was no single executable Gross Profit financial truth contract. Invoice total and line totals were allowed to become competing revenue sources.

## FIX

Introduced `src/lib/grossProfitTruthCore.ts` and `src/lib/grossProfitTruth.ts`.

Canonical contract now:
- Revenue: one `sales_invoices.total` per approved invoice (`confirmed`, `posted`, `paid`).
- Cost: `SUM(sale_items.cost_price * quantity)`.
- Gross profit: revenue minus cost.
- Invoice total is counted once even when an invoice has multiple sale_items.
- NULL invoice total or missing cost propagates to NULL; it is never coerced to zero.
- `invoice_date` start/end boundaries are inclusive.
- Draft invoices are excluded.

`src/lib/semanticMetrics.ts` was aligned to this contract.

## REGRESSION

Independent fixture regression covers:
- multi-line invoice total counted once;
- draft exclusion;
- NULL cost propagation;
- NULL revenue propagation;
- start boundary included;
- end boundary included;
- complete revenue/cost/gross-profit arithmetic.

Exact-head semantic regression run for `1e627074...` passed: run `32952053330`.

## FIX — Dashboard / Reports / Export / Executive topology

- Dashboard `fetchDashboardKPIs(options)` now consumes canonical Gross Profit truth and accepts date bounds.
- Reports has a real XLSX Download handler.
- Export loads the complete dataset with pagination, independent of the 20-row presentation page, and records an Evidence sheet.
- Executive UI directly invokes `runExecutivePipeline()` using production KPI-derived inputs.
- `KPICard` renders unknown financial values as `—`, not zero.

## STATIC CI

Exact HEAD checkout was proven by the certification job before typecheck.
Static GP surface audit passed its executable checks on `1e627074...` but correctly left runtime-dependent claims NOT PROVEN.

## CI FINDING

Repository-wide `npm run typecheck` remains red for numerous pre-existing unrelated modules (missing Vitest types, import pipeline symbols, decision-score symbols, report execution symbols, etc.). GP-specific nullable KPI changes also surfaced type errors in Dashboard/Executive consumers. No attempt was made to hide these errors or declare global CI green.

Classification: `CI REPOSITORY-WIDE BLOCKER — NOT AN EXTERNAL RUNTIME BLOCKER`.

## RUNTIME

Phase-E exact HEAD run `32952053382` reached the actual Gross Profit runtime boundary after passing production SaaS contract, source secret audit, and static GP audit.

The runtime process fail-closed because all six required certification variables were empty:
- `CERT_SUPABASE_URL`
- `CERT_SUPABASE_ANON_KEY`
- `CERT_TENANT_A_ID`
- `CERT_TENANT_B_ID`
- `CERT_USER_A_JWT`
- `CERT_USER_B_JWT`

No JWT or secret value was logged.

Classification: `EXTERNAL BLOCKER / OWNER ACTION REQUIRED / NOT PROVEN`.

## CURRENT CLOSURE

Gross Profit remains:

`NOT PROVEN`

because authenticated runtime, 25>20 live export evidence, and cross-surface equivalence have not executed.
