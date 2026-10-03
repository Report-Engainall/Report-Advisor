# PROGRAMMER CURRENT REPORT
SESSION_HANDOFF = NOT READY
PROGRAMMER_REPORT_STATUS = ACTIVE_EXECUTION
CURRENT MAIN HEAD = 7e9cec1b8ee318520702c8b29ae1ec14aa2d5ff6
CURRENT EXECUTION HEAD = 0771059dd1c505aa72eb8d6a855df43eb9c698c6
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
8. Latest-head recertification was triggered after Supabase recovery; current terminal results are still pending.
9. Removed the stale Phase-F runtime-closure assertion for deploy-preview-754; the workflow remains PR-number dynamic and explicitly rejects that stale preview.
10. Aligned the Phase-10 backup/restore static contract with the real runtime: source snapshot/count reads use the resolved Transaction Pooler URI (6543), while pg_dump remains on runnerSource.
11. Increased E2E actor provisioning recovery budget to 360s with 15s per HTTP attempt across both browser workflows and the provisioning script.
12. Re-proved staging health and direct PostgreSQL connectivity through the connected Supabase control plane.
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
The earlier infrastructure interruption produced Auth/DB timeouts and is now recovered. Two static contract defects were then corrected on the current execution branch: stale preview-754 closure assertions and a backup/restore assertion that no longer matched Transaction Pooler source reads. Browser actor provisioning was also given a larger bounded recovery budget.
FILES / COMMITS
- src/components/AuthGate.tsx via PR #761 -> 9d78baf6... -> main 7e9cec1...
- .github/workflows/phase-f-live-resilience.yml via PR #762 -> current bc63be68...
- netlify.toml and scripts/phase-f-live-resilience-probes.mjs via PR #762
No schema/data/RLS weakening was introduced.
REMAINING OPEN
- finish latest-head Phase-F live resilience evidence
- Production Netlify deploy remains credit-blocked
- realistic-report corpus under tests/fixtures/realistic-reports/ is still empty except README; no fabricated corpus will be added
- real-source 48-archetype proof remains unproven
- finish authenticated Chromium Auth/Tenant/Product/Import/Smart Report proof
- close Session Handoff and Final Certification gates
- complete authenticated Edge/Smart Report browser journey
- Production Netlify deploy remains credit-blocked
- real realistic-report corpus and real-source archetype proof remain unproven
DO_NOT_REPEAT
No stale PASS, no queued-run PASS, no Service Role impersonation, no new Supabase project, no tenant/RLS bypass, no fabricated corpus/archetype coverage.
NEXT EXACT ACTION = consume latest-head CI terminal results, then repair only the first completed failure and re-run that exact gate on the same head
