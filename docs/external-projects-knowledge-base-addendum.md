# Report Advisor — External Projects Knowledge Base Addendum

> This addendum is part of the authoritative product reference. It consolidates newly approved requirements and implementation decisions discovered during the continuing product review. It must not override the Master Product Reference; it extends it.

## 1. Market Dynamics & Inventory Velocity

### 1.1 Demand movement
- Track product/category/group demand velocity over time.
- Detect acceleration/deceleration before stockout where data quality permits.
- Separate stable movers, accelerating movers, seasonal movers, intermittent movers and semi-stagnant items.
- Preserve historical demand windows so sudden events (for example a strong month) are not erased by current low activity.
- Use minimum-data gates before forecasting or making high-impact purchase recommendations.

### 1.2 Semi-stagnant / intermittent items
- Detect items with low or irregular movement without classifying them automatically as dead stock.
- Identify seasonal/intermittent demand patterns.
- Compare recent velocity with historical baseline and highlight meaningful deviations.
- Recommendations must distinguish MONITOR from DO NOT BUY.

### 1.3 Historical consumption
- Track prior sold quantity, revenue and transaction counts by product, category and alternative group.
- Historical consumption must remain queryable even after current stock reaches zero.
- Use exact business keys and source lineage when reconstructing historical movement.

## 2. Stock Stability, Stockouts & Customer Continuity

### 2.1 Customer-to-product demand linkage
- Preserve customer/product demand relationships where source data supports them.
- Measure repeated interruption, recovery and recurrence of demand.
- Detect customers requesting unavailable products and quantify affected demand.

### 2.2 Peak demand and lost sales
- Detect historical peaks and troughs.
- Compare requested quantity against available/sellable stock at the relevant time.
- Estimate lost-sales exposure only when evidence supports it; otherwise mark as unavailable/uncertain.
- Never treat a current request as a confirmed lost sale unless the business evidence supports the inference.

### 2.3 Stock continuity
- Analyze stock coverage, stockout frequency, recovery time and demand continuity.
- Support product-level and alternative-group-level views.
- Surface cases where inventory is technically available but not sellable because it is reserved, damaged, blocked or otherwise unavailable.

## 3. Liquidity Drivers

- Identify products/groups that generate rapid and recurring cash conversion.
- Separate revenue from cash collection and receivables.
- Rank liquidity-driving products using verified cash/collection evidence where available.
- Protect minimum operating cash reserves in any liquidity allocation recommendation.
- Never substitute purchase totals for cost of sales or cash receipts.

## 4. Alternative / Related Product Groups

### 4.1 Group setup
- Managers/warehouse users can create a named alternative group.
- Multiple products may belong to a group.
- Group membership is explicit and auditable.
- Optional conversion factors normalize units where products are genuinely substitutable.

### 4.2 Group-level calculations
When enabled, reports can aggregate by group:
- Total customer requests.
- Total sellable/available stock.
- Total net sales.
- Historical consumption.
- Average daily demand.
- Days of supply/coverage.
- Stockout exposure.
- Lost-sales exposure when evidence exists.
- Reorder requirement.

Group coverage must use:
`Total normalized sellable stock / Group average normalized daily demand`.

### 4.3 Reporting modes
- DETAIL: each product independently.
- GROUPED: one row per alternative group with drill-down to member products.
- HYBRID: group summary followed by member-level exceptions.

### 4.4 Safety rules
- Never merge unrelated products merely because their names are similar.
- Group membership must be explicit or backed by an approved deterministic mapping rule.
- Conversion factors must be validated before normalized aggregation.
- A group recommendation must retain member-level evidence.

## 5. Decision Engine Integration

The operational decision chain is:
`Historical Consumption → Demand Velocity → Customer Requests → Sellable Stock → Alternative Coverage → Stockout/Lost Sales → Forecast → Reorder Decision → Liquidity Impact`.

Every material recommendation must expose:
- Why
- Source metrics
- Calculation
- Snapshot/as-of timestamp
- Data freshness
- Confidence/quality
- Expected impact
- Recommended action

## 6. Data-quality gates

- No forecast with insufficient history.
- No confirmed lost-sales value without supporting evidence.
- No profit claim without verified cost basis.
- No group aggregation without valid membership/conversion data.
- Stale or unknown data freshness must downgrade or suppress proactive alerts.
- Null must never be interpreted as zero.

## 7. Performance requirements

- Prefer pre-aggregation/materialized analytical views for repeated group metrics.
- Cache deterministic query results using canonical query fingerprints.
- Invalidate affected analytical caches after authoritative inventory/sales/request changes.
- Keep heavy forecasting/document/AI work asynchronous and optional.
- Preserve low-bandwidth/mobile-first behavior.

## 8. Acceptance requirements

A capability is FULLY IMPLEMENTED only when its applicable database model, deterministic engine, API, UI, security/RLS, audit trail, loading/error/offline states, tests, regression/E2E coverage, performance evidence and documentation exist.
