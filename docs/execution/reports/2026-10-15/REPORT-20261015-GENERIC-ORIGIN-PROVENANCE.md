# Execution Report — 2026-10-15 — Generic intelligence source-origin provenance

Repository: Report-Engainall/Report-Advisor
PR: https://github.com/Report-Engainall/Report-Advisor/pull/926
Branch: fix/generic-source-completeness-20261014
Code checkpoint: 2b65b597307a6b17d98549b30c1c4097a168b0d4
Product complete: NO

## Root cause
The generic row selector already returns whether the complete source-bound dataset came from canonical rows or a verified source-analysis snapshot. The API result dropped this origin, and both Smart Report and the customer-facing report surface guessed the origin from `canonicalRows.length === 0`. A partial but nonempty canonical rowset with a complete snapshot fallback could therefore be presented as canonical analysis.

## Change implemented
- Added `genericIntelligenceSource` to `SmartReportDetail`.
- Changed `buildGenericDatasetForReport` to preserve the selector's chosen origin alongside the built dataset.
- Returned that origin from `fetchSmartReport`.
- Updated `SmartReportPage.tsx` and `CustomerReportSurface.tsx` to pass the true origin to `GenericFileIntelligenceCard`.
- Updated the smart-report surface contract test to require propagation and reject the old row-count heuristic.

## Commits
- `a98794a14bf8395ce96ddd6414820d779b472f3a` — carry selected generic origin in the report read model
- `d3c9c62e2ae602fc50cfda34f754fd640351addb` — use the actual origin on the Smart Report page
- `c1e00ec36bffa3b8cf96adfbbae45775b57837ae` — use the actual origin on the customer report surface
- `2b65b597307a6b17d98549b30c1c4097a168b0d4` — enforce the provenance invariant in the contract test

## Evidence and limits
- IMPLEMENTED: yes, in the GitHub branch.
- PERSISTED: commit writes returned successfully; fresh remote readback is pending.
- TESTED: PENDING on this exact code head. Predecessor PASS results are not inherited.
- BROWSER-PROVEN: not yet proven on this code head.
- PRODUCTION-PROVEN: NOT_PROVEN.
- Product completion: NO.

## Release blocker retained
PR #925 Phase-F run 38610637235 failed with `operational_token_not_configured`. Netlify production deploy 6ac3d608e2e37d0008cc0222 points to stale SHA `858ef8e3e5bc5bf74430555eadfb9e6767be348b`. No credentials, secrets, RLS guard, tenant-isolation test or release gate was fabricated, disclosed or weakened.

## Next action
Read back the changed paths from the latest branch head; then close exact-head CI and browser verification for PR #926. Continue the separate PR #925 release blocker only with authorized runtime and deployment credentials.
