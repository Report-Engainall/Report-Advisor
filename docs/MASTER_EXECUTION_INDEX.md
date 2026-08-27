# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Historical requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9`; it is not current evidence.
- Current PR #45 code head before this index update: `5b36667a7c9ea635e31ea5250fbf8eae51c14921`.
- Base remains `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- PR #45 remains `mergeable=false`; this remains repository/PR state, not an application defect without a proven cause.
- Exact-head CI `33082118547` / Job `98551856720` on `ecaaffbc5487316611ef4d131c3753ff0e8d5115`: **FAIL** at Performance budget. Root cause: `perf:budget` reads `dist/index.html` before the workflow's Build step creates `dist/`. This is a CI topology/order defect, not evidence of an actual measured budget violation.
- The same run proved the preceding truth/security gates through `Production release blockers`; all those completed successfully on exact SHA `ecaaffbc...`. The later Typecheck/Lint/Build/regression stages were skipped because Performance budget failed first.
- Fix committed in `5b36667a7c9ea635e31ea5250fbf8eae51c14921`: move Typecheck → Lint → Build before Performance budget, so the performance gate measures the artifact produced by the exact-head Build.
- Exact-head CI for `5b36667a...` was not yet observable at this index update time. Therefore no PASS is claimed for that SHA.

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

## F37/F40/F43 — Export Truth family and gate-detector closure
### FIND
The export gate needed explicit scope declarations, but the initial detector treated ordinary consumer calls such as `downloadReportArtifact(...)` as exporter implementations. This caused real CI failures even though the known exporter implementations were already classified.
### ROOT CAUSE
The scanner used call-site-shaped regexes for exporter discovery. Consumer invocation, exporter implementation, and materialized browser download were not separated.
### FIX
`296b0469147230c3dbeae6c16141f229e8143d9a` narrowed detection once but still matched consumer calls. `625b680e8a42d2655aba665a525591c2df18b7cd` now requires actual exporter function/arrow declarations for scope enforcement and keeps materialized download detection limited to exporter/download files. `party-intelligence.ts` is retained as a false-positive regression guard. Later `ecaaffbc...` broadened typed scope declarations without changing consumer classification.
### CONSUMERS
Known report consumers call the canonical `downloadReportArtifact` CURRENT_VIEW exporter. They are consumers, not exporter implementations, and therefore do not need to declare exporter scope themselves.
### REGRESSION
The export contract now explicitly separates implementation detection from consumer calls and guards a known non-exporter utility pattern.
### EXACT-HEAD CI
`33080828816` / `98547259270` on `c656c739...` failed at Export truth. `33081609407` / `98550045476` on `296b0469...` failed at the same gate because consumer calls were still matched. `33082118547` / `98551856720` on `ecaaffbc...` passed Export truth, confirming the typed-scope detector fix, then failed later at Performance budget for workflow ordering.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-INVENTORIED; EXACT-HEAD CI PENDING.**
### REMAINING
Behavioral pagination→export proof for full/filtered dataset exports and cross-surface export equivalence remain open.

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

## Next active fronts
1. Verify the new exact-head CI after the performance-gate ordering fix and repair the next failure at root cause.
2. Complete repository-wide export consumer inventory and behavioral full/filtered dataset proof.
3. Build invariant-level BI ↔ Decision ↔ Analytics ↔ Export equivalence regression.
4. Continue NULL/UNKNOWN/MISSING/EMPTY/ZERO sibling sweep.
5. Continue tenant indirect-path sweep across Storage/Realtime/AI/vector/Exports/Workers/Caches.
6. Complete worker state-machine/recovery sibling sweep and LIVE harness.
7. Prepare authenticated runtime proof for pagination/as-of/tenant/export invariants.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current wave has real canonicalization and regression hardening, but exact-head CI, runtime/live evidence, cross-surface behavioral equivalence, and production evidence remain outstanding.
