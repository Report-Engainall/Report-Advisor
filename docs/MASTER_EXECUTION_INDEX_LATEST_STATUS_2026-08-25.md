# Master Execution Index — Latest Status — 2026-08-25

This is the authoritative compact execution snapshot. Consult it before starting new work. Repository source, executable CI/runtime evidence, and certification artifacts are authoritative; conversation history is not evidence.

## Indexed source head
`main` source state indexed here: `e037ce395bb3f6ae210cbd2cf4d0746af1563eda`. This is the Batch 26 source head; use it as the starting-state reference for the next execution batch.

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
| L resumable execution | YES | YES | YES/REVIEW | NOT PROVEN | NO |
| Dead-letter/retry/checkpoint | YES | YES | YES/REVIEW | NOT PROVEN | NO |
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
| Legacy tenant consumer boundary | HARDENED: read + write/static consumers outside compatibility boundary now fail the guard | YES | PENDING CURRENT CI | NOT PROVEN | NO |
| CI runner execution | IMPLEMENTED | YES | CURRENT RUN QUEUED | NOT PROVEN | NO |

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

## Compatibility boundary
`src/lib/supabase.ts` retains a nullable compatibility surface for `activeCompanyId`/`COMPANY_ID`. It is not a demo-company fallback. The UI/application boundary is now guarded against legacy reads, writes, static tenant IDs and client-side tenant filtering; do not delete the compatibility owner until repository-wide CI and runtime evidence prove safe retirement.

## Migration inventory
- 44 migration files are inventoried in the permanent migration map.
- Same-timestamp migrations remain distinct files.
- Migration order is semantically significant for `CREATE OR REPLACE` definitions.
- Static dependency analysis is conservative and is not a substitute for live PostgreSQL evidence.

## Current CI evidence
- Quality run `32868435748` on source head `5ebaca51e544792216f962fc80f8fc951f4c9e16` completed with **failure**; this was a CI/application contract failure, not a production-runtime certification result.
- Batch 26 pushed `e037ce395bb3f6ae210cbd2cf4d0746af1563eda` with the strengthened tenant-consumer guard. Quality run `32868663071` is currently **queued** for that exact head.
- No current Batch 26 PASS is claimed until run `32868663071` executes and completes.

## P0 blockers
1. **Live tenant isolation:** prove two-company read/write isolation, no-membership fail-closed, inactive membership, default-company selection, and cross-tenant Import RPC rejection against a real database.
2. **Current CI closure:** complete run `32868663071` after the repository-wide legacy consumer guard was strengthened; any discovered consumer is a real integration gap and must be fixed rather than exempted.

## P1 parallel fronts
1. Execute tenant security, Data Quality projection, migration schema/dependency, typecheck, lint and build against the current source head.
2. Obtain live migration-drift evidence.
3. Execute existing J/K/L/M runtime workflows and preserve artifacts.
4. Execute existing E/F/H/I security/resilience workflows and preserve artifacts.
5. Prove Data Quality metric parity after bounded projections before introducing aggregates/RPC computation.
6. Trace upload/import → review → persistence → reports → decisions → inventory/demand → evidence → certification.
7. Close KPI truth across Definition → Source → Formula → Query → Service → Dashboard → Report → Export; missing data must remain unknown/blocked rather than become business zero.
8. Complete Forecast backtesting/calibration and Outcome feedback using the existing intelligence engines.
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
- Batch 26: strengthened repository-wide tenant consumer guard to reject legacy/static tenant reads and client-side tenant filters, not only unsafe writes; current Quality run `32868663071` is queued against this head.

## Verified commits of interest
- `905066a2de85e604f4f97515733c0c07302aa12c` — tenant-native Data Quality boundary.
- `54205b75aa0ea5150c31243a2aaeeb47722dd494` — source-preserving Data Quality repair.
- `262c746ac1a55dd990777f8a076aded0380e17b4` — bounded Data Quality projections.
- `bbee7b8741d3d068e7ed3feb0087b370c7d6f4bb` — projection regression contract.
- `5de9d7efec919fe71d4d5475cd7db6accd51dd28` — latest-resolver security-gate correction.
- `55e0c2785d69662c8db330a40b02325cf7a30b24` — SQL matching correction.
- `3f1ceddcc38124ef07ff932bdec9e22c40ee47a9` — Batch 25 ledger.
- `e037ce395bb3f6ae210cbd2cf4d0746af1563eda` — Batch 26 tenant consumer boundary hardening.

## Non-negotiable rule
A gate existing is implementation evidence only. `Implemented`, `Gated`, and `Integrated` must never be reported as `Runtime-Evidenced` or `Production-Certified` without current executable evidence. Production certification remains blocked until the P0 evidence gaps are closed.
