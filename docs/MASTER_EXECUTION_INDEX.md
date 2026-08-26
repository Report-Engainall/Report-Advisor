# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Repository: `Report-Engainall/Report-Advisor`
PR: #41 (previous exact state)
Branch: `wave-parallel-batch-01`
Base: `b4897b8d456d10736642745b097de2aea89b27c5`

## Permanent execution policy
`GLOBAL DISCOVERY → CONSUMER GRAPH → PARALLEL WAVES → BATCH ROOT CAUSE → BATCH FIX → REGRESSION → EXACT-HEAD CI → ZERO-CONSUMER PROOF → INDEX → NEXT WAVE`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Starting code/test HEAD: `b4897b8d456d10736642745b097de2aea89b27c5`.
- Current wave: `wave-parallel-batch-01`.
- Exact-head CI for this wave: **NOT OBSERVABLE** until a run is created/completed for the resulting SHA; no PASS is claimed.
- `quality.yml` remains the canonical quality gate.

## Batch closure — Data Quality canonical migration
Finding: `DataQualityPage` consumed four tenant collections and recalculated business quality metrics in the browser.

Root cause: the quality score and issue counts were owned by a client-side aggregation engine, so dataset bounds could make the displayed metric partial and future consumers could diverge semantically.

Fix implemented in this wave:
- Added authoritative `public.get_data_quality_snapshot()` server contract.
- Tenant authority is derived from `public.current_company_id()`; no client tenant identifier is accepted.
- Server computes entity totals, issue counts, duplicate counts, scores and overall score from the complete tenant dataset.
- Browser adapter `src/lib/data-quality-canonical.ts` performs one RPC call and contains no business aggregation.
- New `src/pages/DataQualityPage.tsx` consumes only the canonical snapshot.
- `App.tsx` route now imports the new canonical page instead of the legacy EntityPages export.
- RPC execution is revoked from PUBLIC/anon and granted only to authenticated.

Semantic equivalence target: preserve the existing DataQualityPage formulas, including overlapping zero/negative invoice findings and duplicate-count semantics, while removing browser source-row aggregation.

Status: `IMPLEMENTED → REGRESSION PENDING → EXACT-HEAD CI PENDING`.

Legacy state: the old `DataQualityPage` implementation and `fetchDataQualityDatasets` remain in `src/pages/EntityPages.tsx` / `src/lib/data-quality-queries.ts` for this wave's zero-consumer/removal proof. They are **not** claimed removed yet.

## Parallel fronts opened
A. Canonical Data Truth — Data Quality server snapshot implemented; queries-compat remains active for function-by-function closure.
B. Consumer/Legacy — Data Quality legacy consumer migration started; zero-consumer proof and physical removal remain open. `get_sales_secondary_metrics` dependency proof remains open.
C. BI / Decision / Export / Forecast / Inventory Intelligence — repository-wide truth sweep remains active and independent.
D. Tenant/Security — current-company resolver is the canonical authority; sibling runtime/live isolation remains LIVE REQUIRED.
E. Performance — bounded collection bridges remain; true server-side search/pagination remains open where scale requires it.
F. Reliability — worker/queue/idempotency/recovery remains open.
G. Runtime/LIVE — authenticated E2E, two-tenant isolation, storage/realtime/AI, OCR, watcher, restore, RPO/RTO, load/canary/rollback remain LIVE REQUIRED.

## Regression / CI
- Added/updated `scripts/check-data-quality-projections.mjs` to validate the authoritative snapshot, tenant authority, RPC grants, browser adapter boundary and removal of the legacy page-side aggregation contract.
- Exact-head CI: **NOT OBSERVABLE** for the resulting wave SHA until the workflow run exists; no historical PASS is promoted.

## Certification ladder
- IMPLEMENTED: Data Quality canonical server contract + consumer route migration.
- TESTED: static regression contract added; behavioral/runtime equivalence still pending.
- GATED: pending exact-head CI for this wave SHA.
- CONSUMER VERIFIED: partial — new route/adapter wired; old implementation still requires zero-consumer proof/removal.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
1. Supabase A/B tenant isolation.
2. Storage isolation.
3. Realtime authorization.
4. AI/vector isolation.
5. Authenticated browser E2E.
6. Real document/OCR corpus.
7. Worker crash/recovery/DLQ/duplicate-side-effect drill.
8. Native watcher.
9. Real backup restore + integrity + rollback + RPO/RTO.
10. Production telemetry + PII redaction.
11. Production load/canary/rollback.
12. Production query-plan/scale evidence.

## Next parallel execution
1. Prove all `queries-compat.ts` consumers/dependencies and close zero-consumer candidates in batch.
2. Remove the legacy Data Quality browser engine after repository consumer proof and regression.
3. In parallel, batch the BI/Decision/Export/Demand/Inventory Intelligence truth sweep.
4. Run the NULL/UNKNOWN/DATE/STATUS sibling sweep and tenant/RPC/storage/realtime/AI security sweep.
5. Continue unbounded-read/performance and worker/reliability families without waiting for CI.
6. Run exact-head CI for this wave and fix every failure before certification.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
