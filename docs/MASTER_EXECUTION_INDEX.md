# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` plus the active Wave 02 PR branch until merge.

## Mandatory truth rules
- A commit is not evidence by itself.
- `PASS` is always bound to an exact commit and CI run.
- `IMPLEMENTED`, `TESTED`, `GATED`, `INTEGRATED`, `RUNTIME VERIFIED`, `LIVE VERIFIED`, and `PRODUCTION CERTIFIED` are separate states.
- No fake runtime/live evidence, no silent missing-data-to-zero conversion, no weak-hash fallback.
- CI runs in parallel with independent execution fronts.
- Destructive architecture changes remain blocked until consumer/dependency/rollback analysis is complete.

## HEAD / CI discrepancy closure
- Requested starting HEAD: `f522420759ba8bf5735504888a7dc37f860091d4`.
- No workflow run/status was observable for that exact commit at wave start; therefore **NOT PASS**.
- Wave 02 implementation branch started exactly from that HEAD.
- Current Wave 02 branch HEAD: `8f66ab585b27e8e71c4bb510d2f1a0b5d3aafa12`.
- PR: `#22` (`execution-wave-02-closure` → `main`).
- Current Wave 02 CI evidence: **PENDING / not observable yet**. No PASS is claimed.
- `main` base currently resolves to `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

## Capability truth matrix
| CAPABILITY | STATE | IMPLEMENTED | TESTED | GATED | INTEGRATED | RUNTIME EVIDENCE | LIVE EVIDENCE | PRODUCTION EVIDENCE | REMAINING | DEPENDENCY | PARALLEL WORK | RISKS | LAST COMMIT | LAST CI RUN | LAST TEST | LAST UPDATE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | GATED | YES | YES | YES | YES | PARTIAL | NO | NO | indirect Storage/Realtime/AI/vector/export/download/worker/notification drill | tenant/RLS contracts | YES | CRITICAL | 8f66ab5 | PENDING | existing tenant gates | 2026-08-26 |
| BI/data truth | GATED | YES | YES | YES | YES | LOCAL | NO | NO | cross-surface provenance/runtime | none | YES | HIGH | 8f66ab5 | PENDING | BI regressions | 2026-08-26 |
| Document intelligence | GATED | YES | YES | YES | YES | LOCAL SEMANTIC EXECUTION | NO | NO | real PDF/OCR/corrupt/ambiguous corpus | real corpus for production accuracy | YES | HIGH | 8f66ab5 | PENDING | semantic execution + golden | 2026-08-26 |
| Import/reconciliation | GATED | YES | YES | YES | YES | DETERMINISTIC HARNESS | NO | NO | deployed worker crash/retry/rollback proof | live worker | YES | CRITICAL | 8f66ab5 | PENDING | Wave 02 import harness | 2026-08-26 |
| Decision/evidence/outcome | GATED | YES | YES | YES | YES | PARTIAL | NO | NO | full action→outcome telemetry | outcome runtime | YES | CRITICAL | 8f66ab5 | PENDING | outcome/decision regressions | 2026-08-26 |
| Runtime/workers | GATED | YES | YES | YES | YES | DETERMINISTIC SIMULATION | NO | NO | deployed crash/restart/stale lease/DLQ drill | live worker | YES | CRITICAL | 8f66ab5 | PENDING | Wave 02 runtime harness | 2026-08-26 |
| Watched folder | GATED | YES | YES | YES | YES | LOCAL IDENTITY | NO | NO | persistent native Windows/Android proof; iOS capability proof | native adapters/devices | YES | HIGH | 8f66ab5 | PENDING | watcher contracts + SHA identity | 2026-08-26 |
| Backup/restore | FOUNDATION/GATED | YES | YES | YES | YES | ARTIFACT HARNESS | NO | NO | real restore/RPO/RTO/rollback drill | live DB/backup | YES | CRITICAL | 8f66ab5 | PENDING | backup checksum harness | 2026-08-26 |
| Cross-surface truth | IMPLEMENTED/GATED | YES | YES | YES | YES | LOCAL DETERMINISTIC | NO | NO | wire all production consumers to one canonical KPI source | consumer inventory | YES | HIGH | 8f66ab5 | PENDING | Wave 02 truth harness | 2026-08-26 |
| Observability | FOUNDATION/GATED | YES | YES | YES | YES | LOCAL TRACE CONTRACT | NO | NO | production telemetry chain | telemetry environment | YES | HIGH | 8f66ab5 | PENDING | Wave 02 trace harness | 2026-08-26 |
| UI/E2E | FOUNDATION/GATED | PARTIAL | YES | YES | PARTIAL | STATIC | NO | NO | authenticated browser against real tenant | auth/runtime environment | YES | HIGH | 4095e0f | verified gates only | existing route/service gates | 2026-08-26 |
| Performance | GATED | YES | YES | YES | YES | LOCAL | NO | NO | N+1/query/payload/concurrency deep benchmark | production-scale data | YES | MEDIUM | 4095e0f | verified prior gates | performance budget | 2026-08-26 |
| CI topology | GATED | YES | YES | YES | YES | CI | NO | NO | observe Wave 02 exact-head result; consolidate only with coverage proof | GitHub Actions | YES | MEDIUM | 8f66ab5 | PENDING | workflow integrity | 2026-08-26 |

## Wave 02 executed changes
1. Added deterministic worker lifecycle harness: lease, heartbeat, checkpoint, stale-lease recovery, retry exhaustion, DLQ, duplicate-worker rejection, tenant-bound completion receipt, idempotent terminal completion.
2. Added adversarial import harness: same-file replay/idempotency, checkpoint/resume after crash, business-key conflict fail-closed behavior, cancellation, terminal rollback refusal, tenant isolation.
3. Added canonical KPI truth function and deterministic Dashboard=Report=Export=Decision equivalence test for identical tenant/period input.
4. Added required trace identity contract for `user_action_id → request_id → job_id → import_id → evidence_id → report_id → decision_id → outcome_id` with `tenant_id`.
5. Added backup artifact manifest, SHA-256 payload digest, checksum verification and tamper detection harness.
6. Added watched-file SHA-256 identity test proving rename-independent content identity and tenant requirement.
7. Added document-intelligence semantic execution against the repository golden corpus through schema profiling, normalization, validation and confidence scoring. This is local synthetic/representative execution, not production OCR accuracy certification.
8. Wired the new Wave 02 runtime harness and document semantic execution into the canonical `quality` workflow rather than creating a duplicate CI gate.

## Regression evidence status
- Wave 02 test code is integrated into the branch and CI workflow.
- Exact Wave 02 CI result is **PENDING**; therefore the branch is not certified PASS.
- Existing verified baseline remains: quality Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS.
- No PASS from the baseline is transferred to the newer HEAD.

## Failure-family handling
- No expected result was weakened to make a new harness pass.
- Import business-key conflicts fail closed and do not partially commit staged rows.
- Worker completion rejects tenant mismatch.
- Duplicate terminal completion returns the original receipt without emitting a second completion event.
- Backup tampering fails checksum/digest verification.
- Invalid KPI values and periods fail closed.

## Document Intelligence truth
- Golden corpus contains eight representative cases and semantic expectations.
- Wave 02 executes seven supported structured/representative cases through real repository schema profiling, normalization, validation and confidence functions.
- Headerless/scanned/real OCR accuracy is not claimed merely because fixtures exist.
- **REAL CORPUS REQUIRED** remains for production-grade PDF/OCR/XLSX/CSV accuracy and corrupt/ambiguous real files.

## Security truth
- Canonical tenant resolver remains `resolveCurrentCompanyId()` and the browser tenant boundary rejects a client-selected tenant that differs from authoritative tenant context.
- Import RPC tenant context is already guarded.
- Remaining security closure is the indirect authority drill across Storage, Realtime, AI/vector namespaces, metadata/object paths, signed URLs, exports/downloads, notification recipients, worker payloads, queue messages and cached/background objects.
- Static gates do not equal runtime A/B isolation.

## LIVE REQUIRED — exact evidence only
1. Supabase tenant A/B adversarial drill across DB, Storage, Realtime, AI/vector, import, report, decision, export, download, worker and notification surfaces.
2. Real database backup restore, checksum/integrity verification, migration replay, rollback and measured RPO/RTO.
3. Deployed worker crash/restart, duplicate worker, stale lease, retry exhaustion, DLQ and resume drill.
4. Persistent native watched-folder proof on Windows and Android; iOS capability boundary proof.
5. Authenticated browser E2E using real tenant-scoped data.
6. Real document corpus including PDF/OCR/XLSX/CSV, corrupt and ambiguous samples.
7. Production telemetry trace from user action through job/database/evidence/report/decision/outcome with tenant context and PII redaction.
8. Production-scale load/canary and rollback evidence.

## Remaining Work Inventory
### NOW
- Observe and verify CI for Wave 02 exact HEAD.
- Deep indirect tenant/security surface scan and fix any concrete bypass found.
- Continue canonical-consumer inventory for Dashboard/Report/Export/Decision formulas.
- Production-code hygiene scan and safe production-risk fixes.

### PARALLEL
- Import adversarial expansion.
- Runtime worker simulation expansion.
- Document corpus execution and additional representative cases.
- Backup/restore artifact and migration replay harness.
- Observability trace propagation checks.
- Performance deep static/query audit.
- UI route→handler→service→RPC/API→DB→state/error path audit.
- CI matrix KEEP/MERGE/DEPRECATE analysis without coverage loss.

### DEPENDENCY
- Live Supabase environment for cross-tenant Storage/Realtime/AI-vector proof.
- Deployed worker runtime for crash/restart proof.
- Real backup/DB for RPO/RTO and restore drill.
- Authenticated browser/real tenant data for final UI E2E.
- Native Windows/Android adapters/devices for persistent folder watch proof.
- Real corpus for production accuracy certification.

### LIVE
Only the exact eight evidence classes above. Everything else that can be simulated, tested, guarded, or automated remains an engineering task now.

### DO NOT TOUCH
- Destructive migration/consolidation that lacks consumer inventory, dependency map, regression and rollback evidence.
- Reopening already-closed BI NaN/Infinity, outcome identity, SHA-256 hardening or tenant legacy work unless a regression/new bypass/new evidence appears.

## Parallel Execution Matrix
| FRONT | STATE | DEPENDENCY | EXPECTED OUTPUT |
|---|---|---|---|
| Security | PARALLEL | tenant contracts | no indirect authority bypass; concrete fixes + regressions |
| Import | PARALLEL | canonical import RPCs | deterministic adversarial lifecycle |
| Document | PARALLEL | document-intelligence functions | executed semantic pipeline; real corpus boundary explicit |
| Cross-surface | PARALLEL | canonical KPI map | one formula source consumed by all surfaces |
| Runtime | PARALLEL | runtime contracts | deterministic crash/recovery/DLQ/resume proof |
| Backup | PARALLEL | release/migration contracts | verified artifact + restore procedure harness |
| Watched folder | PARALLEL | watcher contract | event→identity→queue semantics; platform capability matrix |
| Observability | PARALLEL | trace IDs | unbroken tenant-scoped trace chain |
| Performance | PARALLEL | existing budgets | bottleneck-specific before/fix/after regression |
| UI/E2E | PARALLEL | route/service contracts | no dead/mock/fake/stale/permission-bypass paths |
| CI | PARALLEL | current topology | one canonical gate per capability; no coverage regression |

## Completion truth
Engineering completion is intentionally conservative at **~82% until Wave 02 CI and additional runtime/live evidence are verified**. The project is **NOT production-certified**. CI Green alone will never be treated as production certification.
