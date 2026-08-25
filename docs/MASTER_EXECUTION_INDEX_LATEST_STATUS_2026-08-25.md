# Master Execution Index — Latest Status — 2026-08-25

This is the authoritative compact execution snapshot. Consult it before starting new work. Repository source, executable CI/runtime evidence, and certification artifacts are authoritative; conversation history is not evidence.

## Indexed source head
`main` source state indexed here: `caf2c0abfde243f894fcddae6b37283c0bd63adb`. This is the latest proactive execution head before this index synchronization commit.

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
| Data Quality tenant-native boundary | YES | YES | INTEGRATED | NOT PROVEN | NO |
| Data Quality bounded projections | YES | YES | INTEGRATED | NOT PROVEN | NO |
| Legacy application tenant consumer boundary | HARDENED | YES | PENDING NEW CI | NOT PROVEN | NO |
| KPI/decision missing-data fail-closed | HARDENED | YES | PENDING NEW CI | NOT PROVEN | NO |
| Batch decision invalid-input guard | HARDENED | YES | PENDING NEW CI | NOT PROVEN | NO |
| Atomic import chunks | IMPLEMENTED | YES | PENDING NEW CI | NOT PROVEN | NO |
| Failed import terminal-state persistence | IMPLEMENTED | YES | PENDING NEW CI | NOT PROVEN | NO |
| CI runner execution | IMPLEMENTED | YES | NEW RUN QUEUED | NOT PROVEN | NO |

## Tenant model — corrected canonical semantics
- The effective tenant resolver derives context from `auth.uid()` + active/default company membership.
- No client-supplied `company_id` is accepted as the source of tenant truth.
- The browser never chooses a tenant by membership-array order.
- A preferred client tenant is accepted only when it exactly equals the authoritative database-resolved tenant; otherwise the UI context fails closed.
- Legacy mutable tenant state and compatibility accessors are rejected by the executable tenant-consumer guard.
- Live database behavior is still NOT PROVEN.

## Tenant/Data Quality source work
- Data Quality no longer consumes `COMPANY_ID` from the UI.
- Data Quality uses `fetchDataQualityDatasets()`.
- Data Quality projections are bounded to fields consumed by current metrics rather than `select(*)`.
- A regression contract protects the projection boundary and is integrated into canonical Quality.
- The tenant security contract inspects the effective latest `current_company_id()` definition.
- A dedicated tenant-resolver lineage guard is present.
- The tenant legacy guard now strips source comments before applying consumer patterns, preventing comments such as “client-selected tenant” from becoming false positives while preserving executable-code detection.

## Import / runtime closure work
- Canonical Import resolves authoritative tenant context and fails closed when tenant context is unavailable.
- Imported foreign customer IDs are validated by the canonical tenant-scoped invoice RPC; client-side resolution is no longer treated as authoritative.
- Existing entity RPCs remain the canonical write primitives.
- New `import_commit_batch` is only an atomic transaction wrapper around those existing RPCs; it is not a parallel import engine. Any row failure rolls back the entire governed chunk.
- Canonical import validates the entire chunk before writing, calls the atomic wrapper, and verifies committed count/IDs before reporting success.
- Folder import uses bounded 500-row atomic chunks.
- A failed folder import now persists `failed` terminal state with error evidence and preserves the number of chunks already committed instead of leaving `processing` jobs stuck or reporting zero committed rows.
- Durable report execution enforces tenant + lease ownership for claim, heartbeat, checkpoint, completion and failure.
- Durable failure recovery persists failure, re-queues while `attempt < max_attempts`, and leaves exhausted jobs in `dead_letter`.
- Live Supabase execution remains NOT PROVEN.

## Decision/KPI truth hardening
- Executive metrics no longer trust a caller-provided company ID as authoritative; the database resolver is checked and mismatches fail closed.
- Report KPI logic does not fabricate unavailable customer activity state.
- Aging logic does not silently substitute invoice date for missing due date.
- Evidence-bound decision creation preserves `evidenceIds` through prioritization and pipeline execution instead of manufacturing evidence-free decisions.
- Batch decision evaluation now rejects non-finite/out-of-range required inputs with structured `INSUFFICIENT_DECISION_DATA:<group>:<field>` errors instead of converting missing/invalid business inputs to zero.
- The existing 50k batch regression fixture now executes the real TypeScript engine and also verifies invalid-input fail-closed behavior.

## Current CI evidence
- Quality run `32877367595` failed at `Tenant legacy consumer boundary`; root cause was a false-positive detector matching tenant terminology inside executable comments. The guard was corrected to strip comments before scanning.
- Quality run `32877700940` failed on the pre-fix tenant guard; its downstream gates were skipped. The fix is now in `6cea75aa...`.
- Quality run `32877718357` also failed on the pre-fix tenant guard. No PASS is claimed for those historical pre-fix runs.
- Quality run `32877906900` is currently QUEUED for the atomic import transaction-contract changes. A current green run is still required.
- Earlier runs passed tenant/data/company/migration/core/production/resilience/trust/governance/watched-report surfaces before later control-plane/runtime gates; those are historical evidence only.

## P0 blockers
1. **Live tenant isolation:** prove two-company read/write isolation, no-membership fail-closed, inactive membership, default-company selection, and cross-tenant Import RPC rejection against a real database.
2. **Storage/signed URLs:** execute real cross-tenant denial and own-object access checks.
3. **Realtime authorization:** execute live channel authorization/isolation checks.
4. **AI retrieval isolation:** execute live namespace/cross-tenant sentinel checks.
5. **Backup/restore:** perform real restore drill with RPO/RTO, row-count and integrity evidence.
6. **Worker recovery:** execute stuck-worker/dead-letter recovery with failure injection.
7. **Release boundary:** staging migration dry-run, environment parity, signed artifact verification, rollback/forward-fix and stabilization telemetry.
8. **Current CI closure:** obtain a current green Quality run after the latest code changes.

## P1 parallel fronts
1. Execute tenant security, Data Quality projection, migration schema/dependency, typecheck, lint and build against the current source head.
2. Obtain live migration-drift evidence.
3. Execute existing J/K/L/M runtime workflows and preserve artifacts.
4. Execute existing E/F/H/I security/resilience workflows and preserve artifacts.
5. Prove Data Quality metric parity after bounded projections before introducing aggregates/RPC computation.
6. Trace upload/import → review → persistence → reports → decisions → inventory/demand → evidence → certification.
7. Close KPI truth across Definition → Source → Formula → Query → Service → Dashboard → Report → Export; missing data must remain unknown/blocked rather than become business zero.
8. Execute existing Forecast backtesting/calibration and Outcome feedback using existing intelligence engines.
9. Prove worker Claim → Lease → Heartbeat → Checkpoint → Complete/Fail → Retry → Recovery → Dead-letter with concurrency/failure injection.
10. Run adversarial tenant/RLS/RPC, Storage/Realtime/AI isolation, upload security, resource exhaustion and backup/restore checks where the environment permits.
11. Complete document-engine internal closure: intermediate representation, page/table classification, headerless/reverse schema discovery, extraction provenance/cell lineage, reconciliation and quarantine/reprocessing UX.
12. Connect K/L live coordinator, business snapshots, evidence graph, optimizer, outcome feedback and executive UI action loop.

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
- Batch 27: Canonical Import legacy tenant consumer removed; durable report retry/recovery path added and protected by the existing runner contract guard.
- Batch 28: executive KPI caller tenant authority hardened; evidence IDs preserved through decision pipelines; tenant guard made comment-safe.
- Batch 29: batch decision engine changed from silent numeric coercion to fail-closed validation; 50k regression now exercises the real engine and invalid-input cases.
- Batch 30: canonical import chunks made atomic through existing RPC primitives; failed import jobs now finalize with durable error state and preserved progress; transaction contract updated.

## Verified commits of interest
- `43a9557bb32c2a17cb590fc9b02eb901f9d97a3c` — Canonical Import legacy tenant consumer removal.
- `3d14c3cf6b39f532bed2777ef2bb0f9dc89bcc1e` — durable retry/recovery RPC migration.
- `33fa4662afc28813b992e66532265facc9766195` — durable store retry adapter.
- `cdc168536ff910d6162da9d02b6ca021b33dfbab` — durable runner automatic retry wiring.
- `50f272ccbb072f3fa6a5a72659bd37d7a7d54395` — durable runner recovery contract guard.
- `0ae47b6c9cd4af2bfcc901e6dfc74bd3c0fd67bd` — executive metrics caller tenant-authority hardening.
- `eabd7895132deb920749831c45bdaada38716710` — evidence IDs propagated through decision prioritization.
- `e991f915169a70d2482ae6d7f73e205c13766cf0` — report pipeline evidence-bound decisions.
- `b1ce1e9b89f6d6b5ea6fc4c883e550dc3c6d9182` — executive pipeline evidence-bound decisions.
- `6cea75aa88d0d8de9f0afc3ba2518dff50de3b9b` — comment-safe tenant legacy guard.
- `7d1da2839a3e143c342cc33af9bd49da30485c9c` — batch decision fail-closed validation.
- `1bc85a89d9ddb93d30e3549ea6fdce717dc491f9` — batch decision regression coverage.
- `da562467587f620656372454500c79008a5fd2bd` — Quality execution script compatibility for real TypeScript regression.
- `03a0703f4074c213e3193c7cdcbd395420901a97` — atomic import batch wrapper around canonical RPCs.
- `813ae0ef99396f99ef195f5eaf93d7ca2c55f408` — canonical import uses atomic wrapper and verifies results.
- `17d7633b3cb5780107f16943758360955d7700f2` — failed import terminal-state and progress preservation.
- `caf2c0abfde243f894fcddae6b37283c0bd63adb` — atomic import transaction regression contract.

## Non-negotiable rule
A gate existing is implementation evidence only. `Implemented`, `Gated`, and `Integrated` must never be reported as `Runtime-Evidenced` or `Production-Certified` without current executable evidence. Production certification remains blocked until the P0 evidence gaps are closed.
