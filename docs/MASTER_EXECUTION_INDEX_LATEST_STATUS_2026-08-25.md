# Master Execution Index — Latest Status — 2026-08-25

This is the latest compact execution snapshot. It complements `docs/MASTER_EXECUTION_INDEX.md`, `docs/MASTER_SYSTEM_INVENTORY_2026-08-25.md`, the append-only current deltas, and the execution ledgers. It is the first place to consult before starting new work.

## Continuity rule
Never infer completion from conversation history. Repository source, executable CI/runtime evidence, and certification artifacts are authoritative. Status vocabulary: `UNKNOWN → INVENTORIED → IMPLEMENTED → GATED → INTEGRATED → RUNTIME-EVIDENCED → PRODUCTION-CERTIFIED`; use `BLOCKED` for external prerequisites.

## Current repository head
`main` = `e68ced5664a0b19a0f533c59972be9eae7c72c9d` — `Record Batch 12 master execution delta`.

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
- Company configuration truth guard exists to reject prohibited hard-coded company identity/configuration, including `admin@alamri.com`.
- Tenant legacy consumer boundary guard exists and prevents new `COMPANY_ID`/`activeCompanyId` usage outside documented compatibility boundaries.
- These guards are implementation/regression evidence, not runtime certification.

### Permanent project reference
- `docs/PROJECT_DESCRIPTION.md` is the official Arabic/English project description and explicitly distinguishes implementation from runtime evidence and production certification.
- Batch deltas and execution ledgers are stored in-repository to prevent context loss and repeated work.

## Known legacy area — do not misclassify
`src/pages/EntityPages.tsx` / Data Quality still contains legacy `COMPANY_ID` filters for customers, products, invoices, and inventory. The compatibility boundary is canonically hydrated by AuthGate, but this is NOT the same as a fully RLS-native frontend refactor. Keep status `PARTIAL/REVIEW` until complete source-context-safe refactor and evidence exist.

`src/lib/supabase.ts` retains a documented nullable compatibility surface for `activeCompanyId`; this is not a demo-company fallback. Do not remove it blindly until all consumers are migrated.

## P0 blockers
### 1. Authenticated tenant isolation proof
Prove two-company isolation and ambiguous-membership fail-closed behavior end-to-end with executable evidence.

### 2. CI executable evidence
Current Quality run on the repository head:
- run `32796975746` — completed / failure
- job `verify` `97650175937` — completed / failure
- `steps: null`, `logs_url: null`
- direct rerun of job `97650175937` was requested and accepted by GitHub; its resulting run must be inspected before any conclusion.

The absence of executable steps means this is currently classified as runner/bootstrap/pre-step failure, not an application assertion failure.

## P1 parallel fronts
1. Obtain complete Data Quality source context, then replace only the four legacy filters with RLS-native reads; never wholesale-replace a partially retrieved file.
2. Enumerate all migrations and build table/function/index/policy/trigger dependency and order map.
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
- Batch 13 delta: `docs/MASTER_EXECUTION_INDEX_CURRENT_DELTA_2026-08-25_BATCH-13.md`

## Batch 13 verified evidence
- Repository head verified at `e68ced5664a0b19a0f533c59972be9eae7c72c9d`.
- Quality run `32796975746` and job `97650175937` inspected.
- Job had no executable steps and no logs URL.
- Direct rerun was requested successfully; no pass is claimed until the rerun is inspected.
- Master index was synchronized with Batch 9–13 work so this snapshot is no longer stale relative to the latest ledger/delta chain.

## Non-negotiable evidence rule
A gate existing is implementation evidence only. `Implemented`, `Gated`, and `Integrated` must never be reported as `Runtime-Evidenced` or `Production-Certified` without current executable evidence. Production certification is blocked until all P0 evidence gaps are closed.
