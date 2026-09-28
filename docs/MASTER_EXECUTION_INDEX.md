# CURRENT EXECUTION BOUNDARY — 2026-09-28 / WORK→OUTCOME→EXECUTED COMPLETION LOOP

- FUNCTIONAL CODE/TEST HEAD → `5c52d30295ebd0b018269785ee42ab55d7182e4e`.
- MEMORY DESCENDANT → `07a4f79be02e3b5e25a794759dbdee1d81d48977` before this Index write-back.
- CLOSED → Work Center captures actual impact and closes an approved/in-progress Work Item through the canonical completion RPC with Evidence Snapshot required.
- CLOSED → completion atomically writes recommendation outcome persistence and transitions Decision APPROVED → EXECUTED; no client-side truth or duplicate outcome engine.
- CLOSED → Business Replay consumes the persisted snapshots/work/outcomes produced by the existing model.
- PROOF → 8/8 focused assertions PASS and zero missing query imports across Decision/Work/Reports/Executive/Replay.
- LIVE DB RPC PROOF → completion RPC definition directly verified for tenant/user gate, evidence gate, IN_PROGRESS guard, outcome persistence, and decision terminal transition.
- CI EXACT SHA → Final Certification Gate `36473087801` and Execution Enforcement Contract `36473087858` are queued; no terminal PASS/FAIL claim.
- OPEN → browser/device E2E, hosted exact-head acceptance, Vercel free-plan limit, tenant-bound live canary.
- DO NOT REPEAT → no client outcome writes, no completion without evidence, no duplicate completion RPC.
- NEXT EXACT ACTION → consume CI terminal state, then finish the next concrete Outcome → Learning → Benchmark eligibility gap.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / QUERY-LAYER RESTORATION + DECISION/REPLAY CONTRACT CLOSURE

- FUNCTIONAL CODE/TEST HEAD → `980054ad593587971ecb516fb255d89006fae3e5`.
- MEMORY DESCENDANT → `160f96458a2457387bc8dcaa81fe4643c5fc44e1` before this Index write-back.
- CLOSED → query-layer contracts required by Decision, Work, Reports, Executive and Business Replay are now exported and tenant-bound; no missing query imports remain.
- CLOSED → report exports and purchase summary now call existing Supabase RPCs; decision writes route through the canonical vertical-slice runtime; reads come from canonical decision/approval/work/outcome tables; Business Replay reads persisted snapshots/work/outcomes.
- CLOSED → nullable expected impact + structured evidence refs are accepted by the canonical runtime types; no duplicate runner/runtime was created.
- PROOF → 14/14 focused assertions PASS; import/export parser reports zero missing query symbols in the five affected pages.
- DB CONTRACT → required decision/work/outcome RPCs and table schemas verified directly in Supabase.
- CI EXACT SHA → Final Certification Gate `36472897283` and Execution Enforcement Contract `36472896991` are queued; no terminal PASS/FAIL claim.
- OPEN → browser/device E2E on PC01, hosted exact-head acceptance, Vercel free-plan build-rate limit; tenant-bound canary remains unavailable from current SQL session without company context.
- DO NOT REPEAT → no page-specific decision runtime, no duplicate query contracts, no fabricated replay events, no stale query import assumptions.
- NEXT EXACT ACTION → after CI terminal state, finish the next non-device Outcome → Learning → Benchmark eligibility gap or repair the first concrete failing gate.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / DECISION + WORK IMPORT SCOPING FAIL-CLOSED

- FUNCTIONAL CODE/TEST HEAD → `4e6262d0309667e6d98820ce7884eb71c8de3eec`.
- MEMORY DESCENDANT → `9b0a1acbf4dc55558730339b4516253c62890de2` before this Index write-back.
- CLOSED → Decision Experience no longer presents tenant-wide alerts as source-specific evidence in `?import=` mode; no Evidence Snapshot means decision progression remains blocked.
- CLOSED → Work Center `?import=` scope filters Decision Work Items by exact `evidence_refs.import_job_id` match and preserves import context on decision/Evidence navigation.
- PRESERVED → existing decision/work contracts and canonical database models; no duplicate endpoint/service.
- PROOF → 16 targeted source assertions PASS on `4e6262d...`; query main-prefix proof remains PASS.
- CI EXACT SHA → Final Certification Gate `36472305103` and Execution Enforcement Contract `36472305117` are queued; no terminal PASS/FAIL claim.
- OPEN → hosted exact-head runtime acceptance, Vercel rate limit, PC01 browser/device proof.
- DO NOT REPEAT → no source attribution for generic alerts; no cross-import work-item display; no parallel scoping layer.
- NEXT EXACT ACTION → scan Outcome/Learning persistence and Benchmark eligibility for the first concrete non-device gap and execute it.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / REPORT→DECISION PROVENANCE CONTINUITY

- FUNCTIONAL CODE/TEST CANDIDATE → `0bf73fd97c907029b7dec7db4c1897041e22b031`.
- DOCUMENTATION DESCENDANT AFTER MEMORY WRITE-BACK → `f944869837f220828119ec180ace2af50ad9e8b2` before this Index write-back.
- CLOSED → Executive Report preserves `import` on rendered-output routes, NEXT ACTION, source alerts and evidence actions through a canonical local query-preservation helper.
- PRESERVED → Decision and Work already accept import context; Replay and Benchmark remain explicitly company-level surfaces and were not falsely relabeled as source-bound.
- CLOSED → source-bound report context is shared across domain reports, Analytics and Inventory Intelligence.
- QUERY RECOVERY → `src/lib/queries.ts` is exact-main-prefix plus branch-specific Task Ledger/Evidence additions; no main export is missing.
- SOURCE PROOF → 28 focused assertions PASS on `0bf73fd...`.
- CI EXACT SHA → Execution Enforcement Contract `36472061987` and Final Certification Gate `36472061942` are queued; no terminal PASS/FAIL claim.
- OPEN → hosted exact-head runtime acceptance, Vercel free-plan rate limit, PC01 browser/device proof.
- DO NOT REPEAT → no partial-range whole-file query edits; no Replay/Benchmark source-bound claim without a supporting contract; no dropped import context on downstream actions.
- NEXT EXACT ACTION → consume terminal exact-head gates, then execute the next concrete non-device gap after Report → Decision → Work → Outcome/Benchmark eligibility.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / SOURCE-BOUND REPORT SURFACES + QUERY-LAYER RECOVERY + NAVIGATION PROVENANCE

- FUNCTIONAL CODE/TEST CANDIDATE → `3c6a54e33fbb1183b82e9770db9bbb2b4063629e`.
- DOCUMENTATION HEAD AFTER MEMORY WRITE-BACK → `1ca99e755f5095462317e4d74faaf72e95e303b3` before this Index write-back.
- CLOSED → rendered-report outputs preserve import provenance across all generated report routes; Sales/Purchases/Inventory/Receivables/Profitability, Analytics and Inventory Intelligence display the shared source-bound context when opened with `?import=`.
- CLOSED → Reports Center preserves `import` when opening/closing Builder and when traversing report cards, decision-output chain and report actions.
- ROOT REPAIR → `src/lib/queries.ts` was recovered from exact `main` and extended only with the durable Task Ledger, rendered-manifest validator, Evidence Snapshot and source-bound recommendation reads required by this branch.
- PROOF → current queries file starts with exact main content; all main exports remain present. 37 targeted source assertions PASS on the functional HEAD.
- CI EXACT SHA → Final Certification Gate `36471921296` and Execution Enforcement Contract `36471921049` are queued on `3c6a54...`; no terminal PASS/FAIL claimed.
- OPEN → hosted exact-head/runtime acceptance and PC01 browser/device proof; Vercel free-plan build-rate remains external.
- DO NOT REPEAT → no partial-range whole-file writes; no dropping import context; no duplicate source-provenance implementation.
- NEXT EXACT ACTION → consume terminal exact-head gates; then inspect the next concrete non-device gap after Report → Decision → Work → Outcome/Benchmark.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / SOURCE-BOUND RENDERED REPORT HARDENING + REPORTS PAGE RESTORE

- CURRENT CODE/TEST CANDIDATE → `b865bda42f89553e75bd03f6ba0e61cd3dddc1ec`.
- CURRENT GOVERNANCE HEAD AFTER MEMORY WRITE-BACK → `a65922eae9cce80532be0ae3897f6583b73f6cf4`; this Index write-back will create the next documentation descendant.
- ROOT FIX → rendered report manifests are now accepted only when Job evidence matches the Import ID + exact source SHA and every rendered output repeats the same binding.
- CLOSED → one canonical `getBoundRenderedReportManifest()` contract now gates Canonical Import, Reports Center, and Executive Report output display; no duplicate provenance helper/path.
- REPAIR → an intermediate Reports Center whole-file update had truncated the page; the full implementation was restored from pre-truncation commit `5b7f5e5a6a78b7d4d781b2701014bf2cdbfd9246` and re-applied with source-binding validation. Current file is 49,789 characters and retains Reports Center + Sales/Purchases/Inventory/Receivables/Profitability implementations.
- UI CLOSED → Canonical Import fails closed on missing/unbound rendered evidence; Reports Center and Executive Report show only source-bound rendered outputs and retain canonical company KPI scope.
- STATIC PROOF → 37 exact-source assertions PASS on code/test candidate `b865bda...`.
- CI EXACT SHA → Final Certification Gate `36470795514` and Execution Enforcement Contract `36470795615` are queued on the exact code SHA; no terminal PASS/FAIL is claimed.
- OPEN EXTERNAL/DEVICE → hosted exact-head build/runtime acceptance, Vercel free-plan build-rate limit, and offline PC01 browser proof.
- DO NOT REPEAT → do not whole-file update from a truncated read; do not treat rendered routes as proof without exact binding; do not create parallel reporting/provenance paths.
- NEXT EXACT ACTION → consume the first terminal exact-head gate; repair only reproducible non-external failures, then rescan the next safe non-device front.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / RENDERED REPORT OUTPUT CLOSURE + REPORT-CENTER HANDOFF

- CURRENT EXECUTION HEAD → `26b92ab6304996630f7616269db63de0b53c4ad5` after mandatory Session Memory write-back; product/code checkpoint remains `a8785ff73d71c9eb7f57c6095c0eeb67284c7f8e`.
- MAIN CONTROL HEAD VERIFIED BEFORE WORK → `1b0d25a7834c779198f9ad19039c87e1262c4cd3`; current-main `SYSTEM_HEART.md` synchronized into the branch at `266419d28439f0c85a7434b7cd07a6f979c3bc13`.
- ROOT GAP FOUND/REPAIRED → stage `rendered` now produces a persisted source-bound report-output manifest inside existing Job evidence instead of only advancing a checkpoint.
- CLOSED IMPLEMENTATION → durable runner captures stage evidence; rendered manifest is bound to sourceHash/importId/entityType/sourceSpecialty and routes only to existing report surfaces; server binds detected specialty; query layer provides tenant-bound Job readback.
- CLOSED UI → Canonical Import waits for completed Job + rendered outputs before declaring rendered success and displays persisted report outputs; Reports Center with `?import=` now exposes source → evidence → rendered-output handoff while keeping metrics on canonical truth.
- STATIC PROOF → 22 exact-source assertions passed across runner, adapter, server specialty binding, query readback, Canonical Import, Reports Center and guard coverage.
- LIVE DB PROOF → staging contains `report_execution_jobs` + 9-stage `report_execution_tasks`; Job RLS is tenant-bound; authenticated SELECT and service-role full Job privileges were verified.
- NO FALSE RUNTIME CERTIFICATION → no real fixture import executed end-to-end in this batch; current exact-head GitHub Actions query returned no workflow runs; Vercel reports build-rate-limit failure; PC01 is offline.
- OPEN EXTERNAL/DEVICE → hosted exact-head build/runtime acceptance; browser/device proof on PC01.
- DO NOT REPEAT → no second report engine/table/runner, no static-link-only completion, no stale PASS across SHA.
- NEXT EXACT ACTION → rescan report provenance for mismatched Job/source/snapshot bindings; repair the first concrete non-device gap, then re-test and persist.

---

# RESUME TOKEN — 2026-09-28 / POST-IMPORT REPORT UX + FIXTURE DISCOVERY REANCHORED

- LATEST FUNCTIONAL CHECKPOINT SHA (before this documentation write-back) → `2b60a72021d969550055e6682e7f36ab4a43d60e`.
- ACTUAL UI DELIVERY → `ImportPage.tsx` now explicitly exposes the post-import report stage; `CanonicalImportPage.tsx` maps the detected specialty/entity to governed report outputs.
- REPORT OUTPUT MAPPING → sales → Sales Report; purchases → Purchases Report; inventory → Inventory + Inventory Intelligence; customers/suppliers/products/payments → specialized Analytics; other → Executive Report.
- EXECUTION PROOF → final import result exposes the persisted nine durable task statuses, completion count, worker/attempt metadata and completed timestamps.
- EXECUTION WORDING → UI explicitly states that the nine tasks are created and advanced sequentially by a leased worker; no parallel multi-worker processing is claimed.
- CONTRACT → `scripts/check-import-transaction-contract.mjs` guards report mapping, report-output rendering, final execution proof, nine-stage wording, non-parallel wording, and visible post-import report stage.
- FIXTURE DISCOVERY → canonical fixture path is `tests/fixtures/realistic-reports/`; `docs/SYSTEM_HEART.md` now requires startup inspection of fixture directories and defines the post-import acceptance chain.
- STATIC SOURCE PROOF → 11/11 targeted source assertions PASS on the functional checkpoint: fixture README, fixture doctrine, import report-stage disclosure, specialty map/resolver, report-output UI, final execution proof, nine-stage semantics, and contract guards.
- CI → no workflow run registered yet for checkpoint `2b60a720...`; no runtime/CI PASS is claimed.
- DEVICE → PC01 remains offline; browser/device proof remains isolated.
- EXTERNAL → Vercel free-plan deployment rate limit remains external.
- NEXT EXACT ACTION → once files exist in the fixture directory, execute the canonical import acceptance flow against the real fixtures and verify the resulting report outputs/evidence; continue independent non-device UI/core fronts without waiting for device or CI.
- WRITEBACK NOTE → the commits that update this Memory/Index are documentation descendants of `2b60a720...`; do not mistake the checkpoint SHA for the final branch HEAD after this write-back.

# RESUME TOKEN — 2026-09-28 / FIXTURE INTAKE + POST-IMPORT REPORT OUTPUTS CLOSED

- CURRENT BRANCH EXACT HEAD → `55a3ff5b12774678bbc68ee612610a28a273790f`.
- FIXTURE INPUT CONTRACT → `tests/fixtures/realistic-reports/` is now the canonical reusable fixture intake location; the branch contains its README and `docs/SYSTEM_HEART.md` now requires every startup to inspect fixture directories on the exact HEAD.
- POST-IMPORT UI → `src/pages/CanonicalImportPage.tsx` now maps the detected specialty/entity to the applicable report output surface after canonical completion:
  - sales → Sales Report
  - purchases → Purchases Report
  - inventory → Inventory Report + Inventory Intelligence
  - customers/suppliers/products/payments → specialized Analytics
  - other → Executive Report
- EXECUTION PROOF UI → final result now renders the persisted nine durable task statuses with completion count, attempt, worker and completed-at metadata.
- EXECUTION SEMANTICS → UI wording now states the real contract: nine tasks are created and advanced sequentially by the leased worker; no parallel multi-worker claim is made.
- SOURCE CONTRACT → `scripts/check-import-transaction-contract.mjs` now guards specialty-to-report mapping, post-import report output rendering, final execution proof, and accurate nine-stage execution wording.
- SOURCE STATIC PROOF → current branch source assertions for specialty mapping, report-output surface, final execution proof, nine-task wording, non-parallel wording, fixture README presence, and System Heart fixture doctrine all PASS.
- CI → no workflow run is registered yet for exact head `55a3ff5b12774678bbc68ee612610a28a273790f`; therefore no CI/runtime PASS is claimed.
- DEVICE → PC01 remains offline; browser/device certification remains isolated.
- EXTERNAL → Vercel free-plan deployment rate limit remains external; no production mutation performed.
- DO NOT REPEAT → do not reopen the closed canonical import/report/decision/replay/benchmark contracts without a current-SHA regression.
- NEXT EXACT ACTION → when fixture files are present, run the canonical import acceptance flow against them and verify the real report outputs/evidence; independently continue the next concrete non-device UI/core front without waiting for device/CI.
- PROOF COMMITS → UI `724a72fcce130f2e0baea3df50958ebed7328b6e`; import contract `4f47bd58ee380829e2c82abbc788421a074c57f6`; control doctrine `55a3ff5b12774678bbc68ee612610a28a273790f`.

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / EXACT-HEAD CI OBSERVATION FOR FUNCTIONAL CANDIDATE 3b419ba

- FUNCTIONAL CANDIDATE → `3b419ba0b772a2556d6d37b157eda29928d95150`.
- CI → 7 terminal records were cancelled/skipped; 46 remained pending/queued in the fetched page. No exact-head code PASS/FAIL established.
- CURRENT HEAD → `2d23d91a741383c7d0ff1ce68583e32361eef5c6`; only governance docs followed the functional candidate.
- NEXT → consume terminal evidence without transferring historical PASS; continue concrete non-device gaps only.



- FUNCTIONAL/UI CANDIDATE → `3b419ba0b772a2556d6d37b157eda29928d95150`.
- CLOSED → truth context/freshness across the major dashboard, intelligence, evidence, decision, work, outcome, benchmark, analytics, report, master-data and governance surfaces.
- CLOSED SAFETY → invalid timestamp handling, source As Of propagation, evidence-status normalization, financial scenario BLOCKED state.
- CONTRACT → UI route completeness now protects the expanded surface set.
- CI → exact-head terminal code PASS still unavailable; 51 workflows remain pending/queued, CodeRabbit status is success, Vercel rate-limit remains external.
- DEVICE → PC01 offline.
- NEXT → continue only on remaining concrete non-device completeness gaps; then consume exact-head terminal gates without transferring old evidence.



- FUNCTIONAL/UI CANDIDATE → `e26536df4a224b9d68a1aae749a6dce8032b5619`.
- CLOSED → shared truth context + freshness across Intelligence, Forecasts, Recommendations, Scenarios, Command Center, Liquidity, Data Quality, RFM, ABC and Aging.
- SAFETY → invalid timestamp handling fixed; financial scenario As Of comes from profitability snapshot; blocked scenarios stay BLOCKED.
- CONTRACT → UI completeness guards all newly standardized surfaces and shared freshness.
- SOURCE PROOF → 15/15 static assertions pass.
- CI/EXTERNAL → no terminal exact-head code PASS yet; Vercel rate-limit remains external; PC01 offline.
- NEXT → broad canonical-surface scan for any remaining data-bearing page outside the shared truth-context contract.



- FUNCTIONAL/UI CANDIDATE → `1ddc45ca95d166345b78f60f4961f23fa92f8eeb`.
- CLOSED → Business Replay truth context + persisted-outcome gate; Benchmark truth context + peer-sample gate.
- CONTRACT → route completeness guards both surfaces and full truth vocabulary.
- SOURCE PROOF → static assertions pass.
- EXTERNAL/DEVICE → Vercel rate-limit and PC01 offline remain isolated; public preview auth boundary prevents authenticated browser certification.
- NEXT → exact-head terminal gates when available; otherwise next safe non-device surface.



- FUNCTIONAL/UI CANDIDATE → `5cfbc39b3e1f4ab93a5d2783243ed2e8a91daf48`.
- CLOSED → Work Center shared truth context, explicit operational truth state, and lease-health binding.
- CONTRACT → UI route completeness guards the Work Center truth surface.
- SOURCE PROOF → static checks pass.
- EXTERNAL/DEVICE → Vercel rate-limit failure and PC01 offline remain isolated.
- NEXT → next safe non-device canonical surface.



- FUNCTIONAL/UI CANDIDATE → `6da5e5501aa0bd78b7d1be36f269cdf2ee92c502`.
- REPAIRED → Trust & Evidence internal status (`OK/EMPTY`) now maps explicitly to canonical `VERIFIED/INSUFFICIENT DATA` and other truth states.
- CONTRACT → UI route completeness guards the mapping and the existing Decision evidence gate.
- SOURCE PROOF → static checks pass.
- EXTERNAL → Vercel free-plan rate-limit and PC01 offline remain isolated.
- NEXT → next safe non-device surface.



- FUNCTIONAL/UI CANDIDATE → `14dc825e371d26888a7ca8475db23dce6cbada47`.
- CLOSED → full canonical truth vocabulary in shared context; Trust & Evidence and Decision Experience now carry explicit truth state.
- CLOSED → Decision Experience preserves source-evidence gating before durable decision creation.
- CONTRACT → UI route completeness guards both surfaces and existing evidence gate.
- SOURCE PROOF → static checks all pass.
- CI/EXTERNAL → Vercel free-plan rate-limit failure remains external; PC01 offline; unauthenticated Cloudflare preview stops at login, so no protected-surface browser PASS is claimed.
- NEXT → exact-head terminal gates when available, else next safe non-device surface.



- FUNCTIONAL/UI CANDIDATE → `9ed30537a98cc55c52bbddc33bb12d8f0494539d`.
- CLOSED → Executive Report company/period/currency/As Of/truth context via shared ReportSurfaceContext.
- CLOSED CONTRACT → report-output context threshold raised to six surfaces; Executive Report shared-context requirement is explicit.
- PRESERVED → source-bound import provenance and company-level KPI semantics remain fail-closed and separated.
- CURRENT CI → Vercel rate-limit failure / pending deployment; no terminal code PASS claimed.
- DEVICE → PC01 offline.
- NEXT → next non-device intelligence/report surface, after exact-head gate consumption where available.



- FUNCTIONAL/UI CANDIDATE → `be36ca1557748c00d426f8f6b3b7a3e6f11029cc`.
- CLOSED → report truth context, domain report metadata, centralized advanced-report context resolution, print/export actions, and inventory As Of preservation.
- CONTRACT → UI route completeness guards the shared context and advanced report action invariants.
- SOURCE PROOF → static assertions and export type-contract inspection pass.
- CI/EXTERNAL → Vercel free-plan build-rate-limit failure/pending deployment remain external; no terminal PASS transferred.
- DEVICE → PC01 offline.
- NEXT → consume exact-head gates or continue the next non-device product surface; report/import fronts remain closed unless a fresh regression proves otherwise.



- FUNCTIONAL/UI CANDIDATE → `be36ca1557748c00d426f8f6b3b7a3e6f11029cc`.
- CLOSED → shared report context across Reports Center and domain reports; company/period/currency/As Of/truth state are exposed consistently.
- CLOSED → Inventory Intelligence and Demand Velocity now use the centralized context resolver and provide print/export actions.
- CLOSED CONTRACT → route completeness protects the report context, fail-closed states, and print/export actions.
- SOURCE PROOF → static assertions pass for the front; exact-head CI is not yet terminal-certification evidence.
- EXTERNAL STATUS → Vercel free-plan build-rate limit remains a failure/pending deployment constraint; PC01 browser proof remains offline/device-bound.
- NEXT → exact-head terminal gates, then next safe non-device front.



- FUNCTIONAL/UI CANDIDATE → `573304a90dcf7d5672bb04ded788e2b0c90bd549`.
- CLOSED → shared report truth context for company, period, currency, As Of, truth state, source description and Trust & Evidence link; applied to Inventory Intelligence and Demand Velocity.
- CLOSED CONTRACT → route-completeness guard now protects the shared context plus tenant/currency/fail-closed requirements on both report surfaces.
- EXACT DIFF → 5 commits / 4 files after prior boundary `91b0d65...`; no backend architecture duplication.
- CURRENT CERTIFICATION STATE → no terminal exact-head PASS claimed for `573304a...`; source/diff proof only.
- DEVICE/EXTERNAL → PC01 remains offline; hosted Phase-F/deployment blockers remain separate.
- NEXT → consume exact-head gates if available; otherwise execute the next canonical report surface without reopening closed import/report fronts.



- FUNCTIONAL/UI CANDIDATE → `994bbc4517e9ec350f787f01841b637b2202354c`.
- CLOSED UI FRONT → Reports Center now presents canonical Executive + domain/intelligence outputs and a direct Evidence → Signals → Decision → Work → Outcome/Learning → Benchmark chain.
- CLOSED BUILDER FRONT → Truth/Evidence is a first-class report section, included by default, exportable/printable with As Of and state.
- CLOSED EXECUTIVE REPORT FRONT → import context, evidence snapshot, source-bound recommendations, decision-output chain and fail-closed unbound-signal wording are source-verified.
- CONTRACT → `scripts/check-ui-route-completeness.mjs` protects these report-output invariants.
- CURRENT CI → workflows for exact head `994bbc4...` are current/queued; no PASS is claimed until terminal evidence.
- OPEN NON-DEVICE → consume exact-head reporting/certification gates and repair first reproducible non-external failure.
- DEVICE/EXTERNAL → PC01 offline and hosted Phase-F/deployment constraints remain isolated.
- NEXT EXACT ACTION → terminal current-head gates → first failure repair → persist → rescan → next non-device front.

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / TASK LEDGER CONTRACT HARDENED — FUNCTIONAL CANDIDATE 162881e

- FUNCTIONAL/TEST CANDIDATE → `162881eaa84dcb23ea79d6fbae9777e459880b19`.
- CLOSED CONTRACT → nine-stage task ledger, queued-task completion at worker claim, sequential stage runner through rendered, source-bound report semantics.
- RUNTIME CANARY → Staging transaction created exactly 9 ordered Tasks for a synthetic enqueue; rollback completed and left zero canary jobs/tasks and zero recent task rows.
- NO FALSE CERTIFICATION → transactional stage-transition canary was blocked by tool security before execution; CI exact-head remains authoritative and pending.
- NEXT → consume exact-head report-execution/UI/quality/enforcement/final-cert/browser gates; fix first reproducible non-external failure.

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / POST-UPLOAD TASK SEMANTICS CLARIFIED — FUNCTIONAL CANDIDATE 449697a

- FUNCTIONAL/UI CANDIDATE → `449697a8f63089d66ac4ae2ccbcc52d6211bc1b0`.
- CLOSED UI SEMANTIC GAP → Canonical Import now states the real 9-task decomposition and sequential single-worker execution instead of implying parallel worker distribution.
- CLOSED REPORT FRONT → source-bound Executive Report reads import Job/Snapshot and uses canonical source-bound recommendations; invalid context remains REVIEW / NOT PROVEN.
- CURRENT TEST STATE → fresh exact-head gates for this lineage are pending/queued; no PASS is transferred.
- NEXT → terminal current-head gates, first reproducible non-external failure, then bounded rescan.

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / EXECUTIVE REPORT SOURCE-BOUND DECISIONS — FUNCTIONAL CANDIDATE 70b448e

- FUNCTIONAL / UI-TEST CANDIDATE → `70b448ed3e4d5298d0f6b5ef8c5943cdbe6a451e`.
- CLOSED FRONT → Executive Report import context, tenant-bound evidence lookup, source-bound recommendation lookup, fail-closed provenance state, and import-preserving Decision link.
- EXACT CONTRACT → `scripts/check-ui-route-completeness.mjs` guards the above invariants.
- CURRENT TEST STATE → fresh exact-head workflows have been triggered/queued after this front; no PASS is claimed until terminal results exist for the candidate lineage.
- POST-UPLOAD FLOW → upload → authoritative verification → durable Job → 9 ordered Tasks → single leased worker → canonical commit → evidence snapshot → source-bound signals/recommendations → decision/work/replay/benchmark → Executive Report.
- OPEN → current-head certification/report-execution/quality/browser gates; Phase-F hosted drift and PC01 device proof remain separate external/device fronts.
- NEXT EXACT ACTION → consume terminal current-head gates; repair first reproducible non-external failure; persist/rescan.

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / EXECUTIVE REPORT IMPORT PROVENANCE — FUNCTIONAL CANDIDATE acf52b6

- FUNCTIONAL / UI-TEST CANDIDATE → `acf52b6dcc1c3a09d9e4be77ca5185f9ca773c1a`.
- CLOSED IMPLEMENTATION → Executive Report now consumes `?import=` context through existing tenant-bound `fetchImportRecords` + `fetchImportEvidenceSnapshot`, exposing source/status/evidence/snapshot/quality/shape context without inventing file-only KPIs.
- FAIL-CLOSED → invalid/unproven import context is rendered as `REVIEW / NOT PROVEN`; company-level executive metrics retain their canonical company scope.
- UI CONTRACT → `scripts/check-ui-route-completeness.mjs` now guards the import provenance contract.
- CURRENT CI → exact-head workflows for the functional candidate are queued/in progress; no terminal PASS is yet claimed.
- POST-UPLOAD EXECUTION MODEL → upload → authoritative verification → durable Job → nine persisted ordered Tasks → single leased worker execution → canonical commit → evidence snapshot → source-bound signals/decision/work/replay/benchmark → Executive Report.
- OPEN → current-head CI/certification/report-execution/browser results; hosted Phase-F drift and PC01 remain external/device fronts.
- NEXT EXACT ACTION → consume terminal current-head gates; fix the first reproducible non-external failure; then persist/rescan.

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / POST-UPLOAD WORKER CONTRACT REPAIRS — FUNCTIONAL CANDIDATE c9577a7

- FUNCTIONAL / CODE-TEST CANDIDATE → `c9577a75f95d08b20cf5645e00e56c8490c1c071`.
- FUNCTIONAL BRANCH → `exec/20260927-current-main-import-ui-rebased`.
- THIS BATCH → corrected the security-definer exposure checker classification for worker-only `retry_report_execution_job`; corrected the durable worker checkpoint contract test to match the canonical runner.
- FRESH EXACT-HEAD PROOF → file-intelligence-security `36460664348` SUCCESS; Phase-2 security `36460664287` SUCCESS; decision-DML boundary `36460664241` SUCCESS.
- TERMINAL FAILURE FOUND → Execution Enforcement `36460664556` stopped at certification-boundary integrity because the index still referenced stale candidate `43fcb31567c1ff00973a3f87ccabc554df08858f` while HEAD `c9577a75...` contained non-governance changes.
- GOVERNANCE REPAIR → Session Memory and this Index are re-anchored to `c9577a75...`; the following commits are documentation-only until fresh gates prove otherwise.
- POST-UPLOAD CONTRACT → Upload proceeds through authoritative verification → durable Job → 9 ordered Tasks → lease-fenced execution → canonical commit → evidence snapshot → source-bound signals/decision/work/replay/benchmark → Executive Report.
- DISTRIBUTION SEMANTICS → tasks are durably decomposed and individually observable; current runner executes the 9 stages sequentially under a single leased worker, not as parallel workers.
- OPEN NON-DEVICE → fresh exact-head certification/execution gates; hosted Phase-F deployment drift remains external. Device/browser proof remains PC01-dependent.
- NEXT EXACT ACTION → consume the fresh governance-boundary gates after this index update; repair only the first terminal non-external failure; then rescan UI/core.
- EVIDENCE LAW → no PASS crosses SHA; no upload-only success; no fake reports/recommendations; no stale candidate claim.

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / CERTIFICATION CANDIDATE REANCHORED

- CURRENT CODE/TEST CANDIDATE → `43fcb31567c1ff00973a3f87ccabc554df08858f`.
- CURRENT FUNCTIONAL BRANCH → `exec/20260927-current-main-import-ui-rebased`.
- LAST EXECUTED PRODUCT/UI FIX SHA → `d272feaceefed188c8ef9ad5365d4d3c541ddb96`.
- CLOSED → post-import journey numbering collision; Executive Report is `07 · REPORTS`, Benchmark remains `06 · BENCHMARK`.
- PRESERVED → full canonical execution history in Session Memory and Master Execution Index; no legacy execution content was deleted.
- NEXT → fresh exact-head repository gates, then first reproducible non-external defect and bounded UI/core rescan.
- BLOCKED LOCAL/EXTERNAL → PC01 browser proof, Vercel build-rate limit, hosted Phase-F deployment drift.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / EXACT CURRENT BRANCH AFTER KNOWLEDGE RESTORATION

- CURRENT FUNCTIONAL BRANCH → `exec/20260927-current-main-import-ui-rebased`.
- CURRENT EXACT HEAD BEFORE THIS INDEX COMMIT → `5c44e73e8f8ac5c2a4f33b97265a32c90fb5922c`.
- RESTORED BASE KNOWLEDGE → full canonical index from `9ef416d5e5184daf07f242336ab78c657a97eebd`.
- CLOSED IN THIS BATCH → Executive Report navigation added to canonical post-import result; canonical memory restored; execution index restored without deleting prior knowledge.
- PRODUCT HEART → durable 9-stage post-upload Task Ledger, lease-fenced execution, authoritative enqueue/execute, tenant-authoritative readback, live/final execution reports, canonical evidence, signals/decision/work/replay/benchmark navigation.
- STATIC EXACT-SHA PROOF → current CanonicalImportPage contains the Executive Report route and 7-card post-import journey.
- STAGING PROOF → report_execution_tasks and task RPCs exist; enqueue_report_execution_job materializes all 9 task rows for new jobs.
- CURRENT BLOCKERS → PC01 offline/device browser proof; Vercel build-rate-limit; hosted Phase-F deployment drift.
- CURRENT TEST STATE → documentation-restoration commit has not yet received terminal CI evidence; no stale PASS is carried forward.
- NEXT EXACT ACTION → consume fresh current-head repository gates after this restoration; repair first reproducible non-external defect; bounded rescan UI/core fronts.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / PHASE-2 SECURITY HARDENING CANDIDATE

- CURRENT CODE/TEST CANDIDATE → `4ff2104cc3d6e5d06a1d443ca0ba05d45d24fda4`
- CURRENT REPOSITORY HEAD → `4ff2104cc3d6e5d06a1d443ca0ba05d45d24fda4`
- ACTIVE FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- IMPLEMENTED → durable post-upload 9-stage Task Ledger; lease-fenced execution; authoritative enqueue/execute; tenant-authoritative reads; live/final reports; service-role-only enqueue; append-only aware security-definer checker.
- STAGING PROOF → task ordering/evidence and enqueue privilege closure verified.
- NEXT → exact-head Phase-2 security + certification + quality/browser + Phase-F.
- NO STALE PASS → every current claim must reference `4ff2104cc3d6e5d06a1d443ca0ba05d45d24fda4` or a new current run.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / POST-UPLOAD TENANT AUTHORITY CANDIDATE

- CURRENT CODE/TEST CANDIDATE → `248df251ae243e84a2003adb143a0602765aa27a`
- CURRENT REPOSITORY HEAD → `248df251ae243e84a2003adb143a0602765aa27a`
- ACTIVE FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- IMPLEMENTED → durable 9-stage Task Ledger, lease-fenced task execution, canonical enqueue/execute, tenant-authoritative task readback, live/final execution reports, service-role-only enqueue RPC, tenant-safe canonical Job lookup.
- STAGING PROOF → 9-task creation, ordering guard, ordered execution with worker/attempt/evidence, enqueue privilege closure.
- NEXT → consume exact-head current CI and isolate Phase-F hosted failure if it remains.
- NO STALE PASS → all current claims must use `248df251ae243e84a2003adb143a0602765aa27a` or the current run SHA.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / POST-UPLOAD EXECUTION + SECURITY CANDIDATE

- CURRENT CODE/TEST CANDIDATE → `ccd1694dda934bdf19eb1b3a7079c7d02532bf8d`
- CURRENT REPOSITORY HEAD → `ccd1694dda934bdf19eb1b3a7079c7d02532bf8d`
- ACTIVE FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- CLOSED IMPLEMENTATION → durable 9-stage task ledger; ordered lease-fenced execution; authoritative enqueue/execute; tenant readback; live/final execution reports; enqueue RPC service-role-only; worker readback bound to persisted job tenant.
- STAGING PROOF → task ordering/evidence tests and enqueue RPC privilege closure.
- CURRENT GATES → fresh exact-head Quality, Certification, Browser and Phase-F.
- NEXT → consume current-head results; no more code changes unless a real terminal failure appears.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / POST-UPLOAD SECURITY CLOSED

- CURRENT CODE/TEST CANDIDATE → `0ab7b14324f16ac19a7e5e20ffdc00db7f259047`
- CURRENT REPOSITORY HEAD → `0ab7b14324f16ac19a7e5e20ffdc00db7f259047`
- ACTIVE FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- CLOSED → durable 9-stage task ledger; lease-fenced lifecycle; authoritative enqueue/execute boundary; live/final execution reports; type-safe worker/UI contracts; enqueue RPC service-role-only.
- STAGING PROOF → 9 tasks and ordered task completion proven; enqueue RPC privileges service_role-only.
- LAST CODE FAILURE → certification security-definer surface flagged enqueue RPC; new hardening migration fixes it.
- NEXT → current-head certification and all release/browser/Phase-F gates.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / FINAL POST-UPLOAD EXECUTION FRONT CANDIDATE

- CURRENT CODE/TEST CANDIDATE → `ea7ff0067324bc48f86bc2c601bfeb5eb11a6144`
- CURRENT REPOSITORY HEAD → `ea7ff0067324bc48f86bc2c601bfeb5eb11a6144`
- ACTIVE FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- IMPLEMENTED → durable post-upload 9-stage task ledger; lease-fenced worker lifecycle; canonical enqueue/execute boundary; tenant readback; live execution report; final execution report.
- STAGING PROOF → task ledger created nine tasks and enforced ordered execution with persisted worker/attempt/evidence.
- LAST CODE REPAIR → TypeScript/typecheck fixes and checkpoint naming contract repair committed at `ea7ff0067324bc48f86bc2c601bfeb5eb11a6144`.
- OPEN → fresh exact-head CI and hosted Phase-F/deployment blockers only.
- NEXT → consume current exact-head gates; no further candidate changes unless a real terminal code failure appears.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / POST-UPLOAD EXECUTION LEDGER + TYPE SAFETY

- CURRENT CODE/TEST CANDIDATE → `b225b76f9d72c4a8e7cf4e0aeae9a47834f4eb39`
- CURRENT REPOSITORY HEAD → `b225b76f9d72c4a8e7cf4e0aeae9a47834f4eb39`
- ACTIVE FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- CLOSED IMPLEMENTATION → durable 9-stage Task Ledger, lease-fenced worker task lifecycle, authoritative enqueue/execute boundary, tenant readback, live execution report, final execution report, TypeScript/type-safety fixes.
- STAGING PROOF → task creation and ordered execution verified in Supabase transaction tests; ordering guard proven.
- CURRENT GATE → exact-head certification must consume `b225b76f9d72c4a8e7cf4e0aeae9a47834f4eb39`; no transfer from `578bf...`.
- OPEN → hosted deployment refresh + Phase-F, and device-only PC01.
- NEXT → execute current-head gates and first-failure repair only.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / POST-UPLOAD EXECUTION LEDGER IMPLEMENTED

- CURRENT CODE/TEST CANDIDATE → `578bf217609de50fca4180b7ff5f6c7ed27988b5`
- CURRENT REPOSITORY HEAD → `578bf217609de50fca4180b7ff5f6c7ed27988b5`
- ACTIVE FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- CLOSED IN THIS BATCH → authoritative durable Task Ledger (9 stages), lease-fenced task start/complete/fail RPCs, server enqueue boundary, worker task lifecycle, tenant readback, live execution report, final execution report.
- FRESH IMPLEMENTATION PROOF → Supabase staging Transaction tests on the new ledger passed: 9 task creation, ordering guard, then ordered queued/fingerprinted completion with worker/attempt/evidence.
- LAST CODE FAILURE → `6ff00d...` lint/build syntax error in CanonicalImportPage line 689; fixed by closing saving conditional before this candidate.
- OPEN → exact-head CI, hosted deployment refresh, Phase-F external probe; no stale PASS.
- NEXT → consume current-head terminal gate results, then persist fresh evidence.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / BATCH PROVEN / PHASE-F EXTERNAL

- CURRENT CODE/TEST CANDIDATE → `b5b5ac2d56477aa3da9029fd709ae895a649199e`
- ACTIVE FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- CLOSED → governance push coverage, `public.profiles` restore parity, Unified Import accessibility, Final Certification, Quality, Full Product Browser E2E, Device-Independent Browser E2E and all completed exact-head security/truth/import/data contracts.
- FRESH EVIDENCE → Final Certification `36451230363`, Quality `36451230469`, Full Browser `36451230478`, Device-Independent Browser `36451230142` all SUCCESS on candidate `b5b5ac2d56477aa3da9029fd709ae895a649199e`.
- PHASE-F → live canary PASS, but hosted deployment proof is blocked because production SHA `22a5d3123fb576603de363c4c81fd830dfd53547` differs from candidate; backup verification `404`, rollback drill `503`. Do not downgrade this to a code failure or fake PASS.
- EXTERNAL → Vercel free-plan build-rate limit; Supabase Auth leaked-password protection; device-dependent PC01 path.
- NEXT → consume fresh exact-head governance CI after this docs checkpoint; continue only executable non-device fronts.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / CERTIFICATION CANDIDATE FIELD REPAIRED

- CURRENT CODE/TEST CANDIDATE → `8fc8b09b55794b575b25704b6107800bb33e34a6`
- CURRENT EXECUTION HEAD → `8fc8b09b55794b575b25704b6107800bb33e34a6`
- ACTIVE FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- THIS BATCH → broad governance push coverage restored; customer-profile schema parity restored before the resolver; Unified Import accessibility semantics improved.
- CERTIFICATION GOVERNANCE → validator contract is preserved; current candidate is declared using the exact field name it consumes.
- PHASE-F ROOT REPAIR → `20260925160000_restore_customer_profile_schema_parity.sql` precedes `20260925170000_reconcile_current_customer_company_id.sql`.
- OPEN → fresh exact-head certification + Phase-F + quality + browser; Vercel build-rate external; Supabase Auth leaked-password protection external; PC01 device-only.
- NEXT → consume terminal workflow failures and execute the first safe root fix only.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / EXACT-HEAD CERTIFICATION REANCHORED

- FUNCTIONAL EXECUTION HEAD → `5ee193ff1a6a8169cc1e24ebe2a1b61cd91f1b53`
- ACTIVE EXECUTION FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- THIS BATCH → governance push coverage restored; customer-profile migration parity restored before resolver; Unified Import accessibility improved.
- CERTIFICATION ROOT FOUND → boundary guard rejected stale indexed candidate `40323c32da359c04f6328dd4d6273bbfc92b4a4a` while HEAD `5ee193ff1a6a8169cc1e24ebe2a1b61cd91f1b53` contained non-governance code changes; this is now being reanchored to the current functional head.
- PHASE-F ROOT REPAIR → `public.profiles` is now restored in repository migration order before `20260925170000_reconcile_current_customer_company_id.sql`.
- OPEN → fresh exact-head CI; Vercel build-rate external; Supabase Auth leaked-password protection external; PC01 device-only.
- NEXT → consume exact-head certification + Phase-F + quality, then close the next terminal executable root.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / CERTIFICATION STARTUP-PARSER ROOT CLOSED

- CURRENT REPOSITORY HEAD → `40323c32da359c04f6328dd4d6273bbfc92b4a4a`
- CURRENT CODE/TEST CANDIDATE → `40323c32da359c04f6328dd4d6273bbfc92b4a4a`
- ACTIVE EXECUTION FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- ACTIVE EXECUTION FRONTS → Certification Boundary, Security Definer Exposure, Execution Enforcement, Quality/Lint, Phase-F resilience, UI/Import truth.
- OPEN BLOCKERS → fresh exact-SHA CI; Vercel free-plan build-rate; PC01 offline; Supabase Auth leaked-password protection external.
- LAST PROVEN → Execution Enforcement main contract + adversarial suites passed on the preceding candidate; Browser/Device-Independent Browser E2E and desktop/data/tenant gates previously passed.
- LAST FAILED ROOTS CLOSED → malformed enforcement test literal; stale Phase-F resolver contract; worker RPC grant ordering; certification startup-boundary parser capture bug.
- NEXT EXECUTABLE ACTION → first terminal exact-`40323c32...` failure only; repair → test → prove → persist → rescan.
- NEXT INDEPENDENT ACTIONS → safe static UI/data/security fronts independent of device/hosting.
- DO NOT REPEAT → stale evidence, duplicate routes, blanket security-definer revokes, production/device claims.
- REANCHOR MAIN → `650b74ee83095752f44a1a1b0df3cf496fc73f71`.
- FUNCTIONAL RELATION → ahead=153, behind=0, changed_files=113 from main.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / CERTIFICATION PARSER + PHASE-F CONTRACT ROOTS CLOSED

- CURRENT REPOSITORY HEAD → `fda2a8eae8e2a85810ae39afc850fe339ef31b5f`
- CURRENT CODE/TEST CANDIDATE → `fda2a8eae8e2a85810ae39afc850fe339ef31b5f`
- ACTIVE EXECUTION FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- ACTIVE EXECUTION FRONTS → Security Definer Exposure, Execution Enforcement, Final Certification, Quality/Lint, Phase-F resilience, UI/Import truth.
- OPEN BLOCKERS → fresh exact-SHA CI; Vercel free-plan build-rate; PC01 offline; Supabase Auth leaked-password protection external.
- LAST PROVEN → Execution Enforcement main contract + adversarial suites passed on `a5409154...`; prior browser/device-independent/browser desktop/data/security gates passed.
- LAST FAILED ROOTS CLOSED → enforcement test parse error; certification startup-boundary parser; stale Phase-F customer-resolver contract; worker RPC privilege ordering.
- NEXT EXECUTABLE ACTION → first terminal exact-`fda2a8ea...` failure only; repair → test → prove → persist → rescan.
- NEXT INDEPENDENT ACTIONS → repository-safe UI/data/security work independent of PC01/Vercel.
- DO NOT REPEAT → stale PASS transfer, duplicate import routes, blanket security-definer revokes, production/device claims.
- REANCHOR MAIN → `650b74ee83095752f44a1a1b0df3cf496fc73f71`.
- FUNCTIONAL RELATION → ahead=151, behind=0, changed_files=113 from main.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / ENFORCEMENT TEST PARSE ROOT CLOSED

- CURRENT REPOSITORY HEAD → `a540915475ac9423ded85099f54cf8600078c805`
- CURRENT CODE/TEST CANDIDATE → `a540915475ac9423ded85099f54cf8600078c805`
- ACTIVE EXECUTION FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- ACTIVE EXECUTION FRONTS → Execution Enforcement, Final Certification, Security Definer Exposure, Quality/Lint, Phase-F resilience, UI/Import truth.
- OPEN BLOCKERS → fresh exact-SHA CI; Vercel free-plan build-rate; PC01 offline; Supabase Auth leaked-password protection external.
- LAST PROVEN → Browser E2E and Device-Independent Browser E2E SUCCESS on prior candidate; desktop-windows, Phase 3 data/import truth, storage isolation SUCCESS.
- LAST FAILED ROOTS → certification boundary anchor mismatch; worker RPC source-grant ordering; malformed enforcement test literal. These repository roots are corrected on this candidate.
- LIVE SECURITY PROOF → `fail_report_execution_job` authenticated=false, anon=false, service_role=true in Staging.
- NEXT EXECUTABLE ACTION → first terminal exact-head CI failure only; repair → test → prove → persist → rescan.
- NEXT INDEPENDENT ACTIONS → static security/data/UI fronts independent of PC01/Vercel.
- DO NOT REPEAT → stale evidence, duplicate import routes, blanket security-definer revokes, production/device claims.
- MAIN REFERENCE → `650b74ee83095752f44a1a1b0df3cf496fc73f71`; current functional diff continues from PR #672 with behind=0 at the reanchor.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / SECURITY BOUNDARY + ENFORCEMENT CONTRACT CHECKPOINT

- CURRENT REPOSITORY HEAD → `090469422277055af319876763ce7f488cf0daa9`
- CURRENT CODE/TEST CANDIDATE → `3c5b21af588453adeea7c19059fb685750b5fd09`
- ACTIVE EXECUTION FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- ACTIVE EXECUTION FRONTS → Security Definer Exposure, Execution Enforcement, Final Certification, Quality/Lint, Phase-F resilience, UI/Import truth.
- OPEN BLOCKERS → fresh exact-SHA CI; Vercel free-plan build-rate limit; PC01 offline; Supabase Auth leaked-password protection external.
- LAST PROVEN → Full Product Browser E2E SUCCESS, Device-Independent Browser E2E SUCCESS, desktop-windows SUCCESS, Phase 3 data/import truth SUCCESS, storage tenant isolation SUCCESS.
- LAST FAILED → Execution Enforcement, Final Certification, Quality/Lint, Recovery Readiness, Security Definer Exposure, Phase-F live resilience on the previous exact SHA.
- NEXT EXECUTABLE ACTION → first terminal exact-`3c5b21af...` CI failure only; repair, test, prove, persist, rescan.
- NEXT INDEPENDENT ACTIONS → continue static security/data/UI fronts independent of PC01/Vercel.
- DO NOT REPEAT → no stale PASS transfer, duplicate import paths, blanket security-definer revokes, production/device claims.
- REANCHOR MAIN → `650b74ee83095752f44a1a1b0df3cf496fc73f71`.
- CURRENT FUNCTIONAL DIFF → 112 files against main; documentation-only commits after candidate preserve certification ancestry.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / CURRENT EXECUTION CHECKPOINT

- CURRENT REPOSITORY HEAD → `a3d48175a731411e1ca6c67161afcce4708988cd`
- CURRENT CODE/TEST CANDIDATE → `e261364b6fbc720a47b9e2510885b378523300c9`
- ACTIVE EXECUTION FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased`
- RELATION → current code/test candidate is an ancestor of the repository HEAD; changes after the candidate are governance/control-document persistence only.
- ACTIVE EXECUTION FRONTS → Execution Enforcement, Certification Boundary, Security Exposure Contract, Quality/Lint, Phase-F resilience, and current UI/Import truth.
- OPEN BLOCKERS → exact-SHA certification gates; Vercel free-plan build-rate limit; PC01 offline; Supabase Auth leaked-password protection external setting.
- LAST PROVEN → Full Product Browser E2E SUCCESS, Device-Independent Browser E2E SUCCESS, desktop-windows SUCCESS, Phase 3 data/import truth SUCCESS, storage tenant isolation SUCCESS on `e261364b6fbc720a47b9e2510885b378523300c9`.
- LAST FAILED → Execution Enforcement Contract, Final Certification Gate, Quality, Recovery Readiness, Security Definer Exposure Contract, Phase-F live resilience on `a3d48175a731411e1ca6c67161afcce4708988cd`.
- NEXT EXECUTABLE ACTION → repair the first reproducible current-SHA failure, run fresh gates, persist exact evidence, then rescan.
- NEXT INDEPENDENT ACTIONS → continue static security/data/UI contract repairs that do not depend on PC01 or Vercel.
- DO NOT REPEAT → no stale PASS transfer, no duplicate import path, no blanket SECURITY DEFINER revoke, no production/device claim.
- CURRENT FUNCTIONAL DIFF → 112 files against main; PR #672 remains open and mergeable.
- REANCHOR MAIN → `650b74ee83095752f44a1a1b0df3cf496fc73f71`.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / IMPORT BENCHMARK TRUTH CLAIM REPAIRED

- ACTIVE FUNCTIONAL HEAD → `e261364b6fbc720a47b9e2510885b378523300c9`.
- MAIN REFERENCE → `650b74ee83095752f44a1a1b0df3cf496fc73f71`; reanchor remains 0-behind.
- UI CLOSED → Benchmark is visible as a post-import continuity step but no longer emits an unobserved `INSUFFICIENT_SAMPLE` claim; the surface is fail-closed instead.
- CONTRACT CLOSED → Import transaction test now detects hardcoded benchmark-status claims and protects the route/continuity contract.
- SECURITY CLOSED → worker failure RPC service_role-only, live verified; 40 authenticated SECURITY DEFINER advisor findings remain.
- RELEASE → fresh CI evidence pending on this exact head; Vercel/PC01 remain external blockers.
- NEXT → first terminal exact-head failure only; do not transfer prior PASS across this SHA.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / POST-REANCHOR CURRENT HEAD

- MAIN REFERENCE → `650b74ee83095752f44a1a1b0df3cf496fc73f71`.
- ACTIVE FUNCTIONAL HEAD → `12c095d94fa526b577c52f300c1e0ffdf208b225`.
- REANCHOR → PR #672 is 0-behind main; mergeable=true at reanchor; functional tree remains 110 files ahead.
- FRESH CI → current head has pull_request workflows registered; quality in_progress, certification/browser/security/data gates queued/in_progress; no terminal PASS claimed.
- SECURITY → worker failure RPC is service_role-only live/source and guarded by the updated security-definer contract.
- HOSTING → Vercel build-rate external failure; Netlify pending. DEVICE → PC01 offline.
- NEXT → first terminal exact-head failure only; repair then persist once, otherwise leave current control-plane checkpoint stable.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / PR #672 RE-ANCHORED ON CURRENT MAIN

- MAIN EXACT REFERENCE → `650b74ee83095752f44a1a1b0df3cf496fc73f71`.
- FUNCTIONAL HEAD AT REANCHOR → `6e562e2200ac6b3d4862bc223dd957c3a5c1b42c`.
- RELATION → PR #672 is ahead=136, behind=0, mergeable=true.
- CURRENT DIFF → 110 files; the two main control docs were preserved at their latest main blobs during the reanchor.
- FRESH CI → 50 pull_request runs exist for the reanchored SHA; certification/browser/security/data gates are queued or in progress. No terminal PASS claimed.
- HOSTING → Vercel build-rate remains an external failure; Netlify preview pending.
- DEVICE → PC01 offline.
- SECURITY → `fail_report_execution_job` worker-only boundary live on Staging and protected in source/tests.
- NEXT → repair only the first terminal exact-head failure; keep main control docs untouched until merge to preserve 0-behind relation.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / WORKER RPC TEST CONTRACT RECONCILED

- MAIN EXACT CONTROL HEAD BEFORE THIS WRITE → `42f1e861cf0a68279e446045b16100a94b9a3143`.
- FUNCTIONAL FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased` / `ee0cba1e220fc2c96e2fa4c77aa7fa96192abe68`.
- SECURITY CLOSURE → `fail_report_execution_job` is service_role-only in Staging and source.
- TEST CLOSURE → security-definer contract now verifies the latest worker-only REVOKE/GRANT boundary and rejects any later authenticated/anon grant.
- LIVE EVIDENCE → advisor authenticated SECURITY DEFINER count is 40 after this closure; no broad speculative revocations performed.
- FRESH TEST EVIDENCE → targeted contract harness passes: historical authenticated grant followed by revoke is accepted; authenticated grant after revoke is rejected. Syntax parse passes.
- CI → no exact-head Actions run registered at last poll for the latest functional SHA; no runtime PASS claimed.
- DEVICE/EXTERNAL → PC01 offline; Auth leaked-password protection and Vercel free-plan limit remain external blockers.
- NEXT → if no independent safe front can be proven without device, the only live certification gap is fresh exact-head CI plus device/external runtime evidence; do not transfer historical PASS.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / WORKER FAILURE RPC SECURITY BOUNDARY CLOSED

- MAIN EXACT CONTROL HEAD BEFORE THIS WRITE → `a98dc4451b79544fde40f60680f8d52edd60e209`.
- FUNCTIONAL FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased` / `be0a64b01217ff16a53ef5d196e5613fb175cfa7`.
- SECURITY IMPLEMENTATION → restricted `fail_report_execution_job` to service_role only via `20260928230000_restrict_report_execution_failure_worker_rpc.sql`.
- LIVE PROOF → Staging applied the migration; readback confirms authenticated=false, anon=false, service_role=true while the function remains SECURITY DEFINER.
- ADVISOR PROOF → authenticated SECURITY DEFINER warnings reduced 41 → 40. Remaining 40 are not blanket-removal targets without caller/contract proof. Leaked-password protection remains an external Auth setting.
- SOURCE PROOF → exact branch migration contract PASS.
- CI → new SHA had not yet produced a registered Actions run at last poll; no runtime PASS transferred or claimed.
- DEVICE/RELEASE → PC01 offline; Vercel build-rate limit external; hosted/browser/device certification remains NOT PROVEN.
- NEXT EXECUTABLE ACTION → continue independent safe fronts; consume first terminal exact-`be0a64...` CI result when present, repair only the first current-SHA reproducible failure, then persist/rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / CI DUPLICATION CLOSED + BENCHMARK UI CONTINUITY

- EXACT MAIN CONTROL HEAD AT START → `4ec779a0a1573fc3e0e395862f6761a70f775d49`.
- FUNCTIONAL FRONT → PR #672 / `exec/20260927-current-main-import-ui-rebased` / exact head `fdb59e8f4fa08cfb8778006ffc71a1e63088fb21`.
- UI DELIVERY → canonical Import now exposes Benchmark as the sixth post-import continuity step; `INSUFFICIENT_SAMPLE` is explicit until a peer cohort and evidence are available.
- CONTRACT DELIVERY → import transaction contract asserts the Benchmark route and fail-closed status.
- CI DELIVERY → Browser E2E, Final Certification, and Execution Enforcement push triggers are restricted to `main`; pull-request gates remain intact, eliminating duplicate PR push+PR executions for the affected workflows.
- FRESH PROOF → branch-source static contract execution PASS. Affected exact-head GitHub runs are PR-only and currently queued; no terminal runtime PASS/FAIL claimed.
- EXTERNAL → PC01 offline; Vercel free-plan build-rate limit; hosted/browser/device production proof remains NOT PROVEN.
- NEXT EXECUTABLE ACTION → consume the first terminal exact-head CI result on `fdb59e8...`; repair only the first reproducible non-external failure, then persist/rescan and continue the next safe front.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / LIVE POLICY PARITY CLOSED

- MAIN CONTROL HEAD AT CHECKPOINT → memory/index updates are the only main changes in this batch.
- FUNCTIONAL FRONT → PR #672 remains the single canonical import-to-decision front; client UI tenant-policy parity repair is included on the branch.
- LIVE PROOF → Staging policy/grant readback matches the repaired migration; migration application succeeded.
- EXACT-HEAD EVIDENCE → no PASS transferred from older branch SHAs after the repair. Fresh CI remains the release gate.
- RELEASE → Vercel build-rate external; Netlify exact-head preview cancellation; device offline.
- NEXT → stable re-anchor + fresh CI consumption, then first-failure repair only.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / RE-ANCHORED CI ADVANCE

- MAIN CONTROL HEAD AFTER MEMORY WRITE → `ac6bad42b2fcc0d4610fd4faba3a139585386027`.
- FUNCTIONAL FRONT → PR #672 / `0a48b4e19edf221d68e5d5c3d7497260b08352da`, exactly 1 ahead / 0 behind main at its base `517d01af...`.
- EXACT CI → `desktop-windows` run `36351392998` SUCCESS; remaining exact-head gates are still queued/pending with no terminal failure observed.
- STORAGE → authenticated documents bucket policy is tenant-prefix constrained; inserts bind owner to auth.uid; no cross-tenant storage relaxation detected.
- RELEASE/DEVICE → Netlify exact-head deploy is ERROR from no-content-change cancellation; Vercel external/pending; PC01 offline; browser/production/device certification remains NOT PROVEN.
- NEXT → consume the first terminal exact-head failure/result; repair only that root; persist and rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-28 / DEVICE-OFFLINE SAFE EXECUTION

- MAIN HEAD AT CHECKPOINT → `9e428325543a8198c16e2ecca9d0ebb0d5154111` (memory checkpoint only).
- PRIOR EXACT MAIN CODE/CONTROL HEAD → `9e35c768c7548ab87174e3ffa9426dc4605489d3`.
- FUNCTIONAL CANDIDATE → PR #672 / `cf0d30c4015642313d899d9d8262bc7159abb220`; candidate is 24 ahead / 8 behind current main and therefore NOT an exact-main proof source.
- LIVE STAGING SECURITY → import lifecycle RPCs are INVOKER with authenticated/service_role access and anon denied; six-argument `import_commit_batch` remains the intentional SECURITY DEFINER write boundary; canonical import tables RLS=true.
- SECURITY RESIDUAL → 40 authenticated SECURITY DEFINER advisor findings + leaked-password protection warning remain; no blanket revoke/speculative mutation.
- RELEASE → Vercel build-rate limit remains external; candidate has no fresh CI PASS; device/browser/production certification NOT PROVEN.
- DEVICE → PC01 offline. Independent repository/live read-only fronts continue.
- NEXT → re-anchor #672 to exact current main, then consume fresh exact-head CI and repair only reproduced failures.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / IMPORT-FINISH STAGING DRIFT RECONCILED

- CANONICAL MAIN HEAD BEFORE THIS WRITE → `6f1d818f60a700b07a13b0163ddfc20dce0f2a57`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `exec/20260927-current-main-import-ui-rebased` / `9aa6c8ccea82b20d949ae2e41fdad2f1b1126631`
- FRONT → IMPORT-TO-DECISION-CONTINUITY / SECURITY-RUNTIME-RECONCILIATION
- ROOT CAUSE → live staging had `import_finish_job(uuid,text,jsonb,text)` as SECURITY DEFINER because an applied historical migration was absent from the candidate repository lineage.
- IMPLEMENTED → candidate adds `20260927235000_reconcile_import_finish_job_security_invoker.sql` which preserves the function body and restores SECURITY INVOKER, safe search_path, and explicit authenticated/service_role EXECUTE.
- LIVE PROOF → Supabase staging `fnqbvfuwbdpwvhcgzksl` applied migration `20260927203948_reconcile_import_finish_job_security_invoker` successfully; readback shows no SECURITY DEFINER clause and EXECUTE only for authenticated/postgres/service_role.
- RELATED PROOF → canonical six-argument `import_commit_batch` remains SECURITY DEFINER with source/tenant checks; authenticated/service_role execution is present and public/anon execution is absent. Canonical import tables are RLS-enabled.
- SECURITY RESCAN → 46 historical authenticated SECURITY DEFINER advisor warnings remain outside this exact import boundary; no blanket or speculative revoke.
- HOSTING/DEVICE → exact candidate Netlify deploy `6ab97f10fb0f09000849973a` is STATE=error (no content change); Vercel is externally rate-limited; PC01 remains offline. No hosted/browser/device PASS.
- GATE STATE → fresh workflows for `9aa6c8c` have not appeared yet; current Vercel status is pending, Netlify commit status success but authoritative deploy error, CodeRabbit success. Certification remains NOT PROVEN.
- DO NOT REPEAT → do not mutate broad Security Advisor findings; do not count Netlify status as deployment PASS; do not transfer old candidate evidence.
- NEXT EXECUTABLE ACTION → consume fresh exact-`9aa6c8c` gates, repair only the first current-SHA reproducible failure, then rescan UI/core/security/cleanup fronts.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT-CANDIDATE EVIDENCE BOUNDARY UPDATE

- MAIN DOCUMENTATION HEAD BEFORE THIS WRITE → `924dc7c327d7c444bbe6ad6e436616014e58283d`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `ecfff32aa5ce1ec737663a71b1d9080ffe69e7eb`
- FRESH BUILD EVIDENCE → Windows desktop job `36348110511` completed SUCCESS on the exact candidate SHA: web build, native watcher, native runtime smoke, installer packaging and artifact upload all completed.
- FRESH QUALITY/CERTIFICATION/BROWSER GATES → quality `36348110541`, enforcement `36348110823`, final certification `36348110593`, device-independent browser `36348110591`, full product browser `36348110595` remain queued at last observation.
- VERCEL → commit status failure remains the free-plan `build-rate-limit` blocker; no production proof.
- NETLIFY → commit status was `success`, but actual deploy `6ab97c3d6fa5b900087ac057` is STATE=error with `Canceled build due to no content change`. Therefore there is NO hosted preview PASS.
- DEVICE → PC01 offline; no device/browser/production PASS claimed.
- LIVE STAGING → six-argument import_commit_batch grant boundary and RLS are verified read-only; import_finish_job remains SECURITY DEFINER from applied migration lineage not present in the candidate tree. Treat as migration/environment drift, not a mutation target until caller/source reconciliation.
- EVIDENCE LAW → no stale PASS from older SHAs; current exact candidate evidence must bind to `ecfff32...`.
- NEXT → consume first terminal exact candidate quality/certification/browser result; repair only the first reproducible current-SHA failure, then rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CURRENT-CANDIDATE + LIVE-STAGING BOUNDARY

- CURRENT MAIN DOCUMENTATION HEAD BEFORE THIS WRITE → `c246071b6200f1652f7f8f272c18c2dcc2eaf2d1`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `ecfff32aa5ce1ec737663a71b1d9080ffe69e7eb`
- CODE/TEST REPAIRS ACTUAL → UI contract and import transaction contract harnesses repaired and compile-style syntax verified.
- FRESH EXACT-HEAD CI → quality `36348110541` queued; enforcement `36348110823` queued; Final Certification `36348110593` queued; Device-Independent Browser `36348110591` queued; Full Product Browser `36348110595` queued; desktop-windows `36348110511` in progress/queued.
- DEVICE → PC01 offline; no device/browser/production PASS claimed.
- LIVE STAGING → `fnqbvfuwbdpwvhcgzksl` is healthy and has the current specialty/grant migrations. Six-argument `import_commit_batch` is SECURITY DEFINER with EXECUTE for authenticated/service_role and no PUBLIC/anon grant. RLS is enabled on import_jobs, file_records, canonical_import_commits and import_job_rows.
- LIVE STAGING DRIFT → `import_finish_job(uuid,text,jsonb,text)` is currently SECURITY DEFINER and executable by authenticated/service_role. The canonical repository chain migration `20260830210000_harden_import_finish_lifecycle.sql` declares SECURITY INVOKER, while staging also contains applied historical migration `20260919220623_allow_import_job_rpc_writes_via_definer`, which is not present in the current candidate tree. Treat this as migration-lineage/environment drift; DO NOT mutate until caller, grant, and canonical ownership are reconciled.
- SECURITY ADVISOR → staging has broad historical authenticated SECURITY DEFINER warnings (62 findings); no blanket revoke is authorized. Current action is limited to exact canonical import boundaries.
- EVIDENCE LAW → all current proof remains bound to the exact SHA/target; no transfer from `2ab...` or older.
- NEXT EXECUTABLE ACTION → consume first terminal `ecfff32...` CI result; independently continue safe repository fronts. Revisit staging finish-RPC drift only with exact migration source/owner reconciliation.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT-CURRENT-CODE-CANDIDATE CONTRACT-CLOSURE

- MAIN DOCUMENTATION HEAD → `8141294dd436aa96b91debc1ca9a5706ad6b358f`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `ecfff32aa5ce1ec737663a71b1d9080ffe69e7eb`
- CODE RELATION → candidate remains based directly on main code base `132e40f023e564dba9e7f84c63d543bab1b7fc71`; the current main docs tail is intentionally separate and does not invalidate code SHA evidence.
- REAL FIX — UI CONTRACT → repaired declaration order, duplicate shared bindings, and a malformed literal newline in `scripts/check-product-wow-ui-contract.mjs`; local compile-style syntax check now passes after imports are stripped.
- REAL FIX — IMPORT CONTRACT → repaired a missing token-list comma, added an explicit canonical import-page binding, and resolved a duplicate page-path binding in `scripts/check-import-transaction-contract.mjs`; same syntax check now passes.
- FRESH EXACT-HEAD CI → quality `36348110541` queued; enforcement `36348110823` queued; Final Certification `36348110593` queued; Device-Independent Browser `36348110591` queued; Full Product Browser `36348110595` queued; desktop-windows `36348110511` queued.
- OBSERVED TERMINAL RESULT → Commercial PWA `36348110613` skipped; no fresh terminal failure on required gates yet.
- DEVICE → PC01 offline; no device/browser/production PASS claimed.
- HOSTING → Vercel free-plan deployment-rate blocker remains external; no production mutation.
- EVIDENCE LAW → evidence from `2ab23aec...` and older SHAs is not transferred; current candidate must terminalize on `ecfff32...`.
- NEXT EXECUTABLE ACTION → consume the first terminal current-SHA result. If failed, repair only its current-SHA root; otherwise continue independent security/data/UI fronts and rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT-CURRENT-MAIN + CODE-CANDIDATE CHECKPOINT

- MAIN DOCUMENTATION HEAD BEFORE THIS WRITE → `132e40f023e564dba9e7f84c63d543bab1b7fc71`
- CURRENT CODE/TEST CANDIDATE → PR #672 / `2ab23aec8747c4a39081a7b6b8ccef7115406c20`
- CODE/MAIN RELATION → candidate is 1 commit ahead / 0 behind the main SHA used for its build; 76 files changed.
- RECONCILIATION → candidate functional tree is preserved as a direct child of current main; this checkpoint is documentation-only.
- FRESH EXACT-HEAD CI ON CODE CANDIDATE → quality `36347828523` queued; enforcement `36347828519` queued; Final Certification `36347828427` queued; Device-Independent Browser `36347828437` queued; Full Product Browser `36347828521` queued; desktop-windows `36347828455` in progress.
- OBSERVED TERMINAL RESULT → Commercial PWA `36347828353` skipped; no terminal failure observed yet on the listed required fresh gates.
- DEVICE → PC01 offline; no device/browser/production PASS claimed.
- HOSTING → Vercel free-plan build-rate blocker remains external; no production mutation.
- EVIDENCE BOUNDARY → prior `f42d6f2` evidence is not transferred; current proof must bind to `2ab23aec` (or a fresh resulting SHA).
- NEXT EXECUTABLE ACTION → consume the first terminal exact-head gate; repair only a reproducible current-SHA root, continue independent repository-safe fronts, then persist and rescan.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CANONICAL LIVE FRONT

> This top block is the only startup boundary.

- MAIN HEAD BEFORE THIS DOCS WRITE → `3215c601f68aea214c8455f52d5f5c519074d7f1`
- CURRENT FUNCTIONAL CANDIDATE → PR #672 / `f42d6f2b22004eb5213d2a4460975ce1a4c11c60`
- FUNCTIONAL FRONT → `IMPORT-TO-DECISION-CONTINUITY`
- EXACT GIT RELATION → functional candidate is 1 commit ahead / 0 behind the main head used for its current build; 76 files changed. This checkpoint is documentation-only and must be reconciled with the next main SHA before merging.
- EXACT-HEAD STATUS AT LAST FUNCTIONAL HEAD → GitHub Actions showed 47 queued + 2 skipped/completed and 0 terminal failures; Vercel remained `failure / build-rate-limit`.
- PLAYWRIGHT LAYER → repository already contains the canonical Playwright browser-proof layer in `.github/workflows/full-product-browser-e2e.yml` and `scripts/run-full-product-browser-e2e.mjs`; it checks exact checkout SHA, builds exact head, installs Chromium, captures screenshots/artifacts, checks console/network/HTTP errors, authenticated tenant, A/B isolation, route coverage, workspace persistence, refresh, and logout.
- PWA LAYER → `.github/workflows/commercial-pwa-e2e.yml` already covers service-worker/cache/offline app-shell and authenticated E2E contracts.
- LOCAL BROWSER FALLBACK → system Chromium exists, but container Playwright navigation to the Netlify preview was blocked with `net::ERR_BLOCKED_BY_ADMINISTRATOR`; PC01 is also offline. No browser PASS was fabricated.
- NETLIFY EXACT-HEAD → status check was green, but deployment `6ab97914b5d4da000892e4b3` reported `Canceled build due to no content change`; therefore the preview alias is not accepted as exact-head deployment proof for `f42d6f2`.
- SOURCE/ROUTE/SECURITY AUDITS → 37 canonical nav paths map to 40 actual routes with no missing/duplicate nav paths; canonical import RPC and `import_finish_job` tenant/security contracts verified; no safe free-toolbox deletion proven.
- PHASE-F → NOT CERTIFIED; production/browser/device/restore/RPO/RTO/rollback exact-SHA evidence remains open.
- CLEANUP → #671 remains superseded/closed; #672 is the single functional front.
- NEXT → reconcile #672 onto the newest main SHA, then consume terminal Playwright/quality/enforcement/certification evidence; repair only the first current-SHA failure.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / LIVE CHECKPOINT

> Exact-head evidence only. Current code candidate is kept separate from documentation/test-harness tails.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `f1444f7c7277fdc7662052a28629171063ab7d17`
- CURRENT CODE/TEST CANDIDATE → `c5b193116e16b7ce46fd88d6d6edde268820ef52`
- FUNCTIONAL FRONT → PR #664 / `9218274998a82b0613d8ec8b6b0820bad173ad0b`
- GOVERNANCE FRONT → PR #666 / `9aec629f5573830ef5d8d5bbc1e303ce41470ba3`
- UI AFTER IMPORT → single canonical Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay path; Benchmark remains INSUFFICIENT_SAMPLE.
- PHASE-F → fail-closed external/runtime boundary: restore target missing current_customer_company_id(), downstream rollback-forward 503.
- VERCEL → free-plan build-rate limit remains external.

---
# CURRENT EXECUTION BOUNDARY — 2026-09-27 / LIVE CHECKPOINT

> Exact-head evidence only. Code candidate and documentation tail are tracked separately.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `d5be7220b048a3e7bd798a9b2d9fea677b200183`
- CURRENT CODE/TEST CANDIDATE → `c5b193116e16b7ce46fd88d6d6edde268820ef52`
- FUNCTIONAL FRONT → PR #664 / `22bdfb19f234a38640961e3851c3e5eef786cbad`
- GOVERNANCE FRONT → PR #666 / `9aec629f5573830ef5d8d5bbc1e303ce41470ba3`
- PROOF → #664 3 success / 3 in-progress / 39 queued / 0 failure; #666 3 in-progress / 1 pending / 34 queued / 0 failure.
- UI AFTER IMPORT → one canonical path: Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay; Benchmark remains INSUFFICIENT_SAMPLE.
- PHASE-F → fail-closed due restore-target migration dependency on current_customer_company_id() and downstream 503 rollback-forward.
- EXTERNAL → Vercel free-plan rate limit; browser/device/production proof remains not proven.

---
# CURRENT EXECUTION BOUNDARY — 2026-09-27 / MIXED-SPECIALTY CONTRACT ROOT CLOSED

> Exact-head evidence only. This startup block supersedes older historical boundaries.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `16bfd89ac25f55dbc776871b5bc4cbc538320fc0`
- CURRENT CODE/TEST CANDIDATE: `c5b193116e16b7ce46fd88d6d6edde268820ef52`
- FUNCTIONAL CANDIDATE → PR #664 / `c5b193116e16b7ce46fd88d6d6edde268820ef52`
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`
- ROOT CLOSED → TypeScript + canonical-import mapping roots fixed; fresh proof required on `c5b193116e16b7ce46fd88d6d6edde268820ef52`.
- UI CONTINUITY → single canonical Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay path; Benchmark fail-closed.
- NEXT → first terminal current-SHA failure only; merge only after required exact-head evidence.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CURRENT CODE ROOT REPAIR

> Exact-head evidence only. This startup block supersedes older historical boundaries.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `75cc34765b9c2a18d7f0f06e5fdc2dd101aec2c0`
- FUNCTIONAL CANDIDATE → PR #664 / `2f0dcbb2f27345631f05558a6e7898af8148de42`
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`
- ROOT FIX → current exact-head TypeScript + canonical-import mapping roots repaired on #664.
- PROOF → fresh workflows for the repaired candidate must be consumed; historical failures on `361db8a…` are closed evidence.
- UI → canonical Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay remains the single post-import path.
- RELEASE → Vercel free-plan build-rate; browser/production/Phase-F remain external/not proven.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT-HEAD PROOF UPDATE

- MAIN HEAD BEFORE THIS DOCS COMMIT → `6219eb5a68aff19a3ef77a23537d5fb2db2d5a38`
- FUNCTIONAL CANDIDATE → PR #664 / `2f0dcbb2f27345631f05558a6e7898af8148de42`
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`
- EXACT PROOF → #664 desktop-windows SUCCESS on exact head; 44 other workflows queued, 2 skipped, 0 failures at latest scan. #665 has 37 queued and 1 in progress.
- RELEASE BOUNDARY → Vercel free-plan build-rate remains external; browser/production/Phase-F remain NOT PROVEN.
- UI CONTINUITY → canonical post-import path remains Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay; Benchmark remains fail-closed.
- NEXT → consume first terminal new gate/failure; repair current-SHA root only; do not transfer stale evidence.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / EXACT CURRENT-MAIN CHECKPOINT

> Exact-head evidence only. This startup block supersedes older historical boundaries.

- MAIN HEAD BEFORE THIS DOCS COMMIT → `5bb08044bcb3800d9c5561af0edc945cf0defea6`
- FUNCTIONAL CANDIDATE → PR #664 / `361db8af5e58dcb122b2b6623acf9a804e6a3fdb`
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`
- REMOTE PROOF → #664 Netlify + CodeRabbit SUCCESS, Vercel external build-rate failure, GitHub Actions queued/in-progress; #665 same Vercel boundary with governance gates queued/in-progress.
- UI CONTINUITY → #664 is the canonical existing post-import path: Import → Trust/Evidence → Decision/Work → Outcome/Learning → Replay; Benchmark remains `INSUFFICIENT_SAMPLE`.
- CLEANUP → #662/#663 closed as superseded; history retained.
- EXTERNAL → PC01 offline; browser/production/Phase-F remains NOT PROVEN.
- NEXT → consume terminal exact-head gates, repair only first current-SHA root failure, then merge only after required evidence.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CURRENT-MAIN INTEGRATION

> Exact-head evidence only. This startup block supersedes older historical boundaries.

- MAIN HEAD → `9fbb842f754f04ada2f09af3a6d21d15ff1c6382` (canonical memory checkpoint added on current main).
- FUNCTIONAL CANDIDATE → PR #664 / `361db8af5e58dcb122b2b6623acf9a804e6a3fdb`.
- GOVERNANCE CANDIDATE → PR #665 / `da99f6a873144b2ee56f73ad759f25456c2d9755`.
- FUNCTIONAL BOUNDARY → Any Source → Security → Fingerprint → Understand all datasets → Normalize/Reconcile → Quality/Trust → Evidence → Canonical Commit → Persistence/Readback → Business Understanding → Signals → Decision/Work → Outcome → Replay/Learning; Benchmark remains fail-closed until a real peer cohort exists.
- UI AFTER IMPORT → #664 contains the existing canonical post-import surface; no duplicate post-import route/path is permitted.
- PROOF → no new exact-head PASS claimed for #664/#665. Their current combined statuses expose the known Vercel free-plan rate-limit failure; workflow-run results are not yet materialized.
- EXTERNAL → PC01 offline; local execution environment cannot resolve github.com for a local clone; browser/production/Phase-F runtime proof remains NOT PROVEN.
- NEXT → consume the first terminal exact-head gate on #664/#665; repair only the first current-SHA reproducible root; continue independent UI/cleanup work without changing closed contracts.
- DO NOT REPEAT → stale PASS transfer; old-main memory overwrite; duplicate importer/RPC/runner; preview-as-production; unsafe legacy import_jobs mutation.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / CURRENT-HEAD DEPLOYMENT READBACK

- FUNCTIONAL CURRENT HEAD → PR #662 / `334c80ec51d304041071eae5908f125016f520d4`.
- DEPLOYMENT READBACK → Cloudflare exact-head check for `334c80e` is SUCCESS; the deployed import URL resolves to the Arabic الأغبري identity gate and does not fabricate an authenticated workspace. This is deployment/readback evidence only, not authenticated browser E2E proof.
- CURRENT MANDATORY GATES → `certification-contracts` and `enforcement-contract` remain queued; no new code failure is available to repair.
- UI DELIVERY → the full 16-stage post-upload lifecycle is present in the existing canonical import result surface and protected by the existing UI contract; evidence wording remains fail-closed.
- PHASE-F → source-side review found no new safe code mutation to remove the remaining live-proof blocker: the current Phase-F script requires live runtime secrets/targets and exact deployment identity. Keep fail-closed; do not synthesize production proof.
- EXTERNAL → PC01 offline; Vercel free-plan deployment-rate limit; authenticated browser and production/Phase-F resilience proof remain NOT PROVEN.
- NEXT → consume terminal mandatory gates on `334c80e`; then consume #663. If queues persist, continue only independent repository-safe fronts.


---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / LIVE RECONCILED STATE

> Exact-head evidence only. This startup block supersedes older historical boundaries; history remains evidence.

- CURRENT REPOSITORY HEAD OBSERVED → `a47532a1c6887ad233705f99b5b726f6d88dcfea` (docs-only reconciliation descendant).
- CURRENT CODE/TEST BASELINE → `46675643e32f6ea28b6c1d80a530b2eb134e7907`.
- FUNCTIONAL CANDIDATE → PR #662 / `a8ef795c290b035023e3b5781488c7e650ab6866`.
- GOVERNANCE CANDIDATE → PR #663 / `13432b118aa8db00d3a498332803d2c1324a9291`.
- FUNCTIONAL PROOF → #662 Windows build PASS + Cloudflare Pages PASS; remaining exact-head security/browser/contract/certification/data gates queued. No browser/production/Phase-F PASS claimed.
- GOVERNANCE → continuous-resume enforcement is isolated from product behavior; its earlier merge-ref failures exposed defects owned by the functional lane, not a second implementation target.
- PHASE-F → NOT CERTIFIED: rollback-forward probe lacks required runtime configuration; local restore-parity migration exposed `current_customer_company_id()` dependency. Keep fail-closed.
- EXTERNAL → PC01 offline; Vercel free-plan rate limit; production/browser/Phase-F exact-SHA proof unavailable.
- NEXT → consume first terminal #662 gate; repair only first reproducible current-SHA failure; concurrently consume #663 governance gates; reconcile/merge only after exact-head compatibility proof.
- UI AFTER IMPORT → #662 already covers full-source understanding, persisted dataset summaries/provenance, Trust/Evidence → Decision → Outcome/Learning continuity, tenant-scoped Business Replay, and evidence-safe Benchmark. Do not create another post-import path.
- CLEANUP → no deletion in this batch. Legacy removal remains gated by Manifest reference/caller checks and tests; historical evidence retained.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / LIVE RECONCILED STATE

> Exact-head evidence only. This block supersedes older historical boundaries for startup; history remains immutable evidence.

- MAIN HEAD → `46675643e32f6ea28b6c1d80a530b2eb134e7907`.
- FUNCTIONAL CANDIDATE → PR #662 / `a8ef795c290b035023e3b5781488c7e650ab6866`.
- GOVERNANCE CANDIDATE → PR #663 / `13432b118aa8db00d3a498332803d2c1324a9291`.
- FUNCTIONAL PROOF → #662 Windows build PASS + Cloudflare Pages PASS; remaining exact-head gates are queued. No browser/production/Phase-F certification claimed.
- GOVERNANCE PROOF → #663 current head has successful basic verify/authenticated-e2e checks but certification/verify failures were observed against its merge ref; the known typecheck defects belong to the functional lane and must not be duplicated in governance.
- PHASE-F → NOT CERTIFIED: live rollback-forward drill is blocked by missing runtime configuration; local migration test also exposed dependency on `current_customer_company_id()` in restore-parity migration. Keep fail-closed.
- EXTERNAL → PC01 offline; Vercel free-plan rate limit; production/browser/Phase-F exact-SHA proof unavailable.
- NEXT → consume first terminal #662 gate; repair only first reproducible current-SHA failure; concurrently consume #663 governance gates; then reconcile/merge only after exact-head compatibility proof.
- UI AFTER IMPORT → #662 already implements full-source understanding, persisted dataset summaries/provenance, Trust/Evidence and Decision continuation, Outcome/Learning continuation, tenant-scoped Business Replay, and evidence-safe Benchmark. Do not create another post-import surface/path.
- CLEANUP → no deletion in this batch; deletion remains gated by Manifest reference/caller checks and tests. Preserve historical evidence.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / CONTINUOUS EXECUTION CHECKPOINT 144

- MAIN HEAD OBSERVED BEFORE THIS INDEX WRITE: `8eb5b4154e02a1320942e08a33e052e0a35ab238`.
- CURRENT CODE/TEST CANDIDATE A: `e76d7fb639da2e7a1a8b603156e82fc3ab27b0f9` (PR #657; current-main deep UI/core lane + Work Center zero-progress signal).
- CURRENT CODE/TEST CANDIDATE B: `b324e023f1dbf603811f2cfe47bf58bfff6a0660` (PR #658; receivables truth closure).
- CURRENT GATES: previous #657 Vercel/Netlify/CodeRabbit and Windows success were exact for `124eec1...` only; they are not proof for `e76d7fb...`. #658 Netlify is READY exact; Vercel is externally rate-limited.
- WORK CENTER CLOSURE: active rows with progress 0 are now explicitly surfaced as an operational signal and routed to active-work review. No DB status is altered.
- KNOWLEDGE ARCHITECTURE: quality workflow includes `npm run test:knowledge-architecture`; current-head execution remains unproven until the new quality run terminalizes.
- SUPERSEDED PRS: #647/#651/#653/#654 closed without merge. Their source lineage is preserved through #657/#658; no stale PASS transferred.
- NEXT EXECUTABLE ACTION: consume new exact-head #657 CI result first; then #658. Repair only the first reproduced current failure, and merge only after required exact-head evidence.
- DO NOT REPEAT: stale evidence, duplicate PR fronts, production promotion bypass, blanket security revokes, unsafe import-job mutations.

---

# CURRENT CONTROL-PLANE BOUNDARY — 2026-09-25 / POST-MERGE PR #632 + UI PR #634

- MAIN HEAD OBSERVED BEFORE THIS INDEX WRITE: `6ef890dc59aabe05efd93e496c863a40e1d28f66` (live-memory write-back commit; functional core merge is `886c3e11afb0304f48b8653001bf5b6a4f039ab5`).
- CORE CODE MERGE: PR #632 merged as `886c3e11afb0304f48b8653001bf5b6a4f039ab5`.
- UI CODE CANDIDATE: PR #634 head `57b19ff9a0bbd56c506f2f8df3f22fbcdd2715be`, rebased onto current main; only Header/Sidebar accessibility closure is pending merge.
- PHASE-F: run `36165329471` is IN_PROGRESS on exact PR #632 head `dcff29f15d4851bd6f48dd863e5a62b29f67519e`; exact-head canary and all pre-probe steps succeeded, live resilience probes are running. Final status is NOT YET PROVEN.
- UI AUTOMATION: PR #634 has exact-head workflows queued/in progress; no fresh UI PASS transferred.
- EXTERNAL HOSTING: Vercel free-plan deployment rate limit remains a deployment-status blocker; do not bypass it or promote preview evidence to production.
- NEXT EXECUTABLE ACTION: consume Phase-F live probe result first; repair only the first reproduced failure, then consume fresh exact-head Quality/Enforcement/Final Certification/Browser evidence and merge the UI closure when required checks permit.
- DO NOT REPEAT: PR #632 repair; stale certification evidence; SHA/credential bypass; unsafe merge of PR #634.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PHASE-F IMPLICIT-PORT FALLBACK REPAIR

- MAIN HEAD BASE → `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CORE CODE/TEST HEAD → `6d4c849f7b9b10f13e71e41bf15f12138c640278`.
- PRECISE FAILURE CONSUMED → Phase-F run `36163768006` on `d4e34ee...`: exact-head/local/static/canary checks passed; logical backup failed because the source remained `db.fnqbvf...supabase.co:5432` over IPv6; production health separately failed exact deployment SHA; rollback drill returned 503.
- ROOT CAUSE → `URL.port` is empty when the connection URI omits the default port, so the prior fallback condition never matched `5432`.
- DONE → `preferIpv4Host()` now treats an omitted port as `5432` and activates the same-project Supabase Pooler fallback; Phase-10 contract now asserts the implicit-port condition.
- CURRENT PROOF → this repair is new and has no fresh CI result yet. No PASS claimed.
- UI LANE → corrected Sidebar JSX closure is on exact UI head `a232508a...`; desktop-windows run `36164338872` remains in progress.
- NEXT → consume the fresh Core exact-head Phase-F/certification set created by this repair; in parallel consume UI build/browser/certification; fix only the first reproduced failure.
- DO NOT REPEAT → no return to direct IPv6 source routing, no production SHA bypass, no stale PASS transfer, no rollback/RPO/RTO claim without the measured artifact.
# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PARALLEL CORE + UI EXECUTION

- MAIN HEAD OBSERVED → `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CORE CODE/TEST HEAD → `d4e34ee9650ed6f8daaff6c9343d8e4a0ba533aa` (PR #632).
- UI CODE HEAD → `a232508aeb7de8669cecc028bc3b146a0aa6d1d3` (PR #633).
- CORE FIX APPLIED → Phase-F logical schema-count query now uses the IPv4-resolved `runnerSource`; source contract guard also binds logical dump to `runnerSource`.
- CORE CURRENT RUN → Phase-F `36163768006` is still `in_progress`; exact-head verification, npm CI, local runtime tests, and static resilience contracts have passed before the live probes step. No Phase-F PASS claimed yet.
- UI FIX APPLIED → repaired the reproduced JSX closure defect in `src/components/Sidebar.tsx` that caused Windows build `36164023271` to fail. Replacement commit is `a232508aeb7de8669cecc028bc3b146a0aa6d1d3`.
- UI CURRENT RUN → desktop-windows `36164338872` is `in_progress` on exact UI head; the earlier JSX transform failure is the defect being revalidated. No current UI PASS claimed yet.
- PRODUCTION → no production mutation or SHA bypass. Current release identity remains a separate gate.
- NEXT → consume exact-head Core Phase-F + certification results and exact-head UI build/browser/certification results; repair only the first reproduced failure on each lane.
- DO NOT REPEAT → no stale PASS transfer, no production SHA bypass, no duplicate navigation/import path, no weakening of resilience or accessibility guards.

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PHASE-F LOGICAL SOURCE QUERY REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `6d4c849f7b9b10f13e71e41bf15f12138c640278`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `6d4c849f7b9b10f13e71e41bf15f12138c640278`.
- DONE: fixed the Phase-F logical backup path so the generated schema-count query uses the resolved `runnerSource` URI, not the original direct DB URI; added a contract guard proving both schema-count and dump use the resolved source. This closes the observed IPv6 direct-host leak in one remaining query.
- RETAINED CORE FIXES: replay-safe `enforce_same_company_reference()` helper; UUID-safe `current_company_id()`; no push trigger on Phase-F; bounded auth clock-skew retry; IPv4-safe source URI resolution.
- EXACT CURRENT-HEAD CI: fresh workflows launched for `1843040...`; no result is transferred from earlier candidates. Phase-F still has a separate production SHA mismatch against live deployment `dcabe46...`; production promotion remains external/authorized path only.
- NEXT: consume Quality/Enforcement/Certification/Browser/Storage/Phase-F exact-head results. If logical restore passes but production SHA remains mismatched, preserve fail-closed boundary and resolve deployment identity through authorized release process.
- DO NOT REPEAT: do not revert to original `source` for any logical DB read; no SHA bypass, no arbitrary host, no stale PASS transfer.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / STORAGE AUTH CLOCK-SKEW RETRY

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: 9c4e5f03a53ae211d5ed00077c2fd43a339a7db2.
- CURRENT CODE/TEST CANDIDATE: 10d2d4f5556efa662eba46f235c963f2c75126c5.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: 993778e43d72e77747a67c61cabd49304f962695.
- DONE: Storage Tenant Runtime E2E exposed Supabase Auth "JWT issued at future". The test harness now retries only that exact transient condition (bounded to 12 attempts); normal authentication failures remain fail-closed.
- PRIOR INDEPENDENT CORE FIX RETAINED: logical Phase-F backup now prefers IPv4 hostaddr while preserving source hostname; source candidate b8a19ec...
- PRIOR EXACT GATES: Full Product Browser SUCCESS on 993...; Execution Enforcement SUCCESS on 993...; older stable gates are not transferred to 10d2d4...
- PHASE-F: run 36160600882 on b8a19ec... was still in progress at the time of this write; no result transferred.
- NEXT: consume stable CI/Phase-F generated from 10d2d4...; first current-SHA failure only.
- DO NOT REPEAT: no stale PASS transfer, no relaxation of auth/tenant checks, no production-SHA bypass, no historical migration rewrite.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PHASE-F DEPLOYMENT BOUNDARY + IPV4 BACKUP REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `b8a19ec642955f695e7fe8b8a8525b9fa0918cc5`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `bb6bf125474c185670bb0bcf44f75eac8f85b4d8`.
- PHASE-F EXACT RUN `36159874884` → FAILED CLOSED on `bb6bf12...`.
- FIRST LIVE FAILURE → production `report-advisor.vercel.app` returned HTTP 200 but deployment SHA `dcabe46e594cbb070e145882a87dd67fa91ddabe`, not the exact candidate `bb6bf125474c185670bb0bcf44f75eac8f85b4d8`. Tenant canary itself returned HTTP 200.
- SECOND INDEPENDENT FAILURE → logical backup/restore hit `Network is unreachable` to the Supabase source over IPv6; rollback-forward drill returned 503 downstream. This remains separate from the deployment-identity blocker.
- DONE INDEPENDENTLY → `scripts/phase-f-live-resilience-probes.mjs` now prefers an IPv4 `hostaddr` for external logical backup connections while preserving the hostname for TLS. Exact source candidate `b8a19ec...`.
- STABLE PRIOR GATES ON `bb6bf12...` → Quality SUCCESS; Final Certification SUCCESS; Enforcement SUCCESS; Storage Tenant Runtime SUCCESS; Full Product Browser SUCCESS; Device-Independent Browser SUCCESS.
- PRODUCTION TARGET FACT → Vercel project `prj_jcqgz6UKGd6tPgHZlttgFXaXvyvo`, exact READY candidate deployment `dpl_BPRcrUeoQf45cCTAKNeLDwHCfn9o` maps to `bb6bf12...`; current production remains `dpl_Cp3rVDpmEFuzuS4Y6fCDMQcsd5fp` / `dcabe46...`.
- EXTERNAL BOUNDARY → Vercel connector exposes no promote mutation; local PC01 is offline. Do not claim production promotion or Phase-F recovery proof.
- NEXT → consume fresh exact-head CI/Phase-F for `b8a19ec...`; first reproduced current-SHA failure only. When the only remaining Phase-F blocker is production identity, use the supported production-promotion path only after target/recovery authorization is satisfied.
- DO NOT REPEAT → no stale PASS transfer, no production-SHA bypass, no historical migration rewrite, no direct staging SQL used as release proof.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / TENANT-RESOLVER LINEAGE CONTRACT REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `92a32692497234841d942e5548465d54f3ff017e`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `4558397568c844ea934bbc46697cdc6e3cd793c9`.
- DONE: fixed `check-tenant-resolver-lineage.mjs`, which incorrectly required the historical `count(*), min(company_id)` UUID aggregation. The contract now proves the intended fail-closed resolver semantics: count active/default memberships, require exactly one, then bounded-select its UUID.
- PRIOR EXACT EVIDENCE: Quality SUCCESS, Storage Tenant Runtime E2E SUCCESS, Execution Enforcement SUCCESS, Full Product Browser E2E SUCCESS on `4558397...`. Final Certification exposed the lineage-contract defect.
- NEXT: consume the stable exact-head workflow set for `92a3269...`; repair only the first new reproduced defect. Phase-F remains the release boundary.
- DO NOT REPEAT: do not reintroduce UUID min aggregation, do not weaken ambiguity protection, do not transfer stale evidence, do not rewrite applied migrations.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / TENANT-RESOLVER CONTRACT REGEX REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `817b9298b08677ea87a0a8deeaaeee4e3e976431`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `f23d6f730c535ce858dec42cbf155c93a32205ab`.
- DONE: fixed the next real Final Certification contract failure in `check-tenant-security-contract.mjs`: schema-qualified `public.company_memberships` is now accepted by the bounded tenant SELECT guard without relaxing tenant or security invariants.
- PRIOR EXACT EVIDENCE: Storage Tenant Runtime E2E SUCCESS, Full Product Browser E2E SUCCESS, and Execution Enforcement SUCCESS on the previous stable governed head; Final Certification then exposed the regex defect.
- NEXT: consume the stable exact-head workflow set for `817b9298...`; repair only the first new current-SHA defect; Phase-F remains the release boundary.
- DO NOT REPEAT: no weakening of tenant invariants, no historical migration rewrite, no stale PASS transfer, no branch mutation after the final governance sync.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / TENANT-CONTRACT REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `ec1006f555a17a9c02492e29839c285c7214282e`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `ec1006f555a17a9c02492e29839c285c7214282e`.
- DONE: repaired `current_company_id()` with an incremental UUID-safe resolver migration and verified the live staging function; Storage Tenant Runtime E2E is SUCCESS and Full Product Browser E2E is SUCCESS on the prior exact code candidate.
- DONE: corrected `check-tenant-security-contract.mjs` so tenant schema evidence is validated across the full migration chain, while resolver-specific invariants remain bound to the latest resolver definition.
- EXACT CURRENT FAILURE: Quality run `36158568461` failed only at routing/security discovery because the checker incorrectly required `ALTER TABLE company_memberships` in the latest resolver migration. This code-contract defect is fixed at `ec1006f...`; the failure is not transferred as a runtime defect.
- NEXT: consume fresh exact-head workflows for `ec1006f...`; then Phase-F live resilience and final certification. Repair only the first reproduced current-SHA failure.
- DO NOT REPEAT: no stale PASS transfer, no SHA/production bypass, no historical migration rewrite, no weakening of tenant invariants, no direct SQL substituted for source lineage.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / UUID-RESOLVER REPAIR

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE WRITE: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `34f77c248de5bcdb77c77f7fd1a016559c1fd1c5`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `34f77c248de5bcdb77c77f7fd1a016559c1fd1c5`.
- DONE: reproduced and fixed the first exact-head Storage/tenant runtime failure: `current_company_id()` used PostgreSQL `min(uuid)`. Added incremental migration `20260925154500_repair_current_company_id_uuid_resolver.sql` without rewriting historical migrations.
- LIVE STAGING REPAIR: the same UUID-safe resolver was applied to `Report-Advisor-P0-2-Staging` (`fnqbvfuwbdpwvhcgzksl`) for immediate runtime proof; source lineage remains the new migration.
- EXACT-HEAD CI: Quality, browser, storage, certification, enforcement and Phase-F workflows launched for `34f77c2...`; certification first failed only because this index still pointed at `a35e5a...`. This write rebinds the governance candidate exactly.
- NEXT: consume fresh exact-head CI results; then Phase-F live resilience. Repair only the first reproduced current-SHA failure.
- DO NOT REPEAT: no stale evidence transfer, no production/SHA bypass, no rewriting applied migration history, no credential bypass.

---

# CURRENT EXECUTION BOUNDARY — 2026-09-25 / PHASE-F RESTORE CANDIDATE

- MAIN HEAD OBSERVED BEFORE THIS GOVERNANCE REBIND: `9c4e5f03a53ae211d5ed00077c2fd43a339a7db2`.
- CURRENT CODE/TEST CANDIDATE: `a35e5a08884040a6ad983b24a7820f834ebdb1b9`.
- CURRENT GOVERNANCE HEAD: `a35e5a08884040a6ad983b24a7820f834ebdb1b9`.
- DONE: Phase-F restore chain fixed through the generic tenant-reference helper, dashboard UUID→text fallback, import progress RPC default preservation, watched provenance composite-uniqueness prerequisite, and exact-head certification guard normalization.
- EXACT PHASE-F HEAD: next run executes against `a35e5a08884040a6ad983b24a7820f834ebdb1b9`; prior source probe failure was Docker bridge IPv6/network-unreachable, not database or credential failure.
- CERTIFICATION STATE: index is now explicitly bound to the current execution head; no historical PASS is transferred.
- NEXT: consume Phase-F live restore result, then current-head Final Certification/Enforcement/Browser evidence.
- DO NOT REPEAT: no stale candidate transfer, no SHA bypass, no production bypass.

---

# CURRENT CONTROL-PLANE BOUNDARY — 2026-09-25 / EXACT CANDIDATE DDD

> Exact-head routing header. The code candidate is the tested source SHA; the governance commit that follows must not be mistaken for the code candidate.

- MAIN HEAD OBSERVED BEFORE THIS WRITE: `7159553fcfc9d21304ffff60e1086a34b714ac09`.
- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- CURRENT GOVERNANCE HEAD BEFORE THIS WRITE: `ddd9382f347cc02eb401fee75a9df48beaae7f05`.
- DONE: terminal-approval concurrency migration reference fixed at `647f3c...`; live Phase-F then exposed a real restore defect in `20260828172000_runtime_lifecycle_idempotency_hardening.sql`, now corrected to fully-qualified RLS target columns.
- EXACT LOCAL PROOF: migration schema audit PASS (254 migrations / 0 findings), decision/intelligence closure PASS, TypeScript PASS, Vite build PASS, route/sidebar parity PASS, Product WOW/Executive/Intelligence/Report UI contracts PASS.
- EXACT CLOUD BASELINE: Quality/Final Certification/Execution Enforcement/Full Product Browser E2E succeeded on governed head `d5c618a9...`; no PASS is transferred to `ddd9382f...`.
- PHASE-F FAILURE `36092211529`: target `staging`; canary PASS; deployment identity failed because production currently serves `7be9f014...` instead of exact head; logical restore failed on the unqualified action-receipt RLS policy; rollback drill returned 503.
- PRODUCTION IDENTITY NOW OBSERVED: Vercel production deployment `dpl_F4nkx3kwgxgncjre1Mo34sfp8448` / SHA `7be9f01491384e641f32b31b2753c46fd32f7128`; GitHub main is 12 commits ahead. No current-head production proof.
- NEXT CORE FRONT: consume fresh exact-head gates on `ddd9382f...`; then rerun Phase-F. If deployment identity remains the only live blocker after the restore fix, promote the certified release through the normal main/Vercel path rather than bypassing the SHA guard.
- NEXT UI FRONT: consume fresh exact-head browser/device-independent evidence; only alter UI on a reproduced current-head gap.
- DO NOT REPEAT: no stale PASS transfer, no SHA bypass, no credential bypass, no migration deletion without dependency proof.

# CURRENT CONTROL-PLANE BOUNDARY — 2026-09-22

> HEAD below is the exact GitHub HEAD observed before this write. Never treat it as the SHA of this file's own future commit.

- MAIN HEAD OBSERVED BEFORE THIS WRITE: `a024f263c90c5da9bc65a15482f95b3ab03b0d3b`
- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`
- CURRENT WORKING STATE: current main reconciled to exact candidate; certification-boundary governance rebind pending; Phase-F remains fail-closed; UI/core 50/50 execution remains mandatory.
- LIVE STATE SOURCE: ONE-PROGRAMMER-SESSION-MEMORY.md
- CONTROL PLANE: docs/SYSTEM_HEART.md
- KNOWLEDGE CONSOLIDATION MAP: docs/PROJECT_KNOWLEDGE_MANIFEST.md
- NEXT EXECUTION MODE: 50% UI/surface completion + 50% product-heart/runtime/data/security/certification/consolidation, parallel when independent.
- NON-NEGOTIABLE: reconcile exact GitHub HEAD before every session.
- CURRENT CONSOLIDATION STATUS: CONTROL_PLANE_ESTABLISHED / CONTENT_MIGRATION_PENDING.
- NEXT EXECUTABLE CORE FRONT: consume fresh Enforcement + Final Certification after this candidate rebind; continue Phase-F only after authorized valid live resilience configuration.


> HEAD below is the exact GitHub HEAD observed before the current control-plane write. Never treat it as the SHA of this file's own future commit.

- MAIN HEAD OBSERVED BEFORE THIS WRITE: 9e1586ddecec31dd29ca9385d88236adb2307d90
- CURRENT CODE/TEST CANDIDATE: 28691df0781b101ddf053425d5d6eddee999438a
- CURRENT WORKING STATE: canonical knowledge control plane established; content migration remains active; UI 50% + core 50% execution remains mandatory.
- LIVE STATE SOURCE: ONE-PROGRAMMER-SESSION-MEMORY.md
- CONTROL PLANE: docs/SYSTEM_HEART.md
- KNOWLEDGE CONSOLIDATION MAP: docs/PROJECT_KNOWLEDGE_MANIFEST.md
- NEXT EXECUTION MODE: 50% UI/surface completion + 50% product-heart/runtime/data/security/certification/consolidation, parallel when independent.
- NON-NEGOTIABLE: reconcile the exact GitHub HEAD before every session. Do not resume from a historical phase because an old entry below names it.
- CURRENT CONSOLIDATION STATUS: CONTROL_PLANE_ESTABLISHED / CONTENT_MIGRATION_PENDING.
- NEXT EXECUTABLE CONSOLIDATION FRONT: continue remaining source-family absorption into the canonical domain masters, verify references/dependencies and affected contracts, then gate archive/remove separately.

> This header is authoritative for session-resume routing. Historical entries below remain evidence/history and must not override it.

- MAIN HEAD: ec7db7e503af15af42045df1107a3eb5dc8e27db
- CURRENT CODE/TEST CANDIDATE: 28691df0781b101ddf053425d5d6eddee999438a
- CURRENT WORKING STATE: governance/control-plane consolidation is active; the latest main commits after the tested code candidate are documentation/governance changes.
- LIVE STATE SOURCE: ONE-PROGRAMMER-SESSION-MEMORY.md
- CONTROL PLANE: docs/SYSTEM_HEART.md
- KNOWLEDGE CONSOLIDATION MAP: docs/PROJECT_KNOWLEDGE_MANIFEST.md
- UI MASTER: docs/MASTER_UI_UX_REFERENCE.md
- ENGINEERING MASTER: docs/MASTER_ENGINEERING_ARCHITECTURE.md
- DATA/SECURITY MASTER: docs/MASTER_DATA_TRUTH_SECURITY.md
- RUNTIME/CERTIFICATION MASTER: docs/MASTER_RUNTIME_CERTIFICATION.md
- COMMERCIAL MASTER: docs/MASTER_COMMERCIAL_REFERENCE.md
- NEXT EXECUTION MODE: 50% UI/surface completion + 50% product-heart/runtime/data/security/certification/consolidation, in parallel when independent.
- NON-NEGOTIABLE: reconcile the exact GitHub HEAD before every session. Do not resume from a historical phase because an old entry below names it.
- CURRENT CONSOLIDATION STATUS: control plane established; content absorption is the next documentation front. No legacy document is yet approved for deletion solely because of duplication.

## CURRENT EXECUTION BOUNDARY — 2026-09-22 / WAVE 102 — UNIFIED IMPORT HISTORY CLOSURE

> Exact-head evidence only. The current code/test candidate is the exact SHA where the Import Center contract, bounded history focus, DataTable pagination, and Browser E2E were freshly proven.

- CURRENT MAIN HEAD OBSERVED: `28691df0781b101ddf053425d5d6eddee999438a`.
- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DONE: fixed `scripts/check-import-center-product-contract.mjs` so `missingDataTable` is initialized before validation; the previously masked contract defect is now exposed rather than hidden.
- DONE: restored real bounded pagination controls in `src/components/ui/DataTable.tsx`; the component now provides previous/next navigation and explicit Arabic table-navigation semantics.
- DONE: preserved bounded import-history reads while adding an exact `focusJobId` readback path in canonical `fetchImportRecords`.
- DONE: `queries-compat.ts` now forwards `fetchImportRecords` to the canonical implementation instead of owning a duplicate implementation.
- DONE: Browser E2E trigger now explicitly covers `src/components/ui/DataTable.tsx`.
- EXACT-HEAD LOCAL PROOF: Import Center product contract PASS; TypeScript typecheck PASS; Execution Enforcement protocol PASS on `28691df...`.
- EXACT-HEAD QUALITY: GitHub Actions Quality run `35778954134` / job `106919207242` completed SUCCESS with all 63 release-readiness steps successful, including lint, build, performance budget, tenant RLS, import contracts, and intelligence/production contracts.
- EXACT-CODE BROWSER PROOF: Full Product Browser E2E run `35778953810` / job `106919205127` completed SUCCESS on exact `28691df...`; authenticated real-business persistence reached authoritative import completion and canonical persistence, and the prior history readback timeout did not recur.
- CURRENT GOVERNANCE REBIND REQUIRED: Execution Enforcement run `35778953651` and Final Certification run `35778953731` on `28691df...` failed only because the Master Index still pointed to `772afb548f6c381e2e3c6596a57d108ce6d2eebf`; no new product/runtime failure was reproduced there.
- PHASE-F BLOCKER: `RESILIENCE_LOGICAL_SOURCE_DB_URL` remains invalid/stale; live backup/restore, measured RPO/RTO, and rollback remain NOT PROVEN. Do not invent or guess the credential.
- HOSTING BLOCKER: connected Vercel production's newest observed production deployment is commit `84db430a0cde48963d7ff9045342bc31dc2d6063`; no current-candidate Production deployment exists for `28691df...`, so current-head production proof remains NOT PROVEN.
- OPEN OPERATIONAL DEBT: 151 `import_jobs` remain in `processing` at progress 0; no unsafe terminalization or deletion was performed.
- PRECISE NEXT ACTION: consume fresh Enforcement + Final Certification evidence after this index rebind, then continue Phase-F only after an authorized valid resilience source credential is available.
- DO NOT REPEAT: do not weaken the certification boundary or browser assertions; do not transfer production evidence from `84db430...` to `28691df...`; do not rerun Phase-F with the unchanged invalid credential; do not mutate the 151 stale jobs without a governed recovery contract.

## CURRENT EXECUTION BOUNDARY — 2026-09-22 / WAVE 91 — EXACT-HEAD CANDIDATE REBIND
- CURRENT_CODE_TEST_CANDIDATE: `fc0a84d85e56f43112df7e07886a9f6c04089998`.
- CURRENT GOVERNANCE HEAD: `f1c7685344da1cd202819b74e871c13e379170e7`.
- REASON: the current source candidate is the exact SHA where the unified document import regression was fixed and source/build contracts were freshly verified. Later commits are governance-only memory records.
- VERIFIED: Product WOW UI contract PASS; connections/language contract PASS; Vite production build PASS; unified decision/evidence/action/learning/runtime contracts PASS.
- PRECISE NEXT ACTION: consume fresh Phase-F and Final Certification evidence against the exact candidate lineage; repair only a reproduced current-SHA failure.
- DO NOT REPEAT: do not weaken certification boundary; do not transfer historical certification; do not create parallel import/document paths.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 65 — EXACT-HEAD CERTIFICATION REBIND

> Exact-head evidence only. No historical runtime result is transferred.

- CURRENT_CODE_TEST_CANDIDATE: `30cf5d6ecf5a91e65642a38df31087498f4e356c`.
- CURRENT GOVERNANCE HEAD: `30cf5d6ecf5a91e65642a38df31087498f4e356c`.
- DONE: Work Center explicitly labels the 500-row read as a bounded display window and no longer presents `rows.length` as `إجمالي السجل`.
- DONE: UI contract guards the bounded semantics.
- VERIFIED: source re-read on exact SHA; Supabase history index remains present; staging currently has `import_jobs=4477`; `backup_verification_runs=0`.
- VERIFIED: fresh exact-head verification has been triggered for `30cf5d6...`; predecessor quality failure was the Dashboard hook-order defect, now repaired.
- ROOT CAUSE CLOSED: certification parsing selected historical `84a62...` because the current boundary used the non-canonical `CURRENT CODE/TEST HEAD` wording.
- NETLIFY: READY production deploy is on old commit `21f6562...`; not current-head evidence.
- PHASE-F: canonical workflow remains fail-closed until the required live resilience configuration is actually provisioned.
- PRECISE NEXT ACTION: consume fresh Final Certification Gate + Execution Enforcement Contract on `30cf5d6...`, then continue Phase-F backup/restore/RPO/RTO/rollback evidence.
- DO NOT REPEAT: do not transfer historical PASS, do not mislabel bounded history, do not use old Netlify deploy as current, do not invent Phase-F configuration.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 63 — DASHBOARD UI + EXACT-HEAD PROOF OPEN

> Exact-head evidence only. No historical runtime result is transferred.

- CURRENT CODE/TEST HEAD: `476c4bb827c3a2d485726af6b2e5d3e5391ff33a`.
- DONE: Dashboard next action is now derived from live truth/decision state and rendered in both the decision brief and NEXT ACTION surface.
- DONE: Product WOW UI contract guards the new derivation and canonical route/rationale binding.
- VERIFIED: Supabase staging still exposes `idx_import_jobs_company_created_id`; `backup_verification_runs=0`; `import_jobs=4477`.
- NOT VERIFIED: fresh CI/build/browser runtime for `476c4bb...`; no PASS transferred from `84a62...`.
- PHASE-F: canonical workflow remains fail-closed until live resilience configuration is actually provisioned; required configuration includes `RESILIENCE_MAX_RPO_SECONDS` and backup/restore runtime target/credentials. No values invented.
- PRECISE NEXT ACTION: consume or trigger the first fresh exact-head verification path for `476c4bb...`, while closing the external Phase-F configuration gate through the existing workflow.
- DO NOT REPEAT: do not transfer historical browser/certification evidence; do not recreate import paths; do not weaken the Phase-F fail-closed guard.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 62 FINAL — RUNTIME PASS + PHASE-F EXTERNAL BLOCKER

> Exact-head evidence only. No historical production runtime result is transferred.

- CURRENT CERTIFIED MAIN BASELINE: `5367346e2837a06a4d1787bb016399245f213792`.
- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DATABASE FIX VERIFIED: migration `20260921194500_import_history_recent_window_index.sql` was committed and applied to Supabase staging; `idx_import_jobs_company_created_id` exists.
- EXACT-HEAD BROWSER RESULT: Full Product Browser E2E for `84a62...` completed **SUCCESS**. Build, exact checkout, app start, authenticated E2E contract, full product browser E2E, KPI evidence persistence, and real-business browser evidence completed without failure.
- ROOT CAUSE CLOSED: the real-business E2E timeout was an import-history scale/performance boundary on a tenant with 4,471 import jobs; the bounded query lacked its matching composite index.
- REPOSITORY CI ON MAIN BASELINE: quality, Final Certification Gate, Execution Enforcement Contract, Final Execution Batch, and Storage Tenant Isolation all PASS.
- PHASE-F RESULT: governed same-repo PR #611 executed the real Phase-F workflow. Checkout, local operational resilience, static resilience contracts, continuous trust, and authenticated canary session all PASS. Live resilience probes fail-closed with `PHASE_F_STATUS=BLOCKED EXTERNAL` because required live resilience configuration is not provisioned; at minimum `RESILIENCE_MAX_RPO_SECONDS` and backup/restore runtime credentials/config are absent.
- SUPABASE PROJECT STATE: `ACTIVE_HEALTHY`; database host is `db.fnqbvfuwbdpwvhcgzksl.supabase.co`. This does not substitute for restore/RPO/RTO evidence.
- VERCEL: current production build status remains blocked by `build-rate-limit`; no current-head Vercel production PASS is claimed.
- PRECISE NEXT ACTION: provision the missing Phase-F live resilience configuration in the GitHub execution environment, rerun Phase-F, and consume real backup/restore + RPO/RTO + rollback evidence. Then continue worker/server-boundary → tenant A/B → server OCR → watched-folder runtime → final production certification.
- DO NOT REPEAT: do not treat local/source resilience contracts as RPO/RTO proof; do not transfer browser PASS to old Vercel deployments; do not invent missing secret values; do not merge the closed probe branch.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 61 — IMPORT HISTORY DATABASE PERFORMANCE

> Exact-head evidence only. No historical runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- ROOT CAUSE CONFIRMED: `import_jobs` had no composite index for the exact bounded history order/filter `company_id, created_at DESC, id ASC`; the affected tenant had 4,471 import jobs.
- FIX APPLIED: migration `20260921194500_import_history_recent_window_index.sql` creates `idx_import_jobs_company_created_id`.
- DB PROOF: Supabase staging now exposes that index in `pg_indexes`.
- UI/query FIX from Wave 60 remains: bounded recent history read without global exact count.
- PRECISE NEXT ACTION: exact-head Browser E2E on `84a62...`, with emphasis on unified import history readback; then consume quality/certification and continue Phase-F/RPO-RTO.
- DO NOT REPEAT: do not restore global count rejection; do not remove the composite history index; do not transfer f6d6 browser evidence to 84a62.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 60 — IMPORT HISTORY SCALE CLOSURE

> Exact-head evidence only. No historical runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- ROOT CAUSE CLOSED: `fetchImportRecords()` rejected any tenant with more than 500 import rows because it requested `count: 'exact'` and converted `count > 500` into `REPORT_QUERY_LIMIT_EXCEEDED`.
- LIVE E2E OBSERVATION: the affected tenant had 4,471 import jobs; the newly imported customer job itself completed successfully with one canonical row and provenance. The UI history failed only when rendering the bounded history because the read function rejected the large total count.
- FIX: canonical and compatibility import-history reads now use only the existing bounded latest-500 window; no global count query, no unbounded tenant read, no new RPC, and no new import route.
- UI: the import history header explicitly states that it shows the latest 500 while older records remain stored.
- NEXT: fresh exact-head quality, certification, final execution, storage, and browser E2E on `f6d6...`; then re-check real business persistence and continue Phase-F/RPO-RTO.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 58 FINAL — CERTIFIED UI CLOSURE, RUNTIME BLOCKER

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- GOVERNED MAIN DESCENDANT CERTIFIED: `2b9d28c9a1a8fa12677c03f11b7ba94e2a3dbac7` (documentation/governance descendants only).
- CI PASS: quality, Execution Enforcement Contract, Final Execution Batch, Storage Tenant Isolation, Final Certification Gate.
- UI DONE: Connections source status and next action are state-derived and guarded.
- RUNTIME BOUNDARY: current main has Vercel `failure / build-rate-limit` and Vercel deployment `pending`; no live/browser PASS is claimed.
- BACKUP/RPO-RTO: source-level contracts are PASS, but staging still reports `backup_verification_runs=0`; restore/RPO/RTO runtime proof remains open.
- PRECISE NEXT ACTION: obtain a real exact-head deployment/browser runtime result for `2b9d28c9...`; then run/consume governed Phase-F backup/restore → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not transfer old Vercel READY deployments, do not call source contracts runtime evidence, do not fabricate E2E secrets or browser sessions, do not bypass Phase-F gates.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 58 — CONNECTIONS STATE-DRIVEN UI

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DONE: Connections summary is now state-derived: proven/bounded/adapter counts and next-source action come from the existing connector array.
- UI CONTRACT: current Product WOW contract guards the new state-derived summary.
- ARCHITECTURE: no new route/RPC/runner/importer/tenant/calculation path.
- PRECISE NEXT ACTION: consume fresh quality/enforcement/final-certification for `cbfb...`; then exact-head runtime/browser, backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore hard-coded connector counts or generic next-source text; do not transfer `9684...` certification evidence to this new SHA.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 57 — CURRENT-SHA UI CONTRACT REPAIR

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DONE: corrected the Work Center UI contract guard so it asserts the actual null-safe `expiredActive` expression used by the current implementation.
- ROOT CAUSE OF THE FRESH CERTIFICATION FAIL: source guard drift, not a product/runtime failure.
- NO ARCHITECTURE CHANGE: only `scripts/check-product-wow-ui-contract.mjs` changed in this correction.
- PRECISE NEXT ACTION: consume fresh quality/enforcement/final-certification runs for `c88abe...`; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore the stale literal assertion; do not weaken the guard to accept both correct and incorrect optional-state implementations; do not transfer certification from `88323...`.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 56 — EXACT-HEAD CERTIFICATION REBIND

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- EXACT-HEAD QUALITY: 20/20 release-readiness stages PASS on this SHA after closing three typecheck defects exposed by the runner.
- CURRENT CERTIFICATION DIAGNOSIS: certification/enforcement gates rejected the run because their index still pointed to `435534c9...` while current code/test was `88323d3f...`.
- CORRECTION IN THIS WAVE: certification index/reference is being rebound to the real current code/test SHA through the existing governance files; no boundary weakening or bypass.
- PASSING INDEPENDENT RUNS ON CURRENT SHA: UI route completeness, storage tenant isolation, and Final Execution Batch.
- CURRENT RUNTIME BOUNDARY: Vercel runtime evidence is still not current-head proof; older READY deployments are not transferred.
- PRECISE NEXT ACTION: consume fresh Execution Enforcement Contract + Final Certification Gate after this rebind; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 55 — WORK CENTER OPERATIONAL ACTIONABILITY

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `src/pages/WorkCenterPage.tsx` at the current main code head; the exact implementation is source-re-read and bound by the product UI contract.
- UI CONTRACT: `scripts/check-product-wow-ui-contract.mjs` now asserts the state-derived next-action branches, canonical import action, filter actions, `aria-pressed`, and `aria-live`.
- DONE: Work Center now turns the live operational state into a concrete next action without inventing runtime state or creating a second workflow.
- EXACT SOURCE VERIFICATION: compare from `b01ae295...` to this candidate contains only `WorkCenterPage.tsx` and `check-product-wow-ui-contract.mjs`.
- CURRENT BUILD/DEPLOY BOUNDARY: Vercel current-head `failure` / `build-rate-limit`; Vercel deployment context `pending`; GitHub Actions exposes no workflow run for the current SHA. No current-head build/browser/runtime PASS is claimed.
- PRECISE STOP POINT: UI/actionability/accessibility closure is implemented and source-guarded; external runtime certification remains the execution boundary.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `435534c9...`; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not transfer older READY deployments; do not treat source guards as runtime certification; do not add parallel import/decision paths; do not use fake sessions or weaken deployment identity checks.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 54 — EXACT-SHA PHASE-F + LIVE SECURITY/DB CLOSURE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- PHASE-F PROBE: `97a52c0772089609ee3a5a5fb346839a3f8c6601`.
- PHASE-F CONTRACT GUARD: `91536018fb02b8918874c28ecedfb8ef7d5e5df3`.
- IMPORT PERFORMANCE MIGRATION: GitHub file `supabase/migrations/20260921182858_20260921183000_import_fk_performance_indexes.sql`; live migration version `20260921182858` / name `20260921183000_import_fk_performance_indexes`.
- LIVE SECURITY MIGRATION: repo migration `20260830061000_close_public_rpc_advisor_gaps`; live version `20260921182639`.
- DONE: Phase-F runtime health is now bound to the exact deployment SHA; two live SECURITY DEFINER exposure gaps were closed using the repository's existing hardening migration; six import-lineage FK indexes were added and the corresponding unindexed-FK advisor finding disappeared.
- EXACT SOURCE/DB VERIFICATION: GitHub source re-read confirms the probe/guard and migration file; Supabase migration history confirms both migrations live; post-change SQL confirms watched-file browser execute is revoked; performance advisor no longer reports unindexed FKs for the lineage path.
- CURRENT BUILD/DEPLOY BOUNDARY: Vercel current-head status is `failure` / `build-rate-limit`; Deployments is `pending`. No current-head build/browser/runtime PASS is claimed.
- NEXT EXECUTABLE ACTION: obtain a fresh exact-head Phase-F/CI/browser result for `2c9b4756...`. The first health probe will now fail closed if `report-advisor.vercel.app` does not serve this exact SHA; once exact runtime is available, close backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not bypass the deployment-SHA check; do not transfer older Vercel READY evidence; do not remove unused indexes without usage evidence; do not blanket-revoke authenticated SECURITY DEFINER functions.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 53 — DECISION TRUTH SEMANTICS

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- DECISION EXPERIENCE: implementation `58f6dd971ce905a3ea5a1f8670101e92c75ddade`; zero expected impact remains semantically valid.
- COMMAND CENTER: implementation `274f813567d111112d850a696035bf4aba604c28`; Money Recovery now reports receivables availability rather than recoverable-money certainty.
- UI CONTRACT: `3ab9e99a41676b22a6b61fe35db7891c7f170eac`.
- EXACT SOURCE VERIFICATION: current DecisionExperience, ExecutiveCommandCenter and UI guard were re-read after write; code changes are limited to the two intended UI semantics plus synchronized governance.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head Vercel `failure` / `build-rate-limit`, with deployment context `pending`; no runtime/browser/build PASS claimed.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `3ab9e99a...`; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not treat zero expected impact as missing; do not label receivables availability as recoverable money; do not transfer older deployments.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 52 — IMPORT HISTORY FAIL-CLOSED + LIVE DB POSTURE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `25c681ad540bacab9b0567d78b74a331ea224849` with initial action commit `e0978b867fbcd4a9a9f70b8d8f3515948dfaa590`.
- UI CONTRACT: `d6aec3aa6285f852043c4b3b7b1bbb364305141b`.
- DONE: Canonical Import history is now fail-closed: backend fetch errors are not represented as empty history; actual empty history has a real source-selection action.
- EXACT SOURCE VERIFICATION: `CanonicalImportPage.tsx` contains `historyError`, retryable `ErrorState`, `onRetry`, and the existing `reset` action; compare from `db047cb4...` is limited to the import UI and its UI guard.
- LIVE DB POSTURE: staging reports 103/103 public tables with RLS enabled; security advisor reports 60 authenticated SECURITY DEFINER findings and one leaked-password-protection warning. Core import/runtime functions were checked for actual product use before any privilege change; no unsafe blanket revoke was applied.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head Vercel is `failure` / `build-rate-limit`; Vercel deployment context is `pending`. No current-head build/browser/runtime PASS is claimed.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `d6aec3aa...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not map history fetch failures to empty state; do not revoke authenticated execute from core RPCs without usage/tenant-boundary proof; do not transfer older deployment evidence.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 51 — INVENTORY EMPTY-STATE GOVERNANCE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `3b7f6e35f69bb53fd56a1714922376d4322ccd1a` (with initial actionable-state commit `976adb2b54ba52af9cadae4b4deb0085bdc539e8`).
- UI CONTRACT: `c90a97aad3c353f031c80cfd0788836b20add1e1`.
- DONE: Inventory empty states are now source-aware and filter-aware, with real next actions and no reload.
- EXACT SOURCE VERIFICATION: current `EntityPages.tsx` confirms `totalRows === 0` for source-empty and explicit `filter` + `filteredRows === 0` for filtered-empty.
- CURRENT BUILD/DEPLOY BOUNDARY: Vercel exact-head status remains `failure` / `build-rate-limit`; no runtime PASS is claimed.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `c90a97aa...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not classify unknown counts as empty; do not transfer older READY deployments; do not recreate import workflows.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 50 — DASHBOARD ANALYTICAL EMPTY STATES

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `42743647d0a94d5fca37dc2308e904fda5b2dc5f`.
- UI CONTRACT: `6ae2c1c5e41c85598d2b7a160b7fe681aa7e7e33`.
- DONE: Dashboard analytical empty states for trend, categories, customers and products now contain context-aware next actions; no values are fabricated.
- EXACT SOURCE VERIFICATION: current DashboardPage.tsx and its UI guard were re-read after commit; compare from `9dd467e...` to this candidate is exactly the two intended files.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head status is Vercel `failure` / `build-rate-limit` plus Vercel Deployments `pending`.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `6ae2c1c5...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore passive dashboard analytical empties; do not transfer older READY deployments; do not use source guards as runtime certification.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 49 — REPORT RETRY RESILIENCE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `1e93d43ae1876fb6af8aba00ce7a3ff79fd18049`.
- UI IMPLEMENTATION: `e6478ad3d7569e1e9cea832dac2e6b02f731ed9f`.
- UI CONTRACT: `7301ae56b7c01723ebdcc78756fc8a1ea5ffe399`.
- DONE: four report pages now retry in place through their existing loaders; full browser reload is removed from report error recovery.
- EXACT SOURCE VERIFICATION: current ReportsPage.tsx contains zero `window.location.reload()` calls; exact compare from previous `69e56486...` head is limited to ReportsPage.tsx and its UI contract guard.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head status is Vercel `failure` / `build-rate-limit` plus Vercel Deployments `pending`.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `7301ae56...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore full-page report retries; do not transfer older READY deployment evidence; do not count source-level verification as runtime PASS.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 48B — DECISION SOURCE ROUTING CORRECTION

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- **CURRENT CODE/TEST CANDIDATE:** `34b2038602f4899a78e6e183087cfe232c02faa8`.
- **UI IMPLEMENTATION:** `42ca66e327ce63fd5353de86d3f8753f12356b55`.
- **UI CONTRACT:** `34b2038602f4899a78e6e183087cfe232c02faa8`.
- **DONE:** decision alerts now send «فحص المصدر أولًا» to the existing Trust & Evidence route instead of returning to the same command screen.

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / IMPORT TYPED-ENTITY FAIL-CLOSED HARDENING

- FUNCTIONAL CURRENT HEAD → PR #662 / `exec/20260927-import-full-lifecycle` / exact HEAD `3a03d4e3e1a6967b0b590253d8ca54d8e720d9d9`.
- ROOT FIX → `src/lib/import/canonical-source-understanding.ts` no longer selects typed canonical entities from a single weak signal. It now requires the exact canonical write-field contract for products/customers/sales; incomplete sources remain `generic:source-data` with a machine-readable missing-fields warning.
- CONTRACT → existing `scripts/check-canonical-import-mapping.mjs` now guards both the fail-closed inference and the required write-field set. No duplicate importer/test/RPC/runner created.
- EXACT-HEAD CI → certification run `36326147880` job `108639175638` and enforcement run `36326147877` job `108639175656` are present for this SHA and currently `queued`; no failure is available yet, so no repair is inferred.
- CURRENT VERCEL → exact-head status remains `failure` / `build-rate-limit`; external blocker only.
- CURRENT DEPLOYMENT PROOF → earlier Cloudflare/Netlify successes remain bound to their exact SHAs and are not transferred to `3a03d4e`.
- GOVERNANCE → PR #663 remains exact head `43a29443477aeb5969b99d672bd2c6698e0f7106`; do not mix its lane with product behavior.
- NEXT → consume the first terminal mandatory gate on `3a03d4e`; if the queues persist, continue only independent repository-safe work, then consume #663.
- DO NOT REPEAT → stale evidence, preview-as-production, duplicate import/navigation/RPC/runner, unsafe import-job mutations, speculative Phase-F changes without new live evidence.

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / IMPORT PER-DATASET TYPED-ENTITY HARDENING

- FUNCTIONAL CURRENT HEAD → PR #662 / `exec/20260927-import-full-lifecycle` / exact HEAD `b081c3f5d8c7ca4879c41f16cada76f0c5c66f00`.
- ROOT FIX → typed canonical inference now requires all canonical write fields on **every dataset**; complementary sheets can no longer collectively satisfy a strict entity contract while individual datasets remain incomplete.
- CONTRACT → existing `scripts/check-canonical-import-mapping.mjs` guards the per-dataset condition. No duplicate test/import/RPC/runner path.
- EXACT-HEAD CI → certification run `36326239773` / job `108639438487` and enforcement run `36326239775` / job `108639438409` are both `queued`; no terminal failure is available.
- VERCEL → exact-head status remains `failure` / `build-rate-limit`; external constraint only.
- DEPLOYMENT/PRODUCTION → no fresh exact-head browser or production/Phase-F PASS; prior deployment evidence remains bound to earlier SHAs.
- UI → canonical import post-upload lifecycle remains complete and existing; Business Replay import-scoping was reviewed and left unchanged because no existing import-filter contract was found.
- GOVERNANCE → PR #663 exact head `43a29443477aeb5969b99d672bd2c6698e0f7106`; governance jobs remain queued.
- NEXT → consume the first terminal mandatory gate on `b081c3f`; repair only reproduced current-SHA failure; otherwise continue independent safe fronts and reconcile governance.
- DO NOT REPEAT → stale evidence, preview-as-production, duplicate import/navigation/RPC/runner, unsafe import-job mutation, speculative replay filtering.

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / FRESH EXACT-HEAD DEPLOYMENT READBACK

- FUNCTIONAL CURRENT HEAD → PR #662 / `exec/20260927-import-full-lifecycle` / `b081c3f5d8c7ca4879c41f16cada76f0c5c66f00`.
- NETLIFY EXACT-HEAD → deploy-preview SUCCESS; `https://deploy-preview-662--aghbari-report-advisor.netlify.app`.
- CLOUDFLARE EXACT-HEAD → SUCCESS; `https://3a4e8985.report-advisor.pages.dev`.
- READBACK → exact Netlify preview renders the real Arabic الأغبري identity/company isolation gate, Evidence-first product positioning, and explicitly no demo workspace. Deployment/readback proof only; authenticated browser E2E remains unproven.
- MANDATORY CI → certification-contracts `36326239773` / job `108639438409` and enforcement-contract `36326239775` / job `108639438487` remain QUEUED.
- VERCEL → exact-head failure / build-rate-limit; external hosting blocker.
- CORE → per-dataset typed canonical inference hardening is on the current functional branch and protected by the existing import contract.
- NEXT → consume the first terminal mandatory gate; do not transfer this deployment proof to production or to another SHA.

# CURRENT EXECUTION BOUNDARY — 2026-09-27 / PRODUCTION SHA MISMATCH READBACK

- FUNCTIONAL CANDIDATE → PR #662 / `b081c3f5d8c7ca4879c41f16cada76f0c5c66f00`.
- EXACT PREVIEW PROOF → Netlify SUCCESS + Cloudflare SUCCESS on `b081c3f`.
- VERCEL PRODUCTION → READY deployment `dpl_2mYGpzpzdgQdJsEJFy6FzKHaWFja` aliases `report-advisor.vercel.app` but is bound to main SHA `47502385cd999d1151360e30f47855360659b055`, not `b081c3f`.
- RELEASE IMPLICATION → functional production exact-SHA identity is NOT PROVEN. Do not use the current READY production deployment as evidence for the functional candidate.
- MANDATORY CI → certification `36326239773` / job `108639438409` and enforcement `36326239775` / job `108639438487` remain queued.
- GOVERNANCE → broad-push coverage remains intentional per `check-ci-execution-topology.mjs`; no queue-clearing trigger weakening was introduced.
- NEXT → first terminal mandatory gate on `b081c3f`, then authorized release identity/Phase-F path. No production SHA bypass.