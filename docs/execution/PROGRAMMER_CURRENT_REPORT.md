SESSION HANDOFF = READY
REPORT_FOR_HEAD = 71d14ff1b524b05bc08b0c95b9c3d657fd09b428
UPDATED_AT = 2026-10-09T07:28:54+03:00
WHAT_I_WAS_ASKED_TO_DO = Resume Report-Advisor PR #911 from canonical boot files, verify real repository state, close concrete defects, and preserve a resumable exact-head handoff.


## 2026-10-09 delta — exact code head 71d14ff1b524b05bc08b0c95b9c3d657fd09b428
- PR #911 remains open/unmerged. The application source candidate is 71d14ff1b524b05bc08b0c95b9c3d657fd09b428; the documentation commit that follows does not modify application code.
- Both SmartReportPage and SourceBoundReportSurface now bind report/error rendering to current jobId + sourceHash, clear old context, and cancel stale fetches. Retries are driven through the same guarded effect, not a free-floating fetch.
- The report-value cohort now rejects missing/malformed tenant scope, queries each tenant separately, deduplicates source hashes and avoids retrying terminal SQLSTATE 57014 statement timeouts. Workflow scope uses only known real-report tenant 99e33354-cc45-4317-8eb3-0d486b6c5932; it may not silently expand to other tenants if there are fewer than 40 records.
- The quality workflow now validates the event's immutable PR-head SHA against the second parent of the merge commit rather than querying the moving branch reference. This addresses the observed Diagnostics failure that caused install/lint/build follow-on failures.
- Exact-head static source/config audit: 25/25 predicates passed. This is not runtime test proof.
- At last query, exact-code-head runs were queued: Product Build 37883970456, Quality 37883970556, Full Browser 37883970375, Certification 37883970576, Device E2E 37883970632, Report Value Cohort 37883970550, Product Creation 37883970515 and Data Quality 37883970542. Handoff 37883970401 uses predecessor docs and will be superseded by a new run after this handoff writeback.
- Staging Auth still returns 500/504 and reports Postgres connection failures; direct SQL via management connector timed out. Prior real-open-report/browser proof failed and passport/48 archetype proof was skipped. Real customer journey remains NOT PROVEN.
- Product completion: NO.

WHAT_I_ACTUALLY_DID = Fixed report identity and retry isolation across SmartReportPage and SourceBoundReportSurface, added regression assertions, fixed the quality workflow's immutable PR-head provenance check, and scoped the report-value cohort to one verified staging report tenant with a contract against unscoped/unknown-company queries and terminal statement-timeout retries.
WHAT_IS_PROVEN = Exact-code-head static source/config inspection passed 25/25 authored predicates. This is not executed Node/CI proof. At last query, Product Build 37883970456, Quality 37883970556, Full Browser 37883970375, Final Certification 37883970576, Device E2E 37883970632, Cohort 37883970550, Product Creation E2E 37883970515 and Data Quality Runtime 37883970542 were QUEUED. Handoff 37883970401 was pending on predecessor docs. At predecessor 9799fcc, build/quality/handoff/cert/data-quality passed but authenticated browser proof failed; current product completion is not proven.
FIRST_ACTIVE_FAILURE = The quality job at 478e5e7 failed Diagnostics because it compared a queued run's immutable PR event head to the later moving branch tip; npm ci was skipped and produced downstream eslint/vite-not-found messages. The current workflow checks the merge commit's embedded PR-head parent and includes a regression check. Separately, authenticated real report proof is blocked by Supabase Auth/Postgres /token 500/504/timeouts; cohort's prior unscoped query hit SQLSTATE 57014.
ROOT_CAUSE = UI: old route requests/retries could outlive a job/hash change; both report views now share an abortable, context-guarded retry path. CI: quality workflow rejected valid queued runs when the branch advanced; it now checks the immutable merge commit metadata. Cohort: unscoped scanning was too expensive and the earlier company list included unverified UUIDs; it now requires explicit scope and uses only the documented real-report tenant. Auth/Postgres runtime remains independently unhealthy.
NEXT_EXACT_ACTION = Poll Product Build 37883970456 and Quality 37883970556 to terminal result; confirm report retry, scoped cohort, and new immutable-head contract tests actually run. Then inspect Full Browser 37883970375, Final Certification 37883970576, Device E2E 37883970632, Cohort 37883970550, Product Creation E2E 37883970515 and Data Quality Runtime 37883970542. Use the newly-triggered Handoff run from this docs writeback. Keep PR #911 open until authenticated report lineage and outcome proof passes.

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