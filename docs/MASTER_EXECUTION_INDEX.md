# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth for this wave: PR #45 exact head `dfe4f98ace3f9a642cd9916f0882969f28831d09` (base `4095e0f0d427652eb705ba3955389ae978d7b5bf`). `main` remains the merge target.

> لا تُحسب الملفات/commits إنجازًا بحد ذاتها. نفصل implementation / regression / consumer verification / gate / integration / runtime / live certification.

## Mandatory execution rules
- افحص الفهرس والمستودع والعمل السابق قبل كل دفعة.
- Reuse/fix/consolidate قبل create؛ لا engines موازية.
- CI يعمل بالتوازي مع التنفيذ؛ exact-head CI حاجز شهادة وليس حاجز تنفيذ.
- failure-family batching: FIND → ROOT CAUSE → BATCH FIX → CONSUMER MIGRATION → REGRESSION → EXACT-HEAD CI → INDEX → RUNTIME.
- لا mock business data ولا fake runtime evidence ولا defaults تخفي missing data/tenant/security constraints.
- AI ليس مصدر الحقيقة المالية/الرقمية.
- PASS تاريخي لا يرفع capability على HEAD جديد.

## Current truth
- Historical baseline Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS; historical only. fileciteturn23file0L2-L5
- PR #45 base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Current exact code HEAD: `dfe4f98ace3f9a642cd9916f0882969f28831d09`.
- Current HEAD has no observable quality CI status through the available GitHub status surface. Therefore **NO EXACT-HEAD CI PASS IS CLAIMED**.
- PR merge-ref Run `32928998300` failed a topology guard on merge SHA `0bf408645b52affaa0d44255db907497ffe158c8`; that run is not exact-head certification for current HEAD.

## Batch closure — Canonical Query / Inventory / Receivables Truth
### FIND
1. TypeScript alias `@/lib/queries` still targeted removed `queries-compat.ts`.
2. `/inventory` still had an unbounded `fetchInventoryBalances()` browser aggregation consumer despite canonical `report_inventory_snapshot`.
3. `/reports/receivables` had separate aging and page-detail query paths; business truth was not a single bounded snapshot contract.
4. Quality topology certified PR merge refs, while exact-head branch certification was not independently observable.

### ROOT CAUSE
- Compatibility removal was incomplete at the module-resolution boundary.
- Inventory route migration had not crossed the UI boundary.
- Receivables had no single server-side source combining metrics and page rows under one tenant/date/status contract.
- CI topology lacked an independently certifiable wave-head execution path and its guard still assumed main-only push topology.

### FIX
- `tsconfig.app.json` now maps `@/lib/queries` directly to `src/lib/queries.ts`.
- Compatibility module remains removed; `check-canonical-query-alias.mjs` prevents resurrection.
- `/inventory` now routes to `InventoryPageCanonical`, backed by server-side metrics and bounded display pagination.
- Added `report_receivables_snapshot(p_page,p_page_size,p_as_of_date)` with `current_company_id()`, cancelled/void exclusion, explicit `UNDATED`, server-side aging/total metrics, and page-size cap 500.
- Added `receivables-truth.ts` and `ReceivablesReportPageCanonical`; `/reports/receivables` now uses the canonical snapshot route.
- Added `check-receivables-truth-contract.mjs` and wired it into quality CI.
- Quality runs on `main` and `wave/**`; checkout diagnostics require `git rev-parse HEAD == GITHUB_SHA`.
- CI topology guard now permits `wave/**` exact-head certification while keeping `quality.yml` as the only canonical main push gate.

### REGRESSION
- Canonical query guard verifies compatibility absence, canonical alias, canonical exports, inventory route, receivables route, adapter and migration.
- Receivables contract verifies tenant authority, cancelled/void semantics, `UNDATED`, server aggregation, bounded pagination, and no missing financial input → zero coercion.

### CONSUMER STATE
- `queries-compat.ts`: removed; no source references detected by the guard.
- Inventory active route consumer: migrated.
- Receivables active route consumer: migrated.
- `EntityPages.InventoryPage`: legacy implementation remains physically present but is no longer the active route; removal requires explicit zero-consumer proof and regression.
- `ReportsPage.ReceivablesReportPage`: legacy implementation remains physically present but is no longer the active route; removal requires explicit zero-consumer proof and regression.

## Historical implementation batches retained
- `6b2d5365e3aac72c1de628f8a36825c9a3100e44`: BI numeric/data-truth hardening.
- `925c2eaae7271e3e9b036a917b7c8e303fd7d9f0`: BI regression expansion.
- `0b38ced5460f666d99eeda1a79b6e01c2103cce4` / `18bb0cb0570fdae266a66abe7f585de7c1b275c1`: semantic golden corpus.
- `09bdc60967e31db33641be3fda28e41a937c1310`: semantic corpus regression harness.
- `1773cbd149a6a796f18fa30cc2796c9c57647d5b`: deep golden regression wired into CI.
- `02bc5ae36f927be2d64bceaac65ab1c4f6f28ac8`: outcome identity/tenant/missing-value hardening.
- `e3a1a19ba392fa9d3ac40f512e26bb11d506f9c3`: outcome regressions.
- `d964973cd1f438ef2ed4ace0127c13bf82c2c18d`: outcome regressions wired to CI.
- `d8d55f6c603a551ee70caa313a7a9f5eec3ab170`: true SHA-256 fail-closed identity.
- `7dd65b6559c75c1a24dd6d1ff43fe21ed730c623`: SHA-256 known-vector regression.
- `f522420759ba8bf5735504888a7dc37f860091d4`: SHA-256 regression wired to CI.
- `5df3e26cd5890065d3bed886468f59ce80b93166`: stale canonical-query alias root cause fix.
- `334426bdd2fbd236cc77b1f8205b05f8bf56e718`: wave exact-head CI topology.
- `dfeb68e1ce892539007d6319c8eee4b73a50d6b0`: canonical inventory surface.
- `8bbf44159e621f652ce8b9717d1380c87b251de4`: inventory route migration.
- `ab5b183725afe90a7900d91a2dac21f92b957491`: canonical receivables snapshot migration.
- `5922890c0f2634f5c4d1f06c8a85dc9063de6b49`: receivables truth adapter.
- `dc2c2816f6f83f1aa1cebf31074ea6f78c63e3b4`: canonical receivables page.
- `17532f3f31b7b7e0a26d3bb78e7d204cf58872d7`: receivables route migration.
- `0ed39bbb52c465948e4beb7811abf4381f24b217`: canonical truth guard expanded to inventory + receivables.
- `34689867198d14a6778ad21acb8cf8de56d6be9d`: receivables contract regression.
- `f2c417c701c029a3ee46f2f19714ce063abb849a`: quality CI receivables gate.
- `dfe4f98ace3f9a642cd9916f0882969f28831d09`: current evidence snapshot.

## Data Truth
- Aging missing/invalid due dates remain `UNDATED`, not `0-30`. fileciteturn4file0L2-L2
- BI rejects non-finite/negative invalid financial inputs and malformed what-if changes.
- Trend calculations order valid points chronologically and exclude invalid dates/values.
- CCC returns `INSUFFICIENT_DATA` when required inputs are unavailable. fileciteturn7file0L2-L2
- Missing impact/accuracy remain null rather than zero when evidence is insufficient.

## Tenant / Security
- Canonical browser resolver remains `resolveCurrentCompanyId()`. fileciteturn1file0L2-L4
- Canonical import RPC wrapper verifies caller tenant context before entity RPCs. fileciteturn19file0L2-L2
- Storage, Realtime, AI/vector, export/download, notification/log and worker indirect paths remain open for adversarial verification.
- Static RLS is not runtime cross-tenant proof.

## Import / Reconciliation
- Canonical import validates chunks before write and uses tenant-resolved RPC transaction boundaries. fileciteturn17file0L2-L2
- Atomic wrapper rolls back a chunk if a row fails. fileciteturn19file0L2-L2
- Remaining deep work: duplicate-worker race, stale lease, crash-after-checkpoint, replay/rollback and LIVE worker drill.

## Worker / Watched Folder
- Folder watcher computes SHA-256 before duplicate detection and fails closed if unavailable.
- `folder-job-orchestrator.ts` is a state model; actual concurrent worker/lease/recovery semantics remain runtime-required.
- Persistent Windows/Android watcher proof and iOS capability proof remain LIVE REQUIRED. fileciteturn16file0L2-L2

## Cross-Surface Equivalence
Status: **PARTIAL / OPEN**.
- Inventory `/inventory` and `/reports/inventory` are anchored to server-side inventory truth, but complete equivalence across Receivables, Profitability, BI, Decision, Analytics and Export is not yet regression-proven.
- Required equality dimensions: tenant, as-of/date, status/cancelled/void, records, totals, counts, NULL/UNKNOWN semantics, currency, aggregation semantics.
- No equivalence is claimed merely because multiple surfaces call RPCs.

## Receivables
Status: **IMPLEMENTED + REGRESSION-ENFORCED + ROUTE-CONSUMER-MIGRATED; EXACT-HEAD CI NOT VERIFIED**.
- Server snapshot owns aging and outstanding totals.
- `UNDATED` is explicit.
- Cancelled/canceled/void invoices are excluded from receivable truth.
- Display pagination is capped and cannot define totals.
- Full export equivalence and runtime large-dataset evidence remain open.

## Profitability
Status: **OPEN**.
- Financial truth contract still requires explicit revenue/cost/quantity/discount/return/cancelled/void/date/tenant/currency/rounding semantics.
- Missing financial inputs must remain insufficient data, not implicit zero.

## Storage / Realtime / AI / Vector
Status: **STATIC GATES ONLY / LIVE REQUIRED**.
- Need tenant path/object isolation, signed URL authorization, event-channel/payload isolation, vector metadata filtering, retrieval cache isolation and deletion consistency.
- DB RLS alone is insufficient proof.

## Semantic contract
Required everywhere:
`NULL`, `UNKNOWN`, `MISSING`, `EMPTY`, `ZERO`, `INSUFFICIENT_DATA`, `BLOCKED`, `LOW`, `PASS`, `FAIL`.

Rule: **absence of evidence ≠ evidence of absence**.

## Performance
- Inventory route now separates display pagination from business aggregation.
- Remaining repository-wide work: unbounded business reads, browser aggregation patterns, N+1, duplicate RPCs, index/query-plan validation, and large-dataset failure-closed behavior.

## Runtime / LIVE REQUIRED
1. Authenticated browser E2E with real tenant data.
2. Inventory dataset > page size with total invariants across pages.
3. Receivables dataset > page size with aging/total invariants across pages.
4. Tenant A/B adversarial DB/Storage/Realtime/AI/vector/export/worker drill.
5. Real worker crash/restart/duplicate/stale-lease/DLQ/resume drill.
6. Real backup restore + measured RPO/RTO + rollback.
7. Real OCR/PDF/XLSX/CSV corpus execution.
8. Production telemetry trace and load/canary/rollback.
9. Browser/native Web Crypto availability matrix.

## Capability status ladder
IMPLEMENTED → REGRESSION-ENFORCED → CONSUMER-VERIFIED → GATED → INTEGRATED → RUNTIME-EVIDENCED → LIVE-VERIFIED → PRODUCTION-CERTIFIED.

A commit alone never upgrades evidence. No current exact-head CI PASS, runtime evidence, or production certification is claimed for `dfe4f98ace3f9a642cd9916f0882969f28831d09`.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current engineering state is conservative; code closures above are real, but exact-head CI remains unobservable through the available status surface and the cross-surface/security/runtime fronts remain open.
