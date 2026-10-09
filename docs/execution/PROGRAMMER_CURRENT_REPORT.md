SESSION HANDOFF = READY
REPORT_FOR_HEAD = ac68f9f203769522993b5bbed4e424f34610eda1
UPDATED_AT = 2026-10-09T07:35:42+03:00
WHAT_I_WAS_ASKED_TO_DO = Resume Report-Advisor PR #911 from canonical boot files, verify real repository state, close concrete defects, and preserve a resumable exact-head handoff.


## 2026-10-09 exact code head — ac68f9f203769522993b5bbed4e424f34610eda1
- PR #911 remains open/unmerged; application source candidate is ac68f9f203769522993b5bbed4e424f34610eda1. This checkpoint is docs-only.
- Report UI integrity: SmartReportPage and SourceBoundReportSurface clear stale context, gate displayed reports/errors on jobId + sourceHash, abort stale reads, and reuse guarded effects for retries.
- Cohort execution: requires explicit tenant scope; queries each configured tenant separately; deduplicates source hashes; returns SQLSTATE 57014 / statement-timeout responses without retrying the same expensive query. Its five IDs mirror the established E2E_CORPUS_TENANT_IDS in Full Product Browser E2E and the contract checks both configurations match.
- CI execution integrity: quality and full-browser workflows coalesce by PR/ref and cancel superseded candidates. Full browser install and the authenticated business journey require successful actor provisioning, real-open-report proof and authenticated route proof; final evidence still fails closed if output is missing. Quality diagnostics validate the immutable PR head embedded in the merge commit.
- Static source/config inspection passed 28/28 predicates. This is not actual Node test, build, browser or production proof.
- At last query, exact-code-head runs were queued/pending: Product Build 37884568704, Quality 37884568692, Full Browser 37884568760, Handoff 37884568700, Certification 37884568286, Device E2E 37884568688, Cohort 37884568756, Product Creation 37884568661 and Data Quality 37884568736.
- Supabase Auth logs still show /token and /admin/users 500/504 at 04:33 UTC from context cancellation and transaction-start failures. The current real authenticated report journey remains NOT PROVEN.
- Product completion: NO.

WHAT_I_ACTUALLY_DID = Hardened source-bound report identity and retry cancellation, restored cohort scope to the existing five-tenant E2E corpus with a cross-workflow contract, fixed terminal SQL timeout retries, changed Quality provenance to use the immutable merge-parent head, and coalesced stale browser/quality runs by PR/ref with explicit prerequisites for expensive browser steps.
WHAT_IS_PROVEN = Static source/config inspection on code head ac68f9f203769522993b5bbed4e424f34610eda1 passed 28/28 authored assertions. This is not executed CI proof. At last query, Product Build 37884568704, Quality 37884568692, Full Browser 37884568760, Handoff 37884568700, Certification 37884568286, Device E2E 37884568688, Cohort 37884568756, Product Creation 37884568661 and Data Quality Runtime 37884568736 were queued/pending. No current-head product/browser PASS is claimed.
FIRST_ACTIVE_FAILURE = Current-head jobs remain queued. Previous browser runs repeatedly failed actor provisioning and real-open-report proof, then still executed the real business journey because it was marked always(); this consumed runners without authenticated prerequisites. Latest Supabase logs through 04:33 UTC continue to show /token and /admin/users 500/504.
ROOT_CAUSE = UI: report content and retry requests could race route changes; now the response context is jobId+sourceHash and old requests are canceled. CI: each SHA had its own concurrency group, producing stale active runs; latest runs now coalesce by PR/ref, and browser stages require successful upstream proofs. Cohort: scoped tenant list is aligned with the existing E2E corpus; 57014 timeouts are terminal, not retried. Supabase Auth/Postgres remains unhealthy.
NEXT_EXACT_ACTION = Poll code-head Build 37884568704 and the newest PR-head Quality, Full Product Browser, Handoff, Cohort and certification runs after this documentation writeback. Confirm the new quality/topology/scope contracts execute; require a 40-distinct-source artifact and Authenticated E2E proof. If Auth/Postgres remains 500/504, mark the real customer journey BLOCKED/NOT PROVEN and keep PR #911 open.

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