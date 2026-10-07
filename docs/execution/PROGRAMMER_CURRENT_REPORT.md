SESSION HANDOFF = ACTIVE
PROGRAMMER_REPORT_STATUS = EXACT_HEAD_PROOF_AND_ENVIRONMENT_CLEANUP
CURRENT EXECUTION HEAD = bf0dbf32fa98b64861f0acb308387b96da4bd773
LATEST APP ROUTE-FIX HEAD = e6f0c6d19a18730cf0b29c4b7522c6971947bb8f
BASE MAIN HEAD = d0620d988c1dbf93d50ca3b9086f6a244f659f41
BRANCH = exec/decision-completion-20261007
PR = #867

WHAT_ACTUALLY_CHANGED
- Netlify host detection no longer hijacks real application routes into ProposalDemoPage.
- Demo routes are explicit: /proposal-demo, ?demo=1, ?preview=1.
- Added public-preview anti-hijack contract and browser smoke coverage.
- brain.v1 remains the real unified intelligence runtime with fail-closed evidence.
- Fixed parseDate/getTime crash and sparse-row metric math.
- Added service-role-only indexed E2E actor lookup and bounded stale generated-actor cleanup.
- Cleanup default is 250 actors per run, concurrency 5, to avoid reintroducing Auth/Postgres contention.

PROVEN NOW
- Netlify deploy-preview on the route-fix code is READY/SUCCESS.
- Live preview proves /reports/inventory is the real workspace/login surface and /proposal-demo is the explicit fixture demo.
- Preview metadata identified product-code artifact e6f0c6d19a18730cf0b29c4b7522c6971947bb8f.
- New staging RPCs are actually SECURITY DEFINER and ACL-restricted to postgres/service_role only.
- Staging counts: 3,592 completed report jobs; 3,284 distinct source hashes; 489 source-analysis snapshots; 181 analyzed sources; 78 VERIFIED/READY passports; 78 VERIFIED/FULL snapshots; 42 distinct verified source hashes.

ENVIRONMENT ROOT CAUSE
- 5,176 tagged E2E users exist in staging; 3,915 generated ephemeral users are older than 24h.
- Corpus tenants contain very large accumulated active memberships.
- This is a concrete contributor to historical Auth/Postgres contention.
- Cleanup is now bounded and targets only generated test identities; no direct mass deletion was executed manually.

NOT_PROVEN
- Full Product Browser E2E terminal PASS on current exact execution head.
- 48/48 real-source runtime proof.
- Authenticated business E2E / tenant isolation.
- Production runtime proof.
- Certification / Product Complete.

INFRASTRUCTURE
- Vercel currently fails with provider build-rate-limit/upgradeToPro. Treat this as quota failure, not product failure.
- Netlify remains the live preview evidence channel.

NEXT EXACT ACTION
Consume terminal Full Product Browser E2E for current exact execution head. Inspect actor cleanup/readback and authenticated browser proof first, then the blocking 48/48 real-source proof. Do not declare certification without exact-head terminal evidence.
