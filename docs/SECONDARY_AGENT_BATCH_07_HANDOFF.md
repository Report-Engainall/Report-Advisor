# Secondary Agent — Batch 07 Handoff

## Scope
Batch 07 continues only isolated, non-destructive surfaces from the approved matrix. It does not modify canonical metric truth, import truth, financial calculations, RLS, tenant isolation, evidence persistence, reconciliation engines, AI provider policy, or action execution.

## Implemented

### Safe surface contracts
`src/lib/secondary-batch07-safe-surfaces.ts`

Adds typed presentation contracts for:
- tenant-aware Saved Views;
- Explainability;
- Alternative Recommendations;
- Decision Safety summaries;
- explicit LIVE/UNKNOWN/NOT_CONFIGURED/BLOCKED/ERROR/EMPTY states;
- evidence references without fabricating source IDs.

These are presentation contracts only. They do not persist data or calculate business truth.

### Command Palette 2.0 safe navigation
`src/components/CommandPalette.tsx`

Extended the existing palette with navigation/search coverage for:
- Evidence;
- Decision Replay;
- Control Plane;
- report snapshot/diff terminology;
- recommendation terminology.

No unsafe execute/approve/rollback command was introduced.

### Regression checks
`scripts/secondary-batch07-safe-surfaces.test.mjs`

Static contract checks cover the new types, safety states, evidence references, and command navigation/accessibility markers.

### Batch 07 runtime certification support
Added:
- `scripts/secondary-batch07-runtime-inventory.mjs`
- `test:secondary-batch07-runtime-inventory`
- `test:secondary-batch07-safe-surfaces`
- existing secondary workflow wiring for both checks

The inventory maps critical capabilities across UI → contract → implementation → persistence/service → security → test → workflow → runtime evidence. It is intentionally fail-closed and does not manufacture runtime evidence.

A safety regression was also corrected: LIVE explainability now requires at least one evidence ID. The previous condition accepted any LIVE summary because `evidenceIds.length >= 0` is always true. UNKNOWN/BLOCKED/ERROR states still require an explanatory reason/detail.

## Validation status
The test scripts are executable with Node, but no PASS is claimed here until GitHub Actions executes the current head. Current classification: **GATED / LIVE REQUIRED**.

## Runtime discovery
The repository already contains authoritative Phase K/L runtime boundaries. `src/lib/phase-kl-supabase-runtime.ts` exposes `record_control_plane_health` and `record_executive_evidence_edge`, while the Phase L migration persists the executive evidence graph. These existing boundaries were reused as the canonical runtime reference; no second graph was created.

The existing `Evidence` ledger preserves `sourceId`, optional page, field, raw/normalized value and confidence. It does not itself prove persisted table/row/column/cell/entity/canonical/metric/report/action/outcome lineage. Those downstream nodes remain **LIVE REQUIRED**.

The existing `DocumentExtractionEnvelope` is provider-neutral and carries plan/backend choices/stage/warnings/facts with source/page/confidence. It does not yet prove complete page/table/row/column/cell intermediate representation or persisted cell lineage. No parser/OCR/envelope replacement was added.

The existing `RUNTIME_CLOSURE_MATRIX.md` confirms the canonical runtime chain and downstream safety gates. Batch 07 consumes that architecture rather than creating another evidence graph.

## Runtime Gap Inventory

| Capability | Status | Runtime evidence still required |
|---|---|---|
| Evidence Workspace | GATED / LIVE REQUIRED | persisted source/evidence and downstream graph IDs from real runtime |
| Decision Replay | GATED / LIVE REQUIRED | persisted decision snapshot, approval, action and outcome |
| Report Snapshot/Diff | GATED / LIVE REQUIRED | authoritative report snapshot/version/evidence runtime |
| Data Quality | LIVE REQUIRED | authoritative seven-dimension quality read model + source evidence |
| Business Control Plane | GATED | live telemetry/tenant environment for health domains |
| Document Intelligence | GATED / LIVE REQUIRED | real extraction, page/table/cell lineage, validation, quarantine and persistence |
| Smart Reconciliation | LIVE REQUIRED | persisted authoritative result, source totals and row-level evidence |
| Golden Corpus | GATED | CI proves fixture contracts only; production parser accuracy still requires live execution |
| UNKNOWN/Evidence safety | GATED | live E2E confirmation that unavailable evidence cannot become executable truth |
| Accessibility | GATED | browser runner execution |
| Performance | GATED | live measurement under realistic/low-bandwidth data |

## Evidence chain readiness

| Node | Current state |
|---|---|
| Source File | FOUNDATION / LIVE REQUIRED |
| Page | LIVE REQUIRED |
| Table | LIVE REQUIRED |
| Row | LIVE REQUIRED |
| Column | LIVE REQUIRED |
| Cell | LIVE REQUIRED |
| Extracted Value | FOUNDATION / LIVE REQUIRED |
| Normalized Value | FOUNDATION / LIVE REQUIRED |
| Entity | LIVE REQUIRED |
| Canonical Record | LIVE REQUIRED |
| Metric | LIVE REQUIRED / MAINLINE DEPENDENCY |
| Report | LIVE REQUIRED / MAINLINE DEPENDENCY |
| Decision | GATED / LIVE REQUIRED |
| Action | LIVE REQUIRED / MAINLINE DEPENDENCY |
| Outcome | LIVE REQUIRED / MAINLINE DEPENDENCY |

No IDs are invented. The secondary adapter remains fail-closed when authoritative identifiers are absent.

## Document Intelligence readiness

| Stage | Status | Finding |
|---|---|---|
| Upload | LIVE REQUIRED | primary runtime owns real upload evidence |
| Classification | FOUNDATION / GATED | existing routing/profile exists |
| Parsing/OCR | FOUNDATION / LIVE REQUIRED | gateway is provider-neutral; actual extraction proof is runtime-owned |
| Intermediate representation | GAP / MAINLINE DEPENDENCY | current envelope is not a complete page/block/table/row/cell IR |
| Schema discovery | FOUNDATION / LIVE REQUIRED | existing schema/intelligence contracts exist; arbitrary live corpus proof remains |
| Mapping confidence | FOUNDATION / LIVE REQUIRED | contract/gates exist; persisted live mapping evidence remains |
| Cell lineage | GAP / MAINLINE DEPENDENCY | existing envelope facts have source/page but not complete cell/table/row lineage |
| Reconciliation | GATED / LIVE REQUIRED | existing reconciliation engine is authoritative; persisted result proof remains |
| Quarantine/reprocessing | FOUNDATION / LIVE REQUIRED | existing lifecycle/contracts exist; live persistence/reprocess evidence remains |
| Golden corpus | GATED | 13 executable cases retained |

No new parser or parallel document engine was created to fill these gaps.

## Golden Corpus

No fixtures were added in Batch 07. Existing 13/13 expectations remain the authoritative secondary regression corpus. Production certification is not inferred from fixture PASS.

## Free-first / safety audit

The Batch 07 inventory rejects known markers for `/api/chat`, hard-coded OpenAI/Anthropic/Google Generative Language endpoints and Lovable gateway/provider markers in the secondary runtime/workflow surfaces.

No paid API, paid SaaS, paid OCR, paid storage, mandatory cloud AI, or silent paid fallback was introduced. Ollama/local processing remains optional.

## CI

The existing `.github/workflows/secondary-agent-batch04.yml` workflow was reused; no new push workflow was created. Batch 07 inventory and safe-surface regression are executed as contract steps. TypeScript, lint and build remain independent matrix jobs with `fail-fast: false`.

At handoff time, the current Batch 07 head has not yet produced a completed GitHub Actions run in the connector, so **no Batch 07 PASS claim is made**. Any result must be taken from the completed GitHub Actions run, not inferred from static inspection.

## Explicit non-goals
- No database migration.
- No new Evidence Graph persistence.
- No duplicate metric/decision/import/reconciliation engine.
- No fake business data.
- No paid dependency/provider.
- No merge or rebase.
- No action execution.
- No change to RLS/Tenant Isolation.
- No change to Metric Truth or Financial Truth.

## Primary integration dependencies
Final certification still belongs to the primary stream and requires authoritative runtime wiring, typecheck/lint/build, browser accessibility checks, tenant-scoped persistence verification, and E2E evidence.

### MAINLINE DEPENDENCY — downstream evidence graph
Primary runtime must supply persisted identifiers for table/row/column/cell/entity/canonical/metric/report/decision/action/outcome. The secondary branch cannot create a parallel ledger.

### MAINLINE DEPENDENCY — document IR/cell lineage
The existing provider-neutral document architecture needs real persisted intermediate representation/cell lineage where available. Adding another IR/lineage store here would duplicate Core.

### MAINLINE DEPENDENCY — Data Quality
Authoritative seven-dimension scores and evidence/source references must be supplied by the primary runtime.

### MAINLINE DEPENDENCY — Reconciliation
Persisted authoritative `ReconciliationResult`, source/canonical totals and row-level evidence must be supplied by the primary runtime.

### MAINLINE DEPENDENCY — project baseline quality
Known TypeScript/ESLint/Build baseline blockers remain primary-stream work where they overlap existing mainline/PR #20 changes. They are not duplicated here.

## Completion classification

- COMPLETE: **0**
- VERIFIED: **0**
- FOUNDATION: existing Batch 07 safe presentation contracts only; no new Foundation surface added by the runtime-certification portion.
- GATED: runtime inventory, safety regression, control-plane/read-model support, evidence adapters and document/reconciliation adapters.
- LIVE REQUIRED: authoritative evidence graph downstream nodes, Data Quality scores, document persistence/cell lineage, reconciliation persistence, browser/tenant/E2E evidence.
- GAP: complete document intermediate representation and cell-level lineage are known gaps, but are primary-stream responsibilities.
- MAINLINE DEPENDENCY: primary Metric/Report/Decision evidence, document IR/lineage, Data Quality, Reconciliation, and overlapping project baseline quality fixes.

## Exact next action

Primary stream should execute the existing live runtime/certification workflows against a real isolated environment, supply authoritative downstream Evidence Graph IDs and persisted document/reconciliation/data-quality results, then rerun the secondary contracts and project-quality checks. Only after that should individual components be promoted from GATED/LIVE REQUIRED to VERIFIED or COMPLETE.
