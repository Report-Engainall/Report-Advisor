# Secondary Agent Batch 05 — Baseline Gap + Runtime Evidence Preparation

Status: **FOUNDATION / GATED / LIVE REQUIRED** — not COMPLETE
Branch: `parallel/secondary-agent-evidence-ux`
Target: `phase-8-9-completion`
PR: #18 (draft, open, unmerged)

## 1. Pre-change baseline audit

Latest `phase-8-9-completion` at audit time: `496e0f0cce6e4e268fa3029a8fd3c35b4e8794a0`.

Latest Batch 04 branch CI run before Batch 05 changes: `32807266529` on `fd2e0cf31f6ece41ea24c2468fc17297931b409b`.

Observed Batch 04 CI:
- Contracts: PASS.
- Golden Corpus: PASS 13/13.
- Regression: PASS 21 PASS / 0 FAIL / 4 explicit SKIPPED.
- TypeScript: FAIL.
- ESLint: FAIL.
- Build: FAIL.

The PR base recorded by PR #18 is still the older base SHA `a9dbd6c0ba35bee2d52d002ac462b7b09dc3782f`; no rebase/merge was performed in Batch 05.

## 2. Baseline gap analysis

### `globals`
- File: `eslint.config.js`.
- Root cause: the config imports `globals`, while the current `package.json` does not declare it.
- Classification: **MAINLINE DEPENDENCY / GAP**, not a Batch 05 regression.
- Safe fix in this branch: intentionally NOT applied.
- Existing mainline work: Draft PR #20 (`parallel/ci-baseline-closure`) explicitly aligns `package.json` with the locked ESLint toolchain.
- Why not duplicate: the primary/mainline path already owns this exact baseline repair.

### `fetchCategoryBreakdown`
- File: `src/pages/DashboardPage.tsx` imports it; `src/lib/queries.ts` does not export it.
- Root cause: existing consumer/contract mismatch in the repository baseline.
- Classification: **MAINLINE DEPENDENCY / GAP**, not a Batch 05 regression.
- Safe fix in this branch: intentionally NOT applied.
- Existing mainline work: Draft PR #20 explicitly implements the existing `fetchCategoryBreakdown` contract using canonical `sale_items → products → categories` relations without mock data.
- Why not duplicate: fixing the same baseline in two parallel branches would create conflicting truth/merge work.

## 3. Runtime contract findings

Existing authoritative implementations inspected:
- `src/lib/free-toolbox/evidence-ledger.ts`
- `src/lib/product-intelligence/decision-evidence-ledger.ts`
- `src/lib/import-pipeline/report-snapshot-history.ts`
- `src/lib/documentIntelligenceGateway.ts`
- `src/lib/report-intelligence/reconciliation-engine.ts`
- `src/lib/data-quality-queries.ts`
- existing Business Control Plane read signals

No duplicate engine or database truth was added.

### Evidence chain

| Node | Status | Requirement to close |
|---|---|---|
| Source/File | FOUNDATION / LIVE REQUIRED | persisted source reference from authoritative file pipeline |
| Page | LIVE REQUIRED | persisted page-level extraction evidence |
| Table | LIVE REQUIRED | persisted table-level extraction evidence |
| Row | LIVE REQUIRED | persisted row identity/evidence |
| Column | LIVE REQUIRED | persisted column identity/evidence |
| Cell | LIVE REQUIRED | persisted cell-level evidence |
| Extracted | FOUNDATION / LIVE REQUIRED | authoritative extraction fact with source |
| Normalized | FOUNDATION / LIVE REQUIRED | authoritative normalized value with provenance |
| Entity | LIVE REQUIRED | canonical entity-resolution runtime output |
| Canonical Record | LIVE REQUIRED | canonical import/runtime record |
| Metric | LIVE REQUIRED | primary Metric SSOT runtime reference |
| Report | LIVE REQUIRED | primary report runtime record |
| Decision | FOUNDATION / LIVE REQUIRED | persisted decision record/snapshot |
| Action | LIVE REQUIRED | authoritative action/approval runtime record |
| Outcome | LIVE REQUIRED | persisted outcome/measurement record |

The secondary branch only propagates optional IDs already supplied. It does not invent IDs or routes.

## 4. Safety correction

`src/lib/secondary-batch03-runtime.ts` was hardened so `EvidenceRef.sourceRef` is only populated from the authoritative `source_id`.

Previous behavior could fall back to the local reference ID when `source_id` was absent. Batch 05 removes that fallback. Missing source evidence now remains `UNKNOWN`.

This is a safety correction, not a new feature.

## 5. Document runtime readiness

| Stage | Status | Finding |
|---|---|---|
| Upload | LIVE REQUIRED | Primary file runtime owns real upload evidence. |
| Classification | FOUNDATION | Existing document routing/profile exists. |
| Parsing/OCR | FOUNDATION / LIVE REQUIRED | Gateway plans capability; actual extraction execution is outside this branch. |
| Envelope | FOUNDATION | Existing `DocumentExtractionEnvelope` is consumed. |
| Schema | LIVE REQUIRED | Runtime schema result must be supplied by the existing document pipeline. |
| Mapping | LIVE REQUIRED | Runtime mapping evidence must be supplied by existing import/document path. |
| Validation | LIVE REQUIRED | Persisted validation evidence is not owned by the secondary adapter. |
| Quarantine | LIVE REQUIRED | Runtime quarantine records must be supplied by primary pipeline. |
| Persistence | LIVE REQUIRED | Evidence persistence belongs to the primary runtime. |
| Lineage | FOUNDATION / LIVE REQUIRED | Adapter consumes source references when present; downstream graph persistence remains primary-owned. |

## 6. Reconciliation runtime

The secondary adapter consumes the existing `ReconciliationResult` only.

It exposes:
- duplicate count;
- new/unmatched count;
- changed/conflict/reversed differences;
- mismatch status/reason;
- remediation text;
- optional source evidence.

It does not fabricate source totals, canonical totals, tolerance, or persisted row evidence.

When an authoritative result is absent, the adapter returns `UNKNOWN`.

Remaining status: **LIVE REQUIRED — MAINLINE DEPENDENCY**.

## 7. Data Quality

`fetchDataQualityDatasets()` remains the authoritative tenant-native query boundary. It supplies source datasets but does not expose authoritative seven-dimension quality scores.

The secondary branch therefore keeps:
- Completeness = UNKNOWN
- Uniqueness = UNKNOWN
- Validity = UNKNOWN
- Consistency = UNKNOWN
- Freshness = UNKNOWN
- Reconciliation = UNKNOWN
- Anomalies = UNKNOWN

No score is calculated in the secondary UI/read model.

Status: **LIVE REQUIRED — MAINLINE DEPENDENCY**.

## 8. Golden Corpus

The existing 13 fixtures are preserved without expansion.

The executable expectation harness remains responsible for:
- Arabic/English;
- OCR representation;
- headerless input;
- bad headers;
- duplicate detection;
- missing fields;
- merged cells;
- multi-table;
- multi-page;
- reconciliation mismatch;
- UNKNOWN evidence.

Production parser/runtime accuracy is not claimed from fixture PASS alone.

## 9. Batch 05 test additions

Added:
- `scripts/secondary-batch05-runtime-audit.mjs`
- `npm run test:secondary-batch05-runtime-audit`
- Batch 05 runtime audit step in `.github/workflows/secondary-agent-batch04.yml`

The audit checks authoritative contract reuse, no duplicate reconciliation/import engine, no `select(*)`, no fabricated source reference fallback, optional deep-link IDs, UNKNOWN safety, 13-case Golden Corpus preservation, and Free/Local-first policy.

Four checks are explicitly SKIPPED because they require live runtime/browser evidence:
- live tenant runtime;
- browser accessibility execution;
- end-to-end document persistence;
- end-to-end reconciliation evidence.

## 10. Accessibility / performance

No new UI surface was added.

Batch 05 only adds static regression guards around the existing surfaces. Browser accessibility certification remains **GATED** until a real browser runner executes keyboard/focus/ARIA/RTL/error/empty/unknown checks.

No new cache, polling, bulk evidence fetch, or unbounded query was added.

## 11. Free-first / cost

No dependency, provider, SaaS, paid API, paid AI, paid OCR, paid storage, or paid fallback was added.

Cost impact: **none introduced by Batch 05**.

## 12. Security / tenant

- No RLS changes.
- No tenant identifier added to UI.
- No approval/action execution changes.
- No evidence IDs fabricated.
- No customer data or secrets added.
- Golden fixtures remain synthetic.

## 13. Status matrix

| Component | Status |
|---|---|
| Runtime Closure Audit | GATED |
| Evidence Workspace | FOUNDATION / LIVE REQUIRED |
| Decision Replay | FOUNDATION / LIVE REQUIRED |
| Report Snapshot | FOUNDATION / LIVE REQUIRED |
| Data Quality | FOUNDATION / LIVE REQUIRED |
| Business Control Plane | FOUNDATION |
| Document Intelligence | FOUNDATION / LIVE REQUIRED |
| Smart Reconciliation | FOUNDATION / LIVE REQUIRED |
| Golden Corpus | FOUNDATION |
| UNKNOWN / Evidence Safety | GATED |
| Contract Regression | GATED |
| Accessibility | GATED |
| Performance guards | GATED |
| TypeScript | GAP — MAINLINE BASELINE; PR #20 already addresses related baseline closure |
| ESLint | GAP — MAINLINE BASELINE; PR #20 already addresses related baseline closure |
| Build | GAP — MAINLINE BASELINE; PR #20 already addresses related baseline closure |
| End-to-end Runtime Evidence | LIVE REQUIRED |
| Batch 05 | FOUNDATION / GATED / LIVE REQUIRED |

## 14. Merge prerequisites

1. Primary stream decides how PR #20 baseline fixes are integrated.
2. Do not rebase/merge PR #18 from this branch.
3. Run Batch 05 CI on this branch and record actual PASS/FAIL/SKIPPED.
4. Primary runtime supplies authoritative Data Quality scores, document persistence, reconciliation persistence, and downstream Evidence Graph IDs.
5. Browser/E2E/security/tenant runtime evidence is executed by the primary stream.
6. Only then promote individual components to COMPLETE.

## 15. Core intervention

None.

No changes to Metric Truth, Financial Truth, Canonical Import Engine, RLS/Tenant Isolation, AI Security, Forecast, Recommendation, Action Execution, Approval Enforcement, Backup/Restore, Multi-currency, Multi-branch authorization, or Production Certification.
