# Gross Profit Report Semantic Gap — 2026-08-26

## FIND
`src/lib/queries.ts` contains report-level aggregations that use `sale_items.line_total` directly (`fetchTopCustomers`, `fetchTopProducts`, `fetchCategoryBreakdown`, and monthly trend sales), while the canonical Gross Profit contract uses one `sales_invoices.total` per approved invoice.

## ROOT CAUSE
These report-specific aggregations predate the canonical invoice-header revenue contract and do not define how an invoice header total should be allocated back to individual lines/categories/customers when discounts or taxes make header total differ from the sum of line totals.

## DECISION
Do not invent an allocation formula. The Dashboard KPI / canonical Gross Profit consumer remains the truth source for overall revenue and Gross Profit. Reports that expose line-level/category profitability are not independent Gross Profit truth proof until an explicit allocation contract exists.

## CLASSIFICATION
REPORT GP BREAKDOWN = BUSINESS CONTRACT GAP / NOT PROVEN.

This does not invalidate the canonical overall Gross Profit calculation; it prevents a report-specific breakdown from being falsely promoted to cross-surface equivalence.

## RUNTIME
Authenticated runtime is still blocked by the six CERT_* inputs, so no report surface is promoted to runtime-proven.