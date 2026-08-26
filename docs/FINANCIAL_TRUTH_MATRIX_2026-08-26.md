# Financial Truth Matrix — Gross Profit Closure

| Metric | Canonical truth | Missing/NULL | Classification |
|---|---|---|---|
| Revenue | `SUM(sale_items.line_total)` | INSUFFICIENT_DATA | CANONICAL |
| Cost of Sales | `SUM(sale_items.cost_price * sale_items.quantity)` | INSUFFICIENT_DATA | CANONICAL |
| Gross Profit | Revenue - Cost of Sales | INSUFFICIENT_DATA | CANONICAL |
| Discounts | invoice/item discount fields remain separate until domain contract proves inclusion | UNKNOWN | UNKNOWN |
| Tax | `tax_amount` remains separate; no inclusion inferred | UNKNOWN | UNKNOWN |
| Returns | no proven return/credit-note semantic found in this closure | UNKNOWN | UNKNOWN |
| Quantity | `sale_items.quantity` | INSUFFICIENT_DATA | CANONICAL |
| Date boundaries | `invoice_date`, inclusive `from <= date <= to` where contract specifies | invalid => fail closed | CANONICAL |
| Tenant | company/RLS scope | missing tenant => fail closed | CANONICAL |
| Currency | no proven conversion policy | UNKNOWN | UNKNOWN |
| Rounding | no intermediate rounding; presentation rounding only unless domain contract says otherwise | N/A | CANONICAL |

## Non-equivalence fixture

`invoice subtotal = 140`, line totals `100 + 50 = 150`, cost `80` => canonical GP `70`; subtotal GP `60`. Therefore subtotal and line-total revenue are not interchangeable without an explicit invariant.

## Consumer classifications

- `semanticMetrics.net_sales`: CANONICAL after migration.
- `semanticMetrics.gross_profit`: CANONICAL.
- Dashboard KPI: DIVERGENT-BUG → migrated to canonical query.
- Dashboard monthly trend: DIVERGENT-BUG → migrated to canonical query.
- Dashboard top customers: DIVERGENT-BUT-VALID was not assumed; dashboard path now uses line-item revenue.
- Top products/category breakdown: CANONICAL line-item basis.
- Executive SQL: CANONICAL line-item revenue and line-item cost.
- `financialIntelligence`: ENGINE-ONLY; formula is `revenue - costOfSales` over caller-provided inputs and therefore requires caller provenance.

`NULL/MISSING/UNKNOWN` are never equivalent to zero.

This is a contract/classification artifact, not runtime proof.
