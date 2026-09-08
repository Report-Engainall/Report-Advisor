# In-Batch Import Resolution Closure — 2026-09-08

## Scope

Closed the remaining client-side truth gap in universal import resolution: incoming rows that share the same normalized business identity are now resolved against earlier rows in the same batch before the import reaches the server write boundary.

## Behavior

- Exact duplicate in the same incoming batch: first row remains `new`; later row becomes `candidate_duplicate` and points to the first incoming row.
- Same normalized identity with changed content in the same incoming batch: later row becomes `conflict` and points to the first incoming row.
- Existing tenant row with the same normalized identity and changed content remains `conflict`.
- Existing exact row remains `skip_exact`.
- Server-side duplicate/conflict gates remain authoritative; this change does not grant client write authority.

## Identity policy

- Products: `sku`.
- Invoices: `invoice_number`.
- Customers: `code` or `name` according to the dataset identity columns.
- Other datasets fall back to stable identifier fields (`sku`, `code`, `invoice_number`, `id`) when present.

## Evidence contract

`scripts/check-universal-intelligence-inbatch-resolution.mjs` covers:

1. exact duplicate within one incoming product batch;
2. same SKU with changed product name within one incoming batch;
3. same SKU against an existing canonical row with changed content.

## Commit chain

- Resolution implementation: `b3509eb315801845eec1910005ba6de7a0f84d09`
- Contract test: `0c4cd3a0f13b483a13e12f02e617bbeaefe7868f`

## Explicit nonclaims

This is a code/contract closure only. It is not an authenticated browser E2E PASS, not a live Tenant A/B isolation certification, and not a production runtime certification.
