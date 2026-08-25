# Secondary Agent — Approved Task Matrix

Repository: `Report-Engainall/Report-Advisor`

Branch: `parallel/secondary-agent-evidence-ux`

Primary integration target: `phase-8-9-completion`

Primary authority: main execution agent. Do not merge independently.

## Batch 08 execution status — 2026-08-25

Batch 08 adds no new product UI and no Core engine. It adds a runtime-readiness audit, tenant certification matrix, and one executable CI contract over the existing authoritative document, Data Quality, reconciliation, K/L runtime and migration boundaries.

| Task | Status | Notes |
|---|---|---|
| Evidence Graph Runtime Readiness | GATED / LIVE REQUIRED | Existing Phase K/L evidence persistence is reused. Downstream page/table/row/column/cell/entity/canonical/metric/report/action/outcome runtime identifiers remain unproven. |
| Document Intelligence Lineage Audit | GAP / MAINLINE DEPENDENCY | Current `DocumentExtractionEnvelope` carries plan/backend/stage/warnings/facts/source/page/confidence; complete IR and cell lineage are not represented. No parser or envelope replacement created. |
| Reconciliation Runtime Readiness | GATED / LIVE REQUIRED | Existing `ReconciliationResult` is authoritative. Persistence and row-level evidence remain runtime-owned. |
| Data Quality Evidence | GATED / LIVE REQUIRED | `fetchDataQualityDatasets()` uses bounded projections and delegates tenant scope to canonical Supabase RLS. Live score/source parity is not proven. |
| Tenant/RLS Verification Preparation | BLOCKED / LIVE REQUIRED | Matrix and expected outcomes are prepared; real isolated Supabase execution is required. No RLS change made. |
| CI/Quality Dependency Audit | MAINLINE DEPENDENCY | Existing TypeScript/ESLint/Build blockers overlapping PR #20 are not duplicated. |
| Runtime Certification Checklist | GATED | Single executable readiness matrix added; certification state remains evidence-driven. |
| Golden Corpus | GATED | Existing corpus retained; no new fixtures were justified. |
| Free-first audit | GATED | No paid provider or mandatory cloud dependency introduced. |

## Batch 08 executable audit

`npm run test:secondary-batch08-runtime-readiness`

The audit performs static contract/readiness checks and explicitly emits `BLOCKED` for live-only evidence. It exits non-zero only for an actual static contract failure; blocked live prerequisites are not converted into PASS or hidden.

## Existing approved task matrix

## A. NOW / PARALLEL — execute these

## A1. Evidence Workspace

Implement the reusable Evidence Workspace UI:
- source/file explorer;
- page/table/row/column/cell navigation;
- evidence detail;
- lineage breadcrumb/tree;
- metric → evidence → source drill-through;
- source preview using secure existing references;
- evidence completeness state;
- UNKNOWN/INSUFFICIENT_EVIDENCE;
- blocked state;
- loading/error/empty states;
- RTL/LTR and accessibility.

Do not create a second lineage schema.

## A2. Decision Replay

Implement read-only presentation for:
- decision ID;
- immutable snapshot;
- metrics;
- evidence;
- rule version;
- model version;
- multidimensional confidence;
- recommendation;
- approval;
- action;
- expected impact;
- actual outcome.

## A3. Decision Diff

Implement deterministic snapshot comparison UI:
- metric changes;
- evidence/source changes;
- freshness changes;
- confidence changes;
- forecast changes;
- rule/model changes;
- explanation of differences.

## A4. Report Snapshots / Report Diff UI

Implement presentation and navigation for immutable report snapshots:
- Report ID;
- Snapshot ID;
- Data As Of;
- metric/rule/mapping versions;
- filters;
- evidence;
- confidence;
- generated time;
- A vs B comparison.

Do not change metric truth.

## A5. Multi-Dimensional Trust UI

Prepare reusable trust visualization for:
- Data;
- Extraction;
- Mapping;
- Entity Resolution;
- Validation;
- Calculation;
- Forecast;
- Decision;
- Overall Trust with explanation.

The UI consumes supplied values; it does not invent confidence.

## A6. Data Quality Center UI

**Batch 02: FOUNDATION. Batch 03–07: FOUNDATION / LIVE REQUIRED for authoritative quality scores.**

Implement views for:
- completeness;
- uniqueness;
- validity;
- consistency;
- freshness;
- reconciliation;
- anomalies;
- owner;
- severity;
- remediation;
- history.

## A7. Business Control Plane UI

**Batch 02: FOUNDATION. Batch 03–07: FOUNDATION / GATED.**

Implement operational overview for:
- imports;
- jobs;
- freshness;
- data quality;
- failed tasks;
- AI provider state;
- storage;
- workers;
- backup state;
- evidence health;
- system health.

Always distinguish LIVE/UNKNOWN/NOT CONFIGURED/FAILED.

## A8. Document Intelligence Workspace UI

**Batch 02: FOUNDATION. Batch 03–07: FOUNDATION / LIVE REQUIRED.**

Implement document inspection experience:
- preview;
- pages;
- detected tables;
- OCR text;
- fields/cells;
- confidence;
- mapping;
- validation;
- rejected rows;
- quarantine;
- manual correction surface;
- reprocess surface;
- lineage.

Use existing import/document contracts.

## A9. Golden Corpus

**Batch 02: FOUNDATION. Batch 03–07: GATED with executable expectations.**

Create safe deterministic fixtures for:
- Arabic tabular input;
- English tabular input;
- scanned-document representation;
- headerless data;
- bad headers;
- duplicate records;
- missing fields;
- merged cells;
- multi-table documents;
- tables spanning pages;
- reconciliation mismatch;
- UNKNOWN evidence.

No real customer/business secrets.

## A10. Smart Reconciliation presentation

**Batch 02: FOUNDATION. Batch 03–07: FOUNDATION / LIVE REQUIRED for authoritative result wiring.**

Prepare UI/read models for:
- source row count vs canonical row count;
- totals comparison;
- duplicates;
- unmatched entities;
- missing fields;
- suspicious differences;
- rejection reasons;
- remediation guidance.

Do not replace the primary reconciliation engine.

## A11. Schema Discovery presentation

**Batch 02: FOUNDATION.**

Prepare UI for headerless/unstructured input:
- detected header;
- detected column types;
- sections;
- multiple tables;
- merged cells;
- proposed mapping;
- confidence;
- manual confirmation.

## A12. Command Palette 2.0 — safe command surfaces

Extend the existing palette with navigation/search commands where the underlying action already exists:
- search reports;
- open entity;
- inspect evidence;
- compare snapshots;
- replay decision;
- open imports/jobs;
- navigate to control plane.

Do not create unsafe execution commands.

## A13. Saved Views

Implement or improve persistence/presentation for:
- filters;
- grouping;
- columns;
- sorting;
- dashboard state;
- report state.

Sharing must remain tenant-scoped.

## A14. Cross-filtering / Drill-through UI

Build reusable filter propagation and navigation components for:
Company → Branch → Warehouse → Category → Product → Invoice → Line → Evidence.

Do not change canonical metric definitions.

## A15. Alerts / Notification presentation

Improve alerts so they can display:
- priority;
- severity;
- evidence;
- reason;
- suggested action;
- assignment;
- snooze;
- deduplication state.

Notification wording should answer:
What happened? Why does it matter? What is the evidence? What can I do?

---

# B. PREPARE — implement only isolated foundations

## B1. Evidence Graph contract adapters
## B2. Decision Graph presentation model
## B3. Outcome Graph presentation model
## B4. Semantic Metric Layer UI/governance surfaces
## B5. Decision Safety Center UI
## B6. Why Not UI
## B7. Ask → Inspect → Act shell
## B8. Universal Document Envelope adapters/types
## B9. Data Contracts / Schema Drift presentation
## B10. Release Provenance display
## B11. Production Health Score presentation
## B12. Low-Bandwidth UX
## B13. i18n/mobile readiness
## B14. Audit Explorer UI
## B15. Security Center UI
## B16. Explainability UI
## B17. Alternative Recommendations UI

These remain PREPARE unless explicitly promoted by the primary execution stream.

---

# C. DEFER — primary agent implements after core closure

Central Semantic Metric Engine implementation; Central Decision/Outcome persistence model; Canonical Evidence Graph database model if current lineage cannot safely extend; Canonical Import Engine changes; Headerless extraction engine changes; Universal parser runtime replacement; AI Provider Registry backend; AI Model Routing backend; Browser AI requirement changes; Private/Offline architecture changes that alter deployment/runtime; Hybrid Retrieval backend/security model; AI Research Mode backend; Executive Decision Center calculations; Inventory/Demand/Customer/Supplier intelligence calculations; Scenario calculation engine; Action execution engine; Approval workflow enforcement; Autonomous actions; Optimization engine; Business simulation engine; Learning/threshold auto-adjustment; Multi-currency accounting truth; Multi-branch canonical authorization/data model; Backup/restore architecture; Production certification changes.

---

# D. Explicitly avoid for now

Do not add paid providers, mandatory cloud AI, new SaaS dependencies, microservices without proven need, duplicate databases, duplicate lineage engines, duplicate metric engines, duplicate import engines, speculative autonomous agents, or large redesigns unrelated to assigned tasks.

The product remains **Free/Local first** and **KEEP + IMPROVE**.

---

# E. Completion criteria for every task

A task is only COMPLETE when:
1. Existing implementation was inspected first.
2. No existing feature was removed.
3. Code is implemented in the assigned branch.
4. Relevant tests exist and actually run.
5. Typecheck/lint is clean where applicable.
6. No fake business data is used.
7. UNKNOWN is preserved where evidence is missing.
8. Tenant boundaries are preserved.
9. No paid dependency was introduced.
10. The handoff records files, commit, tests, limitations, and integration notes.

Otherwise mark FOUNDATION, GATED, LIVE REQUIRED, or GAP.

# F. Handoff

Create/update a Draft PR to `phase-8-9-completion` only after a coherent tested batch is complete. The primary agent decides whether and how to integrate it, resolves conflicts, runs the complete test suite, updates the master index, and performs final certification.

**Accelerate, do not compete. Preserve, do not remove.**
