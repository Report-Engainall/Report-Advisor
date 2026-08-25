# Master Execution Index — Latest Status — 2026-08-25

This is the latest compact execution snapshot. It complements `docs/MASTER_EXECUTION_INDEX.md`, `docs/MASTER_SYSTEM_INVENTORY_2026-08-25.md`, the append-only current deltas, and the execution ledgers. It is the first place to consult before starting new work.

## Continuity rule
Never infer completion from conversation history. Repository source, executable CI/runtime evidence, and certification artifacts are authoritative. Status vocabulary: `UNKNOWN → INVENTORIED → IMPLEMENTED → GATED → INTEGRATED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED`; use `BLOCKED` for external prerequisites.

## Current repository head
`main` = `533ec67800dc1340b2411a86403f77175df91126` — `docs: record batch 15 execution ledger`.

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
| Legacy tenant compatibility consumers | CANONICALLY HYDRATED | YES | YES | NOT PROVEN | NO |
| Migration schema audit | YES | YES via Quality | INTEGRATED | NOT EXECUTED WITH OBSERVABLE STEPS | NO |
| Migration dependency analysis | YES | YES via Quality | INTEGRATED | NOT YET EXECUTED WITH OBSERVABLE STEPS | NO |
| Company configuration truth guard | YES | YES via Quality | INTEGRATED | NOT PROVEN | NO |
| Legacy tenant consumer boundary guard | YES | YES via Quality | INTEGRATED | NOT PROVEN | NO |
| CI runner execution | UNKNOWN/BLOCKED | N/A | N/A | PRE-STEP FAILURE CONFIRMED | NO |

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
- Tenant legacy consumer boundary guard exists and prevents new `COMPANY_ID`/`activeCompanyId` usage outside documented compatibility boundaries.
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
- Static dependency analysis is now machine-checkable; it deliberately remains conservative and does not claim to be a full PostgreSQL parser or live schema proof.

## Known legacy area — do not misclassify
`src/pages/EntityPages.tsx` / Data Quality still contains legacy `COMPANY_ID` filters for customers, products, invoices, and inventory. The compatibility boundary is canonically hydrated by AuthGate, but this is NOT the same as a fully RLS-native frontend refactor. Keep status `PARTIAL/REVIEW` until complete source-context-safe refactor and evidence exist.

`src/lib/supabase.ts` retains a documented nullable compatibility surface for `activeCompanyId`; this is not a demo-company fallback. Do not remove it blindly until all consumers are migrated.

## P0 blockers
### 1. Authenticated tenant isolation proof
Prove two-company isolation and ambiguous-membership fail-closed behavior end-to-end with executable evidence.

### 2. CI executable evidence
Recent Quality runs have completed with failure before any executable step is exposed. The observed job state has `steps: []`/no usable logs, so it is classified as runner/bootstrap/pre-step until a run exposes executable steps. Do not classify this as an application assertion failure without evidence.

## P1 parallel fronts
1. Obtain complete Data Quality source context, then replace only the four legacy filters with RLS-native reads; never wholesale-replace a partially retrieved file.
2. Review the migration dependency analyzer output and distinguish intentional object evolution from true conflicts.
3. Verify migration drift against live DB when live credentials/environment are available.
4. Trace critical frontend flow: upload/import → review → persistence → reports → decisions → inventory/demand → evidence → certification.
5. Execute existing J/K/L/M runtime workflows and record real artifacts/evidence instead of rebuilding their framework.
6. Execute existing E/F/H/I security/resilience workflows and capture live evidence.
7. Diagnose CI runner/bootstrap using the existing runner diagnostic workflow; do not modify application code to compensate for an infrastructure failure without evidence.

## Existing certification infrastructure discovered
The repository already contains runtime/certification workflows for runner diagnostics, J/K/L runtime, Phase E live certification, Phase F resilience, production verification, production-chain guards, runtime closure, recovery readiness, release certification, and security/provenance certification. These are existing capabilities to execute and verify, not systems to rebuild.

## Batch history
- Batch 5: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-5.md`
- Batch 6: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-6.md`
- Batch 7: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-7.md`
- Batch 8: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-8.md`
- Batch 9: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-9.md`
- Batch 10: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-10.md`
- Batch 11: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-11.md`
- Batch 12: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-12.md`
- Batch 13: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-13.md`
- Batch 14: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-14.md`
- Batch 15: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-15.md`
- Batch 15 delta: `docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-15.md`

## Batch 15 verified repository evidence
- Migration dependency analyzer committed at `fed046c6d76a98621183ad4aef52301f659adc65`.
- Package registration committed at `a83a172dbb6492a1d276634ef272911ddc070fcd`.
- Canonical Quality integration committed at `a41c5de75b2f4664e64bb7ca698f3f19995c5dfa`.
- Batch 15 delta and ledger are committed in-repository.
- The analyzer has not yet been claimed as passed in CI; its first executable run must be inspected.

## Non-negotiable evidence rule
A gate existing is implementation evidence only. `Implemented`, `Gated`, and `Integrated` must never be reported as `Runtime-Evidenced` or `Production-Certified` without current executable evidence. Production certification is blocked until all P0 evidence gaps are closed.
