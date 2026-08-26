# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + active execution PRs. Wave 03 branch is the active deep-closure branch.

## Mandatory truth rules
- PASS is bound to an exact commit and exact CI run/job evidence.
- A prior PASS is never transferred to a newer HEAD.
- FOUNDATION, DEEP CLOSURE, TESTED, GATED, INTEGRATED, RUNTIME VERIFIED, LIVE VERIFIED and PRODUCTION CERTIFIED are separate states.
- Missing/unknown data never becomes measured zero.
- No fake runtime/live evidence and no cryptographic fallback.
- Independent fronts run in parallel; destructive consolidation requires consumer/dependency/rollback analysis.

## Exact HEAD / CI truth
- Wave 03 started from Wave 02 HEAD: `ee6344703cea048b9ef7680d166f1208d48e85fc`.
- Wave 03 PR: `#23` (`execution-wave-03-deep-closure` → `main`).
- Current Wave 03 HEAD: `ee1af078017d288b6fe781775aa5336b3a5fba13`.
- Base `main`: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Exact-head workflow lookup for `ee1af078017d288b6fe781775aa5336b3a5fba13`: **no workflow run observable yet**.
- Therefore Wave 03 CI = **PENDING**, never PASS.
- Verified historical baseline remains Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS. It is not evidence for Wave 03.

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | TESTED | GATED | INTEGRATED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | LAST VERIFIED COMMIT | LAST VERIFIED CI | LAST VERIFIED TEST | REMAINING | DEPENDENCY | PARALLEL WORK | RISK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | YES | STATIC INDIRECT SCAN | YES | YES | YES | PARTIAL | NO | NO | ee1af078 | PENDING | wave03 deep closure | Supabase A/B indirect runtime drill | live Supabase | yes | CRITICAL |
| BI/data truth | YES | CONSUMER AUDIT | YES | YES | YES | LOCAL | NO | NO | ee1af078 | PENDING | existing BI + cross-surface gates | verify all production consumers and as-of/filter provenance | none | yes | HIGH |
| Cross-surface truth | YES | CONSUMER INVENTORY + FORMULA GUARD | YES | YES | YES | LOCAL/PARTIAL | NO | NO | ee1af078 | PENDING | wave03 deep closure | replace any real consumer-local formula found by gate | none | yes | HIGH |
| Import/reconciliation | YES | ADVERSARIAL MATRIX | YES | YES | YES | DETERMINISTIC | NO | NO | ee1af078 | PENDING | wave03 import | deployed worker concurrency/retry/rollback drill | live worker | yes | CRITICAL |
| Runtime/workers | YES | DISTRIBUTED FAILURE SIMULATION | YES | YES | YES | SIMULATED | NO | NO | ee1af078 | PENDING | wave03 runtime | real deployed crash/restart/DLQ/resume | deployed worker | yes | CRITICAL |
| Document intelligence | YES | FULL 8-CASE MEASURED EXECUTION | YES | YES | YES | LOCAL SEMANTIC | NO | NO | ee1af078 | PENDING | wave03 document | real OCR/PDF/XLSX/CSV/corrupt/ambiguous corpus | real corpus | yes | HIGH |
| Decision/evidence/outcome | YES | ACTION/FEEDBACK GRAPH VALIDATOR | YES | YES | YES | PARTIAL | NO | NO | ee1af078 | PENDING | wave03 decision | wire/verify production action→outcome→feedback consumers | runtime outcome | yes | CRITICAL |
| Observability | YES | TRACE PROPAGATION + PII REDACTION | YES | YES | YES | LOCAL | NO | NO | ee1af078 | PENDING | wave03 observability | production telemetry chain | telemetry environment | yes | HIGH |
| Backup/restore | YES | ORDERING + RPO/RTO HARNESS | YES | YES | YES | LOCAL ARTIFACT | NO | NO | ee1af078 | PENDING | wave03 backup | real restore/RPO/RTO/rollback | live DB/backup | yes | CRITICAL |
| Watched folder | YES | REPLAY/RECOVERY + CAPABILITY MATRIX | YES | YES | YES | LOCAL IDENTITY | NO | NO | ee1af078 | PENDING | wave03 watcher | persistent native Windows/Android proof; iOS boundary | native adapters/devices | yes | HIGH |
| Performance | YES | DEEP STATIC AUDIT GATE STARTED | PARTIAL | YES | YES | LOCAL | NO | NO | ee1af078 | PENDING | perf budget + wave03 scan | bottleneck-specific benchmark/fix/after proof | production-scale data | yes | MEDIUM |
| UI/E2E | YES | STATIC CONSUMER PATH GUARD | PARTIAL | YES | PARTIAL | STATIC | NO | NO | ee1af078 | PENDING | route/service gates | authenticated browser proof | auth runtime | yes | HIGH |
| CI topology | YES | WAVE03 GATES CONSOLIDATED IN QUALITY | YES | YES | YES | CI PENDING | NO | NO | ee1af078 | PENDING | workflow integrity | duplicate-gate KEEP/MERGE/DEPRECATE matrix after evidence | GitHub Actions | yes | MEDIUM |
| Production hygiene | YES | STATIC CLASSIFICATION GATE | TEST PENDING | YES | YES | NO | NO | NO | ee1af078 | PENDING | wave03 deep closure | fix any newly surfaced production-risk findings | code scan | yes | MEDIUM |

## Wave 03 implementation
1. `scripts/check-wave03-deep-closure.mjs`: scans source/service/migration code for indirect client tenant authority, silent error/type-risk markers, consumer-local KPI formulas, and produces a measured scan artifact.
2. `scripts/execution-wave-03-distributed-runtime.test.mjs`: Worker A/B lease race, stale lease recovery, heartbeat/checkpoint preservation, tenant mismatch, duplicate completion, retry exhaustion and DLQ.
3. `scripts/execution-wave-03-import-deep.test.mjs`: same-file replay, checkpoint crash/resume, business-key conflict atomicity, cancellation, terminal immutability and tenant-bound replay.
4. `scripts/document-intelligence-deep-execution.test.ts`: executes all 8 Golden Corpus cases through schema profiling, normalization, evidence and confidence checks and emits measured coverage metrics. It explicitly makes no production OCR accuracy claim.
5. `src/lib/decision-feedback-graph.ts` + regression: canonical SOURCE→EVIDENCE→METRIC→ANALYSIS→RECOMMENDATION→DECISION→ACTION→OUTCOME→FEEDBACK invariant and missing-impact truth.
6. `src/lib/observability/trace-context.ts` + regression: complete trace identity, tenant-preserving child traces and PII metadata redaction.
7. `scripts/execution-wave-03-backup-readiness.test.mjs`: restore dependency ordering, manifest verification, tamper detection, local RTO measurement and explicit RPO model.
8. `scripts/execution-wave-03-watched-folder.test.mjs`: rename/content identity, changed content, duplicate event collapse, replay and platform capability truth.
9. All Wave 03 gates are wired into the existing canonical `.github/workflows/quality.yml`; no new standalone quality workflow was introduced.

## Document Intelligence measured truth
- Corpus size: 8 repository Golden cases.
- Wave 03 test measures schema coverage, normalization accuracy, evidence coverage, confidence violations and mean confidence.
- CI result is pending, so no numeric result is certified yet.
- Production-grade real-file accuracy remains LIVE/REAL CORPUS REQUIRED.

## Cross-surface truth
- Canonical KPI function from Wave 02 remains the source for deterministic equivalence.
- Wave 03 adds consumer inventory and blocks obvious consumer-local `grossProfit`/`grossMargin`/`totalSales` formulas in page consumers.
- A clean gate means no obvious duplicate formula pattern was found; it does not by itself certify runtime provenance.

## Security truth
- Canonical tenant authority remains database-derived `resolveCurrentCompanyId()`.
- Wave 03 adds static detection for browser storage/build-time tenant authority and keeps existing tenant/RLS/import guards.
- Static/application defense is separate from LIVE A/B isolation.
- LIVE proof remains required for Storage object paths, signed URLs, Realtime channels, AI/vector namespaces, exports/downloads, notification recipients, worker payloads, queue messages, cached/background objects and IDOR behavior.

## Import / Runtime truth
- Foundation harnesses are not rebuilt; Wave 03 adds distributed race/recovery and adversarial replay matrices.
- No expected result was weakened.
- Live worker behavior is not claimed.

## Decision / Outcome truth
- Missing evidence/snapshot/tenant/source remains fail-closed.
- `expectedImpact`/`actualImpact` remain nullable; unknown is not zero.
- Wave 03 adds an explicit graph validator requiring tenant, source, evidence, metric, analysis, recommendation, decision, action and evidence snapshot, with outcome/feedback required when certifying the full loop.
- Runtime production action/outcome/feedback telemetry remains outstanding.

## Observability truth
- Required IDs: `user_action_id`, `request_id`, `job_id`, `import_id`, `evidence_id`, `report_id`, `decision_id`, `outcome_id`, `tenant_id`.
- Child traces preserve tenant context.
- PII-like trace metadata keys are redacted.
- Production telemetry is not claimed.

## Backup truth
- Restore ordering is represented as dependency-ordered migrations.
- Manifest payload digest + checksum are verified and tampering is rejected.
- Local harness timing is not production RTO.
- Real restore, rollback and measured RPO/RTO remain LIVE.

## Watched-folder truth
| Platform | State | Evidence boundary |
|---|---|---|
| Browser/PWA | SESSION_BOUND | contract/local only |
| Node | SUPPORTED | local SHA/event semantics |
| Windows | NATIVE_ADAPTER_REQUIRED | no persistent live proof yet |
| Android | NATIVE_ADAPTER_REQUIRED | no persistent live proof yet |
| iOS | CAPABILITY BOUNDARY | no arbitrary persistent folder watcher claimed |

## Performance truth
No arbitrary optimization is certified by this wave. The deep gate is designed to surface direct page queries, local business formulas, unbounded access patterns and production-risk patterns before a benchmark/fix/after claim is made. Existing performance budget PASS remains historical evidence only.

## CI topology
Canonical quality remains `.github/workflows/quality.yml`. Wave 03 gates were appended to that workflow instead of creating parallel duplicates. Exact-head CI remains pending for `ee1af078...`.

## LIVE REQUIRED — only evidence that genuinely needs environment
1. Supabase A/B tenant isolation across DB/Storage/Realtime/AI-vector/import/report/decision/export/download/worker/notification.
2. Deployed worker crash/restart/stale lease/DLQ/resume drill.
3. Real backup restore + migration replay + rollback + RPO/RTO.
4. Windows/Android persistent watcher proof and iOS capability proof.
5. Authenticated browser E2E against real tenant data.
6. Real PDF/OCR/XLSX/CSV/corrupt/ambiguous corpus accuracy.
7. Production telemetry trace with tenant context and PII redaction.
8. Production-scale load/canary and rollback.

## Remaining Work Inventory
### NOW
- Obtain exact-head CI for `ee1af078017d288b6fe781775aa5336b3a5fba13`.
- If CI fails, fix the complete failure family and re-run on the new exact HEAD.
- Review any concrete findings produced by the Wave 03 deep scan.
- Continue real consumer inventory for export/report/decision implementations.

### PARALLEL
- Deep indirect tenant runtime preparation.
- Import/worker failure-family expansion.
- Document corpus expansion.
- Decision action/outcome consumer verification.
- Observability runtime propagation.
- Backup live-drill preparation.
- Watcher native adapter preparation.
- Performance benchmark/fix/after.
- Authenticated UI flow inventory.

### DEPENDENCY
- Live Supabase environment.
- Deployed worker.
- Real database/backup.
- Native adapters/devices.
- Authenticated browser tenant.
- Real corpus.
- Production telemetry/load environment.

### DO NOT TOUCH
- Closed BI NaN/Infinity, trend chronology, outcome identity, missing-impact truth and SHA-256 fallback unless regression/new bypass/new evidence appears.
- Destructive migration or architecture consolidation without consumer/dependency/rollback proof.

## Completion truth
Wave 03 is **DEEP-CLOSURE IMPLEMENTED / CI PENDING / LIVE UNVERIFIED / NOT PRODUCTION CERTIFIED**. CI Green will never be treated as production certification by itself.
