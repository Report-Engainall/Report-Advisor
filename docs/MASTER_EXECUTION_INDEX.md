# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + active execution PRs. Wave 04 branch is the active verification/pre-live closure branch.

## Mandatory truth rules
- PASS is bound to an exact commit and exact CI run/job evidence.
- A prior PASS is never transferred to a newer HEAD.
- FOUNDATION, DEEP CLOSURE, CONSUMER VERIFIED, TESTED, GATED, INTEGRATED, RUNTIME VERIFIED, LIVE VERIFIED and PRODUCTION CERTIFIED are separate states.
- Missing/unknown data never becomes measured zero.
- No fake runtime/live evidence and no cryptographic fallback.
- Independent fronts run in parallel; destructive consolidation requires consumer/dependency/rollback analysis.

## Exact HEAD / CI truth
- Wave 04 started from Wave 03 HEAD: `d6a258419a7c20a05145fe7ae4dc35ee239f6287`.
- Wave 04 branch: `execution-wave-04-verification`.
- Latest code/workflow HEAD before this index-only update: `7b222f7e82e6cfad515d3402f1c2516d5fcbe0a0`.
- This index update is intentionally separate from the code/workflow HEAD; it never self-references a future SHA.
- Base `main`: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Exact-head workflow lookup for `7b222f7e82e6cfad515d3402f1c2516d5fcbe0a0`: **PENDING / no completed run observable at verification time**.
- Therefore Wave 04 CI = **PENDING**, never PASS.
- Historical Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` remains baseline evidence only.

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | CONSUMER VERIFIED | TESTED | GATED | INTEGRATED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | LAST CODE COMMIT | LAST CI | LAST TEST | REMAINING | DEPENDENCY | RISK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | 7b222f7 | PENDING | wave04 consumer/authority proof | Supabase A/B indirect runtime proof | live Supabase | CRITICAL |
| BI/data truth | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | 7b222f7 | PENDING | consumer inventory + cross-surface guards | runtime consumer equivalence incl. filters/as-of | none | HIGH |
| Cross-surface truth | YES | YES | PARTIAL | YES | YES | YES | LOCAL/PARTIAL | NO | NO | 7b222f7 | PENDING | canonical KPI + consumer proof gate | runtime Dashboard=Report=Export=Decision | real tenant runtime | HIGH |
| Import/reconciliation | YES | YES | YES* | YES | YES | YES | DETERMINISTIC | NO | NO | 7b222f7 | PENDING | Wave 03 adversarial + Wave 04 invariant proof | deployed worker drill/rollback | live worker | CRITICAL |
| Runtime/workers | YES | YES | YES* | YES | YES | YES | SIMULATED | NO | NO | 7b222f7 | PENDING | distributed runtime + invariant proof | deployed crash/restart/DLQ/resume | deployed worker | CRITICAL |
| Document intelligence | YES | YES | PARTIAL | YES | YES | YES | LOCAL SEMANTIC | NO | NO | 7b222f7 | PENDING | measured semantic execution | larger real corpus + OCR accuracy | real corpus | HIGH |
| Evidence/provenance | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | 7b222f7 | PENDING | consumer/provenance scan | real document evidence chain | real corpus | HIGH |
| Decision/action/outcome/feedback | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | 7b222f7 | PENDING | graph regressions + consumer scan | runtime full-loop action/outcome/feedback | runtime outcome | CRITICAL |
| Observability | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | 7b222f7 | PENDING | trace context regression | production telemetry chain | telemetry environment | HIGH |
| Backup/restore | YES | YES | N/A | YES | YES | YES | LOCAL ARTIFACT | NO | NO | 7b222f7 | PENDING | readiness harness | real restore/RPO/RTO/rollback | live DB/backup | CRITICAL |
| Watched folder | YES | YES | PARTIAL | YES | YES | YES | LOCAL IDENTITY | NO | NO | 7b222f7 | PENDING | watcher recovery + invariant proof | native persistent watcher | native adapters/devices | HIGH |
| Performance | YES | YES | N/A | PARTIAL | YES | YES | LOCAL | NO | NO | 7b222f7 | PENDING | deep static scan | before/fix/after + production benchmark | production-scale data | MEDIUM |
| UI/E2E | YES | YES | PARTIAL | PARTIAL | YES | PARTIAL | STATIC | NO | NO | 7b222f7 | PENDING | consumer inventory | authenticated browser proof | auth runtime | HIGH |
| CI topology | YES | YES | N/A | YES | YES | YES | PENDING | NO | NO | 7b222f7 | PENDING | quality workflow + Wave 04 gates | exact-head run evidence | GitHub Actions | MEDIUM |
| Production hygiene | YES | YES | PARTIAL | PARTIAL | YES | YES | NO | NO | NO | 7b222f7 | PENDING | hygiene/authority scan | classify and fix concrete production risks | code runtime | MEDIUM |

\* Import/worker consumer state means the harnesses and invariants are integrated and exercised by proof gates; it does not mean deployed runtime is verified.

## Wave 04 implementation
1. `scripts/execution-wave-04-consumer-proof.mjs`: repository-wide consumer inventory for UI/pages plus indirect authority and provenance guards; blocking authority patterns fail closed.
2. `scripts/execution-wave-04-invariant-proof.mjs`: verifies the existing Wave 03 import/worker/watcher/decision/trace implementations contain the required deep invariant coverage without rebuilding those foundations.
3. `docs/WAVE_04_CONSUMER_DEPENDENCY_MAP.md`: capability→canonical implementation→consumer→legacy/risk→proof map and security authority matrix.
4. `package.json`: canonical `test:wave04-consumer-proof` and `test:wave04-invariant-proof` commands.
5. `.github/workflows/quality.yml`: Wave 04 gates integrated into the existing canonical quality workflow; no duplicate quality workflow created.

## Consumer truth
- Wave 04 advances from pattern-only scanning to repository consumer inventory.
- Direct page/component Supabase access is surfaced as a review finding rather than silently treated as canonical.
- Page-local KPI formulas are surfaced explicitly.
- A clean static scan remains insufficient for runtime equivalence certification.
- Full Dashboard=Report=Export=Decision consumer equivalence remains PARTIAL until real runtime execution with identical tenant/period/dataset/filter/as-of context.

## Security authority truth
- Tenant authority remains server/database-derived; client-selected tenant/object/recipient/report/decision/outcome/worker context is not trusted.
- Wave 04 adds blocking detection for client-selected tenant/fallback/recipient authority patterns and inventories indirect object/report/decision paths.
- Storage, signed URL, Realtime, AI/vector, cache and IDOR isolation still require live A/B proof after static/application closure.

## Import / worker truth
- Wave 03 foundations are reused, not rebuilt.
- Wave 04 adds invariant coverage verification for replay, crash, checkpoint, resume, business-key, cancellation, terminal state, tenant isolation, lease, heartbeat, retry, DLQ and duplicate completion semantics.
- Duplicate side-effect safety still requires deployed worker/database/event/notification drill.

## Document / evidence truth
- Semantic execution remains local and measured; no fake OCR or extraction accuracy is claimed.
- Wave 04 explicitly treats evidence provenance and confidence as separate concerns and keeps real-corpus accuracy LIVE/REAL-CORPUS REQUIRED.

## Decision / outcome truth
- Existing fail-closed graph remains canonical.
- Wave 04 verifies the graph and scans consumers for direct decision creation/provenance risk.
- Missing impact/accuracy remains unknown, not zero.
- Runtime action→outcome→feedback remains outstanding.

## Observability truth
- Existing trace context is canonical and Wave 04 verifies the required identity chain remains present.
- PII redaction and tenant propagation remain locally gated; production telemetry remains LIVE REQUIRED.

## Backup / watcher truth
- Existing backup and watcher harnesses remain canonical.
- Wave 04 verifies their deep invariant markers rather than rebuilding them.
- Real restore and native persistent watcher behavior remain LIVE REQUIRED.

## Performance / UI / hygiene truth
- Performance remains PARTIAL until concrete before/fix/after evidence exists.
- UI remains PARTIAL until authenticated browser execution; static consumer paths are being verified now.
- Production-risk findings are surfaced by gates; no production certification is inferred from a scan alone.

## LIVE REQUIRED — only evidence that genuinely needs environment
1. Supabase A/B isolation across DB/Storage/Realtime/AI-vector/import/report/decision/export/download/worker/notification.
2. Deployed worker crash/restart/stale lease/DLQ/resume and duplicate side-effect drill.
3. Real backup restore + migration replay + rollback + RPO/RTO.
4. Windows/Android persistent watcher proof and iOS capability proof.
5. Authenticated browser E2E against real tenant data.
6. Real PDF/OCR/XLSX/CSV/corrupt/ambiguous corpus accuracy.
7. Production telemetry trace with tenant context and PII redaction.
8. Production-scale load/canary and rollback.

## Remaining Work Inventory
### NOW
- Obtain exact-head CI for `7b222f7e82e6cfad515d3402f1c2516d5fcbe0a0`.
- If CI fails, fix the complete failure family, add regression, and rerun on the new exact HEAD.
- Review any blocking consumer/authority findings produced by the Wave 04 gate.
- Complete runtime consumer equivalence for Dashboard/Report/Export/Decision.

### PARALLEL
- Supabase A/B authority proof preparation.
- Import/worker side-effect idempotency review.
- Document corpus and evidence provenance expansion.
- Decision/action/outcome consumer verification.
- Observability critical-flow runtime propagation.
- Backup live-drill preparation.
- Native watcher preparation.
- Performance before/fix/after work.
- Authenticated UI flow inventory.

### DEPENDENCY
- Live Supabase environment.
- Deployed worker.
- Real database/backup.
- Native adapters/devices.
- Authenticated browser tenant.
- Real document corpus.
- Production telemetry/load environment.

### DO NOT TOUCH
- Closed BI NaN/Infinity, trend chronology, outcome identity, missing-impact truth and SHA-256 fallback unless regression, bypass or new evidence appears.
- Destructive migration/consolidation without consumer/dependency/rollback proof.

## Completion truth
Wave 04 current state = **VERIFICATION IMPLEMENTED / CONSUMER VERIFIED PARTIAL / CI PENDING / RUNTIME PARTIAL / LIVE UNVERIFIED / NOT PRODUCTION CERTIFIED**.
