# Gross Profit Financial Contract Audit — 2026-08-26

## Scope
P0 Gross Profit only. No discount/tax/returns feature expansion is introduced by this audit.

## Source contract
The current schema defines `sales_invoices` with:
- `subtotal`
- `discount_amount`
- `tax_amount`
- `total`

The schema does not declare a database CHECK constraint or generated expression proving how `total` is derived from those fields. `sale_items` separately stores `quantity`, `unit_price`, `discount_amount`, `tax_amount`, `line_total`, and `cost_price`.

Therefore the repository itself proves the existence of the fields, but does **not** prove the arithmetic invariant `total = subtotal - discount + tax` (or any alternative) at database level.

## Canonical Gross Profit decision for this closure
Revenue source: **one `sales_invoices.total` per approved invoice** (`confirmed`, `posted`, `paid`).

Cost source: **`sale_items.cost_price × sale_items.quantity` summed per invoice**.

Gross Profit: **canonical revenue − canonical cost**.

An invoice header is counted exactly once even when it has multiple `sale_items`.

## Discount semantics
`discount_amount` is already reflected in `sales_invoices.total` when `total` is the posted invoice total. Gross Profit therefore does not subtract `discount_amount` a second time.

## Tax semantics — unresolved source-contract boundary
The schema contains `tax_amount`, and the existing semantic metric documentation states that tax remains part of `sales_invoices.total`. However, there is no database-level invariant or executable invoice-calculation contract in the inspected source proving whether this tax is a pass-through tax that should be excluded from accounting revenue or a tax-inclusive commercial amount that belongs in the product's Gross Profit revenue definition.

**Classification: FINANCIAL CONTRACT GAP, not a runtime blocker.**

For this P0 closure we retain the existing product contract (`sales_invoices.total`) rather than inventing a tax treatment. This means Gross Profit can only become `TRUTH-PROVEN` against the repository's stated contract, not against an unproven external accounting policy.

## Status semantics
Approved statuses are exactly `confirmed`, `posted`, and `paid`. `draft` is excluded. No `cancelled`/`void` status is included because the current schema does not define those statuses as a constrained enum and no executable cancellation/return ledger was found in this contract.

## NULL semantics
- Missing invoice total => `revenue = NULL` and `status = INSUFFICIENT_DATA`.
- Missing cost for any contributing line => `cost = NULL`, `grossProfit = NULL`, `status = INSUFFICIENT_DATA`.
- `NULL` is never converted to `0`.

## Date semantics
`invoice_date >= startDate` and `invoice_date <= endDate`; both boundaries are inclusive.

## Tenant semantics
The production query relies on Supabase/RLS for tenant isolation. A `company_id` column is retained in the evidence model, but source/static presence is not accepted as runtime tenant proof.

## Evidence rule
No runtime claim is promoted by this document. Authenticated Dashboard/Reports/Executive/Export and tenant A/B evidence remain runtime-dependent.
