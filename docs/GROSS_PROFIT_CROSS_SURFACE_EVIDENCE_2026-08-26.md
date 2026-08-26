# Gross Profit Cross-Surface Evidence — 2026-08-26

## Scope

This evidence is on `hardening/gross-profit-truth-closure-f5` and must not be attributed to an older SHA or to the `main`-derived branch.

## Canonical truth

- Revenue: `SUM(sale_items.line_total)`
- Cost of Sales: `SUM(sale_items.cost_price * sale_items.quantity)` when every required cost is present.
- Gross Profit: `Revenue - Cost of Sales` only when cost data is complete.
- Missing/NULL required cost: `INSUFFICIENT_DATA`, never implicit zero.

## Deterministic fixture

The fixture covers:

- normal sale
- missing cost
- NULL cost
- discount-bearing row (discount semantics intentionally not applied to gross-profit formula)
- multiple invoices
- multiple customers
- inclusive start date boundary
- inclusive end date boundary
- tenant A/B isolation
- 25-row report-level export fixture against a 20-row presentation page

The fixture has two financial cases:

1. Complete Tenant-A subset: Revenue `630`, Cost `380`, Gross Profit `250`, Quantity `9`.
2. Full Tenant-A set containing missing cost: Revenue `705`, Cost `NULL`, Gross Profit `NULL`, Quantity `10`, status `INSUFFICIENT_DATA`.
3. Tenant-B set: Revenue `900`, Cost `540`, Gross Profit `360`, Quantity `9`.

## Consumer sweep

| Surface | Current source | Classification |
|---|---|---|
| Dashboard | canonical financial queries | CANONICAL |
| Executive Decision | canonical financial query after migration | CANONICAL |
| Reports / Sales | legacy `fetchDashboardKPIs` / `fetchMonthlyTrend` / `fetchTopCustomers` | DIVERGENT-BUG |
| Reports / Profitability | legacy KPI consumer; category calculation uses line-item formula | DIVERGENT-BUG / CANONICAL respectively |
| Monthly Trend consumer in Reports | legacy paginated/legacy query path | DIVERGENT-BUG |
| Top Customers consumer in Reports | legacy subtotal-based path | DIVERGENT-BUG |

## Evidence status

The deterministic fixture validates the reference calculation, NULL semantics, date boundaries, tenant partitioning, and export-size invariant. It is **not** by itself cross-surface runtime proof because Reports still contains divergent consumers. The consumer gate is intentionally fail-closed until those consumers are migrated.

## Required closure sequence

`DIVERGENT-BUG` consumers → canonical migration → deterministic fixture → actual surface/integration execution → exact-head CI → equivalence evidence.

## Explicit non-claims

- Cross-surface equivalence: NOT PROVEN.
- Runtime truth: NOT PROVEN.
- Production certification: NOT PROVEN.
- Discounts/Tax/Returns/Currency semantics: UNKNOWN unless independently established by domain evidence.
