# Gross Profit Truth Root Cause — 2026-08-26

## Scope

Baseline: `b1decc512a1f4a7141158c6ce529c1ab14aae7d9`

This record intentionally does not reuse an older CI run as evidence for the new closure HEAD.

## Finding

There are competing revenue/gross-profit definitions across consumers.

### Domain/schema facts

- `sales_invoices.subtotal` exists separately from `discount_amount`, `tax_amount`, and `total`.
- `sale_items.line_total` exists separately from quantity, unit price, line discount, line tax, and cost price.
- `sale_items.cost_price` is the recorded unit cost used by the executive metric calculation.
- The established metric contract defines revenue as `SUM(sale_items.line_total)` for non-cancelled/non-void invoices in scope.

### Conflicting consumers

1. `supabase/migrations/20260819210000_executive_metrics.sql` computes revenue from `SUM(sale_items.line_total)` and gross profit as revenue minus `SUM(quantity * cost_price)`.
2. `docs/metric-contract.md` defines the same line-item revenue semantics.
3. `src/lib/semanticMetrics.ts` defines gross profit from `SUM(sale_items.line_total - cost_price * quantity)`.
4. `src/lib/queries.ts` dashboard KPI currently computes `totalSales` from `sales_invoices.subtotal`, then subtracts line-item cost.
5. `src/lib/queries.ts` monthly trend also uses invoice `subtotal` for sales while using line-item cost.

## Root cause

**REAL BUG — competing financial truth contracts.**

The problem is not proven to be that `subtotal` is mathematically wrong in every dataset. The proven defect is that consumers do not use one canonical revenue boundary. Therefore gross profit can diverge whenever invoice subtotal and the sum of line totals differ (for example because their discount/tax semantics or persisted values differ).

## Required canonical rule

Until domain evidence proves a different invariant, the existing executable metric contract is the authoritative business truth:

`Revenue = SUM(sale_items.line_total)`

`Cost of Sales = SUM(sale_items.quantity * sale_items.cost_price)`

`Gross Profit = Revenue - Cost of Sales`

`NULL/MISSING/UNKNOWN != 0`

A metric with missing required financial inputs is `INSUFFICIENT_DATA`, not zero.

## Current disposition

- Root cause: **IDENTIFIED**
- Canonical formula: **ESTABLISHED FROM EXISTING EXECUTABLE CONTRACT**
- Guard/regression: **IMPLEMENTED**
- Dashboard consumer migration: **NOT YET FIXED**
- Exact-head CI for the migration: **PENDING**
- Runtime proof: **NOT PROVEN**
- Production certification: **NOT PRODUCTION CERTIFIED**

The guard is deliberately fail-closed: it detects the remaining dashboard `subtotal` consumer instead of allowing the inconsistency to become silently accepted.
