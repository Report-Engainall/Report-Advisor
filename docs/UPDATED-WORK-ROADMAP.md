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

## Next execution sequence
1. Integrate velocity, customer demand, stockout and liquidity engines into the analytics domain.
2. Add deterministic tests for formulas and boundary cases.
3. Add cross-tenant isolation tests for all new engines and derived caches/reports.
4. Add dashboard cards: Demand Pulse, Semi-Slow Watchlist, Stockout Risk, Lost Sales, Customer Continuity and Liquidity Leaders.
5. Add historical comparison and peak-vs-current demand views.
6. Add forecasting signals using historical velocity and seasonality without requiring paid APIs.
7. Add data-quality/evidence requirements so recommendations expose their source period and confidence.
8. Add CI performance and correctness gates for large datasets.
9. Run production-candidate integration and load testing before final release hardening.
