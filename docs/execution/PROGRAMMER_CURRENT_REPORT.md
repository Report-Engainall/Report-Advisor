SESSION HANDOFF = ACTIVE
PROGRAMMER_REPORT_STATUS = EXACT_HEAD_PROOF_AND_ENVIRONMENT_CLEANUP
CURRENT CODE HEAD = 96d6d4dc02d399d1089169bb092fc5e6402983e3
BRANCH = exec/decision-completion-20261007
PR = #867
BASE MAIN HEAD = d0620d988c1dbf93d50ca3b9086f6a244f659f41

WHAT_ACTUALLY_CHANGED
- Removed Netlify/host-based route hijack from App.tsx. Real routes no longer become ProposalDemoPage automatically.
- Public preview is now explicit via /proposal-demo, ?demo=1, or ?preview=1.
- Added public-preview smoke contract that rejects host-based hijacking and checks the real /reports/inventory route reaches the workspace/login surface.
- brain.v1 closure remains: metrics -> signals -> benchmark -> recommendation -> work -> outcome -> learning, fail-closed on verified evidence.
- Added indexed service-role E2E actor lookup and bounded stale generated-actor cleanup.
- Added workflow cleanup bounds and made the public route contract part of Full Product Browser E2E.

LIVE PROOF
- Netlify deploy-preview for current head 96d6d4dc02d399d1089169bb092fc5e6402983e3 = SUCCESS.
- TinyFish exact preview:
  /reports/inventory => real application landing/workspace-login surface, not ProposalDemoPage.
  /proposal-demo => explicit fixture demo with 12 source rows/11 fields and 1.84 low-coverage signal.
- Preview metadata reports aghbari-source-sha = 96d6d4dc02d399d1089169bb092fc5e6402983e3.

ENVIRONMENT FINDINGS
- Supabase staging contains 5,176 tagged full-product E2E users; 3,915 generated ephemeral users are older than 24 hours.
- Corpus tenants contain large accumulated active memberships.
- This accumulation is a concrete contributor to previous Auth/Postgres contention.
- Indexed lookup + cleanup is implemented, and the cleanup migration is applied to staging.
- Current cleanup only targets generated @e2e.report-advisor.invalid actors.

REAL SOURCE STATE
- 3,592 completed report jobs.
- 3,284 distinct source hashes.
- 489 source analysis snapshots / 181 distinct analyzed sources.
- 78 VERIFIED/READY evidence passports across 42 distinct sources.
- 78 VERIFIED/FULL evidence snapshots across 42 distinct sources.
- 48/48 runtime proof remains NOT_PROVEN; proof script derives archetypes from canonical source-analysis data.

NOT_PROVEN
- Full Product Browser E2E exact-head terminal PASS.
- 48/48 real-source runtime proof.
- Authenticated business E2E + tenant isolation.
- Production runtime proof.
- Product certification.

INFRASTRUCTURE NOTE
- Vercel current status is failure only because of free build-rate-limit/upgradeToPro. Do not use this as a product defect signal.
- Netlify is the current deploy-proof channel for this session.

NEXT EXACT ACTION
Consume terminal GitHub Actions for exact head 96d6d4dc02d399d1089169bb092fc5e6402983e3. Inspect Full Product Browser E2E first, especially actor cleanup and authenticated browser result; then inspect blocking 48/48 proof. No certification claim before terminal evidence.
