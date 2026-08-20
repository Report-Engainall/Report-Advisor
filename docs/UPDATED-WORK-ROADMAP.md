# مساعد التاجر — Updated Work Roadmap

## Added in this release: Market Dynamics & Inventory Intelligence

### 1. Market Dynamics & Inventory Velocity
- Track item demand velocity before stockouts occur.
- Historical consumption and rolling 30/90/365-day demand baselines.
- Detect fast, steady, semi-slow, slow, seasonal, declining and accelerating items.
- Detect demand spikes and structural changes instead of treating all slow items as dead stock.
- Calculate average daily demand, active-day demand, peak demand, coefficient of variation, trend slope and 30-day velocity.
- Estimate days of stock and reorder point from demand velocity, lead time and safety coverage.
- Preserve prior-period consumption so the system can recognize true market capacity (for example, thousands of units sold historically).

### 2. Customer Continuity, Stockouts & Lost Sales
- Maintain customer-by-item demand profiles.
- Track requested vs fulfilled units, fill rate, lost units and affected customers.
- Detect recurring stockout patterns per SKU and per customer.
- Compare peak historical demand against current availability.
- Estimate lost-sales revenue from unmet demand when a valid unit price is available.
- Classify stockout risk as critical/high/watch/safe using days-of-stock versus lead-time and safety coverage.
- Prioritize customer continuity: distinguish a one-off request from repeated unmet demand.

### 3. Liquidity Drivers & Working Capital
- Rank SKUs by cash contribution and cash velocity.
- Identify products that repeatedly generate operating liquidity.
- Track inventory turnover and cash conversion cycle components.
- Combine margin, sales velocity, collection time, purchase cost and replenishment lead time.
- Surface products that consume capital without adequate cash return.

### 4. Alternative & Related Item Groups
- Treat equivalent/alternative SKUs as a configurable group for inventory, demand and sales analysis.
- Allow managers/warehouse users to define named groups and assign multiple SKUs to each group.
- Support a base-unit conversion factor per member so different pack sizes are not blindly added as if physically identical.
- Enforce tenant isolation for groups and members.
- Prevent the same SKU from being assigned to multiple alternative groups unless the model is explicitly extended to support weighted/multi-group relationships.
- Support report mode switching: `detail` (SKU-level) or `grouped` (group-level).
- Grouped reporting aggregates customer requests, stock, net sales, demand velocity and estimated lost units/revenue.
- Recalculate group days-of-cover from total normalized stock divided by total normalized average daily demand.
- Preserve member SKU drill-down through the group membership list.
- Support empty groups in management/reporting views when explicitly requested.
- Use grouped analysis to prevent false stockout/reorder decisions when a valid alternative is available.

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

## Completed implementation units in current release
- `src/lib/free-toolbox/inventory-dynamics.ts`
- `src/lib/free-toolbox/stockout-loss.ts`
- `src/lib/free-toolbox/customer-item-demand.ts`
- `src/lib/free-toolbox/liquidity-drivers.ts`
- `src/lib/free-toolbox/alternative-groups.ts`
- `src/lib/free-toolbox/alternative-group-report.ts`
- `src/lib/free-toolbox/alternative-group-governance.ts`

## Next execution sequence
1. Integrate velocity, customer demand, stockout, liquidity and alternative-group engines into the analytics domain.
2. Add deterministic tests for formulas and boundary cases, including conversion factors and empty groups.
3. Add cross-tenant isolation tests for all new engines and derived caches/reports.
4. Build the Alternative Groups management UI with create/edit/archive, member assignment, conversion factors and validation.
5. Add report toggle: Detail vs Grouped, with SKU drill-down from grouped rows.
6. Add dashboard cards: Demand Pulse, Semi-Slow Watchlist, Stockout Risk, Lost Sales, Customer Continuity, Alternative Group Coverage and Liquidity Leaders.
7. Add historical comparison and peak-vs-current demand views at both SKU and alternative-group levels.
8. Add forecasting signals using historical velocity and seasonality without requiring paid APIs.
9. Add substitution-aware recommendations: reorder the group, not a single SKU, when group coverage is healthy.
10. Add data-quality/evidence requirements so recommendations expose source period, member SKUs, conversion assumptions and confidence.
11. Add CI performance and correctness gates for large grouped datasets.
12. Run production-candidate integration and load testing before final release hardening.
