SESSION HANDOFF = NOT READY
REPORT_FOR_HEAD = 7a0e9f44773f81cbac84d30a53e8df677f5341c8
UPDATED_AT = 2026-10-07T15:05:00Z
CURRENT_EXACT_HEAD = 7a0e9f44773f81cbac84d30a53e8df677f5341c8
BRANCH = exec/decision-completion-20261007
PR = #867
REPORT_STATUS = EXACT_HEAD_PROOF_AFTER_SECURITY_AND_PREVIEW_CONTRACT_FIXES

WHAT_I_WAS_ASKED_TO_DO = Make the Report-Advisor product genuinely sellable by closing real product/runtime/proof gaps without restarting the project, and keep exact-head evidence authoritative.

WHAT_I_ACTUALLY_DID
- Removed the Netlify host-based route hijack so real routes render AuthGate/AppShell; /proposal-demo and explicit preview/demo query modes are the only demo entry points.
- Integrated brain.v1 across the intelligence path with fail-closed verified-evidence rules, real metrics/signals/benchmark/outcome/learning/work states.
- Fixed sparse-row calculations, comparable internal benchmark grain, and the parseDate/getTime runtime crash.
- Added indexed service-role-only E2E actor lookup plus bounded generated-user cleanup.
- Hardened the new E2E SECURITY DEFINER functions with fixed pg_catalog search_path and explicit service_role-only EXECUTE grants.
- Updated stale preview-route contracts so they verify the current explicit routing behavior instead of the deleted host-hijack implementation.
- Repaired session handoff state to point at this exact head.

WHAT_IS_PROVEN
- Production Build Gate: PASS on af78f9bc5f8ecb9421b05164be38c5f1a124b395.
- Commercial Product Creation E2E: PASS on af78f9bc5f8ecb9421b05164be38c5f1a124b395.
- Supabase staging verification: both E2E actor functions are fixed to search_path=pg_catalog; anon/authenticated cannot EXECUTE; service_role can EXECUTE.
- The exact-head codebase typecheck/production build and product contracts passed on af78f9bc5f8ecb9421b05164be38c5f1a124b395 before the later migration/test-contract commits.
- Earlier live Netlify proof established the real route surface on the route-fix artifact.

FIRST_ACTIVE_FAILURE = Latest exact head 7a0e9f44773f81cbac84d30a53e8df677f5341c8 is still running its terminal proof set; no terminal PASS has been established yet.

ROOT_CAUSE = The last terminal failures were governance/test drift rather than a new business-runtime defect: obsolete SECURITY DEFINER migration assertions, obsolete host-hijack preview assertions, and stale handoff metadata. Each was corrected at source and re-run from a newer exact head.

NEXT_EXACT_ACTION = Consume Full Product Browser E2E and Final Certification for 7a0e9f44773f81cbac84d30a53e8df677f5341c8. Do not declare product complete or release it to main until those exact-head runs and the 48/48 real-source proof terminate successfully.

NOTES
- Vercel free-plan build-rate-limit remains infrastructure/quota noise and is not the product verdict.
- Netlify remains the available public preview/evidence channel.
