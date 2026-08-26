# Master Execution Index — Batch 31 Delta

## Exact execution state
- Base SHA: `4095e0f0d427652eb705ba3955389ae978d7b5bf`
- Current Code HEAD at index creation: `fe3cfc742fa33711e7aa3ebddfe335ee39233486`
- Branch: `wave/parallel-compat-closure-20260826`
- PR: #45
- Index status: DELTA ONLY; this branch index must not be treated as main certification.

## Failure Family: Inventory intelligence tenant authority

### FIND
The existing inventory intelligence RPCs accepted `p_company_id` as a function argument. That creates an authorization-bearing tenant input even though the repository already has `public.current_company_id()` as the canonical session-derived authority.

### ROOT CAUSE
The RPC contract mixed business parameters with tenant authority. The database implementation filtered by the caller-supplied company id instead of deriving the tenant from the authenticated session.

### CONSUMER / DEPENDENCY INVENTORY
Repository search at the current wave found no application call sites for the old RPC signatures. The functions were defined in `20260819210000_inventory_demand_liquidity.sql` and are used internally by the demand/reorder function.

### FIX
`20260826093000_inventory_intelligence_tenant_authority.sql`:
- explicitly drops the old UUID-bearing signatures;
- recreates `inventory_liquidity_velocity`, `demand_reorder_snapshot`, and `cash_liquidity_snapshot` without `p_company_id`;
- derives tenant scope from `public.current_company_id()`;
- keeps the functions SECURITY INVOKER;
- revokes PUBLIC execution and grants execution only to authenticated users;
- preserves NULL/insufficient-history semantics instead of coercing missing demand into a valid forecast.

### REGRESSION
`scripts/check-inventory-intelligence-tenant-authority.mjs` asserts:
- old signatures are explicitly dropped;
- current_company_id() is present;
- no caller-supplied `p_company_id` is reintroduced;
- SECURITY DEFINER is not introduced;
- authenticated grants exist.

### STATUS
**IMPLEMENTED / REGRESSION-WRITTEN / EXACT-HEAD CI NOT YET GATED**.

The regression script is currently an independent contract file and has not yet been wired into an existing npm script/workflow step; therefore this family is not claimed CLOSED.

## Failure Family: Report inventory/purchase aggregation

### FIND
At exact HEAD inspection, `ReportsPage.tsx` computes purchase totals from `fetchPurchaseInvoices(0, 20)`, making the first page the business aggregate. The inventory report computes `totalValue`, item count, low-stock count, and out-of-stock count from the full `fetchInventoryBalances()` client dataset. Missing quantity/cost is converted to zero for total inventory value. These are business-truth risks, not display-only pagination.

### ROOT CAUSE
The report surface conflates display data retrieval with business aggregation. There is no authoritative report-level snapshot contract currently consumed by the page.

### FIX ATTEMPT / CURRENT STATE
Added:
- `supabase/migrations/20260826090000_report_truth_inventory_purchase.sql`
- `src/lib/report-truth.ts`

These introduce session-tenant-scoped server-side inventory pagination/metrics and purchase summary contracts. However, the existing `ReportsPage.tsx` has not yet been migrated to consume them.

### STATUS
**FOUND / ARCHITECTURE DESIGNED / PARTIAL IMPLEMENTATION**.

Not closed. Consumer migration, regression, and exact-head certification remain mandatory.

## Exact-head CI evidence
- Exact current HEAD: `fe3cfc742fa33711e7aa3ebddfe335ee39233486`.
- Quality run: `32928371967`.
- Quality job: `98055700341`.
- The job verified the exact HEAD SHA before executing gates.
- Gates through A0 hardening completed successfully.
- **Typecheck FAILED** on this exact HEAD at step 30.
- Lint was still in progress when inspected; later gates had not yet certified.
- Therefore the branch is **NOT GATED** and no historical PASS is promoted to this HEAD.

## Runtime / LIVE / Production
- Runtime evidence: none for these code changes.
- LIVE evidence: `LIVE REQUIRED` where browser/deployed/database/worker behavior is asserted.
- Production certification: **NOT CLAIMED**.

## Next active waves
1. Resolve the exact-head TypeScript failure before any certification claim; use the real compiler error, not gate weakening.
2. Migrate `ReportsPage.tsx` consumers to canonical report snapshots; preserve display pagination while moving business totals to server-side truth.
3. Expand the same pattern to Data Quality browser aggregations.
4. Sweep BI/Decision/Export for equivalent duplicate aggregation paths.
5. Continue sibling tenant-boundary sweep across exports, Storage, Realtime, AI/vector and workers while CI runs independently.
