# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `wave-next-cross-surface-closure` until merged; baseline `main` was `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

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
- Baseline CI closure at `25eef5212dbc63d2255ad7998e76c3d02a5191cf` was verified by quality Run `32910806786` = PASS.
- Repository main had advanced beyond the user-provided `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`; the actual inspected main head was `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- This batch adds a real domain/RPC migration for the five secondary sales analytics consumers; its exact-head CI is pending until the PR run completes.

## Remaining Work Inventory — 2026-08-26
| Class | Capability | Current state | Can execute now? | Dependency | LIVE required? | Risk |
|---|---|---|---|---|---|---|
| A | BI numeric/data-truth hardening | IMPLEMENTED, regression gated | YES | none | No for code/tests | Medium |
| A | Secondary sales analytics canonical migration | IMPLEMENTED, regression added, CI PENDING | YES | exact-head CI | No for code/tests | High |
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
| C | Cross-surface business truth equivalence | PARTIAL | YES | canonical consumer migration | High |
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
| Data Truth/BI | 🟢 PARALLEL NOW | none | YES | High | No for unit/integration | `src/lib/businessIntelligenceEngines.ts`, canonical analytics RPC | Fail-closed business truth |
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
- `25eef5212dbc63d2255ad7998e76c3d02a5191cf`: CI closure index update; quality Run `32910806786` PASS.
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
- `bc3d519225252d08988ade745a68a0f3880a2694`: introduced the canonical tenant-aware secondary sales analytics RPC.
- `6e8a45fce43fa89927e69eba1709f5d4ffb6de2e`: migrated secondary consumers to the canonical RPC and shared the in-flight request path.
- `002999671ce53cc011eeab073d138b98f26b667d`: added behavioral/contract regression coverage for secondary consumer canonicalization and pagination independence.

## Current CI truth
- Verified baseline: Run `32910806786`, head `25eef5212dbc63d2255ad7998e76c3d02a5191cf`, quality `success`.
- Latest main head before this batch: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Current branch head: `002999671ce53cc011eeab073d138b98f26b667d`.
- Exact-head quality CI for `002999671ce53cc011eeab073d138b98f26b667d`: **PENDING**; no PASS claim is made before the PR run completes.
- The batch regression itself is committed and will be executed by CI; runtime/live evidence remains separate.

## Secondary Consumer Data Truth Closure
### FOUND
Five real secondary business consumers were found behind the compatibility import boundary: `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, `fetchCategoryBreakdown`, `fetchAgingBuckets`. The old implementation queried business tables directly and performed browser aggregation.

### ROOT CAUSE
The secondary functions in `src/lib/queries.ts` were page-facing legacy implementations. They had no single domain aggregation boundary, could repeat large client scans, and were not explicitly bound to the canonical tenant/date/status contract.

### IMPLEMENTED
- Added `public.get_sales_secondary_metrics(...)` as a domain-level server aggregate.
- Server authority is `public.current_company_id()`; a supplied company id is compatibility-only and must match the trusted context.
- Status semantics exclude `cancelled` and `void` consistently.
- Date range is explicit and validated (`p_from <= p_to`).
- Monthly trend is server-side and bounded to the requested month window.
- Top customers/products and category breakdown are server-side aggregates with bounded limits.
- Aging is server-side and uses an explicit as-of date (`p_to` or `current_date`).
- Category profit is fail-closed when cost is incomplete: it returns `null` rather than inventing zero.
- RPC execution is restricted to `authenticated` and defaults to `SECURITY INVOKER`, preserving RLS instead of bypassing it.
- `queries-compat.ts` now exposes canonical adapters; no secondary consumer directly queries sales business tables.
- Concurrent dashboard calls share one in-flight canonical RPC request for the same tenant/month/limit key, preventing five duplicate network/database calls during the initial dashboard load.

### REGRESSION
`scripts/check-secondary-consumer-canonical.mjs` proves:
- all five secondary consumers are present behind the canonical adapter;
- only one shared canonical RPC call site exists in the secondary boundary;
- secondary consumers contain no direct sales/customer/product business-table access;
- no display pagination primitive is used for business aggregation;
- the SQL contract contains tenant authority/mismatch, status, date, limit, monthly aggregation, and grouped aging invariants;
- a 101-record fixture demonstrates that a 20-row page cannot equal the canonical all-record total.

### SECURITY
The new RPC is `SECURITY INVOKER`; it does not use a privileged definer boundary. It validates the trusted tenant context and is explicitly granted only to `authenticated`. No client-selected tenant can change the aggregation authority without matching `current_company_id()`.

### PERFORMANCE
The old five consumers each performed direct browser/database reads. The new adapter shares one in-flight RPC for the common dashboard request, removing duplicate concurrent scans. The server performs aggregation instead of returning all rows for browser reduction. No production latency claim is made without runtime measurement.

### CONSUMER STATUS
- Dashboard secondary consumers: **IMPLEMENTED + REGRESSION + CI PENDING**.
- Legacy implementations in `src/lib/queries.ts`: still present for compatibility and not deleted yet; removal requires exact zero-consumer proof after CI and repository-wide import verification.
- Cross-surface equivalence: **PARTIAL** because exports and decision consumers require their own source-path migration and runtime equivalence proof.

## Cross-surface / Export / Decision Closure
- Cross-surface: **PARTIAL** — this batch closes the dashboard secondary domain path, but does not claim exports/decisions are canonical until their concrete consumers are migrated and regressed.
- Export truth: **PARTIAL** — requires repository-wide export consumer migration and behavior regression.
- Decision metric truth: **PARTIAL** — existing evidence/outcome hardening is present, but metric source equivalence with dashboard/report/export still needs concrete consumer closure.
- Date/status equivalence: **PARTIAL** — the new sales analytics RPC has explicit semantics; other domains still require sibling consumer verification.
- Tenant authority: **IMPLEMENTED STATICALLY for this new RPC; LIVE A/B verification remains required.**

## Document / Import / Worker / Watcher / Backup / Observability
- Document Intelligence: existing static contracts/regressions remain gated; real OCR/PDF/XLSX/CSV corpus execution is LIVE REQUIRED.
- Import/Worker/Watcher: existing canonical contracts remain in force; local hardening can continue, while crash/replay/native watcher proofs remain LIVE REQUIRED.
- Backup/Restore: manifests/recovery contracts remain; actual restore/RPO/RTO evidence remains LIVE REQUIRED.
- Observability: existing trace contracts remain; end-to-end production telemetry remains LIVE REQUIRED.

## Architecture / Legacy
- Canonical architecture is now domain → RPC/service → consumer for the five secondary sales analytics.
- No page-specific canonical function was created.
- Legacy query implementations are deliberately retained until consumer-zero proof and regression-backed removal are completed.
- No destructive migration was performed.

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
For every capability, the authoritative state must distinguish: IMPLEMENTED, GATED, INTEGRATED, RUNTIME EVIDENCE, PRODUCTION EVIDENCE, REMAINING, BLOCKED BY, LIVE REQUIRED, PARALLEL WORK AVAILABLE, RISKS, LAST VERIFIED COMMIT, LAST VERIFIED CI, LAST TEST, LAST UPDATE. A commit alone never upgrades any evidence field.

## Completion truth
**This batch is implemented and regression-committed, but exact-head CI is pending.** The project is **NOT production-certified**. CI Green is a gate, not production proof.
