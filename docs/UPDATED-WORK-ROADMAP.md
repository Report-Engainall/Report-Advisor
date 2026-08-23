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
- Universal ERP schema registry — planned; field dictionary/governance baseline added.
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
8. Add cross-tenant authorization tests across all intelligence and ingestion surfaces.
9. Add large-dataset performance, memory and pagination budgets.
10. Execute integration/load/security checks and production hardening.
11. Release only after all quality gates pass.
