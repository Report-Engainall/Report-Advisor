# Master Execution Index — Current Snapshot — 2026-08-25

## Authoritative working head
`parallel/secondary-agent-evidence-ux` advanced with the latest execution commit(s); the current CI head is recorded by GitHub Actions.

## Tenant compatibility status
- Legacy application tenant boundary is enforced by the existing tenant closure guards.
- `COMPANY_ID` is rejected outside the compatibility owner in `src/lib/supabase.ts`.
- Canonical tenant consumers must resolve tenant context from the authenticated canonical resolver rather than static IDs or user-controlled tenant values.
- Live two-tenant RLS/RPC isolation remains unproven until Supabase runtime execution.

## Data / Import status
- Canonical import remains on the existing engine/RPC boundary; no parallel import engine introduced.
- Import idempotency, deleted-row reconciliation, rollback/retry and runtime concurrency remain evidence-gated for live execution.
- Onyx duplicate-canonical conflict regression is currently the next CI failure surface and is not marked closed until the executable regression passes.
- Durable execution has an explicit fail→retry lifecycle with tenant-scoped retry and retry-budget/dead-letter semantics.

## C — KPI / report truth
- KPI query layer is fail-closed for required query errors.
- The known `activeCustomers: totalCustomers` truth drift and business-label fallback patterns are guarded by executable closure checks.
- No PASS is claimed for KPI truth until the implementation and its dashboard/report/export parity are executable and verified.

## D — Decision / AI
- Forecast backtesting/calibration infrastructure exists on the existing analysis stack.
- Evidence-bound decision surfaces remain fail-closed where evidence is missing.
- Runtime evidence and outcome feedback are still required before certification.

## E — Runtime
- Claim/lease/heartbeat/checkpoint/complete/fail lifecycle is present.
- Retryable failures are requeued while preserving tenant ownership and retry budget; exhausted jobs remain dead-lettered.
- Live lease-expiry, duplicate-worker, checkpoint rejection and recovery evidence remains outstanding.

## F/G — Security / Certification
- Static tenant, safety, governance and release gates are running in CI.
- Cross-tenant adversarial, live RLS/RPC, storage/realtime/AI isolation, backup/restore and production smoke remain live-evidence gates.
- Production certification remains `NOT CERTIFIED`.

## Latest CI evidence
- `32870731030`: Batch 08 readiness self-match was a real guard integration bug; fixed by limiting provider-marker scanning to runtime surfaces.
- `32871088111`: Batch 08 readiness now PASS; the current blocking contract failure is `Onyx duplicate-canonical conflict regression`. Lint/build/typecheck also remain red and require root-cause inspection from executable CI output before claiming closure.
- Current head: `b4c4f17bd3c5787b628b26e928ef1b320811e8ba`.

## Execution rule
`UNKNOWN → IMPLEMENTED → INTEGRATED → TESTED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED`.
Never promote a state without executable evidence.