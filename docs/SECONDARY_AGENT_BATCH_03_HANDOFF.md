# Secondary Agent Batch 03 — Runtime Read-Model Wiring / Integrity / Golden Harness

Status: FOUNDATION / LIVE REQUIRED
Branch: `parallel/secondary-agent-evidence-ux`
Target: `phase-8-9-completion`
PR: #18 (draft, unmerged)

## What changed

Batch 03 focuses on closing the gap between Batch 02 presentation contracts and existing authoritative runtime boundaries without creating duplicate Core Engines.

Implemented:
- Runtime read-model adapters for the existing Data Quality query boundary.
- Runtime read-model adapter for the existing Business Control Plane tables/read signals.
- Document Workspace adapter around the existing `documentIntelligenceGateway`.
- Evidence Workspace adapter around the existing `evidence-ledger` contract.
- Explicit UNKNOWN reconciliation adapter when no authoritative reconciliation result is supplied.
- Deep-link reference fields on secondary evidence/read-model contracts.
- Golden Corpus CI harness with PASS / FAIL / SKIPPED classification.
- Accessibility hardening for Batch 02 presentation surfaces.
- Lightweight query projections and bounded `limit(1)` reads for control-plane signals.

## Files added

- `src/lib/secondary-batch03-runtime.ts`
- `scripts/secondary-batch03-golden-harness.mjs`
- `docs/SECONDARY_AGENT_BATCH_03_HANDOFF.md`

## Files modified

- `src/lib/secondary-batch02.ts`
- `src/lib/secondary-evidence-ux.ts`
- `src/components/secondary/Batch02Workspaces.tsx`
- `package.json`
- `docs/SECONDARY_AGENT_BATCH_01_HANDOFF.md`

## Authoritative contracts used

- `src/lib/data-quality-queries.ts` — existing tenant-native bounded Data Quality reads. The adapter only establishes runtime availability; it does not calculate a new quality score.
- `business_state_snapshots`, `control_plane_optimization_runs`, `executive_kpi_lineage`, `control_plane_drift_events` — existing Business Control Plane tables with existing RLS.
- `src/lib/documentIntelligenceGateway.ts` — existing free/local-first document planning contract.
- `src/lib/free-toolbox/evidence-ledger.ts` — existing evidence ledger contract.
- Existing Batch 01/02 secondary presentation contracts.

## Runtime wiring classification

### Data Quality Center — LIVE REQUIRED / FOUNDATION

The adapter calls the existing tenant-native Data Quality query boundary. Dataset availability is represented as READY, while the seven quality dimensions remain UNKNOWN because the existing query boundary does not expose an authoritative quality score. No browser-side quality calculation was added.

### Business Control Plane — FOUNDATION

The adapter reads the latest bounded records from existing control-plane tables. It reports HEALTHY/WARNING/FAILED/UNKNOWN/NOT CONFIGURED only from actual source states. Areas without an authoritative health source remain NOT CONFIGURED rather than being marked healthy.

### Document Intelligence Workspace — FOUNDATION / LIVE REQUIRED

The adapter consumes the existing document planning gateway. It can expose real planned backend choices and extracted facts when an authoritative envelope is supplied, but it does not fabricate pages, tables, OCR, mappings, or validation results.

### Smart Reconciliation — LIVE REQUIRED

No authoritative reconciliation read-model contract was safely identified for direct secondary wiring in this batch. The adapter explicitly returns UNKNOWN and a remediation instruction instead of calculating reconciliation truth.

### Evidence Workspace — FOUNDATION / LIVE REQUIRED

The adapter converts supplied `EvidenceLedger` entries into source/page/extracted/normalized nodes only where those values actually exist. It does not invent table/row/column/entity/metric/decision/action/outcome identifiers.

## UNKNOWN / BLOCKED integrity

The Batch 02 UI and Batch 03 adapters preserve missing or unavailable values as UNKNOWN/NOT CONFIGURED/BLOCKED/ERROR. No missing quality score is converted to zero. No missing control-plane source is converted to HEALTHY. No reconciliation result is inferred.

## Deep-link preparation

Secondary EvidenceRef and EvidenceNode now support optional:
- `source_id`
- `evidence_id`
- `snapshot_id`
- `lineage_id`
- `metric_id`
- `decision_id`

These are optional and remain absent when the authoritative runtime does not provide them.

## Golden Corpus harness

Added `scripts/secondary-batch03-golden-harness.mjs` and npm script:
`npm run test:secondary-batch03-golden`

Expected cases:
- Arabic
- English
- OCR Arabic
- OCR English
- Headerless
- Bad headers
- Duplicates
- Missing fields
- Merged cells
- Multi-table
- Multi-page
- Reconciliation mismatch
- UNKNOWN evidence

The harness emits structured counts for PASS / FAIL / SKIPPED and exits non-zero on FAIL.

## Accessibility / UX

Batch 02 cards now expose keyboard focus states; status indicators have status semantics and hidden icons; loading/unknown/error notices use live-region semantics; tables have accessible captions and scoped headers; the existing RTL layout was preserved.

## Performance

- No new unbounded row query was introduced.
- Control-plane reads use explicit projections and `limit(1)` for latest-state surfaces.
- Batch 03 does not introduce a bulk document or evidence fetch.
- Large-table pagination/virtualization remains owned by the authoritative query/read-model layer.

## Security / tenant implications

- No RLS policy changed.
- No tenant identifier is supplied by the UI.
- Control-plane reads rely on existing RLS policies.
- Evidence adapters are read-only.
- No secrets or customer data were added.
- No paid provider or external SaaS dependency was introduced.

## Tests

### Actually executed in this environment

- GitHub repository inspection: PASS (source/contracts inspected).
- Code writes committed to the requested branch: PASS.

### Not executed

- `npm run test:secondary-batch03-golden`: SKIPPED — connected execution surface does not expose a local Node/npm runtime.
- TypeScript: SKIPPED — no local compiler runtime available.
- Lint: SKIPPED — no local npm/node runtime available.
- Build: SKIPPED — no local npm/node runtime available.
- Unit/component/integration browser tests: SKIPPED — no browser test runner available.
- Accessibility automation: SKIPPED — no browser runner available.
- GitHub Actions dispatch: SKIPPED — connected GitHub tool surface does not expose workflow dispatch.

No test is labeled PASSED unless it actually executed.

## Free-first / cost impact

No dependency was added. No Paid API, Paid AI, Paid OCR, Paid Storage, Paid SaaS, or paid fallback was introduced. Cost impact: none introduced.

## Limitations

1. The current Data Quality query boundary exposes raw datasets, not an authoritative seven-dimension quality score. The adapter therefore preserves UNKNOWN rather than calculating truth in the UI.
2. Smart Reconciliation remains LIVE REQUIRED until the primary stream exposes its authoritative result contract.
3. Document preview/pages/tables/manual correction/reprocess remain LIVE REQUIRED until existing runtime envelopes provide those fields.
4. Evidence deep-link coverage remains partial until the authoritative ledger supplies the downstream identifiers.
5. Full CI execution remains to be verified by the primary stream or GitHub Actions after the branch commit.

## Core intervention

None. No Metric Truth, Financial Calculations, Canonical Import Engine, RLS/Tenant Isolation, AI Security, Forecast, Recommendation, Action, Backup/Restore, or Production Certification code was changed.

## Feature status

| Feature | Status |
|---|---|
| Data Quality Center runtime source availability | FOUNDATION / LIVE REQUIRED |
| Business Control Plane runtime read-model adapter | FOUNDATION |
| Document Intelligence runtime adapter | FOUNDATION / LIVE REQUIRED |
| Smart Reconciliation runtime wiring | LIVE REQUIRED |
| Evidence Workspace ledger adapter | FOUNDATION / LIVE REQUIRED |
| UNKNOWN / BLOCKED integrity | FOUNDATION |
| Deep-link reference preparation | FOUNDATION |
| Golden Corpus harness | FOUNDATION |
| Accessibility hardening | FOUNDATION |
| TypeScript / lint / build verification | LIVE REQUIRED |
| End-to-end runtime certification | LIVE REQUIRED |

## Final Batch 03 classification

**Batch 03 = FOUNDATION + LIVE REQUIRED**

It intentionally does not claim COMPLETE because authoritative runtime evidence and executable CI evidence are not yet available in this secondary execution environment.
