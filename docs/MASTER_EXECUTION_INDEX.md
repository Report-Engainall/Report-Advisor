# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `hardening/decision-runtime-authorization`  

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Owner certification baseline: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- Current working branch advances through decision-runtime hardening and forensic index updates; production certification remains NO.
- Historical production deployment `7qYynEgiLAsPrajXatBdes3ByagE` had a real SPA deep-route defect; root `vercel.json` SPA fallback was added and awaits fresh deployment/runtime verification.

## Vercel SPA direct-route certification defect
Finding: direct navigation to `/login` on the baseline deployment returned Vercel HTTP 404 while the app uses `BrowserRouter`.

Classification: `RUNTIME / DEPLOYMENT ROUTING / RELEASE BLOCKER`.

Canonical fix: root `vercel.json` catch-all rewrite to `/index.html`.

Historical fix commit: `459666ea7fca6a94eb2c7e6955a2d259e3d2b8ef`.

Status: `FIX COMMITTED → FRESH DEPLOYMENT REQUIRED → RUNTIME VERIFICATION PENDING`.

## Existing closure status retained
### P0 — Data Quality
`get_data_quality_snapshot()` is canonical and tenant-authoritative via `current_company_id()`.

Status: `IMPLEMENTED → REGRESSION`; live runtime/data reconciliation pending.

### P1 — Dashboard Intelligence
`get_dashboard_intelligence(p_limit)` is tenant-authoritative, bounded and authenticated-only.

Status: `IMPLEMENTED → REGRESSION`; live runtime pending.

### P1 — Forecast
`get_forecast_snapshot(p_limit)` is tenant-authoritative, explicitly projected, bounded and deterministic.

Status: `IMPLEMENTED → REGRESSION`; live runtime pending.

### P1 — Export tenant authority
Inventory export fails closed on tenant mismatch and derives authority from `current_company_id()`.

Status: `IMPLEMENTED → REGRESSION`; live A/B export isolation pending.

## High-risk remaining fronts
- Canonical data truth and UI/RPC/export equivalence.
- Compatibility/legacy consumer closure.
- BI/Decision/Export provenance.
- RLS/RPC/Storage/Realtime/AI-vector/security review.
- Performance/query plans/N+1/payload bounds.
- Worker/watcher/queue/retry/idempotency/DLQ/recovery.
- Fresh authenticated browser E2E and production runtime evidence.
- Real-data and independent metric reconciliation.

## Batch — Decision Runtime authorization hardening
Finding: direct client creation of `decision_work_items` could bypass approval; completion did not require the linked decision to remain approved.

Repository migration: `supabase/migrations/20260830160000_harden_decision_runtime_transitions.sql`.

Canonical fix:
- Added approval-gated `create_decision_work_item(...)` SECURITY DEFINER RPC.
- Hardened approval actor attribution.
- Hardened completion against stale/unapproved and duplicate completion.
- Client runtime routes work-item creation through the RPC.

## LIVE migration ledger reconciliation — corrected history
A prior query interpretation incorrectly compared migration filenames to the `version` column. Supabase stores generated numeric `version` and human-readable `name` separately. The authoritative migration listing confirmed the previously questioned six migrations are present by `name`.

Status of that prior finding: `SUPERSEDED / FALSE POSITIVE DUE TO QUERY INTERPRETATION`, preserved for forensic history.

## LIVE decision-runtime migration application
Object-level reconciliation found `complete_decision_work_item(...)` existed but `create_decision_work_item(...)` did not.

Action:
- Applied `20260830160000_harden_decision_runtime_transitions` to authoritative project `fnqbvfuwbdpwvhcgzksl` through canonical Supabase migration tooling.
- Live ledger recorded it as generated version `20260829221123`.
- `create_decision_work_item(...)` now exists live.

Status: `LIVE MIGRATION APPLIED → OBJECT VERIFIED → AUTHORIZATION BEHAVIOR TESTING REQUIRED`.

## Security finding — anonymous/public EXECUTE on decision action RPC
Discovery: after the decision migration, a live privilege check initially reported `anon_execute = TRUE` for `create_decision_work_item(...)`.

Root cause: PostgreSQL grants EXECUTE on newly created functions to `PUBLIC` by default. Revoking only from `anon` is insufficient because `anon` inherits the PUBLIC privilege.

Canonical fix:
- Added `supabase/migrations/20260830170000_revoke_anon_decision_work_item_execute.sql`.
- Added `supabase/migrations/20260830171000_revoke_public_decision_work_item_execute.sql`.
- Final security migration explicitly revokes EXECUTE from `PUBLIC` and grants it only to `authenticated`.
- Applied the canonical revocation to live project `fnqbvfuwbdpwvhcgzksl`.

Post-fix live verification:
```text
public_execute       = false
anon_execute         = false
authenticated_execute = true
migration_recorded   = true
```

Status: `DEFECT CONFIRMED → ROOT CAUSE IDENTIFIED → CANONICAL FIX COMMITTED → LIVE FIX APPLIED → PRIVILEGE VERIFIED CLOSED`.

The earlier `anon_execute=true` finding remains in forensic history; it is not deleted or rewritten.

## Exact-head CI history
- `0abab5e6db11791ae0d13575253ca120b5912982`: Quality run `33277721910` SUCCESS, 51/51.
- Subsequent index/security migration commits create newer HEADs; those newer HEADs require fresh CI evidence before current-branch certification.

## Deployment binding history
- Ready deployment `dpl_8XjutNjdCyF55FcBSc4b4jUMWL1P` used SHA `5dd99a754ee0e18272d65e4f845e84135253a2a4`, not the later exact candidate.
- Later PR deployment creation hit the Vercel free daily quota. No quota bypass attempted.

## Current status
```text
DECISION ACTION RPC                 LIVE
DECISION RPC PUBLIC EXECUTE         CLOSED
DECISION RPC ANON EXECUTE           CLOSED
DECISION RPC AUTHENTICATED EXECUTE  ENABLED
LIVE MIGRATION                      APPLIED
EXACT-HEAD CI (0abab5e)             PASS / HISTORICAL
CURRENT BRANCH CI                   NOT YET PROVEN AFTER LATEST COMMITS
FRESH EXACT-HEAD DEPLOYMENT          NOT PROVEN
BROWSER RUNTIME                     NOT PROVEN
REAL DATA RECONCILIATION            NOT PROVEN
CERTIFICATION                       BLOCKED
```

## Current resume point
1. Obtain fresh exact-head CI for the latest branch HEAD after the security/index commits.
2. Verify decision approval/action/outcome behavior with authenticated context; anonymous/public privilege is now closed.
3. Obtain a fresh Vercel deployment bound to the final validated HEAD; verify `/login` and representative deep routes.
4. Continue authenticated browser/network/console sweep across critical routes.
5. Perform real-data and independent reconciliation for critical metrics.
6. Continue reliability, semantic/document intelligence, export and product-value fronts.
7. Update this index after every material discovery and mutation.

PRODUCTION CERTIFIED = NO.
