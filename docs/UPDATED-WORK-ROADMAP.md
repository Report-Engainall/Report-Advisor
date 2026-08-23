# مساعد التاجر — Updated Work Roadmap

## Product North Star
Report-Advisor is a continuous commercial intelligence and decision platform for merchants. It must transform trusted operational/accounting data into an evidence-backed understanding of demand, customers, inventory, liquidity, risk and next actions — not merely display reports.

## New — Continuous Governed Folder Report Ingestion
- Preserve manual single-file import unchanged.
- Preserve user-selected folder batch import.
- Add continuous watched-folder ingestion through the Local Sync Agent after explicit folder authorization.
- Detect new/changed files automatically; debounce and wait for file stability before reading.
- Support recursive folders with bounded depth, exclusions, retry, pause/resume, quarantine and audit history.
- Use SHA-256, source fingerprints and idempotency ledger.
- Process files independently; one failure never blocks the batch.
- Use bounded concurrency/backpressure and resumable background queues.
- Persist lifecycle: discovered → stable → scanning → classified → mapped → validated → committed/quarantined/failed.
- Browser-only deployments use explicit File System Access API; arbitrary typed paths never grant filesystem access.
- UNC/network folders require Local Sync Agent with least-privilege access.
- Quality gates: folder import, watcher stability, idempotency and security.

## New — Continuous Incremental Report Intelligence
- Treat the folder as a living source, not a one-time upload.
- First ingestion builds the historical baseline and evidence state.
- Later ingestion classifies files as unchanged, appended, revised, replaced or new.
- Process only genuinely new/changed rows when source semantics support safe incremental processing.
- Use source primary key → document/line identity → stable business key → deterministic row fingerprint hierarchy.
- If historical rows can be reordered/deleted/revised, automatically switch to bounded reconciliation or full reprocessing.
- Never equate changed timestamp with changed business records.
- Maintain source versions, hashes, row counts, cursors, row fingerprints and snapshots.
- Maintain source → report profile → mapping → canonical row → metric → decision lineage.
- Recalculate all affected intelligence after valid changes.
- Produce daily change digest: new/revised/reversed records, KPI changes, new/resolved risks and recommended actions.
- Background processing is resumable and deterministic; correctness outranks superficial speed.

## New — Data Change Intelligence & Lineage
- First-class Change Set: file change → row change → semantic change → affected metric → affected decision.
- Classify new, modified, deleted/missing, reversed, duplicate, unchanged, schema_changed and unresolved.
- Immutable source snapshots plus compact delta ledger.
- Deterministic replay using snapshot + parser/profile version.
- Data Quality Score for file/report/dataset with explicit reasons.
- Schema drift detection and safe quarantine.
- Source conflict resolution: append/replace/duplicate/conflict based on evidence.
- Full drill-through for important numbers and recommendations.

## New — Universal ERP / Accounting Report Recognition
- Versioned Report Schema Registry for Arabic/English accounting exports.
- Onyx Pro is first-class target; extend to Al-Mutakamil, Raqish and other systems using evidence-backed profiles.
- Recognize from report title, sheet names, headers, column order, types, values, formulas, merged cells and profile fingerprints.
- Normalize Arabic/English headers, Arabic/Latin digits, punctuation, whitespace, abbreviations, diacritics, dates, currencies and units.
- Canonical coverage: documents, customers, suppliers, products, inventory, financial/ledger, taxes, dates/periods and report metadata.
- Report families: sales, purchases, returns, inventory, item movement, customer/supplier statements, receivables/payables, cash, bank, journals, general ledger, trial balance, P&L, balance sheet, tax and operational reports.
- Preserve original/unmapped fields.
- Confidence scoring and ambiguity quarantine; no silent guessing.
- Tenant-approved aliases are versioned and scoped to matching profile fingerprints.
- Manual mapping remains the fallback; approved mappings become reusable profiles.
- Exact vendor headers are never invented; real exports/templates are authoritative.

## New — Market Demand & Commercial Intelligence
Detailed specification: `docs/MARKET_DEMAND_INTELLIGENCE_SPEC.md`.

### Observed Market Capacity
For every SKU and normalized group maintain observed merchant-market capacity, never claiming external total market size unless external data exists:
- units/value sold by day/week/month/year
- unique buyers, active buyers and retention
- average/median/min/max order quantities
- order frequency and reorder interval
- sales/revenue/margin/liquidity share
- customer/branch/channel concentration
- peak periods, seasonality, acceleration/deceleration
- availability and stockout periods
- fulfilled vs unfulfilled demand.

### Demand Memory
- Historical movement remains available even when current stock is zero.
- Example: if 1,700 units sold in July and only 350 are requested in August while stock is zero, surface historical movement, current request, forecast, affected customers, lost-sales opportunity and replenishment guidance.
- Historical peaks are preserved as evidence unless invalidated by quality rules.

### Demand vs Actual Sales
Explicitly separate:
- fulfilled demand
- unfulfilled/requested demand
- estimated lost demand
- suppressed demand caused by stockouts
- expected seasonal demand
- exceptional one-off demand.

Never treat low sales during stockout as proof of low demand.

### Stockout Intelligence
For every SKU/group calculate where evidence allows:
- stockout duration and recurrence
- partial availability
- affected customers
- unavailable requests
- estimated lost units/value
- opportunity cost
- next likely shortage date.

### Early Surge Detection
Detect rising demand before a shortage using:
- acceleration in units and order frequency
- increasing unique buyers
- larger baskets
- shorter reorder intervals
- requests/waitlists where available
- cross-SKU/category leading indicators
- supplier lead time vs expected demand.
Classify normal/emerging/accelerating/surge/anomalous with graduated alerts.

### Slow-Moving / Stagnant Inventory
Classify using days since sale, rolling movement, inventory age/value, margin, historical demand, customer count, trend and seasonality. Suggest monitor, promotion, bundle, transfer, reduce purchasing or liquidation — never label seasonal products stagnant without context.

### Customer × SKU Intelligence
Maintain per customer/SKU:
- last purchase
- frequency
- average/peak quantity
- expected reorder window
- recent change
- inactivity
- stockout impact
- request history where available.
Answer who buys, who stopped, who is due, who was not served and who depends on a critical SKU.

### Customer Continuity
Signal stable/at-risk/inactive/returning/expanding from deviations in buying cadence, spend and SKU coverage. These are signals, not certainties.

### Merchant Dependence Map
Rank concentration by:
- units
- revenue
- gross margin
- cash generation
- customer reach
- category contribution
- critical suppliers.
Show concentration risk instead of hiding it inside totals.

### Liquidity Intelligence
Classify products as cash generators, fast cash converters, high-margin/slow-cash, cash traps, dead capital or strategic traffic drivers. Calculate where data permits:
- inventory value
- cash tied up
- turnover
- days inventory outstanding
- GMROI
- sell-through
- cash conversion contribution.

### Replenishment & Purchase Timing
Recommend reorder now/monitor/do not reorder with:
- target stock
- safety stock
- reorder point
- lead-time demand
- uncertainty buffer
- suggested quantity/range
- alternatives
- cash required
- sales protected
- projected days of cover.
Account for MOQ, unit conversions, supplier reliability, lead time, cash limits and seasonal peaks where data exists.

### High / Low / Typical Sales
Maintain max, min non-zero, mean, median, rolling averages, percentiles, peak-to-current ratio and volatility. Do not use one maximum transaction as the reorder rule.

### Seasonality & Local Trading Calendar
Support month/week/weekday patterns and configurable local seasons such as Ramadan/Eid. Seasonal adjustments require evidence and must not be fabricated.

### Supplier Intelligence
Track lead time, fill rate, price history, delays, short shipments, quality issues and concentration for suppliers where data exists.

### Price & Margin Intelligence
Track purchase cost, selling price, margin compression, customer pricing and price behavior. External competitor pricing is only used when a reliable external source is explicitly connected.

### Opportunity Detection
Find rising-demand/understocked products, frequently requested unavailable products, substitute behavior, cross-sell opportunities, under-served segments and products whose demand grows faster than inventory.

### Anomaly & Shock Detection
Separate business anomalies from data anomalies: sales spikes/drops, return spikes, negative stock, unusual adjustments, price shocks, customer concentration shifts and impossible quantities.

## New — Decision Intelligence
- Velocity → forecast → coverage → stockout → alternatives → lost sales → evidence → replenishment.
- Decision arbitration uses impact, urgency, confidence, liquidity, customer impact and freshness.
- Actions: do_not_reorder, monitor, reorder_sku, reorder_group, investigate, follow_up_customer, review_supplier, review_price.
- Every decision includes evidence period, transactions, sources, data quality, assumptions, algorithm/profile version and confidence.
- No automated purchase execution without explicit authorization.

## New — Daily Trader Advisor
Dashboard must answer in under one minute:
1. What changed?
2. What is accelerating?
3. What is slowing/stagnating?
4. What may run out?
5. What cash is trapped?
6. Which customers need attention?
7. What sales may have been lost?
8. What should be bought?
9. What should not be bought?
10. What are today's highest-impact decisions?

Use an action queue with opened → acknowledged → actioned → resolved → reopened lifecycle and suppress repeated alerts until state changes or escalation thresholds are crossed.

## New — Multi-Scenario Planning
Support deterministic what-if scenarios:
- demand +10/+20/+30%
- supplier delay
- price changes
- cash budget limits
- key SKU stockout
- substitute availability.
Show expected stock, cash, sales protection and risk changes.

## New — Evidence, Governance & Trust
- No fabricated market size, customer demand, competitor pricing or historical facts.
- No silent ERP mapping.
- No source deletion.
- No cross-tenant learning leakage.
- No purchase execution without authorization.
- Every transformation replayable and auditable.
- Low evidence produces cautious output.

## New — Premium Product UX
- Mobile-first Arabic RTL with desktop command center.
- Executive cockpit, decision queue and daily digest.
- Command palette and keyboard shortcuts.
- Saved views, filters and grouping.
- Drill-down drawers from KPI → evidence → source rows → report → file.
- Progressive loading and responsive background processing.
- Restrained gradients, accessible contrast, semantic status colors and consistent design tokens.
- Visual polish must never obscure confidence or evidence.

## Performance Architecture
- Parse once and cache normalized artifacts.
- Incremental row reconciliation.
- Precomputed daily aggregates.
- Background workers/agent queues.
- Bounded concurrency/backpressure.
- Partition history by tenant/time/report family.
- Progressive UI updates.
- Detailed evidence available without loading whole datasets.

## Quality & Production Gates
- Folder import, watcher stability, idempotency and security.
- Incremental reconciliation and fallback-to-full-reprocess.
- Lineage/change-digest contract.
- Data-quality score.
- Schema drift/conflict resolution.
- Deterministic replay.
- Schema registry and vendor-profile regression fixtures.
- Mapping-confidence/no-hallucination.
- Demand calculations and stockout-aware demand tests.
- SKU/customer relationship correctness.
- Seasonal and rolling-window correctness.
- Replenishment and liquidity decision determinism.
- Cross-tenant authorization.
- Large dataset performance/memory/pagination.
- Integration/load/security production hardening.
- Release only after all mandatory gates pass.

## Active / Completed Implementation Units
Existing completed units remain authoritative; new specifications must reuse existing canonical engines rather than create parallel calculation paths.
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
- `src/lib/free-toolbox/sales-demand-series.ts`
- `src/lib/import/batch-folder.ts`
- `src/components/FolderBatchImportPanel.tsx`
- `src/pages/ImportPage.tsx`
- `src/pages/AlternativeGroupsPage.tsx`
- `src/pages/InventoryIntelligencePage.tsx`
- `src/pages/DemandVelocityPage.tsx`
- `docs/REPORT_FORMATS_YEMEN_ARAB_ERP.md`
- `docs/MARKET_DEMAND_INTELLIGENCE_SPEC.md`

## Next Execution Sequence
1. Connect real time-series demand to grouped demand and days-of-cover.
2. Implement stockout-aware demand and lost-sales history.
3. Implement SKU × customer demand memory and continuity signals.
4. Implement high/low/typical movement and rolling/percentile baselines.
5. Implement early demand surge and stagnation detection.
6. Implement liquidity classification and merchant dependence map.
7. Implement forecast-aware replenishment and purchase timing.
8. Build Report Schema Registry and Onyx Pro regression fixtures.
9. Add Local Sync Agent continuous watcher.
10. Add incremental reconciliation ledger and immutable snapshots.
11. Add lineage graph, Data Quality Score and Schema Drift.
12. Build Daily Trader Advisor + Decision Queue + Change Digest UI.
13. Integrate What-if/Scenario Engine with commercial decisions.
14. Add cross-tenant, golden-data, load and deterministic replay tests.
15. Polish mobile RTL/desktop UX with the unified design system.
16. Run full CI and production hardening; fix every failure before release.
