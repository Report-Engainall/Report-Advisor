# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `fix/inventory-report-truth`  
Base: `d0588e5f9bcb70a3b0ff039843d3b8a9500c4da4`  

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Batch #38 — Inventory report duplicate business truth
Finding: `ReportsPage.tsx` recomputed inventory row value in the browser as `quantity * unit_cost` even though the canonical `InventoryReportRow` contract already exposes authoritative `value: number | null`.

Classification: `P1 BUSINESS TRUTH / DUPLICATE CLIENT CALCULATION`

Root cause: the Inventory report consumer had not fully migrated from the legacy presentation calculation to the canonical inventory snapshot contract.

Canonical source: `fetchInventoryReportSnapshot()` → `InventoryReportRow.value`.

Regression: `scripts/check-inventory-report-truth.mjs` was added to require the canonical `value` field and fail if `ReportsPage.tsx` contains `r.quantity * r.unit_cost`.

Consumer state: **MIGRATION REQUIRED**. The regression correctly remains red until the real consumer is migrated; therefore this batch is not CLOSED.

Legacy state: client-side valuation calculation is a legacy duplicate and must be removed only after the consumer migration is committed and regression passes.

Exact-head CI: not claimed for the inventory branch at this point.

Certification state: `IMPLEMENTED (REGRESSION GATE) → CONSUMER VERIFIED PENDING → EXACT-HEAD CI PENDING`.

## Prior exact-head evidence
Forecast canonical fix `728b344f57c304ab5e66744db40624d3d4a2c8a3` has a production-chain guard run `33104660444`, job `98631162091`, with SUCCESS on that exact SHA. This is guard evidence only, not full production certification.

## Parallel remaining fronts
### Front A — Canonical Data Truth
- `queries-compat.ts` full function/consumer graph.
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.
- Inventory report consumer migration from local valuation to canonical `row.value`.

### Front B — Consumer + Legacy Closure
- zero-consumer proof for compatibility functions.
- duplicate business engines.
- DB-only legacy candidates with external-consumer risk.

### Front C — BI / Decision / Export
- cross-surface equivalence.
- Forecast/Demand Velocity/Inventory Intelligence.
- export metric/date/status/as-of/filter equivalence.

### Front D — Security / Tenant
- RPC grants/search_path/RLS.
- Storage/Realtime/AI-vector.
- workers, notifications and generated files.

### Front E — Performance
- unbounded reads.
- query plans/indexes.
- N+1 and payload bounds.

### Front F — Reliability
- worker/watcher/queue/retry/idempotency/DLQ/recovery.
- backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
- authenticated E2E.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists.
- GATED: only with exact-head CI evidence.
- CONSUMER VERIFIED: only with explicit real-consumer evidence.
- RUNTIME VERIFIED: only with runtime execution evidence.
- LIVE VERIFIED: only with real environment evidence.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue independent fronts without waiting for CI. Highest immediate P1 remains Inventory Truth consumer migration, followed by remaining browser duplicate calculations and cross-surface BI/Decision/Export equivalence. Exact-head CI remains a certification barrier, not a reason to stop independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.

## Historical evidence preservation
Previous failure history and prior certification states must not be erased or rewritten as green merely because later fixes exist. Every new SHA requires its own evidence chain.
