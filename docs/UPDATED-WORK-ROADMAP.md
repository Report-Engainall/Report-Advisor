# مساعد التاجر — Updated Work Roadmap

## Market Dynamics & Inventory Intelligence
- Demand velocity, historical baselines, trend, seasonality and acceleration/decline classification.
- Days of stock, reorder point, stockout risk and lost-sales estimation.
- Customer × SKU demand, fill rate and continuity analysis.
- Liquidity drivers, inventory turnover and cash conversion analysis.

## Alternative & Related Item Groups
- Configurable named groups with tenant ownership.
- Multiple equivalent SKUs per group with base-unit conversion factors.
- Validation for tenant, duplicate SKU and invalid conversion.
- Grouped stock/request/net-sales/demand aggregation.
- Group days-of-cover from normalized group stock / normalized group demand.
- Detail/grouped report modes with drill-down capability.
- Alternative-aware stockout and replenishment decisions.
- Persistent Supabase schema with indexes, uniqueness constraints and RLS.

## Integrated Intelligence & Decisioning
- Velocity → forecast → coverage → stockout → alternatives → lost sales → evidence → replenishment.
- Deterministic decision arbitration using urgency, impact, confidence, liquidity and evidence.
- Replenishment actions: `do_not_reorder`, `reorder_sku`, `reorder_group`.
- Forecast-aware reorder quantity and customer fill-rate impact.
- Evidence confidence based on source, period, sample size, freshness, assumptions and SKU coverage.

## UI & Reporting Layer — Active Implementation
- Alternative Groups form model with validation and normalized members — completed.
- Persistent Alternative Groups schema — completed.
- Actual Alternative Groups management page with create/list/member add/remove — completed.
- Route `/alternative-groups` — completed.
- Sidebar navigation entry — completed.
- Tenant-aware security validation — completed.
- Security fixture and schema contract gates — completed.
- Unified decision dashboard card model — completed.
- Decision dashboard quality gate — completed.
- Live inventory intelligence screen using Supabase inventory/products/group membership — completed.
- Detail/Grouped toggle wired to `grouped-report` — completed.
- Inventory intelligence route `/reports/inventory-intelligence` — completed.
- Inventory intelligence sidebar navigation — completed.
- Inventory intelligence UI contract gate — completed.
- Important boundary: demand/request history is not fabricated; zero-demand rows explicitly report insufficient historical demand.
- Next: connect time-series sales/request data so grouped demand and days-of-cover become fully historical.
- Next: dashboard decision cards with evidence/confidence and actionable priorities.
- Next: historical peak-vs-current views and group drill-down.

## Quality & Production Gates
- Inventory intelligence deterministic boundary checks.
- Alternative-group tenant isolation/security fixture.
- Alternative-group schema contract check.
- Decision dashboard contract check.
- Inventory intelligence UI contract check.
- Package commands for inventory intelligence, security, schema, dashboard and UI checks.
- Architecture contract and performance budget checks remain mandatory.
- Next: execute cross-tenant isolation tests against engines, lineage, caches and reports.
- Next: large grouped dataset correctness/performance tests.
- Next: integration, load, security and production-candidate hardening.

## Completed implementation units
- `src/lib/free-toolbox/inventory-dynamics.ts`
- `src/lib/free-toolbox/stockout-loss.ts`
- `src/lib/free-toolbox/customer-item-demand.ts`
- `src/lib/free-toolbox/liquidity-drivers.ts`
- `src/lib/free-toolbox/alternative-groups.ts`
- `src/lib/free-toolbox/alternative-group-report.ts`
- `src/lib/free-toolbox/alternative-group-governance.ts`
- `src/lib/free-toolbox/inventory-intelligence-pipeline.ts`
- `src/lib/free-toolbox/substitution-recommendation.ts`
- `src/lib/free-toolbox/replenishment-decision.ts`
- `src/lib/free-toolbox/decision-evidence.ts`
- `src/lib/free-toolbox/forecast-signal.ts`
- `src/lib/free-toolbox/alternative-group-ui-model.ts`
- `src/lib/free-toolbox/grouped-report.ts`
- `src/lib/free-toolbox/alternative-group-security.ts`
- `src/lib/free-toolbox/decision-dashboard.ts`
- `src/pages/AlternativeGroupsPage.tsx`
- `src/pages/InventoryIntelligencePage.tsx`
- `supabase/migrations/20260819230000_alternative_item_groups.sql`
- `scripts/check-inventory-intelligence.mjs`
- `scripts/check-alternative-group-security.mjs`
- `scripts/check-alternative-group-schema.mjs`
- `scripts/check-decision-dashboard.mjs`
- `scripts/check-inventory-intelligence-ui.mjs`

## Next execution sequence
1. Connect time-series sales/request data to live grouped demand and days-of-cover.
2. Connect decision-dashboard model to an actual dashboard surface.
3. Integrate customer continuity and liquidity into replenishment ranking.
4. Add group-level forecast and normalized reorder quantities.
5. Add historical peak-vs-current and seasonal demand views.
6. Add cross-tenant authorization tests across all intelligence surfaces.
7. Add large-dataset performance, memory and pagination budgets.
8. Execute integration/load/security checks and production hardening.
9. Release only after all quality gates pass.
