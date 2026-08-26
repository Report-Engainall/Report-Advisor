# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth for this wave: PR #45 exact head `724e93c1724bdd85eeb8cc6b15677ac4b922a688` (base `4095e0f0d427652eb705ba3955389ae978d7b5bf`).

> نفصل IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED. لا يوجد promotion بدون evidence مطابق للـSHA.

## Current truth
- Historical baseline Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS; historical only. fileciteturn23file0L2-L5
- PR #45 base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Current code HEAD: `724e93c1724bdd85eeb8cc6b15677ac4b922a688`.
- Current exact-head quality status is **NOT OBSERVABLE** through the available GitHub status surface; no PASS is claimed.
- PR merge-ref Run `32928998300` failed on merge SHA `0bf408645b52affaa0d44255db907497ffe158c8`; it is not evidence for the current exact head.

## Active batch — Canonical Query / Inventory / Receivables / Worker Reliability
### FIND
- `@/lib/queries` still targeted removed `queries-compat.ts`.
- `/inventory` still had an unbounded browser aggregation consumer.
- `/reports/receivables` lacked one server-side snapshot truth for totals/aging/page rows.
- Quality topology assumed main-only push certification.
- Folder job state allowed `beginJob()` to be called again while already processing or after terminal completion/dead-letter, permitting duplicate starts or terminal resurrection.

### ROOT CAUSE
- Compatibility migration stopped before module-resolution topology.
- Inventory migration stopped before route boundary.
- Receivables had split query truth.
- CI exact-head execution was not independently observable for wave branches.
- Worker lifecycle contract lacked terminal/concurrent start guards; tests covered retry counts but not duplicate start/resurrection invariants.

### FIX
- `tsconfig.app.json` maps `@/lib/queries` to `src/lib/queries.ts`.
- `check-canonical-query-alias.mjs` prevents compatibility resurrection and verifies canonical route consumers.
- `/inventory` routes to `InventoryPageCanonical` backed by `report_inventory_snapshot`; business metrics are server-side and display pagination is bounded.
- Added `report_receivables_snapshot(p_page,p_page_size,p_as_of_date)` with `current_company_id()`, cancelled/void exclusion, explicit `UNDATED`, server aggregation and page cap 500.
- Added `receivables-truth.ts`, `ReceivablesReportPageCanonical`, route migration, and `check-receivables-truth-contract.mjs`.
- Quality workflow runs on `main` and `wave/**`; checkout diagnostics require `git rev-parse HEAD == GITHUB_SHA`; topology guard permits wave exact-head certification while keeping `quality.yml` as the canonical main gate.
- `folder-job-ledger.ts` now rejects duplicate `beginJob()` while processing and rejects resurrection from completed/dead-letter states.

### REGRESSION
- Canonical truth guard: compatibility absence + alias + exports + inventory/receivables route migration.
- Receivables contract: tenant authority + cancelled/void + UNDATED + server aggregation + bounded pagination + no missing financial input→zero coercion.
- `folder-job-ledger.test.ts`: duplicate concurrent start and terminal resurrection tests added; quality CI now runs this test explicitly.

### CONSUMER STATE
- `queries-compat.ts`: removed, no source consumer references.
- Inventory active route: migrated; old `EntityPages.InventoryPage` remains as a legacy implementation candidate and is not active.
- Receivables active route: migrated; old `ReportsPage.ReceivablesReportPage` remains as a legacy implementation candidate and is not active.
- Worker ledger: active state contract hardened; actual deployed concurrency/lease/recovery remains LIVE REQUIRED.

## Historical closure families retained
- BI hardening: `6b2d5365e3aac72c1de628f8a36825c9a3100e44`, regression `925c2eaae7271e3e9b036a917b7c8e303fd7d9f0`.
- Golden corpus: `0b38ced5460f666d99eeda1a79b6e01c2103cce4`, `18bb0cb0570fdae266a66abe7f585de7c1b275c1`, harness `09bdc60967e31db33641be3fda28e41a937c1310`, CI `1773cbd149a6a796f18fa30cc2796c9c57647d5b`.
- Outcome truth: `02bc5ae36f927be2d64bceaac65ab1c4f6f28ac8`, regressions `e3a1a19ba392fa9d3ac40f512e26bb11d506f9c3`, CI `d964973cd1f438ef2ed4ace0127c13bf82c2c18d`.
- File identity SHA-256: `d8d55f6c603a551ee70caa313a7a9f5eec3ab170`, vector regression `7dd65b6559c75c1a24dd6d1ff43fe21ed730c623`, CI `f522420759ba8bf5735504888a7dc37f860091d4`.
- Canonical query/CI topology: `5df3e26cd5890065d3bed886468f59ce80b93166`, `334426bdd2fbd236cc77b1f8205b05f8bf56e718`.
- Inventory canonical surface/route: `dfeb68e1ce892539007d6319c8eee4b73a50d6b0`, `8bbf44159e621f652ce8b9717d1380c87b251de4`.
- Receivables snapshot/adapter/page/route: `ab5b183725afe90a7900d91a2dac21f92b957491`, `5922890c0f2634f5c4d1f06c8a85dc9063de6b49`, `dc2c2816f6f83f1aa1cebf31074ea6f78c63e3b4`, `17532f3f31b7b7e0a26d3bb78e7d204cf58872d7`.
- Canonical truth regression: `0ed39bbb52c465948e4beb7811abf4381f24b217`; receivables CI gate `34689867198d14a6778ad21acb8cf8de56d6be9d`; current CI topology/test update `724e93c1724bdd85eeb8cc6b15677ac4b922a688`.

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
- Folder job ledger now rejects duplicate starts and terminal resurrection; regression is wired into quality CI.
- This is code-level lifecycle closure, not proof of deployed concurrency/lease behavior.
- Persistent Windows/Android watcher proof and iOS capability proof remain LIVE REQUIRED. fileciteturn16file0L2-L2

## Cross-Surface Equivalence
Status: **PARTIAL / OPEN**.
- Inventory is anchored to server-side snapshot truth.
- Receivables is now anchored to one server snapshot for metrics + page rows.
- Complete BI ↔ Decision ↔ Analytics ↔ Export equivalence remains unproven across all domains.
- Required equality dimensions: tenant, as-of/date, status/cancelled/void, records, totals, counts, NULL/UNKNOWN semantics, currency, aggregation semantics.

## Receivables
**IMPLEMENTED + REGRESSION-ENFORCED + ROUTE-CONSUMER-MIGRATED; EXACT-HEAD CI NOT VERIFIED.**
- Tenant authority comes from `current_company_id()`.
- Cancelled/canceled/void invoices are excluded.
- Missing due date remains `UNDATED`.
- Business metrics are computed before display pagination.
- Page size is bounded to 500.
- Full export equivalence and runtime large-dataset evidence remain open.

## Profitability
**OPEN.** Financial truth contract still requires explicit revenue/cost/quantity/discount/return/cancelled/void/date/tenant/currency/rounding semantics. Missing financial inputs must remain insufficient data, not implicit zero.

## Storage / Realtime / AI / Vector
**STATIC GATES ONLY / LIVE REQUIRED.** Need tenant object/channel/payload isolation, vector metadata filtering, retrieval-cache isolation and deletion consistency. DB RLS alone is insufficient proof.

## Semantic Contract
Required everywhere: `NULL`, `UNKNOWN`, `MISSING`, `EMPTY`, `ZERO`, `INSUFFICIENT_DATA`, `BLOCKED`, `LOW`, `PASS`, `FAIL`.

Rule: **absence of evidence ≠ evidence of absence**.

## Performance
- Inventory route separates display pagination from business aggregation.
- Receivables snapshot separates display pagination from business aggregation.
- Remaining repository-wide work: unbounded business reads, browser aggregation patterns, N+1, duplicate RPCs, index/query-plan validation, large-dataset failure-closed behavior.

## LIVE REQUIRED
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

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current code closures are real, but current exact-head CI is not observable through the available status surface, legacy implementations remain for explicit zero-consumer cleanup, cross-surface equivalence is partial, and runtime/live/production evidence remains outstanding.
