# CURRENT SESSION STATE
SESSION_HANDOFF = NOT READY
ACTION_STATUS = BLOCKED_ON_SUPABASE_LIFECYCLE
CURRENT_MAIN_HEAD = 7e9cec1b8ee318520702c8b29ae1ec14aa2d5ff6
CURRENT_EXECUTION_HEAD = bc63be68f04e11ead63f0a865695e29529a5e085
BRANCH = captain/phase-f-dynamic-pr-preview-20261003
PR = #762 OPEN
PR_PRODUCT_DELTA = #761 MERGED
PR_PRODUCT_DELTA_SHA = 9d78baf6ef00fac9c9cbd975b1ae0d737b100b23
CURRENT_PRODUCT_MAIN = 7e9cec1b8ee318520702c8b29ae1ec14aa2d5ff6
CURRENT_PR_HEAD = bc63be68f04e11ead63f0a865695e29529a5e085
WHAT_ACTUALLY_HAPPENED
- Netlify account is Owner; site is Git-connected; Production deploy remains blocked by Free-plan credit exhaustion/HTTP 403.
- PR #761 merged an actionable tenant-context gate without weakening RLS, default tenant selection, or client tenant authority.
- PR #762 removed stale Phase-F preview targeting, added exact-head provenance validation, bounded Auth retries, timeout-safe logical restore, and Transaction Pooler reads for source snapshot/counts.
- Preview deploy for bc63be68 was exact-head proven before the Supabase lifecycle interruption.
WHAT_IS_PROVEN
- npm run typecheck PASS.
- npm run build PASS.
- npm run test:report-advisor-intelligence PASS.
- npm run test:intelligence-vertical-slice PASS.
- npm run test:report-evidence-passport-contract PASS.
- npm run test:operational-resilience PASS.
- git diff --check PASS; node --check phase-f-live-resilience-probes.mjs PASS.
- Browser unauthenticated login surface on deploy-preview-762 was rendered successfully.
PHASE_F_HISTORY
- #4006: stale runtime fixed; first terminal failure was statement_timeout in logical backup/restore.
- #4007: statement timeout fixed; first terminal failure moved to Session Pooler ECHECKOUTTIMEOUT on source snapshot.
- #4008: current PR head bc63be68; exact-head/provenance/local contracts passed, then Supabase Auth /token failed with 500/504 context deadline exceeded after six bounded retries.
CURRENT_ACTIVE_FAILURE
SUPABASE_PROJECT_LIFECYCLE = PAUSING
RECOVERY_TRIGGER = project-level Auth 500/504 plus direct PostgreSQL connection timeout
RESTORE_ATTEMPT = rejected while project remains PAUSING
SUPABASE_PROJECT = fnqbvfuwbdpwvhcgzksl / Report-Advisor-P0-2-Staging
RUNTIME_PROOF = exact-head Preview proven before lifecycle pause; authenticated business proof NOT_PROVEN
ROOT_CAUSE_EVIDENCE
- auth_logs: /token returned repeated 504 request_timeout/context deadline exceeded and one 500 context canceled.
- direct execute_sql: Connection terminated due to connection timeout.
- performance advisor call also failed on project connection timeout.
- Supabase public status currently shows Auth/Database/Connection Pooler operational; no matching public incident found.
OPEN
- Restore the existing Supabase staging project from PAUSING.
- Re-prove ACTIVE_HEALTHY, direct DB connectivity, and fresh Auth /token.
- Rerun Phase-F on bc63be68 and fix only its first terminal failure.
- Complete authenticated Edge/Smart Report business proof.
- Production Netlify deploy remains credit-blocked.
- Real realistic-report corpus and real-source 48-archetype proof remain unproven.
DO_NOT_REPEAT
- No stale SHA or queued-run PASS.
- No Service Role/user-token impersonation.
- No new Supabase project.
- No RLS/auth/evidence weakening.
- No fabricated real-report corpus or archetype coverage.
NEXT_EXACT_ACTION = RESTORE fnqbvfuwbdpwvhcgzksl through the Owner Supabase Dashboard/official support path until ACTIVE_HEALTHY, then verify DB + Auth and rerun PR #762 at exact head bc63be68f04e11ead63f0a865695e29529a5e085.
