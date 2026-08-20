# مساعد التاجر — Updated Work Roadmap

## Market Dynamics & Inventory Intelligence

### 1. Market Dynamics & Inventory Velocity
- Track item demand velocity before stockouts occur.
- Historical consumption and rolling 30/90/365-day demand baselines.
- Detect fast, steady, semi-slow, slow, seasonal, declining and accelerating items.
- Detect demand spikes and structural changes instead of treating all slow items as dead stock.
- Calculate average daily demand, active-day demand, peak demand, coefficient of variation, trend slope and 30-day velocity.
- Estimate days of stock and reorder point from demand velocity, lead time and safety coverage.
- Preserve prior-period consumption so the system can recognize true market capacity.

### 2. Customer Continuity, Stockouts & Lost Sales
- Maintain customer-by-item demand profiles.
- Track requested vs fulfilled units, fill rate, lost units and affected customers.
- Detect recurring stockout patterns per SKU and per customer.
- Compare peak historical demand against current availability.
- Estimate lost-sales revenue from unmet demand when a valid unit price is available.
- Classify stockout risk as critical/high/watch/safe using days-of-stock versus lead-time and safety coverage.
- Prioritize customer continuity.

### 3. Liquidity Drivers & Working Capital
- Rank SKUs by cash contribution and cash velocity.
- Identify products that repeatedly generate operating liquidity.
- Track inventory turnover and cash conversion cycle components.
- Combine margin, sales velocity, collection time, purchase cost and replenishment lead time.
- Surface products that consume capital without adequate cash return.

### 4. Alternative & Related Item Groups
- Treat equivalent/alternative SKUs as a configurable group for inventory, demand and sales analysis.
- Allow managers/warehouse users to define named groups and assign multiple SKUs to each group.
- Support a base-unit conversion factor per member.
- Enforce tenant isolation for groups and members.
- Prevent accidental multi-group SKU assignment.
- Support report mode switching: `detail` or `grouped`.
- Grouped reporting aggregates requests, stock, net sales, demand velocity and estimated lost units/revenue.
- Recalculate group days-of-cover from normalized stock / normalized demand.
- Preserve member SKU drill-down.
- Prevent false stockout/reorder decisions when a valid alternative is available.

## Integrated Intelligence Pipeline
- Combine velocity, stock coverage, stockout risk, lost sales, alternative-group coverage and decision arbitration in one deterministic pipeline.
- Require tenant and SKU context before producing inventory intelligence.
- Generate prioritized decisions for critical/high stockout risk, accelerating/seasonal demand and under-covered alternative groups.
- Attach source/evidence lineage from historical demand through metrics, risk insights and decisions.
- Keep decision ranking deterministic and evidence-aware.
- Generate substitution-aware replenishment: `reorder_sku`, `reorder_group`, or `do_not_reorder`.
- Suppress a single-SKU reorder when the alternative group has adequate normalized coverage.

## Evidence & Forecasting — Started
- Add deterministic evidence confidence scoring using source, period, SKU coverage, sample size, freshness and assumptions.
- Add a free/local forecast signal using baseline demand, trend and seasonality without paid APIs.
- Require evidence and confidence before surfacing high-impact recommendations.

## Quality Gates — Completed
- Deterministic inventory intelligence boundary checks added.
- Inventory intelligence check command added to package scripts.
- Inventory intelligence checks added to GitHub Actions quality workflow.
- Coverage checks include historical demand, lost sales, group-level days-of-cover, zero-demand boundaries and core engine presence.

## Existing Platform Foundations
- Multi-tenant data isolation.
- Tenant-scoped cache and scheduled jobs.
- Trial/licensing/feature entitlements.
- Usage and engagement intelligence.
- Data-quality gates.
- Performance budgets and CI enforcement.
- Architecture contracts.
- Analytics, forecasting, alerts and interactive decision cards.
- Onyx Pro ingestion/synchronization architecture.
- Local/free-first OCR and data-processing strategy.

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
- `src/lib/free-toolbox/decision-evidence.ts`
- `src/lib/free-toolbox/forecast-signal.ts`
- `scripts/check-inventory-intelligence.mjs`

## Next execution sequence
1. Build Alternative Groups management UI: create/edit/archive, member assignment, conversion factors and validation.
2. Add Detail vs Grouped report toggle with SKU drill-down.
3. Add dashboard cards: Demand Pulse, Semi-Slow Watchlist, Stockout Risk, Lost Sales, Customer Continuity, Alternative Group Coverage and Liquidity Leaders.
4. Add historical peak-vs-current demand views at SKU and group levels.
5. Expand substitution-aware recommendations with customer continuity and liquidity impact.
6. Integrate forecast signals into replenishment and group coverage decisions.
7. Require source period, member SKUs, conversion assumptions and confidence in recommendation evidence.
8. Add cross-tenant isolation tests for all engines, lineage, caches and derived reports.
9. Add CI correctness/performance gates for large grouped datasets.
10. Run production-candidate integration/load/security tests.
11. Complete final release hardening only after all gates pass.
