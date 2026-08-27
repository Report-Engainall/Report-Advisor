# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Historical requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9`; it is not current evidence.
- Current PR #45 code head after this wave: `bfd610a7d9837883c9d5ab1fbe32ceb224694f1c`.
- Base remains `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- PR #45 remains open; mergeability/review state is repository state, not application certification.
- Exact-head CI `33083899488` / Job `98558180829` on `c7391a750bf6619470f418ae6e77fca19dfef7a2`: **FAIL** at File security regressions. Root cause: the direct Node regression imported `src/lib/file-engine/security.ts`, which imports the browser/Vite `@/lib/supabase` alias; Node does not resolve that alias. This is a test/module-boundary defect, not evidence that SHA-256 itself is wrong.
- The same exact run proved the preceding canonical truth, tenant, migration, production-readiness, typecheck, lint, build, performance, business-intelligence, golden-corpus, outcome-feedback, and other gates completed successfully before the file-security failure.
- Batch fix: introduced pure `src/lib/file-engine/sha256.ts` for the cryptographic primitive, routed `security.ts` through it while preserving the existing public export, and changed `scripts/file-security-regressions.test.ts` to test the pure primitive without importing the application alias graph.
- Fix commits: `5bdf835b57b11b19f6bcbb1b8ac3a64cfd65db66`, `d53fd0de874d015e1f16a2d827dee9f8202a1f54`, `bfd610a7d9837883c9d5ab1fbe32ceb224694f1c`.
- Exact-head CI for `bfd610a7...` is not yet observable. Therefore no PASS is claimed for the current SHA.

## F44 — File-security pure-boundary regression
### FIND
The file-security regression imported the security module directly from Node. That module legitimately imports application Supabase infrastructure through the Vite alias `@/lib/supabase`, making the pure SHA-256 regression dependent on the browser/module-resolution environment.
### ROOT CAUSE
A pure cryptographic primitive and application-side tenant/database security operations were coupled in one test import boundary. Node's native ESM resolver does not understand the project's Vite alias.
### FIX
Added `src/lib/file-engine/sha256.ts` containing the fail-closed Web Crypto SHA-256 primitive with no application imports. `src/lib/file-engine/security.ts` now delegates to that canonical primitive and re-exports it for compatibility. The regression imports the pure primitive directly.
### CONSUMERS
`security.ts` remains the application consumer of the primitive; existing callers retain the same `computeSHA256` export. The regression is now a pure primitive consumer rather than an accidental consumer of the whole Supabase security module.
### REGRESSION
`test:file-security-regressions` continues to assert the exact SHA-256 digest and therefore prevents silent downgrade to a weaker hash. The module-boundary failure itself is removed by testing the dependency at its pure boundary.
### EXACT-HEAD CI
`33083899488` / `98558180829` on `c7391a750bf6619470f418ae6e77fca19dfef7a2`: FAIL at File security regressions with `ERR_MODULE_NOT_FOUND` for `@/lib`.
### STATUS
**IMPLEMENTED / REGRESSION-UPDATED; EXACT-HEAD CI PENDING on `bfd610a7...`.**

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
The exact run `33083899488` on `c7391a750...` passed both Receivables truth gates before the later file-security failure.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-VERIFIED STATICALLY; current exact-head CI pending.**

## F35 — Financial semantic fail-closed sibling family
### FIND
Server-side report contracts could report `INSUFFICIENT_DATA` while still projecting partial numeric business totals from the valid subset.
### ROOT CAUSE
Quality state and numeric projection were independent. Partial aggregates survived when evidence was insufficient.
### FIX
`supabase/migrations/20260827131500_financial_truth_fail_closed.sql` makes profitability/dashboard/inventory financial values `NULL` when evidence is insufficient while retaining quality counters.
### REGRESSION
`check-profitability-truth-contract.mjs` and `check-effective-financial-truth-fail-closed.mjs` encode the fail-closed invariants and canonical service wiring.
### EXACT-HEAD CI
Run `33083899488` on `c7391a750...` passed the profitability and effective-financial truth gates.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / EXACT-HEAD PREVIOUSLY EXECUTED; current SHA revalidation pending.**

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
`33080828816` / `98547259270` on `c656c739...` failed at Export truth. `33081609407` / `98550045476` on `296b0469...` failed at the same gate because consumer calls were still matched. `33082118547` / `98551856720` on `ecaaffbc...` passed Export truth, confirming the typed-scope detector fix, then failed later at Performance budget for workflow ordering. `33083899488` on `c7391a750...` again passed Export truth.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-INVENTORIED; behavioral pagination→export proof remains open.**

## F38 — Receivables consumer retry
### FIND
Canonical Receivables retry previously performed a no-op state update.
### ROOT CAUSE
Fetch effect depended only on `page`.
### FIX
`retryNonce` is included in the fetch effect dependencies and incremented by retry.
### EXACT-HEAD CI
Run `33083899488` on `c7391a750...` passed the Receivables truth and empty-page gates.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED; runtime retry evidence remains required.**

## F39 — Analytics browser-truth sibling family
### FIND
Analytics contained independent browser-side RFM/ABC/Aging business calculations.
### FIX
Added tenant-authoritative RFM/ABC RPCs, canonical analytics adapter/pages, and Aging delegation to Receivables truth; legacy Analytics page was removed after route migration.
### EXACT-HEAD CI
Run `33083899488` on `c7391a750...` passed the Analytics truth contract.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-MIGRATED / LEGACY-REMOVED; exact current SHA revalidation pending.**

## F41 — Zero-consumer legacy financial intelligence calculator
### FIND
`src/lib/intelligence/financialIntelligence.ts` remained as a parallel local financial calculator after canonical report profitability truth existed.
### ZERO-CONSUMER PROOF
Repository search found no runtime/page/service/RPC consumer of `buildFinancialIntelligence`; static zero-consumer evidence was established.
### FIX
Deleted `src/lib/intelligence/financialIntelligence.ts` in commit `697633f0f9281c06c324fe3c4ad5e48560d74ac5`.
### STATUS
**REMOVED / ZERO-CONSUMER-PROVEN; current exact-head CI revalidation pending.**

## Receivables
**IMPLEMENTED + REGRESSION-WIRED + ROUTE-CONSUMER-MIGRATED; CURRENT EXACT-HEAD CI PENDING.**
- Server-side snapshot truth.
- Session-derived tenant authority.
- Cancelled/canceled/void exclusion.
- `UNDATED` and `INCOMPLETE` evidence retained explicitly.
- Aggregate metrics independent of display pagination, including empty pages.
- Canonical route consumer and retry re-fetch.
- Aging Analytics reuses Receivables truth.
- Remaining: runtime >page-size proof, full export equivalence, cross-surface equivalence.

## Profitability
**PARTIAL / FAIL-CLOSED IMPLEMENTATION + REGRESSION-WIRED; CURRENT EXACT-HEAD CI PENDING.**
- Missing cost/incomplete evidence fails closed to `NULL` business totals.
- Reports route consumes canonical profitability truth.
- Remaining: complete discounts/returns/currency/rounding/source-record contract, sibling consumer migration, cross-surface equivalence.

## Tenant / Security
- Browser/server authority is covered in several canonical families.
- **OPEN:** Storage, Realtime, AI/vector, export/download, worker/cache indirect-path sweep and adversarial A/B runtime proof.
- File identity now has a pure SHA-256 primitive isolated from the application alias graph; tenant-authoritative duplicate lookup remains in `security.ts`.

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
1. Verify exact-head CI for `bfd610a7...`; repair the next failure at root cause, never by weakening the gate.
2. Continue repository-wide export consumer inventory and behavioral full/filtered dataset proof.
3. Build invariant-level BI ↔ Decision ↔ Analytics ↔ Export equivalence regression.
4. Continue NULL/UNKNOWN/MISSING/EMPTY/ZERO sibling sweep.
5. Continue tenant indirect-path sweep across Storage/Realtime/AI/vector/Exports/Workers/Caches.
6. Complete worker state-machine/recovery sibling sweep and LIVE harness.
7. Prepare authenticated runtime proof for pagination/as-of/tenant/export invariants.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current wave has real canonicalization and regression hardening, but current exact-head CI, runtime/live evidence, cross-surface behavioral equivalence, and production evidence remain outstanding.
