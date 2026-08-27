# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Historical requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9`; it is not current evidence.
- Current PR #45 exact head: `860cdf263986945bdc2b2e7c90c6d1a6da760ef8`.
- Base remains `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- PR #45 remains `mergeable=false`; this remains repository/PR state, not an application defect without a proven cause.
- Exact-head CI for previous head `1e28db7d7cfa21c2eacabf34f271742a1993d5ad`: Run `33080547773`, Job `98546251790`, exact SHA matched, **FAIL** at `Receivables truth contract` step. This is a real regression failure, not flaky evidence.
- Current exact head `860cdf263986945bdc2b2e7c90c6d1a6da760ef8` currently has **NO OBSERVABLE WORKFLOW RUN**. Therefore no PASS is claimed for it.

## F42 — Receivables snapshot empty-page / incomplete-evidence contract
### FIND
The canonical Receivables snapshot originally returned zero rows for an out-of-range page, causing the adapter to lose server-calculated metadata and default business metrics to zero. The same contract also had to retain incomplete financial rows instead of silently filtering them.

### ROOT CAUSE
The SQL result shape was `page CROSS JOIN metrics`; when `page` was empty, no row survived, so the browser could not receive `totalRows`, `status`, or aggregate metadata. The older migration also filtered `total IS NULL` / `paid_amount IS NULL`, turning missing financial evidence into absence of records.

### FIX
Added `20260827150000_receivables_snapshot_empty_page_truth.sql` and `20260827152000_receivables_financial_completeness_contract.sql`. The canonical contract now emits a metrics-only row when the requested page is empty, retains incomplete records as `INCOMPLETE`, reports `INSUFFICIENT_DATA` when incomplete evidence exists, and keeps tenant authority on `current_company_id()`.

### CONSUMERS
`ReceivablesReportPageCanonical` remains the real route consumer. It consumes server metrics, does not derive Business Truth from page rows, exposes incomplete-data warnings, and has a real retry dependency through `retryNonce`.

### REGRESSION
Added `scripts/check-receivables-empty-page-contract.mjs` and updated `check-receivables-truth-contract.mjs` to validate the current financial-completeness migration.

### EXACT-HEAD CI
Previous exact head `1e28db7...` failed at the old truth gate because it still inspected `20260826110000_report_receivables_snapshot.sql`, while the new contract lived in a later migration. Root cause was **stale regression contract / migration target**, not the new business rule itself. The gate was corrected in commit `860cdf263986945bdc2b2e7c90c6d1a6da760ef8`.

### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-VERIFIED STATICALLY; EXACT-HEAD CI PENDING.**

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

## F37/F40 — Export Truth family
### FIND
The export gate did not require concrete exporter implementations to declare `CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET` scope.
### FIX
Exporter scope is now machine-enforced, including the materialized report downloader classification. The known `ReportsPage` downloader consumers are current-view exporters and are not business-truth sources.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-INVENTORIED; EXACT-HEAD CI PENDING.**
### REMAINING
Complete repository-wide exporter inventory and behavioral pagination→export proof for full/filtered dataset exports.

## F38 — Receivables consumer retry
### FIND
Canonical Receivables retry previously performed a no-op state update.
### ROOT CAUSE
Fetch effect depended only on `page`.
### FIX
`retryNonce` is included in the fetch effect dependencies and incremented by retry.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED; exact-head CI pending.**

## F39 — Analytics browser-truth sibling family
### FIND
Analytics contained independent browser-side RFM/ABC/Aging business calculations.
### FIX
Added tenant-authoritative RFM/ABC RPCs, canonical analytics adapter/pages, and Aging delegation to Receivables truth; legacy Analytics page was removed after route migration.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-MIGRATED / LEGACY-REMOVED; exact-head execution pending.**

## F41 — Zero-consumer legacy financial intelligence calculator
### FIND
`src/lib/intelligence/financialIntelligence.ts` remained as a parallel local financial calculator after canonical report profitability truth existed.
### ZERO-CONSUMER PROOF
Repository search found no runtime/page/service/RPC consumer of `buildFinancialIntelligence`; static zero-consumer evidence was established.
### FIX
Deleted `src/lib/intelligence/financialIntelligence.ts` in commit `697633f0f9281c06c324fe3c4ad5e48560d74ac5`.
### STATUS
**REMOVED / ZERO-CONSUMER-PROVEN; exact-head CI pending.**

## Receivables
**IMPLEMENTED + REGRESSION-WIRED + ROUTE-CONSUMER-MIGRATED; EXACT-HEAD CI PENDING.**
- Server-side snapshot truth.
- Session-derived tenant authority.
- Cancelled/canceled/void exclusion.
- `UNDATED` and `INCOMPLETE` evidence retained explicitly.
- Aggregate metrics independent of display pagination, including empty pages.
- Canonical route consumer and retry re-fetch.
- Aging Analytics reuses Receivables truth.
- Remaining: runtime >page-size proof, full export equivalence, cross-surface equivalence.

## Profitability
**PARTIAL / FAIL-CLOSED IMPLEMENTATION + REGRESSION-WIRED; EXACT-HEAD CI PENDING.**
- Missing cost/incomplete evidence fails closed to `NULL` business totals.
- Reports route consumes canonical profitability truth.
- Remaining: complete discounts/returns/currency/rounding/source-record contract, sibling consumer migration, cross-surface equivalence.

## Tenant / Security
- Browser/server authority is covered in several canonical families.
- **OPEN:** Storage, Realtime, AI/vector, export/download, worker/cache indirect-path sweep and adversarial A/B runtime proof.

## Worker / Reliability
- Deterministic stage idempotency and recovery boundaries exist in covered runners.
- **LIVE REQUIRED:** real crash/restart, stale lease, duplicate worker, DLQ and replay drills.

## Cross-Surface Equivalence
**OPEN.** Canonical sources cover dashboard/inventory/receivables/profitability and analytics, but there is no exact-data runtime proof that BI = Decision = Analytics = Export under identical tenant/date/as-of/status/NULL/currency/source-record semantics.

## Export Truth
**PARTIAL.** Scope classification is machine-enforced for encountered exporter implementations. Full repository consumer inventory and behavioral full/filtered dataset export proof remain open.

## Semantic NULL / UNKNOWN sweep
**ACTIVE.** Known fail-closed families include missing financial cost, incomplete financial evidence, incomplete receivables, and analytics insufficient-data semantics. Repository-wide implicit conversion sibling scan remains open.

## Storage / Realtime / AI / Vector
**STATIC GATES ONLY / LIVE REQUIRED.** Required evidence: object path/signed URL authorization, realtime channel/payload isolation, vector metadata/retrieval/cache/deletion isolation.

## Runtime / LIVE
**NO RUNTIME EVIDENCE.** CI/static checks do not substitute for authenticated browser, tenant A/B, worker recovery, storage/realtime/vector, real document corpus, backup/restore or production telemetry evidence.

## Production Certification
**NOT PRODUCTION CERTIFIED.**

## Exact-head CI evidence
- `1e28db7d7cfa21c2eacabf34f271742a1993d5ad` → Run `33080547773` → Job `98546251790` → **FAIL** at `Receivables truth contract`.
- `860cdf263986945bdc2b2e7c90c6d1a6da760ef8` → **NO OBSERVABLE RUN** at index update time.
- No previous SHA PASS is reused.

## Next active fronts
1. Observe exact-head CI for `860cdf263986945bdc2b2e7c90c6d1a6da760ef8` and repair any next failure at root cause.
2. Execute/export-gate the newly added Receivables empty-page/incomplete contract on the exact head.
3. Complete exporter consumer-family inventory and classify current-view/full/filtered-full behavior.
4. Build invariant-level BI ↔ Decision ↔ Analytics ↔ Export equivalence regression.
5. Continue NULL/UNKNOWN/MISSING/EMPTY/ZERO sibling sweep.
6. Continue tenant indirect-path sweep across Storage/Realtime/AI/vector/Exports/Workers/Caches.
7. Complete worker state-machine/recovery sibling sweep and LIVE harness.
8. Prepare authenticated runtime proof for pagination/as-of/tenant/export invariants.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current wave has real canonicalization and regression hardening, but exact-head CI, runtime/live evidence, cross-surface behavioral equivalence, and production evidence remain outstanding.
