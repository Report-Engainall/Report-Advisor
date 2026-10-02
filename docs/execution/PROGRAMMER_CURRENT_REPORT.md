# PROGRAMMER CURRENT REPORT
SESSION_HANDOFF = NOT READY
PROGRAMMER_REPORT_STATUS = ACTIVE_EXECUTION
CURRENT MAIN HEAD = 7e9cec1b8ee318520702c8b29ae1ec14aa2d5ff6
CURRENT EXECUTION HEAD = bc63be68f04e11ead63f0a865695e29529a5e085
BRANCH = captain/phase-f-dynamic-pr-preview-20261003
PR = #762 OPEN
UPDATED = 2026-10-03
WHAT_ACTUALLY_HAPPENED
1. Netlify deploy permission was diagnosed: Owner account, correct team/site, no SSO block; Production 403 is Free-plan credit exhaustion.
2. Exact-head Netlify Branch Preview was established for PR #762; /api/health provenance matched exact deployment SHA.
3. PR #761 was merged and turned tenant-missing from a dead end into actionable membership recovery without weakening tenant authority.
4. Phase-F stale deploy-preview-754 targeting was removed; dynamic PR target + exact-head health provenance was added.
5. Auth retry was bounded with a 15s request timeout, converting silent hangs into terminal evidence.
6. Logical restore removed session statement-timeout truncation and added stage-specific failure labels.
7. Source snapshot/count reads moved to Transaction Pooler :6543 while pg_dump remains on Session Pooler.
8. Current Phase-F #4008 reached auth and then failed on Supabase Auth /token 500/504 context deadline exceeded; live probes were skipped.
WHAT_IS_PROVEN
- typecheck PASS
- build PASS
- report-advisor intelligence PASS
- intelligence vertical slice PASS
- evidence passport contract PASS
- operational resilience PASS
- workflow syntax/node checks PASS
- exact-head Netlify Preview provenance PASS before Supabase lifecycle interruption
- unauthenticated browser login surface PASS
FIRST_ACTIVE FAILURE
SUPABASE PROJECT LIFECYCLE = PAUSING
The project was paused as the reversible infrastructure recovery for the observed Auth/DB connection failures; restore is currently rejected while the project remains PAUSING.
ROOT CAUSE
Auth logs show repeated /token 504 request_timeout/context deadline exceeded and a 500 context canceled.
Direct Postgres execute_sql independently returns Connection terminated due to connection timeout.
Supabase performance advisor also cannot open the project DB connection.
Public Supabase status currently shows no matching regional incident; this is therefore tracked as project-specific until disproven.
FILES / COMMITS
- src/components/AuthGate.tsx via PR #761 -> 9d78baf6... -> main 7e9cec1...
- .github/workflows/phase-f-live-resilience.yml via PR #762 -> current bc63be68...
- netlify.toml and scripts/phase-f-live-resilience-probes.mjs via PR #762
No schema/data/RLS weakening was introduced.
REMAINING OPEN
- return fnqbvfuwbdpwvhcgzksl to ACTIVE_HEALTHY
- prove direct DB connectivity and fresh Auth /token
- rerun Phase-F at exact bc63be68 and fix first terminal failure only
- complete authenticated Edge/Smart Report browser journey
- Production Netlify deploy remains credit-blocked
- real realistic-report corpus and real-source archetype proof remain unproven
DO_NOT_REPEAT
No stale PASS, no queued-run PASS, no Service Role impersonation, no new Supabase project, no tenant/RLS bypass, no fabricated corpus/archetype coverage.
NEXT EXACT ACTION = RESTORE EXISTING SUPABASE STAGING PROJECT THROUGH OWNER DASHBOARD/OFFICIAL SUPPORT UNTIL ACTIVE_HEALTHY, THEN VERIFY DB + AUTH AND RERUN PR #762 EXACT HEAD bc63be68f04e11ead63f0a865695e29529a5e085.
