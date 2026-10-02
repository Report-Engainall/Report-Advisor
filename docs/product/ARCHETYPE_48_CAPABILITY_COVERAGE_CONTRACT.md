# VERSIONED ARCHETYPE 48-CAPABILITY COVERAGE CONTRACT
## 2026-10-02

The number 48 is a design catalogue, not a claim about the current corpus. Runtime discovery remains evidence-driven.

## Canonical profile envelope
`ARCHETYPE_ID`
`VERSION`
`STATUS`
`TITLE_ALIASES`
`HEADER_ALIASES`
`INPUT_SHAPE`
`REQUIRED_FIELDS`
`OPTIONAL_FIELDS`
`CONFLICTING_FIELDS`
`GRAIN`
`TIME_FIELDS`
`ENTITY_FIELDS`
`MEASURE_FIELDS`
`DOMAIN_RULES`
`SMART_METRICS`
`SIGNAL_RULES`
`ANOMALY_RULES`
`DRIVER_RULES`
`RISK_RULES`
`OPPORTUNITY_RULES`
`RECOMMENDATION_RULES`
`DECISION_QUESTIONS`
`ACTION_TEMPLATES`
`EXPORT_SECTIONS`
`MIN_SAMPLE`
`CONFIDENCE_THRESHOLD`
`PROVENANCE_REQUIREMENTS`
`LIMITATIONS`

## Catalogue

| # | Archetype | Primary intelligence |
|---:|---|---|
| 01 | sales.total.trend | trend, growth, contributors/detractors, anomalies, concentration |
| 02 | sales.invoice.detail | invoice size, customers/items, discounts, payment, traceability |
| 03 | sales.customer | customer value, trend, concentration, churn signals |
| 04 | sales.customer-month | continuity, acceleration/deceleration, recency |
| 05 | sales.product | top/bottom, growth, velocity, concentration, stock linkage |
| 06 | sales.category | category contribution, mix shifts, drivers/detractors |
| 07 | sales.branch | branch contribution, productivity, imbalance |
| 08 | sales.salesperson | portfolio contribution, mix, performance gaps |
| 09 | sales.returns | return rate, spikes, concentration, risk |
| 10 | sales.discounts | discount distribution, outliers, margin impact when calculable |
| 11 | sales.payment-terms | cash/credit mix, receivable exposure, collection opportunities |
| 12 | sales.target-vs-actual | gap, pace, trend, corrective action |
| 13 | purchases.total.trend | spend trend, supplier/item drivers, spikes |
| 14 | purchases.invoice.detail | supplier/item/quantity/cost, anomalies, traceability |
| 15 | purchases.supplier | supplier value, dependency, trend, continuity |
| 16 | purchases.supplier-month | continuity, seasonality, supplier shifts |
| 17 | purchases.product-category | mix, growth, price/quantity decomposition |
| 18 | purchases.price-change | price variance, affected suppliers/items, pressure |
| 19 | purchases.returns | return rate, supplier/item concentration, anomalies |
| 20 | purchases.branch | branch demand, allocation, supplier exposure |
| 21 | purchases.supplier-concentration | top-share, dependency, single-supplier risk |
| 22 | purchases.cycle-performance | lead time, delays, fulfillment, exceptions |
| 23 | inventory.balance | on-hand, value, concentration, zero/negative |
| 24 | inventory.item-movement | opening/in/out/closing, movement trend, reconciliation |
| 25 | inventory.aging | dead/slow stock, value at risk, liquidation candidates |
| 26 | inventory.velocity | fast/medium/slow movers, trend, seasonality when supported |
| 27 | inventory.coverage | days/weeks coverage, excess/shortage risk |
| 28 | inventory.stockout-reorder | stockout risk, reorder logic, priority queue |
| 29 | inventory.valuation | quantity × cost, concentration, anomalies |
| 30 | inventory.location-compare | over/under-stock, transfers, imbalance |
| 31 | inventory.adjustment-anomaly | unusual adjustments, negative balances, investigations |
| 32 | inventory.transfer | source/destination flow, imbalance, transfer opportunities |
| 33 | customers.activity-directory | active/inactive/new/recovered, recency/frequency/value |
| 34 | customers.statement | outstanding, aging, debit/credit, collection priority |
| 35 | customers.continuity | inactivity/churn signals, revival candidates |
| 36 | customers.rfm-abc-xyz | monetary, recency, frequency, action segments |
| 37 | customer-product | mix, cross-sell, lost relationships, basket opportunities |
| 38 | suppliers.activity-directory | active/inactive, value, continuity, concentration |
| 39 | suppliers.statement | outstanding, aging, due dates, payment priority |
| 40 | suppliers.performance | delivery/price/consistency when supported |
| 41 | cash.bank-movement | inflow/outflow, net movement, anomalies, timing |
| 42 | receivables.aging | aging buckets, overdue exposure, collection queue |
| 43 | payables.aging | obligations, due schedule, supplier risk |
| 44 | cash.flow-liquidity | cash position, liquidity gap, collections vs obligations |
| 45 | finance.profitability | revenue, cost, gross profit, margin, leakage |
| 46 | finance.general-ledger | account movement, unusual entries, reconciliation |
| 47 | finance.trial-balance-position | assets/liabilities/equity or available balances, exceptions |
| 48 | demand.forecast | demand trend, velocity, seasonality, forecast, uncertainty |

## Required adaptation
Every archetype must downgrade safely when fields are missing:
`AVAILABLE` | `NOT_AVAILABLE` | `INSUFFICIENT_SAMPLE` | `REVIEW_REQUIRED`.

An archetype never owns canonical truth. It owns interpretation rules over canonical fields and produces provenance-bearing claims.

## Evolution law
Changing business rules increments PROFILE_VERSION. Historical reports keep the version used. Never rewrite historical meaning silently.
