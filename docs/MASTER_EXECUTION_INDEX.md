# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `deep/queries-compat-consumer-closure`  
Base: `c7b21db4d68e396fa6ceefe3f6fdc15b1a8b8d4c`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Current exact state
- Base application HEAD: `c7b21db4d68e396fa6ceefe3f6fdc15b1a8b8d4c`.
- Current batch code/test HEAD before this Index commit: `0b7f1593fa48b001289a90eb5499ebdbae391629`.
- Exact-head CI for this branch is not yet observed; no PASS is claimed.
- Runtime/LIVE/production certification remains unclaimed.

## Batch #42 — Inventory report duplicate business truth
Finding: `ReportsPage.tsx` recomputed inventory row value in the browser as `quantity * unit_cost` even though the canonical `InventoryReportRow` contract exposes authoritative `value: number | null`.

Root cause: the real inventory report consumer had not fully migrated to the canonical snapshot field.

Canonical fix: inventory report rendering consumes `r.value`.

Regression: repository inventory report truth guard remains active.

Status: `IMPLEMENTED → REGRESSION → EXACT-HEAD CI PENDING`.

## Batch #43 — Receivables browser aggregation closure
Finding: the receivables report recomputed the headline total from aging buckets with `aging.reduce(...)` instead of consuming the canonical KPI.

Root cause: presentation detail was incorrectly treated as headline business truth.

Canonical fix: headline uses `snap.kpis.totalReceivables`; aging remains presentation detail.

Regression: cross-surface report truth guard forbids the known browser aggregation.

Status: `IMPLEMENTED → REGRESSION → EXACT-HEAD CI PENDING`.

## Batch #44 — Cross-surface report truth regression hardening
Added a consolidated regression covering canonical report consumers, export RPC contracts, tenant authority, forbidden browser aggregation and NULL inventory valuation semantics.

Status: `REGRESSION-READY → EXACT-HEAD CI PENDING`.

## Batch #45 — Queries compatibility consumer closure
Finding: `queries-compat.ts` remained on the active application dependency graph even after its business functions had become compatibility delegates.

Consumer inventory found two internal consumers:
- `src/App.tsx` imported `markAlertRead` from `queries-compat`.
- `src/lib/import/batch-folder.ts` imported `createImportRecord` and `updateImportRecord` from `queries-compat`.

Root cause: the compatibility boundary remained unnecessarily present in the internal runtime graph despite canonical equivalents existing in `src/lib/queries.ts`.

Canonical migration:
- `src/App.tsx` now imports `markAlertRead` directly from `src/lib/queries`.
- `src/lib/import/batch-folder.ts` now imports `createImportRecord` and `updateImportRecord` directly from `src/lib/queries`.

Legacy handling: `queries-compat.ts` is intentionally retained as a compatibility boundary because repository evidence cannot exclude external consumers. It is not physically removed.

Regression: `scripts/check-queries-compat-consumers.mjs` recursively scans application TypeScript sources and fails if any internal application consumer imports the compatibility boundary. It separately requires the compatibility file to remain explicitly marked compatibility-only while external-consumer risk is unresolved.

CI gate: `.github/workflows/quality.yml` now executes the zero-internal-consumer guard alongside tenant legacy-consumer discovery.

Commits:
- App migration: `96aed413498a19382a8f0965610f917d2ca0092b`.
- Batch-folder migration: `c778b75186035f1e34a56d31a7c5c2ee68789a12`.
- Regression: `3db6f50906ec503cbc4186c5581abb4da4ce7901`.
- CI wiring / current pre-index HEAD: `8282ad623130b8bad1804c92508da4ad4fd00c73`.

Certification state: `IMPLEMENTED → INTERNAL CONSUMER MIGRATED → ZERO-INTERNAL-CONSUMER REGRESSION WIRED → EXACT-HEAD CI PENDING`.

Batch state: `PARTIAL` until the regression executes and the exact branch HEAD is observed by CI.

## Batch #46 — Tenant-safe canonical compatibility boundary regression
Finding: the compatibility layer needed a stronger regression contract proving that its remaining delegated functions stay canonical and that tenant-owned direct paths fail closed.

Root cause: the existing zero-consumer regression proves internal migration, but by itself did not protect the compatibility boundary's tenant and delegation semantics from future drift.

Fix:
- Added `scripts/check-queries-compat-boundary.mjs`.
- It verifies the required compatibility exports delegate to canonical implementations.
- It requires authoritative tenant resolution and fail-closed tenant behavior.
- It guards bounded compatibility export behavior.
- It rejects reintroduction of sales business aggregation and the legacy secondary analytics RPC into the compatibility layer.

Regression: new boundary regression added on exact branch `deep/queries-compat-consumer-closure`.

Commit: `0b7f1593fa48b001289a90eb5499ebdbae391629`.

CI: Exact-head CI not yet observed for this SHA; no PASS claimed.

Certification state: `IMPLEMENTED → REGRESSION ADDED → EXACT-HEAD CI PENDING`.

Batch state: `PARTIAL` until execution and exact-head CI evidence exist.

## Existing P0/P1 truth and security state
- Invoice page reads require authoritative tenant context and bounded deterministic pagination.
- Data Quality uses authoritative tenant-safe snapshot semantics.
- Dashboard intelligence derives tenant authority from `current_company_id()`.
- Forecast reads use bounded canonical snapshot semantics.
- Export RPCs use server tenant authority, fixed search_path and authenticated-only execution; inventory export validates `p_company_id` against `current_company_id()`.
- DB-only `get_sales_secondary_metrics` remains a legacy candidate because external/database consumers cannot be excluded.

## Parallel remaining fronts
### Front A — Canonical Data Truth
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.
- cross-surface equivalence.

### Front B — Consumer + Legacy Closure
- compatibility boundary zero-consumer proof.
- duplicate business engines.
- DB-only legacy candidates with external-consumer risk.

### Front C — BI / Decision / Export
- Forecast/Demand Velocity/Inventory Intelligence.
- export metric/date/status/as-of/filter equivalence.
- Decision → Outcome provenance.

### Front D — Security / Tenant
- RPC grants/search_path/RLS.
- Storage/Realtime/AI-vector.
- workers, notifications and generated files.

### Front E — Performance
- unbounded reads.
- query plans/indexes.
- N+1 and payload bounds.

### Front F — Reliability
- worker/queue/retry/idempotency/DLQ/recovery.
- backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
- authenticated E2E.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository regression contracts exist; execution must still be evidenced for each current HEAD.
- GATED: no claim until exact-head CI evidence exists.
- CONSUMER VERIFIED: only with explicit real-consumer evidence.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue the current PR's exact-head verification while independently advancing: remaining compatibility/legacy consumer graph, cross-surface BI/Decision/Export equivalence, NULL semantics, tenant sibling sweep, reliability and runtime evidence preparation.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.

## Historical evidence preservation
Previous failure history and prior certification states must not be erased or rewritten as green merely because later fixes exist. Every new SHA requires its own evidence chain.
