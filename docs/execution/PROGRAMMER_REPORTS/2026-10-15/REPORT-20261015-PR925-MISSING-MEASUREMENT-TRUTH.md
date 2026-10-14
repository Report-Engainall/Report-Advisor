# Execution Archive — 2026-10-15 / PR #925 missing-measurement truth fix

Repository: Report-Engainall/Report-Advisor
PR: https://github.com/Report-Engainall/Report-Advisor/pull/925
Branch: fix/netlify-runtime-provenance-on-main-20261014
Main baseline: b4bb9fe6f278fd7d2c2dcb76b144638549036565
Functional checkpoint: e4d8332a598366438eba2f831c817a5061edbe09
Test correction checkpoint: 7d1fdaa86d7f5bf167c3b51dfd54c71e764a96c8
Product complete: NO
Merge permitted: NO — exact-head certification and production resilience are not proven.

## Implemented
The functional commit e4d8332a598366438eba2f831c817a5061edbe09 modifies `src/lib/file-engine/generic-intelligence.ts` and `scripts/generic-file-analysis.test.mjs`:
- Missing monthly cells are not silently aggregated as zero.
- Entirely missing numeric months are reported unavailable with missing coverage.
- Stated totals expose numeric count and missing count.
- Reconciliation skips rows where any relevant monthly value is missing and separately counts these incomplete comparisons.
- A sparse monthly-data regression test covers these conditions.

The follow-up test commit 7d1fdaa86d7f5bf167c3b51dfd54c71e764a96c8 accepts the application’s Arabic-localized digit `١` as well as ASCII `1` when asserting the number of excluded rows. This corrects only the assertion formatting; the behavioral requirement remains unchanged.

## Exact-head evidence
- Functional commit: https://github.com/Report-Engainall/Report-Advisor/commit/e4d8332a598366438eba2f831c817a5061edbe09
- Test correction commit: https://github.com/Report-Engainall/Report-Advisor/commit/7d1fdaa86d7f5bf167c3b51dfd54c71e764a96c8
- Quality run on predecessor e4d8332a598366438eba2f831c817a5061edbe09: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38646392385 — failed at the new test assertion because of localized count formatting.
- Session handoff run on predecessor e4d8332a598366438eba2f831c817a5061edbe09: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38646392387 — correctly failed on stale baseline, listing the two functional paths as unreported.
- Product Build: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38646392171 — status on predecessor is not transferable.
- Final Certification: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38646392375 — status on predecessor is not transferable.
- Browser E2E: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38646392119 — status on predecessor is not transferable.
- Phase-F: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38646392275 — status on predecessor is not transferable.
- Earlier Phase-F run 38610637235 on 8d93a28 proved health SHA and rollback, but failed tenant-canary HTTP 503 `operational_token_not_configured`: https://github.com/Report-Engainall/Report-Advisor/actions/runs/38610637235.

## Production blocker
Netlify site-level environment inventory lacks `RESILIENCE_OPERATIONAL_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY`. The production publish workflow also requires `NETLIFY_AUTH_TOKEN`, which connected GitHub tools cannot administer. The current Netlify deploy (6ac3d608e2e37d0008cc0222) is ready but stale. Do not fabricate credentials, expose secrets, or relax tenant/RLS guards.

## Status
IMPLEMENTED = YES.
READBACK-PROVEN = YES for functional and test commits; docs-only checkpoint still needs branch ref update/readback.
TESTED = PENDING final exact-head CI.
BROWSER-PROVEN = NOT_PROVEN on the final head.
PRODUCTION-PROVEN = NOT_PROVEN.
PRODUCT_COMPLETE = NO.

## Next action
Attach the documentation-only checkpoint after 7d1fdaa86d7f5bf167c3b51dfd54c71e764a96c8, read back PR head/files, then inspect the new exact-head quality, build, handoff, certification, browser and Phase-F results. Address external Netlify runtime credentials through authorized configuration, not code workarounds.
