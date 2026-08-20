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
- Group days-of-cover from normalized group stock / normalized demand.
- Detail/grouped report modes with drill-down capability.
- Alternative-aware stockout and replenishment decisions.

## Integrated Intelligence & Decisioning
- Velocity → forecast → coverage → stockout → alternatives → lost sales → evidence → replenishment.
- Deterministic decision arbitration using urgency, impact, confidence, liquidity and evidence.
- Replenishment actions: `do_not_reorder`, `reorder_sku`, `reorder_group`.
- Forecast-aware reorder quantity and customer fill-rate impact.
- Evidence confidence based on source, period, sample size, freshness, assumptions and SKU coverage.

## UI & Reporting Layer — In Progress
- Alternative Groups form model with validation and normalized members.
- Detail vs Grouped report projection implemented.
- Next: connect these models to the real application routes/components and persistence layer.
- Next: dashboard cards for Demand Pulse, Semi-Slow, Stockout Risk, Lost Sales, Customer Continuity, Alternative Coverage and Liquidity Leaders.
- Next: historical peak-vs-current views and group drill-down.

## Quality & Production Gates
- Inventory intelligence deterministic boundary checks.
- Package command and CI integration for inventory intelligence checks.
- Architecture contract and performance budget checks remain mandatory.
- Next: cross-tenant isolation tests for engines, lineage, caches and reports.
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
- `scripts/check-inventory-intelligence.mjs`

## Next execution sequence
1. Connect Alternative Groups UI model to actual app routes/components and persistence.
2. Connect grouped-report projection to report screens and add detail/grouped toggle.
3. Add dashboard decision cards with evidence and confidence.
4. Integrate customer continuity and liquidity into replenishment priority.
5. Add historical peak-vs-current and seasonal demand views.
6. Add group-level forecast and normalized reorder quantities.
7. Add cross-tenant isolation and authorization tests.
8. Add large-dataset performance and memory budgets.
9. Run integration/load/security checks and production hardening.
10. Release only after all quality gates pass.
