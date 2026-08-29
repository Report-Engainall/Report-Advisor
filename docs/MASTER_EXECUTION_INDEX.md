# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `hardening/decision-runtime-authorization`  

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Owner certification baseline: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- Current working branch: `hardening/decision-runtime-authorization`.
- Current recorded verification head before this index-only commit: `e61c3e436db08ec81cc4bcf17908b0f434974de2`.
- Production certification remains `NO`.

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

## 2026-08-30 — live security / release-readiness forensic sweep
Scope: authoritative Supabase project `fnqbvfuwbdpwvhcgzksl` and repository exact head `e61c3e436db08ec81cc4bcf17908b0f434974de2`.

### Verified tasks in this sweep
1. Enumerated tracked migration versions; latest live migration version observed: `20260829221301`.
2. Confirmed public tables have RLS enabled: `76/76` public tables with RLS; `0` public tables without RLS.
3. Counted public RLS policies: `144`.
4. Counted public SECURITY DEFINER functions: `18`.
5. Confirmed all inspected SECURITY DEFINER functions contain explicit `search_path` hardening: `0` missing.
6. Confirmed non-internal public triggers: `13`.
7. Confirmed public foreign-key constraints: `125`.
8. Confirmed public indexes: `181`.
9. Confirmed `anon` has no direct table privileges on core business/lifecycle tables checked.
10. Confirmed `PUBLIC` has no direct table privileges on the same core tables checked.
11. Confirmed `anon` EXECUTE on SECURITY DEFINER functions: `0`.
12. Confirmed `PUBLIC` EXECUTE on SECURITY DEFINER functions: `0`.
13. Enumerated the six PUBLIC-executable helper/trigger functions; all are non-SECURITY-DEFINER helper/trigger routines, not lifecycle SECURITY DEFINER RPCs.
14. Verified authenticated lifecycle table privileges: SELECT plus only intentional INSERT surfaces; no UPDATE/DELETE/TRUNCATE on decision lifecycle tables.
15. Verified lifecycle direct UPDATE/DELETE/TRUNCATE grants for authenticated role: `0`.
16. Verified core tenant-scoped tables `products`, `sales_invoices`, and `purchase_invoices` use `current_company_id()` in tenant policies.
17. Verified `sale_items` tenant policy resolves authority through its parent `sales_invoices.company_id`.
18. Verified `purchase_items` tenant policy resolves authority through its parent `purchase_invoices.company_id`.
19. Verified `sale_items` and `purchase_items` have product and invoice foreign-key relationships.
20. Verified the live business corpus is empty for the inspected core business tables: customers/products/suppliers/sales/purchases/inventory/payments/recommendations/alerts/decision work/outcomes = `0` rows each.
21. Verified live companies count is `2`, consistent with the known empty-business-corpus state.
22. Reviewed open certification Issues; current explicit blockers include Windows desktop watcher runtime evidence (#102), repository/live migration reconciliation (#96), and deep exact-head/live certification (#62).
23. Reviewed active PR inventory; certification-sensitive work remains unmerged/draft and is not treated as production proof.
24. Inspected PR #101's proposed bounded-parallel 20-stage release-readiness contract; it contains 20 repository-native stages but remains a separate draft branch and is not silently promoted into the current head.
25. Compared `e61c3e4` against its main base `23e8f784`; it is exactly `11` commits ahead and `0` behind, with six changed files in the current decision-runtime verification branch.

### Interpretation
- Security posture for inspected core tables and SECURITY DEFINER RPCs is strong and evidence-backed, but this is not a complete production security certification.
- The two child tables without a direct `company_id` (`sale_items`, `purchase_items`) are not automatically a defect because tenant authority is enforced through their invoice parent; the existing FK/policy structure was inspected before any mutation decision.
- The six PUBLIC-executable routines are trigger/helper functions and are not SECURITY DEFINER. No mutation was performed merely to remove safe trigger execution privileges.
- Empty business data means real-data reconciliation and authenticated A/B tenant runtime certification remain impossible to promote to PASS from current live data alone.
- PR #101's 20-stage orchestrator is valuable but is not part of the current exact head; no cross-branch cherry-pick or merge was performed.

### Current certification state after sweep
`CI ON e61c3e4 = PASS (7/7 historical exact-head workflows)`  
`LIVE SECURITY CORE SWEEP = PARTIAL / VERIFIED FOR INSPECTED SURFACE`  
`REAL DATA TRUTH = NOT PROVEN (empty business corpus)`  
`FRESH DEPLOYMENT ↔ CURRENT HEAD = NOT PROVEN`  
`BROWSER E2E = NOT PROVEN`  
`FINAL CERTIFICATION = BLOCKED`

## Next resume point
1. Preserve the new index commit as the new exact repository state; re-prove CI on that exact SHA because this index update changes HEAD.
2. Bind a fresh deployment to that SHA before runtime certification.
3. Execute authenticated browser route/network/console verification.
4. Continue live A/B tenant, storage/realtime/vector, worker/watcher, backup/restore, and real-corpus evidence closure.
5. Reconcile repository migration files against the live migration ledger/object definitions before any certification promotion.
