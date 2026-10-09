SESSION HANDOFF = READY
REPORT_FOR_HEAD = 24a5e2434bb3a12ca487b2414909403fbda44c21
UPDATED_AT = 2026-10-09T07:42:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Resume Report-Advisor PR #911 from canonical boot files, verify real repository state, close concrete defects, and preserve a resumable exact-head handoff.


## 2026-10-09 exact code head — 24a5e2434bb3a12ca487b2414909403fbda44c21
- PR #911 remains open/unmerged; main = fa1ab4cbade9b01685507aa966c10f700a03f576.
- SmartReportPage and SourceBoundReportSurface bind displayed reports/errors to jobId + sourceHash, clear stale context, abort old fetches and retry through guarded effects.
- Cohort discovery requires explicit company scope, queries each company separately and de-duplicates source hashes; SQLSTATE 57014 / statement-timeout responses are not retried. The configured tenant list matches the existing full-browser E2E corpus.
- Quality and Full Browser workflows coalesce runs by PR/ref and cancel superseded candidates. Browser installation and business journey require successful prerequisite proof. Quality checks immutable merge-parent provenance.
- Removed the duplicated SmartReportPage loading guard and corrected the regression assertion to count the exact literal string. Current-head CI hasn't returned a terminal result yet.
- Static source/config inspection passed 28/28 predicates on predecessor ac68f9f; this is not runtime proof.
- Current code-head run frontier: Build 37885083465, Quality 37885083556, Full Browser 37885083432, Handoff 37885083566, Certification 37885083643, Device E2E 37885083640, Cohort 37885083644, Product Creation 37885083654, Data Quality 37885083552; all queued/pending at last read.
- Supabase Auth remains blocked by /token and /admin/users 500/504 as of 04:35 UTC. Public preview remains fixture-backed. PRODUCT COMPLETE = NO.

WHAT_I_ACTUALLY_DID = Hardened report identity/retry isolation, aligned cohort scope with the established E2E tenant list, stopped retries of terminal SQL timeouts, coalesced quality/browser CI by PR/ref with prerequisite gates, removed a duplicate SmartReportPage loading guard and changed the test assertion to literal substring counting.
WHAT_IS_PROVEN = Static source/config audit on predecessor ac68f9f passed 28/28 predicates. At current code head 24a5e243, Product Build 37885083465, Quality 37885083556, Full Browser 37885083432, Handoff 37885083566, Certification 37885083643, Device 37885083640, Cohort 37885083644, Product Creation 37885083654 and Data Quality 37885083552 were queued/pending. No current-head test PASS or authenticated report proof is established.
FIRST_ACTIVE_FAILURE = Current-head jobs remain queued. The new loading-guard test originally used an over-escaped regex and was corrected at 24a5e243; its real CI result is pending. Supabase Auth /token and /admin/users 500/504 continue to block authenticated E2E.
ROOT_CAUSE = UI report context/retries are now job/hash-bound and abortable. CI coalesces stale runs and gates expensive browser steps. Cohort uses the established E2E tenant scope and avoids terminal SQL timeout retries. One duplicate loading guard was removed and its test simplified. Supabase Auth/Postgres remains the live-product blocker.
NEXT_EXACT_ACTION = Poll current-head Build 37885083465 and Quality 37885083556. Confirm the literal loading-guard, source-report workspace, cohort scope and retry contracts actually execute; then inspect Full Browser 37885083432, Handoff 37885083566, Certification 37885083643 and Cohort 37885083644. Keep PR #911 open until authenticated report and outcome continuity pass.

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