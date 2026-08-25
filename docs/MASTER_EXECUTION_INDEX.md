# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main`

> نقطة الرجوع الإلزامية قبل كل دفعة. لا تُحسب الملفات/commits إنجازًا بحد ذاتها. نفصل implementation / gate / integration / runtime / live certification.

## Mandatory execution rules
- افحص الفهرس والمستودع والعمل السابق قبل كل دفعة.
- Reuse/fix/consolidate قبل create؛ لا engines موازية.
- CI يعمل بالتوازي مع التدقيق والتنفيذ.
- failure-family batching: scan/search → root cause → batch fix → regression → CI → runtime verification.
- لا mock business data ولا fake runtime evidence ولا defaults تخفي missing data/tenant/security constraints.
- AI ليس مصدر الحقيقة المالية/الرقمية.
- PASS لا يعني production-certified؛ LIVE evidence منفصل.

## Current truth
- Baseline CI closure at `25eef5212dbc63d2255ad7998e76c3d02a5191cf` was verified by quality Run `32910806786` = PASS. fileciteturn23file0L2-L5
- Deep-product wave has now reached `d964973cd1f438ef2ed4ace0127c13bf82c2c18d`.
- This wave contains real BI numeric hardening, semantic document corpus/evidence validation, decision-outcome truth hardening, regression coverage, and CI gates. The newest post-change CI result is **PENDING VERIFICATION** until the run completes.

## Remaining Work Inventory — 2026-08-26
| Class | Capability | Current state | Can execute now? | Dependency | LIVE required? | Risk |
|---|---|---|---|---|---|---|
| A | BI numeric/data-truth hardening | IMPLEMENTED, regression gated | YES | none | No for code/tests | Medium |
| A | Golden document corpus semantics | IMPLEMENTED, regression gated | YES | none | No for corpus/harness | Medium |
| A | Outcome feedback truth | IMPLEMENTED, regression gated | YES | outcome schema | Runtime proof later | High |
| A | Import lifecycle adversarial harness | IMPLEMENTED/GATED foundation | YES | existing import contracts | Runtime crash drill later | High |
| A | Decision/evidence lineage deep scan | GATED foundation | YES | canonical decision path | Outcome loop needs LIVE | High |
| A | Architecture duplicate/legacy scan | PARTIAL | YES | none | No | Medium |
| B | Tenant/RLS/Storage/Realtime/AI deep static scan | GATED | YES | existing tenant contracts | Final proof LIVE | Critical |
| B | Worker/queue resilience harness | GATED foundation | YES | existing runtime contracts | Actual worker crash LIVE | Critical |
| B | Watched-folder coordinator hardening | GATED foundation | YES | canonical watcher contract | Persistent native watch LIVE | High |
| B | Backup/restore harness | FOUNDATION | YES | migration/release contracts | Real restore LIVE | Critical |
| B | UI E2E path audit | FOUNDATION/GATED | YES | route/service contracts | Authenticated browser LIVE for final proof | High |
| B | Performance/scalability adversarial cases | GATED | YES | existing perf budget | Production load LIVE | Medium |
| B | Observability trace-chain audit | FOUNDATION | YES | job/report/decision IDs | Production telemetry LIVE | High |
| C | Cross-surface business truth equivalence | PARTIAL | After canonical KPI map | No | High |
| C | Decision → action → outcome feedback | FOUNDATION/IMPROVED | Outcome storage/telemetry | Outcome environment LIVE | High |
| D | Supabase/Storage/Realtime adversarial tenant drill | Static gates PASS | LIVE environment | Yes | Critical |
| D | Backup restore/RPO/RTO drill | Harness possible | Live backup/DB | Yes | Critical |
| D | Windows/Android/iOS persistent watcher proof | Contracts present | Native adapters/devices | Yes | High |
| D | Production worker crash/dead-letter drill | Harness possible | Deployed worker | Yes | Critical |
| E | Destructive architecture/migration changes | DO NOT TOUCH YET | Safety dependency | Backup/rollback | N/A |

## Parallel Execution Matrix
| Front | State | Dependency | Can run now? | Risk | LIVE required? | Canonical owner/path | Expected output |
|---|---|---|---|---|---|---|---|
| Tenant/Security | 🟡 PARALLEL WITH CAUTION | tenant contracts | YES | Critical | Final runtime proof | `src/lib/tenantContext.ts`, RLS migrations, security scripts | No indirect cross-tenant path |
| Data Truth/BI | 🟢 PARALLEL NOW | none | YES | High | No for unit/integration | `src/lib/businessIntelligenceEngines.ts` | Fail-closed invalid input + explainable formulas |
| Document Intelligence | 🟢 PARALLEL NOW | none | YES | High | Corpus execution may be LIVE | `src/lib/document-intelligence/*`, service | Extraction→normalization→evidence→confidence |
| Import/Reconciliation | 🟢 PARALLEL NOW | canonical import RPCs | YES | Critical | Crash/retry drill LIVE | `src/lib/import/*`, `supabase/migrations/*` | Idempotent, atomic, resumable import |
| Decision/Evidence | 🟢 PARALLEL NOW | canonical decision path | YES | Critical | Outcome proof LIVE | decision/report/outcome pipeline | Evidence→decision→outcome lineage |
| Runtime/Workers | 🟢 PARALLEL NOW | existing runtime contracts | YES | Critical | Actual crash/restart LIVE | runtime/production coordinator scripts | Lease/retry/DLQ/resume harness |
| Watched Folder | 🟡 PARALLEL WITH CAUTION | canonical watcher | YES | High | Native persistence LIVE | `src/lib/import-pipeline/folder-watch-contract.ts` | SHA/event/queue semantics per platform |
| Backup/Restore | 🟡 PARALLEL WITH CAUTION | migration/release artifacts | YES | Critical | Restore drill LIVE | release/recovery scripts | Verified restore + RPO/RTO evidence |
| UI/E2E | 🟢 PARALLEL NOW | route/service contracts | YES | High | Authenticated browser final proof | `src/pages/*`, service/RPC paths | Real UI→service→DB→state flow |
| Performance | 🟢 PARALLEL NOW | existing budget | YES | Medium | Load proof LIVE | perf scripts | Bottleneck-specific regression |
| Observability | 🟢 PARALLEL NOW | job/report/decision IDs | YES | High | Telemetry proof LIVE | audit/telemetry modules | Traceable request→outcome chain |
| CI Consolidation | 🟡 PARALLEL WITH CAUTION | current quality topology | YES | Medium | No | `.github/workflows/*`, `scripts/check-*` | Remove duplicates without weaker coverage |

## Latest implementation batches
- `25eef5212dbc63d2255ad7998e76c3d02a5191cf`: CI closure index update; quality Run `32910806786` PASS. fileciteturn23file0L2-L5
- `6b2d5365e3aac72c1de628f8a36825c9a3100e44`: hardened BI engines against invalid numeric input, non-finite values, negative financial quantities, unordered trend dates, invalid period assumptions, and what-if overflow.
- `925c2eaae7271e3e9b036a917b7c8e303fd7d9f0`: expanded BI regression coverage for invalid numeric truth and chronology.
- `0b38ced5460f666d99eeda1a79b6e01c2103cce4` / `18bb0cb0570fdae266a66abe7f585de7c1b275c1`: deepened golden corpus into representative input, expected normalization, evidence provenance, and confidence thresholds; corrected fixture shape.
- `09bdc60967e31db33641be3fda28e41a937c1310`: added semantic golden-corpus regression harness.
- `1773cbd149a6a796f18fa30cc2796c9c57647d5b`: wired deep golden regression into canonical quality CI.
- `02bc5ae36f927be2d64bceaac65ab1c4f6f28ac8`: hardened outcome identity/validation, aligned in-memory dedupe with persistence identity, made tenant filter explicit on reads, and stopped missing impact/accuracy from becoming zero.
- `e3a1a19ba392fa9d3ac40f512e26bb11d506f9c3`: added outcome-feedback regressions.
- `d964973cd1f438ef2ed4ace0127c13bf82c2c18d`: wired outcome-feedback regressions into quality CI.

## Current CI truth
- Verified baseline: Run `32910806786`, head `25eef5212dbc63d2255ad7998e76c3d02a5191cf`, quality `success`. fileciteturn23file0L2-L5
- Quality Run `32912319688` on `1773cbd149a6a796f18fa30cc2796c9c57647d5b` reached and passed the new deep golden regression, BI regression, tenant/security, import, typecheck, and lint stages before build; the run was still in progress at the last observed poll. 
- The latest head `d964973cd1f438ef2ed4ace0127c13bf82c2c18d` has a newer push-triggered quality run; its final conclusion is not yet claimed.
- Prior verified quality: typecheck PASS, lint PASS (55 warnings/0 errors), build PASS, performance budget PASS, static/local runtime contracts PASS. fileciteturn1file0L2-L4

## Deep Data Truth — current verified changes
- Aging missing/invalid due dates remain explicit `UNDATED`; they are not silently coerced into `0-30`. fileciteturn4file0L2-L2
- BI engine now rejects non-finite/negative numeric inputs in replenishment, customer/supplier scoring, liquidity, CCC, and rejects malformed what-if changes instead of propagating NaN/Infinity.
- Trend analysis now sorts valid points chronologically before calculating direction/velocity/acceleration; invalid dates/values are excluded rather than becoming fake values.
- CCC still returns `INSUFFICIENT_DATA` when revenue/COGS/purchases are unavailable, preserving fail-closed semantics. fileciteturn7file0L2-L2
- Heuristic confidence remains bounded but is not evidence of correctness; cross-surface provenance is still an open audit front.

## Document Intelligence — current verified changes
- Existing golden contract previously required only case labels. fileciteturn11file0L2-L2
- Corpus now stores representative structured inputs, expected canonical fields, expected normalized values, evidence provenance, and minimum confidence per case.
- Cases cover Arabic/English, scanned OCR, random schema, headerless tables, complex tables, invoices/reconciliation, Onyx-style exports, and wide reports.
- Deep harness rejects a case when schema matches but normalized output, evidence provenance, or confidence is wrong.
- Real-file/OCR accuracy remains **not production-certified** until actual corpus execution evidence exists.

## Decision / Outcome truth
- Business decision creation requires non-empty evidence IDs; evidence IDs are normalized/deduplicated; report construction filters to evidence-backed decisions. fileciteturn1file0L2-L4
- New outcome hardening requires known labels to carry finite expected/actual values and validates timestamps/numbers.
- Outcome in-memory dedupe now matches the persisted `company_id + recommendation_key` identity instead of using `observedAt`, eliminating an identity mismatch.
- Outcome reads explicitly scope `company_id` in addition to relying on RLS.
- Missing impact is now `null`, and accuracy is `null` when there are no known outcomes; these are no longer silently represented as zero.
- Runtime outcome tracking remains LIVE REQUIRED.

## Tenant / Security truth
- Canonical browser resolver remains `resolveCurrentCompanyId()`; tenant legacy/static/client-selected boundary is already guarded. fileciteturn1file0L2-L4
- Canonical import RPC wrapper verifies caller tenant context against the supplied company ID before executing entity RPCs. fileciteturn19file0L2-L2
- Deep indirect-path scan remains open for Storage, Realtime, AI/vector, exports/downloads, notifications/logs, and worker execution context.
- Static PASS is not runtime cross-tenant proof.

## Import / Reconciliation truth
- Canonical import validates the entire chunk before write and uses a tenant-resolved RPC transaction boundary; result counts/IDs are verified against submitted row count. fileciteturn17file0L2-L2
- Atomic wrapper uses canonical entity RPCs and rolls the chunk back if a row fails. fileciteturn19file0L2-L2
- Remaining deep work: duplicate-worker race, stale lease, crash after checkpoint, replay/rollback evidence, and live worker drill.

## Watched-folder / cross-platform
Canonical watcher contract is reused across platforms with a single `WatchEvent`/queue boundary. Web/PWA are session-bound; Windows/Android persistent watching requires native adapters; iOS does not claim arbitrary persistent background folder watching. fileciteturn16file0L2-L2

## Backup / Restore
- Recovery and release contracts exist and are CI-gated.
- Actual database restore, artifact verification against a real backup, rollback timing, RPO/RTO measurement, and recovery drill remain LIVE REQUIRED.

## Runtime / Workers
- Runtime contracts and local harnesses are gated by CI.
- Actual deployed worker crash/restart, duplicate worker, stale lease, dead-letter, and resume evidence remain LIVE REQUIRED.

## UI / E2E
- Static route/service/security contracts exist.
- Authenticated browser E2E with real tenant data is not claimed from CI-only evidence; final proof remains runtime/live.

## Performance / Scalability
- Prior performance budget was PASS (`critical=836.9KB`, `total=1404.1KB`, `largest-js=422.9KB`). fileciteturn1file0L2-L4
- Remaining deep work is bottleneck-specific query/payload/concurrency testing, not arbitrary optimization.

## Observability / Governance
- CI and runtime contracts exist for jobs, reports, decisions, and resilience.
- Remaining requirement is proving an end-to-end trace chain with tenant context in real runtime telemetry without cross-tenant leakage.

## Architecture
- Canonical paths are preferred for tenant resolution, import lifecycle, decision construction, watched-folder events, and outcome persistence identity.
- No destructive consolidation is performed while live dependencies are unproven.
- Compatibility/legacy paths remain targets for static bypass scans and will only be removed after consumer verification and rollback safety.

## LIVE REQUIRED — exact evidence still outstanding
1. Supabase adversarial tenant A/B read/write isolation across DB, Storage, Realtime, AI/vector, imports, reports, decisions, exports, downloads, workers and notifications.
2. Real backup restore + integrity/checksum verification + measured RPO/RTO + rollback drill.
3. Real worker crash/restart/duplicate/stale-lease/dead-letter/resume drill.
4. Persistent native watched-folder proof on Windows and Android; capability proof on iOS.
5. Authenticated UI E2E against real tenant-scoped data.
6. Real document corpus execution including OCR/PDF/XLSX/CSV and representative corrupt/ambiguous files.
7. Production telemetry trace from user action through job/database/evidence/report/decision/outcome.
8. Production load/canary and rollback evidence.

## Capability status fields
For every capability, the authoritative state must distinguish: IMPLEMENTED, GATED, INTEGRATED, RUNTIME EVIDENCE, PRODUCTION EVIDENCE, REMAINING, BLOCKED BY, LIVE REQUIRED, PARALLEL WORK AVAILABLE, RISKS, LAST VERIFIED COMMIT, LAST VERIFIED CI, LAST TEST, LAST UPDATE. A commit alone never upgrades any evidence field.

## Completion truth
**Engineering completion remains ~82% conservative until the newest wave is CI-verified and additional runtime evidence is produced.** The project is **NOT production-certified**. CI Green is a gate, not production proof.
