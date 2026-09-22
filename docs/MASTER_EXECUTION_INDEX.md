## CURRENT EXECUTION BOUNDARY — 2026-09-22 / WAVE 99 — IMPORT HISTORY DENSITY FIX PENDING EXACT-HEAD PROOF

> Exact-head evidence only. The current code candidate changed and must be re-proven; no historical PASS is transferred.

- CURRENT MAIN HEAD OBSERVED: `3be8c89b9181a300419f98132cd2ee59ec113669`.
- CURRENT CODE/TEST CANDIDATE: `3be8c89b9181a300419f98132cd2ee59ec113669`.
- LAST VERIFIED PRODUCT CODE BEFORE THIS FIX: `fc0a84d85e56f43112df7e07886a9f6c04089998`.
- CURRENT PRODUCT FIX: Canonical import history now uses real table pagination (50 visible rows per page) instead of rendering the full 500-row history window into the DOM.
- ROOT CAUSE ADDRESSED: real-business browser E2E persisted the new canonical import successfully, but timed out waiting for the new filename in the rendered import history; the database row itself was completed with canonical persistence.
- CURRENT VERIFICATION STATE: pending exact-head Quality / Browser / Certification consumption for `9a71cccc53c0e01b55e7fcac8f5ca1829bf30aac`.
- PHASE-F BLOCKER: `RESILIENCE_LOGICAL_SOURCE_DB_URL` remains invalid/stale; live backup/restore and measured RPO/RTO/rollback remain NOT PROVEN.
- HOSTING BLOCKER: Vercel free-plan deployment-rate limit remains external; Netlify preview capability exists but exact production deployment ownership is not connected in the active deployment connector.
- DO NOT REPEAT: do not lower the E2E timeout to hide the UI defect; do not transfer the d692 browser failure or any older PASS to `9a71cccc53c0e01b55e7fcac8f5ca1829bf30aac`; do not render all 500 history rows as a workaround; do not fabricate Phase-F resilience evidence.

## CURRENT EXECUTION BOUNDARY — 2026-09-22 / WAVE 97 — EXACT MAIN + CURRENT-SHA ENFORCEMENT REPAIR

> Exact-head evidence only. GitHub main is authoritative; no historical runtime result is transferred.

- CURRENT MAIN HEAD: `909d8be6b066083d05b1f9952cee460ee273f839`.
- CURRENT CODE/TEST CANDIDATE: `fc0a84d85e56f43112df7e07886a9f6c04089998`.
- CURRENT_CODE_TEST_CANDIDATE: `fc0a84d85e56f43112df7e07886a9f6c04089998`.
- CURRENT PRODUCT/CODE TESTED LINEAGE: no product-code change was introduced by Wave 96/97 governance write-backs; the current tested functional lineage remains `fc0a84d85e56f43112df7e07886a9f6c04089998`.
- EXACT PHASE-F VERIFICATION HEAD: `d032fe5d99080e4ffb1f58021deca07d7c72a243` on `verify/phasef-rpo-20260922`.
- VERIFIED: Final Certification Gate PASS; Device-Independent Browser E2E PASS; Quality 63/63 PASS; production regression PASS; tenant canary PASS on the exact verification head.
- VERIFIED: `RESILIENCE_MAX_RPO_SECONDS=3600` is accepted by the existing Phase-F workflow.
- BLOCKED: live backup/restore fails PostgreSQL password authentication against the configured Supabase Session Pooler source; measured restore/RPO/RTO and rollback therefore remain NOT PROVEN.
- BLOCKER: `RESILIENCE_LOGICAL_SOURCE_DB_URL` is invalid/stale. No credential was guessed or synthesized.
- CURRENT ACTION: replace that authorized credential, rerun the existing Phase-F path, consume real backup/restore + measured RPO/RTO + rollback artifacts, then merge governed restore-path hardening only after the complete gate passes.
- DO NOT REPEAT: do not rerun against the unchanged invalid credential; do not transfer verification-branch PASS to main; do not weaken the production-SHA boundary; do not invent resilience evidence or create a parallel recovery path.

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
- CURRENT CODE/TEST CANDIDATE: `84a62e169ce8db61d2dc6598e654127543ecdabb`.
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

- CURRENT CODE/TEST CANDIDATE: `84a62e169ce8db61d2dc6598e654127543ecdabb`.
- ROOT CAUSE CONFIRMED: `import_jobs` had no composite index for the exact bounded history order/filter `company_id, created_at DESC, id ASC`; the affected tenant had 4,471 import jobs.
- FIX APPLIED: migration `20260921194500_import_history_recent_window_index.sql` creates `idx_import_jobs_company_created_id`.
- DB PROOF: Supabase staging now exposes that index in `pg_indexes`.
- UI/query FIX from Wave 60 remains: bounded recent history read without global exact count.
- PRECISE NEXT ACTION: exact-head Browser E2E on `84a62...`, with emphasis on unified import history readback; then consume quality/certification and continue Phase-F/RPO-RTO.
- DO NOT REPEAT: do not restore global count rejection; do not remove the composite history index; do not transfer f6d6 browser evidence to 84a62.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 60 — IMPORT HISTORY SCALE CLOSURE

> Exact-head evidence only. No historical runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `f6d6e64b5da8411ec7bcc49fe912a0af04db86aa`.
- ROOT CAUSE CLOSED: `fetchImportRecords()` rejected any tenant with more than 500 import rows because it requested `count: 'exact'` and converted `count > 500` into `REPORT_QUERY_LIMIT_EXCEEDED`.
- LIVE E2E OBSERVATION: the affected tenant had 4,471 import jobs; the newly imported customer job itself completed successfully with one canonical row and provenance. The UI history failed only when rendering the bounded history because the read function rejected the large total count.
- FIX: canonical and compatibility import-history reads now use only the existing bounded latest-500 window; no global count query, no unbounded tenant read, no new RPC, and no new import route.
- UI: the import history header explicitly states that it shows the latest 500 while older records remain stored.
- NEXT: fresh exact-head quality, certification, final execution, storage, and browser E2E on `f6d6...`; then re-check real business persistence and continue Phase-F/RPO-RTO.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 58 FINAL — CERTIFIED UI CLOSURE, RUNTIME BLOCKER

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `cbfb7d0906e893ac32e274b571519d6f536ff8ad`.
- GOVERNED MAIN DESCENDANT CERTIFIED: `2b9d28c9a1a8fa12677c03f11b7ba94e2a3dbac7` (documentation/governance descendants only).
- CI PASS: quality, Execution Enforcement Contract, Final Execution Batch, Storage Tenant Isolation, Final Certification Gate.
- UI DONE: Connections source status and next action are state-derived and guarded.
- RUNTIME BOUNDARY: current main has Vercel `failure / build-rate-limit` and Vercel deployment `pending`; no live/browser PASS is claimed.
- BACKUP/RPO-RTO: source-level contracts are PASS, but staging still reports `backup_verification_runs=0`; restore/RPO/RTO runtime proof remains open.
- PRECISE NEXT ACTION: obtain a real exact-head deployment/browser runtime result for `2b9d28c9...`; then run/consume governed Phase-F backup/restore → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not transfer old Vercel READY deployments, do not call source contracts runtime evidence, do not fabricate E2E secrets or browser sessions, do not bypass Phase-F gates.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 58 — CONNECTIONS STATE-DRIVEN UI

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `cbfb7d0906e893ac32e274b571519d6f536ff8ad`.
- DONE: Connections summary is now state-derived: proven/bounded/adapter counts and next-source action come from the existing connector array.
- UI CONTRACT: current Product WOW contract guards the new state-derived summary.
- ARCHITECTURE: no new route/RPC/runner/importer/tenant/calculation path.
- PRECISE NEXT ACTION: consume fresh quality/enforcement/final-certification for `cbfb...`; then exact-head runtime/browser, backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore hard-coded connector counts or generic next-source text; do not transfer `9684...` certification evidence to this new SHA.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 57 — CURRENT-SHA UI CONTRACT REPAIR

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `c88abe725b066d8bbeb80de629be6198791d1523`.
- DONE: corrected the Work Center UI contract guard so it asserts the actual null-safe `expiredActive` expression used by the current implementation.
- ROOT CAUSE OF THE FRESH CERTIFICATION FAIL: source guard drift, not a product/runtime failure.
- NO ARCHITECTURE CHANGE: only `scripts/check-product-wow-ui-contract.mjs` changed in this correction.
- PRECISE NEXT ACTION: consume fresh quality/enforcement/final-certification runs for `c88abe...`; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore the stale literal assertion; do not weaken the guard to accept both correct and incorrect optional-state implementations; do not transfer certification from `88323...`.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 56 — EXACT-HEAD CERTIFICATION REBIND

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `88323d3fd8d5cc6cb8acca8e53894a11d72cb83e`.
- EXACT-HEAD QUALITY: 20/20 release-readiness stages PASS on this SHA after closing three typecheck defects exposed by the runner.
- CURRENT CERTIFICATION DIAGNOSIS: certification/enforcement gates rejected the run because their index still pointed to `435534c9...` while current code/test was `88323d3f...`.
- CORRECTION IN THIS WAVE: certification index/reference is being rebound to the real current code/test SHA through the existing governance files; no boundary weakening or bypass.
- PASSING INDEPENDENT RUNS ON CURRENT SHA: UI route completeness, storage tenant isolation, and Final Execution Batch.
- CURRENT RUNTIME BOUNDARY: Vercel runtime evidence is still not current-head proof; older READY deployments are not transferred.
- PRECISE NEXT ACTION: consume fresh Execution Enforcement Contract + Final Certification Gate after this rebind; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 55 — WORK CENTER OPERATIONAL ACTIONABILITY

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `435534c9652ce30df9e55dc744d469782279c4fd`.
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

- CURRENT CODE/TEST CANDIDATE: `2c9b4756b43e2415fda8b37ea367d02c8570c22f`.
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

- CURRENT CODE/TEST CANDIDATE: `3ab9e99a41676b22a6b61fe35db7891c7f170eac`.
- DECISION EXPERIENCE: implementation `58f6dd971ce905a3ea5a1f8670101e92c75ddade`; zero expected impact remains semantically valid.
- COMMAND CENTER: implementation `274f813567d111112d850a696035bf4aba604c28`; Money Recovery now reports receivables availability rather than recoverable-money certainty.
- UI CONTRACT: `3ab9e99a41676b22a6b61fe35db7891c7f170eac`.
- EXACT SOURCE VERIFICATION: current DecisionExperience, ExecutiveCommandCenter and UI guard were re-read after write; code changes are limited to the two intended UI semantics plus synchronized governance.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head Vercel `failure` / `build-rate-limit`, with deployment context `pending`; no runtime/browser/build PASS claimed.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `3ab9e99a...`; repair only a reproduced current-SHA failure, then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not treat zero expected impact as missing; do not label receivables availability as recoverable money; do not transfer older deployments.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 52 — IMPORT HISTORY FAIL-CLOSED + LIVE DB POSTURE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `d6aec3aa6285f852043c4b3b7b1bbb364305141b`.
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

- CURRENT CODE/TEST CANDIDATE: `c90a97aad3c353f031c80cfd0788836b20add1e1`.
- UI IMPLEMENTATION: `3b7f6e35f69bb53fd56a1714922376d4322ccd1a` (with initial actionable-state commit `976adb2b54ba52af9cadae4b4deb0085bdc539e8`).
- UI CONTRACT: `c90a97aad3c353f031c80cfd0788836b20add1e1`.
- DONE: Inventory empty states are now source-aware and filter-aware, with real next actions and no reload.
- EXACT SOURCE VERIFICATION: current `EntityPages.tsx` confirms `totalRows === 0` for source-empty and explicit `filter` + `filteredRows === 0` for filtered-empty.
- CURRENT BUILD/DEPLOY BOUNDARY: Vercel exact-head status remains `failure` / `build-rate-limit`; no runtime PASS is claimed.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `c90a97aa...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not classify unknown counts as empty; do not transfer older READY deployments; do not recreate import workflows.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 50 — DASHBOARD ANALYTICAL EMPTY STATES

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `6ae2c1c5e41c85598d2b7a160b7fe681aa7e7e33`.
- UI IMPLEMENTATION: `42743647d0a94d5fca37dc2308e904fda5b2dc5f`.
- UI CONTRACT: `6ae2c1c5e41c85598d2b7a160b7fe681aa7e7e33`.
- DONE: Dashboard analytical empty states for trend, categories, customers and products now contain context-aware next actions; no values are fabricated.
- EXACT SOURCE VERIFICATION: current DashboardPage.tsx and its UI guard were re-read after commit; compare from `9dd467e...` to this candidate is exactly the two intended files.
- CURRENT BUILD/DEPLOY BOUNDARY: exact-head status is Vercel `failure` / `build-rate-limit` plus Vercel Deployments `pending`.
- NEXT EXECUTABLE ACTION: fresh exact-head CI/build/Phase-F/browser/certification for `6ae2c1c5...`; repair only a failure reproduced on this SHA. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- DO NOT REPEAT: do not restore passive dashboard analytical empties; do not transfer older READY deployments; do not use source guards as runtime certification.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 49 — REPORT RETRY RESILIENCE

> Exact-head evidence only. No historical deployment/runtime result is transferred.

- CURRENT CODE/TEST CANDIDATE: `7301ae56b7c01723ebdcc78756fc8a1ea5ffe399`.
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
- **EXACT SOURCE VERIFICATION:** changed UI and guard were re-read from GitHub after write.
- **CURRENT BUILD/DEPLOY BOUNDARY:** exact-head Vercel status remains `failure` / `build-rate-limit`, with the Vercel deployment context `pending`; no GitHub Actions run is attached to the current main SHA.
- **NEXT EXECUTABLE ACTION:** fresh exact-head CI/build/Phase-F/browser/certification for `34b2038602...`; repair only a reproduced current-SHA failure. Then backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- **DO NOT REPEAT:** do not transfer READY evidence from older SHAs; do not add parallel decision/import routes; do not treat source-level guards as runtime certification.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 48 — DECISION CENTER + DECISION EXPERIENCE EMPTY-STATE ACTIONS

> Exact-head evidence only. No older deployment/runtime result is transferred.

- **CURRENT CODE/TEST CANDIDATE:** `19efa63103657e60c973ec2d4449d74e05e73025`.
- **DECISION EXPERIENCE:** implementation `f0f50d97b2e77e415b33d268234ae6d4d88883ae`; guard `5e3f84e607744844a68d37db707ee252061cf832`.
- **EXECUTIVE COMMAND CENTER:** implementation `95614f98043a3f3d00f49f92e80693378c06f6`; guard/current head `19efa63103657e60c973ec2d4449d74e05e73025`.
- **DONE:** empty states in both decision surfaces now route to existing canonical next actions; no synthetic fallback was introduced.
- **EXACT SOURCE VERIFICATION:** current GitHub source was re-read after the changes; compare from `4995f5eb...` to `19efa631...` contains only the decision/command-center UI, their UI contract guard, and the already-bound wave-47 governance write-backs.
- **CURRENT BUILD/DEPLOY BOUNDARY:** exact-head combined status is Vercel `failure` (`build-rate-limit`) plus Vercel Deployments `pending`; `fetch_commit_workflow_runs` exposes no workflow run for this main SHA.
- **NEXT EXECUTABLE ACTION:** first fresh exact-head CI/build/Phase-F/browser/certification evidence for `19efa631...`; repair only a failure reproduced on this SHA. If free-plan hosting remains blocked, continue only a materially justified canonical product closure, then return to backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- **DO NOT REPEAT:** do not transfer older READY deployments; do not recreate import routes or decision paths; do not count source inspection as runtime PASS; do not manufacture empty-state data.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 47 — WORK CENTER ACTIONABLE EMPTY STATES

> Exact-head evidence only. No older deployment/runtime result is transferred.

- **CODE/TEST CANDIDATE:** `4995f5eb3b520cc8109d1f7b3c3baa5aa1d60525`.
- **UI IMPLEMENTATION:** `9e7d8b4040aacce163c780bf5c4f353ee6f8b64f` updated `src/pages/WorkCenterPage.tsx`.
- **UI CONTRACT:** `4995f5eb3b520cc8109d1f7b3c3baa5aa1d60525` updated `scripts/check-product-wow-ui-contract.mjs`.
- **DONE:** Work Center now distinguishes a tenant with no recorded operations from a filter with zero matches. Empty tenant state routes to canonical unified import; filtered-empty state restores `all` in place.
- **ARCHITECTURE:** no new route/RPC/runner/import engine/table/tenant-RLS/calculation path.
- **EXACT SOURCE VERIFICATION:** implementation and contract files were re-read after commit; the current diff from `916ef274...` contains the intended Work Center/Data Quality UI and contract changes plus governance write-backs.
- **CURRENT BUILD/DEPLOY BOUNDARY:** GitHub combined status for `4995f5...` reports Vercel `failure` with `build-rate-limit`; Vercel deployment context is pending and no GitHub Actions workflow run is attached. No current-head build/browser/runtime PASS is claimed.
- **ADDITIONAL EXACT EVIDENCE:** a Vercel READY deployment exists for earlier UI SHA `43219c...`; it is not evidence for `4995f5...`.
- **NEXT EXECUTABLE ACTION:** obtain fresh exact-head CI/build/Phase-F/browser/certification for `4995f5...`; repair only failures reproduced there. If hosting remains capacity-blocked, continue independent canonical product/UI closure, then resume backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- **DO NOT REPEAT:** do not transfer `43219c...` runtime PASS; do not recreate canonical import paths/RPCs; do not weaken empty-state truth boundaries; do not use fake sessions or stale PASS evidence.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 46 — DATA QUALITY DECISION ACTION

> Exact-head evidence only. No older deployment/runtime result is transferred.

- **CODE/TEST CANDIDATE:** `c71742d8b70f61ed580791cabf415ad81fd6944a`.
- **UI IMPLEMENTATION:** `43219c1bf39c5cffee5f203fabd1324d01699aab` updated `src/pages/DataQualitySnapshotPage.tsx`.
- **UI CONTRACT:** `c71742d8b70f61ed580791cabf415ad81fd6944a` updated `scripts/check-product-wow-ui-contract.mjs`.
- **DONE:** Data Quality now exposes a state-derived next action and direct canonical routing for EMPTY, critical, non-critical and clean states; summary text no longer contains a generic hardcoded next step.
- **ARCHITECTURE:** no new route/RPC/runner/import engine/table/tenant-RLS/calculation path.
- **EXACT SOURCE VERIFICATION:** both changed files were re-read from GitHub after commit; comparison from starting `916ef274...` to `c71742d...` is exactly two commits and only the two intended files changed.
- **CURRENT BUILD/DEPLOY BOUNDARY:** GitHub combined status for `c71742...` reports Vercel `failure` with `build-rate-limit`; `fetch_commit_workflow_runs` returns no runs for this main commit. No build/browser/runtime PASS is claimed.
- **HOSTING:** the prior `916ef274...` Vercel deployment is READY only for that exact older SHA. Netlify production remains on an older deploy; the connected deploy action cannot execute the source upload without a repository execution environment.
- **WORKSTATION:** PC01 is offline, so local working-tree/build/browser evidence is unavailable.
- **NEXT EXECUTABLE ACTION:** obtain the first fresh exact-head CI/build/Phase-F/browser/certification evidence for `c71742...`; repair only a failure reproduced on this SHA. While hosting/CI capacity is unavailable, continue only independent cloud-safe product/contract closure without weakening gates, then resume backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR → watched-folder → final certification.
- **DO NOT REPEAT:** do not transfer `916ef274...` deployment PASS; do not claim source re-read as build PASS; do not recreate canonical import paths/RPCs; do not use fake authentication or browser budget workarounds.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / WAVE 45 — REPORT SNAPSHOT + EXACT-HEAD CERTIFICATION

> Exact-head evidence only.

- **WAVE-45 CODE/MERGE ANCHOR:** `42c89ef31bc67a20c66fd7f22d8325ecb642a71f` after merging PR #608; subsequent changes in this boundary are governance write-backs..
- **UI DONE:** Report Center now consumes the canonical dashboard snapshot, shows truth posture/As-of/core financial context, provides a context-aware next action, and refreshes in place.
- **UI CONTRACT DONE:** `check-product-wow-ui-contract.mjs` guards the snapshot, next-action, refresh and no-synthetic-data requirements.
- **STAGING BACKUP OBSERVATION:** `backup_verification_runs=0`; PostgreSQL WAL archiver reports 3195 archived segments and 21 failed segments, with the last archived WAL timestamp at 2026-09-21 17:26:30 UTC. This does not constitute a restore drill or RPO/RTO PASS.
- **PHASE-F PATH:** the repository's logical backup mode performs a real `supabase db dump`, restores into an ephemeral local Postgres, compares table row counts, hashes the dump and measures RPO/RTO. The required secrets/config are executed only by the Phase-F workflow.
- **CI EXECUTION STATUS:** PR #608 was the exact pull-request path and produced a successful Netlify deploy-preview status on its head, but no Phase-F GitHub Actions run was exposed by the connected GitHub Actions reader. Manual dispatch was attempted through the available browser-automation path but could not start because that execution channel has no available wallet capacity.
- **NEXT EXECUTABLE ACTION:** obtain a fresh exact-`main` CI/build/Phase-F run for `42c89ef31bc67a20c66fd7f22d8325ecb642a71f`; repair only failures reproduced on this SHA, then continue backup/RPO-RTO → worker/server-boundary → tenant A/B → server OCR authority → watched-folder → final certification.
- **DO NOT REPEAT:** do not transfer old deployment/runtime PASS; do not record WAL archival health as backup/restore proof; do not rerun closed checks without SHA/environment/contract change.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / COMPREHENSIVE IMPORT + RESILIENCE WAVE 44

> Exact-head evidence only. Current code/test changes and live staging observations are recorded below; no historical PASS is transferred.

- **LATEST CODE UI FIX:** `42c873d48980650c8cd38a6c242a416862e5f0c8` — terminal import failures are actionable, the exact technical error remains visible, history refreshes after failure, and failure summaries now include `invalidRows`.
- **LATEST CONTRACT GUARD:** `52f362bdcab600b597f8321cd9a6f6a2ad9c0599` — guards completed/failed `invalidRows` plus the actionable server-failure UX.
- **MASTER PRODUCT REFERENCE:** implementation and live evidence were recorded at `913b0832f4d71c421435f894759f67f87a907d23`.
- **LIVE IMPORT RESULT:** newest two staging imports after the finish-job repair both reached `completed`, with `committed=1` and `invalidRows=0`, each with a persisted snapshot ID.
- **HISTORICAL HTTP-500 RESULT:** latest observed `HTTP_500` occurred at 17:01 UTC before the two subsequent successful imports. Its related durable report job later expired and was recovered; this demonstrates a worker-lease/runtime interaction but does not prove that every historical 500 had the same root cause.
- **LIVE RESILIENCE RESULT:** one expired `processing` lease was recovered with the existing canonical `recover_expired_report_execution_jobs` function. Immediate post-recovery state: `expired_active_leases=0`, `processing=0`, `queued=564`, `failed=10`, `dead_letter=7`, `completed=3110`.
- **BACKUP GAP:** `backup_verification_runs=0`; no RPO/RTO proof exists yet.
- **SECURITY GAP:** Supabase advisor currently reports 47 authenticated-executable SECURITY DEFINER findings. No blanket revoke/change is applied because the existing authenticated RPC contracts require function-by-function authorization review.
- **DEPLOYMENT GAP:** Vercel still reports the free-plan `build-rate-limit`; no current-head deployment PASS is claimed. PC01 is offline, so no local build/browser PASS is claimed.
- **NEXT EXECUTABLE ACTION:** obtain fresh exact-head CI/build/browser evidence for current main `0165be03...`; then close backup/RPO-RTO proof and inspect the remaining server-boundary/worker-lease behavior with disposable evidence, without weakening canonical import semantics.
- **DO NOT REPEAT:** do not reintroduce generic import error text, omit terminal `invalidRows`, classify stale HTTP-500 evidence as current, blanket-revoke SECURITY DEFINER functions, or transfer stale deployment PASS.

## CURRENT EXECUTION BOUNDARY — 2026-09-21 / SESSION 43 REBIND AFTER CONNECTION RENEWAL

> Exact-head evidence only.

- **CURRENT REPOSITORY HEAD:** `0165be03e074e8d5a55a735308757165cfa22a14` on `main`.
- **RECENT CODE/TEST MOVEMENT AFTER SESSION 42:** canonical import finish-job repair at `d2a1f22643bf7b5222fcda4176fcb5e7895ee361`, its contract guard at `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`, and certification binding at `40cc9527d5a31d81c71ffb0cfa44a2cfd435df1d`.
- **MASTER PRODUCT REFERENCE:** successfully updated in the renewed connection at commit `e2e9e9d10366e546ec09940e1cd91dedbe7171c6`; the Dashboard Decision Accountability Wave 32 is now recorded there.
- **CURRENT UI CODE:** Dashboard decision-accountability surface remains present in `src/pages/DashboardPage.tsx`; its exact blob SHA is `b98102702f6ed93a3bd5bb59ae9ed374cd2e3d55`.
- **CURRENT UI CONTRACT GUARD:** `scripts/check-product-wow-ui-contract.mjs` contains the accountability assertions; exact blob SHA `a567fb653ab26a6195a2b89cd1136c818f43c901`.
- **LIVE PROOF:** Vercel is still blocked by the free-plan `build-rate-limit`; no current-head deployment PASS is claimed.
- **NEXT EXECUTABLE ACTION:** consume fresh exact-head CI/build/browser/certification for the current main head `1414843...`; repair any new failure, then continue Phase-F runtime closure without transferring historical PASS.
- **DO NOT REPEAT:** the previous MASTER_PRODUCT_REFERENCE write blockage is closed; do not report that blocker again unless a new write attempt actually fails.

## CURRENT PROJECT STATE — 2026-09-21 / CANONICAL IMPORT FINISH-JOB SUMMARY REPAIR

> Exact-head evidence only. The active candidate fixes the terminal import-job completion contract exposed by the live staging run.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT REPOSITORY HEAD:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac` before this governance bind.
- **ROOT CAUSE CLOSED:** canonical commit and durable report execution already succeeded, but `import_finish_job` required `committed + invalidRows = total`; the UI supplied `invalid` but omitted `invalidRows`, causing a false failed import status.
- **DONE:** canonical import success summary now includes `invalidRows: 0`, and the product contract guards this exact terminal-status field.
- **NEXT EXECUTABLE ACTION:** consume exact-head CI and real business E2E; confirm the imported job reaches `completed` instead of the previous false `failed`.
## CURRENT EXECUTION BOUNDARY — 2026-09-21 / DECISION ACCOUNTABILITY UI WAVE 32

> Exact-head evidence only. The current main head contains the dashboard UI and its contract guard; live deployment/build evidence remains fail-closed.

- **CURRENT REPOSITORY HEAD:** `5cc850be38aa98ee3d0ae6c82a64e777ff5dc1dc` on `main` after the required session-memory write-back.
- **LATEST PRODUCT UI CODE COMMIT:** `63e1aa9c716135ac019db6b11896318889d27cbc`.
- **LATEST UI CONTRACT TEST COMMIT:** `e6185e782e94fd227290a27a3b1d2263ced8d80c`.
- **DONE:** Business Pulse now surfaces decision-accountability metrics derived from the existing Recommendation records: actionable count, owner coverage, recorded outcome coverage, and pending review count.
- **DONE:** `check-product-wow-ui-contract.mjs` now guards this accountability surface and rejects regression to an unaccountable summary.
- **EXACT-HEAD SOURCE VERIFICATION:** dashboard and contract files were re-fetched from `main`; required accountability tokens and derivations are present, and no synthetic-data path was introduced.
- **LIVE DEPLOYMENT STATUS:** Vercel remains blocked by the free-plan `build-rate-limit`; no current-head deployment PASS is claimed. Netlify production remains stale at commit `21f6562dbca1016842f037299ffd8815b59fe1aa`; the connected deploy action returned its source/repo CLI requirement rather than executing a build.
- **LOCAL VERIFICATION STATUS:** PC01 is offline; no local full build/browser PASS is claimed. No fresh PR-triggered GitHub Actions run is attached to the current main candidate.
- **BLOCKER:** live build/browser/certification proof is unavailable from currently connected execution paths. This is an evidence blocker, not a code PASS.
- **NEXT EXECUTABLE ACTION:** obtain the first fresh exact-head build/browser/certification result for `e6185e...`; repair any fresh failure, otherwise continue Phase-F/runtime closure (resilience → backup/RPO-RTO → server OCR authority → tenant A/B → watched-folder) without importing historical PASS.
- **DO NOT REPEAT:** do not transfer older runtime PASS, do not treat stale Netlify/Vercel deployments as proof, and do not add duplicate UI/backend paths to compensate for deployment blockage.

## CURRENT PROJECT STATE — 2026-09-21 / DASHBOARD TEST CONTRACT SECONDARY DISPLAY ALIGNMENT

> Exact-head evidence only. The active candidate includes a test-only alignment for the Dashboard metric display contract.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT REPOSITORY HEAD:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac` before this governance bind.
- **DONE:** `dashboard-canonical-regression.mjs` now validates the current `formatCurrency(value)` renderer and no longer requires the retired string-concatenation display pattern.
- **DO NOT REPEAT:** do not change Dashboard rendering to satisfy the obsolete regex.
## CURRENT PROJECT STATE — 2026-09-21 / COMPLETE LAZY SYNONYM CLIENT BOUNDARY

> Exact-head evidence only. The active candidate completes the browser-only lazy Supabase boundary for all synonym CRUD/query functions.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT REPOSITORY HEAD:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac` before this governance bind.
- **DONE:** all synonym dictionary reads/writes now acquire the browser Supabase client lazily; server file-engine imports no longer initialize browser-only Supabase.
- **DO NOT REPEAT:** do not restore a top-level `../supabase` import in `src/lib/file-engine/synonyms.ts`.
## CURRENT PROJECT STATE — 2026-09-21 / SERVER-SAFE FILE ENGINE IMPORT FIX

> Exact-head evidence only. The active candidate includes the server-safe synonym loading fix plus its regression guard.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT REPOSITORY HEAD:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac` before this governance bind.
- **DONE:** `src/lib/file-engine/synonyms.ts` no longer imports the browser-only Supabase client at module load; browser DB synonyms remain available via dynamic import, while server parsing safely uses built-in deterministic synonyms.
- **DONE:** `check-file-engine-contract.mjs` now rejects browser Supabase imports from the server-loaded synonyms module.
- **ROOT CAUSE CLOSED:** the exact-head browser E2E 500 was `Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')` during Netlify function initialization.
- **PHASE-F NOTE:** current Vercel endpoints now exist and respond, but `RESILIENCE_OPERATIONAL_TOKEN` is not present in the currently served deployment runtime; this is external deployment configuration evidence, not a reason to weaken the endpoint.
- **NEXT EXECUTABLE ACTION:** consume exact-head CI for the server-safe import fix; then close live Phase-F through the current deployment/configuration path when capacity/config permits.
## CURRENT PROJECT STATE — 2026-09-21 / CERTIFICATION CANDIDATE REBOUND TO CI DIAGNOSTIC HEAD

> Exact-head evidence only. The certification candidate now includes the browser diagnostic test plus its CI workflow change; the current HEAD is governance-only beyond it.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT REPOSITORY HEAD:** `43b4f37a0ffcab12d5d8bb0a8718aa45590e2937`.
- **DONE:** certification candidate now includes the CI diagnostic change that must be part of the exact tested state.
- **NEXT EXECUTABLE ACTION:** consume fresh certification/enforcement runs for the rebound candidate; continue browser diagnostic run and use its captured Netlify failure detail.
## CURRENT PROJECT STATE — 2026-09-21 / REAL BUSINESS E2E SERVER-BOUNDARY DIAGNOSTICS

> Exact-head evidence only. The active code/test candidate adds diagnostics around the canonical server import boundary; no product import behavior is weakened.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT REPOSITORY HEAD:** `43b4f37a0ffcab12d5d8bb0a8718aa45590e2937` (governance-only descendant).
- **DONE:** real-business E2E now captures the actual canonical import response body and relevant local server-boundary errors.
- **DONE:** browser workflow dumps the Netlify Dev log when the browser E2E fails.
- **NEXT EXECUTABLE ACTION:** consume exact-head browser E2E/quality/final-certification results for this candidate; use the captured server detail to repair the actual runtime boundary if the 500 persists.
- **DO NOT REPEAT:** do not hide the 500 behind generic test output, and do not weaken the canonical import commit/security contracts.
## CURRENT PROJECT STATE — 2026-09-21 / DASHBOARD CONTRACT REGEX ALIGNMENT

> Exact-head evidence only. The active candidate includes a test-only dashboard contract alignment; DashboardPage behavior is unchanged.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **DONE:** dashboard canonical regression now accepts the current `metricStatus` signature including the valid parameter separator.
- **DO NOT REPEAT:** do not alter dashboard behavior to satisfy a stale regular expression.
## CURRENT PROJECT STATE — 2026-09-21 / LIVE SECURITY RUNTIME HARDENING

> Exact-head evidence only. The active candidate includes the migration that hardens both live `import_commit_batch` SECURITY DEFINER overloads.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **DONE:** staging runtime now reports `search_path=pg_catalog` for both 5-argument and 6-argument `import_commit_batch` overloads, with `statement_timeout=30s`.
- **DO NOT REPEAT:** do not claim the security fix from repository text alone; the live staging function state has now been verified separately.
## CURRENT PROJECT STATE — 2026-09-21 / SECURITY-DEFINER SEARCH_PATH HARDENING

> Exact-head evidence only. The active candidate includes the generic import SECURITY DEFINER hardening across all three current-main import_commit_batch migrations.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **DONE:** generic `import_commit_batch` migration definitions now pin `search_path` to `pg_catalog` instead of the unfixed empty path.
- **DO NOT REPEAT:** do not weaken SECURITY DEFINER search_path rules; validate the migration chain and live function security contract on the exact candidate.
## CURRENT PROJECT STATE — 2026-09-21 / INVENTORY NAVIGATION SOURCE-OF-TRUTH ALIGNMENT

> Exact-head evidence only. Inventory Intelligence UI verification now reads the canonical navigation registry instead of coupling to Sidebar implementation text.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **DONE:** `check-inventory-intelligence-ui.mjs` now validates the canonical `navigation-registry.ts` entry for `ذكاء المخزون`.
- **DO NOT REPEAT:** do not make certification depend on rendered Sidebar text when navigation-registry is the product source of truth.
## CURRENT PROJECT STATE — 2026-09-21 / INVENTORY INTELLIGENCE UI CONTRACT ALIGNMENT

> Exact-head evidence only. The active candidate includes the current navigation label contract; no legacy sidebar item is being restored.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **DONE:** inventory-intelligence UI guard now matches the canonical navigation registry label `ذكاء المخزون`.
- **DO NOT REPEAT:** do not restore the retired `ذكاء المخزون والمجموعات` navigation label solely for test compatibility.
## CURRENT PROJECT STATE — 2026-09-21 / IMPORT UI CONTRACT ALIGNMENT

> Exact-head evidence only. The active candidate includes the unified importer UI contract repair; the product architecture remains one source-first import surface.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT REPOSITORY HEAD:** `43b4f37a0ffcab12d5d8bb0a8718aa45590e2937` as the current governance-only descendant.
- **DONE:** import product contract now asserts the current `مركز المصادر` / `اعتماد المصدر` / duplicate-protection language and no longer depends on retired specialized labels.
- **DO NOT REPEAT:** do not reintroduce fixed entity selectors or legacy folder-import wording to satisfy a test.
## CURRENT PROJECT STATE — 2026-09-21 / UNIFIED BUSINESS E2E CONTRACT REBIND

> Exact-head evidence only. The active candidate is the unified source-first business E2E contract repair; older candidate markers remain historical and are not evidence.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT REPOSITORY HEAD:** `43b4f37a0ffcab12d5d8bb0a8718aa45590e2937` as the current governance-only descendant.
- **DONE:** `real-business-e2e.mjs` now exercises one unified `/import` source entry, generic canonical commit persistence, provenance, and tenant-A/B isolation; it no longer requires retired entity-selector controls.
- **DO NOT REPEAT:** do not restore per-entity import buttons/selectors merely to satisfy tests.

## CURRENT PROJECT STATE — 2026-09-21 / EXACT UNIFIED IMPORT CERTIFICATION CANDIDATE

> Exact-head evidence only. The active certification candidate is the current unified-import contract repair; older candidate markers below are historical.

- **CURRENT CODE/TEST CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **CURRENT REPOSITORY HEAD:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac` (governance-only descendant of the candidate).
- **CERTIFICATION BOUNDARY:** candidate `72e8182...` plus governance-only descendants are permitted; no source/code changes may be smuggled through documentation.

## LATEST EXECUTION BOUNDARY — 2026-09-21 / UNIFIED IMPORT CONTRACT REPAIR

> Exact-head evidence only. The repository now reflects the current unified source-first importer architecture; the retired specialized folder importer is not restored.

- **CURRENT REPOSITORY HEAD:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac` on `main`.
- **CURRENT_CODE_TEST_CANDIDATE:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **LATEST PRODUCT UI CODE COMMIT:** `b397204051d19c0107112c9b2ea389a9ac6a428c`.
- **LATEST UI CONTRACT TEST COMMIT:** `3b10164c8bce6b1f7b17af9ac7e0e71ade4cc505`.
- **LATEST CERTIFICATION/GATE REPAIR:** `2caedfa8ab2f71dd06bffb4992d122dc08bb75ac`.
- **DONE:** `check-master-requirements-contract.mjs` no longer requires the removed `FolderBatchImportPanel.tsx`.
- **DONE:** `check-final-execution-batch.mjs` no longer requires the removed `check-folder-batch-import.mjs` gate.
- **ARCHITECTURE:** `/import` remains one source-first canonical importer; fixed entity targets and the retired folder importer remain forbidden.
- **NEXT EXECUTABLE ACTION:** consume exact-head Actions for `72e8182...` and repair any fresh failure; then proceed to Phase-F/runtime closure without transferring older PASS evidence.
- **DO NOT REPEAT:** do not recreate the retired folder importer or weaken the unified-import product contract.

## LATEST EXECUTION BOUNDARY — 2026-09-21 / CONTINUOUS WAVE 40

> Exact-head evidence only. Repository state below is the latest observed state; no older PASS is transferred.

- **CURRENT REPOSITORY HEAD:** `166a8d2ada5368a22fef581932282bf5912cd403` on `main` (this commit is documentation-only after the product/test fixes below).
- **LATEST PRODUCT UI CODE COMMIT:** `3b10164c8bce6b1f7b17af9ac7e0e71ade4cc505`.
- **LATEST UI CONTRACT TEST COMMIT:** `3b10164c8bce6b1f7b17af9ac7e0e71ade4cc505`.
- **DONE:** Trust & Evidence now refreshes in place through the existing authoritative data-quality snapshot; no full-page reload is used for refresh/error retry.
- **DONE:** Trust & Evidence exposes source record count, total issues and critical-issue pressure and derives a real next action from existing snapshot state; EMPTY now routes to the canonical unified `/import` entry.
- **DONE:** Added contract assertions preventing regression to reload-based refresh, blank empty state, non-actionable critical issues, or malformed JSX action-label syntax.
- **EXACT-HEAD STATIC VERIFICATION:** corrected Trust Evidence TSX parses cleanly and passes isolated strict TypeScript checking after the malformed escaped-template JSX was repaired.
- **LIVE STAGING RECHECK:** `expired_active_leases=0`, `worker_processing=0`, `worker_queued=563`, `worker_failed=10`, `worker_dead_letter=7`, `backup_verification_runs=0`; this is operational state evidence, not backup PASS.
- **SECURITY ADVISOR:** staging reports 47 authenticated-executable SECURITY DEFINER warnings. Targeted canonical import functions were checked for their live grants; their authenticated execution is intentional in the current governed import contract, so no blanket revoke was performed.
- **DEPLOYMENT BLOCKER:** the last exact UI commit `952ed9e204e2f821b554460a982d7dd17fd3a3da` created a real Vercel build failure caused by malformed JSX in its Trust Evidence `aria-label`; that parser defect is fixed in `210441941d3732f7a46bc6b57b5b038231017f15`.
- **CURRENT DEPLOYMENT PROOF:** Vercel has not yet produced a READY deployment for the corrected code; GitHub status remains `Vercel=failure` on the free-plan `build-rate-limit` context with deployment context pending for the current main head. No deployment PASS is claimed.
- **OTHER BLOCKER:** Netlify deployment write was rate-limited (HTTP 429) during this wave; PC01 remains offline, so no authenticated browser proof or local full-repo build is claimed.
- **NEXT EXECUTABLE ACTION:** consume the first fresh exact-head deployment/build result for the corrected UI candidate; if hosting remains blocked, continue the next independent cloud-safe canonical product/UI closure while keeping exact-head proof fail-closed, then resume Phase-F/backup/OCR/tenant-A-B/watched-folder evidence.
- **DO NOT REPEAT:** do not restore full-page reload refresh, blank empty-state behavior, malformed JSX, duplicate import paths/RPCs/runners, or old deployment/runtime evidence.
## CURRENT EXECUTION BOUNDARY — 2026-09-21

> تحديث تنفيذي بعد أمر المالك «انطلق». هذا القسم يصف الحالة المثبتة من الأدوات فقط. لا يتم نقل Evidence بين SHAs، ولا تُعد الحالة PASS إلا بدليل Exact-HEAD.

- **CURRENT CODE/TEST CANDIDATE:** `3b10164c8bce6b1f7b17af9ac7e0e71ade4cc505`
- **CURRENT_REPOSITORY_HEAD:** `943f0619abfddb56daddc83bc500659376655474`

### CURRENT EXACT HEAD / DEPLOYED STATE
- **Current product/code HEAD:** `e6c39323eb0c0177b1de73c3b276ce9491fd07f0`.
- **Previous product/runtime baseline:** `1568e43889d27b5d850e64c0b99d03a994fd3bbe`.
- **Historical product/test candidate:** `fe5661060462ffa21d6aa31505f80c2021c4170a` — historical only; do not treat as current HEAD evidence.
- **Reference product/runtime code HEAD:** `c11c084d161cceb4595f8552b6c49c3f610f0ec2`; current `main` also carries the forward-only security/source-parity migrations merged afterward.
- **Last exact-head verified product result:** no current-head runtime/build PASS; the latest code-only verification on `23449d317277df32d560bc3fbb1b60f0e2a48eb9` closed a real AnalyticsPage import defect and re-read the exact file. Vercel remains blocked by free-plan `build-rate-limit`.
- **Netlify Production:** latest verified production deploy `6aacfe23cc817a00089dce5c` = `ready`, branch `main`, but still points to commit `ad12e9e564f85ffde8bb29daa6e41e73ca969b92`, which predates current `main`. Public access remains verified without Netlify SSO/password. Connector-side redeploy requires a source/repo execution environment.
- **Netlify administrative access control:** تم إزالة Team SSO/password requirement للمشروع فقط؛ لم يتم تغيير Auth التطبيق.
- **Staging DB live counts:** companies=2, memberships=2, import_jobs=3800, canonical_import_commits=2557, kpi_evidence_snapshots=314, sales_invoices=355.

### FRESH FINDINGS — ENGINEERING / RUNTIME / RELEASE
1. **Fresh exact-head runtime evidence:** product/runtime certification remains unproven. PR #587 now has fresh exact-head candidate `3c4bb990a0e0188f9984e0cd67d941cd29c7824e`, with 48 workflows re-triggered; no new PASS evidence is yet claimed.
2. **PR #587 exact-head harness finding:** at `dfdc662...`, Full Product Browser E2E and Storage Tenant Runtime E2E both failed at the login control before business checks because tests required the obsolete text `تسجيل الدخول` while `LoginPage` renders `الدخول إلى مساحة العمل`. The harness was corrected on the branch at `182f0983...` and `3c4bb990...` to target `form button[type="submit"]`.
3. **Phase F live resilience:** آخر تنفيذ exact-head على SHA الموازي أثبت أن سبب الفشل خارجي: جميع متغيرات Phase F الحية غير مُهيأة في GitHub Actions. المتطلبات المحددة: `RESILIENCE_TARGET_ENV`, `RESILIENCE_OPERATIONAL_TOKEN`, `RESILIENCE_CANARY_AUTH_TOKEN`, `RESILIENCE_HEALTH_URL`, `RESILIENCE_CANARY_URL`, `RESILIENCE_BACKUP_VERIFY_URL`, `RESILIENCE_ROLLBACK_DRILL_URL`.
4. **Migration/source parity:** PR #590's forward-only reconciliation is merged to `main`, and staging has the matching end-state applied. The remaining work is disposable replay/verification; no historical migration rewrite is authorized. `20260918053906_reconcile_import_job_row_tenant_schema`, `20260918053540_reconcile_import_lineage_tenant_integrity`, `20260918053527_reconcile_import_lineage_idempotency`, `20260918043413_reconcile_report_execution_worker_service_authority`, `20260918024152_reconcile_report_execution_worker_search_path_completion`, `20260918023708_reconcile_report_execution_worker_search_path`. هذا **DRIFT حقيقي** ويجب إغلاقه forward-only؛ لا حذف أو إعادة كتابة للتاريخ.
5. **Storage baseline:** bucket `documents` private، وسياسات storage الحالية authenticated + tenant-scoped. Runtime signed-URL proof ما زال غير مثبت.
6. **Realtime:** publication `supabase_realtime` تشمل حالياً `client_ui_settings`, `customer_invitations`, `inventory_balances`, `orders`. Authorization runtime proof ما زال مطلوباً.
7. **Worker live state:** `report_execution_jobs` حالياً يحتوي completed=2556, dead_letter=5, failed=10, leased=3, processing=15, queued=515. هذا ليس بحد ذاته resilience PASS؛ disposable enqueue→claim→heartbeat→expiry→recovery→retry/DLQ ما زال مطلوباً.
8. **Backup/restore:** جدول `backup_verification_runs` لا يحتوي سجلات تحقق حالية؛ RPO/RTO المقاس غير مثبت.
9. **PDF/OCR:** لا يوجد نقل للنتيجة التاريخية `10/12`; يجب إعادة إثبات السيناريوهات على Exact HEAD. Repository path يحتوي بالفعل على structured PDF/OCR hardening، لكن ذلك لا يساوي runtime certification.
10. **Production parity:** Netlify public access is verified, but Production is still serving the older `ad12e9e...` deploy. Vercel remains externally blocked by `api-deployments-free-per-day` build-rate-limit and is not release proof.

### LATEST EXECUTION UPDATE — 2026-09-18
- Staging forward-only parity checkpoint applied successfully: `harden_import_field_lineage_rls`, `revoke_authenticated_worker_enqueue`, `reconcile_live_source_end_state`.
- Verified import row integrity: null company=0, orphan job=0, cross-tenant row/job mismatch=0.
- Verified all 8 durable report-execution RPCs: authenticated EXECUTE=false, service_role EXECUTE=true; all have `search_path=public, pg_catalog`.
- Verified `import_field_lineage` authenticated policy is explicit restrictive deny; Security Advisor targeted findings remain clear.
- PR #590 source migrations are merged into `main` at `64c870426b75de7726e0f60321d580074bb76fa9`; staging verification is clean for import-row integrity and worker RPC authority.
- Product development PR #587 type error is repaired at `dfdc662...`; a fresh shared-harness login regression was then fixed at `182f0983...` and `3c4bb990...`. Fresh workflows on `3c4bb990...` remain authoritative and pending.

### SESSION START / SESSION END MEMORY CONTRACT — MANDATORY

**Canonical live memory:** `/Report-Advisor/ONE-PROGRAMMER-SESSION-MEMORY.md`.

At the start of every session, the programmer MUST:
1. Read the canonical session memory.
2. Read `docs/MASTER_PRODUCT_REFERENCE.md` and `docs/MASTER_EXECUTION_INDEX.md`.
3. Verify exact Git HEAD/branch/status plus relevant PR/CI/runtime/deployment evidence.
4. Resume from **CURRENT RESUME POINTER / NEXT EXECUTABLE ACTION**; never restart discovery from zero.
5. Execute all safe independent fronts in parallel and serialize only conflicting writes.

At the end of every meaningful batch, and before ending the session, the programmer MUST update the same memory file with:
`SESSION-ID → EXACT HEAD → DONE → ACTUAL RESULT → PRECISE STOP POINT → OPEN BLOCKERS → VERIFIED TESTS/EVIDENCE → NEXT EXECUTABLE ACTION → DO NOT REPEAT → CURRENT RESUME POINTER`.

A session is never considered complete merely because the chat ended. Repository memory is the continuity mechanism.

The startup command is intentionally short:

> **ابدأ من الذاكرة الحية. اقرأ المرجع الأساسي، ثبّت الـHEAD الحقيقي، خذ آخر RESUME POINTER، نفّذ NEXT ACTION مباشرة، واعمل بالتوازي دون إعادة الشغل المغلق. وفي نهاية كل دفعة احفظ النتيجة والـSHA ونقطة التوقف والخطوة التالية في نفس الذاكرة قبل مواصلة التنفيذ.**

### PRODUCT CONSTITUTION — MANDATORY OPERATING CONTRACT
