# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth for this wave: PR #45 exact head `369c35e2cd58303bafa3de20b3397d4833854efc` (base `4095e0f0d427652eb705ba3955389ae978d7b5bf`). `main` remains the merge target, not the current implementation head.

> نقطة الرجوع الإلزامية قبل كل دفعة. لا تُحسب الملفات/commits إنجازًا بحد ذاتها. نفصل implementation / regression / gate / integration / runtime / live certification.

## Mandatory execution rules
- افحص الفهرس والمستودع والعمل السابق قبل كل دفعة.
- Reuse/fix/consolidate قبل create؛ لا engines موازية.
- CI يعمل بالتوازي مع التنفيذ؛ exact-head CI هو حاجز الشهادة وليس حاجز التنفيذ.
- failure-family batching: find/search → root cause → batch fix → consumer migration → regression → exact-head CI → index → runtime verification.
- لا mock business data ولا fake runtime evidence ولا defaults تخفي missing data/tenant/security constraints.
- AI ليس مصدر الحقيقة المالية/الرقمية.
- PASS لا يعني production-certified؛ LIVE evidence منفصل.
- PASS تاريخي لا يرفع أي capability على HEAD جديد.

## Current truth
- Historical baseline CI closure at `25eef5212dbc63d2255ad7998e76c3d02a5191cf` was verified by quality Run `32910806786` = PASS; it is historical evidence only. fileciteturn23file0L2-L5
- PR #45 base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Current code head for this index update: `369c35e2cd58303bafa3de20b3397d4833854efc`.
- Exact-head quality Run `32928998300` is running against the wave branch head lineage after the exact-head trigger was added; no PASS is claimed until completion is observed against the matching SHA.
- PR merge ref is not used as exact-head certification evidence.

## Active closure batch — canonical query + inventory truth
### FIND
1. `tsconfig.app.json` still aliased `@/lib/queries` to the removed `src/lib/queries-compat.ts`.
2. The canonical `src/lib/queries.ts` already contains the former compatibility exports, so recreating a compatibility layer would duplicate business truth unnecessarily.
3. The `/inventory` route still consumed the legacy `fetchInventoryBalances()` path, which performs an unbounded `inventory_balances` read and browser-side business aggregation.
4. The repository already contains the canonical server-side `report_inventory_snapshot` RPC and snapshot metrics contract.

### ROOT CAUSE
- Compatibility removal was incomplete at the TypeScript path-resolution layer: source consumers were conceptually migrated, but the alias contract still targeted the deleted adapter.
- Inventory UI migration had not reached the route boundary; the old UI remained a business-aggregation consumer even though a canonical paginated/server-aggregated report path existed.

### FIX
- `tsconfig.app.json` now maps `@/lib/queries` directly to `./src/lib/queries.ts`.
- Added `scripts/check-canonical-query-alias.mjs` and wired it into quality CI.
- Quality workflow now runs on `main` and `wave/**` push refs so branch pushes receive exact-head quality runs; the existing diagnostics gate also requires `git rev-parse HEAD == GITHUB_SHA`.
- Added `src/pages/InventoryPageCanonical.tsx` consuming `fetchInventoryReportSnapshot(page,pageSize)`.
- `/inventory` in `src/App.tsx` now routes to `InventoryPageCanonical` instead of `EntityPages.InventoryPage`.
- Inventory business cards now come from server-side metrics; pagination is display-only; incomplete quantity/cost stays explicit rather than becoming zero.

### REGRESSION
- Canonical-query regression verifies the compatibility module is absent, the alias points to canonical queries, required canonical exports exist, and the application route points to the canonical paginated inventory surface.
- The inventory snapshot migration is itself fail-closed for incomplete rows and tenant-scoped with `current_company_id()`.

### CONSUMER STATE
- `queries-compat.ts`: removed; no source references detected by the canonical alias guard.
- Former inventory route consumer: migrated.
- `EntityPages.InventoryPage` remains as an unreferenced legacy implementation candidate and is **not yet deleted** because destructive source removal requires one more explicit zero-consumer verification/cleanup step. It is not the active `/inventory` route.

## Remaining Work Inventory — 2026-08-26
| Class | Capability | Current state | Can execute now? | Dependency | LIVE required? | Risk |
|---|---|---|---|---|---|---|
| A | BI numeric/data-truth hardening | IMPLEMENTED, regression gated | YES | none | No for code/tests | Medium |
| A | Golden document corpus semantics | IMPLEMENTED, regression gated | YES | none | No for corpus/harness | Medium |
| A | Outcome feedback truth | IMPLEMENTED, regression gated | YES | outcome schema | Runtime proof later | High |
| A | File identity / duplicate security | IMPLEMENTED, regression gated | YES | Web Crypto SHA-256 | Runtime/browser matrix later | Critical |
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
| C | Cross-surface business truth equivalence | PARTIAL | YES | canonical KPI map + domain snapshots | Yes for final runtime | High |
| C | Decision → action → outcome feedback | FOUNDATION/IMPROVED | YES | Outcome storage/telemetry | Outcome environment LIVE | High |
| D | Supabase/Storage/Realtime adversarial tenant drill | Static gates only | YES for preparation | LIVE environment | Yes | Critical |
| D | Backup restore/RPO/RTO drill | Harness possible | YES for preparation | Live backup/DB | Yes | Critical |
| D | Windows/Android/iOS persistent watcher proof | Contracts present | YES for preparation | Native adapters/devices | Yes | High |
| D | Production worker crash/dead-letter drill | Harness possible | YES for preparation | Deployed worker | Yes | Critical |
| E | Destructive architecture/migration changes | DO NOT TOUCH YET | No | Backup/rollback | N/A | Critical |

## Parallel Execution Matrix
| Front | State | Dependency | Can run now? | Risk | LIVE required? | Canonical owner/path | Expected output |
|---|---|---|---|---|---|---|---|
| Tenant/Security | 🟡 PARALLEL WITH CAUTION | tenant contracts | YES | Critical | Final runtime proof | `src/lib/tenantContext.ts`, RLS migrations, security scripts | No indirect cross-tenant path |
| Data Truth/BI | 🟢 PARALLEL NOW | none | YES | High | No for unit/integration | `src/lib/businessIntelligenceEngines.ts`, report truth RPCs | Fail-closed invalid input + explainable formulas |
| Document Intelligence | 🟢 PARALLEL NOW | none | YES | High | Corpus execution may be LIVE | `src/lib/document-intelligence/*`, service | Extraction→normalization→evidence→confidence |
| Import/Reconciliation | 🟢 PARALLEL NOW | canonical import RPCs | YES | Critical | Crash/retry drill LIVE | `src/lib/import/*`, `supabase/migrations/*` | Idempotent, atomic, resumable import |
| Decision/Evidence | 🟢 PARALLEL NOW | canonical decision path | YES | Critical | Outcome proof LIVE | decision/report/outcome pipeline | Evidence→decision→outcome lineage |
| Runtime/Workers | 🟢 PARALLEL NOW | existing runtime contracts | YES | Critical | Actual crash/restart LIVE | runtime/production coordinator scripts | Lease/retry/DLQ/resume harness |
| Watched Folder | 🟡 PARALLEL WITH CAUTION | canonical watcher | YES | High | Native persistence LIVE | `src/lib/import-pipeline/folder-watch-contract.ts` | SHA/event/queue semantics per platform |
| Backup/Restore | 🟡 PARALLEL WITH CAUTION | migration/release artifacts | YES | Critical | Restore drill LIVE | release/recovery scripts | Verified restore + RPO/RTO evidence |
| UI/E2E | 🟢 PARALLEL NOW | route/service contracts | YES | High | Authenticated browser final proof | `src/pages/*`, service/RPC paths | Real UI→service→DB→state flow |
| Performance | 🟢 PARALLEL NOW | existing budget | YES | Medium | Load proof LIVE | perf scripts | Bottleneck-specific regression |
| Observability | 🟢 PARALLEL NOW | job/report/decision IDs | YES | High | Telemetry proof LIVE | audit/telemetry modules | Traceable request→outcome chain |
| CI Consolidation | 🟢 PARALLEL NOW | current quality topology | YES | Medium | No | `.github/workflows/*`, `scripts/check-*` | Exact-head certification on wave refs |

## Latest implementation batches
- `25eef5212dbc63d2255ad7998e76c3d02a5191cf`: historical CI closure index update; quality Run `32910806786` PASS. fileciteturn23file0L2-L5
- `6b2d5365e3aac72c1de628f8a36825c9a3100e44`: hardened BI engines against invalid numeric input, non-finite values, negative financial quantities, unordered trend dates, invalid period assumptions, and what-if overflow.
- `925c2eaae7271e3e9b036a917b7c8e303fd7d9f0`: expanded BI regression coverage for invalid numeric truth and chronology.
- `0b38ced5460f666d99eeda1a79b6e01c2103cce4` / `18bb0cb0570fdae266a66abe7f585de7c1b275c1`: deepened golden corpus into representative input, expected normalization, evidence provenance, and confidence thresholds; corrected fixture shape.
- `09bdc60967e31db33641be3fda28e41a937c1310`: added semantic golden-corpus regression harness.
- `1773cbd149a6a796f18fa30cc2796c9c57647d5b`: wired deep golden regression into canonical quality CI.
- `02bc5ae36f927be2d64bceaac65ab1c4f6f28ac8`: hardened outcome identity/validation, aligned in-memory dedupe with persistence identity, made tenant filter explicit on reads, and stopped missing impact/accuracy from becoming zero.
- `e3a1a19ba392fa9d3ac40f512e26bb11d506f9c3`: added outcome-feedback regressions.
- `d964973cd1f438ef2ed4ace0127c13bf82c2c18d`: wired outcome-feedback regressions into quality CI.
- `d8d55f6c603a551ee70caa313a7a9f5eec3ab170`: removed a false SHA-256 fallback that was actually FNV-1a and made file identity fail closed if Web Crypto SHA-256 is unavailable.
- `7dd65b6559c75c1a24dd6d1ff43fe21ed730c623`: added a known-vector SHA-256 regression.
- `f522420759ba8bf5735504888a7dc37f860091d4`: wired the SHA-256 identity regression into quality CI.
- `5df3e26cd5890065d3bed886468f59ce80b93166`: fixed the stale TypeScript canonical-query alias root cause.
- `334426bdd2fbd236cc77b1f8205b05f8bf56e718`: changed quality workflow to run on `wave/**` push refs and added the canonical query closure gate.
- `8fe006c197f43a4a27b3ae038353291a53418c7c`: added the canonical query closure regression guard.
- `dfeb68e1ce892539007d6319c8eee4b73a50d6b0`: added the canonical paginated inventory surface.
- `8bbf44159e621f652ce8b9717d1380c87b251de4`: migrated `/inventory` route to the canonical paginated surface.
- `369c35e2cd58303bafa3de20b3397d4833854efc`: strengthened the closure guard to record the remaining legacy inventory implementation explicitly.

## Current CI truth — exact-head discipline
- No CI PASS from a previous SHA is used to certify `369c35e2cd58303bafa3de20b3397d4833854efc`.
- Exact-head quality Run `32928998300` is the active certification run in this wave lineage. Its final conclusion must be checked against the exact SHA before promotion.
- The workflow now executes on `wave/**` pushes; its diagnostics gate requires `git rev-parse HEAD == GITHUB_SHA`, preventing a hidden merge-ref mismatch from being treated as exact-head evidence.
- PR merge SHA `0bf408645b52affaa0d44255db907497ffe158c8` is a merge-ref artifact, not the code-head certification SHA.

## Deep Data Truth — current verified changes
- Aging missing/invalid due dates remain explicit `UNDATED`; they are not silently coerced into `0-30`. fileciteturn4file0L2-L2
- BI engine rejects non-finite/negative numeric inputs in replenishment, customer/supplier scoring, liquidity, CCC, and rejects malformed what-if changes instead of propagating NaN/Infinity.
- Trend analysis sorts valid points chronologically before calculating direction/velocity/acceleration; invalid dates/values are excluded rather than becoming fake values.
- CCC returns `INSUFFICIENT_DATA` when revenue/COGS/purchases are unavailable, preserving fail-closed semantics. fileciteturn7file0L2-L2
- Heuristic confidence remains bounded but is not evidence of correctness; cross-surface provenance is still an open closure front.

## Document Intelligence — current verified changes
- Existing golden contract previously required only case labels. fileciteturn11file0L2-L2
- Corpus stores representative structured inputs, expected canonical fields, expected normalized values, evidence provenance, and minimum confidence per case.
- Cases cover Arabic/English, scanned OCR, random schema, headerless tables, complex tables, invoices/reconciliation, Onyx-style exports, and wide reports.
- Deep harness rejects a case when schema matches but normalized output, evidence provenance, or confidence is wrong.
- Real-file/OCR accuracy remains **NOT PRODUCTION-CERTIFIED** until actual corpus execution evidence exists.

## Decision / Outcome truth
- Business decision creation requires non-empty evidence IDs; evidence IDs are normalized/deduplicated; report construction filters to evidence-backed decisions. fileciteturn1file0L2-L4
- Outcome hardening requires known labels to carry finite expected/actual values and validates timestamps/numbers.
- Outcome in-memory dedupe matches persisted `company_id + recommendation_key` identity instead of `observedAt`.
- Outcome reads explicitly scope `company_id` in addition to RLS.
- Missing impact is `null`, and accuracy is `null` when there are no known outcomes; these are not represented as zero.
- Runtime outcome tracking remains LIVE REQUIRED.

## Tenant / Security truth
- Canonical browser resolver remains `resolveCurrentCompanyId()`; tenant legacy/static/client-selected boundary is guarded. fileciteturn1file0L2-L4
- Canonical import RPC wrapper verifies caller tenant context against the supplied company ID before executing entity RPCs. fileciteturn19file0L2-L2
- Deep indirect-path scan remains open for Storage, Realtime, AI/vector, exports/downloads, notifications/logs, and worker execution context.
- Static PASS is not runtime cross-tenant proof.

## Import / Reconciliation truth
- Canonical import validates the entire chunk before write and uses a tenant-resolved RPC transaction boundary; result counts/IDs are verified against submitted row count. fileciteturn17file0L2-L2
- Atomic wrapper uses canonical entity RPCs and rolls the chunk back if a row fails. fileciteturn19file0L2-L2
- Remaining deep work: duplicate-worker race, stale lease, crash after checkpoint, replay/rollback evidence, and live worker drill.

## Watched-folder / cross-platform
- Canonical watcher contract is reused across platforms with a single `WatchEvent`/queue boundary. Web/PWA are session-bound; Windows/Android persistent watching requires native adapters; iOS does not claim arbitrary persistent background folder watching. fileciteturn16file0L2-L2
- Folder processing computes a file digest before duplicate detection; the digest is guaranteed to be actual SHA-256 or the operation fails closed.

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
- Inventory UI now separates display pagination from business aggregation through the server-side snapshot RPC.
- Remaining deep work is repository-wide query/payload/concurrency testing and migration of remaining legacy unbounded consumers.

## Cross-Surface Equivalence
- Full BI ↔ Decision ↔ Analytics ↔ Export equivalence is **PARTIAL / OPEN**.
- Inventory is now anchored to the canonical report snapshot for the `/inventory` surface, but a complete equivalence matrix across Receivables, Profitability, BI, Decision, Analytics and Export still requires explicit invariant tests and shared fixtures.
- No cross-surface equality is claimed merely because multiple surfaces use RPCs.

## Receivables / Profitability
- Receivables: **OPEN** for deep canonical truth verification across DB→service→API→pagination→browser→cards/charts/export; no final certification claimed.
- Profitability: **OPEN** for financial truth contract covering revenue, cost, returns, cancelled/void, date boundaries, tenant, currency, rounding and missing inputs; no missing-evidence→zero certification claimed.

## Storage / Realtime / AI / Vector
- Static database tenant gates exist, but adversarial isolation of Storage, Realtime channels/payloads, vector metadata/retrieval caches and deletion consistency remains **LIVE REQUIRED**.
- No production security certification is inferred from DB RLS alone.

## Semantic contract sweep
Required distinctions remain mandatory across SQL, TypeScript, serializers, aggregators, charts, exports, BI and decisions:
`NULL`, `UNKNOWN`, `MISSING`, `EMPTY`, `ZERO`, `INSUFFICIENT_DATA`, `BLOCKED`, `LOW`, `PASS`, `FAIL`.

Rule: **absence of evidence ≠ evidence of absence**. Any implicit conversion that changes this meaning remains a finding until regression-enforced.

## LIVE REQUIRED — exact evidence still outstanding
1. Supabase adversarial tenant A/B read/write isolation across DB, Storage, Realtime, AI/vector, imports, reports, decisions, exports, downloads, workers and notifications.
2. Real backup restore + integrity/checksum verification + measured RPO/RTO + rollback drill.
3. Real worker crash/restart/duplicate/stale-lease/dead-letter/resume drill.
4. Persistent native watched-folder proof on Windows and Android; capability proof on iOS.
5. Authenticated UI E2E against real tenant-scoped data.
6. Real document corpus execution including OCR/PDF/XLSX/CSV and representative corrupt/ambiguous files.
7. Production telemetry trace from user action through job/database/evidence/report/decision/outcome.
8. Production load/canary and rollback evidence.
9. Browser/native Web Crypto availability matrix for all supported deployment targets.

## Capability status fields
For every capability, the authoritative state must distinguish: IMPLEMENTED, REGRESSION-ENFORCED, CONSUMER-VERIFIED, GATED, INTEGRATED, RUNTIME-EVIDENCED, LIVE-VERIFIED, PRODUCTION-CERTIFIED, REMAINING, BLOCKED BY, LIVE REQUIRED, PARALLEL WORK AVAILABLE, RISKS, LAST VERIFIED COMMIT, LAST VERIFIED CI, LAST TEST, LAST UPDATE. A commit alone never upgrades any evidence field.

## Completion truth
**Engineering completion remains conservative and below production certification.** The current wave has real code changes and an exact-head quality run in progress, but no final PASS is claimed for `369c35e2cd58303bafa3de20b3397d4833854efc` until the exact-head run concludes successfully. The project is **NOT PRODUCTION-CERTIFIED**. Runtime/LIVE evidence remains required for the listed production-specific assertions.
