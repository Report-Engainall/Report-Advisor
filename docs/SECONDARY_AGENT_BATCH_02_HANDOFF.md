# Secondary Agent Batch 02 — Data Quality / Control Plane / Document Intelligence UX

Status: FOUNDATION

Branch: `parallel/secondary-agent-evidence-ux`
Primary integration target: `phase-8-9-completion`
PR: #18 (updated, not merged)

## What was changed

Batch 02 adds isolated, evidence-aware presentation contracts and components for:
1. Data Quality Center.
2. Business Control Plane.
3. Document Intelligence Workspace.
4. Smart Reconciliation presentation.
5. Headerless Schema Discovery presentation.
6. Synthetic Golden Corpus fixtures.
7. A focused Golden Corpus contract test.

No existing Batch 01 feature was removed or replaced.

## Components / contracts

### New contracts
- `src/lib/secondary-batch02.ts`
  - `DataQualityReadModel`
  - `ControlPlaneReadModel`
  - `DocumentWorkspaceReadModel`
  - `ReconciliationReadModel`
  - `SchemaDiscoveryReadModel`
  - shared `EvidenceRef` and status handling

These are read-model contracts only. They do not create a new data source, metric engine, reconciliation engine, import engine, or authorization model.

### New UI
- `src/components/secondary/Batch02Workspaces.tsx`
  - `DataQualityCenter`
  - `BusinessControlPlane`
  - `DocumentIntelligenceWorkspace`
  - `SmartReconciliation`
  - `SchemaDiscoveryPresentation`

The UI consumes supplied authoritative read models and renders `UNKNOWN`, `BLOCKED`, `ERROR`, `EMPTY`, and `LOADING`-compatible states instead of inventing business values.

## Existing contracts inspected / reused

- Existing tenant-native Data Quality query boundary: `src/lib/data-quality-queries.ts`.
- Existing Data Quality page wiring: `src/pages/EntityPages.tsx`.
- Existing Business Control Plane contract: `scripts/check-business-control-plane-contract.mjs` and its existing database/roadmap contract.
- Existing Document Intelligence Golden Dataset: `src/lib/document-intelligence/golden-dataset.ts`.
- Existing package test/toolchain and existing document/intelligence contracts.

The current Data Quality page already has a canonical bounded query boundary and delegates tenant security to RLS/current_company_id; Batch 02 does not replace that query boundary.

## Golden Corpus

Added under `fixtures/secondary-batch02/`:
- Arabic tabular CSV representation.
- English tabular CSV representation.
- Arabic OCR text.
- English OCR text.
- Headerless table.
- Bad headers.
- Duplicate records.
- Missing fields.
- Merged-cell representation.
- Multi-table document.
- Tables spanning pages.
- Reconciliation mismatch JSON.
- UNKNOWN evidence JSON.

All fixtures are synthetic and contain no customer/business secrets.

Because the GitHub file-write interface used for this branch is text-oriented, spreadsheet fixtures are deliberately represented as UTF-8 CSV fixtures rather than silently introducing a binary `.xlsx` artifact. They are suitable for deterministic parser tests and can later be consumed by the existing XLSX adapter without changing the core engine.

## Tests

Added:
- `scripts/secondary-batch02.test.mjs`
- `npm run test:secondary-batch02`

The test validates fixture presence/content, Arabic text coverage, reconciliation mismatch semantics, UNKNOWN evidence semantics, and the Batch 02 read-model contract surface.

### Actual execution

`npm run test:secondary-batch02`: **SKIPPED** — the connected GitHub environment exposes repository read/write APIs but does not expose a local Node/npm execution runtime.

TypeScript: **SKIPPED** — no local TypeScript runtime/compiler available through the connected GitHub tool.

Lint: **SKIPPED** — no local npm/node execution runtime available.

Build: **SKIPPED** — no local npm/node execution runtime available.

Component/integration/accessibility: **SKIPPED** — no browser/test runner execution environment is available through the connected GitHub tool.

GitHub Actions: **not executed from this tool surface**; no workflow dispatch capability was available in the connected GitHub toolset. No `PASSED` claim is made.

## Performance considerations

The new components render supplied read models only. They do not fetch thousands of rows themselves and therefore do not introduce a new bulk-loading path. Pagination/virtualization must remain at the authoritative query/read-model layer when large datasets are connected.

## Security / tenant considerations

- No RLS or tenant policy was modified.
- No client-side tenant identifier was added.
- Components are read-only presentation surfaces.
- Evidence references are displayed only when supplied by the authoritative read model.
- No secrets, credentials, or customer data were added.
- No paid provider or external SaaS dependency was introduced.

## Runtime wiring required

The following remain `LIVE REQUIRED` until the primary stream connects these components to authoritative runtime data:
- live Data Quality read model.
- live Control Plane signals.
- live Document/Import pipeline state.
- live reconciliation results.
- live schema discovery results.
- live Evidence Graph/Lineage data.

The absence of runtime evidence is intentionally visible rather than simulated.

## Core intervention required

None introduced by this batch. If runtime wiring exposes defects in Metric Truth, Canonical Import, RLS/Tenant Isolation, AI Security, Forecast/Recommendation/Action engines, or Production Certification, those defects belong to the primary stream and are not changed here.

## External dependencies / cost impact

No new dependency. No paid provider. No paid API. No paid OCR. No paid storage. No paid automation. Cost impact: **none introduced**.

## Feature status

| Feature | Status |
|---|---|
| Data Quality Center UI | FOUNDATION |
| Business Control Plane UI | FOUNDATION |
| Document Intelligence Workspace UI | FOUNDATION |
| Golden Corpus | FOUNDATION |
| Smart Reconciliation UI | FOUNDATION |
| Schema Discovery UI | FOUNDATION |
| Evidence Workspace Batch 01 improvement readiness | FOUNDATION |
| Live runtime integration | LIVE REQUIRED |
| Runtime test execution | LIVE REQUIRED |

## Limitations

1. The UI is intentionally not promoted to COMPLETE because runtime evidence is unavailable in this tool environment.
2. The current repository's Data Quality page contains client-side quality calculations; Batch 02 did not replace them because doing so would cross into authoritative truth ownership. The new component expects a read model and should be wired by the primary stream after reviewing the authoritative contract.
3. Golden Corpus spreadsheet fixtures are CSV/text representations rather than binary XLSX files for deterministic repository review; no new parser dependency was introduced.
4. No browser automation/accessibility runner could be executed here.

## Final classification

**Batch 02 = FOUNDATION**

No feature is labeled COMPLETE without real runtime evidence.
