SESSION HANDOFF = READY
REPORT_FOR_HEAD = e9271260ac2b52f623023840fa3aabfaad572669
UPDATED_AT = 2026-10-09T05:56:00+03:00
WHAT_I_WAS_ASKED_TO_DO = Resume Report-Advisor PR #911 from canonical boot files, verify real repository state, close concrete defects, and preserve a resumable exact-head handoff.
WHAT_I_ACTUALLY_DID = Reconciled branch, application, main and preview identity; made governed passport refresh bounded and observable; made actor audit read errors explicit; corrected the real-open-report proof to authenticate as TEST_USER_C, who is provisioned into the configured real-report company, and added contract assertions. This report checkpoints e9271260ac2b52f623023840fa3aabfaad572669.
WHAT_IS_PROVEN = At ancestor 8583448: Product Build Gate 37876282142 PASS, Quality 37876282183 PASS, Execution Enforcement 37876278781 PASS. At docs ancestor 419e4e6: Session Handoff 37876658311 PASS and Execution Enforcement 37876654255 PASS. These are not exact-e927 results. New e927 Full Product Browser run 37876852731 is in progress; build/quality/device/handoff/certification and Phase F are queued or pending as of the latest run listing.
FIRST_ACTIVE_FAILURE = Full Product Browser at 858 (37876278794) failed actor provisioning and real-open-report proof, causing passport-refresh and 48/48 steps to be skipped. Source configuration demonstrates the open-report verifier used user A while the workflow provisions user C to REAL_SMART_REPORT_COMPANY_ID. Commit e927 changes the verifier to user C. Its browser proof is pending.
ROOT_CAUSE = The real-open-report verifier authenticated TEST_USER_A and resolved that user's current company before reading a job in the configured live-report tenant. The provisioner deliberately gives user C a default membership on REAL_SMART_REPORT_COMPANY_ID; user A belongs to RUNTIME-EVIDENCE-A-401117. The mismatch could cause OPEN_REPORT_JOB_NOT_FOUND despite an existing report. Separately, a previous actor audit query ignored the Supabase error field, and the passport refresher lacked bounded request timeout/retry and duplicate-job suppression.
NEXT_EXACT_ACTION = Read back the docs-only checkpoint; verify handoff/certification on its successor; inspect Full Product Browser 37876852731 and latest-head Build 37876857478, Quality 37876857607, Device E2E 37876857500 and Phase F 37876857595. Fix only the first explicit failure from the newest run. Do not merge or state PRODUCT_COMPLETE until real report, exact jobId+sourceHash continuity, 48/48, full upload-to-decision and production proof pass.

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