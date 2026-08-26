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
- Current Wave 03 HEAD: `d8a9b2d3e7f4c1b6a5e9f3d2c7b8a1e4f6d9c2b5`.
- Base `main`: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Exact-head workflow lookup for the current Wave 03 HEAD: **PENDING / no completed run observable yet**.
- Therefore Wave 03 CI = **PENDING**, never PASS.
- Verified historical baseline remains Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS. It is not evidence for Wave 03.

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | TESTED | GATED | INTEGRATED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | LAST VERIFIED COMMIT | LAST VERIFIED CI | LAST VERIFIED TEST | REMAINING | DEPENDENCY | PARALLEL WORK | RISK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | YES | STATIC INDIRECT SCAN | YES | YES | YES | PARTIAL | NO | NO | Wave03 HEAD | PENDING | wave03 deep closure | Supabase A/B indirect runtime drill | live Supabase | yes | CRITICAL |
| BI/data truth | YES | CONSUMER AUDIT | YES | YES | YES | LOCAL | NO | NO | Wave03 HEAD | PENDING | existing BI + cross-surface gates | verify production as-of/filter provenance | none | yes | HIGH |
| Cross-surface truth | YES | CONSUMER INVENTORY + FORMULA GUARD | YES | YES | YES | LOCAL/PARTIAL | NO | NO | Wave03 HEAD | PENDING | wave03 deep closure | replace any real consumer-local formula found by gate | none | yes | HIGH |
| Import/reconciliation | YES | ADVERSARIAL MATRIX | YES | YES | YES | DETERMINISTIC | NO | NO | Wave03 HEAD | PENDING | wave03 import | deployed worker concurrency/retry/rollback drill | live worker | yes | CRITICAL |
| Runtime/workers | YES | DISTRIBUTED FAILURE SIMULATION | YES | YES | YES | SIMULATED | NO | NO | Wave03 HEAD | PENDING | wave03 runtime | real deployed crash/restart/DLQ/resume | deployed worker | yes | CRITICAL |
| Document intelligence | YES | FULL 8-CASE MEASURED EXECUTION | YES | YES | YES | LOCAL SEMANTIC | NO | NO | Wave03 HEAD | PENDING | wave03 document | real OCR/PDF/XLSX/CSV/corrupt/ambiguous corpus | real corpus | yes | HIGH |
| Decision/evidence/outcome | YES | ACTION/FEEDBACK GRAPH VALIDATOR | YES | YES | YES | PARTIAL | NO | NO | Wave03 HEAD | PENDING | wave03 decision | wire/verify production action→outcome→feedback consumers | runtime outcome | yes | CRITICAL |
| Observability | YES | TRACE PROPAGATION + PII REDACTION | YES | YES | YES | LOCAL | NO | NO | Wave03 HEAD | PENDING | wave03 observability | production telemetry chain | telemetry environment | yes | HIGH |
| Backup/restore | YES | ORDERING + RPO/RTO HARNESS | YES | YES | YES | LOCAL ARTIFACT | NO | NO | Wave03 HEAD | PENDING | wave03 backup | real restore/RPO/RTO/rollback | live DB/backup | yes | CRITICAL |
| Watched folder | YES | REPLAY/RECOVERY + CAPABILITY MATRIX | YES | YES | YES | LOCAL IDENTITY | NO | NO | Wave03 HEAD | PENDING | wave03 watcher | persistent native Windows/Android proof; iOS boundary | native adapters/devices | yes | HIGH |
| Performance | YES | DEEP STATIC AUDIT | PARTIAL | YES | YES | LOCAL | NO | NO | Wave03 HEAD | PENDING | wave03 performance | bottleneck-specific benchmark/fix/after proof | production-scale data | yes | MEDIUM |
| UI/E2E | YES | STATIC CONSUMER PATH GUARD | PARTIAL | YES | PARTIAL | STATIC | NO | NO | Wave03 HEAD | PENDING | route/service gates | authenticated browser proof | auth runtime | yes | HIGH |
| CI topology | YES | WAVE03 GATES CONSOLIDATED IN QUALITY | YES | YES | YES | CI PENDING | NO | NO | Wave03 HEAD | PENDING | workflow integrity | duplicate-gate KEEP/MERGE/DEPRECATE matrix after evidence | GitHub Actions | yes | MEDIUM |
| Production hygiene | YES | STATIC CLASSIFICATION GATE | TEST PENDING | YES | YES | NO | NO | NO | Wave03 HEAD | PENDING | wave03 deep closure | fix newly surfaced production-risk findings | code scan | yes | MEDIUM |

## Wave 03 implementation
1. `scripts/check-wave03-deep-closure.mjs`: indirect tenant authority, consumer-local KPI formula and production-hygiene scan.
2. `scripts/check-wave03-performance.mjs`: direct page-to-DB guard plus query/collection hotspot discovery; benchmark/fix/after remains required for optimization claims.
3. `scripts/execution-wave-03-distributed-runtime.test.mjs`: Worker A/B lease race, stale lease recovery, checkpoint preservation, tenant mismatch, duplicate completion, retry exhaustion and DLQ.
4. `scripts/execution-wave-03-import-deep.test.mjs`: same-file replay, checkpoint crash/resume, business-key conflict atomicity, cancellation, terminal immutability and tenant-bound replay.
5. `scripts/document-intelligence-deep-execution.test.ts`: all 8 Golden Corpus cases through schema profiling, normalization, evidence and confidence checks with measured metrics; no production OCR claim.
6. `src/lib/decision-feedback-graph.ts` + regression: canonical SOURCE→EVIDENCE→METRIC→ANALYSIS→RECOMMENDATION→DECISION→ACTION→OUTCOME→FEEDBACK invariant.
7. `src/lib/observability/trace-context.ts` + regression: complete trace identity, tenant-preserving child traces and PII metadata redaction.
8. `scripts/execution-wave-03-backup-readiness.test.mjs`: restore dependency ordering, manifest verification, tamper detection, local timing and RPO model.
9. `scripts/execution-wave-03-watched-folder.test.mjs`: rename/content identity, changed content, duplicate event collapse, replay and platform capability truth.
10. All Wave 03 gates are wired into the existing canonical `.github/workflows/quality.yml`; no standalone duplicate quality workflow was created.

## Document Intelligence measured truth
- Corpus size: 8 repository Golden cases.
- Metrics emitted by the test: schema coverage, normalization accuracy, evidence coverage, confidence violations and mean confidence.
- Exact CI result is pending, so no numeric CI result is certified yet.
- Production-grade real-file accuracy remains REAL CORPUS/LIVE REQUIRED.

## Cross-surface truth
- Canonical KPI function from Wave 02 remains the source for deterministic equivalence.
- Wave 03 adds consumer inventory and blocks obvious page-local `grossProfit`/`grossMargin`/`totalSales` formulas.
- Clean static scan is not runtime provenance certification.

## Security truth
- Canonical tenant authority remains database-derived `resolveCurrentCompanyId()`.
- Wave 03 statically rejects browser storage/build-time tenant authority if found in production code.
- Static/application defense is separate from LIVE A/B isolation.
- LIVE proof remains required for Storage object paths, signed URLs, Realtime channels, AI/vector namespaces, exports/downloads, notification recipients, worker payloads, queue messages, cached/background objects and IDOR behavior.

## Import / Runtime truth
- Foundation harnesses were not rebuilt; Wave 03 adds distributed race/recovery and adversarial replay matrices.
- No expected result was weakened.
- Live worker behavior is not claimed.

## Decision / Outcome truth
- Missing evidence/snapshot/tenant/source remains fail-closed.
- Expected/actual impact remain nullable; unknown is not zero.
- Wave 03 graph validation requires tenant, source, evidence, metric, analysis, recommendation, decision, action and evidence snapshot, with outcome/feedback required for full-loop certification.
- Production action/outcome/feedback telemetry remains outstanding.

## Observability truth
- Required IDs: `user_action_id`, `request_id`, `job_id`, `import_id`, `evidence_id`, `report_id`, `decision_id`, `outcome_id`, `tenant_id`.
- Child traces preserve tenant context.
- PII-like trace metadata keys are redacted.
- Production telemetry is not claimed.

## Backup truth
- Restore ordering is dependency-ordered.
- Manifest payload digest + checksum are verified and tampering is rejected.
- Local timing is not production RTO.
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
Wave 03 adds a static hotspot gate. It deliberately does not call a hotspot a bottleneck without before/fix/after evidence. Existing performance budget PASS is historical evidence only.

## CI topology
Canonical quality remains `.github/workflows/quality.yml`. Wave 03 gates were integrated there instead of creating a parallel quality workflow. Exact-head CI remains pending.

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
- Obtain exact-head CI for the latest Wave 03 HEAD.
- If CI fails, fix the complete failure family and rerun on the new exact HEAD.
- Review concrete findings from the Wave 03 deep scans.
- Continue real consumer inventory for export/report/decision implementations.

### PARALLEL
- Indirect tenant runtime preparation.
- Import/worker failure-family expansion.
- Document corpus expansion.
- Decision action/outcome consumer verification.
- Observability runtime propagation.
- Backup live-drill preparation.
- Native watcher preparation.
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
Wave 03 = **DEEP-CLOSURE IMPLEMENTED / CI PENDING / LIVE UNVERIFIED / NOT PRODUCTION CERTIFIED**. CI Green alone never equals production certification.
