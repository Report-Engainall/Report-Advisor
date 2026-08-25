# Master Execution Index — Latest Status — 2026-08-25

This is the latest compact execution snapshot. Consult it before starting new work. It complements `docs/MASTER_EXECUTION_INDEX.md`, `docs/MASTER_SYSTEM_INVENTORY_2026-08-25.md`, the migration map, and append-only execution ledgers.

## Continuity rule
Never infer completion from conversation history. Repository source, executable CI/runtime evidence, and certification artifacts are authoritative. Status vocabulary: `UNKNOWN → INVENTORIED → IMPLEMENTED → GATED → INTEGRATED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED`; use `BLOCKED` for external prerequisites.

## Current repository head
`main` = `3d1e1dd9d6d703c139096b7de6dbdc9479077958` — `docs: record Data Quality projection regression gate batch 22`.

## Capability matrix
| Capability | Implementation | Gate | Integration | Runtime Evidence | Production |
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
| Owner-editable profile/display name | YES | YES | YES | NOT PROVEN | NO |
| Header health truthfulness | YES | YES | YES | NOT PROVEN | NO |
| Legacy tenant compatibility consumers | CLOSED IN UI; COMPATIBILITY OWNER REMAINS | YES | YES | NOT PROVEN | NO |
| Data Quality tenant-native boundary | YES | YES | INTEGRATED | NOT PROVEN | NO |
| Data Quality bounded projections | YES | YES | INTEGRATED | NOT PROVEN | NO |
| Data Quality projection regression contract | YES | YES | INTEGRATED | NOT PROVEN | NO |
| Migration schema audit | YES | YES via Quality | INTEGRATED | NOT EXECUTED WITH OBSERVABLE STEPS | NO |
| Migration dependency analysis | YES | YES via Quality | INTEGRATED | NOT YET EXECUTED WITH OBSERVABLE STEPS | NO |
| Company configuration truth guard | YES | YES via Quality | INTEGRATED | NOT PROVEN | NO |
| Legacy tenant consumer boundary guard | YES | YES via Quality | INTEGRATED | NOT PROVEN | NO |
| CI runner execution | UNKNOWN/BLOCKED | N/A | N/A | CURRENT HEAD NOT PROVEN; HISTORICAL PRE-STEP FAILURE OBSERVED | NO |

## Confirmed completed work
### Auth/Tenant
- Auth session persistence and canonical auth helpers exist.
- Authenticated application boundary exists.
- Arabic login flow exists.
- Sidebar identity is derived from authenticated profile data; no fixed admin email is used.
- Sign-out exists.
- Canonical `current_company_id()` hydration is required before protected UI renders.
- Missing/ambiguous tenant membership fails closed.
- Dashboard query layer removed its legacy static tenant filter dependency.
- Header health is database-backed and treats NULL/error tenant resolution as degraded rather than healthy.

### Quality/guards
- Migration schema audit exists and is registered in `package.json` and canonical `quality.yml`.
- Migration dependency analyzer exists, is registered as `test:migration-dependencies`, and is integrated into canonical Quality.
- Company configuration truth guard exists to reject prohibited hard-coded company identity/configuration, including `admin@alamri.com`.
- Tenant legacy consumer boundary guard permits compatibility tokens only in `src/lib/supabase.ts`; the UI exception is closed.
- Data Quality reads are routed through `src/lib/data-quality-queries.ts` and no longer supply a company identifier from the UI.
- Data Quality projections are bounded to fields consumed by the current metrics.
- Data Quality projection regression contract is registered in package scripts and canonical Quality.
- These guards are implementation/regression evidence, not runtime certification.

### Permanent project reference
- `docs/PROJECT_DESCRIPTION.md` is the official Arabic/English project description and explicitly distinguishes implementation from runtime evidence and production certification.
- `docs/MIGRATION_EXECUTION_MAP_2026-08-25.md` permanently inventories the currently discovered migration chain and explicitly separates repository evidence from live DB evidence.
- Batch deltas and execution ledgers are stored in-repository to prevent context loss and repeated work.

## Migration inventory and dependency work
- 44 migration files are currently inventoried in the permanent migration map.
- Same-timestamp migrations are treated as distinct files and are not deduplicated by timestamp alone.
- Tenant/import hardening is treated as a layered dependency chain rather than replaced wholesale.
- Import evolution is treated as existing infrastructure requiring dependency/runtime evidence, not a rebuild.
- Static dependency analysis is machine-checkable; it deliberately remains conservative and does not claim to be a full PostgreSQL parser or live schema proof.

## Known remaining compatibility area
`src/lib/supabase.ts` retains a documented nullable compatibility surface for `activeCompanyId`/`COMPANY_ID`. This is not a demo-company fallback. Do not remove it until repository-wide consumers and runtime evidence confirm it can be retired safely.

## P0 blockers
### 1. Authenticated tenant isolation proof
Prove two-company isolation and ambiguous-membership fail-closed behavior end-to-end with executable evidence.

### 2. CI executable evidence
Historical Quality runs have completed with failure before any executable step is exposed. The observed historical job state has `steps: []`/no usable logs, so it is classified as runner/bootstrap/pre-step for those runs. The current HEAD must not be classified without a current run and observable steps.

## P1 parallel fronts
1. Execute tenant legacy audit, Data Quality projection contract, typecheck, lint, and build against the current refactor.
2. Review the migration dependency analyzer output and distinguish intentional object evolution from true conflicts.
3. Verify migration drift against live DB when live credentials/environment are available.
4. Trace critical frontend flow: upload/import → review → persistence → reports → decisions → inventory/demand → evidence → certification.
5. Execute existing J/K/L/M runtime workflows and record real artifacts/evidence instead of rebuilding their framework.
6. Execute existing E/F/H/I security/resilience workflows and capture live evidence.
7. Diagnose CI runner/bootstrap using the existing runner diagnostic workflow; do not modify application code to compensate for an infrastructure failure without evidence.
8. Prove Data Quality metric parity after bounded projections before introducing aggregate/RPC computation.

## Existing certification infrastructure discovered
The repository already contains runtime/certification workflows for runner diagnostics, J/K/L runtime, Phase E live certification, Phase F resilience, production verification, production-chain guards, runtime closure, recovery readiness, release certification, and security/provenance certification. These are existing capabilities to execute and verify, not systems to rebuild.

## Batch history
- Batch 5 through Batch 17: stored in their corresponding execution ledgers/deltas.
- Batch 18: tenant-native Data Quality integration and UI legacy-boundary closure.
- Batch 19: source-preserving repair after detecting an over-aggressive file rewrite.
- Batch 20: Data Quality scalability planning and explicit decision not to claim performance improvement without evidence.
- Batch 21: bounded Data Quality projections implemented in `src/lib/data-quality-queries.ts`.
- Batch 22: Data Quality projection regression contract added to package scripts and canonical Quality.

## Verified repository evidence
- `905066a2de85e604f4f97515733c0c07302aa12c`: tenant-native Data Quality query boundary.
- `54205b75aa0ea5150c31243a2aaeeb47722dd494`: source-preserving repair with tenant-native Data Quality reads.
- `262c746ac1a55dd990777f8a076aded0380e17b4`: bounded Data Quality projections.
- `bbee7b8741d3d068e7ed3feb0087b370c7d6f4bb`: Data Quality projection regression contract.
- `2778640cef713974aabc0fed0cd4a4aedff7fabf`: package script registration.
- `ded719a2a1974e5ec65e45497b046c7eef232158`: canonical Quality integration.
- `scripts/check-tenant-legacy-consumers.mjs` allows the compatibility token only in `src/lib/supabase.ts`.
- Repository search currently returns no additional `COMPANY_ID` matches outside the guarded compatibility boundary.

## Non-negotiable evidence rule
A gate existing is implementation evidence only. `Implemented`, `Gated`, and `Integrated` must never be reported as `Runtime-Evidenced` or `Production-Certified` without current executable evidence. Production certification is blocked until all P0 evidence gaps are closed.
