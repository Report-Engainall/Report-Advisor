# LIVE RESUME — 2026-10-15 / PR #925 customer-facing report hierarchy repair

Repository: Report-Engainall/Report-Advisor
PR: https://github.com/Report-Engainall/Report-Advisor/pull/925 (OPEN / NOT MERGED)
BRANCH = fix/netlify-runtime-provenance-on-main-20261014
CURRENT_EXACT_HEAD = f25af5867d40a665cbce502aef591fafe6d4f411 (functional checkpoint; following commits are documentation-only)
CODE_CHECKPOINT = f25af5867d40a665cbce502aef591fafe6d4f411
REPORT_FOR_HEAD = f25af5867d40a665cbce502aef591fafe6d4f411
MAIN_HEAD = b4bb9fe6f278fd7d2c2dcb76b144638549036565
UPDATED_AT = 2026-10-15T02:18:00Z
PRODUCT_COMPLETE = NO

## What was requested
Deliver a real customer-facing report experience for any uploaded report: lead with the decision-relevant conclusion, preserve the source/job/hash boundary, expose full analysis on demand, and prevent automated test artifacts from appearing as recent customer reports. Do not delete persisted records or weaken evidence, authentication, tenant isolation, or RLS.

## Implemented in the functional checkpoint
- `src/pages/SmartReportPage.tsx` (commit b7c59add29bd9f8769a51ed00a94ea29f398a0cb): moves the executive advisor brief ahead of bulky analysis; collapses the universal chain and wraps generic intelligence and raw source exploration in explicit, accessible detail disclosures.
- `src/pages/ReportsPage.tsx` (commit 8c6ac7fc9572e8476c63b3b117da0103f8ad4307; context guard follow-up f25af5867d40a665cbce502aef591fafe6d4f411): filters reserved `report-advisor-e2e-` file names from customer report selection and catalogue without deleting the persisted jobs; full intelligence and row exploration are progressive disclosures. Explicit reportJobId/sourceHash navigation remains supported.
- `scripts/real-business-e2e.mjs` (commit f92dc4f82f2703d6ddc76e5acac04b877c9009ad): browser proof explicitly opens the collapsed generic-intelligence disclosure before inspecting lineage/results.
- `scripts/customer-facing-report-surface-contract.test.mjs` (commit a02e4f5884c691aa5b4b251431cde3a7789fc84a): locks executive-first order, disclosures, automation-artifact filtering, and E2E interaction.

## What is proven right now
IMPLEMENTED = YES — all four functional files are committed in the PR branch.
READBACK-PROVEN = YES — GitHub file content and commits were read back.
ROUTE-PROVEN = Only previously verified preview upload route at https://deploy-preview-925--aghbari-report-advisor.netlify.app/import/analyze; that old preview is not proof of this new UI checkpoint.
BUILD / QUALITY / BROWSER-PROVEN = PENDING — consume exact-checkpoint Actions below; code edits and queued workflows are not test success.
PRODUCTION-PROVEN = NOT_PROVEN. Published Netlify production was still on SHA 858ef8e3e5bc5bf74430555eadfb9e6767be348b (deploy 6ac3d608e2e37d0008cc0222, 2026-10-05) at the last verified inventory.
PHASE-F = BLOCKED until authorized Netlify runtime configuration includes the required operational credential; prior exact-head probe returned 503 operational_token_not_configured. Never invent/expose secrets or relax tenant/RLS guards.
PRODUCT_COMPLETE = NO.

## Active failures and their causes
FIRST_ACTIVE_FAILURE = Session Handoff Contract run 38670174150 on this checkpoint failed with unreported paths: scripts/customer-facing-report-surface-contract.test.mjs, scripts/real-business-e2e.mjs, src/pages/ReportsPage.tsx, src/pages/SmartReportPage.tsx.
ROOT_CAUSE = Handoff docs still anchored REPORT_FOR_HEAD to 7d63d43aec5f1877c64e48f66145a4ecc5f60bba, so the checker correctly detected later product files as unreported. The checker must remain strict; this documentation checkpoint re-anchors at the current functional commit.
SECONDARY_NOTE = Quality run 38670097753 on an older moving merge ref failed diagnostics because the branch HEAD changed during the job; lint/build then failed from dependencies not being installed (eslint/vite missing). Do not treat that downstream failure as a code defect or a pass. Recheck the fresh exact-checkpoint runs.

## Exact-checkpoint workflow snapshot
- Product Build Gate: run 38670173962 — QUEUED when captured.
- Quality: run 38670174226 — IN_PROGRESS when captured.
- Full Product Browser E2E: run 38670174040 — PENDING when captured.
- Phase-F Live Resilience: run 38670174127 — QUEUED when captured; previous probe failed closed due to missing runtime operational token.
- Final Certification Gate: run 38670173837 — IN_PROGRESS when captured; do not infer its result.
- Session Handoff Contract: run 38670174150 — FAILED for stale report coverage; a fresh run must pass after this docs-only correction.

NEXT_EXACT_ACTION = Read the live PR head after these documentation commits; inspect fresh Product Build, Quality, Session Handoff, Full Product Browser E2E, Final Certification, and Phase-F on that exact SHA. Repair only the next observed failure. Keep PR #925 open and do not claim product completion or production proof.
SESSION HANDOFF = NOT READY

## Verification note
At the time of writing, source readback succeeded but fresh quality/build/browser results remain pending. No deployed runtime is claimed.