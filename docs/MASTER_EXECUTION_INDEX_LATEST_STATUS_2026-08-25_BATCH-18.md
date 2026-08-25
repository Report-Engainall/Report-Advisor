# Master Execution Index — Current Snapshot — 2026-08-25

## Authoritative working head
`parallel/secondary-agent-evidence-ux` advanced with commit `3b4db6d6f1ec23372e456bde7d437fde96a6fed6`.

## Tenant compatibility status
- Legacy application tenant boundary is enforced by `scripts/check-next-wave-closure.mjs`.
- `COMPANY_ID` is rejected outside the compatibility owner in `src/lib/supabase.ts`.
- Canonical tenant consumers must resolve the tenant through the current tenant context rather than static IDs or user-controlled tenant values.
- Live two-tenant RLS/RPC isolation remains unproven until Supabase runtime execution.

## Data / Import status
- Canonical import path remains the existing engine/RPC boundary; no parallel import engine introduced.
- Import idempotency/reconciliation/runtime concurrency remain evidence-gated for live execution.
- Durable execution now has an explicit fail→retry lifecycle with tenant-scoped retry RPC and retry-budget/dead-letter semantics in the working branch.

## C — KPI / report truth
- Existing KPI query layer already fails closed for missing required numeric/date fields.
- A new executable closure guard now rejects the known `activeCustomers: totalCustomers` truth drift and business-label fallbacks such as `?? 'غير معروف'` in `src/lib/queries.ts`.
- The guard is intentionally red until the KPI implementation itself is corrected; no PASS is claimed from static inspection alone.

## D — Decision / AI
- Forecast backtesting/calibration infrastructure exists and remains connected to the existing analysis stack.
- Runtime evidence and outcome feedback are still required before certification.

## E — Runtime
- Claim/lease/heartbeat/checkpoint/complete/fail lifecycle is present.
- Durable failure recovery has been strengthened to requeue retryable jobs while preserving tenant ownership and dead-letter limits.
- Live lease-expiry, duplicate-worker and recovery evidence remains outstanding.

## F/G — Security / Certification
- Static safety gates are present and continue to run in CI.
- Cross-tenant adversarial, live RLS/RPC, storage/realtime/AI isolation, backup/restore and production smoke remain live-evidence gates.
- Production certification remains `NOT CERTIFIED`.

## Current CI evidence
- `32870681540` — workflow `secondary-agent-batch04`, head `3b4db6d6f1ec23372e456bde7d437fde96a6fed6`, currently queued at index update time.
- No CI PASS is claimed until this exact head completes.

## Execution rule
`UNKNOWN → IMPLEMENTED → INTEGRATED → TESTED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED`.
Never promote a state without executable evidence.
