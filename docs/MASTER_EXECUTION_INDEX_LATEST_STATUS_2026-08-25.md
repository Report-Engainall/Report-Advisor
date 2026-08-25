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
| Frontend auth session persistence | YES | YES | YES | NOT PROVEN | NO |
| Frontend authenticated route boundary | YES | YES | YES | NOT PROVEN | NO |
| Arabic login flow | YES | YES | YES | NOT PROVEN | NO |
| Frontend authenticated identity | YES | YES | YES | NOT PROVEN | NO |
| Dashboard tenant convergence | YES | YES | YES via canonical RLS | NOT PROVEN | NO |
| Header health truthfulness | YES | YES | YES | NOT PROVEN | NO |
| Legacy static tenant consumers | PARTIAL | YES | MIGRATION IN PROGRESS | NO | NO |
| CI runner execution | UNKNOWN/BLOCKED | N/A | N/A | PRE-STEP FAILURES ONLY | NO |

## Completed in current execution wave
1. Removed legacy `COMPANY_ID` dependency from canonical dashboard query functions; tenant filtering is now delegated to authenticated RLS/current_company_id instead of a frontend static context.
2. Made the Header health indicator perform a real authenticated Supabase round-trip through `current_company_id()` and report checking/healthy/degraded/offline states.
3. Kept the authentication boundary, dynamic identity, login, and sign-out from Batch 6 intact.

## P0/P1 backlog
### P0 — Authentication/Tenant convergence
1. ~~Trace `App.tsx` route/session boundary.~~ DONE
2. ~~Identify/login/session entry point.~~ DONE
3. ~~Replace hard-coded Sidebar identity.~~ DONE
4. ~~Add explicit unauthenticated state.~~ DONE
5. ~~Remove static tenant dependency from canonical dashboard queries.~~ DONE — current wave
6. Audit remaining legacy `COMPANY_ID` consumers, including Data Quality and any non-canonical pages/services.
7. Prove authenticated tenant isolation end-to-end.
8. Add owner-editable profile/display-name settings.

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

## Current blockers
1. GitHub Actions attempts previously failed before executable steps (`steps:null` / `steps:[]`, unavailable logs). This is not currently attributed to application code.
2. Runtime authentication/tenant isolation evidence is not yet available.
3. Live production evidence is not yet available for the release certification chain.
4. Legacy tenant consumers remain outside the canonical query closure and require source-wide remediation.

## Next execution order
**NOW-1:** complete source-wide tenant consumer convergence and authenticated tenant proof.

**NOW-2:** complete owner-editable profile/display-name settings.

**NOW-3:** harden health semantics with explicit tenant/session states and tests.

**NOW-4:** complete package-script → script → workflow mapping.

**NOW-5:** complete migration/schema/RLS/index dependency mapping.

**NOW-6:** trace critical UI flows end-to-end.

**NOW-7:** connected J/K/L/M runtime evidence.

**NOW-8:** E/F/H/I live security/resilience evidence.

**NOW-9:** CI runner recovery and executable evidence.

**NOW-10:** production certification only after current evidence closes all P0 blockers.

## Current wave commits
- `cc8550b273da48dc1914aa5380c488882676f0cb` — canonical dashboard queries use RLS tenant scope
- `5393c87616b57d9697d9b16c290e37faee15a201` — truthful Header health state

## Batch evidence
- Batch 5: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-5.md`
- Batch 6: `docs/EXECUTION_LEDGER_2026-08-25_BATCH-6.md`
- Current wave: pending ledger commit

## Non-negotiable rule
No capability is marked production-complete merely because code or static contracts exist. Runtime evidence and the existing certification chain remain mandatory.
