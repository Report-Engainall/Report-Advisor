# Secondary Agent — Approved Task Matrix

Repository: `Report-Engainall/Report-Advisor`

Branch: `parallel/secondary-agent-evidence-ux`

Primary integration target: `phase-8-9-completion`

Primary authority: main execution agent. Do not merge independently.

## Purpose

This file converts Document 02 into an **approved parallel work plan**. It deliberately selects only work that can accelerate the product without destabilizing the current core runtime. Larger changes that touch canonical truth, security, migrations, or production certification remain deferred to the primary execution stream.

---

# Batch 02 execution status — 2026-08-25

Batch 02 has been implemented as an isolated presentation/read-model foundation on `parallel/secondary-agent-evidence-ux`.

| Task | Status | Notes |
|---|---|---|
| A6 Data Quality Center | FOUNDATION | Read-model UI added; existing Data Quality query boundary preserved; live wiring remains required. |
| A7 Business Control Plane | FOUNDATION | Existing control-plane contracts preserved; UI consumes supplied signals only. |
| A8 Document Intelligence Workspace | FOUNDATION | Existing document/import contracts are consumed through typed read models; no new import engine. |
| A9 Golden Corpus | FOUNDATION | Synthetic deterministic CSV/text/JSON fixtures added; no customer data. |
| A10 Smart Reconciliation presentation | FOUNDATION | Read-only presentation; no second reconciliation engine. |
| A11 Schema Discovery presentation | FOUNDATION | Read-only presentation; no second schema engine. |
| A1 Evidence Workspace improvement | FOUNDATION | Batch 01 remains authoritative UI foundation; Batch 02 adds evidence-aware contract compatibility. |

Test execution through the connected GitHub tool was **SKIPPED** because the available connector does not expose a local Node/npm/browser runtime and no workflow-dispatch operation is available. No PASS claim is made.

No paid dependency was introduced. No Core Engine was duplicated. No main merge was performed.

---

# Batch 03 execution status — 2026-08-25

Batch 03 focuses on runtime read-model closure and integrity rather than adding a new feature surface.

| Task | Status | Notes |
|---|---|---|
| Runtime Read-Model Wiring | FOUNDATION / LIVE REQUIRED | Existing Data Quality, Business Control Plane, Document Intelligence, and Evidence boundaries are consumed through adapters; Smart Reconciliation remains LIVE REQUIRED until its authoritative result is exposed. |
| UNKNOWN / BLOCKED Integrity | FOUNDATION | Missing/stale/unavailable/insufficient evidence is preserved as UNKNOWN/NOT CONFIGURED/BLOCKED/ERROR. |
| Evidence Deep-Link Preparation | FOUNDATION | Optional source_id/evidence_id/snapshot_id/lineage_id/metric_id/decision_id fields added; absent IDs are not invented. |
| Golden Corpus Harness | FOUNDATION | CI-ready harness added with PASS/FAIL/SKIPPED classification. |
| Contract Regression Guarding | FOUNDATION | Existing Data Quality and Business Control read boundaries are reused; no Core contract is replaced. |
| Accessibility / UX Hardening | FOUNDATION | Keyboard focus, status semantics, live-region notices, table captions/scoped headers, and RTL preservation improved. |
| Performance Guarding | FOUNDATION | New control-plane reads use explicit projections and limit(1); no unbounded secondary bulk read introduced. |

Batch 03 is **not COMPLETE**. Runtime execution, full CI, and primary-agent certification remain required.

---

# Existing approved task matrix

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

**Batch 02: FOUNDATION. Batch 03: FOUNDATION / LIVE REQUIRED for authoritative quality scores.**

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

**Batch 02: FOUNDATION. Batch 03: FOUNDATION.**

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

**Batch 02: FOUNDATION. Batch 03: FOUNDATION / LIVE REQUIRED.**

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

**Batch 02: FOUNDATION. Batch 03: FOUNDATION.**

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

**Batch 02: FOUNDATION. Batch 03: LIVE REQUIRED for authoritative result wiring.**

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
