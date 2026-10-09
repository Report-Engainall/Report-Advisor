SESSION HANDOFF = READY
REPORT_FOR_HEAD = 2d3f2c0760df0e62324e5da92a469c8d345b88c0
UPDATED_AT = 2026-10-09T07:08:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Resume Report-Advisor PR #911 from canonical boot files, verify real repository state, close concrete defects, and preserve a resumable exact-head handoff.


## 2026-10-09 delta — report identity isolation
- Code parent: 90c7a9464004b001a53d324fc9836fb5b3cdd655.
- Exact changed files: src/pages/SmartReportPage.tsx; src/components/SourceBoundReportSurface.tsx; scripts/source-report-workspace-contract.test.mjs.
- The UI now clears prior report state, binds report/error display to current jobId and sourceHash, aborts stale requests, and rejects context mismatches before rendering.
- f3c73612 exact build failed on TS18047/TS2322; explicit null narrowing was corrected at 90c7a946. Current-head build/browser journey remains pending.
- Supabase staging Auth logged repeated /token 504/500 with Postgres connection timeout; predecessor report/browser proof failed and the 48-archetype real-source stage was skipped. Product completion remains NO.



## 2026-10-09 delta — retry cancellation and identity binding
- Code/test head: 1ca4851607b4d278f7ff9438065603453bc2f762.
- The prior context fix clears report state when the job/hash changes, checks both identity fields before render, and cancels obsolete SourceBoundReportSurface requests.
- 9d474679 moved SmartReportPage retry handling back through the same guarded effect using retryVersion; this avoids a separate untracked retry request racing a later route. 1ca48516 added static contract assertions for the guarded retry path.
- Exact-head runs are pending/in progress as listed above. The predecessor build/quality/handoff/cert gates passed at 9799fcc, but its authenticated browser journey did not.
- Staging Supabase Auth/Postgres remains blocked with 500/504 connection failures; report-value cohort timed out (SQLSTATE 57014) before candidate-pool output. Customer proof and product completion remain NOT PROVEN.



## 2026-10-09 delta — bounded cohort timeout handling
- Code head: 2d3f2c0760df0e62324e5da92a469c8d345b88c0.
- scripts/report-value-cohort.mjs no longer retries HTTP 500 responses whose PostgreSQL payload is SQLSTATE 57014 or states “statement timeout”. A contract test at scripts/report-value-cohort-retry-contract.test.mjs is wired into .github/workflows/report-value-cohort.yml before the live cohort call.
- This prevents five repeated expensive statement-timeout attempts. It does not prove that get_report_value_cohort_candidates completes within the database timeout; live DB proof remains blocked.
- Current exact-head build/quality/full-browser/handoff/certification/device/cohort runs are pending or queued; do not use prior-head PASS as current-head PASS.
- Supabase management status says ACTIVE_HEALTHY, but Auth/Postgres logs show repeated 500/504 and the SQL connector itself times out. The public preview remains fixture-backed; PRODUCT COMPLETE = NO.

WHAT_I_ACTUALLY_DID = Continued the report identity correction and added a safe retry behavior to SmartReportPage; route changes clear stale report state, errors are bound to jobId + sourceHash, source-bound requests abort on context change, and retry reuses the guarded effect. Fixed the cohort probe so a deterministic PostgreSQL statement timeout (57014) is returned without repeating the same expensive RPC, with a static contract test wired into the cohort workflow.
WHAT_IS_PROVEN = At predecessor 9799fcc, Product Build Gate 37880471759, Quality 37880471940, Session Handoff 37880471902, Final Certification 37880471818, and Data Quality Runtime 37880471915 passed. Its Full Product Browser run failed during actor provisioning and real-open-report proof, skipping passport and 48-archetype stages. At current head 2d3f2c07, Product Build 37881797840, Quality 37881797964, Full Product Browser 37881797950, Session Handoff 37881797893, Final Certification 37881797775, Device E2E 37881797903, Report Value Cohort 37881797849 and Commercial Product Creation E2E 37881797794 were queued/pending at last query. No current-head PASS is claimed.
FIRST_ACTIVE_FAILURE = The authenticated journey is blocked by repeated Supabase Auth /token and /admin/users HTTP 500/504. Logs show the Auth service cannot connect to its local supabase_auth_admin Postgres; direct management SQL also times out. The cohort query failed with SQLSTATE 57014 before printing its candidate pool; its old fetch policy retried every 500 response, including statement timeout. The current patch stops retrying 57014 but cannot prove the underlying query/DB recovered.
ROOT_CAUSE = Report surfaces needed stricter per-request identity and retry cancellation. This code is now in place with source assertions. Independently, staging Auth/Postgres connectivity fails; repeated auth actor-provision calls cannot be repaired by UI code. The cohort probe retried a terminal PostgreSQL statement timeout five times, amplifying load; the retry contract now fails closed without repeating that query.
NEXT_EXACT_ACTION = Verify exact-head 2d3f2c07 Product Build 37881797840 and Quality 37881797964, especially the new cohort retry contract and guarded report retry assertions. Then inspect Full Product Browser 37881797950, Device E2E 37881797903, Cohort 37881797849 and Product Creation 37881797794. Re-run report proof only once Supabase Auth/Postgres responds; preserve tenant boundaries and do not weaken fail-closed evidence.

## Repository state
- Repository: Report-Engainall/Report-Advisor
- Branch: captain/critical-bundle-proof-20261009
- PR #911 OPEN / UNMERGED: https://github.com/Report-Engainall/Report-Advisor/pull/911
- Code parent for this docs-only checkpoint: e9271260ac2b52f623023840fa3aabfaad572669
- Main at last read: fa1ab4cbade9b01685507aa966c10f700a03f576
- Application UI source commit: 2c4ef80717a6e7052373e721d2e0586115cc5efd
- Preview: https://deploy-preview-911--aghbari-report-advisor.netlify.app

## Code changes
- 8583448ff6cdddabea2d1e83eae630802dd298fd: 25s per-request passport refresh timeout; max three retries for retryable network/HTTP failures; per-job progress; logical duplicate suppression; explicit audit-query error classification.
- e9271260ac2b52f623023840fa3aabfaad572669: use TEST_USER_C_EMAIL/PASSWORD in scripts/resume-open-report-server-proof.mjs and assert actor/tenant alignment in scripts/e2e-actor-provisioning-contract.test.mjs.
- UI source did not change in these proof-path commits.

## Evidence ledger
| Gate | Run | Latest known state |
|---|---:|---|
| Handoff | 37876658311 | PASS at ancestor 419e4e6 |
| Execution Enforcement | 37876654255 | PASS at ancestor 419e4e6 |
| Product Build | 37876282142 | PASS at ancestor 8583448 |
| Quality | 37876282183 | PASS at ancestor 8583448 |
| Full Product Browser at 858 | 37876278794 | actor setup and open-report steps failed; later proof steps skipped |
| Full Product Browser at e927 | 37876852731 | IN PROGRESS |
| Product Build at e927 | 37876857478 | QUEUED |
| Quality at e927 | 37876857607 | QUEUED |
| Device-Independent E2E at e927 | 37876857500 | QUEUED |
| Session Handoff at e927 | 37876857440 | QUEUED |
| Final Certification at e927 | 37876857543 | QUEUED |
| Phase F at e927 | 37876857595 | PENDING |

## Product truth
- Reports Center pagination and links preserving jobId + sourceHash exist in application source, but authenticated continuity is still NOT PROVEN.
- Target live report: job `d074ad5c-70d4-4402-a763-01129786f392`, expected source hash `sha256:f68f77f641cb54bbc30b9ece0ed9516700cb5ae48b6cbfb5b52317a8360faf10`, file `فواتير العملاء من تاريخ 01-01 حتى 30-08-2026.pdf`. Need exact-head proof for rendered state, import and canonical-row counts.
- Public preview currently renders fixture `28-inventory-stockout-reorder.csv`; it is not a real-customer report.
- 48/48 real-source archetypes, safe XLSX upload, complete upload→report→evidence→recommendation→decision/work/outcome, current-head Phase F READY and production proof remain NOT PROVEN.
- PRODUCT COMPLETE = NO.

## Governance / resource constraints
- `docs/execution/CAPTAIN_PROGRAMMER_OPERATING_PROTOCOL.md` is the available fallback. `Project-Governance/NASR_PROJECT_SUPERVISION_PROTOCOL.md` returns 404 on branch and main.
- Canonical `docs/SYSTEM_HEART.md`, `docs/MASTER_EXECUTION_INDEX.md`, `docs/PROJECT_KNOWLEDGE_MANIFEST.md` exist.
- No Remote Desktop; preserve the remaining 20% free allowance. No paid agent runs, no weakened auth/RLS or evidence checks.