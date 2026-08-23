# مساعد التاجر — Updated Work Roadmap

## New — Continuous Governed Folder Report Ingestion
- Preserve the existing manual single-file import path unchanged.
- Preserve the existing user-selected folder batch path.
- Add **continuous watched-folder ingestion**: after the user explicitly grants a folder, the Local Sync Agent watches for new/changed report files and automatically queues them without requiring a manual button click for every file.
- Support configurable polling/watch mode, debounce, retry policy, file-stability detection and a safe processed-file ledger.
- Never ingest a file while it is still being written; wait until size/mtime/hash are stable.
- Reuse security scan, format detection, SHA-256 duplicate check, canonical parser and canonical commit/RPC path.
- Per-file isolation: one corrupt/unsupported file must never stop other files.
- Persist per-file lifecycle: discovered → waiting/stable → scanning → detected → mapped → preview/approved (when required) → committed/quarantined/failed.
- Expose pause/resume, retry, quarantine and audit history.
- Keep tenant isolation and least-privilege filesystem access mandatory.
- Browser-only deployments use explicit File System Access API selection; arbitrary `C:\` or UNC text paths are never treated as filesystem permissions.
- Network/UNC and true continuous watching require the planned Local Sync Agent running on the user's Windows machine/server.
- Add explicit recursive-folder option with bounded depth, exclusions and performance limits.
- Add backpressure/concurrency controls so large folders do not freeze the application or overload parsing/DB.
- Quality gates: `test:folder-batch-import` plus watcher/idempotency/stability/security gates.

## New — Continuous Incremental Report Intelligence
- Treat the folder as a **living source**, not a one-time upload.
- On day one, discover every supported report file, classify it, map it to a canonical report family, process it through the full intelligence pipeline and build the initial evidence/history state.
- On later runs, detect whether a file is unchanged, appended, revised, replaced or newly created.
- For unchanged files: skip content processing safely while retaining lineage and last-known state.
- For appended/changed tabular reports: identify the previously committed boundary and process only genuinely new/changed rows where the source semantics allow reliable incremental reconciliation.
- Use stable row identity where available (document number + line number/ID + date + SKU + source fingerprint); otherwise use deterministic row fingerprints and conservative reconciliation.
- If the source can reorder/delete rows or revise historical records, automatically switch from append-only optimization to a bounded reconciliation window or full reprocessing as required for correctness.
- Never assume "new rows only" is safe merely because the file timestamp changed.
- Maintain source-file version, hash, row count, row fingerprint ledger, first-seen/last-seen timestamps and processing cursor/boundary.
- Maintain report lineage: source file → report profile → mapped columns → normalized rows → derived metrics → decisions → evidence.
- Recalculate all dependent intelligence after valid changes: KPIs, trends, demand velocity, seasonality, forecasts, stock coverage, stockout risk, lost-sales estimates, liquidity signals, customer continuity, alerts and decision priorities.
- Keep historical snapshots so the trader can compare today vs yesterday and understand what changed.
- Produce a daily **change digest**: new transactions, revised transactions, removed/reversed transactions when detectable, changed KPIs, new risks, resolved risks and recommended actions.
- Run processing asynchronously in background workers/agent queues; UI remains responsive and exposes progress rather than blocking.
- Permit slower deep processing for large reports while maintaining deterministic results and resumability.
- Failed files/rows are quarantined with actionable evidence and do not block other reports.
- The system may take longer to process a large first import when that improves validation and accuracy; correctness is prioritized over superficial speed.

## New — Data Change Intelligence & Lineage
- Introduce a first-class **Change Set** abstraction: file change → row change → semantic change → affected metric → affected decision.
- Classify changes as `new`, `modified`, `deleted_or_missing`, `reversed`, `duplicate`, `unchanged`, `schema_changed` and `unresolved`.
- Never treat a changed file as changed business data until row-level reconciliation proves it.
- Provide deterministic row identity hierarchy: source primary key → document+line identity → stable business key → normalized row fingerprint.
- Maintain immutable source snapshots and a compact derived delta ledger so historical reconstruction remains possible without repeatedly reparsing every file.
- Track source-to-canonical-to-metric-to-decision lineage for every important number shown to the trader.
- Make every intelligence result explainable with source evidence, period, row count, freshness, transformation/version and confidence.
- Add **Data Quality Score** per file/report/dataset with explicit reasons: missing fields, invalid types, duplicates, conflicts, suspicious values, stale periods and unmapped columns.
- Add **Schema Drift Detection**: when headers, types, sheet structure or semantic patterns change, quarantine the affected profile rather than silently applying stale mappings.
- Add **Source Conflict Resolution** when two files overlap: classify as append/replace/duplicate/conflict and require evidence before replacing authoritative data.
- Add deterministic replay: the same source snapshot + same parser/profile version must produce the same canonical result.

## New — Daily Trader Advisor / Change Digest
- Add a daily executive summary generated from actual processed changes, not generic narrative.
- Show: what changed, what matters, what became risky, what improved, what needs action and what evidence supports each point.
- Prioritize by business impact, urgency, confidence, liquidity impact, customer impact and data freshness.
- Suppress repeated alerts until state changes or a defined escalation threshold is reached.
- Track alert lifecycle: opened → acknowledged → actioned → resolved → reopened.
- Allow drill-down from a recommendation to the exact report, file, rows and calculations behind it.
- Maintain yesterday-vs-today and period-vs-period comparisons.

## New — Universal ERP / Accounting Report Recognition
- Build a versioned **Report Schema Registry** covering Arabic/English accounting exports, beginning with Onyx Pro and extending to Al-Mutakamil, Raqish and other systems as evidence/export samples become available.
- Use `docs/REPORT_FORMATS_YEMEN_ARAB_ERP.md` as the canonical field/synonym dictionary and governance baseline.
- Recognize reports from multiple signals: report title, workbook sheet names, headers, column order, data types, sample values, formulas, merged cells and known profile fingerprints.
- Normalize Arabic/English headers, Arabic/Latin digits, punctuation, whitespace, common abbreviations, diacritics and date/currency representations.
- Maintain canonical fields for documents, parties, products, inventory, financial/ledger data, dates/periods and report metadata.
- Maintain report-family signatures for sales, purchases, inventory, item movement, customer/supplier statements, general ledger, journals, cash/bank, profit/loss and balance-sheet style exports.
- Do not claim a vendor-specific header exists unless it is backed by a real export, official template/documentation, or an approved tenant mapping.
- Store original headers and canonical mapping evidence; never destroy source semantics.
- Confidence scoring and ambiguity quarantine are mandatory. No silent guessing.
- Learn approved tenant-specific aliases and reuse them only for matching profile fingerprints.
- Version all schema profiles and mapping changes with audit history.
- Manual mapping remains the fallback for every unknown format; approved mappings can be promoted into reusable profiles.
- Detect changed report layouts and route them to review instead of silently applying stale mappings.
- Quality gates: schema-registry contract, profile regression fixtures, mapping-confidence gate and no-hallucination mapping gate.

## ERP Priority Coverage
- Onyx Pro is the first-class target because of its expected prevalence in the target market.
- The registry must support report families rather than a single Onyx report: sales, purchases, sales returns, purchase returns, inventory balances, item movement/stock cards, customers, suppliers, customer statements, supplier statements, receivables, payables, cash, bank, journal entries, general ledger, trial balance, profit/loss, balance sheet, taxes and other operational/accounting reports exposed by a customer's export.
- Al-Mutakamil and Raqish receive the same canonical coverage, with vendor-specific aliases added only from evidence.
- For every supported family, define canonical fields as required/optional and preserve all unmapped source columns instead of dropping them.
- "All fields" means comprehensive canonical coverage plus versioned vendor-specific profiles; it does **not** mean inventing undocumented vendor headers. Actual customer exports/templates are the authority for exact vendor spellings.

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
- Real sales time-series demand query for 30/90/180/365-day windows — completed.
- Demand velocity page with acceleration/decline/peak metrics — completed.
- Demand velocity route `/reports/demand-velocity` — completed.
- Demand velocity sidebar navigation — completed.
- Demand velocity contract gate — completed.
- Folder batch import panel alongside manual import — completed at architecture/UI level.
- Folder batch import engine with per-file isolation and canonical commit path — completed.
- Continuous watcher — planned for Local Sync Agent execution.
- Continuous incremental reconciliation — planned.
- Universal ERP schema registry — planned; field dictionary/governance baseline added.
- Data change intelligence, lineage and daily digest — planned.
- Important boundary: demand/request history is never fabricated; missing history returns an explicit empty state.
- Next: connect time-series output to grouped demand and days-of-cover.
- Next: dashboard decision cards with evidence/confidence and actionable priorities.
- Next: historical peak-vs-current views and group drill-down.

## Quality & Production Gates
- Inventory intelligence deterministic boundary checks.
- Alternative-group tenant isolation/security fixture.
- Alternative-group schema contract check.
- Decision dashboard contract check.
- Inventory intelligence UI contract check.
- Demand velocity contract check.
- Folder batch import contract check.
- Watcher stability/idempotency/security gates.
- Incremental reconciliation correctness and fallback-to-full-reprocess gate.
- Lineage/change-digest contract gate.
- Data-quality scoring gate.
- Schema-drift/conflict-resolution gate.
- Deterministic replay gate.
- Schema registry contract and vendor-profile regression fixtures.
- Mapping-confidence/no-hallucination gate.
- Package commands for inventory intelligence, security, schema, dashboard, UI, demand and folder import checks.
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
- `src/lib/free-toolbox/sales-demand-series.ts`
- `src/lib/import/batch-folder.ts`
- `src/components/FolderBatchImportPanel.tsx`
- `src/pages/ImportPage.tsx`
- `src/pages/AlternativeGroupsPage.tsx`
- `src/pages/InventoryIntelligencePage.tsx`
- `src/pages/DemandVelocityPage.tsx`
- `supabase/migrations/20260819230000_alternative_item_groups.sql`
- `scripts/check-inventory-intelligence.mjs`
- `scripts/check-alternative-group-security.mjs`
- `scripts/check-alternative-group-schema.mjs`
- `scripts/check-decision-dashboard.mjs`
- `scripts/check-inventory-intelligence-ui.mjs`
- `scripts/check-demand-velocity.mjs`
- `scripts/check-folder-batch-import.mjs`
- `docs/REPORT_FORMATS_YEMEN_ARAB_ERP.md`

## Next execution sequence
1. Connect time-series sales/request data to live grouped demand and days-of-cover.
2. Connect decision-dashboard model to an actual dashboard surface.
3. Integrate customer continuity and liquidity into replenishment ranking.
4. Add group-level forecast and normalized reorder quantities.
5. Add historical peak-vs-current and seasonal demand views.
6. Build the Report Schema Registry and Onyx Pro profile regression fixtures.
7. Add Local Sync Agent watcher with stability detection, queueing, retry and idempotency ledger.
8. Add incremental reconciliation ledger, row fingerprints/cursors and safe fallback to full reprocessing.
9. Add immutable source snapshots, lineage graph and daily change digest.
10. Add data quality score, schema drift and source conflict resolution.
11. Add deterministic replay and audit verification.
12. Add cross-tenant authorization tests across all intelligence and ingestion surfaces.
13. Add large-dataset performance, memory and pagination budgets.
14. Execute integration/load/security checks and production hardening.
15. Release only after all quality gates pass.
