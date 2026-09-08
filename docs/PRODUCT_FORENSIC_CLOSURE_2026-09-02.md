# Product Forensic Closure — 2026-09-02

## Exact boundary
- Audit/repair origin HEAD: `ec6eb4cce7803af8e94697adfa6d9308f69a9ee2`
- Repair branch: `fix/product-rpc-contract-closure-20260902`
- Live Supabase project: `fnqbvfuwbdpwvhcgzksl`
- Scope: staging only; no Production binding mutation.

## Live database facts
- Public tables: 78
- Public tables with RLS: 78/78
- Public views: 0
- Public materialized views: 0
- Public triggers: 15
- Public constraints: 396
- Public indexes: 234
- Storage buckets: 0
- Storage object policies: 4
- Auth users: 2
- Auth identities: 2

## Confirmed product-data state
- companies: 2
- company_memberships: 2
- categories: 2
- products: 4
- customers: 3
- suppliers: 1
- warehouses: 0
- sales_invoices: 3
- sale_items: 3
- purchase_invoices: 1
- purchase_items: 1
- payments: 1
- inventory_balances: 1
- inventory_movements: 0
- imports: 0
- import_jobs: 0
- decision_work_items: 0
- decision_outcomes: 1
- recommendations: 1
- recommendation_outcomes: 0

## Confirmed defect and repair
Frontend canonical dashboard code called `get_profitability_snapshot`, while the live database did not expose that RPC. This was a confirmed frontend/RPC contract defect.

Implemented on the repair branch:
- `supabase/migrations/20260902070000_add_profitability_snapshot_rpc.sql`
- `supabase/migrations/20260902070100_harden_profitability_snapshot_rpc_execute_grant.sql`

The RPC:
- signature: `get_profitability_snapshot(date)`
- is `SECURITY INVOKER`
- requires `current_company_id()`
- returns the frontend `ProfitabilitySnapshot` JSON contract
- is executable by `authenticated`
- is not executable by `public` or `anon`

The live function was exercised under authenticated database JWT context and returned a tenant-scoped result. Current staging data correctly reports `INSUFFICIENT_DATA` when currency/data-quality conditions prevent a trustworthy profitability calculation.

## Stale test contract repaired
`dashboard-truth-adversarial-regression.mjs` incorrectly required the removed `get_dashboard_top_entities` frontend call even though the canonical adapter had already moved to `get_dashboard_snapshot`. The regression was updated to require the canonical snapshot and reject the obsolete frontend dependency.

## File-engine test repair
The file-security archive traversal test failed because `src/lib/file-engine/security.ts` used extensionless TypeScript imports under Node's `--experimental-strip-types` execution. Imports were made explicit with `.ts` extensions; no runtime behavior was changed.

## Fail-closed status
- Database structure: STRONG STRUCTURAL
- RLS coverage: PASS structurally
- Profitability RPC contract: REPAIRED; live function present and authenticated-only
- Dashboard obsolete-RPC regression: REPAIRED in source
- File-security Node test import defect: REPAIRED in source
- Storage product resource: BLOCKED/INCOMPLETE because live bucket count is 0
- Authenticated browser runtime: UNPROVEN
- Live Tenant A/B adversarial runtime: UNPROVEN
- Real import/sales/purchase/inventory business loop: UNPROVEN
- Production certification: NOT CLAIMED

## CI boundary
A fresh PR CI wave is running for the repaired branch. Historical CI evidence is not transferred to the new SHA. Production/certification failures remain separate from this product-contract repair and are not treated as product PASS.
