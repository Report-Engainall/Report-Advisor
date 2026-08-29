# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-30  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `hardening/decision-runtime-authorization`  

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Certification baseline supplied by owner: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- A live runtime sweep on the deployment bound to that baseline proved a real SPA direct-route defect: `https://report-advisor.vercel.app/login` returned HTTP 404 at Vercel, while the application uses `BrowserRouter` and defines client-side routes in `src/App.tsx`.
- Canonical minimal fix applied: root `vercel.json` rewrites all application routes to `/index.html`.
- Fix commit: `459666ea7fca6a94eb2c7e6955a2d259e3d2b8ef`.
- Certification for the new HEAD is **NOT PROVEN** until a fresh deployment is bound to this SHA and direct-route runtime verification succeeds.

## Batch — Vercel SPA direct-route certification defect
Finding: direct navigation to `/login` on the production deployment returned Vercel HTTP 404. This violates the owner-required `Direct URL access` runtime criterion and is independently reproducible through the live deployment fetch.

Classification: `RUNTIME / DEPLOYMENT ROUTING / RELEASE BLOCKER`

Root cause: the app uses `BrowserRouter` with client-side routes, but the repository had no Vercel SPA fallback configuration. The Vercel deployment therefore treated a deep route such as `/login` as a missing static resource instead of serving `index.html` for client-side routing.

Fix:
- Added root `vercel.json` with a catch-all rewrite to `/index.html`.

Evidence:
- Baseline deployment `7qYynEgiLAsPrajXatBdes3ByagE` is bound to owner baseline `4da16b9a7433e66ccf8a62b183552a872a718ef8` and was `READY`.
- Live `https://report-advisor.vercel.app/` returned HTTP 200.
- Live `https://report-advisor.vercel.app/login` returned HTTP 404 with `x-vercel-error: NOT_FOUND`.
- `src/App.tsx` uses `BrowserRouter` and declares client-side route handling, including `/`, `/import`, `/reports/*`, `/analytics/*`, `/intelligence/*`, `/customers`, `/products`, `/inventory`, `/settings`, etc.

Status: `DEFECT CONFIRMED → CANONICAL FIX COMMITTED → FRESH DEPLOYMENT PENDING → RUNTIME VERIFICATION PENDING`.

## Existing closure status retained
### P0 — Data Quality
Browser business-quality aggregation was migrated to `get_data_quality_snapshot()` with tenant authority from `current_company_id()`. Legacy bridge/page removal was preceded by repository consumer proof.

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF IN REPOSITORY → REGRESSION`; exact-head CI/database/runtime pending.

### P1 — Dashboard Intelligence tenant boundary
Direct browser reads of recommendations/alerts were replaced by `get_dashboard_intelligence(p_limit)`, deriving tenant authority from `current_company_id()`, with fixed search_path, bounded output and authenticated-only execution.

Regression: `src/lib/dashboard-canonical.intelligence.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/live runtime pending.

### P1 — Forecast read boundary
Direct `forecasts` table read was replaced by `get_forecast_snapshot(p_limit)`, tenant-authoritative, explicitly projected, bounded and deterministic.

Regression: `src/lib/queries.forecast.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime pending.

### P1 — Export tenant authority hardening
Finding: `get_inventory_export_rows(p_company_id, ...)` did not assert the caller-supplied company id matched server tenant authority.

Fix:
- Added `supabase/migrations/20260826080000_export_tenant_authority_hardening.sql`.
- Inventory export fails closed on `TENANT_CONTEXT_MISMATCH` and derives data from `current_company_id()`.
- Export RPCs have fixed `search_path`, anonymous execution revoked, and authenticated execution explicitly granted.

Regression: `src/lib/export-tenant-authority.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI and live A/B export isolation pending.

## DB-only legacy candidate — get_sales_secondary_metrics
`supabase/migrations/20260826003000_sales_secondary_canonical_analytics.sql` still defines it. Repository consumer search found no source consumer, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

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

## New batch — Decision Runtime authorization hardening
Finding: the previous decision runtime exposed a direct client insert into `decision_work_items`, and the database table policy checked only tenant membership. This allowed a caller inside the tenant to create an action work item for a decision that had not reached `APPROVED`. The completion RPC also did not require the linked decision to remain approved before recording an outcome.

Impact: `Recommendation → Decision → Approval → Action → Outcome` could be bypassed at the action boundary. This was a release-relevant authorization/state-integrity gap, not a cosmetic issue.

Canonical fix:
- Added `supabase/migrations/20260830160000_harden_decision_runtime_transitions.sql`.
- `request_decision_approval()` now records `auth.uid()` in `requested_by`.
- `decide_approval()` records `auth.uid()` in `decided_by` and `approved_by` for approved decisions.
- Added canonical `create_decision_work_item(...)` SECURITY DEFINER RPC with fixed `search_path`, tenant authority and an explicit `decision.status = 'APPROVED'` gate.
- `complete_decision_work_item()` now joins the decision and requires `APPROVED` before completing the work item and creating the outcome.
- Duplicate completion fails closed with `WORK_ITEM_ALREADY_COMPLETED`.
- Recommendation linkage is checked against the same tenant before action creation.
- `src/lib/decision-automation/vertical-slice-runtime.ts` now routes work-item creation through the approval-gated RPC instead of a direct table insert.
- Extended `scripts/check-decision-intelligence-closure.mjs` to guard the new authorization boundary.

Evidence at implementation time:
- Original vulnerable workflow was confirmed by inspection of `20260828170000_decision_action_outcome_runtime.sql` and `vertical-slice-runtime.ts`.
- New migration and client boundary were committed on branch `hardening/decision-runtime-authorization`.
- New branch was created directly from exact current candidate `23e8f78466f34cf0b89852384d6848598843916e`; owner certification baseline history remains untouched.

Current batch state:
`DEFECT CONFIRMED → CANONICAL FIX COMMITTED → REGRESSION GUARD UPDATED → CI PENDING → DB APPLICATION PENDING → FRESH RUNTIME PENDING`.

Important: this fix is **not** counted as production-certified until the migration is applied to the correct Supabase project and exact-head CI/runtime evidence proves the transitions.

## Status ladder
- IMPLEMENTED: current fix exists in repository.
- TESTED/REGRESSION: repository behavioral/contract evidence exists; execution must be separately evidenced.
- GATED: **NO CLAIM** for current HEAD until exact-head CI evidence exists.
- RUNTIME VERIFIED: only with fresh deployment/browser evidence bound to current HEAD.
- LIVE VERIFIED: only with live evidence bound to current HEAD.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Current resume point
1. Run exact-head CI for `hardening/decision-runtime-authorization` and verify the extended decision runtime contract.
2. Apply the new migration only to the authoritative Supabase project after exact-head CI evidence; verify approval bypass and stale-completion cases fail closed.
3. Obtain/observe fresh Vercel deployment bound to the SPA fix and subsequent validated HEAD before runtime claims.
4. Verify `/login` and representative deep routes no longer return Vercel 404.
5. Continue authenticated browser runtime sweep across critical routes.
6. Collect network/console/runtime evidence.
7. Continue data-truth, security, semantic/document intelligence, reliability and product-value fronts in parallel.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
