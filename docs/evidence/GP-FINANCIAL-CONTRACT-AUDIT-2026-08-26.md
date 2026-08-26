# Gross Profit Financial Contract Audit — 2026-08-26

## Canonical fields

- Revenue source: `sales_invoices.total`, one value per approved invoice (`confirmed`, `posted`, `paid`).
- Cost source: `sale_items.cost_price * sale_items.quantity`, summed across lines for each approved invoice.
- Gross Profit: `Revenue - Cost`.
- Invoice date: `sales_invoices.invoice_date`; date-only end boundaries are inclusive through the following-day exclusive instant in the application contract.
- Tenant: `sales_invoices.company_id`, with child `sale_items` reached through the invoice IDs and database RLS enforcing company scope.
- Currency: `sales_invoices.currency`; mixed or missing currency is not aggregable and results in non-calculated financial output.
- Missing revenue/cost/quantity: propagated as `NULL` with `INSUFFICIENT_DATA`; no financial fallback to zero.

## Double-counting audit

The canonical core aggregates invoice revenue once by invoice ID while accumulating line costs. This protects a multi-line invoice header total from becoming `X + X + X`. Duplicate line IDs, when supplied to the core input, are treated as an integrity failure and prevent a calculated financial result.

## Discount / tax

The schema contains `subtotal`, `discount_amount`, `tax_amount`, and `total` on `sales_invoices`, and line-level discount/tax fields on `sale_items`. The current Gross Profit contract uses the persisted `sales_invoices.total` as the authoritative revenue amount and does not subtract discount or add/subtract tax again. This is safe against double adjustment only if `total` is already the finalized invoice amount. The repository does not currently expose a database invariant or a verified creation-path invariant proving `total = subtotal - discount + tax` (or another exact formula).

**Classification: BUSINESS CONTRACT / DATA INVARIANT GAP for tax/discount composition.** It does not justify inventing a new calculation inside Gross Profit.

## Returns / refunds

No dedicated returns/credit-note table or explicit return state was found in the reviewed core sales schema. Negative invoices are not established as the return contract. Therefore return treatment is **DEFERRED / NOT PROVEN**, not silently assumed.

## Currency

The schema stores invoice currency but no exchange-rate field on sales invoices. The current contract therefore supports aggregation only when all eligible invoices have the same non-null currency. Mixed currency is `UNSUPPORTED`; missing currency is `INSUFFICIENT_DATA`.

## Current consequence

Overall Gross Profit truth remains implementable for finalized invoice totals and line costs, but tax/discount composition and return semantics remain explicit contract limitations. These are not feature-expansion tasks; they must be resolved only if they are required by the business's actual Gross Profit definition.
