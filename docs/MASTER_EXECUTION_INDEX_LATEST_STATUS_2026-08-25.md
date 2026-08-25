# Master Execution Index — Latest Status — 2026-08-25

This is the authoritative compact execution snapshot. Consult it before starting new work. Repository source, executable CI/runtime evidence, and certification artifacts are authoritative; conversation history is not evidence.

## Indexed source head
`main` source state indexed here: `bfe3de31a64792f757982f7b5eee974a8011ed70`. The index commit itself necessarily advances the branch after this snapshot; therefore use this file as the starting-state reference for the next execution batch.

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
| Legacy tenant consumer boundary | CLOSED IN UI; compatibility owner remains | YES | YES | NOT PROVEN | NO |
| CI runner execution | UNKNOWN/BLOCKED | N/A | N/A | CURRENT RUNS FAIL BEFORE EXPOSED STEPS | NO |

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
`src/lib/supabase.ts` retains a nullable compatibility surface for `activeCompanyId`/`COMPANY_ID`. It is not a demo-company fallback. The UI is closed to legacy consumers. Do not delete the compatibility owner until repository-wide consumers and runtime evidence prove safe retirement.

## Migration inventory
- 44 migration files are inventoried in the permanent migration map.
- Same-timestamp migrations remain distinct files.
- Migration order is semantically significant for `CREATE OR REPLACE` definitions.
- Static dependency analysis is conservative and is not a substitute for live PostgreSQL evidence.

## Current CI evidence
Two `main` push workflows for preceding HEAD `3ad1fea5d28cce05f439b5d87d6ec9190edad4a9` completed with failure before any executable step was exposed:
- `production-certification-boundary` run `32800542257`, job `97660352968`: failure, `steps=[]`.
- `master-production-verification` run `32800542369`, job `97660353233`: failure, `steps=[]`.

This is bootstrap/runner evidence, not an application test failure. No usable job log/step data was exposed, so the root cause remains UNKNOWN. Application gates must not be labeled failed until an observable step runs.

## P0 blockers
1. **Live tenant isolation:** prove two-company read/write isolation, no-membership fail-closed, inactive membership, default-company selection, and cross-tenant Import RPC rejection against a real database.
2. **CI execution:** obtain a current run with observable runner steps/logs; diagnose bootstrap/runner failure using the existing diagnostic workflow rather than altering application code blindly.

## P1 parallel fronts
1. Execute tenant security, Data Quality projection, migration schema/dependency, typecheck, lint and build against the current source head.
2. Obtain live migration-drift evidence.
3. Execute existing J/K/L/M runtime workflows and preserve artifacts.
4. Execute existing E/F/H/I security/resilience workflows and preserve artifacts.
5. Prove Data Quality metric parity after bounded projections before introducing aggregates/RPC computation.
6. Trace upload/import → review → persistence → reports → decisions → inventory/demand → evidence → certification.

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

## Verified commits of interest
- `905066a2de85e604f4f97515733c0c07302aa12c` — tenant-native Data Quality boundary.
- `54205b75aa0ea5150c31243a2aaeeb47722dd494` — source-preserving Data Quality repair.
- `262c746ac1a55dd990777f8a076aded0380e17b4` — bounded Data Quality projections.
- `bbee7b8741d3d068e7ed3feb0087b370c7d6f4bb` — projection regression contract.
- `5de9d7efec919fe71d4d5475cd7db6accd51dd28` — latest-resolver security-gate correction.
- `55e0c2785d69662c8db330a40b02325cf7a30b24` — SQL matching correction.
- `3f1ceddcc38124ef07ff932bdec9e22c40ee47a9` — Batch 25 ledger.
- `2038f1ee62c10a5a1222495787d8e4f2ab58367d` — previous index synchronization.
- `bfe3de31a64792f757982f7b5eee974a8011ed70` — previous source-head snapshot.

## Non-negotiable rule
A gate existing is implementation evidence only. `Implemented`, `Gated`, and `Integrated` must never be reported as `Runtime-Evidenced` or `Production-Certified` without current executable evidence. Production certification remains blocked until the P0 evidence gaps are closed.