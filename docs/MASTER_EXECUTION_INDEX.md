# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9` is historical and is not used as current evidence.
- PR #45 current branch head at index update is `c7ff89da218e088e59337a1364035d78bbf33079` after the export-truth gate hardening batch.
- Base remains `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- PR #45 remains `mergeable=false`; this is repository/PR state, not an application defect without a proven cause.
- Exact-head workflow query for `d95769f1153993dd2489007f8bf16641327cb249` currently returns **no observable workflow run**. Therefore **NO CI PASS IS CLAIMED**.
- Quality workflow was previously hardened to checkout the PR head SHA rather than the synthetic merge ref; that remains pending an observable exact-head run.

## F35 — Financial semantic fail-closed sibling family
### FIND
Server-side report contracts could report `INSUFFICIENT_DATA` while still projecting partial numeric business totals from the valid subset.
### ROOT CAUSE
Quality state and numeric projection were independent. Partial aggregates survived when evidence was insufficient.
### FIX
`supabase/migrations/20260827131500_financial_truth_fail_closed.sql` makes profitability/dashboard/inventory financial values `NULL` when evidence is insufficient while retaining quality counters.
### REGRESSION
`check-profitability-truth-contract.mjs` and `check-effective-financial-truth-fail-closed.mjs` encode the fail-closed invariants and canonical service wiring.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CI PENDING.**

## F36 — CI consumer-gate false assumption + ReportsPage syntax regression
### FIND
Historical CI exposed a file-local consumer assumption and a real ReportsPage template-literal syntax failure.
### ROOT CAUSE
The regression gate checked the wrong file boundary; the page rewrite contained invalid template-literal escaping. Performance failure was downstream.
### FIX
ReportsPage was corrected and consumer validation follows the actual App route → canonical page topology.
### REGRESSION
Consumer validation is route/topology based rather than file-local symbol based.
### STATUS
**FIXED IN CODE; exact-head certification pending.**

## F37 — Export Truth regression gate
### FIND
The prior export gate claimed the three export classes were explicit but did not actually require exporters to declare a scope.
### ROOT CAUSE
The gate checked the manifest's existence but did not enforce a machine-readable classification on exporter implementations.
### FIX
`src/lib/free-toolbox/export-manifest.ts` now defines `ExportScope = CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET`; the generic report exporter is explicitly classified `CURRENT_VIEW`; `check-export-truth-contract.mjs` now requires scope declarations for exporter function implementations and verifies the manifest enum.
### REGRESSION
`test:export-truth` is already wired in `package.json`; execution on the new exact head is pending because no workflow run is observable yet.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED; EXACT-HEAD EXECUTION PENDING.**
### REMAINING
Complete repository-wide exporter inventory, classify every real export consumer, and add behavioral pagination→export proof for full/filtered dataset exports.

## F40 — Materialized report downloader lacked explicit export scope

### FIND
`src/lib/report-execution/download.ts` was a real browser exporter that materialized a supplied row set into a downloadable artifact, but it had no machine-readable `CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET` classification.

### ROOT CAUSE
The export gate relied primarily on named exporter-function patterns and manifest presence. `downloadReportArtifact()` is an exported function but its implementation shape did not match the gate's narrower classification requirement.

### FIX
Added an explicit `REPORT_DOWNLOAD_SCOPE: ExportScope = 'CURRENT_VIEW'` contract to the browser downloader and documented why the materialized-row API is intentionally a current-view exporter. The export gate was strengthened to inspect materializing download implementations and require an explicit scope declaration.

### REGRESSION
`test:export-truth` now fails closed when a materializing exporter lacks a declared scope, and explicitly verifies the browser report downloader classification.

### CONSUMERS
`ReportsPage.tsx` is the known consumer family for the report downloader: sales, inventory and profitability current-view exports pass page/materialized rows to the downloader. The downloader is presentation/export-only and is not a business-truth source.

### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-INVENTORIED; EXACT-HEAD CI PENDING.**

## F38 — Receivables consumer retry no-op
### FIND
The canonical Receivables UI retry handler previously performed a no-op state update and could leave React state unchanged.
### ROOT CAUSE
Fetch effect depended only on `page`; retry did not change a dependency.
### FIX
`retryNonce` is included in the fetch effect dependencies and incremented by retry.
### REGRESSION
`check-receivables-truth-contract.mjs` verifies retry re-fetch wiring and incomplete-row semantics.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED; EXACT-HEAD CI PENDING.**

## F39 — Analytics browser-truth sibling family
### FIND
Analytics contained independent browser-side RFM/ABC/Aging business calculations, allowing truth and pagination/date/NULL semantics to diverge from server truth.
### ROOT CAUSE
No single authoritative server contract for RFM/ABC; Aging bypassed the canonical Receivables snapshot.
### FIX
Added tenant-authoritative RFM/ABC RPCs, canonical analytics adapter, canonical Analytics pages, and removed the legacy Analytics page after route migration. Aging delegates to the Receivables snapshot.
### REGRESSION
Analytics contract gate covers tenant authority, cancelled/void exclusion, explicit insufficient-data state, canonical adapters, no raw business reads, no browser aggregation, and no legacy page import.
### CONSUMERS
`/analytics`, `/analytics/rfm`, `/analytics/abc`, `/analytics/aging` resolve through the canonical pages.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-MIGRATED / LEGACY-REMOVED; REGRESSION NOT EXECUTED ON CURRENT EXACT HEAD; CI PENDING.**

## Important correction — duplicate financial-truth attempt
A temporary local `financialTruth.ts` implementation was created during execution, then immediately removed after tracing the existing canonical DB truth and `fetchProfitabilityTruth()` adapter. The attempted duplicate was therefore **not retained as a second source of truth**. The existing `report_profitability_truth` SQL contract remains authoritative for report profitability. `financialIntelligence.ts` remains an un-migrated legacy-capable local calculator and is explicitly **PARALLEL WITH CAUTION**, pending zero-consumer proof and/or migration to the canonical service; it is not claimed closed.

## Receivables
**IMPLEMENTED + REGRESSION-WIRED + ROUTE-CONSUMER-MIGRATED; EXACT-HEAD CI PENDING.**
- Server-side snapshot truth.
- Session-derived tenant authority.
- Cancelled/canceled/void exclusion.
- `UNDATED` and incomplete evidence retained explicitly.
- Metrics independent of display pagination.
- Canonical route consumer and retry re-fetch.
- Aging Analytics reuses Receivables truth.
- Remaining: >page-size runtime proof, full export equivalence, cross-surface equivalence.

## Profitability
**PARTIAL / FAIL-CLOSED IMPLEMENTATION + REGRESSION-WIRED; EXACT-HEAD CI PENDING.**
- Missing cost/incomplete/multi-currency evidence fails closed to `NULL` business totals.
- Reports route consumes `fetchProfitabilityTruth()`.
- Remaining: complete discounts/returns/currency/rounding/source-record contract, sibling consumer migration, and cross-surface equivalence.

## Tenant / Security
- Browser authority uses `resolveCurrentCompanyId()` where applicable.
- Sensitive server paths derive tenant authority server-side in covered families.
- **OPEN:** Storage, Realtime, AI/vector, export/download, worker/cache indirect-path sweep and adversarial A/B runtime proof.

## Worker / Reliability
- Deterministic stage idempotency and recovery boundary exist in covered runners.
- Automatic retry is restricted after side-effect/recovery boundaries.
- **LIVE REQUIRED:** real crash/restart, stale lease, duplicate worker, DLQ and replay drills.

## Cross-Surface Equivalence
**OPEN.** Canonical sources now cover dashboard/inventory/receivables/profitability and RFM/ABC/Aging analytics, but there is no exact-data runtime proof that BI = Decision = Analytics = Export under identical tenant/date/as-of/status/NULL/currency/source-record semantics.

## Export Truth
**PARTIAL.** Scope classification is now machine-enforced for exporter implementations encountered by the gate. Full repository consumer inventory and behavioral full/filtered dataset export proof remain open. Generic formatting is not treated as truth-source integration.

## Semantic NULL / UNKNOWN sweep
**ACTIVE.** Known fail-closed families include missing financial cost, incomplete financial evidence, incomplete receivables, and analytics insufficient-data semantics. Repository-wide implicit conversion sibling scan remains open.

## Storage / Realtime / AI / Vector
**STATIC GATES ONLY / LIVE REQUIRED.** Required evidence: object path/signed URL authorization, realtime channel/payload isolation, vector metadata/retrieval/cache/deletion isolation.

## Runtime / LIVE
**NO RUNTIME EVIDENCE.** CI/static checks do not substitute for authenticated browser, tenant A/B, worker recovery, storage/realtime/vector, real document corpus, backup/restore or production telemetry evidence.

## Production Certification
**NOT PRODUCTION CERTIFIED.**

## Next active fronts
1. Observe exact-head CI for `d95769f1153993dd2489007f8bf16641327cb249`; record only matching-SHA evidence.
2. Execute `test:export-truth`, `test:analytics-truth`, `test:receivables-aging-truth`, and profitability gates on the exact head when observable.
3. Complete exporter consumer-family inventory and classify current-view/full/filtered-full behavior.
4. Build invariant-level BI ↔ Decision ↔ Analytics ↔ Export equivalence regression.
5. Continue NULL/UNKNOWN/MISSING/EMPTY/ZERO sibling sweep.
6. Continue tenant indirect-path sweep across Storage/Realtime/AI/vector/Exports/Workers/Caches.
7. Complete worker state-machine/recovery sibling sweep and LIVE harness.
8. Prepare authenticated runtime proof for pagination/as-of/tenant and export invariants.

## Exact-head export batch evidence
- Code change commit: `edd608a07edd79a248cdc36bd1146db22048d00d`.
- Gate hardening commit / current exact head: `c7ff89da218e088e59337a1364035d78bbf33079`.
- Exact-head workflow query for `c7ff89da218e088e59337a1364035d78bbf33079`: **NO OBSERVABLE WORKFLOW RUN** at index update time.
- Therefore this batch is **NOT CI-CERTIFIED** and is not promoted beyond regression-wired/consumer-inventoried.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** The current wave contains real canonicalization and regression hardening, but exact-head CI execution, runtime/live evidence, cross-surface behavioral equivalence, and production evidence remain outstanding.