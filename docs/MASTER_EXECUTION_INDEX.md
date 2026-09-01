# Report Advisor — Master Execution & Truth Index

## OWNER CONTROL ADDENDUM — 2026-09-01

This addendum is authoritative for execution priority. Historical records remain historical; no old PASS is promoted to the current release candidate.

## CYCLE 11 CLOSURE UPDATE — 2026-09-01

- Added `src/lib/cycle11-canonical-closure.test.ts`: deterministic canonical fixture/edge contract for net sales, receivables, payables, inventory value, inventory velocity, stock coverage, replenishment, stochastic inventory, liquidity, confidence bounds, empty/negative/non-finite inputs, and missing-cost CCC behavior.
- Added `src/lib/document-intelligence/golden-dataset.boundary.test.ts`: deterministic Golden Corpus completeness, confidence fail-closed, schema/normalization/provenance coupling, and duplicate/unknown-ID scoring guards.
- Repository Golden Corpus currently contains **8** deterministic cases (`ARABIC_ENGLISH`, `SCANNED`, `RANDOM_SCHEMA`, `NO_HEADER`, `COMPLEX_TABLE`, `INVOICE`, `ONYX`, `WIDE_30_PLUS`). These are source-level/unit fixtures, not live OCR accuracy proof.
- Supabase staging source-of-truth inspection returned **24 SECURITY DEFINER functions**, all with explicit `search_path=public`.
- Direct routine-grant inspection found **14 authenticated EXECUTE grants** and no `anon`/`PUBLIC` EXECUTE grants among the 24; the remainder are restricted to `postgres`/`service_role`.
- Staging confirmed RLS enabled on the inspected decision, recommendation, outcome, alert, watched-file, watched-folder, membership, and evidence tables.
- `current_company_id()` was runtime-checked under `authenticated` with a real membership claim and resolved the expected tenant.
- A staged cross-tenant mutation attempt against `update_recommendation_status()` was denied and rolled back; no mutation persisted.
- A staged negative contract exercised `create_runtime_decision`, `create_decision_work_item`, `complete_decision_work_item`, `finalize_runtime_decision`, and `record_decision_outcome` with invalid/empty inputs; all were denied and the transaction was rolled back.
- Supabase performance advisor currently reports **INFO-level unused-index notices only**; no automatic index removal was made because staging non-use is not sufficient evidence that an index is harmful.
- Operational tables currently contain 0 `report_execution_jobs`, 0 `watched_report_files`, 0 `backup_verification_runs`, 0 `production_rollback_drills`, and 0 `autonomy_rollback_drills`; therefore runtime success/recovery/DR PASS was not fabricated.
- Security remains **PROVISIONALLY CLOSED**; role-specific authorization proof and leaked-password protection configuration remain separate final-certification items.

### Reconciled release baseline

- Main baseline: `4705028d1e19ea7201f4cb9945ce3e1cc1a550a2`.
- PR #294: **OPEN / NOT MERGED**.
- Exact-head CI remains unproven; historical/branch-local PASS is not promoted to the release baseline.
- Production certification remains **NO**.

## EXISTING RELEASE-CLOSURE CONTEXT

The integration contains justified portions of #289–#293 and intentionally excludes stale historical/package-only changes that do not advance the current release.

Concrete hardening already integrated before Cycle 11 includes fail-closed metric confidence, AI tenant-scope validation, canonical numeric sanitization, authoritative report-fact evidence, executable boundary contracts, least-privilege CI workflows, and database hardening of `finalize_runtime_decision`.

The final certification path remains:

```text
ONE EXACT RELEASE SHA
+ Build/Typecheck/Lint PASS
+ Quality/Architecture PASS
+ Security PASS
+ DB/Migration parity PASS
+ Canonical Truth PASS
+ Authenticated E2E PASS
+ Tenant A/B PASS
+ Storage/Realtime/AI isolation PASS
+ Exact Vercel deployment/runtime PASS
+ OCR/Document Golden Corpus PASS
+ Worker/Queue/Recovery PASS
+ Backup/Restore PASS
+ Rollback PASS
+ Performance/Scale PASS
+ Observability PASS
+ Critical UX PASS
+ Independent Business Acceptance PASS
+ Complete Evidence Pack
= PRODUCTION CERTIFIED / SELLABLE
```

## STANDING PARALLEL EXECUTION BOARD

### P0 — Authenticated runtime + Tenant A/B
Real Actor A/B login/session, own-data persistence, cross-tenant read/write/RPC/direct-object attacks, Storage, Realtime and AI/vector isolation. Runtime credentials/evidence remain required.

### P0 — Vercel / exact deployment
Fresh candidate deployment, SHA binding, `/`, `/login`, deep routes, authenticated journey, console/network verification. Vercel quota remains external.

### P0 — Canonical Truth / UI-RPC-Export
The new deterministic canonical closure test is committed but not yet executed because the available execution environment cannot install/execute the repository test harness. Runtime UI/RPC/export parity remains separate from source/unit closure.

### P1 — OCR / Document Golden Corpus
Golden Corpus boundary contracts are committed. Live parser/OCR execution and actual PDF/DOCX/image fixture processing remain to be executed in a runtime-capable repository environment.

### P1 — Workers / Queue / Watched Folder
Existing contract/state-machine implementation remains available; runtime success/failure/retry/lock/crash/restart/recovery/DLQ and watched-folder E2E still require execution in a worker-capable environment. No runtime PASS claimed.

### P1 — Backup / Restore / Rollback
Repository procedures/contracts remain the source-level path; actual backup artifact, restore, RPO/RTO, canary and rollback drills remain operational-only.

### P1 — Performance
Supabase advisor has INFO unused-index notices only. No destructive index cleanup made. Accepted latency targets remain runtime-only until real benchmarks execute.

### P1/P2 — Electron/Windows, Product Acceptance, Observability
Source-level work can continue; Windows native/installer and authenticated product journeys remain runtime-bound where applicable.

## DO NOT WASTE EXECUTION TIME ON

- Rebuilding React/Vite/Supabase architecture without a concrete defect.
- Rebuilding Import V2.
- Reopening already-proven Security inventory without new evidence.
- Treating contracts as runtime PASS.
- Treating historical PASS as current exact-SHA PASS.
- Waiting for CI, Vercel quota, or Windows when independent repository work is executable.

## CYCLE 13 CLOSURE UPDATE — 2026-09-01

- Executed the deterministic Golden Corpus boundary logic directly with the repository fixture definitions: **8/8 cases**, all canonical expected outputs accepted; duplicate/unknown IDs were ignored by the scorer; NaN and below-threshold confidence were rejected.
- Identified and fixed a real financial-decision fail-open defect: non-finite cash-reserve inputs could be normalized to zero and permit payment decisions. `protectCashReserve()` now exposes a validity boundary; supplier-payment prioritization holds payment when the reserve input is invalid.
- Added `src/lib/financialDecisionEngines.boundary.test.ts` covering four invalid reserve-input classes plus valid behavior.
- Executed the new financial reserve boundary harness directly with Node 22: **4/4 invalid cases blocked + 1/1 valid case preserved**.
- Hardened release-evidence consumption so expected, manifest, and consumed source SHAs must each match exactly **40 hexadecimal characters** before evidence can be consumed.
- Staging worker/watch-folder execution was advanced with transaction-scoped synthetic fixtures. `claim_report_execution_job()` successfully leased a synthetic job once and rejected the second claim while the first lease was active; the transaction was rolled back. `record_watched_report_file()` successfully created then updated the same path, proving the unique tenant/folder/path idempotent update behavior (`source_version` 1 → 2); malformed empty path and negative size were rejected. No synthetic data was left behind.
- Source inspection confirmed worker claiming is intentionally restricted to `service_role`/`postgres`; authenticated callers do not receive EXECUTE. This is classified as an intentional worker boundary, not an authorization defect.
- Current operational counts remain zero after rollback; no synthetic runtime PASS was promoted to persistent operational evidence.
- Security remains provisionally closed; no duplicate security investigation was opened.


## CYCLE 14 CLOSURE UPDATE — 2026-09-01

- Found and fixed a canonical-layer fail-open propagation defect: `buildCanonicalIntelligence()` previously sanitized explicit non-finite reserve inputs before passing them to `protectCashReserve()`, which could convert an invalid reserve context into an apparently valid zero-value reserve. The canonical layer now preserves explicit invalidity while still defaulting omitted optional values to zero.
- Added a regression case to `src/lib/cycle11-canonical-closure.test.ts` requiring explicit non-finite canonical reserve input to remain invalid and force supplier-payment `HOLD_PAYMENT`.
- Repository package scripts confirm dedicated executable contracts exist for report execution, watched-report pipeline, operational resilience, golden corpus, and production certification; however the available execution environment still cannot run the repository Node/Vitest harness, so no unexecuted contract was promoted to PASS.
- Staging lifecycle functions were re-inspected after the Cycle 13 drills. Worker claiming remains service-role/postgres-only by design; watched-file recording remains authenticated-context guarded. No new persisted synthetic operational data was created in this cycle.
- CI, Vercel quota, browser-authenticated journeys, live OCR backend, Windows native execution, and destructive/operational backup/restore/rollback drills remain external runtime capabilities and are not represented as PASS.


## CYCLE 15 EXECUTION UPDATE — 2026-09-01

- Current candidate HEAD is `f464923eef5cf9ab120dfa1664aff15a95dfa836`. No prior-SHA PASS is promoted to this HEAD.
- Found and fixed a real reserve-input validation gap in `src/lib/financialDecisionEngines.ts`: finite negative cash/outflow/inflow values and reserve percentages outside 0–100 were previously marked `valid=true` and sanitized into zero/clamped values. The reserve contract now treats those ranges as invalid and fails closed.
- Added regression coverage in `src/lib/financialDecisionEngines.boundary.test.ts` for negative opening cash, negative committed outflow, negative collectible inflow, negative reserve percentage, and reserve percentage above 100. The repository Vitest runner remains unavailable in the current execution environment, so these new tests are not claimed as executed.
- Executed a controlled Staging SQL worker probe using a real authenticated tenant context with a transaction that rolled back all synthetic data: initial claim succeeded, concurrent second claim was denied, the expired lease was reclaimed by a different worker, and final state was `leased`, attempt 2, owned by the recovery worker. This is runtime evidence for claim/concurrency/recovery only; it is not full worker lifecycle certification.
- Staging capability inspection found `report_execution_jobs` present but the candidate lifecycle functions `heartbeat_report_execution_job`, `advance_report_execution_checkpoint`, `complete_report_execution_job`, `fail_report_execution_job`, and `retry_report_execution_job` absent from the connected staging database. The older staging surface therefore cannot execute the complete candidate worker lifecycle until the corresponding migrations/functions are applied.
- Staging operational counts after the rolled-back probe remain zero for `report_execution_jobs`, `watched_report_folders`, `watched_report_files`, `backup_verification_runs`, `production_rollback_drills`, and `autonomy_rollback_drills`.
- Supabase advisors were re-read. Security still reports authenticated SECURITY DEFINER warnings and leaked-password protection remains a configuration blocker; these are not reclassified as new defects because the existing security boundary was already provisionally closed and the affected authenticated functions are intentional API boundaries. Performance findings remain INFO-level unused-index notices; no index was removed without workload evidence.
- Backup/restore remains procedure/runtime-bound: Supabase's current documented path supports `supabase db dump` for logical artifacts and restore to an isolated/new target; the production restore itself remains an operational drill. 


- Staging authenticated tenant-boundary probe executed under `authenticated` role with tenant A context: `A → A` watched-folder create was allowed; `A → B` direct create was denied by the database boundary. The whole probe rolled back and left no persistent fixture.
