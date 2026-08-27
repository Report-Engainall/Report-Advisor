# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9` — historical exact-head quality failure; never reused as current PASS evidence.
- Current active code HEAD: `7a9b4dfd3e455bd91a33185f65a8994e1f07cde7`.
- Exact-head quality run: **33075341520**, head SHA exactly `7a9b4dfd…`, currently **QUEUED/IN PROGRESS** at time of this index update. No PASS claimed.
- The previous run `33075149748` tested `dd6bebabc87c55bb45ed559aba17313fe199ee44` and exposed real failures; it is historical evidence only.

## F35 — Financial semantic fail-closed sibling family
### FIND
Server-side report contracts could report `INSUFFICIENT_DATA` while still projecting partial numeric business totals from the valid subset.
### ROOT CAUSE
Quality state and numeric projection were independent. Partial aggregates survived even when evidence was insufficient.
### FIX
`supabase/migrations/20260827131500_financial_truth_fail_closed.sql` now makes profitability/dashboard/inventory financial values `NULL` when evidence is insufficient, while retaining explicit quality counters.
### REGRESSION
`check-profitability-truth-contract.mjs` now requires fail-closed projection markers and canonical service wiring.
### STATUS
**IMPLEMENTED / REGRESSION-ENFORCED / CI PENDING.**

## F36 — CI consumer-gate false assumption + ReportsPage syntax regression
### FIND
Exact-head run `33075149748` failed before downstream gates because `check-financial-aggregation-consumers.mjs` incorrectly required `fetchReceivablesReportSnapshot` inside `ReportsPage.tsx`, although the actual route uses the canonical `ReceivablesReportPageCanonical` component. The same run exposed a real syntax error in `ReportsPage.tsx` caused by escaped template-literal delimiters, producing both ESLint parse failure and Vite build failure. Performance budget then failed secondarily because `dist/index.html` did not exist after the build failure.
### ROOT CAUSE
Two independent topology/consumer regressions were introduced together:
1. The regression gate encoded a file-level assumption instead of tracing the actual route consumer graph.
2. The ReportsPage rewrite contained literal escaped backticks (`\\``) rather than valid TypeScript template literals.
3. The performance gate correctly depended on build output; its ENOENT was downstream, not a performance root cause.
### FIX
- Rewrote `ReportsPage.tsx` with valid TypeScript and preserved canonical profitability, inventory and receivables route boundaries.
- Repaired `check-financial-aggregation-consumers.mjs` to verify the actual `App.tsx` route → `ReceivablesReportPageCanonical` consumer and profitability canonical service, instead of demanding a nonexistent function in the page file.
- Kept the performance failure classified as a downstream consequence of the build failure, not a false performance finding.
### REGRESSION
The consumer gate now validates route topology and canonical truth boundaries rather than one file-local symbol.
### STATUS
**FIXED IN CODE; EXACT-HEAD CI PENDING.**

## Receivables
**IMPLEMENTED + REGRESSION-ENFORCED + ROUTE-CONSUMER-MIGRATED; EXACT-HEAD CI PENDING.**
- Server-side snapshot truth.
- Session-derived tenant authority.
- Cancelled/canceled/void exclusion.
- `UNDATED` and `INCOMPLETE` retained explicitly.
- Metrics independent of display pagination.
- Route consumer is canonical `ReceivablesReportPageCanonical`.
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
**OPEN.** Canonical sources exist for major dashboard/inventory/receivables/profitability surfaces, but no proof yet that `BI = Decision = Analytics = Export` under identical tenant/date/status/NULL/currency/source-record semantics.

## Export Truth
**PARTIAL.** Current-page exports are explicitly named/scoped. Full and filtered-full exports still require complete consumer-family scan and pagination→export regression proof.

## Semantic NULL / UNKNOWN sweep
**ACTIVE.** Confirmed/fixed families include missing cost→zero, missing receivable fields→row loss, incomplete financial evidence→partial numeric projection, and missing outcome evidence→zero. Repository-wide sibling scan remains open.

## Storage / Realtime / AI / Vector
**STATIC GATES ONLY / LIVE REQUIRED.** Required evidence: object path/signed URL authorization, realtime channel/payload isolation, vector metadata/retrieval/cache/deletion isolation.

## Runtime / LIVE
**NO RUNTIME EVIDENCE.** CI/static fixes do not substitute for authenticated browser, tenant A/B, worker crash/recovery, storage/realtime/vector, real document corpus, backup/restore or production telemetry evidence.

## Production Certification
**NOT PRODUCTION CERTIFIED.**

## Exact-head CI rule
Only CI whose `head_sha` exactly equals the current Code HEAD can promote a capability to `CI-GATED`. Historical PASSes remain historical.

## Next active fronts
1. Observe exact-head run `33075341520` for `7a9b4dfd…`.
2. If it fails, extract first independent root cause and fix before rerun.
3. Complete full Export Truth consumer-family scan.
4. Complete BI ↔ Decision ↔ Analytics ↔ Export equivalence contracts.
5. Continue repository-wide NULL/UNKNOWN/MISSING/EMPTY/ZERO sibling sweep.
6. Continue tenant-sensitive RPC sibling sweep and adversarial path contracts.
7. Complete worker failure-state/recovery sibling sweep and LIVE harness.
8. Storage/Realtime/AI/vector isolation contracts and LIVE harnesses.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current wave contains real root-cause fixes and regressions. Exact-head CI is still pending, and runtime/live/production evidence remains outstanding.
