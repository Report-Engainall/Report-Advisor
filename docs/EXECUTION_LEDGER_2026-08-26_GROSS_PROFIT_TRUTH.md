# Execution Evidence Ledger — Gross Profit Truth Closure

## Starting point

Previous certified context: `f5c706c40feb433a80f871476a6de5ca9ef63163`.
This branch intentionally does not treat that SHA as evidence for the new work.

## Root-cause family

`GP-TRUTH-001`

Finding: Dashboard/semantic financial consumers contained more than one revenue basis.

Canonical: `SUM(sale_items.line_total)`.

Divergent: `SUM(sales_invoices.subtotal)`.

Proof of non-equivalence: an invoice can have subtotal 140 while its line totals sum to 150; subtracting the same cost 80 yields 60 versus canonical 70. No domain invariant proves equality.

## Changes

- `898bb432472832e9aff720c3efcde2dea0ff8277` — semantic net-sales contract aligned to line-item revenue.
- `a35d32343bbb76bcc44f541cfe661c898e25d51d` — canonical financial query consumers added for dashboard KPI, monthly trend and customer revenue.
- `634fb694004a269b1acd794565e6a71bd75237ca` — Dashboard migrated to canonical consumers.
- `66a31b684e2b2f5d7c558d40874155099ba274b0` — Financial Truth Matrix and consumer classification ledger added.
- `965bb832f4a8b9705b078674696da6217ee03b2a` — Gross Profit consumer regression gate added.
- `c5e315f9c7c98c2c8cd525623ef95fed95c5193d` — regression gate registered without changing existing toolchain versions.

## Classification

| Finding | Classification | State |
|---|---|---|
| semantic `net_sales` used invoice subtotal | DIVERGENT-BUG | FIXED in branch |
| Dashboard KPI used invoice subtotal | DIVERGENT-BUG | FIXED in branch |
| Dashboard monthly trend used invoice subtotal | DIVERGENT-BUG | FIXED in branch |
| Dashboard top-customer revenue used invoice subtotal | DIVERGENT-BUT-VALID pending domain contract | removed from Dashboard consumer path; legacy function remains unproven |
| Top-product/category revenue | CANONICAL | unchanged |
| Executive SQL revenue/COGS | CANONICAL | unchanged |
| Financial intelligence arithmetic | PRESENTATION/ENGINE-ONLY | no source semantics inferred |

## Required proof not yet present

- local regression execution result on this exact branch HEAD
- Exact-head GitHub Actions Quality PASS
- Exact-head Production-chain PASS
- cross-surface fixture execution
- authenticated runtime evidence

Therefore this ledger explicitly does **NOT** mark Gross Profit Truth as TRUTH-PROVEN or PRODUCTION-CERTIFIED yet.
