# Execution report — 2026-10-14 — Generic source completeness

Repository: Report-Engainall/Report-Advisor
Branch: fix/generic-source-completeness-20261014
Base main at branch creation: b4bb9fe6f278fd7d2c2dcb76b144638549036565
Functional code checkpoint: 3355fc58cede5c7313c2c828b795246131f3c60e
Related PR: pending creation; PR #925 is a separate open release-provenance PR.

## Verified defect

The smart-report code computed whether canonical rows were complete, partial, failed, or capped, but did not pass that status to the generic-source-row selector. The selector accepted any nonempty canonical rowset. When a read had returned only part of the source, generic intelligence could analyze that partial set while its dataset row count was copied from the declared source-analysis count.

## Fix implemented

- src/lib/file-engine/generic-source-rows.ts now accepts completeness and expected-row-count constraints and refuses partial/mismatched canonical rows.
- src/lib/report-smart.ts passes canonicalRowsComplete and sourceRowCount to the selector, only proceeds with a complete rowset, emits an explicit Arabic warning when no complete rowset is available, and reports the verified selected-row count.
- scripts/generic-file-analysis.test.mjs adds regression checks for canonical precedence, partial canonical + complete snapshot fallback, fail-closed when both sources are incomplete, and canonical expected-count mismatch.

Functional commit chain:
1. edf7c9ad145b776fd8b4bf99243f58befc219b78 — selector
2. 29247ec2fa1f40830e331cbb146e7cb9ca0e6126 — regression tests
3. 3355fc58cede5c7313c2c828b795246131f3c60e — runtime wiring and final functional checkpoint

## Test evidence at report time

The new branch's tests have NOT RUN yet; a PR must be opened to trigger the exact-head GitHub Actions checks. Do not treat the existence of test assertions as a passing test.

Previously observed PR #925 evidence belongs only to its own head 8d93a28e0d7824f4028b1a9e8e5742d65a666080:
- Product Build Gate: PASS — https://github.com/Report-Engainall/Report-Advisor/actions/runs/38610637454
- Quality: PASS — https://github.com/Report-Engainall/Report-Advisor/actions/runs/38610637553
- Final Certification: PASS — https://github.com/Report-Engainall/Report-Advisor/actions/runs/38610636938
- Full Product Browser E2E: PASS — https://github.com/Report-Engainall/Report-Advisor/actions/runs/38610637227
- Phase-F Live Resilience: FAIL — https://github.com/Report-Engainall/Report-Advisor/actions/runs/38610637235; live tenant-canary returned HTTP 503 operational_token_not_configured.

## Remaining release blocker

Netlify live configuration returned the existing Supabase URL/public anon configuration and company/canary IDs, but did not contain runtime RESILIENCE_OPERATIONAL_TOKEN or SUPABASE_SERVICE_ROLE_KEY. Values must be supplied by the authorized owner through a secure configuration channel. No fake secrets, service role client-side keys, tenant isolation bypasses, or fail-open changes were introduced. Production is NOT_PROVEN.

## Next exact action

Open a PR from `fix/generic-source-completeness-20261014`; confirm `test:generic-file-analysis`, Quality, Product Build, Session Handoff and Final Certification on the final PR head. Inspect any failure's actual logs and correct the root cause without weakening acceptance checks. Keep PR #925 and this branch unmerged until their required acceptance criteria are proven.
