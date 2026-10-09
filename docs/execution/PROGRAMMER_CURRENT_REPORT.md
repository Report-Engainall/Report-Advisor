SESSION HANDOFF = READY
REPORT_FOR_HEAD = 51d10dadc3906780b1e41e66023844e565fc5759
UPDATED_AT = 2026-10-09T06:52:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Resume Report-Advisor PR #911 from canonical boot files, verify real repository state, close concrete defects, and preserve a resumable exact-head handoff.


## 2026-10-09 delta — report identity isolation
- Code parent: 90c7a9464004b001a53d324fc9836fb5b3cdd655.
- Exact changed files: src/pages/SmartReportPage.tsx; src/components/SourceBoundReportSurface.tsx; scripts/source-report-workspace-contract.test.mjs.
- The UI now clears prior report state, binds report/error display to current jobId and sourceHash, aborts stale requests, and rejects context mismatches before rendering.
- f3c73612 exact build failed on TS18047/TS2322; explicit null narrowing was corrected at 90c7a946. Current-head build/browser journey remains pending.
- Supabase staging Auth logged repeated /token 504/500 with Postgres connection timeout; predecessor report/browser proof failed and the 48-archetype real-source stage was skipped. Product completion remains NO.

WHAT_I_ACTUALLY_DID = Added jobId + sourceHash identity protection in SmartReportPage and SourceBoundReportSurface: clear stale report state, bind displayed report and errors to the URL context, abort stale source-surface requests, and add source-report workspace regression assertions. A build-discovered nullable report narrowing issue was corrected; then the assertion was fixed after its region excluded the render block. Exact-head checks are restarted.
WHAT_IS_PROVEN = On ancestor 90c7a946, Product Build 37879969580 and Quality 37879969419 passed; Full Product Browser 37879969657 failed canonical heart regressions because the added test asserted a render guard inside an earlier request-only text slice, and real-open-report proof also failed. Commit 51d10dad corrected the test to search the full page. Current exact-head Product Build 37880387207 and Quality 37880387136 are queued, Full Product Browser 37880386869 is pending, Handoff 37880387095 queued, Certification 37880387128 queued, and Device E2E 37880387114 queued. Do not infer a current-head pass.
FIRST_ACTIVE_FAILURE = The 90c7a946 Full Product Browser canonical-regression command failed; direct evaluation of the same source assertions found one false check because errorContextKey render logic was outside smartReportRequestRegion. Commit 51d10dad changes that check to source.includes(...) and a source-based replay of ten identity invariants returned zero failed conditions. Current-head CI results are pending.
ROOT_CAUSE = Report surfaces previously retained a prior job/hash report while a changed route was fetching. Fix f3c73612 clears state and verifies the report identity; 90c7a946 fixes nullable report narrowing; 51d10dad corrects the regression assertion scope. Separately, staging Supabase Auth had /token 504/500 failures and Postgres connection deadlines, so authenticated real-report proof remains blocked independently.
NEXT_EXACT_ACTION = Verify the fresh Product Build 37880387207 and Quality 37880387136; then inspect Full Product Browser 37880386869 to ensure canonical heart regressions pass and identify the exact Auth/real-report error. Continue only after Supabase Auth/database responds, then prove source hash, canonical rows, passports, recommendations, decisions/work and outcomes on the same report.

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