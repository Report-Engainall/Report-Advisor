# Master Execution Index — Latest Status — 2026-08-25

This is the authoritative compact execution snapshot. Consult it before starting new work. Repository source, executable CI/runtime evidence, and certification artifacts are authoritative; conversation history is not evidence.

## Indexed source head
`main` source state indexed here: `50f272ccbb072f3fa6a5a72659bd37d7a7d54395`. This is the current Batch 27 execution head before this index synchronization commit; use it as the implementation reference for the next execution batch.

## Evidence vocabulary
`UNKNOWN → INVENTORIED → IMPLEMENTED → GATED → INTEGRATED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED`; use `BLOCKED` only for an external prerequisite.

## Current capability matrix
| Capability | Implementation | Gate | Integration | Runtime | Production |
|---|---|---|---|---|---|
| File/schema intelligence | YES | YES | PARTIAL/REVIEW | NOT PROVEN | NO |
| Entity/reconciliation | YES | YES | PARTIAL/REVIEW | NOT PROVEN | NO |
| Document Intelligence | YES | YES | PARTIAL | NOT PROVEN | NO |
| Watched reports | YES | YES | YES/REVIEW | NOT PROVEN | NO |
| Business Control Plane | YES | YES | YES/REVIEW | NOT PROVEN | NO |
| K production intelligence | YES | YES | YES/REVIEW | NOT PROVEN | NO |
| L resumable execution | YES | YES | YES/REVIEW | RETRY RECOVERY IMPLEMENTED / LIVE NOT PROVEN | NO |
| Dead-letter/retry/checkpoint | YES | YES | YES/REVIEW | FAILURE→RETRY→DEAD-LETTER PATH IMPLEMENTED / LIVE NOT PROVEN | NO |
| Production certification framework | YES | YES | YES/REVIEW | NOT PROVEN | NO |
| DB tenant membership/RLS | YES | YES | YES at DB boundary | LIVE PROOF REQUIRED | NO |
| Frontend auth/session | YES | YES | YES | NOT PROVEN | NO |
| Authenticated route boundary | YES | YES | YES | NOT PROVEN | NO |
| Canonical tenant hydration | YES | YES | YES | NOT PROVEN | NO |
| Arabic login | YES | YES | YES | NOT PROVEN | NO |
| Dynamic authenticated identity | YES | YES | YES | NOT PROVEN | NO |
| Dashboard tenant convergence | YES | YES | YES via canonical RLS | NOT PROVEN | NO |
| Data Quality tenant-native boundary | YES | YES | INTEGRATED | NOT PROVEN | NO |
| Data Quality bounded projections | YES | YES | INTEGRATED | NOT PROVEN | NO |
| Data Quality projection regression contract | YES | YES | INTEGRATED | NOT PROVEN | NO |
| Migration schema audit | YES | YES via Quality | INTEGRATED | NOT OBSERVED | NO |
| Migration dependency analysis | YES | YES via Quality | INTEGRATED | NOT OBSERVED | NO |
| Company configuration truth guard | YES | YES via Quality | INTEGRATED | NOT PROVEN | NO |
| Legacy application tenant consumer boundary | HARDENED: legacy/static application consumers are rejected outside the compatibility owner; Canonical Import was corrected to resolve authoritative tenant context | YES | PENDING NEW CI | NOT PROVEN | NO |
| CI runner execution | IMPLEMENTED | YES | NEW RUN PENDING/QUEUED | NOT PROVEN | NO |

## Tenant model — corrected canonical semantics
- Multiple historical `current_company_id()` definitions exist.
- The effective source definition in migration order is `20260822212000_canonical_tenant_membership.sql`.
- The effective resolver derives tenant context from `auth.uid()` + active + default membership and returns at most one company.
- The unique active-default index prevents multiple active defaults for one user.
- This is a multi-membership/default-tenant model; the old wording "multiple membership is always ambiguous/fail-closed" is no longer treated as the effective runtime contract.
- No client-supplied `company_id` is accepted as the source of tenant truth.
- Live database behavior is still NOT PROVEN.

## Tenant/Data Quality source work
- Data Quality no longer consumes `COMPANY_ID` from the UI.
- Data Quality uses `fetchDataQualityDatasets()`.
- Data Quality projections are bounded to fields consumed by the current metrics rather than `select(*)`.
- A regression contract protects the projection boundary and is integrated into canonical Quality.
- The tenant security contract was corrected to inspect the latest `current_company_id()` definition rather than the first historical resolver.
- A dedicated tenant-resolver lineage guard was added.

## Import / runtime closure work
- Canonical Import no longer uses `COMPANY_ID` directly; duplicate detection now receives the authoritative tenant returned by `resolveCurrentCompanyId()` and fails closed when tenant context is unavailable.
- Durable report execution enforces tenant + lease ownership for claim, heartbeat, checkpoint, completion and failure.
- Durable failure recovery is now executable in the existing runner: failure is persisted, then a failed job is re-queued while `attempt < max_attempts`; exhausted jobs remain `dead_letter`.
- `retry_report_execution_job` is tenant-scoped and cannot revive jobs that exhausted their retry budget.
- The durable runner contract guard now requires the retry recovery path.
- Live Supabase execution of these paths remains NOT PROVEN.

## Compatibility boundary
`src/lib/supabase.ts` retains a nullable compatibility surface for `activeCompanyId`/`COMPANY_ID`. It is not a demo-company fallback. The application boundary is guarded against legacy/static consumers; SQL/RLS enforcement remains covered by the dedicated global tenant/RPC gates.

## Migration inventory
- 44 migration files were inventoried before Batch 27; Batch 27 adds one migration, so the current repository contains 45 migration files.
- Same-timestamp migrations remain distinct files.
- Migration order is semantically significant for `CREATE OR REPLACE` definitions.
- Static dependency analysis is conservative and is not a substitute for live PostgreSQL evidence.

## Current CI evidence
- Quality run `32868919633` on head `228df63db82687e7584d57b929ac56f3b1ac2d3e` failed at `Tenant legacy consumer boundary`; its log identified `src/pages/CanonicalImportPage.tsx` as the genuine remaining legacy consumer.
- That consumer was fixed in commit `43a9557bb32c2a17cb590fc9b02eb901f9d97a3c`.
- Batch 27 then implemented durable retry/recovery in commits `3d14c3cf6b39f532bed2777ef2bb0f9dc89bcc1e`, `33fa4662afc28813b992e66532265facc9766195`, `cdc168536ff910d6162da9d02b6ca021b33dfbab`, and `50f272ccbb072f3fa6a5a72659bd37d7a7d54395`.
- The available GitHub Actions wrapper has not exposed a new main-push run ID yet; therefore no PASS is claimed for the new head.

## P0 blockers
1. **Live tenant isolation:** prove two-company read/write isolation, no-membership fail-closed, inactive membership, default-company selection, and cross-tenant Import RPC rejection against a real database.
2. **Current CI closure:** execute Quality against Batch 27 head; any new failure is a real executable failure until fixed.

## P1 parallel fronts
1. Execute tenant security, Data Quality projection, migration schema/dependency, typecheck, lint and build against the current source head.
2. Obtain live migration-drift evidence.
3. Execute existing J/K/L/M runtime workflows and preserve artifacts.
4. Execute existing E/F/H/I security/resilience workflows and preserve artifacts.
5. Prove Data Quality metric parity after bounded projections before introducing aggregates/RPC computation.
6. Trace upload/import → review → persistence → reports → decisions → inventory/demand → evidence → certification.
7. Close KPI truth across Definition → Source → Formula → Query → Service → Dashboard → Report → Export; missing data must remain unknown/blocked rather than become business zero.
8. Execute existing Forecast backtesting/calibration and Outcome feedback using the existing intelligence engines.
9. Prove worker Claim → Lease → Heartbeat → Checkpoint → Complete/Fail → Retry → Recovery → Dead-letter with concurrency/failure injection.
10. Run adversarial tenant/RLS/RPC, Storage/Realtime/AI isolation, upload security, resource exhaustion and backup/restore checks where the environment permits.

## Permanent reference files
- `docs/MASTER_EXECUTION_INDEX.md`
- `docs/MASTER_SYSTEM_INVENTORY_2026-08-25.md`
- `docs/MIGRATION_EXECUTION_MAP_2026-08-25.md`
- `docs/PROJECT_DESCRIPTION.md`
- Append-only execution ledgers and batch deltas.

## Batch history
- Batch 18: tenant-native Data Quality integration and UI legacy-boundary closure.
- Batch 19: source-preserving repair after an over-aggressive rewrite was detected.
- Batch 20: Data Quality scalability plan.
- Batch 21: bounded Data Quality projections.
- Batch 22: projection regression contract and Quality integration.
- Batch 24: tenant resolver lineage correction and security-gate hardening.
- Batch 25: current-head CI bootstrap evidence and permanent index synchronization.
- Batch 26: repository-wide application tenant consumer guard hardened; false-positive canonical resolver filters removed from the guard.
- Batch 27: Canonical Import legacy tenant consumer removed; durable report retry/recovery path added, wired into the runner, and protected by the existing runner contract guard.

## Verified commits of interest
- `905066a2de85e604f4f97515733c0c07302aa12c` — tenant-native Data Quality boundary.
- `54205b75aa0ea5150c31243a2aaeeb47722dd494` — source-preserving Data Quality repair.
- `262c746ac1a55dd990777f8a076aded0380e17b4` — bounded Data Quality projections.
- `bbee7b8741d3d068e7ed3feb0087b370c7d6f4bb` — projection regression contract.
- `5de9d7efec919fe71d4d5475cd7db6accd51dd28` — latest-resolver security-gate correction.
- `55e0c2785d69662c8db330a40b02325cf7a30b24` — SQL matching correction.
- `3f1ceddcc38124ef07ff932bdec9e22c40ee47a9` — Batch 25 ledger.
- `228df63db82687e7584d57b929ac56f3b1ac2d3e` — Batch 26 tenant boundary scope correction.
- `43a9557bb32c2a17cb590fc9b02eb901f9d97a3c` — Canonical Import legacy tenant consumer removal.
- `3d14c3cf6b39f532bed2777ef2bb0f9dc89bcc1e` — durable retry/recovery RPC migration.
- `33fa4662afc28813b992e66532265facc9766195` — durable store retry adapter.
- `cdc168536ff910d6162da9d02b6ca021b33dfbab` — durable runner automatic retry wiring.
- `50f272ccbb072f3fa6a5a72659bd37d7a7d54395` — durable runner recovery contract guard.

## Non-negotiable rule
A gate existing is implementation evidence only. `Implemented`, `Gated`, and `Integrated` must never be reported as `Runtime-Evidenced` or `Production-Certified` without current executable evidence. Production certification remains blocked until the P0 evidence gaps are closed.
