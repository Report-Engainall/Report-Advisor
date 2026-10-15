# Execution Archive — 2026-10-14 / PR #925 Netlify runtime provenance and tenant canary

Repository: Report-Engainall/Report-Advisor
PR: https://github.com/Report-Engainall/Report-Advisor/pull/925
Branch: fix/netlify-runtime-provenance-on-main-20261014
Main baseline: b4bb9fe6f278fd7d2c2dcb76b144638549036565
Code checkpoint: f4994137d1b8ae09103b8a3e19abe3deee1c02b7
Code commit: https://github.com/Report-Engainall/Report-Advisor/commit/f4994137d1b8ae09103b8a3e19abe3deee1c02b7
Product complete: NO
Merge permitted: NO — exact-head CI and production proof are outstanding.

## Implemented
- Packaged generated runtime-provenance.json with Netlify functions.
- Restored the /api/tenant-canary route and added fail-closed RLS tenant isolation checks with a focused runtime regression test.
- Strengthened health/rollback functions to report source SHA, deployment SHA, and deployment ID from provenance/runtime variables.
- Required a valid 40-character source SHA and added GitHub exact-SHA fallback for CI builds.
- Added post-publish Netlify exact-SHA verification, mandatory operational-resilience assertions, and Browser/Phase-F path-filter coverage.
- Registered the tenant-canary test in test:operational-resilience.
- No operational token, service key, RLS, or tenant authorization was invented or weakened.

## Exact evidence
- Original code checkpoint: f4994137d1b8ae09103b8a3e19abe3deee1c02b7
- Handoff failure: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38610276919 — reported 11 code/config/test paths as unreported.
- Main Product Build Gate: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38607598583 (PASS on main b4bb only).
- Main Quality: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38607598548 (PASS on main b4bb only).
- Main Full Product Browser E2E: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38607598239 (PASS on main b4bb only).
- Main Phase-F: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38607598224 (FAIL on main b4bb; health and rollback SHA proof absent, tenant-canary unavailable).
- Production Vercel app-shell response: HTTP 200 with source SHA matching b4bb; /api/health is HTTP 503 operational_token_not_configured.
- Netlify current published commit: 858ef8e3e5bc5bf74430555eadfb9e6767be348b, not main.

## Truth boundary
IMPLEMENTED = YES.
READBACK-PROVEN = YES for the source commit/PR/files.
TESTED = PENDING on the successor PR tip; no PASS is inherited from older heads.
PERSISTED = NOT_APPLICABLE; no report/business data writes.
BROWSER-PROVEN = PASS on main checkpoint only; PR #925 exact-head browser run pending.
PRODUCTION-PROVEN = NO.
PRODUCT_COMPLETE = NO.

## First remaining blocker
The deploy/runtime credentials cannot be synthesized safely. GitHub reports missing NETLIFY_AUTH_TOKEN, the Netlify environment has no RESILIENCE_OPERATIONAL_TOKEN or SUPABASE_SERVICE_ROLE_KEY, and Vercel's public /api/health returns operational_token_not_configured. Do not expose secrets, inject guessed values, or lower the resilience gate.

## Next action
Read the new PR #925 successor head's Quality, Product Build, Session Handoff, Final Certification, Browser E2E, and Phase-F results; repair the first real assertion. Production is not accepted until a fresh deploy proves exact source/deployment SHA and authenticated tenant/backup/rollback probes pass.
