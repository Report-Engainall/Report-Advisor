# Master Execution Index — Current Delta — Batch #44

Repository: `Report-Engainall/Report-Advisor`
Branch: `fix/inventory-report-truth`

## Batch #44 — Inventory Intelligence authoritative server boundary

### Finding
`InventoryIntelligencePage.tsx` had been migrated behind an application adapter, but the adapter still performed direct browser reads and delegated demand aggregation to `fetchProductDemandSeries()`. That left business truth below the canonical boundary and left the demand path exposed to application-side aggregation.

### Root cause
The previous canonical adapter was only a client/application boundary. It did not provide an authoritative server-side snapshot for stock, sales demand, analysis window, status semantics, and tenant authority.

### Canonical fix
Added:
`supabase/migrations/20260827200000_inventory_intelligence_authoritative_snapshot.sql`

The new `public.inventory_intelligence_snapshot(date, integer)` RPC:
- derives tenant identity from `public.current_company_id()`;
- does not accept a client-supplied company id;
- computes stock and sales demand server-side;
- bounds demand by `p_as_of` and `p_days`;
- explicitly restricts sales status to `confirmed`, `posted`, `paid`;
- exposes `stock_units`, `net_sales_units`, `daily_demand`, and `group_id`;
- is `SECURITY DEFINER` with `search_path = public`;
- revokes PUBLIC execution and grants execution only to `authenticated`.

### Consumer migration
`src/lib/free-toolbox/inventory-intelligence-canonical.ts` now consumes only:
`supabase.rpc('inventory_intelligence_snapshot', ...)`

It no longer imports or calls `resolveCurrentCompanyId`, `supabase.from(...)`, or `fetchProductDemandSeries`.

The real UI consumer remains:
`src/pages/InventoryIntelligencePage.tsx`

### Regression
Strengthened:
`scripts/check-inventory-intelligence-truth.mjs`

The regression now requires:
- real page → canonical adapter wiring;
- zero direct page data reads;
- zero page business aggregation;
- canonical adapter → authoritative RPC;
- no direct Supabase reads in the adapter;
- explicit `Number.isFinite` and `Number.NaN` semantics;
- authoritative RPC existence;
- `current_company_id()` tenant derivation;
- `SECURITY DEFINER` and pinned search path;
- PUBLIC execute revocation and authenticated grant;
- explicit sales status semantics;
- bounded demand window.

### Commits
RPC implementation:
`b98ce4936036ae1d44ee60dc1bc2a5411eee13c2`

Canonical adapter migration:
`c0bdbeee16a5df42c030dd39a1db7d93eb6a5255`

Regression hardening:
`97ead740d8d7b2cbfd4d6e69948360ef4d0e1339`

### Regression execution
NOT EXECUTED in this environment. No PASS claim.

### Exact-head CI
Exact current HEAD:
`97ead740d8d7b2cbfd4d6e69948360ef4d0e1339`

GitHub Actions workflow lookup returned `0 workflow_runs` for this exact SHA.
Therefore:
`CI = NOT OBSERVED`
`GATED = NO`

### Certification state
`IMPLEMENTED → REGRESSION-WIRED → EXACT-HEAD CI PENDING → CONSUMER VERIFIED PENDING`

### Remaining work
1. Execute the regression on the exact HEAD.
2. Obtain Exact-Head CI evidence.
3. Verify the RPC migration against existing signatures/grants/RLS/search_path and migration ordering.
4. Prove cross-surface equivalence for Inventory Intelligence / Demand Velocity / Forecast / Reports / Export / Decision.
5. Perform real authenticated tenant A/B runtime evidence before Runtime/LIVE certification.

### No false green
This batch is `PARTIAL`, not CLOSED, because regression execution and Exact-Head CI evidence are absent.
