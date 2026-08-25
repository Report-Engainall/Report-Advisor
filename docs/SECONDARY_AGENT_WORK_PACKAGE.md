# Report-Advisor — Secondary Agent Work Package

## Mission

You are the **secondary implementation agent** working in parallel with the primary project execution. Your job is to accelerate delivery **without competing with, rewriting, or merging over the primary architecture**.

The primary agent remains the integration authority. You must work only on the isolated branch assigned to you and return commits/PRs for review. Do not merge into the primary branch yourself.

## Project context you must preserve

Repository: `Report-Engainall/Report-Advisor`

The product is an Evidence-First Business Intelligence + Document Intelligence + Decision Intelligence platform. The current execution program is governed by:

- `docs/EXECUTION_MASTER_INDEX.md`
- `docs/FREE_LOCAL_PRODUCT_POLICY.md`
- `docs/MASTER_PRODUCT_REFERENCE.md`
- the existing phase 8/9 work and all prior production-hardening work

The primary execution is currently closing the existing foundation before the larger Document 02 feature expansion. **Do not treat Document 02 as permission to bypass unfinished core runtime/security/metric/evidence work.**

## Non-negotiable constraints

1. **Do not delete existing features.** Default is KEEP + IMPROVE.
2. Do not replace React/Vite/Supabase or working architecture without strong evidence and explicit integration review.
3. Do not add frameworks, microservices, SaaS, or providers merely because competitors use them.
4. **Zero mandatory third-party cost:** core functionality must remain free/local/self-hostable. No paid AI/API/OCR/storage/analytics provider may become a requirement.
5. No silent paid fallback.
6. LLMs do not own authoritative business numbers and cannot directly write business truth.
7. Do not send raw business rows to hosted AI.
8. Preserve tenant isolation, RLS, storage authorization, realtime authorization and auditability.
9. UNKNOWN/INSUFFICIENT_EVIDENCE must remain first-class; never replace missing evidence with zero or guesses.
10. Do not declare a feature COMPLETE because a file/contract/gate exists. Provide executable evidence.
11. Avoid broad refactors while the primary agent is changing shared core paths.
12. Do not change production workflows or canonical CI gates unless explicitly assigned.
13. Do not modify the primary master execution index except through a proposed handoff; the primary agent owns the master index.

## What you should work on

Your work is deliberately concentrated on **isolated, low-conflict implementation that accelerates the later roadmap without changing core truth engines**.

### Track A — Evidence Workspace / UI foundation

Build or improve reusable UI components for:
- source/evidence explorer;
- document/page/table/row/column/cell navigation;
- evidence detail panel;
- lineage breadcrumb/tree;
- source preview placeholder with secure source-reference contract;
- metric → evidence → source drill-through;
- empty/unknown/blocked/loading/error states;
- RTL Arabic and LTR English readiness;
- keyboard/accessibility support.

Do not invent a second lineage model. Consume existing evidence/lineage contracts.

### Track B — Decision Replay presentation layer

Prepare isolated UI and read-model adapters for:
- Decision ID;
- snapshot;
- metrics;
- evidence;
- rules/model versions;
- confidence dimensions;
- recommendation;
- approval;
- action;
- expected impact;
- actual result.

The UI must display UNKNOWN/INSUFFICIENT_EVIDENCE honestly and must not calculate authoritative numbers.

### Track C — Decision Diff presentation layer

Build reusable comparison components for two immutable snapshots:
- changed metrics;
- changed evidence/source references;
- changed freshness;
- changed confidence;
- changed forecast;
- changed rule/model versions;
- reason/explanation sections.

Use deterministic input supplied by the backend/read model. Do not have the browser infer business truth.

### Track D — Report Snapshot / Report Diff UI

Prepare UI/read-only presentation for:
- Report ID;
- Snapshot ID;
- Data As Of;
- metric/rule/mapping versions;
- filters;
- evidence;
- confidence;
- generated time;
- compare A vs B.

Do not change canonical metric calculations.

### Track E — Data Quality Center UI

Build a reusable operational view for:
- completeness;
- uniqueness;
- validity;
- consistency;
- freshness;
- reconciliation;
- anomalies;
- issue owner;
- severity;
- remediation status;
- history.

Use existing backend contracts where present. Do not invent fake data.

### Track F — Business Control Plane UI shell

Prepare an operational dashboard shell for:
- imports;
- jobs;
- freshness;
- data quality;
- failed tasks;
- AI provider state;
- storage state;
- workers;
- backup state;
- evidence health;
- system health.

The shell must distinguish LIVE/UNKNOWN/NOT CONFIGURED instead of showing false green statuses.

### Track G — Document Intelligence Workspace UI

Prepare reusable document inspection UI:
- file metadata;
- pages;
- detected tables;
- OCR text;
- fields/cells;
- confidence;
- mapping;
- validation;
- rejected rows;
- quarantine;
- manual correction controls;
- reprocess action surface;
- lineage links.

Actions must call existing contracts/services; do not create parallel import engines.

### Track H — Golden Corpus fixtures (UI-independent)

Add **small, deterministic, non-sensitive fixtures** for later E2E coverage:
- Arabic CSV/Excel-like records;
- English tabular records;
- headerless table;
- duplicate rows;
- missing fields;
- merged-cell representation where practical;
- multi-table document envelope;
- UNKNOWN/missing-source cases.

Fixtures must contain no real customer secrets or business-sensitive data.

### Track I — Feature-preservation inventory

Create a machine-readable inventory of existing user-facing capabilities you touch. For each changed feature record:
- feature name;
- route/component;
- current behavior;
- expected behavior;
- tests;
- compatibility notes.

Default is preserve + improve.

## Explicitly DO NOT do these tasks

Do not independently implement or alter:
- central Metric SQL/RPC truth definitions;
- canonical financial formulas;
- tenant/RLS policy changes;
- authentication architecture;
- production migration strategy;
- canonical import-upsert engine;
- Onyx synchronization protocol;
- canonical AI provider routing/security policy;
- production release gates;
- backup/restore certification;
- production certification status;
- main branch merges;
- paid-provider integrations.

If you discover a defect in one of these areas, document it in the handoff instead of changing it unless explicitly reassigned.

## Branch and integration protocol

Work only on:

`parallel/secondary-agent-evidence-ux`

Use focused commits. Prefer one logical capability per commit.

Do not rebase/force-push over the primary branch.

When a coherent batch is complete, open a **draft PR** to `phase-8-9-completion` and stop there. The primary agent will review, test against the current master plan, resolve conflicts, and decide what is integrated.

## Required test discipline

For every implementation:
- run the narrowest relevant tests first;
- run typecheck/lint where applicable;
- add regression tests for changed behavior;
- never fabricate passing output;
- report skipped tests and why;
- distinguish unit/integration/E2E evidence.

## Required handoff format

At handoff provide:

1. Commit SHA(s).
2. PR number.
3. Files changed.
4. What was implemented.
5. Tests executed and exact results.
6. Fixtures added.
7. Existing features preserved.
8. Known limitations.
9. Potential conflicts with primary work.
10. Required integration steps.
11. Cost/free-path impact.
12. Security/tenant implications.

Use statuses exactly:
- COMPLETE
- FOUNDATION
- GATED
- LIVE REQUIRED
- GAP

## Quality bar

The goal is not to produce many files. The goal is to deliver **mergeable, tested, low-conflict increments** that improve the existing product and accelerate the primary execution.

A smaller fully tested component is better than a large speculative subsystem.

## Future Document 02 roadmap

Document 02 contains the later feature expansion, including Evidence Graph, Decision Graph, Outcome Graph, Replay, Diff, Trust, Report Snapshots, Semantic Metrics, Ask→Inspect→Act, Why Not, Decision Safety Center, Evidence Workspace, Business Control Plane, Document Intelligence Workspace, Universal Document Envelope, Headerless Schema Discovery, Smart Reconciliation, Golden Corpus, AI Provider abstraction, AI routing, Browser AI, Private/Offline modes, Hybrid Retrieval, Research Mode, Executive Decision Center, Inventory/Demand/Customer/Supplier Intelligence, Scenario Studio, Action/Approval workflows, constrained autonomy, intelligent alerts/notifications, Saved Views, cross-filtering, drill-through, spreadsheet-like analysis, Knowledge Layer, Rules Studio, Metric Governance, Data Quality, Data Contracts, Schema Drift, Release Provenance, Health Score, low-bandwidth mode, mobile readiness, i18n, multi-currency/branch readiness, Audit Explorer, Security Center, explainability, alternatives, optimization, simulation, outcome learning.

Do not implement this whole roadmap indiscriminately now. The primary agent will sequence it after the foundation is proven. Your isolated tracks above are the approved parallel acceleration slice.

## Final instruction

**Accelerate, do not compete. Preserve, do not remove. Implement, test, document, and hand off. The primary agent owns final integration and certification.**
