# مساعد التاجر — Updated Work Roadmap

## Product North Star
Report-Advisor is a continuous commercial intelligence and decision platform for merchants. It must transform trusted operational/accounting data into an evidence-backed understanding of demand, customers, inventory, liquidity, risk and next actions — not merely display reports.

## Universal SKU Rule
Every intelligence capability is a **general rule for every eligible SKU and normalized item group**. Named products in examples are illustrative only and must never receive hard-coded analytical treatment. No SKU is excluded because it is new, slow-moving, seasonal, out of stock or historically inactive.

For every SKU/group maintain continuously updated historical memory, demand, customer relationships, stock, price/cost, supplier, liquidity, risk, forecast, evidence and action state.

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
- First ingestion builds historical baseline and evidence state for every eligible SKU/group.
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

### Universal SKU Intelligence Record
Every eligible SKU/group receives the same intelligence framework:
- identity/aliases, unit conversions and category/alternative relationships
- current/historical stock
- sales, purchases, returns and adjustments where available
- fulfilled/unfulfilled demand
- customer/supplier relationships
- price/cost/margin history
- demand baselines/forecasts
- seasonality, velocity and acceleration
- stockout exposure
- liquidity role
- stagnation/slow-moving state
- anomaly state
- evidence quality/freshness
- current recommendation/action state.

### Observed Market Capacity
For every SKU/group maintain observed merchant-market capacity, never claiming external total market size unless external data exists:
- units/value sold by day/week/month/year
- unique/active buyers and retention
- average/median/min/max order quantities
- frequency/reorder interval
- sales/revenue/margin/liquidity share
- customer/branch/channel concentration
- peaks, seasonality and acceleration/deceleration
- availability/stockouts
- fulfilled vs unfulfilled demand.

### Historical Demand Memory
Historical movement remains available even when stock is zero or current sales are low. The previously discussed "أبو 20" case is only an example: the same historical-memory rule applies to **every SKU**.

For each SKU, compare historical peaks/current period, current requests, expected demand, affected customers, stockout duration, lost-sales opportunity and replenishment guidance. Preserve historical peaks unless invalidated by data-quality rules.

### Demand vs Actual Sales
Explicitly separate fulfilled demand, unfulfilled requests, estimated lost demand, stockout-suppressed demand, seasonal expectation and one-off demand. Never interpret low sales during stockout as low demand.

### Stockout Intelligence
For every SKU/group calculate where evidence allows stockout duration/recurrence, partial availability, affected customers, unavailable requests, estimated lost units/value, opportunity cost and next likely shortage date.

### High / Low / Typical Movement
For every SKU/group maintain maximum, minimum non-zero, average, median, rolling/weighted averages, P50/P75/P90/P95/P99 where sample size supports them, peak-to-current ratio and volatility. Never use one exceptional maximum as the sole reorder rule.

### Early Demand Surge
For every SKU detect acceleration using units, order frequency, unique buyers, basket quantity, reorder interval, requests and cross-category signals. Classify normal/emerging/accelerating/surge/anomalous with evidence-scaled thresholds.

### Stagnant / Slow-Moving Inventory
For every SKU classify using days since sale, rolling movement, inventory age/value, margin, historical demand, customers, trend and seasonality. Suggest monitor/promotion/bundle/transfer/reduce purchase/liquidate/investigate. Seasonal troughs must not be mislabeled as permanent stagnation.

### Customer × SKU Intelligence
For every SKU maintain buyers, last purchase, frequency, average/peak quantity, expected reorder window, recent change, inactivity, stockout impact and requests. For every customer maintain the reciprocal SKU relationship. Answer who buys, who stopped, who is due, who was unserved and who depends on critical items.

### Customer Continuity
For every customer signal stable/at-risk/inactive/returning/expanding from cadence, spend, SKU coverage and inactivity deviations; present as signals, not certainties.

### Merchant Dependence Map
For every SKU/group/category calculate contribution by units, revenue, gross margin, cash generation and customer reach, plus concentration risk and critical supplier dependence.

### Liquidity Intelligence
For every SKU/group classify cash generator, fast cash converter, high-margin/slow-cash, cash trap, dead capital or strategic traffic driver where evidence supports it. Calculate inventory value, cash tied up, turnover, DIO, GMROI, sell-through and cash contribution where possible.

### Purchase Timing / Replenishment
For every SKU continuously evaluate current/available stock, forecast, safety stock, reorder point, lead-time demand, supplier reliability, order cycle, seasonal peak, MOQ/unit conversion and pending customer demand. Recommend reorder now/prepare/monitor/maintain/reduce/do-not-reorder/investigate with evidence and confidence.

### Seasonality & Historical Comparison
Every SKU supports today-vs-yesterday, week-vs-week, month-vs-month, same-period-last-year when available, rolling 7/30/90/180/365-day windows, peak-vs-current and stock-vs-historical-demand views. Missing history is explicit.

### Supplier / Price / Margin / Opportunity / Anomaly Intelligence
Link supplier reliability, costs, prices, margins, returns, substitutes, cross-sell, under-served demand and anomaly detection to the same SKU intelligence record rather than isolated reports.

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
5. Which historically strong items are understocked?
6. What cash is trapped?
7. Which customers need attention?
8. What sales may have been lost?
9. What should be bought?
10. What should not be bought?
11. What are today's highest-impact decisions?

Use an action queue with opened → acknowledged → actioned → resolved → reopened lifecycle and suppress repeated alerts until state changes or escalation thresholds are crossed.

## New — Multi-Scenario Planning
Support deterministic what-if scenarios for demand changes, supplier delay, price changes, cash budget limits, key SKU stockouts and substitute availability. Show expected stock, cash, sales protection and risk changes.

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
- Universal SKU coverage tests: every analytical engine must work across all eligible SKUs/groups, not just fixtures/examples.
- Demand calculations and stockout-aware demand tests.
- SKU/customer relationship correctness.
- Historical peak/current and rolling-window correctness.
- Surge/stagnation classification tests.
- Replenishment/liquidity decision determinism.
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
1. Connect real time-series demand to grouped demand and days-of-cover for every eligible SKU/group.
2. Implement stockout-aware demand and lost-sales history for every SKU.
3. Implement SKU × customer demand memory and continuity signals.
4. Implement high/low/typical movement, rolling baselines and percentile bands.
5. Implement early demand surge and stagnation detection across all SKUs.
6. Implement liquidity classification and merchant dependence map across all SKUs/groups.
7. Implement forecast-aware replenishment and purchase timing across all SKUs.
8. Build Report Schema Registry and Onyx Pro regression fixtures.
9. Add Local Sync Agent continuous watcher.
10. Add incremental reconciliation ledger and immutable snapshots.
11. Add lineage graph, Data Quality Score and Schema Drift.
12. Build Daily Trader Advisor + Decision Queue + Change Digest UI.
13. Integrate What-if/Scenario Engine with commercial decisions.
14. Add universal-SKU golden datasets, cross-tenant, load and deterministic replay tests.
15. Polish mobile RTL/desktop UX with the unified design system.
16. Run full CI and production hardening; fix every failure before release.
