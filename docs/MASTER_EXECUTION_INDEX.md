# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-29
Repository: Report-Engainall/Report-Advisor
Branch: forensic/migration-security-closure-20260829

## Permanent execution policy
PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Authoritative baseline
- Certification candidate: 4da16b9a7433e66ccf8a62b183552a872a718ef8
- Main remains untouched by this forensic branch.
- Runtime certification remains blocked.

## Newly executed forensic cycle — 2026-08-29
### Migration drift
Live Supabase project fnqbvfuwbdpwvhcgzksl reports 21 migrations after the repository's 20260829024000 hardening point, ending with harden_watched_report_file_tenant_boundary.

Status: NOT PROVEN CLOSED.
Decision: do not invent SQL or rewrite migration history. Recover exact provenance from PRs/branches first; reconstruct only unrecoverable deltas from schema evidence with explicit provenance.

Evidence: docs/EVIDENCE/2026-08-29-migration-security-forensic-closure.md

### Security boundary
Supabase security advisor reports authenticated EXECUTE on multiple SECURITY DEFINER functions. Direct catalog inspection confirms fixed search_path and tenant/actor checks on the sensitive decision/runtime mutation functions inspected.

Status: REVIEW REQUIRED, not an automatic vulnerability.
Next: prove runtime callers, then minimize authenticated EXECUTE only where unused; retain privileged RPCs where they are the intentional tenant-bound mutation boundary.

### RLS advisor
public.companies has RLS enabled with no policies.
Status: INFO / deny-by-default shape; no permissive policy added merely to silence the advisor.

## Prior release-path finding
Production deep route /dashboard on the deployment bound to 4da16b9... returned Vercel 404 while / returned 200. PR #97 contains the canonical SPA rewrite and CI evidence. It remains unmerged; no production promotion is claimed.

## Required next execution fronts
1. Recover exact SQL provenance for post-baseline migrations from PR #93, #95 and other originating branches.
2. Build a repository/live migration reconciliation matrix.
3. Audit every authenticated SECURITY DEFINER grant against repository and runtime callers.
4. Add privileged-RPC caller-boundary regression coverage.
5. Re-run security/performance advisors after justified DDL/security changes.
6. Re-run exact-head CI on every resulting SHA.
7. Fresh deployment + authenticated browser route/network/console sweep.
8. Independent real-data reconciliation remains mandatory.

## Status ladder
IMPLEMENTED = code exists.
REGRESSION = guard exists; execution must be evidenced.
NOT PROVEN = evidence incomplete.
BLOCKED = required external/live evidence unavailable.
PASS = only exact-head evidence-backed.
CERTIFIED = prohibited until all critical release gates are proven.

PRODUCTION CERTIFIED = NO.
100% REAL RELEASE READY = NO.


## Append-only correction — 2026-08-29
The prior branch revision accidentally replaced historical index content. This revision restores the full baseline index verbatim and appends the forensic cycle instead. Historical evidence must never be deleted or rewritten.

### Evidence integrity
- Historical entries preserved: YES.
- Forensic migration/security evidence retained: YES.
- Certification state remains: BLOCKED.
- No historical PASS promoted to current HEAD.


## Lifecycle mutation boundary closure — 2026-08-29
Finding: application adapters `markAlertRead()` and `updateRecommendationStatus()` still attempted direct table UPDATEs even though the production security hardening intentionally moved these lifecycle mutations behind canonical RPC boundaries.

Root cause: repository consumer drift after the database privilege hardening.

Fix:
- `src/lib/queries.ts` now calls `mark_alert_read` and `update_recommendation_status` RPCs.
- `src/lib/queries-compat.ts` now preserves the same canonical mutation boundary.
- Added `scripts/check-lifecycle-mutation-boundary.mjs`.
- Registered and wired the guard into `.github/workflows/quality.yml`.

Status: `IMPLEMENTED → REGRESSION WIRED → EXACT-HEAD CI PENDING`.
This finding is a real consumer/security contract defect and is not merely documentation.


## Exact-head CI evidence — 2026-08-29
Exact branch head: `555bd778dc82543ee127bd8692503e8635d9bd13`.
Quality workflow run: `33269178121`.
Result: **PASS** — all 52 substantive verification steps completed successfully, including typecheck, behavioral/BI/deep-golden/outcome/file-security/decision-evidence regressions, the new canonical lifecycle mutation boundary guard, tenant/RLS/import guards, lint, build, performance budget, document intelligence, report truth, production readiness and full resilience.

This PASS is exact-head-bound to `555bd778dc82543ee127bd8692503e8635d9bd13`; it does not prove live runtime, production deployment equivalence, migration parity, or real-data reconciliation.


## Fresh deployment/runtime evidence — 2026-08-29
- Exact head: `c25a0ad9f8d59e01410f7e44b8fdd301672ad291`.
- Vercel deployment: `dpl_2HPxJDQuX7dfTxnCKbs8WzpWxkQB`.
- Deployment state: READY.
- Deployment metadata binds the Git SHA exactly to `c25a0ad9f8d59e01410f7e44b8fdd301672ad291`.
- Direct deep-route `/dashboard` returned HTTP 200 with the application `index.html`, proving the SPA rewrite is active on the fresh deployment.
- Vercel runtime-log count for the selected preview deployment/time window returned no runtime log entries; this is not equivalent to browser console certification.
- Broader route sweep could not be completed because Vercel protection-bypass requests hit a 429 rate limit. Therefore full browser route/network/console certification remains NOT PROVEN.

Quality run on the exact head: `33269239425` → PASS (52 substantive verification steps).


## Migration provenance progress — 2026-08-29
Recovered/mirrored: `20260829153438`, `20260829175705`, `20260829180903`.
Reconstructed with explicit provenance: `20260829153456`, `20260829155128`, `20260829161705`, `20260829171552`.
Remaining live migrations: 17 are still NOT RECOVERED/RECONSTRUCTED and therefore migration parity remains OPEN.

## Live privileged-boundary audit
Current live catalog confirms all observed SECURITY DEFINER functions have a fixed public search_path; sensitive decision/runtime functions inspected derive tenant context through current_company_id() and actor context through auth.uid() where actor attribution is required. Authenticated EXECUTE is false for anon across the observed privileged surface. This is evidence of the current live boundary, not a substitute for caller-by-caller certification.

Live lifecycle table privileges also confirm direct authenticated UPDATE/DELETE/TRUNCATE are closed on audit_logs, recommendations, alerts, business_intelligence_decisions, decision_approvals, decision_work_items, recommendation_outcomes and decision_action_receipts, while intended INSERT/SELECT surfaces remain as designed. The application consumer drift found in queries.ts/queries-compat.ts has been corrected and the exact-head quality gate passed.
