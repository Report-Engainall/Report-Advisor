# Master Execution Index — Current Delta — 2026-08-25

Append-only supplement to `docs/MASTER_EXECUTION_INDEX.md`.

## Verified discoveries
- Canonical TypeScript file engine already implements schema discovery, header detection, semantic mapping, Arabic/Latin business-key entity resolution and reconciliation.
- Existing layout/table fidelity tests detect table/row loss and fallback.
- Watched reports, business control plane and K runtime contracts already exist.
- Recent Quality/runtime failures had `steps:null`; no application root cause is asserted without executable steps.
- The same pre-step failure pattern is reproducible across the canonical `quality` run, the `runner-diagnostic` run, and the re-run attempt: jobs complete as failure with zero reported steps and job logs are unavailable (`BlobNotFound`). This is now classified as runner/bootstrap evidence, not an application defect.
- Resumable execution is already implemented and hardened: checkpoint state machine, lease lifecycle, queue idempotency, retry and dead-letter semantics have dedicated fixes and regression/closure gates (`eb877c8`, `a822fdf`, `640052df`, `25ba6e9`, `28cc790`). Do not rebuild this subsystem; audit integration/evidence instead.
- K→S runtime already has canonical portfolio/checkpoint alignment and a durable lifecycle runner (`91f1497`, `3a00546`).
- Production certification is already heavily implemented: certification policy, rollback assurance, certification bundle, chain/boundary guards and CI workflows exist (`f2859b6`, `73e10f`, `93386c2`, `d18e327`, `35e9dbb`, `de906dd`). Do not create another certification framework; the remaining gap is executable/live evidence and consolidation.

## Deep inventory discoveries — 2026-08-25
- Current recursive repository tree confirms the canonical UI/application surface is under `src/` with `App.tsx`, `main.tsx`, `components/`, `pages/`, `lib/`, and `index.css`; do not assume an absent frontend layer.
- The repository currently has a dedicated `services/document-intelligence/` service and `supabase/migrations/`; database/service layers therefore exist as first-class source surfaces and must be audited alongside `src/` and `scripts/`.
- The current tree contains 23 workflow files. `quality.yml` is the automatic canonical path; specialized production/recovery/runtime workflows remain separate and should not be duplicated without a proven coverage gap.
- `quality.yml` currently wires Core contracts, production certification, operational resilience, continuous trust, autonomy governance, watched reports, K/L/M, production blockers, A0 hardening, typecheck, regressions, tenant/security, lint/build, intelligence/scale, analysis runtime, document intelligence service tests, report truth/readiness and full document resilience. This substantially reduces the set of missing static gates; future work should prioritize integration/live evidence rather than adding more broad gates.
- `package.json` is an unusually dense execution registry: it already covers A0–M, K→S, production certification/readiness/blockers, file/schema/entity/reconciliation, Onyx/import, analysis cache/concurrency, inventory/demand/decision intelligence, tenant/RLS, document intelligence, adversarial/golden/evidence/provenance/regression/performance suites. Never infer a missing test from a missing filename until the package registry and referenced script are checked.
- `scripts/` already contains adversarial document corpus tests, canonical-text provenance tests, release-manifest tooling and a large family of `check-*` contracts. This is evidence that several previously listed P1 items may be partially implemented and require capability/evidence mapping rather than greenfield construction.
- The current `quality.yml` explicitly executes Python service tests with `python3 -m unittest discover -s services/document-intelligence/tests -p 'test_*.py'`, so Document Intelligence service tests are part of the canonical quality definition even though current GitHub runtime evidence has not reached executable steps.
- `supabase/migrations/` exists as the database schema source. Migration safety/drift must therefore be evaluated from actual migration history and release gates, not treated as a missing database layer.

## Repairs
- `production-integrity-wave-v2.yml`: manual-only + Ubuntu 22.04. Commit `f170c13974c86ad1432af16bd75a87455bcf5749`.
- `report-execution-gate.yml`: manual-only + Ubuntu 22.04. Commit `500d0a877da5d9aa89f5658ad96d752d8eca7688`.
- `runtime-closure-wave.yml`: manual-only + Ubuntu 22.04. Commit `44ed31658f05296055a89d8ca0af028e69d60f7d`.
- `quality.yml`: canonical automatic path pinned to Ubuntu 22.04. Commit `653a7825393c8a8069430ceb52c71083bb60a6b4`.
- Batch audit ledger: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-3.md`, commit `d56da91e6a7026b207b0b75d14a64b0b8afd0320`.

## Current runtime evidence
- Quality run `32791765387`: failed; job `verify` ended with `steps:null`.
- Runner diagnostic run `32791765423`: failed; job `probe` ended with `steps:null`.
- A targeted re-run of the Quality job was performed. The resulting job `97635233280` again ended with failure and `steps:[]`; logs remain unavailable (`BlobNotFound`).
- A targeted inspection of the runner diagnostic job also returned `steps:[]` and unavailable logs.
- Therefore no TypeScript/Python/SQL/package command has been observed executing in these attempts. Do not alter application logic to compensate for this evidence.

## Current truth
Document Intelligence, schema/entity/reconciliation, watched reports, business control plane and K are IMPLEMENTED/GATED. Resumability/dead-letter and production certification frameworks are also IMPLEMENTED/GATED. Live production certification remains incomplete because executable runtime evidence has not yet been obtained.

## Current priority order
1. Preserve application correctness while isolating runner/bootstrap infrastructure failure.
2. Use existing manual specialist workflows for Document Intelligence and J/K/L as soon as workflow dispatch is available, and record real executable evidence.
3. Audit existing resumability/dead-letter and certification integration/evidence rather than rebuilding them.
4. Continue static closure work only where it closes a verified implementation gap; do not create duplicate gates.
5. Advance E/F/H/I live security/resilience/governance evidence in parallel.
6. Do not mark M or Production Certification complete until executable runtime evidence exists.

## Reclassified work after deep inventory
- Document Intelligence internal architecture is no longer treated as a broad greenfield gap. Existing service, pipeline/contracts, intermediate model, adversarial corpus, layout/table fidelity, extraction-quality, provenance, fallback, golden E2E and resilience suites are present. Remaining work is now specifically: capability-to-requirement traceability, missing edge-case coverage, live execution evidence, and any proven implementation gaps discovered by those tests.
- Resumability/dead-letter is no longer a build backlog item. It is an integration/evidence item.
- Production certification is no longer a framework build item. It is a live evidence/consolidation item.
- The next high-value static audit target is the relationship among `package.json` scripts, `quality.yml` steps, `scripts/check-*`, service tests, migrations and UI/runtime entry points. Any item present in one layer but absent in the others is a candidate integration gap.

## Next execution — revised after full inventory
### NOW-A — Cross-surface traceability
For every P0/P1 capability, trace `requirement → implementation → package script → quality/manual workflow → runtime dependency → evidence`. Mark each edge present/missing. Fix broken edges, not already-complete nodes.

### NOW-B — Migration/database closure
Inspect actual `supabase/migrations/` history against tenant/RLS/import/recovery/release contracts. Identify schema drift, duplicate migrations, missing indexes/policies, or release ordering gaps only where proven.

### NOW-C — Frontend/runtime closure
Trace `App.tsx → pages → components → lib/services → backend/database` for critical flows (upload/import, document review, report execution, decision intelligence, evidence, certification). Identify UI-to-runtime dead ends rather than adding pages blindly.

### NOW-D — Document edge-case closure
Use existing adversarial/golden suites as the baseline. Add only missing cases for Arabic/English, scanned/poor quality, no-header/reverse schema, merged/multi-table, provenance, reconciliation and quarantine/reprocessing.

### NOW-E — J/K/L connected runtime
Trace and prove the complete durable job → checkpoint → business snapshot → evidence → decision → outcome loop using existing implementations.

### NOW-F — E/F/H/I live evidence
Execute tenant, storage, realtime, AI retrieval, backup/restore, worker recovery, SLO, rollback and governance canaries when the runtime environment is available.

### NOW-G — CI runtime recovery
Continue isolating the pre-step GitHub failure. Do not attribute it to application code until a workflow reaches an executable step and produces logs.

### NOW-H — Production certification
Only after live evidence closes all P0 blockers and the authoritative release/certification chain produces current evidence.

## Next
The next cycle starts with NOW-A cross-surface traceability, then immediately fixes the highest-impact broken edges while NOW-G runner evidence and NOW-F live evidence proceed in parallel. No duplicate architecture or gate is to be created unless the inventory proves a genuine absence.
