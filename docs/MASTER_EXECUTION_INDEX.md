# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9` — historical index commit; its own recorded code HEAD was `a21869e5dc3c958143dbe188b187b2666d151483`. No PASS from it is reused.
- Repository state has advanced beyond that historical SHA. PR #45 is currently open on branch `wave/parallel-compat-closure-20260826` with exact head `01020d2c50c457fde6ba64c5a6b494512fd79df9`.
- Base remains `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- PR #45 is currently `mergeable=false`; this is recorded as repository/PR state, not classified as an application defect without a proven cause.
- Exact-head workflow/status query for `01020d2c50c457fde6ba64c5a6b494512fd79df9` currently returns **no observable workflow run and no status checks**. Therefore **NO CI PASS IS CLAIMED** for the current HEAD.
- Quality workflow was hardened so PR runs checkout `github.event.pull_request.head.sha` rather than the synthetic PR merge ref, and diagnostics compare against that exact resolved head. This closes the prior assurance gap but remains **CI-PENDING** until an actual run proves it.

## F35 — Financial semantic fail-closed sibling family
### FIND
Server-side report contracts could report `INSUFFICIENT_DATA` while still projecting partial numeric business totals from the valid subset.
### ROOT CAUSE
Quality state and numeric projection were independent. Partial aggregates survived even when evidence was insufficient.
### FIX
`supabase/migrations/20260827131500_financial_truth_fail_closed.sql` and the later effective override make profitability/dashboard/inventory financial values `NULL` when evidence is insufficient, while retaining explicit quality counters.
### REGRESSION
`check-profitability-truth-contract.mjs` and `check-effective-financial-truth-fail-closed.mjs` require fail-closed projection markers and canonical service wiring.
### STATUS
**IMPLEMENTED / REGRESSION-ENFORCED / CI PENDING.**

## F36 — CI consumer-gate false assumption + ReportsPage syntax regression
### FIND
Historical exact-head CI exposed a file-local consumer assumption and a real ReportsPage template-literal syntax failure.
### ROOT CAUSE
The regression gate checked the wrong file boundary; the page rewrite contained escaped template-literal delimiters. Performance failure was downstream of the build failure.
### FIX
ReportsPage was corrected and the consumer gate now follows the actual App route → `ReceivablesReportPageCanonical` topology.
### REGRESSION
Consumer validation is route/topology based rather than file-local symbol based.
### STATUS
**FIXED IN CODE; exact-head certification pending.**

## F37 — Export Truth regression gate
### FIND
Export capability lacked a dedicated repository-wide regression gate proving that ambiguous `exportAll` APIs and pagination-dependent client aggregation do not silently become truth exports.
### ROOT CAUSE
Existing export manifest and export utilities described report output, but there was no dedicated pattern-level gate scanning the complete source tree for ambiguous export naming and pagination/client-aggregation coupling.
### FIX
Added `scripts/check-export-truth-contract.mjs` and wired it into `package.json` as `test:export-truth`.
### REGRESSION
The gate scans for ambiguous export names and suspicious pagination/export coupling and verifies the export manifest contract.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED; exact-head execution pending.**

## F38 — Receivables consumer retry no-op
### FIND
The canonical Receivables UI error retry handler performed a no-op state update and could leave React state unchanged, so retry did not reliably re-execute the canonical RPC.
### ROOT CAUSE
The fetch effect depended only on `page`; retry did not change any dependency.
### FIX
Added `retryNonce` state, included it in the fetch effect dependencies, and increment it from the retry handler. The UI also exposes `incompleteRows` evidence instead of treating missing financial fields as zero.
### REGRESSION
`check-receivables-truth-contract.mjs` verifies the retry nonce dependency, retry increment, incomplete-row rendering, and rejects the former no-op retry pattern.
### STATUS
**IMPLEMENTED / REGRESSION-ENFORCED; exact-head CI pending.**

## F39 — Analytics browser-truth sibling family (RFM / ABC / Aging)
### FIND
`src/pages/AnalyticsPage.tsx` contained three independent browser-side business-truth implementations: paginated/unbounded invoice reads plus `reduce()` for RFM, direct sale-item aggregation for ABC, and direct invoice aggregation for Aging. This duplicated truth outside the canonical server layer and allowed page/date/NULL semantics to diverge from Reports/Receivables.
### ROOT CAUSE
Analytics had no single authoritative server contract for RFM/ABC, while Aging had an existing canonical Receivables snapshot that the Analytics surface was bypassing.
### FIX
- Added `supabase/migrations/20260827180000_analytics_truth.sql` with tenant-authoritative `report_rfm_snapshot(date)` and `report_abc_snapshot()` RPCs.
- Added `src/lib/analytics-truth.ts` as the canonical adapter boundary; Aging delegates to `fetchReceivablesReportSnapshot()`.
- Added `src/pages/AnalyticsCanonicalPages.tsx` and migrated all three runtime routes in `src/App.tsx`.
- Removed `src/pages/AnalyticsPage.tsx` after the runtime consumer was migrated.
- Added `scripts/check-analytics-truth-contract.mjs` and `test:analytics-truth`.
- Made RFM/Aging `as-of` dates explicit and deterministic in the adapter instead of passing `NULL` and relying on a default that would not apply.
### REGRESSION
The new gate proves tenant authority, cancelled/void exclusion, explicit `INSUFFICIENT_DATA`, canonical RPC adapters, no raw business reads in the Analytics UI, no browser aggregation, and no legacy `AnalyticsPage` import in `App.tsx`.
### CONSUMERS
`/analytics`, `/analytics/rfm`, `/analytics/abc`, `/analytics/aging` now resolve through `AnalyticsCanonicalPages`.
### STATUS
**IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-MIGRATED / LEGACY-REMOVED; exact-head CI pending.**
### REMAINING
Runtime proof with real datasets, cross-surface equivalence against BI/Decision/Export, and production evidence remain open.

## Receivables
**IMPLEMENTED + REGRESSION-ENFORCED + ROUTE-CONSUMER-MIGRATED; EXACT-HEAD CI PENDING.**
- Server-side snapshot truth.
- Session-derived tenant authority.
- Cancelled/canceled/void exclusion.
- `UNDATED` and `INCOMPLETE` retained explicitly.
- Metrics independent of display pagination.
- Route consumer is canonical `ReceivablesReportPageCanonical`.
- Real UI retry re-fetches the canonical source after transient failure.
- Aging Analytics now reuses the same receivables truth.
- Remaining: full export equivalence, >page-size runtime proof, cross-surface equivalence.

## Profitability
**PARTIAL / FAIL-CLOSED IMPLEMENTATION + REGRESSION-ENFORCED; EXACT-HEAD CI PENDING.**
- Missing cost/evidence no longer becomes financial zero.
- Incomplete or multi-currency canonical report returns `NULL` business totals with `INSUFFICIENT_DATA`.
- Reports route consumes `fetchProfitabilityTruth()`.
- Remaining: full discount/return/currency/rounding/source-record contract and cross-surface equivalence.

## Tenant / Security
- Browser authority: `resolveCurrentCompanyId()`.
- Inventory intelligence and alternative-group sensitive RPCs derive tenant server-side.
- Import wrapper validates session tenant at the execution boundary.
- Storage, Realtime, AI/vector, export/download, worker and cache indirect paths remain **LIVE REQUIRED**.

## Worker / Reliability
- Deterministic stage idempotency key and recovery boundary exist.
- Automatic retry is blocked after side-effect/recovery boundary; manual reconciliation is explicit.
- Folder job ledger rejects duplicate concurrent starts and terminal resurrection.
- **LIVE REQUIRED:** actual crash/restart, stale lease, duplicate worker, DLQ and replay drill.

## Cross-Surface Equivalence
**OPEN.** Canonical sources now cover dashboard/inventory/receivables/profitability and RFM/ABC/Aging analytics, but there is still no runtime proof that `BI = Decision = Analytics = Export` under identical tenant/date/as-of/status/NULL/currency/source-record semantics. Aging is structurally converged with Receivables; full equivalence remains unproven.

## Export Truth
**PARTIAL.** Dedicated pattern-level regression gate is implemented. Full consumer-family migration and real pagination→export equivalence proof remain open. The generic `report-export.ts` formatter is not by itself evidence of truth-source integration.

## Semantic NULL / UNKNOWN sweep
**ACTIVE.** Confirmed/fixed families include missing cost→zero, missing receivable fields→row loss, incomplete financial evidence→partial numeric projection, missing outcome evidence→zero, and Analytics RFM/ABC fail-closed projection. Repository-wide sibling scan remains open.

## Storage / Realtime / AI / Vector
**STATIC GATES ONLY / LIVE REQUIRED.** Required evidence: object path/signed URL authorization, realtime channel/payload isolation, vector metadata/retrieval/cache/deletion isolation.

## Runtime / LIVE
**NO RUNTIME EVIDENCE.** CI/static fixes do not substitute for authenticated browser, tenant A/B, worker crash/recovery, storage/realtime/vector, real document corpus, backup/restore or production telemetry evidence.

## Production Certification
**NOT PRODUCTION CERTIFIED.**

## Exact-head CI rule
Only CI whose tested checkout/head SHA exactly equals the current Code HEAD can promote a capability to `CI-GATED`. Historical PASSes remain historical.

## Next active fronts
1. Observe exact-head CI for `01020d2c50c457fde6ba64c5a6b494512fd79df9`; record only matching-SHA evidence.
2. If CI fails, extract the first independent root cause and fix it before rerun.
3. Expand Export Truth from pattern gate to complete consumer-family inventory and pagination regression.
4. Build BI ↔ Decision ↔ Analytics ↔ Export equivalence contract with invariant-level regression.
5. Continue repository-wide NULL/UNKNOWN/MISSING/EMPTY/ZERO sibling sweep.
6. Continue tenant-sensitive RPC and indirect-path sweep across Storage/Realtime/AI/vector/Exports/Workers.
7. Complete worker failure-state/recovery sibling sweep and LIVE harness.
8. Prepare authenticated runtime evidence for Analytics pagination/as-of/tenant invariants and Receivables > page-size behavior.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current wave contains real analytics canonicalization, legacy removal, CI exact-head topology hardening, and regression wiring. Current HEAD has no observable exact-head CI run/status yet, and runtime/live/production evidence remains outstanding.
