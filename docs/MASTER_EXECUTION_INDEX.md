# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `hardening/decision-runtime-authorization`  

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Certification baseline supplied by owner: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- A live runtime sweep on the deployment bound to that baseline proved a real SPA direct-route defect: `/login` returned HTTP 404 at Vercel, while the application uses `BrowserRouter`.
- Canonical minimal fix applied in repository: root `vercel.json` rewrites application routes to `/index.html`.
- Historical fix commit: `459666ea7fca6a94eb2c7e6955a2d259e3d2b8ef`.
- Current working branch contains later decision-runtime hardening and documentation commits; certification for the current HEAD remains NOT PROVEN until fresh deployment/browser evidence is bound to the final validated HEAD.

## Batch — Vercel SPA direct-route certification defect
Finding: direct navigation to `/login` on the production deployment returned Vercel HTTP 404. This violated the owner-required `Direct URL access` runtime criterion.

Classification: `RUNTIME / DEPLOYMENT ROUTING / RELEASE BLOCKER`

Root cause: `BrowserRouter` client-side routes existed without a Vercel SPA fallback.

Fix:
- Added root `vercel.json` with a catch-all rewrite to `/index.html`.

Status: `DEFECT CONFIRMED → CANONICAL FIX COMMITTED → FRESH DEPLOYMENT PENDING → RUNTIME VERIFICATION PENDING`.

## Existing closure status retained
### P0 — Data Quality
Browser business-quality aggregation was migrated to `get_data_quality_snapshot()` with tenant authority from `current_company_id()`.

Status: `IMPLEMENTED → CONSUMER MIGRATED → REGRESSION`; live runtime/data reconciliation pending.

### P1 — Dashboard Intelligence tenant boundary
Direct browser reads of recommendations/alerts were replaced by `get_dashboard_intelligence(p_limit)` with server-derived tenant authority, fixed search_path, bounded output and authenticated-only execution.

Status: `IMPLEMENTED → REGRESSION`; live runtime pending.

### P1 — Forecast read boundary
Direct `forecasts` reads were replaced by `get_forecast_snapshot(p_limit)` with tenant authority, bounded deterministic output.

Status: `IMPLEMENTED → REGRESSION`; live runtime pending.

### P1 — Export tenant authority hardening
Inventory export now fails closed on tenant mismatch and derives authority from `current_company_id()`.

Status: `IMPLEMENTED → REGRESSION`; live A/B export isolation pending.

## DB-only legacy candidate — get_sales_secondary_metrics
Repository consumer search found no source consumer, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## High-risk remaining fronts
### Front A — Canonical Data Truth
- Full `queries-compat.ts` function/consumer graph.
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.
- cross-surface equivalence between canonical RPC, UI and exports.

### Front B — Consumer + Legacy Closure
- zero-consumer proof for compatibility functions.
- duplicate business engines.
- DB-only legacy candidates with external-consumer risk.

### Front C — BI / Decision / Export
- Forecast/Demand Velocity/Inventory Intelligence evidence.
- export metric/date/status/as-of/filter equivalence.
- recommendation/action/outcome provenance.

### Front D — Security / Tenant
- RPC grants/search_path/RLS.
- Storage/Realtime/AI-vector.
- workers, notifications and generated files.
- SECURITY DEFINER review.

### Front E — Performance
- unbounded reads.
- query plans/indexes.
- N+1 and payload bounds.

### Front F — Reliability
- worker/watcher/queue/retry/idempotency/DLQ/recovery.
- backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
- fresh authenticated browser E2E on a deployment bound to the current HEAD.
- direct URL/deep-link routing after SPA fix.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Batch — Decision Runtime authorization hardening
Finding: direct client creation of `decision_work_items` could bypass decision approval, and completion did not require the linked decision to remain approved.

Canonical repository fix:
- `supabase/migrations/20260830160000_harden_decision_runtime_transitions.sql`.
- Added approval-gated `create_decision_work_item(...)` SECURITY DEFINER RPC.
- Hardened `request_decision_approval()` and `decide_approval()` actor attribution.
- Hardened `complete_decision_work_item()` against unapproved/stale completion and duplicate completion.
- Client runtime now routes work-item creation through the canonical approval-gated RPC.
- Decision closure guard extended.

## LIVE verification and correction — migration ledger
A previous investigation incorrectly treated the migration filename as if it were the `version` value returned by a direct `select version ...` query. Supabase's live migration table stores a generated numeric `version` separately from the human-readable `name`. This was corrected immediately and must remain in the forensic history rather than being silently erased.

Authoritative live migration listing showed the previously questioned six migrations ARE present by name, including:
- `20260826052000_dashboard_canonical_aggregation`
- `20260826100000_import_lifecycle_final_hardening`
- `20260829015500_runtime_rpc_contract_reconciliation`
- `20260829021000_fix_analytics_cte_runtime`
- `20260829023000_restore_import_lifecycle_rpcs`
- `20260829024000_harden_import_finish_search_path`

Therefore the prior six-migration absence finding is `SUPERSEDED / FALSE POSITIVE DUE TO QUERY INTERPRETATION`, with the original discovery retained for audit history.

## LIVE decision-runtime migration application
Object-level reconciliation then found a real gap: `complete_decision_work_item(...)` existed in the live database, but the new canonical `create_decision_work_item(...)` RPC was absent.

Safe action taken:
- Applied the repository migration `20260830160000_harden_decision_runtime_transitions.sql` to authoritative Supabase project `fnqbvfuwbdpwvhcgzksl` using the canonical migration mechanism.
- The live migration ledger now records `harden_decision_runtime_transitions` with generated version `20260829221123`.

Post-apply verification:
- Live database contains the new `create_decision_work_item(...)` function.
- The migration was successfully recorded by Supabase migration tooling.
- The migration's repository definition is the canonical source.

Status: `LIVE MIGRATION APPLIED → OBJECT VERIFIED → AUTHORIZATION BEHAVIORAL TESTING STILL REQUIRED`.

Important: this is a real production database mutation and therefore the current branch/HEAD must receive fresh exact-head CI and the live runtime decision path must be re-tested before any certification claim.

## Exact-head CI history
- Exact-head `0abab5e6db11791ae0d13575253ca120b5912982` Quality run `33277721910`: `SUCCESS`, 51/51 verification steps.
- The later documentation-only HEAD changes require a fresh current-head CI association before treating the final current branch state as CI-certified.

## Vercel deployment binding history
- Older ready deployment `dpl_8XjutNjdCyF55FcBSc4b4jUMWL1P` was bound to SHA `5dd99a754ee0e18272d65e4f845e84135253a2a4`, not the current `0abab5e` HEAD.
- PR deployment creation subsequently hit the Vercel free daily deployment quota. This is an external blocker; no quota bypass was attempted.

## Status ladder
- IMPLEMENTED: current fix exists in repository.
- TESTED/REGRESSION: repository behavioral/contract evidence exists; execution must be separately evidenced.
- GATED: no claim for a newer HEAD until exact-head CI evidence exists.
- RUNTIME VERIFIED: only with fresh deployment/browser evidence bound to current HEAD.
- LIVE VERIFIED: only with live evidence bound to current HEAD.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Current resume point
1. Verify current branch HEAD after this index update.
2. Obtain exact-head CI evidence for the current HEAD.
3. Verify live decision authorization behavior: unapproved creation fails, approved creation succeeds, stale/unapproved completion fails, duplicate completion fails.
4. Obtain/observe a fresh Vercel deployment bound to the validated current HEAD; do not use older SHA deployment as exact-head evidence.
5. Verify `/login` and representative deep routes.
6. Continue authenticated browser runtime sweep across critical routes.
7. Collect network/console/runtime evidence.
8. Perform real-data and independent reconciliation for critical metrics.
9. Continue reliability, semantic/document intelligence, export and product-value fronts.
10. Update this index after every material discovery/mutation.

PRODUCTION CERTIFIED = NO until all critical LIVE evidence exists.
