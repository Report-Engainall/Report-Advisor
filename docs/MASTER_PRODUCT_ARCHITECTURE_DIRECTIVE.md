# Report-Advisor — Master Product & Architecture Directive

**Status:** Authoritative working directive for product direction and development acceptance  
**Scope:** Product, UX, Architecture, Data, Evidence, Decision Intelligence, AI, Reporting, Security, Runtime, Governance, Reliability  
**Production:** HOLD until explicit release approval  

> This document is a durable project anchor. It exists to prevent loss of product vision, requirements, architectural intent, and acceptance principles across waves, contributors, and time.

## 1. Product Identity

Report-Advisor is not intended to be a generic dashboard or a ChatBI wrapper. The target product is:

**Trusted Business Intelligence + Document Intelligence + Evidence + Decision Intelligence + Action + Outcome Learning**

Core product chain:

`SOURCE → DATA → EVIDENCE → METRIC → INSIGHT → DECISION → APPROVAL → ACTION → OUTCOME → LEARNING`

Every major capability should strengthen one or more links in this chain.

## 2. Non-Negotiable Product Principles

1. Business truth is deterministic and evidence-backed. LLMs must not be the source of numeric truth.
2. Every important number, insight, recommendation, and decision should be traceable to its evidence and calculation basis.
3. Recommendations must be actionable, assignable, reviewable, and measurable.
4. Historical reports and decisions must remain reproducible and auditable.
5. AI is optional where appropriate; there must be no silent paid fallback and no mandatory external AI dependency.
6. Security and tenant isolation must apply consistently across database, APIs, search, cache, files, and AI context.
7. Failure of optional subsystems must not corrupt deterministic business truth.
8. New features must reuse governed core layers rather than create parallel definitions or isolated implementations.
9. UX, reporting, printing, and notifications are first-class product capabilities, not cosmetic afterthoughts.
10. Do not compete by copying Power BI, Tableau, ThoughtSpot, or Odoo feature-for-feature; differentiate through trust, evidence, decisions, actions, and outcomes.

## 3. Evidence Graph

Target unified graph:

`Source File → Page → Table → Row → Column → Cell → Extracted Value → Normalized Value → Entity → Canonical Record → Metric → Report → Decision → Action → Outcome`

Users should be able to open an important number and navigate to its original evidence.

## 4. Decision & Outcome Graphs

Decision graph:

`Metric → Condition → Risk → Recommendation → Approval → Action`

Outcome graph:

`Action → Expected Impact → Actual Outcome → Variance → Learning`

Support Decision Replay and Decision Diff using reproducible snapshots, metrics, evidence, rules, models, confidence, recommendations, approvals, actions, and outcomes.

## 5. Semantic Metric Layer

Create one governed semantic layer above canonical metric definitions. Do not duplicate KPI definitions by consumer.

Metric metadata should cover, as applicable:

- metricId
- name and definition
- formula
- source
- dimensions
- filters
- time semantics
- freshness
- owner
- version
- certification status
- dependencies
- consumers
- tests
- evidence
- lifecycle/audit fields

Lifecycle:

`Draft → Reviewed → Certified → Deprecated`

The same semantic metrics should serve Dashboard, Reports, ChatBI, Forecast, Recommendations, and Decision Intelligence.

## 6. Trust Model

Use multi-dimensional trust rather than a single opaque confidence value:

- Data
- Extraction
- Mapping
- Entity
- Validation
- Calculation
- Forecast
- Decision

Expose an explainable overall trust assessment.

## 7. Ask → Inspect → Act

Conversational experience target:

`Ask → Understand → Deterministic Query Plan → Quality Check → Calculation → Evidence → Explanation → Inspect → Approval → Action`

The chat experience must not be a chatbot-only layer.

## 8. Why Not / Explainability / Alternatives

For important decisions and blocked recommendations, explain:

- why the recommendation was made
- why it was not made
- what data and evidence support the conclusion
- what rule or policy blocked a decision
- confidence/trust dimensions
- alternatives and their expected benefit, cost, risk, confidence, and evidence

## 9. Decision Safety Center

Centralize:

- allowed decisions
- blocked decisions
- block reasons
- data freshness
- evidence completeness
- trust/confidence
- required approvals

## 10. Evidence Workspace

Provide a unified workspace for sources, files, quotations/evidence, lineage, metrics, decisions, and outcomes. Navigation should work both from Report → Evidence and Evidence → Report.

## 11. Business Control Plane

Single operational control surface for:

- imports
- jobs
- freshness
- data quality
- failed tasks
- AI providers
- storage
- workers
- backups
- evidence
- system health

## 12. Document Intelligence

Target workspace:

`Document → Pages → Blocks → Tables → Cells/Fields → OCR → Confidence → Mapping → Validation → Rejected Rows → Quarantine → Manual Correction → Reprocess → Lineage`

All parser/OCR adapters should produce a common Universal Document Envelope containing document metadata, pages, blocks, tables, cells, coordinates, text, confidence, parser version, and source hash.

Support robust headerless schema discovery for irregular Excel/CSV including header detection, types, sections, merged cells, multiple tables, and mapping suggestions.

## 13. Smart Reconciliation & Data Quality

After import, validate:

- row counts
- totals
- duplicates
- missing entities
- unmatched rows
- source vs canonical totals
- suspicious differences
- schema drift

Explain failures and suggest corrective actions.

Data Quality Center should cover completeness, uniqueness, validity, consistency, freshness, reconciliation, and anomalies with ownership, severity, remediation, and history.

## 14. Golden Corpus

Maintain regression corpora including:

- Arabic Excel
- English Excel
- Arabic scanned PDF
- English PDF
- mixed tables
- bad/headerless files
- duplicates
- missing fields
- merged cells
- multi-page tables
- malformed dates/numbers
- currency variants

Important releases should pass the corpus.

## 15. AI Architecture

Use provider abstraction with governance fields such as provider, capability, quota, cost, trust level, tenant policy, latency, and availability.

Use policy-driven model routing by task (extraction, classification, summarization, retrieval, explanation, forecasting assistance).

Use hybrid retrieval where appropriate:

- lexical search
- structured filtering
- optional embeddings
- evidence ranking

Every retrieval result must preserve tenant scope and source lineage.

AI Research Mode must separate internal business data from external sources and prevent contamination of company facts with external claims.

Browser AI may be optional for lightweight/local assistance. Private, hosted, and offline profiles may be supported, while deterministic analytics remain available in every profile.

## 16. Executive & Operational Intelligence

Target Executive Decision Center / Today's Business Command Center with:

- critical decisions
- top risks
- top opportunities
- cash pressure
- inventory risk
- customer risk
- supplier risk
- forecast risk
- data quality warnings
- pending approvals
- overdue actions

Include:

**What Changed Since I Last Looked?**

## 17. Domain Intelligence

### Inventory
- stockout prediction
- overstock
- dead stock
- slow movers
- reorder point
- safety stock
- lead-time impact
- supplier reliability
- price movement
- liquidity impact

### Demand
- velocity
- seasonality
- trend
- ABC/XYZ/FSN
- customer demand
- substitution
- demand confidence
- forecast intervals

### Customers
- RFM
- lifetime value
- payment behavior
- credit risk
- churn signals
- frequency
- profitability
- recommended next action

### Suppliers
- reliability
- lead time
- price changes
- fulfillment quality
- concentration
- risk score
- alternatives

### Finance/Cash
Support DSO/DIO/DPO/CCC, liquidity and collection intelligence where data permits.

## 18. Scenario / Optimization / Simulation

Scenario Studio should support controlled what-if changes such as price, demand, stock, lead time, exchange rate, payment terms, and purchasing plans with baseline vs scenario, assumptions, and outcomes.

Optimization and simulation must operate on canonical snapshots and governed metrics. Do not expose autonomous execution without policy and safety controls.

## 19. Action Center & Approval

Core lifecycle:

`Recommendation → Approval → Task → Assignment → Execution → Outcome`

Actions should support approve, reject, postpone, assign, execute, and rollback where appropriate, with audit trail.

Sensitive actions should support role/threshold approval, dual approval, segregation of duties, expiration, and audited emergency override.

Autonomous Mode is future-facing and only allowed when confidence, freshness, evidence completeness, financial limits, action type, and role policy all pass.

## 20. Alerts & Notifications

Alerts should be:

- prioritized
- deduplicated
- evidence-backed
- actionable
- severity-aware
- snoozable
- assignable

Notifications should communicate:

`What happened + Why it matters + Evidence + Recommended action`

Group correlated alerts into a root business issue to prevent notification noise.

## 21. Smart Intelligence Reporting

Smart reporting is a flagship capability, not a print button.

Report modes:

- Executive
- Management
- Operational
- Analytical
- Audit / Evidence

Target report types:

- Daily Business Brief
- Weekly Intelligence Review
- Monthly Executive Review
- Executive Decision Report
- Sales Action Report
- Procurement Intelligence Report
- Warehouse Action Report
- Customer Intelligence Report
- Supplier Intelligence Report
- Risk Report
- Forecast / Scenario Report
- Audit / Evidence Report
- Board Pack

Preferred report flow:

1. Executive Cover
2. Executive Brief
3. Business Health
4. Critical Issues
5. Opportunities
6. What Changed
7. Why It Changed
8. Evidence
9. Recommendations
10. Why Not
11. Alternatives
12. Decisions Requiring Approval
13. Department Action Plans
14. Expected Impact
15. Previous Outcomes
16. Action Register
17. Next Review

Reports must turn findings into tasks for Sales, Procurement, Warehouse, Finance, and Management as applicable.

Each action should show, where applicable:

- Task ID
- Department
- Owner
- Priority
- Due Date
- Reason
- Evidence
- Expected Impact
- Status
- Result/Outcome

## 22. Professional PDF / Print Engine

Printed reports must look like executive publications, not a browser page dump.

Required qualities:

- strong visual hierarchy
- elegant cover
- readable typography
- deliberate whitespace
- professional headers and footers
- page numbers
- report ID
- Data As Of
- generated timestamp
- clear section tabs/headings
- smart page breaks
- repeated table headers
- print-safe spacing
- grayscale readability
- prominent priority/status indicators
- evidence references
- approval sections
- action register

Provide strong, consistent templates and allow future report customization.

## 23. Report Composer / Snapshots / Diff

Report Composer should be reusable and template-driven. It may compose KPI cards, charts, tables, recommendations, risks, evidence, tasks, forecasts, and commentary.

Every important report should have an immutable/reproducible snapshot including:

- Report ID
- data-as-of
- metric version
- rules version
- mapping version
- filters
- evidence
- trust/confidence

Report Diff should explain metric, source, data, rule, forecast, recommendation, and decision changes.

## 24. Department / Action UX

The product should make the transition from intelligence to work obvious:

`Insight → Recommendation → Decision → Approval → Task → Owner → Deadline → Execution → Outcome`

Use clear status, priority, ownership, due dates, and evidence links.

## 25. Saved Views / Cross Filter / Drill Through / Spreadsheet Analysis

Support:

- saved filters/grouping/columns/sorts/state
- secure sharing inside tenant
- chart-driven cross filtering of KPIs/tables/charts/evidence/recommendations
- drill-through Company → Branch → Warehouse → Category → Product → Invoice → Line → Source Evidence
- controlled spreadsheet-like analysis with semantic metrics, evidence, permissions, immutable source, and governed transformations
- Command Palette for search/open/analyze/compare/import/inspect/replay/approve/execute

## 26. Knowledge / Rules / Governance

Knowledge Layer may contain policies, accounting definitions, product knowledge, supplier rules, procedures, and report definitions, but never replaces data truth.

Business Rules Studio should manage reorder, credit, margin, anomaly, approval, and alert policies with versioning and audit.

Metric Governance Studio should manage KPI ownership, versions, certification, dependencies, and deprecation.

## 27. Release Provenance

Every important release should record:

- commit
- migration version
- metric version
- rule version
- model version
- test corpus version
- deployment artifact

Important historical reports and decisions must remain reproducible.

## 28. Security / Tenant / Audit

Maintain defense-in-depth for:

- tenant isolation
- RBAC/RLS
- session security
- provider access
- API access
- storage access
- suspicious events
- permission changes
- audit logging

Audit Explorer should support searching login, import, change, approval, AI request, recommendation, action, export, and permission events.

AI must be permission-aware and must never expose data beyond the user's effective authorization.

## 29. Reliability / Runtime

Preserve and extend durable runtime capabilities:

- queue
- worker
- lease
- heartbeat
- retry
- checkpoint/resume
- DLQ
- idempotency
- watched folders where used
- cache/invalidation
- backup/restore
- observability
- health checks
- rate limiting
- safe retries

Do not rebuild existing reliable infrastructure without evidence it is inadequate.

## 30. Platform / Market Readiness

Support the product's intended growth through:

- Arabic RTL and English LTR
- dates/numbers/currency/timezone/accounting formats
- multi-currency with auditable rates and valuation dates
- multi-branch Company → Branch → Warehouse → User/Role
- low-bandwidth mode
- responsive/mobile-ready architecture
- future private/offline deployment profiles

## 31. Time & Data Semantics

Distinguish where relevant:

- transaction date
- posting date
- delivery date
- data-as-of
- generated-at
- freshness
- timezone

Do not allow semantically incorrect time bases to silently contaminate KPIs, forecasts, reports, or decisions.

## 32. Impacted Decisions

When source data, canonical records, metrics, or rules change, the system should identify affected reports, recommendations, and prior decisions where feasible.

## 33. Product UX Standard

The first experience should communicate:

**clarity + confidence + intelligence + polish + speed**

Design for:

- elegant navigation
- disciplined tabs and sections
- strong information hierarchy
- intelligent empty/loading/error states
- consistent cards/tables/statuses
- meaningful animations only when useful
- high-quality notifications
- fast access to evidence and action
- impressive executive reports

The goal is not visual novelty alone. Every visual decision should reduce cognitive load and increase trust.

## 34. Acceptance Standard

A capability is not complete because a page exists or because a build passes.

Target completion chain:

`Requirement → Implementation → Persistence/Schema → Execution → Workflow/Entry Point → Runtime → Test → Evidence → End-to-End`

Classify honestly:

- IMPLEMENTED
- PARTIALLY IMPLEMENTED
- FOUNDATION ONLY
- PLANNED
- MISSING
- SUPERSEDED
- NOT APPLICABLE

## 35. Wave Strategy

Current strategic sequence:

### Wave 1
Intelligence foundation: evidence, trust, snapshot, recommendation/action/outcome contracts.

### Wave 2
Semantic Metric Layer → Evidence Graph integration → Report Composer → Smart Executive/Operational Reporting → Snapshot Persistence/Diff → evidence-backed recommendation rendering → task integration.

### Wave 3
Decision Graph → Decision Replay/Diff → Document Intelligence Workspace → Golden Corpus execution → Data Quality operationalization.

### Wave 4
Executive Decision Center → Action Center → Approval Workflows → Daily/Weekly/Monthly intelligence → cross-filtering/drill-through and operational UX.

### Wave 5
Hybrid Retrieval → AI Provider/Model Governance → Scenario Studio → Optimization → Outcome Learning.

### Wave 6 / Future
Research Mode → Knowledge Layer → Board Pack → advanced simulation → low-bandwidth/mobile hardening → advanced controlled autonomy.

Certification and production release remain separate tracks and must not be conflated with feature waves.

## 36. Legacy Reconciliation Rule

The legacy roadmap, current roadmap, Master Indexes, architecture references, implementation records, and new feature document must be reconciled rather than replaced by one another.

A legacy item should only be removed from the target plan when it is:

- demonstrably implemented and covered,
- explicitly superseded with a recorded rationale,
- or genuinely not applicable.

Never drop a valuable capability simply because it was absent from the latest wave.

## 37. Anti-Drift Rule

Before starting a new wave, compare it against this directive and the Master Feature/Technology and Acceptance Matrices.

At the end of each wave record:

- Current HEAD
- branch
- commits
- files/modules
- schema/persistence
- runtime path
- UI entry points
- tests
- evidence
- known gaps
- affected capabilities
- next dependencies

Do not declare a capability complete based solely on a developer claim.

## 38. Current Release Policy

Production deployment is on HOLD until a Release Candidate is explicitly accepted.

PR #75 / release certification / P0 / B1 / B2 / Forecast Guard and other protected certification paths must remain isolated from feature development unless a deliberate, documented certification action is required.

## 39. Product North Star

The end state is a platform that can:

**understand messy business data and documents → verify and normalize them → connect facts to evidence → calculate governed metrics → detect risks/opportunities → explain what changed and why → recommend options → obtain approval → assign actions → track execution → compare expected vs actual outcomes → learn → produce exceptional executive and operational reports.**

This document is the durable reference for that direction. Changes to the direction should be additive or explicitly superseding, never accidental.
