# Master Execution Index — Latest Status — 2026-08-25

This is the authoritative compact execution snapshot. Consult it before starting new work. Repository source, executable CI/runtime evidence, and certification artifacts are authoritative; conversation history is not evidence.

## Indexed source head
`phase-8-9-completion` source state indexed here: `e1a4fce036bac5ec0495745aa981ebf9bdd30032`. The index commit itself advances the branch after this snapshot; use the branch HEAD as the current code truth.

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
| Dashboard tenant convergence | YES | YES | YES via canonical RLS | NOT PROVEN | NO |
| Data Quality tenant-native boundary | YES | YES | INTEGRATED | NOT PROVEN | NO |
| Legacy tenant UI consumers | CLOSED for inspected import/analytics surfaces | YES | YES | NOT PROVEN | NO |
| Canonical import duplicate detection | YES | YES | INTEGRATED | NOT PROVEN | NO |
| File security/duplicate boundary | YES | YES | INTEGRATED | NOT PROVEN | NO |
| CI runner execution | UNKNOWN/BLOCKED | N/A | N/A | CURRENT HEAD CHECKS NOT YET OBSERVED | NO |

## Current batch — Tenant/import closure
- `CanonicalImportPage.tsx` no longer imports or passes `COMPANY_ID` into file duplicate detection.
- `checkDuplicate()` no longer accepts a client-supplied company identifier and uses the authenticated Supabase/RLS context as tenant authority.
- `checkDuplicate()` now has an explicit `SupabaseClient` type and throws query errors instead of silently treating an authorization/query failure as "not duplicate".
- No business default tenant was introduced.
- Existing canonical import/persistence engine remains unchanged.

## Compatibility boundary
`src/lib/supabase.ts` may retain a nullable compatibility surface for legacy consumers that are not yet safely retired. Compatibility presence is not business-data authority and must not be passed from UI into tenant-sensitive operations.

## Current CI evidence
HEAD `e1a4fce036bac5ec0495745aa981ebf9bdd30032` has no check-runs yet and commit status is `pending` with zero reported statuses. This is not a PASS or FAIL. The branch is the head of open PR #17 targeting `main`; current CI trigger behavior must be observed rather than inferred.

## P0 blockers
1. **Live tenant isolation:** prove two-company read/write isolation, no-membership fail-closed, inactive membership, default-company selection, and cross-tenant Import RPC rejection against a real database.
2. **CI execution:** obtain a current run with observable runner steps/logs; diagnose bootstrap/runner behavior using existing diagnostics rather than altering application code blindly.
3. **Production runtime:** prove worker lease/heartbeat/recovery, storage/realtime/AI isolation, backup restore, migration drift, rollback and production smoke.

## P1 parallel fronts
1. Complete repository-wide legacy tenant consumer search against the current branch and distinguish compatibility owner from unsafe UI/business consumers.
2. Execute import E2E from security scan through canonical persistence/reconciliation/evidence.
3. Prove KPI/report/export truth parity and fail-closed missing-data behavior.
4. Execute existing D/E/F/G runtime workflows; do not create duplicate engines or push workflows.
5. Close K/L connected runtime only where existing implementations can be wired safely.

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
- Batch 26: canonical import tenant-authority closure and fail-closed duplicate query handling.

## Verified commits of interest
- `e1a4fce036bac5ec0495745aa981ebf9bdd30032` — canonical import removed client tenant authority.
- `c68db4ecdb79c99d97bb0ad0a143f812560123da` — duplicate detection uses RLS tenant context and typed Supabase client.
- `905066a2de85e604f4f97515733c0c07302aa12c` — tenant-native Data Quality boundary.
- `54205b75aa0ea5150c31243a2aaeeb47722dd494` — source-preserving Data Quality repair.
- `262c746ac1a55dd990777f8a076aded0380e17b4` — bounded Data Quality projections.
- `bbee7b8741d3d068e7ed3feb0087b370c7d6f4bb` — projection regression contract.

## Non-negotiable rule
A gate existing is implementation evidence only. `Implemented`, `Gated`, and `Integrated` must never be reported as `Runtime-Evidenced` or `Production-Certified` without current executable evidence. Production certification remains blocked until the P0 evidence gaps are closed.
