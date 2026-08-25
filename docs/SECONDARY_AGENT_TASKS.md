# Secondary Agent — Approved Task Matrix

Repository: `Report-Engainall/Report-Advisor`

Branch: `parallel/secondary-agent-evidence-ux`

Primary integration target: `phase-8-9-completion`

Primary authority: main execution agent. Do not merge independently.

## Purpose

This file converts Document 02 into an **approved parallel work plan**. It deliberately selects only work that can accelerate the product without destabilizing the current core runtime. Larger changes that touch canonical truth, security, migrations, or production certification remain deferred to the primary execution stream.

## Priority model

- **NOW / PARALLEL:** safe, isolated, useful now.
- **PREPARE:** build contracts/UI/fixtures only; backend truth remains primary-owned.
- **DEFER:** do not implement yet; reserve for the stage shown.
- **REJECT FOR NOW:** avoid because it adds complexity/cost without enough current value.

---

# A. NOW / PARALLEL — execute these

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

Prepare adapters/types/components around the existing lineage model so it can eventually represent:
Source → Page → Table → Row → Column → Cell → Extracted → Normalized → Entity → Canonical → Metric → Report → Decision → Action → Outcome.

Do not replace the existing lineage implementation.

## B2. Decision Graph presentation model

Prepare read-only graph components for:
Metric → Condition → Risk → Recommendation → Approval → Action.

## B3. Outcome Graph presentation model

Prepare:
Action → Expected Impact → Actual Outcome → Variance → Learning.

## B4. Semantic Metric Layer UI/governance surfaces

Prepare interfaces for metric metadata:
- metric ID;
- definition;
- formula reference;
- source reference;
- dimensions;
- filters;
- time semantics;
- freshness;
- owner;
- version;
- dependencies;
- evidence.

Do not create competing formulas or SQL truth.

## B5. Decision Safety Center UI

Prepare views for:
- allowed decisions;
- blocked decisions;
- block reason;
- freshness;
- evidence completeness;
- confidence;
- approval requirements.

## B6. Why Not UI

Prepare explanation surfaces for negative/blocked decisions:
- why not recommended;
- why evidence insufficient;
- why freshness blocked it;
- which condition failed.

No invented explanations: display only deterministic/evidence-backed reasons.

## B7. Ask → Inspect → Act shell

Prepare the UX flow only:
Ask → plan → quality → calculation → evidence → explanation → inspect → approval → action.

The deterministic query/calculation engine remains primary-owned.

## B8. Universal Document Envelope adapters/types

Prepare typed interfaces and test fixtures for:
- metadata;
- pages;
- blocks;
- tables;
- cells;
- coordinates;
- text;
- confidence;
- parser version;
- source hash.

Do not make Docling/PaddleOCR/Tesseract mandatory.

## B9. Data Contracts / Schema Drift presentation

Prepare UI/reporting for:
- expected schema;
- field/type expectations;
- freshness;
- tolerance;
- reconciliation rules;
- version;
- drift detection;
- suggested mapping;
- approval state.

## B10. Release Provenance display

Prepare UI for release evidence:
- commit;
- migration version;
- metric version;
- rule version;
- model version;
- corpus version;
- artifact identity.

Do not alter production certification gates.

## B11. Production Health Score presentation

Prepare a scorecard that never hides detail:
Security / Data / Jobs / AI / Storage / Backup / Performance / Evidence / Decision Safety.

It must link each score to underlying evidence.

## B12. Low-Bandwidth UX

Implement safe performance improvements:
- reduced payloads where supported;
- progressive loading;
- cached metadata;
- reduced unnecessary animation;
- retry queue presentation;
- offline-friendly deterministic views.

Do not remove features.

## B13. i18n/mobile readiness

Prepare components and layouts for:
- Arabic RTL;
- English LTR;
- dates;
- numbers;
- currencies;
- timezone;
- responsive/mobile layouts;
- deep-link-safe navigation.

Do not create a separate mobile app.

## B14. Audit Explorer UI

Prepare searchable presentation for:
- login;
- imports;
- changes;
- approvals;
- AI requests;
- recommendations;
- actions;
- exports;
- permission changes.

## B15. Security Center UI

Prepare presentation for:
- sessions;
- roles;
- policies;
- security events;
- provider access;
- API access;
- storage access.

Do not change authorization policies independently.

## B16. Explainability UI

Prepare reusable cards/panels for:
- summary;
- evidence;
- calculation reference;
- assumptions;
- uncertainty;
- alternatives;
- blocking reason.

## B17. Alternative Recommendations UI

Prepare comparison surface for Option A/B/C:
- expected benefit;
- cost reference;
- risk;
- confidence;
- evidence.

Only consume approved backend recommendations.

---

# C. DEFER — primary agent implements after core closure

These are valuable but should not be built in the parallel branch now because they touch authoritative architecture or require proven foundations:

1. Central Semantic Metric Engine implementation.
2. Central Decision/Outcome persistence model.
3. Canonical Evidence Graph database model if current lineage cannot safely extend.
4. Canonical Import Engine changes.
5. Headerless extraction engine changes.
6. Universal parser runtime replacement.
7. AI Provider Registry backend.
8. AI Model Routing backend.
9. Browser AI requirement changes.
10. Private/Offline architecture changes that alter deployment/runtime.
11. Hybrid Retrieval backend/security model.
12. AI Research Mode backend.
13. Executive Decision Center calculations.
14. Inventory intelligence calculations.
15. Demand intelligence/forecasting engine.
16. Customer intelligence/credit calculations.
17. Supplier intelligence calculations.
18. Scenario calculation engine.
19. Action execution engine.
20. Approval workflow enforcement.
21. Autonomous actions.
22. Optimization engine.
23. Business simulation engine.
24. Learning/threshold auto-adjustment.
25. Multi-currency accounting truth.
26. Multi-branch canonical authorization/data model.
27. Backup/restore architecture.
28. Production certification changes.

---

# D. Feature roadmap for later stages

## P0 — after Runtime E2E is proven

1. Evidence Graph.
2. Semantic Metric Layer.
3. Report Snapshots.
4. Decision Replay.
5. Decision Diff.
6. Outcome Feedback.
7. Document Intelligence Workspace.
8. Golden Corpus.
9. Data Quality Center.
10. Business Control Plane.

## P1 — after P0 is integrated

11. Ask → Inspect → Act.
12. Why Not Intelligence.
13. Scenario Studio.
14. Action Center.
15. Approval Workflows.
16. Hybrid Retrieval.
17. Executive Decision Center.
18. Inventory Intelligence.
19. Demand Intelligence.
20. Customer Intelligence.
21. Supplier Intelligence.
22. Saved Views.
23. Cross-filtering.
24. Drill-through.
25. Alerts Intelligence.
26. Notification Intelligence.

## P2 — after governance/security are mature

27. Knowledge Layer.
28. Business Rules Studio.
29. Metric Governance Studio.
30. Optimization Engine.
31. Business Simulation.
32. Learning from Outcomes.
33. Low-Bandwidth Mode expansion.
34. Mobile-ready expansion.
35. Multi-currency.
36. Multi-branch.
37. Advanced controlled autonomous actions.

---

# E. Explicitly avoid for now

Do not add:
- paid providers;
- mandatory cloud AI;
- new SaaS dependencies;
- microservices without proven need;
- duplicate databases;
- duplicate lineage engines;
- duplicate metric engines;
- duplicate import engines;
- speculative autonomous agents;
- large redesigns unrelated to assigned tasks.

The product remains **Free/Local first** and **KEEP + IMPROVE**.

---

# F. Completion criteria for every task

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

# G. Handoff

Create a Draft PR to `phase-8-9-completion` only after a coherent tested batch is complete.

The primary agent decides whether and how to integrate it, resolves conflicts, runs the complete test suite, updates the master index, and performs final certification.

**Accelerate, do not compete. Preserve, do not remove.**
