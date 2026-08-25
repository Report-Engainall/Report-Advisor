# Master Execution Index — Latest Status — 2026-08-25

This is the latest compact status snapshot. It complements, and does not replace, `docs/MASTER_EXECUTION_INDEX.md`, `docs/MASTER_SYSTEM_INVENTORY_2026-08-25.md`, and the append-only current delta.

## Reference state
| Reference | Role | Status |
|---|---|---|
| `docs/MASTER_SYSTEM_INVENTORY_2026-08-25.md` | structural repository truth | ACTIVE |
| `artifacts/project-system-inventory.json` / Markdown snapshot | generated structure | REGENERATE WHEN STRUCTURE CHANGES |
| `docs/MASTER_EXECUTION_INDEX.md` | authoritative requirements/completion interpretation | ACTIVE |
| `docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25.md` | historical/current discoveries | ACTIVE |
| `docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-7.md` | Batch 7 delta supplement | ACTIVE |
| `docs/EXECUTION_LEDGER_*.md` | immutable batch history | ACTIVE |
| `docs/REFERENCE_PROTOCOL.md` | mandatory continuity protocol | ACTIVE |

## Status vocabulary
`UNKNOWN → INVENTORIED → IMPLEMENTED → GATED → INTEGRATED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED` with `BLOCKED` for external prerequisites.

## Capability matrix
| Capability | Implementation | Gate | Integration | Runtime Evidence | Production |
|---|---|---|---|---|---|
| File/schema intelligence | YES | YES | PARTIAL/REVIEW | NOT CURRENTLY PROVEN | NO |
| Entity/reconciliation | YES | YES | PARTIAL/REVIEW | NOT CURRENTLY PROVEN | NO |
| Document Intelligence | YES | YES | PARTIAL | NOT CURRENTLY PROVEN | NO |
| Watched reports | YES | YES | YES/REVIEW | NOT CURRENTLY PROVEN | NO |
| Business Control Plane | YES | YES | YES/REVIEW | NOT CURRENTLY PROVEN | NO |
| K production intelligence | YES | YES | YES/REVIEW | NOT CURRENTLY PROVEN | NO |
| L resumable execution | YES | YES | YES/REVIEW | NOT CURRENTLY PROVEN | NO |
| Dead-letter/retry/checkpoint | YES | YES | YES/REVIEW | NOT CURRENTLY PROVEN | NO |
| Production certification framework | YES | YES | YES/REVIEW | NOT CURRENTLY PROVEN | NO |
| DB tenant membership/RLS | YES | YES | YES at DB boundary | LIVE DB proof required | NO |
| Frontend auth session persistence | YES | YES | YES | NOT PROVEN | NO |
| Frontend authenticated route boundary | YES | YES | YES | NOT PROVEN | NO |
| Canonical tenant hydration | YES | YES | YES | NOT PROVEN | NO |
| Arabic login flow | YES | YES | YES | NOT PROVEN | NO |
| Frontend authenticated identity | YES | YES | YES | NOT PROVEN | NO |
| Dashboard tenant convergence | YES | YES | YES via canonical RLS | NOT PROVEN | NO |
| Owner-editable profile/display name | YES | YES | YES | NOT PROVEN | NO |
| Header health truthfulness | YES | YES | YES | NOT PROVEN | NO |
| Legacy tenant compatibility consumers | CANONICALLY HYDRATED | YES | YES | NOT PROVEN | NO |
| Database migration schema audit | YES | YES via Quality | INTEGRATED | NOT EXECUTED IN THIS ENVIRONMENT | NO |
| CI runner execution | UNKNOWN/BLOCKED | N/A | N/A | PRE-STEP FAILURES / RERUN QUEUED | NO |

## Completed in Batch 7
1. Removed legacy `COMPANY_ID` dependency from canonical dashboard query functions; tenant filtering is delegated to authenticated RLS/current_company_id.
2. Made Header health status database-backed with checking/healthy/degraded/offline states and 60-second refresh.
3. Added owner-editable `/settings/profile` page using authenticated `user_metadata.full_name`.
4. Added profile settings navigation.
5. Extended the Auth/Tenant regression guard to cover profile settings, truthful health, and dashboard tenant convergence.
6. Added canonical tenant hydration before protected UI is rendered. Legacy compatibility consumers now receive only the authenticated `current_company_id()` result; there is no demo/static tenant fallback.
7. Added a fail-closed tenant-missing state that prevents protected data from rendering when membership is absent or ambiguous.

## Completed/advanced in Batch 8
1. Added `scripts/check-migration-schema-audit.mjs` for migration naming, duplicate object declarations, and unsafe DROP-operation static checks.
2. Registered `npm run test:migration-schema-audit` in `package.json`.
3. Added the migration audit to the canonical `quality.yml` gate.
4. Requested rerun of failed Quality jobs for run `32791765387`; latest observed job `97645847479` is queued with no executable steps reported yet.

## P0/P1 backlog
### P0 — Authentication/Tenant convergence
1. ~~Trace `App.tsx` route/session boundary.~~ DONE
2. ~~Identify/login/session entry point.~~ DONE
3. ~~Replace hard-coded Sidebar identity.~~ DONE
4. ~~Add explicit unauthenticated state.~~ DONE
5. ~~Remove static tenant dependency from canonical dashboard queries.~~ DONE
6. ~~Hydrate legacy tenant compatibility consumers from canonical `current_company_id()`.~~ DONE — Batch 7 continuation
7. Prove authenticated tenant isolation end-to-end.

### P0 — CI runtime evidence
1. Obtain a Quality job with at least one executable step.
2. Separate runner/bootstrap failures from application failures.
3. Record job logs/artifacts in the ledger.

### P1 — Database closure
1. ~~Add static migration schema guard.~~ DONE — Batch 8
2. Enumerate migrations completely and build object/dependency map.
3. Verify dependency/order/drift against the actual database.
4. Compare schema consumers against actual source.

### P1 — Critical frontend flows
Upload/import → review → persistence → reports → decisions → inventory/demand → evidence → certification.

### P1 — Connected J/K/L/M runtime
Durable job → checkpoint → snapshot → evidence → decision → outcome → certification.

### P1 — E/F/H/I live evidence
Tenant, storage, realtime, AI isolation, backup/restore, recovery, rollback, governance.

## Recent verified repairs
- Quality pinned to Ubuntu 22.04.
- Specialist workflows made manual-only where duplicate automatic execution was harmful.
- Cross-surface traceability guard added.
- Whole-repository structural inventory generator added.
- Document Intelligence pipeline/lineage/closure layers added and tested.
- Authentication session persistence enabled.
- Silent demo-company tenant fallback removed.
- Canonical frontend authentication helpers added.
- Authenticated application boundary added.
- Arabic login flow added.
- Sidebar identity bound to authenticated profile data.
- Sign-out added.
- Dashboard query layer removed its legacy static tenant filter dependency.
- Header health indicator now uses a real authenticated database probe.
- Owner-editable profile/display name added.
- Protected UI now requires canonical tenant resolution before rendering.
- Legacy tenant compatibility consumers are hydrated from the canonical database resolver only.
- Migration schema audit is now a canonical Quality gate.

## Current blockers
1. GitHub Actions attempts previously failed before executable steps (`steps:null` / `steps:[]`, unavailable logs). A rerun is currently queued and must produce executable steps before application failures can be diagnosed.
2. Runtime authentication/tenant isolation evidence is not yet available.
3. Live production evidence is not yet available for the release certification chain.
4. Migration dependency/drift has static coverage but not yet live database evidence.

## Next execution order — parallelized
**NOW-1:** prove authenticated tenant isolation end-to-end with two-company/ambiguous-membership scenarios.

**NOW-2:** execute health/profile/auth regression coverage and obtain CI evidence.

**NOW-3:** complete package-script → script → workflow mapping.

**NOW-4:** complete migration/object/dependency/RLS/index mapping; use the new static audit as the baseline, then seek live evidence.

**NOW-5:** trace critical UI flows end-to-end.

**NOW-6:** connected J/K/L/M runtime evidence.

**NOW-7:** E/F/H/I live security/resilience evidence.

**NOW-8:** CI runner recovery and executable evidence.

**NOW-9:** production certification only after current evidence closes all P0 blockers.

## Batch evidence
- Batch 5: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-5.md`
- Batch 6: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-6.md`
- Batch 7: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-7.md`
- Batch 7 delta supplement: `docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-7.md`
- Batch 8: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-8.md`

## Batch 7 continuation commits
- `a460808a8079a3b68586a12ef7e687833f5c499b` — canonical tenant hydration compatibility layer
- `a5e469216ff009de5313c8f9dd5e2c29c78d8a2b` — fail-closed AuthGate tenant resolution
- `786b0705f8ff43a85840fc81956ef19d0393f519` — regression guard for canonical tenant gate

## Batch 8 commits
- `35799881fbb59f55ebb35a4116f4d3ced38d6283` / `c3d95d870b266a1b8906ae84154d3074c2123e2e` — migration schema audit guard
- `30ba166628ae96ccc7a90edff6a0a1883d987742` — package script registration
- `6a2f12c9f5523a6ff0b3ebbd6ab13ddcf551e8c8` — canonical Quality integration
- `2dfb8f0febf3745fa852e5bc0131231c0f5aee9f` — Batch 8 execution ledger

## Non-negotiable rule
No capability is marked production-complete merely because code or static contracts exist. Runtime evidence and the existing certification chain remain mandatory.