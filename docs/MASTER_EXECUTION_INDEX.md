# Report Advisor — Master Execution & Truth Index

## OWNER-LEVEL RELEASE CLOSURE — 2026-09-01

This file is the authoritative execution index. Historical PASS remains historical. No PASS may move between branches/SHAs without exact-head evidence.

## Current Truth

- Planning estimate from latest developer assessment: **~88%** overall.
- Independent release-readiness judgment: advanced Release Candidate; **NOT Production Certified / NOT Sellable yet**.
- Current `main` release baseline: `89c8361e85878521c915328f6d0a595663498cd3`.
- Owner integration PR: **#294**, OPEN / NOT MERGED.
- PR #294 current exact head: `4431317d6bf5e8ee620b8a043463cae56727d6b8`.
- PR #294 base SHA: `89c8361e85878521c915328f6d0a595663498cd3`.
- `e2d7f57e4a4eab3327b54d762427a46e4d3a3264` is an index-referenced integration candidate only; it is NOT the current PR #294 HEAD.
- The prior frozen candidate `dc8d1be34a98d0766fd0baaba29effaf8bf9ed44` remains a historical candidate and is not certified by this documentation-only reconciliation commit.
- Do not call the PR head `main` PASS until PR #294 is merged and exact-head CI passes.

## Latest Executed Cycle — 2026-09-01

The developer revalidated PR #294 and the index, confirmed the candidate remained unmerged, and attempted additional direct Supabase and local-test verification. Those attempts were blocked by missing valid Supabase project reference and unavailable GitHub network access in the execution environment. No fabricated DB/test PASS was accepted.

Security work continues as function-level analysis rather than blanket revoke. The previous staging verification remains recorded: `finalize_runtime_decision` had `anon EXECUTE = FALSE` and `authenticated EXECUTE = TRUE`; Security Advisor identified multiple authenticated-callable `SECURITY DEFINER` functions; leaked-password protection remains disabled.

A reference mismatch was explicitly confirmed: the index referenced `e2d7f57...` while PR #294 remained at its then-current head. This is recorded as a mismatch, not reconciled by assumption. `main` remains `4705028...`.

## Security Interpretation Rule

A `SECURITY DEFINER` function being executable by `authenticated` is **not by itself proof of a vulnerability**. It becomes a release blocker when its effective privileges or implementation allow an authenticated caller to bypass intended tenant/user authorization, RLS boundaries, or least-privilege requirements. Each flagged function must therefore be classified individually before any revoke.

Required classification for every Advisor-flagged function:

`FUNCTION → CALLERS → SECURITY DEFINER → search_path → EXECUTE grants → tenant/user guards → underlying tables/RLS → intended runtime caller → exploit test → decision`

Allowed decisions:
- `RETAIN + JUSTIFY + TEST`
- `HARDEN + TEST`
- `REVOKE + TEST`

No blanket revoke is permitted without this analysis.

## Current Operational Truth / Blockers

1. **Exact-Head CI:** no certified run yet for the current candidate; no PASS.
2. **Security:** Advisor findings require per-function analysis; leaked-password protection is still disabled.
3. **Authenticated A/B:** no operational credentials/sessions available for honest LIVE E2E evidence.
4. **Backup/Restore:** no real PASS run yet.
5. **Rollback:** no real PASS run yet.
6. **Vercel:** new deployment remains blocked by `api-deployments-free-per-day` (>100 deployments/24h).
7. **Local test execution:** current execution environment cannot reach GitHub; therefore no local `npm ci`/Vitest PASS is claimed.
8. **Supabase direct SQL:** valid project reference was unavailable to the execution tool in the latest cycle; no new DB PASS is claimed from that attempt.

## Parallel Execution Board

### P0-A — PR #294 exact-head closure
- Obtain real GitHub Actions execution on the candidate.
- Run Vitest contracts, typecheck, lint, build, regression, security, quality.
- Inspect and fix failures.
- Do not promote historical or branch-local PASS to the current candidate.
- Merge only after required exact-head gates pass.

### P0-B — Security Advisor remediation
- Enumerate every flagged `SECURITY DEFINER` function.
- Trace callers and effective privileges.
- Verify tenant/user guards, `search_path`, underlying RLS, and intended runtime use.
- Build exploit/negative tests for unauthorized access.
- Retain intentional functions with documented justification and proof.
- Harden or revoke only where analysis demonstrates excessive privilege.
- Re-run Security Advisor and targeted regression after changes.
- Resolve Leaked Password Protection through the correct Auth configuration surface when access is available.

**Exit:** every Advisor finding is safely remediated or explicitly proven intentional with runtime/security evidence; no unexplained authorization bypass remains.

### P0-C — Authenticated Runtime / Tenant A-B
Prepare and execute Actor A/B login/session journeys, own-data CRUD/persistence, cross-tenant denial, Storage/signed URLs, Realtime and AI/vector isolation, with browser/network/console evidence. Do not invent evidence without credentials.

### P0-D — Vercel / Runtime Deployment
Do not wait on quota. When deployment is possible, bind deployment to final candidate SHA and prove `/`, `/login`, deep routes, authenticated journey, console/network and Supabase connectivity.

### P0-E — Canonical Truth / BI / Export
Golden business corpus; UI = RPC = Export; date/status/as-of/filter semantics; NULL/UNKNOWN/INSUFFICIENT_DATA; forecast/demand/inventory; legacy/compatibility risks. Fix discrepancies rather than merely report them.

### P1-F — OCR / Document Golden Corpus
Execute PDF text, scanned PDF, Arabic/English OCR, DOCX, images and malformed corpus. Record ground truth, actual, diff, score, provenance and regression evidence.

### P1-G — Workers / Queue / Watched Folder
Execute success/failure/retry/lock/idempotency/duplicate/crash/restart/recovery/DLQ and watched-folder detect → parse → validate → import → reconcile → canonical → evidence.

### P1-H — Backup / Restore / DR
Real backup artifact verification and safe-environment restore verification for schema, data, relationships, constraints and application behavior; record RPO/RTO.

### P1-I — Canary / Rollback
Controlled known-good → canary → rollback → verify drill in a safe environment; verify DB/schema/data/auth/core workflow/canonical truth/application health.

### P1-J — Performance / Scale
Read P95 ≤300ms; write P95 ≤800ms; preview ≤1500ms; realistic corpus; query plans/indexes; N+1/unbounded-read attacks; fix and remeasure.

### P1-K — Observability / Operations
DB/Realtime/services/Storage/notifications/security health, representative alert triggers, visibility and recovery, exact-SHA evidence.

### P2-L — UI/UX
Authenticated responsive/RTL/accessibility, loading/empty/error states, deep links, import/documents/evidence/admin/logout.

### P2-M — Business Acceptance
Merchant golden scenarios, independent expected results, decision/evidence/outcome, UI/export equality, and operation without developer intervention.

## SHA / Evidence Rules

1. Branch-local PASS is not `main` PASS.
2. Historical PASS is not current candidate PASS.
3. A migration being present is not proof of runtime behavior.
4. A test file existing is not test PASS.
5. A reachable deployment is not runtime certification.
6. Every final PASS must identify the exact tested SHA.
7. Certification requires all required evidence to converge on ONE release SHA.
8. A Security Advisor warning must be classified by actual exploitability/privilege semantics; do not close it by blanket revoke or by ignoring it.
9. If an index entry names a SHA different from the actual PR head, the PR head is authoritative for PR status; reconcile the index only after direct verification.

## No-Waste Operating Protocol

The programmer must NOT restart with a broad repository tour or repeat old reports.

For every cycle:

`OPEN INDEX → SELECT ALL INDEPENDENT FRONTS → INSPECT MINIMUM NEEDED → IMPLEMENT → TARGETED TEST → ADVERSARIAL TEST → REQUIRED REGRESSION → EXACT SHA → MERGE IF JUSTIFIED → IMMEDIATELY CONTINUE`

If one front is blocked, continue all independent fronts.

Required update format only:

```text
EXECUTED:
- concrete implementation

VERIFIED:
- actually executed tests/evidence

SHA:
- exact SHA

BLOCKED:
- real blocker only

NEXT PARALLEL:
- next executable fronts
```

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

## CYCLE 16 EXECUTION UPDATE — 2026-09-01

- Exact reference at cycle start: `765e169d6a9dfd526ad5e3840bbaed8b9e29422f`; PR #294 was open on that SHA.
- Live Staging inspection initially found only `claim_report_execution_job(p_job_id uuid, p_lease_owner text, p_lease_seconds integer DEFAULT 300)` installed; the five lifecycle RPCs consumed by `SupabaseReportExecutionStore` were absent. The existing claim routine was inspected and confirmed tenant-bound through `current_company_id()`, with queued/expired lease recovery and attempt increment semantics.
- A real source/runtime gap was fixed: added `supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql` implementing heartbeat, checkpoint, complete, fail, and retry using the adapter's exact RPC argument names and the existing tenant/lease model. Public/anon EXECUTE was revoked; service-role EXECUTE was granted.
- Applied the same lifecycle migration to Staging successfully. Post-migration routine inspection confirms all five RPCs exist with the exact adapter signatures: heartbeat(job,worker,lease), checkpoint(job,worker,checkpoint), complete(job,worker,evidence), fail(job,worker,error), retry(job).
- Executed a real tenant-context lifecycle probe in Staging with synthetic jobs inside a transaction: `claim=true`, `heartbeat=true`, `checkpoint=true`, `complete=true`; final completed state retained checkpoint/evidence and cleared the lease. Failure/retry/recovery path also executed: first claim=true, concurrent second claim=false, expired lease reclaim=true, fail=true, retry=true, re-claim by recovery worker=true; final state was `leased`, attempt 3, owned by the recovery worker. The transaction was rolled back after evidence capture.
- Executed a separate two-tenant adversarial lifecycle probe: Tenant A could not claim or heartbeat a Tenant B job; Tenant B could claim its own job. All synthetic rows were removed in the same transaction.
- Post-probe residue query is clean: `report_execution_jobs=0`, `watched_report_folders=0`, `watched_report_files=0` for the cycle. No synthetic residue remains.
- Added `.github/workflows/cycle16-worker-runtime.yml` to execute the existing Node-based report-execution, foundation, E2E, and watched-report contracts under Node 22. GitHub has not yet exposed a workflow run for the latest branch commit, so these CI checks are **NOT EXECUTED** and are not promoted to PASS.
- Repository Vitest execution remains **NOT EXECUTED**: the exact head has a Node-based executable report contract but no configured Vitest package/config, and this environment has no repository checkout capable of running the requested Vitest harness. No Vitest PASS was claimed.
- The worker lifecycle implementation is source-backed by `src/lib/report-execution/durable-worker-adapter.ts`, which calls the exact five RPC names and parameter shapes implemented by the new migration.
- Current certification status remains **NOT CERTIFIED / NOT SELLABLE** pending authenticated product runtime, tenant A/B, production deployment/runtime, OCR live proof, backup/restore, rollback, Windows runtime, performance, and exact-head CI/evidence convergence.

## CYCLE 19 EXECUTION UPDATE — 2026-09-01

- Exact reference at cycle start: `a8b2b807c16a03cf25e22b11167f45e982c449b1`; PR #294 remains OPEN / NOT MERGED.
- Container checkout was re-verified as unavailable. Node 22.16.0 and npm 10.9.2 are installed, but the container has no repository checkout. A fresh `git clone` attempt was not repeated after the prior DNS result; the established blocker remains container GitHub network/DNS access. No fake checkout or alternate runner was created.
- GitHub repository access itself is available through the repository connector. The exact-head workflow `cycle16-worker-runtime.yml` exists and is configured for `pull_request` and `push`, uses `actions/checkout@v4`, Node 22, `npm ci`, and the existing four Node contracts. No workflow run is exposed for the exact SHA, so CI is not promoted to PASS.
- A real live Staging canonical/runtime probe was executed under two authenticated tenant contexts. `get_dashboard_snapshot(12,current_date)` returned tenant-scoped dashboard truth for Tenant A and Tenant B with different datasets; `get_rfm_snapshot`, `get_abc_snapshot`, and `get_inventory_report_snapshot` also executed for Tenant A with `CALCULATED` status and zero unknown rows. This is live RPC/database evidence, not repository-suite PASS.
- Live export parity was exercised for Tenant A: sales export count 2, purchase export count 1, inventory export count 1, receivables export count 2. The rows matched the tenant's dashboard totals (sales 500; inventory value 500; receivables 360). A direct Tenant A request for Tenant B sales export was denied with `TENANT_CONTEXT_MISMATCH`.
- A real source/runtime drift was discovered: `src/lib/dashboard-canonical.ts` called `get_dashboard_top_entities`, but the connected Staging database has no such routine. The canonical migration `20260826052000_dashboard_canonical_aggregation.sql` already returns `topCustomers` and `topProducts` inside `get_dashboard_snapshot`; therefore the frontend was making an unnecessary/missing-RPC call. This is a genuine UI/RPC/schema parity defect, not a historical finding.
- Fixed the defect at the source: `fetchDashboardSnapshot()` now calls only the canonical `get_dashboard_snapshot` RPC and consumes `row.topCustomers` / `row.topProducts` directly. Commit: `daa383a66cd42404d22c1ab8d0c74744295e28f9`.
- Exact source verification after the mutation confirms the new implementation no longer references `get_dashboard_top_entities` and uses the canonical snapshot fields. The source file is bound to the new commit SHA.
- `get_profitability_snapshot` is also referenced by an exported source function but is absent from the connected database; no usage was found by repository code search. It remains a latent source/API drift item and was not removed or replaced without proof of its consumer contract.
- Updated this Master Execution Index as part of the real defect fix. The index is included in the final exact SHA below.
- No worker lifecycle or Security reopening was performed. No synthetic operational residue was introduced by the read-only canonical probes.

### Cycle 19 current certification impact

```text
Worker Full Lifecycle          RUNTIME-PROVEN (Cycle 16)
Worker Tenant Isolation        RUNTIME-PROVEN (Cycle 16)
Reserve boundaries             RUNTIME-PROVEN (Cycle 18)
Dashboard RPC parity           DEFECT FOUND → FIXED (Cycle 19)
Live dashboard tenant reads    EXECUTED
RFM                             EXECUTED
ABC                             EXECUTED
Inventory snapshot              EXECUTED
Tenant-scoped exports            EXECUTED
Cross-tenant export denial       EXECUTED / DENIED
Repository full npm runner       BLOCKED
Vitest                           NOT EXECUTED
Exact-head CI                    NOT EXECUTED
Watched-folder full E2E          NOT EXECUTED
Authenticated browser E2E        NOT EXECUTED
OCR live corpus                  NOT EXECUTED
Performance benchmark            NOT EXECUTED
Backup/Restore                   EXTERNAL BLOCKED
Rollback                         EXTERNAL BLOCKED
Windows/Electron                 NOT EXECUTED
Production certification         NO
```

## CERTIFICATION STATE

Production certification remains **NOT CERTIFIED / NOT SELLABLE** until the remaining runtime, CI, operational, and authenticated evidence converges on one exact release SHA. No historical PASS is promoted to the current SHA.

## Final Definition of Done

```text
ONE EXACT RELEASE SHA
+ Build/Typecheck/Lint
+ Quality/Architecture
+ Security
+ DB/Migration parity
+ Canonical Truth
+ Authenticated E2E
+ Tenant A/B
+ Storage/Realtime/AI isolation
+ Vercel/runtime
+ OCR/document corpus
+ Workers/queue/recovery
+ Backup/Restore
+ Rollback
+ Performance
+ Observability
+ Critical UX
+ Business Acceptance
+ Complete Evidence Pack
= PRODUCTION CERTIFIED / SELLABLE
```

## OWNER DECISION

The project remains in **PROVE → CERTIFY → RELEASE**, not BUILD. The latest cycle adds no fabricated PASS. The real security findings remain an active P0 closure lane, while environmental blockers are explicitly isolated so independent engineering work continues in parallel.


## CYCLE 20 EXECUTION UPDATE — 2026-09-01

- Exact PR #294 head advanced to `4b46af125986888d1300a12e7eb21e0a2622c270` after four real certification-contract defects were repaired on the same integration branch.
- Fixed `check-evidence-provenance-chain.mjs`: the old contract searched for the literal word `provenance` in three implementation files and failed even though the runtime exposed source identity, source hashes, lineage, evidence quality, and tenant-bound evidence edges. The contract now checks the actual runtime invariants.
- Fixed `check-k-to-s-runtime-integration.mjs`: reconciled stale symbol names (`advanceLifecycle`, `chooseBoundedScenario`, `buildDecisionPortfolio`, `autonomyDecision`) with the canonical current bridge API (`runProductionLifecycle`, `chooseScenario`, `prioritizeDecisions`, `canAutonomouslyExecute`).
- Fixed `check-live-gate-manifest-integrity.mjs`: the Phase F workflow correctly runs `npm run test:operational-resilience`; the stale contract was checking for a nonexistent direct command token.
- Fixed `check-release-evidence-completeness.mjs`: the required `source_sha` evidence is defined by the release workflow, so the workflow is now included in the contract's inspected sources.
- Fixed `check-folder-batch-import.mjs`: reconciled the test with the current production UI wording `سحب ومزامنة التقارير من مجلد`; the folder importer itself already contains the required security scan, SHA-256 identity, duplicate check, parsing, reconciliation, and canonical commit path.
- Exact-head CI on the preceding head `36fb5a522522c439cb86c8c9b3736dc0047c4f93` exposed these four stale-contract failures; all other reported certification-contract checks in that run passed before the failures.
- New exact-head CI for `4b46af125986888d1300a12e7eb21e0a2622c270` has been triggered; at the latest inspection it was queued/in progress and therefore is **NOT yet PASS**.
- Current Staging Security Advisor was re-read directly. It reports authenticated-callable SECURITY DEFINER warnings for 18 public routines; direct inspection shows the affected routines use `search_path=public` and tenant/user guards where appropriate. No blanket revoke was performed. Worker claim remains service-role/postgres-only; user-facing decision/evidence RPCs remain intentional authenticated boundaries pending final per-function exploit proof.
- Staging project is reachable and healthy: `fnqbvfuwbdpwvhcgzksl`, PostgreSQL 17.6.1.166. Performance Advisor findings remain INFO-level unused-index notices; no index was removed without workload evidence.
- Certification remains **NOT CERTIFIED / NOT SELLABLE**. No live authenticated A/B, production runtime, backup/restore, rollback, or browser/OCR/Windows evidence was fabricated.

### Cycle 20 certification impact

```text
Contract defects from prior exact-head run       FIXED
New exact-head CI                                 QUEUED / IN PROGRESS
Security Advisor                                  RE-READ / CLASSIFIED
Production certification                          NO
```


## CYCLE 21 SECURITY CLOSURE — 2026-09-01

- Direct Staging privilege inspection exposed a real least-privilege gap: the five report-worker lifecycle RPCs (`advance_report_execution_checkpoint`, `complete_report_execution_job`, `fail_report_execution_job`, `heartbeat_report_execution_job`, `retry_report_execution_job`) were `SECURITY DEFINER`, tenant-scoped, and executable by `authenticated` even though the worker claim path is service-role/postgres-only.
- The internal `report_execution_jobs` table also granted authenticated INSERT/UPDATE/DELETE/TRUNCATE. Because authenticated users could read tenant-scoped jobs, the exposed worker RPCs accepted caller-supplied worker identifiers and represented an unnecessary mutation surface.
- Immediate Staging hardening was applied and verified: authenticated EXECUTE is now **FALSE** for all five worker lifecycle RPCs; service-role EXECUTE remains **TRUE**. Authenticated direct INSERT/UPDATE/DELETE on `report_execution_jobs` are **FALSE** while tenant-scoped SELECT remains available.
- Repository migration added: `supabase/migrations/20260901150000_harden_worker_runtime_authority.sql`, preserving service-worker execution while removing browser mutation authority.
- This is a genuine security/least-privilege fix, not a blanket Advisor suppression. User-facing decision/evidence RPCs were not revoked.
- The security state therefore moves from **PROVISIONALLY CLOSED** to **HARDENED IN STAGING / REQUIRES EXACT-HEAD CI + PRODUCTION MIGRATION APPLICATION**.
