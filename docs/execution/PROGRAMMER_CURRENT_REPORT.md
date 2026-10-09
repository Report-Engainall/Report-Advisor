SESSION HANDOFF = READY
REPORT_FOR_HEAD = 478e5e7b11878d606d5fd03c57406765f1e3ca0c
UPDATED_AT = 2026-10-09T07:15:00+03:00
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

## 2026-10-09 delta — per-tenant value cohort candidate scan
- Code head: 478e5e7b11878d606d5fd03c57406765f1e3ca0c.
- scripts/report-value-cohort.mjs requires an explicit, validated company scope. The cohort workflow passes the five configured staging corpus tenant IDs; the script calls the candidate RPC per tenant, sorts deterministically and deduplicates identical source hashes globally.
- scripts/report-value-cohort-scope-contract.test.mjs checks scope-required behavior, UUID validation, tenant-scoped calls, de-duplication and workflow wiring. scripts/report-value-cohort-retry-contract.test.mjs checks that PostgreSQL SQLSTATE 57014 / statement timeout is not retried.
- Static inspection of the exact code head satisfied 14/14 report identity/cohort assertions, but this is not a substitute for running the Node contract tests. Current exact-head Build 37882128819 and Quality 37882128799 are queued. Full Browser 37882128820 queued, Handoff 37882128635 pending, Certification 37882128663 queued, Device E2E 37882128844 queued, Cohort 37882128580 queued, Product Creation 37882128697 queued, Data Quality 37882128845 queued.
- Supabase Auth /token continued to log 500/504 at 04:02 UTC due failed localhost supabase_auth_admin Postgres connections; direct SQL calls also timed out. Prior unscoped value cohort ended on SQLSTATE 57014. The scoped query is not yet live-proven.
- Product completion: NO. Preview remains fixture-backed and real authenticated source-to-outcome proof remains NOT PROVEN.


WHAT_I_ACTUALLY_DID = Hardened source-bound report route changes and retry cancellation, then bounded the Report Value Cohort query by explicit tenant scope to avoid unscoped scanning across the staging estate. Added a scope contract and workflow wiring; preserved the 57014 terminal-timeout no-retry contract.
WHAT_IS_PROVEN = Source inspection of exact code head 478e5e7b11878d606d5fd03c57406765f1e3ca0c passed 14/14 authored invariants for report identity/retry and tenant-scoped cohort implementation. These were not executed Node tests. Current exact-head Build 37882128819, Quality 37882128799, Full Browser 37882128820, Handoff 37882128635, Final Certification 37882128663, Device E2E 37882128844, Cohort 37882128580, Commercial Product Creation 37882128697 and Data Quality Runtime 37882128845 were queued/pending at last read. At predecessor 9799fcc, build/quality/handoff/cert/data-quality passed, but the authenticated browser journey failed and its live report/passport/48-archetype steps remained unproven.
FIRST_ACTIVE_FAILURE = The current exact-head CI queue has not reached terminal results. Auth /token still recorded HTTP 500/504 with failed local Postgres connections at 04:02 UTC, and the prior Report Value Cohort RPC timed out with SQLSTATE 57014 before it produced candidate-pool output. The cohort script now requires explicit tenant scope and queries each staging corpus tenant sequentially; this is awaiting live CI proof.
ROOT_CAUSE = Report UI content is now guarded by jobId + sourceHash and the Retry button uses the same cancellable effect. The cohort measurement used an unscoped tenant-null RPC that scanned all eligible reports; this was identified as the first query to time out and is now split across five configured staging tenants with global source-hash de-duplication. Supabase Auth/Postgres connectivity remains an independent live test blocker.
NEXT_EXACT_ACTION = Wait for exact-head Build 37882128819 and Quality 37882128799 terminal results; fix the first specific contract/build failure. Then require a successful scoped cohort proof with >=40 distinct eligible source hashes and inspect Full Browser 37882128820, Handoff 37882128635, Certification 37882128663 and Device E2E 37882128844. Re-run authenticated report proof only when Auth/Postgres is responsive; keep PR #911 open until real report lineage and outcome chain pass.

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