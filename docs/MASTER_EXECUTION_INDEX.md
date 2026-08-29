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

Status of that prior finding: `SUPERSEDED / FALSE POSITIVE DUE TO QUERY INTERPRETATION`, preserved here for forensic history.

## LIVE decision-runtime migration application
Object-level reconciliation found `complete_decision_work_item(...)` existed but `create_decision_work_item(...)` did not.

Action:
- Applied `20260830160000_harden_decision_runtime_transitions` to authoritative project `fnqbvfuwbdpwvhcgzksl` through canonical Supabase migration tooling.
- Live ledger recorded it as generated version `20260829221123`.
- `create_decision_work_item(...)` now exists live.

Status: `LIVE MIGRATION APPLIED → OBJECT VERIFIED → AUTHORIZATION BEHAVIOR TESTING REQUIRED`.

## NEW LIVE SECURITY FINDING — anonymous EXECUTE
After application of the migration, a live privilege query found:
- `anon_execute = TRUE` for `public.create_decision_work_item(...)`.
- `authenticated_execute = TRUE`.
- Migration is recorded in the live ledger.

Classification: `P0/P1 SECURITY / RPC GRANT MISCONFIGURATION`.

Impact: the RPC is SECURITY DEFINER and therefore must not be anonymously executable. The function itself checks `auth.uid()`, so an anonymous caller should be rejected at runtime, but exposing EXECUTE to `anon` is still an unnecessary and unsafe privilege boundary and violates the intended authenticated-only contract.

Decision: `FIX REQUIRED`. Do not claim the new decision action boundary as security-closed until anonymous EXECUTE is revoked and the privilege is re-verified.

Safety: no bypass, no disabling of security, no unrelated mutation.

## Exact-head CI history
- `0abab5e6db11791ae0d13575253ca120b5912982`: Quality run `33277721910` SUCCESS, 51/51.
- Current documentation/index mutation creates newer HEADs; each newer HEAD requires fresh CI evidence.

## Deployment binding history
- Ready deployment `dpl_8XjutNjdCyF55FcBSc4b4jUMWL1P` used SHA `5dd99a754ee0e18272d65e4f845e84135253a2a4`, not the later exact candidate.
- Later PR deployment creation hit the Vercel free daily quota. No quota bypass attempted.

## Current status
```text
EXACT-HEAD CI (0abab5e)        PASS / HISTORICAL
LIVE MIGRATION                 APPLIED
DECISION RPC                   EXISTS
ANON EXECUTE ON DECISION RPC  FAIL — FIX REQUIRED
CURRENT BRANCH CI              NOT YET PROVEN AFTER INDEX COMMITS
FRESH EXACT-HEAD DEPLOYMENT    NOT PROVEN
BROWSER RUNTIME                NOT PROVEN
REAL DATA RECONCILIATION       NOT PROVEN
CERTIFICATION                  BLOCKED
```

## Current resume point
1. Revoke anonymous EXECUTE on `create_decision_work_item(...)` using a tracked canonical migration; verify authenticated-only grants.
2. Update repository guard/tests for the grant boundary if not already covered.
3. Obtain fresh exact-head CI after the security fix and index update.
4. Re-test decision approval/action/outcome behavior with authenticated context when available.
5. Obtain fresh Vercel deployment bound to the final validated HEAD and verify deep routes.
6. Continue browser/network/console sweep.
7. Continue real-data reconciliation, security, reliability and product-value fronts.
8. Update this index after every material discovery and mutation.

PRODUCTION CERTIFIED = NO.
