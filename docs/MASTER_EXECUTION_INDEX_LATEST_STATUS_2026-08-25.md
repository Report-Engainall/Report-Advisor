# Master Execution Index — Latest Status — 2026-08-25

This is the latest compact status snapshot. It complements, and does not replace, `docs/MASTER_EXECUTION_INDEX.md`, `docs/MASTER_SYSTEM_INVENTORY_2026-08-25.md`, and the append-only current delta.

## Reference state
| Reference | Role | Status |
|---|---|---|
| `docs/MASTER_SYSTEM_INVENTORY_2026-08-25.md` | structural repository truth | ACTIVE |
| `artifacts/project-system-inventory.json` / Markdown snapshot | generated structure | REGENERATE WHEN STRUCTURE CHANGES |
| `docs/MASTER_EXECUTION_INDEX.md` | authoritative requirements/completion interpretation | ACTIVE |
| `docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25.md` | historical/current discoveries | ACTIVE |
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
| Frontend auth session persistence | YES (Batch 5) | YES (new convergence gate) | PARTIAL | NOT PROVEN | NO |
| Frontend authenticated route boundary | NOT YET PROVEN | NO | NO | NO | NO |
| Frontend hard-coded identity removal | NOT YET COMPLETE | NEW GATE WILL CATCH | NO | NO | NO |
| Legacy static tenant context | REMOVED DEFAULT; COMPAT ACCESSORS REMAIN | YES | MIGRATION IN PROGRESS | NO | NO |
| CI runner execution | UNKNOWN/BLOCKED | N/A | N/A | PRE-STEP FAILURES ONLY | NO |

## P0/P1 backlog
### P0 — Authentication/Tenant convergence
1. Trace `App.tsx` route/session boundary.
2. Identify login/profile/session entry point.
3. Replace hard-coded Sidebar identity with authenticated profile/session data.
4. Add explicit unauthenticated state.
5. Trace all tenant-context consumers and remove legacy reliance.
6. Prove authenticated tenant isolation end-to-end.

### P0 — CI runtime evidence
1. Obtain a Quality job with at least one executable step.
2. Separate runner/bootstrap failures from application failures.
3. Record job logs/artifacts in the ledger.

### P1 — Database closure
1. Enumerate migrations.
2. Map tables/functions/indexes/policies/triggers.
3. Verify dependency/order/drift.
4. Compare schema consumers against actual source.

### P1 — Critical frontend flows
Upload/import → review → persistence → reports → decisions → inventory/demand → evidence → certification.

### P1 — Connected J/K/L/M runtime
Durable job → checkpoint → snapshot → evidence → decision → outcome → certification.

### P1 — E/F/H/I live evidence
Tenant, storage, realtime, AI isolation, backup/restore, recovery, rollback, governance.

## Recent verified repairs
- Quality pinned to Ubuntu 22.04.
- Several specialist workflows made manual-only to reduce duplicate automatic execution.
- Cross-surface traceability guard added.
- Dashboard query truth/tenant scope hardened.
- Whole-repository structural inventory generator added.
- Document Intelligence pipeline/lineage/closure layers added and tested.
- Authentication session persistence enabled.
- Silent demo-company tenant fallback removed.
- Canonical frontend authentication helpers added.
- Authentication/tenant convergence added to canonical Quality.

## Current blockers
1. GitHub Actions attempts previously failed before executable steps (`steps:null` / `steps:[]`, unavailable logs). This is not currently attributed to application code.
2. Frontend authentication UI/route boundary is not yet proven.
3. Live production evidence is not yet available for the release certification chain.

## Next execution order
**NOW-1:** finish P0 authentication/session/tenant UI convergence.

**NOW-2:** complete package-script → script → workflow mapping.

**NOW-3:** complete migration/schema/RLS/index dependency mapping.

**NOW-4:** trace critical UI flows end-to-end.

**NOW-5:** connected J/K/L/M runtime evidence.

**NOW-6:** E/F/H/I live security/resilience evidence.

**NOW-7:** CI runner recovery and executable evidence.

**NOW-8:** production certification only after current evidence closes all P0 blockers.

## Batch 5 evidence
`docs/EXECUTION_LEDGER_2026-08-25_BATCH-5.md`

Commits:
- `d8e27f3f0df85eb67978d664059e07b8677a5d4b`
- `7a7adb15e1e76232566a273b29f59706d7884e06`
- `e0e323f0514a4edd7151ceeeda80ef11e8b51d67`
- `65d77e3e44d52d2168de5e3340c4a65cbdf3a0c3`
- `4bce6d60de99ae25df541f653f370d10c0fe369b`
- `012d2cd0cd6abb8e0a6cff9ba326b307bd11737b`

## Non-negotiable rule
No capability is marked production-complete merely because code or static contracts exist. Runtime evidence and the existing certification chain remain mandatory.
