# Secondary Agent Batch 04 — Runtime Closure / Regression / CI

Status: FOUNDATION / LIVE REQUIRED (not COMPLETE)
Branch: `parallel/secondary-agent-evidence-ux`
Target: `phase-8-9-completion`
PR: #18 (draft, unmerged)

## 1. Runtime Closure Audit

Batch 01–03 surfaces were audited against authoritative implementations already present in the repository.

| Component | Status | Concrete runtime requirement |
|---|---|---|
| Evidence Workspace | FOUNDATION / LIVE REQUIRED | Authoritative Evidence Ledger is wired; downstream table/row/entity/metric/report/decision/action/outcome IDs require the primary persistence/runtime stream to supply them before they can be shown as links. |
| Decision Replay | FOUNDATION / LIVE REQUIRED | Existing `DecisionEvidenceRecord` is now an explicit adapter source; live decision snapshot/approval/outcome fields still require authoritative decision runtime records. |
| Report Snapshot / Diff | FOUNDATION / LIVE REQUIRED | Existing `ReportSnapshot` is now an explicit adapter source; metric/rule/mapping/evidence fields require the primary snapshot/report runtime to supply them. |
| Data Quality Center | FOUNDATION / LIVE REQUIRED | Existing `fetchDataQualityDatasets()` is reachable, but it does not expose authoritative seven-dimension scores; no client-side score was invented. Mainline must expose the authoritative quality read model to close this gate. |
| Business Control Plane | FOUNDATION | Existing control-plane tables/read signals are consumed with bounded projections. Areas without an authoritative health source remain NOT CONFIGURED. |
| Document Intelligence Workspace | FOUNDATION / LIVE REQUIRED | Existing `documentIntelligenceGateway` and extraction envelope are consumed; actual pages/tables/OCR/mapping/validation/quarantine/reprocess evidence requires runtime extraction/persistence. |
| Smart Reconciliation | FOUNDATION / LIVE REQUIRED | Existing `ReconciliationResult` is now an explicit adapter source. Live row inputs and persisted reconciliation evidence must be supplied by the primary import/report runtime. |
| Golden Corpus | FOUNDATION | 13 synthetic fixtures now have executable contract expectations. This proves fixture semantics, not production parser accuracy. |
| UNKNOWN / BLOCKED integrity | FOUNDATION | Regression guards protect the UI/read-model layer; runtime certification remains required. |
| Accessibility regression | GATED | Static accessibility hardening is present; browser automation remains required for certification. |
| Performance regression | FOUNDATION | Static guards prevent select(*) in secondary runtime/query surfaces and require bounded control-plane reads. Runtime performance measurement remains required. |

## 2. Existing Runtime Implementations Reused

No duplicate Core Engine was introduced.

Reused authoritative implementations:
- `src/lib/data-quality-queries.ts`
- `src/lib/documentIntelligenceGateway.ts`
- `src/lib/free-toolbox/evidence-ledger.ts`
- `src/lib/product-intelligence/decision-evidence-ledger.ts`
- `src/lib/import-pipeline/report-snapshot-history.ts`
- `src/lib/report-intelligence/reconciliation-engine.ts`
- existing Business Control Plane tables/read signals

The secondary runtime adapter only translates authoritative records into existing presentation models.

## 3. Runtime Changes

`src/lib/secondary-batch03-runtime.ts` was improved rather than replaced.

Added:
- `documentWorkspaceFromEnvelope()` — consumes the existing document extraction envelope.
- `decisionReplayFromAuthoritativeRecord()` — consumes existing `DecisionEvidenceRecord`.
- `reportSnapshotFromAuthoritativeSnapshot()` — consumes existing `ReportSnapshot`.
- `reconciliationFromAuthoritativeResult()` — consumes existing `ReconciliationResult` without calculating reconciliation truth.
- Evidence ledger mapping now carries real `source_id` / `evidence_id` only when supplied.
- Missing source evidence is represented as `SOURCE UNAVAILABLE` / `unknown` rather than a fabricated reference.

## 4. Golden Corpus Contract Harness

Added:
- `fixtures/secondary-batch02/expectations.json`
- upgraded `scripts/secondary-batch03-golden-harness.mjs`

The harness validates 13 deterministic fixtures for:
- Arabic / English
- tabular schema/header expectations
- numeric normalization shape
- headerless input
- bad headers
- duplicate detection
- missing fields
- OCR representation
- merged cells
- multi-table documents
- multi-page documents
- reconciliation mismatch
- UNKNOWN / insufficient evidence

Results are strictly classified as:
- PASS
- FAIL
- SKIPPED

A FAIL sets a non-zero exit code. Fixture existence alone is no longer considered a pass.

## 5. Regression Safety Harness

Added:
`scripts/secondary-batch04-regression.mjs`

Guards include:
- reuse of authoritative Data Quality query boundary;
- reuse of Document Intelligence gateway;
- reuse of Evidence Ledger;
- reuse of Decision Evidence contract;
- reuse of ReconciliationResult contract;
- no `select(*)` in secondary runtime/query surfaces;
- UNKNOWN preservation;
- no fake HEALTHY from UNKNOWN;
- executable Golden Corpus expectations;
- no paid provider markers in the secondary runtime;
- explicit SKIPPED classification for checks requiring browser/live tenant/runtime evidence.

## 6. Evidence Safety

The secondary branch does not create an evidence route or identifier.

Evidence deep links can only be completed when an authoritative source reference/evidence identifier is supplied. If absent, the presentation remains UNKNOWN / SOURCE UNAVAILABLE.

The secondary branch does not make approval or action-execution decisions. It only prevents the presentation layer from treating missing evidence as verified evidence.

## 7. Accessibility / UX

Existing Batch 01–03 surfaces were reviewed.

Preserved/improved:
- keyboard focus states;
- semantic status/live regions;
- accessible table captions and scoped headers;
- RTL layout;
- explicit UNKNOWN / ERROR / EMPTY / BLOCKED states;
- no zero substitution for missing values.

Browser-level accessibility certification remains GATED because a browser runner is required.

## 8. Performance

The Batch 04 changes do not add a new cache or polling system.

Guards enforce:
- no `select(*)` in secondary runtime/query code;
- bounded control-plane `limit(1)` reads;
- no unlimited evidence fetch introduced;
- no new polling loop;
- no new bulk document fetch;
- authoritative query boundaries remain responsible for pagination/virtualization.

Full runtime measurement remains LIVE REQUIRED.

## 9. Tests / CI

### Added executable commands

- `npm run test:secondary-batch04-golden`
- `npm run test:secondary-batch04-regression`
- `npm run test:secondary-batch04`

### CI workflow

Added `.github/workflows/secondary-agent-batch04.yml`.

It runs on pushes to the secondary branch and pull requests targeting `phase-8-9-completion`, and executes:
1. `npm ci`
2. Golden Corpus contract harness
3. Runtime/safety regression harness
4. TypeScript
5. Lint
6. Build

### Actual execution performed

**Golden Corpus contract harness — PASS**
- 13/13 fixtures PASS.
- 0 FAIL.
- 0 SKIPPED.
- The harness was executed against the exact synthetic fixture contents and expectations committed for Batch 04.

**Golden Corpus SKIPPED-path verification — PASS**
- 13/13 cases classified SKIPPED when `SECONDARY_BATCH04_SKIP=1`.
- Every SKIPPED result contains an explicit reason.

**Regression harness — PASS as a harness-level contract test**
- 21 checks PASS.
- 0 checks FAIL.
- 4 checks SKIPPED with explicit reasons for browser/live-runtime requirements.
- This execution validates the harness logic and contract guards; it is not a substitute for running the full repository test suite.

**Full repository TypeScript / lint / build — SKIPPED**
- The available execution environment does not contain the complete repository checkout and dependency installation for this branch.
- The dedicated GitHub Actions workflow was added, but the connected GitHub execution surface currently reports no workflow run/status for the latest commit.

Therefore no full-project TypeScript, lint, build, browser, RLS, or live-runtime PASS is claimed.

## 10. Security / Tenant

- No RLS policy changed.
- No tenant identifier was added to the UI.
- Existing RLS/read-model boundaries remain authoritative.
- No action execution or approval enforcement was added.
- No customer data or secrets were added.
- Golden fixtures are synthetic.
- No paid provider was introduced.

## 11. Free-First / Cost Impact

No dependency was added.

No Paid API, Paid AI, Paid OCR, Paid Storage, Paid SaaS, or mandatory external provider was introduced.

Cost impact: none introduced by Batch 04.

## 12. Limitations / Mainline Dependencies

### LIVE REQUIRED — MAINLINE DEPENDENCY: Data Quality

Required:
- authoritative seven-dimension quality read model with evidence/source references.

Why mainline:
- calculating the score in the secondary UI would create a parallel truth engine.

Safe to merge now:
- adapter, UNKNOWN handling, and regression guards.

### LIVE REQUIRED — MAINLINE DEPENDENCY: Smart Reconciliation

Required:
- authoritative runtime inputs/result persistence and source evidence for the existing `ReconciliationResult`.

Why mainline:
- the secondary branch must not replace the primary reconciliation/import truth.

Safe to merge now:
- adapter that consumes `ReconciliationResult` and preserves UNKNOWN when absent.

### LIVE REQUIRED — MAINLINE DEPENDENCY: Document Intelligence

Required:
- real extraction envelope with persisted page/table/OCR/mapping/validation/quarantine/reprocess evidence.

Why mainline:
- those values belong to the existing document/import runtime.

Safe to merge now:
- envelope adapter and UNKNOWN/BLOCKED behavior.

### LIVE REQUIRED — MAINLINE DEPENDENCY: Evidence downstream graph

Required:
- authoritative downstream IDs for table/row/column/cell/entity/canonical/metric/report/decision/action/outcome.

Why mainline:
- creating a parallel evidence graph would violate the no-duplicate-core rule.

Safe to merge now:
- optional ID propagation and SOURCE UNAVAILABLE behavior.

## 13. Core Intervention

None.

No changes were made to:
- Metric Truth
- Financial Calculations
- Canonical Import Engine
- RLS / Tenant Isolation
- AI Security
- Forecast Engine
- Recommendation Engine
- Action Execution
- Approval Enforcement
- Autonomous Actions
- Backup / Restore
- Multi-currency Truth
- Multi-branch Authorization
- Production Certification

## 14. Completion Classification

| Area | Status |
|---|---|
| Runtime closure audit | FOUNDATION |
| Data Quality wiring | FOUNDATION / LIVE REQUIRED |
| Business Control Plane wiring | FOUNDATION |
| Document Intelligence wiring | FOUNDATION / LIVE REQUIRED |
| Reconciliation wiring | FOUNDATION / LIVE REQUIRED |
| Evidence wiring | FOUNDATION / LIVE REQUIRED |
| Decision Replay authoritative adapter | FOUNDATION / LIVE REQUIRED |
| Report Snapshot authoritative adapter | FOUNDATION / LIVE REQUIRED |
| UNKNOWN / Evidence safety guards | FOUNDATION |
| Golden Corpus expectations | FOUNDATION |
| Contract regression guards | FOUNDATION |
| Accessibility regression | GATED |
| Performance regression | FOUNDATION |
| TypeScript/Lint/Build CI | LIVE REQUIRED until workflow evidence is observed |
| End-to-end runtime certification | LIVE REQUIRED |
| Batch 04 | FOUNDATION / LIVE REQUIRED |

## 15. Merge Prerequisites

Before the primary agent merges PR #18:
1. Observe the Batch 04 GitHub Actions workflow and record actual PASS/FAIL/SKIPPED results.
2. Resolve any TypeScript/Lint/Build failures.
3. Validate the adapters against the primary runtime evidence streams.
4. Close the listed LIVE REQUIRED mainline dependencies where authoritative contracts become available.
5. Run primary-agent runtime E2E / security / production gates.
6. Only then consider moving any component to COMPLETE.

Batch 04 deliberately does not claim COMPLETE.
