# CURRENT SESSION STATE
SESSION_HANDOFF = NOT READY
ACTION_STATUS = ACTIVE_EXECUTION
CURRENT_EXACT_HEAD = 9bec7dc45ba65ddd036aa02491c0b4574d579570
CURRENT_MAIN_HEAD = 7e9cec1b8ee318520702c8b29ae1ec14aa2d5ff6
CURRENT_EXECUTION_HEAD = 1a38250863743edbe00682c51979954bd12cc64c
BRANCH = captain/phase-f-dynamic-pr-preview-20261003
PR = #762 OPEN
PR_PRODUCT_DELTA = #761 MERGED
PR_PRODUCT_DELTA_SHA = 9d78baf6ef00fac9c9cbd975b1ae0d737b100b23
CURRENT_PRODUCT_MAIN = 7e9cec1b8ee318520702c8b29ae1ec14aa2d5ff6
CURRENT_PR_HEAD = 9bec7dc45ba65ddd036aa02491c0b4574d579570
WHAT_ACTUALLY_HAPPENED
- Netlify account is Owner; site is Git-connected; Production deploy remains blocked by Free-plan credit exhaustion/HTTP 403.
- PR #761 merged an actionable tenant-context gate without weakening RLS, default tenant selection, or client tenant authority.
- PR #762 removed stale Phase-F preview targeting, added exact-head provenance validation, bounded Auth retries, timeout-safe logical restore, and Transaction Pooler reads for source snapshot/counts.
- Staging Supabase project recovered to ACTIVE_HEALTHY and direct PostgreSQL connectivity was re-proven.
- Evidence Passport for the real report job f0880ab8... was refreshed through the canonical RPC and now exists as VERIFIED/READY with FULL canonical coverage.
- A targeted migration removed public RPC execution from the three trigger-only Evidence Passport SECURITY DEFINER functions without changing trigger behavior.
 - The live Evidence Passport gate contract was aligned with the real work-item lifecycle: start before complete, and source-analysis evidence is used for completion evidence.
- Smart Report Advisor case persistence was corrected to use the Passport evidence snapshot from rendered provenance rather than the analysis snapshot id; a regression guard was added.
WHAT_IS_PROVEN = typecheck/build/intelligence/evidence-passport/operational-resilience/quality contracts, real f088 Evidence Passport, and live Work Item completion gate are proven; fresh provenance/auto-Passport repair awaits exact-head CI.
- npm run typecheck PASS.
- npm run build PASS.
- npm run test:report-advisor-intelligence PASS.
- npm run test:intelligence-vertical-slice PASS.
- npm run test:report-evidence-passport-contract PASS.
- npm run test:operational-resilience PASS.
- quality workflow PASS on the latest tested head before handoff-only failures.
- Phase 10 backup/restore static contract PASS.
- Production certification contract family PASS.
- Security-definer exposure contract PASS.
- Browser unauthenticated login surface PASS.
- Real report f0880ab8...: 735 source rows, quality 87, canonical coverage FULL, Evidence Passport VERIFIED/READY.
- Last product-code repair baseline = 2eabdd40837ab7a4f87a761168bd8495767d7476; current branch head adds only execution-state/report synchronization.
PHASE_F_HISTORY
- #4006: stale runtime fixed; first terminal failure was statement_timeout in logical backup/restore.
- #4007: statement timeout fixed; first terminal failure moved to Session Pooler ECHECKOUTTIMEOUT on source snapshot.
- #4008: Auth /token failed with 500/504 context deadline exceeded during a Supabase lifecycle interruption.
CURRENT_ACTIVE_FAILURE
CI_RECERTIFICATION = IN_PROGRESS
FIRST_TERMINAL_FAILURE_TO_TRUST = completed latest-head workflow result; queued/running runs are not PASS
PRODUCT_FRONTIER = Advisor case persistence provenance repair + automatic Passport refresh at report completion are now on the exact execution branch.
ROOT_CAUSE_EVIDENCE
- Earlier auth/database timeouts coincided with a project lifecycle interruption; that infrastructure condition is now recovered.
- Two stale/incorrect static contracts were corrected to match the live Transaction Pooler/runtime design.
OPEN
- Finish exact-head Browser proof through Advisor case persistence and Decision → Approval → Work → Outcome.
- Finish exact-head Phase-F live resilience evidence.
- Close Session Handoff and Final Certification on the exact branch head.
- Production Netlify deploy remains credit-blocked.
- tests/fixtures/realistic-reports/ still contains no real report files beyond README; no fabricated corpus will be added.
- Real-source 48-archetype proof remains unproven.
DO_NOT_REPEAT
- No stale SHA or queued-run PASS.
- No Service Role/user-token impersonation.
- No new Supabase project.
- No RLS/auth/evidence weakening.
- No fabricated real-report corpus or archetype coverage.
NEXT_EXACT_ACTION = certify exact head 9bec7dc45ba65ddd036aa02491c0b4574d579570; authenticated Browser E2E must prove save/readback, then close Phase-F and final certification.
