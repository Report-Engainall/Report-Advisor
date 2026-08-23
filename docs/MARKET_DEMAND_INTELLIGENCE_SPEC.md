# Report-Advisor — Market & Trader Intelligence Specification

## Objective
Transform Report-Advisor from a report reader into a continuously learning commercial advisor. The system must understand what the merchant sells, who buys it, when it moves, how much the market appears to absorb, what liquidity it creates, what is becoming stagnant, and what action is justified by evidence.

## 1. Market Capacity Model
For every SKU and normalized item group, maintain:
- units sold by day/week/month/year
- sales value and cost value
- gross margin and margin rate where cost exists
- unique customers buying the SKU
- active customers and customer retention
- average order quantity
- median order quantity
- minimum/maximum observed order
- order frequency
- days between purchases
- share of total sales, units, margin and liquidity
- share by customer segment, branch and channel where available
- peak periods and seasonal pattern
- recent acceleration/deceleration
- stock availability during the observed period
- lost-sales opportunities when demand was not fulfilled

Do not call this the true market size unless external market data exists. Call it **observed addressable demand / observed merchant market capacity** based on the merchant's own history.

## 2. Demand Memory — Never Forget Historical Movement
A SKU must retain historical evidence even when current stock is zero.

Example:
- July: 1,700 cartons sold
- August: stock = 0
- Current demand request: 350 cartons

The advisor must not say only "stock is low". It should surface:
- July historical movement
- recent customer demand
- expected near-term demand
- days since last replenishment
- stockout duration
- customers affected
- estimated missed sales
- recommended replenishment range
- confidence and evidence.

Historical peaks must remain part of the demand baseline unless data-quality rules invalidate them.

## 3. Demand Potential vs. Actual Sales
Separate:
- actual fulfilled demand
- requested but unfulfilled demand
- estimated lost demand
- suppressed demand caused by stockouts
- seasonally expected demand
- exceptional/one-off demand

Never use sales alone as demand when stockouts existed; this systematically underestimates the market.

## 4. Stockout-Aware Demand
For each SKU calculate:
- stockout dates/duration
- zero-stock periods
- partial availability
- orders rejected/partially fulfilled where evidence exists
- customer requests during stockout
- estimated lost units/value
- affected customers
- recurrence count
- opportunity cost.

A high historical seller with low current stock must trigger a proactive warning before the next expected demand peak, not after the item is completely unavailable.

## 5. Reorder Intelligence
Recommend:
- reorder now / monitor / do not reorder
- target stock
- safety stock
- reorder point
- expected demand during lead time
- uncertainty buffer
- suggested quantity/range
- alternative SKU/group coverage
- cash required
- expected sales protected
- expected days of cover after reorder.

Recommendations must account for supplier lead time, minimum order quantity, pack/unit conversion, available cash and customer importance where those fields exist.

## 6. High / Low / Typical Sales
For every SKU and group maintain:
- maximum daily/weekly/monthly movement
- minimum non-zero movement
- average
- median
- percentile bands (P50/P75/P90/P95/P99 when sample size supports them)
- recent rolling average
- weighted recent average
- peak-to-current ratio
- volatility
- coefficient of variation where statistically valid.

Never base replenishment on a single maximum sale.

## 7. Seasonality & Event Memory
Detect recurring patterns by:
- month
- week of month
- weekday
- known local trading seasons
- Ramadan/Eid and other configurable local seasons when dates are available
- customer-specific cycles
- annual anniversary patterns.

Seasonal adjustments must be evidence-based and configurable; do not fabricate external seasonality.

## 8. Early Demand Surge Detection
Detect before a SKU becomes a major shortage risk using:
- acceleration in units
- acceleration in order frequency
- number of unique buyers increasing
- average basket quantity increasing
- repeat-purchase interval shortening
- search/request signals if available
- customer waitlists/requests
- cross-SKU/category leading indicators
- supplier lead time vs expected demand.

Classify: normal / emerging / accelerating / surge / anomalous.

Trigger graduated alerts to avoid notification fatigue.

## 9. Stagnant / Slow-Moving Inventory
Classify every SKU using:
- days since last sale
- units sold in rolling windows
- inventory age
- stock value locked
- margin contribution
- historical demand
- customer count
- trend
- seasonality.

Actions:
- monitor
- discount/promotion candidate
- bundle with related item
- transfer to another branch
- reduce next purchase
- liquidate
- investigate data issue.

Never label an item stagnant solely because it has low sales during a known seasonal trough.

## 10. Customer × SKU Intelligence
Maintain a relationship matrix:
- customers who buy each SKU
- last purchase date
- purchase frequency
- average quantity
- peak quantity
- usual reorder interval
- current expected reorder date
- recent drop/increase
- inactive customers
- customers affected by stockouts
- customers who requested unavailable stock.

The system should answer:
- Who normally buys this item?
- Who stopped buying it?
- Who is due to reorder?
- Who was not served because of stock?
- Which customers are concentrated on a high-value SKU?

Respect tenant isolation and customer privacy at all times.

## 11. Customer Continuity / Churn Signals
For each active customer:
- normal buying cadence
- expected next purchase window
- deviation from cadence
- spend trend
- SKU coverage change
- high-value SKU abandonment
- inactivity duration.

Classify only as a signal, not a certainty: stable / at-risk / inactive / returning / expanding.

## 12. Merchant Dependence Map
Build a commercial dependency graph:
- top SKUs by units
- top SKUs by revenue
- top SKUs by gross margin
- top SKUs by cash generation
- top SKUs by customer reach
- top customer-SKU relationships
- categories carrying the business
- suppliers carrying critical assortment.

Show concentration risk: e.g. a small number of SKUs or customers generating a large share of observed business.

## 13. Liquidity Intelligence
Classify products by cash behavior:
- cash generators
- fast cash converters
- high-margin but slow cash
- cash traps
- dead capital
- strategic traffic drivers.

Calculate when data permits:
- inventory value
- cash tied up
- inventory turnover
- days inventory outstanding
- gross margin return on inventory investment (GMROI)
- sell-through
- cash conversion contribution.

Recommendations must consider liquidity, not only sales volume.

## 14. Purchase Timing Intelligence
Predict when the merchant is likely to need replenishment based on:
- current stock
- demand forecast
- safety stock
- supplier lead time
- order cycle
- seasonal peak
- supplier reliability.

Alert before the reorder point is crossed.

## 15. Supplier Intelligence
For each supplier where data exists:
- lead time
- fill rate
- price history
- purchase frequency
- delays
- short shipments
- quality/rejection signals
- price changes
- dependency/concentration.

Identify supplier risk for critical SKUs.

## 16. Price & Margin Intelligence
Track:
- purchase cost changes
- selling price changes
- margin compression
- price elasticity signals when enough data exists
- customer-specific pricing behavior
- competitor/external price only when reliable external data is explicitly connected.

Never infer competitor pricing from internal data.

## 17. Opportunity Detection
Identify:
- products with rising demand but insufficient stock
- products frequently requested but absent
- customers buying substitutes because the preferred SKU was unavailable
- cross-sell opportunities
- under-served customer segments
- products with strong margin and healthy velocity
- products whose demand is growing faster than inventory.

## 18. Market Shock & Anomaly Detection
Detect unusual:
- sales spikes
- sales drops
- customer concentration shifts
- price changes
- return spikes
- stock adjustments
- negative stock
- impossible quantities
- unusual transactions.

Separate business anomalies from data anomalies.

## 19. Evidence & Confidence
Every recommendation must carry:
- evidence period
- number of transactions
- source reports/files
- freshness
- data quality score
- model/algorithm version
- assumptions
- confidence
- reason for recommendation.

Low evidence = cautious recommendation, never confident automation.

## 20. Daily Commercial Brief
The home/dashboard should answer in under a minute:
1. What changed?
2. What is selling faster?
3. What is slowing down?
4. What may run out soon?
5. What is tying up cash?
6. Which customers need attention?
7. What sales may have been lost?
8. What should be purchased?
9. What should not be purchased?
10. What decisions are most urgent today?

## 21. Decision Queue
Create prioritized actions with:
- action
- impact
- urgency
- confidence
- expected value
- cash requirement
- evidence
- owner/status
- snooze/escalate/resolve.

## 22. Explainability / Drill-through
Every number and decision must support:
Dashboard → metric → calculation → normalized data → source rows → source report → source file → source snapshot.

## 23. Data Quality & Reconciliation Rules
Before intelligence:
- validate dates
- validate quantities
- validate units
- validate prices
- detect duplicates
- detect impossible values
- reconcile totals against source report totals when available
- detect missing periods
- detect schema drift
- preserve unmapped columns.

## 24. Multi-Scenario Planning
Support scenarios such as:
- demand +10/+20/+30%
- supplier delay
- price increase/decrease
- cash budget limit
- stockout of a key SKU
- alternative SKU substitution.

Show expected inventory, cash, sales protection and risk changes.

## 25. Governance Boundaries
- No fabricated market size.
- No fabricated customer demand.
- No fabricated competitor pricing.
- No automatic purchase execution without explicit authorization.
- No silent mapping of ambiguous ERP columns.
- No cross-tenant learning leakage.
- No deletion of source evidence.
- Every automated transformation must be deterministic/replayable.

## 26. Performance Strategy
- Parse once, cache normalized artifacts.
- Incremental row-level reconciliation.
- Partition historical data by tenant/time/report family.
- Background workers for heavy analysis.
- Bounded concurrency and backpressure.
- Progressive UI updates.
- Precompute daily aggregates.
- Keep detailed drill-down available without loading entire datasets.

## 27. UI/UX Direction
The visual system should feel like a premium commercial command center, not a spreadsheet dump:
- restrained gradients
- clear semantic status colors
- strong hierarchy
- compact KPI cards
- responsive mobile-first layout
- Arabic RTL-first quality
- accessible contrast
- skeleton/progressive loading
- command palette
- keyboard shortcuts on desktop
- saved views and filters
- drill-down drawers
- evidence panels
- daily digest
- decision queue.

Visual polish must never hide uncertainty or evidence.

## 28. Success Criterion
Report-Advisor should eventually answer, from the merchant's own continuously ingested data:

> What sells, to whom, when, how fast, how much of it the business can actually serve, what is likely to happen next, what cash is tied up, what opportunity is being lost, which customers are affected, and what should the merchant do today — with evidence.
