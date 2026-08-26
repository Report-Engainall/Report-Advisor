# Financial Truth Matrix — 2026-08-26

## Canonical boundary

| Metric | Canonical source/formula | Missing-data rule | Status |
|---|---|---|---|
| Revenue | `SUM(sale_items.line_total)` over the same invoice scope | NULL/MISSING line item => INSUFFICIENT_DATA | CANONICAL |
| Cost of Sales | `SUM(sale_items.cost_price * sale_items.quantity)` over the same invoice scope | missing cost or quantity => INSUFFICIENT_DATA | CANONICAL |
| Gross Profit | `Revenue - Cost of Sales` | not calculable when either component is insufficient | CANONICAL |
| Gross Margin | `Gross Profit / Revenue * 100` when Revenue != 0 | zero revenue => not calculable | CANONICAL |
| Discounts | Invoice/item discount fields are retained as separate facts; no silent subtraction unless the consumer contract explicitly requires it | missing => UNKNOWN, not zero | UNKNOWN pending complete domain reconciliation |
| Tax | `tax_amount` is a separate invoice fact; no inclusion/exclusion is inferred | missing => UNKNOWN | UNKNOWN pending complete domain reconciliation |
| Returns | No proven return/credit-note business source was established in this sweep | do not infer from cancellation | UNKNOWN |
| Quantity | `sale_items.quantity` for sales line-item scope | missing => INSUFFICIENT_DATA for dependent metrics | CANONICAL |
| Date boundary | `sales_invoices.invoice_date`; inclusive `from <= date <= to` in the executive SQL contract | missing/invalid date => invalid data | CANONICAL |
| Tenant scope | RLS/company scope; canonical SQL requires `p_company_id` | missing tenant => fail closed | CANONICAL |
| Currency | Schema/business contract does not establish a multi-currency conversion rule in this closure | currency ambiguity => UNKNOWN | UNKNOWN |
| Rounding | DB money fields use numeric precision; KPI formula does not round intermediate values | rounding only at presentation unless domain says otherwise | CANONICAL boundary / presentation rounding allowed |

## Financial statuses

`CALCULABLE` = all required financial inputs are present and valid.

`INSUFFICIENT_DATA` = required input is absent/invalid; result remains null rather than zero.

`UNKNOWN` = domain semantics have not been proven; no implementation guess is allowed.

`EXCLUDED` = explicitly excluded by the domain contract (for example, cancelled/void records where the authoritative query contract says so).

## Consumer sweep

| Consumer | Revenue basis | Cost basis | Classification | Action |
|---|---|---|---|---|
| `src/lib/semanticMetrics.ts::net_sales` | `sale_items.line_total` | N/A | CANONICAL | aligned |
| `src/lib/semanticMetrics.ts::gross_profit` | `sale_items.line_total` | `cost_price * quantity` | CANONICAL | aligned |
| `src/lib/queries.ts::fetchDashboardKPIs` | `sales_invoices.subtotal` | `cost_price * quantity` | DIVERGENT-BUG | superseded by canonical dashboard consumer; regression guard required |
| `src/lib/queries.ts::fetchMonthlyTrend` | `sales_invoices.subtotal` | `cost_price * quantity` | DIVERGENT-BUG | superseded by canonical dashboard consumer; regression guard required |
| `src/lib/queries.ts::fetchTopCustomers` | `sales_invoices.subtotal` | N/A | DIVERGENT-BUT-VALID pending invoice-level customer-report contract | not used by Dashboard after migration; do not silently change until domain contract proves intended basis |
| `src/lib/queries.ts::fetchTopProducts` | `sale_items.line_total` | N/A | CANONICAL | no change |
| `src/lib/queries.ts::fetchCategoryBreakdown` | `sale_items.line_total` | `cost_price * quantity` | CANONICAL | no change |
| `src/lib/intelligence/financialIntelligence.ts` | caller-provided | caller-provided | PRESENTATION/ENGINE-ONLY | requires caller provenance; no formula inferred here |
| `supabase ... get_executive_metrics` | `sale_items.line_total` | `quantity * cost_price` | CANONICAL | aligned |

## Gross Profit proof fixture

Fixture A:
- line totals: 100 + 50
- cost: 60 + 20
- canonical revenue = 150
- canonical cost = 80
- canonical gross profit = 70

Fixture B (demonstrates non-equivalence):
- invoice subtotal = 140
- line totals = 150
- cost = 80
- canonical gross profit = 70
- subtotal-based gross profit = 60

Therefore `sales_invoices.subtotal` and `SUM(sale_items.line_total)` cannot be treated as equivalent without an explicit domain invariant proving equality.

## Proof state

This matrix is a truth contract and classification ledger. It is **not** itself runtime proof. Exact-head CI and cross-surface execution remain required before declaring Gross Profit Truth fully closed.
