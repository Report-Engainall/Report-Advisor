SESSION HANDOFF = ACTIVE
ACTION_STATUS = EXACT_HEAD_PROOF_AND_ENVIRONMENT_CLEANUP
CURRENT_CODE_HEAD = 96d6d4dc02d399d1089169bb092fc5e6402983e3
CURRENT_EXECUTION_BRANCH = exec/decision-completion-20261007
PR = #867
BASE_MAIN_HEAD = d0620d988c1dbf93d50ca3b9086f6a244f659f41

ROOT CAUSE CLOSED
- Netlify preview host detection in App.tsx previously hijacked every route into ProposalDemoPage. This was real architectural misrepresentation.
- Fixed: real routes now pass through AuthGate/AppShell; demo is explicit via /proposal-demo, ?demo=1 or ?preview=1.
- Public preview contract now statically rejects host-based route hijacking, and public-preview-smoke is part of the browser gate.
- Exact Netlify preview for current route-fix ancestor proved /reports/inventory shows the real workspace/login gate, not the demo; /proposal-demo remains the explicit fixture demo.

BRAIN CLOSURE
- brain.v1 unifies metrics, signals, internal benchmark, outcome, learning and work proposal.
- Decision readiness fails closed until evidenceVerified + evidenceSnapshotId + evidencePassportId.
- decision_outcomes and recommendation_outcomes feed back into the brain.
- recommendation.id is canonical; report recommendation keys are never cast into UUID task source_id.
- sparse-row-safe metric math and entity-comparable internal benchmarks are enforced by tests.
- Advisor Case, Decision Cockpit, Business Questions, DuckDB/Arrow, Semantic Metrics and existing approval/work/outcome contracts have real code + contract coverage.

E2E ENVIRONMENT ROOT CAUSE
- Staging currently contains 5,176 tagged full-product E2E users; 3,915 are generated ephemeral users older than 24h.
- Corpus tenants also accumulated hundreds/thousands of active memberships.
- This accumulation is a concrete source of Auth/Postgres pressure and previous CI contention.
- Added service-role-only RPCs for indexed actor lookup and bounded stale generated-actor discovery.
- Provision script now avoids auth.listUsers scans and cleans up up to 1,000 stale generated actors per run via auth.admin.deleteUser.
- Cleanup is restricted to @e2e.report-advisor.invalid generated actors; configured human test accounts are not targeted.
- The new migration is applied to staging.

REAL SOURCE READBACK
- Staging has 3,592 completed report jobs and 3,284 distinct source hashes.
- 489 source analysis snapshots across 181 distinct sources.
- 78 evidence passports, all VERIFIED/READY across 42 distinct source hashes.
- 78 evidence snapshots VERIFIED/FULL across the same 42 sources.
- 48/48 runtime proof is still NOT_PROVEN; the proof script correctly derives archetypes from canonical source analysis rather than trusting rendered archetype metadata.

DEPLOYMENT PROOF
- Netlify exact preview for commit 96d6d4dc02d399d1089169bb092fc5e6402983e3 = SUCCESS.
- TinyFish exact preview shows /reports/inventory is the real workspace/login surface and /proposal-demo is the explicit fixture demo.
- Vercel is not a valid current proof channel because it is failing with build-rate-limit/upgradeToPro; this is infrastructure quota, not a product build failure.

NOT_PROVEN
- Full Product Browser E2E on exact head 96d6d4dc02d399d1089169bb092fc5e6402983e3 has not reached terminal PASS.
- 48/48 real-source runtime proof not proven.
- Authenticated business E2E and tenant isolation not proven.
- Production runtime not proven.
- Therefore no CERTIFIED / PRODUCT COMPLETE / PRODUCTION PROVEN claim.

NEXT EXACT ACTION
Consume terminal GitHub Actions for exact head 96d6d4dc02d399d1089169bb092fc5e6402983e3. Inspect Full Product Browser E2E first; confirm stale-actor cleanup and authenticated browser result; then inspect 48/48 real-source proof. Do not use Vercel as a gate, and do not rerun closed suites without an exact-head regression trigger.
