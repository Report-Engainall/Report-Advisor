# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26

## Truth rules
- PASS is bound to an exact SHA + exact CI run/job. Historical PASS is never transferred.
- UNKNOWN / MISSING / INSUFFICIENT_DATA is never silently converted to business ZERO.
- Domain truth belongs to domain-level canonical implementations, not page-local calculations.
- RUNTIME/LIVE/PRODUCTION_CERTIFIED are separate from local implementation and CI proof.

## Execution identity
- Requested baseline: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
- Active PR: **#27 — Wave 07 — Truth Certification + Canonical/RPC Deep Verification**.
- Active PR head branch: `execution-wave-07-truth-certification`.
- Current exact application/CI HEAD: `0e0e645c77a11e632047f376cb4b5cb751852a8e`.
- Previous implementation HEAD: `2ccc31d73796ce0eae725993ad87606dbeb1b5e5`.
- Exact-head Wave 09 CI for `0e0e645...`: run `32920859861`, job `98034011531`, **IN PROGRESS** at last observation; behavioral regression passed and Typecheck was running. No PASS is claimed.

## REAL CLOSURE EXECUTED

### 1. Inventory export truth — IMPLEMENTED
Root cause: inventory export reconstructed valuation in the page from `quantity * unit_cost`, creating duplicate business truth and risking UNKNOWN→ZERO drift.

Fix:
- `supabase/migrations/20260826140000_inventory_export_truth.sql` adds tenant-authoritative `get_inventory_export_truth(uuid)`.
- `src/lib/report-export-data.ts` consumes the canonical RPC and preserves nullable value/status.
- `src/pages/ReportsPage.tsx` renders inventory export from canonical rows; no page-local inventory export valuation remains.

### 2. Executive decision consumer — IMPLEMENTED
Root cause: `ExecutiveCommandCenterPage` used legacy dashboard KPIs and exposed a period selector that did not affect the all-time canonical query.

Fix:
- Migrated to `fetchCanonicalDashboardKPIs()`.
- Removed misleading unused 7/30/90 selector.
- Added fail-closed handling for incomplete metrics.
- Added a strict `CompleteKPI` type guard so numeric decision logic is only reachable after explicit non-null/finite proof.

### 3. Secondary canonical RPC contract — FIXED
Finding: the canonical secondary adapter called RPC names that were not present in repository SQL.

Root cause: adapter and database function naming/payload contracts diverged.

Fix:
- `20260826150000_secondary_consumer_domain_truth.sql`: tenant-authoritative server-side implementations for monthly trend, top customers, top products and category breakdown.
- `20260826150500_secondary_consumer_rpc_compat.sql`: exact adapter-facing RPC names and authenticated-only execution.
- `20260826151000_secondary_rpc_payload_contract.sql`: normalized `{status, rows, as_of}` payload contract, explicit `INSUFFICIENT_DATA` propagation, and cancellation/void semantics.
- `src/lib/canonical-secondary-data-truth.ts`: consumes the normalized contract rather than assuming arrays for some functions and objects for others.

### 4. Typecheck failure — ROOT CAUSE FIXED
Exact Wave 09 run `32920780766` on SHA `2ccc31d...` failed at Typecheck. The captured artifact showed all failures were strict-nullability errors in `ExecutiveCommandCenterPage.tsx`: the prior boolean expression did not narrow nullable KPI properties for TypeScript.

Fix:
- Introduced `CompleteKPI` and `isCompleteKPI()` type guard.
- Numeric calculations now execute only after explicit finite/non-null proof.
- No `as any`, non-null assertion, skip, or checker weakening was used.
- The next exact-head run is the proof of this fix.

### 5. Behavioral regression — IMPLEMENTED
`execution-wave-09-cross-surface-closure.mjs` now protects:
- canonical inventory export;
- tenant-authoritative export RPC;
- executive canonical KPI source;
- strict executive KPI nullability guard;
- secondary adapter `{status, rows}` contract;
- exact adapter RPC names;
- nullable business values;
- cancelled/void exclusion;
- RFM/ABC/aging canonical paths;
- decision fail-closed behavior.

### 6. CI diagnostics — IMPLEMENTED
Wave 09 now captures Typecheck output as an artifact on failure. This was added only to obtain the real compiler failure and was not used to hide or bypass the failure.

## Capability matrix
| Capability | Implemented | Tested | Regression | Gated | Consumer verified | Runtime | LIVE | Production |
|---|---|---|---|---|---|---|---|---|
| Inventory export canonical truth | YES | PENDING exact-head | YES | YES | YES | NO | NO | NO |
| Export truth overall | YES | PENDING exact-head | YES | YES | YES | NO | NO | NO |
| Executive decision consumer | YES | PENDING exact-head | YES | YES | YES | NO | NO | NO |
| Secondary domain aggregates | YES | PENDING exact-head | YES | YES | YES | NO | NO | NO |
| Secondary RPC payload contract | YES | PENDING exact-head | YES | YES | YES | NO | NO | NO |
| Dashboard/secondary canonical truth | YES | YES | YES | YES | YES | NO | NO | NO |
| RFM/ABC domain truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Aging as-of truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Decision fail-closed truth | YES | YES | YES | YES | YES (code path) | PARTIAL | NO | NO |
| Tenant/RLS boundary | Existing + hardened | YES | YES | YES | PARTIAL | PARTIAL | REQUIRED | NO |
| Cross-surface runtime equivalence | PARTIAL | YES (static) | YES | YES | PARTIAL | REQUIRED | REQUIRED | NO |

## Legacy closure
- Executive command center has zero dependency on legacy `fetchDashboardKPIs`.
- Secondary legacy wrappers remain only where compatibility proof is still required.
- Removal rule remains: SEARCH → MIGRATE → REGRESSION → ZERO CONSUMERS → REMOVE.
- No destructive deletion without dependency proof.

## Exact-head CI truth
- Current exact application HEAD: `0e0e645c77a11e632047f376cb4b5cb751852a8e`.
- Exact Wave 09 run: `32920859861`.
- Exact job: `98034011531`.
- At last observation: behavioral regression **SUCCESS**; Typecheck **IN PROGRESS**.
- Earlier Typecheck failure on `2ccc31d...` is closed at root cause level by the strict KPI narrowing fix, but the new exact-head result must prove it.
- No historical PASS is transferred.

## LIVE REQUIRED
1. Authenticated Dashboard → Reports → Exports → Decisions equivalence against real tenant data.
2. Supabase A/B DB/Storage/Realtime/AI-vector isolation.
3. Deployed worker crash/restart/stale lease/DLQ/resume and duplicate-side-effect drill.
4. Real backup restore/migration replay/rollback/RPO/RTO.
5. Native Windows/Android/iOS watcher proof.
6. Real PDF/OCR/XLSX/CSV/corrupt/ambiguous corpus accuracy.
7. Production telemetry trace with tenant context and PII redaction.
8. Production-scale load/canary/rollback.

## Remaining work — NOW
- Obtain exact-head CI evidence for the final index SHA after this update; fix every real failure rather than transferring a prior PASS.
- Continue sibling business-calculation sweep, export/decision equivalence, date/status closure and legacy zero-consumer proof.
- Complete Decision → Evidence → Recommendation → Decision → Outcome → Feedback runtime provenance.
- Runtime/LIVE proof remains separate from local/CI proof.

## Completion truth
**NOT CERTIFIED.** Real Data Truth fixes, consumer migration, secondary canonical RPC implementation, payload contract hardening, regression coverage and a real CI failure/root-cause/fix cycle are implemented. Exact-head CI is still pending; runtime, LIVE and Production Certification are not claimed.
