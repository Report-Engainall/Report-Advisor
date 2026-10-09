SESSION HANDOFF = READY
REPORT_FOR_HEAD = 1ca4851607b4d278f7ff9438065603453bc2f762
UPDATED_AT = 2026-10-09T07:02:00+03:00
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

WHAT_I_ACTUALLY_DID = Preserved the current report-context fix and added a guarded retry mechanism to SmartReportPage: retries now increment retryVersion to rerun the same effect, which clears old state and aborts the prior request. Added contract assertions ensuring retry does not bypass route/hash cancellation. Updated the boot state with exact current code head and proof frontier.
WHAT_IS_PROVEN = At predecessor 9799fcc, Product Build Gate 37880471759 PASS, Quality 37880471940 PASS, Session Handoff 37880471902 PASS, Final Certification Gate 37880471818 PASS, Data Quality Runtime 37880471915 PASS. The predecessor Full Product Browser 37880471914 failed actor provisioning and real-open-report proof; passports/48-archetype proof were skipped. At current code/test head 1ca48516, Product Build 37881395239 and Quality 37881395097 are queued; Full Product Browser 37881395041 pending; Session Handoff 37881395247 pending; Final Certification 37881395152 queued; Device E2E 37881395160, Cohort 37881395184 and Commercial Product Creation 37881395207 in progress; Data Quality Runtime 37881395186 PASS. No nonterminal run is counted as PASS.
FIRST_ACTIVE_FAILURE = Authenticated report proof remains blocked by staging Supabase Auth/Postgres errors. Supabase Auth logged /admin/users and /token HTTP 504/500 with failed localhost Postgres connections at 03:50–03:51 UTC, and management SQL queries also hit connection timeout. Report Value Cohort 37880471959 ended with SQLSTATE 57014 before logging its candidate pool; the first script query is the unscoped get_report_value_cohort_candidates RPC when REPORT_ADVISOR_COMPANY_ID is unset. Current 1ca48516 report retry guard awaits exact-head CI proof.
ROOT_CAUSE = UI: report context is now source-bound, and the latest retry change removes a parallel unguarded retry path that could race route navigation. Infrastructure: the staging Supabase Auth service could not connect to its Postgres database, causing actor provisioning and browser proof to fail; this is not fixed by UI changes. Cohort: the unscoped candidate RPC is the likely first query to time out, but this has not been isolated with an EXPLAIN due database connection timeouts.
NEXT_EXACT_ACTION = Check exact-head build 37881395239 and quality 37881395097 for the new retry assertions; then inspect Full Product Browser 37881395041, Device E2E 37881395160, Cohort 37881395184, Product Creation 37881395207, Handoff 37881395247 and Certification 37881395152 to terminal states. Re-run authenticated report proof only when Auth/Postgres is responsive; capture same-tenant jobId+sourceHash, canonical rows, passport, recommendations, decisions/work and outcome. Keep PR #911 open.

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