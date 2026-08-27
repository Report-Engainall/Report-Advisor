# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> IMPLEMENTED / REGRESSION-ENFORCED / CONSUMER-VERIFIED / GATED / INTEGRATED / RUNTIME-EVIDENCED / LIVE-VERIFIED / PRODUCTION-CERTIFIED are separate states. No promotion without evidence matching the exact SHA.

## Exact-head integrity
- Historical requested inspection SHA: `407e6bb1e506a29ae35f741d5530400a3675b9a9`; it is not current evidence.
- Exact-head CI `33084224087` / Job `98559343666` on `fedf63182c66b4c7fc0e8106a62017886e3e90ba`: **SUCCESS**. This is the first full quality run observed after the file-security boundary fix; all listed gates completed successfully, including File security regressions, Decision evidence, typecheck, lint, build and performance.
- Current code head after the next closure batch: `32a4c4381bdd178d242ea92fa02a085dd6487eb1`.
- Base remains `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- PR #45 remains open; mergeability/review state is repository state, not application certification.
- Exact-head CI for `32a4c438...` is pending; the successful `fedf631...` run is not evidence for the new SHA.

## F45 — Zero-consumer executive metrics compatibility removal
### FIND
The historical `public.get_executive_metrics(uuid,date,date)` RPC remained as a compatibility path after newer canonical report truth boundaries existed. Its interface accepted caller-supplied tenant identity, and its implementation contained zero-fallback financial semantics. Even though the later tenant-hardening migration checked the supplied company against `current_company_id()`, retaining the RPC preserved a parallel business-truth surface that was not needed by current runtime consumers.
### ROOT CAUSE
Legacy compatibility was preserved beyond the point where repository consumers required it. The RPC's API shape itself encoded caller-selected tenant identity instead of making tenant authority intrinsic to the canonical truth boundary.
### CONSUMER INVENTORY / ZERO-CONSUMER PROOF
Repository search for `get_executive_metrics(` found only the historical SQL definitions/migrations and no runtime/page/service/API/worker consumer. A new regression scanner `scripts/check-executive-metrics-zero-consumer.mjs` scans source, scripts, migrations, workflows and docs and fails if a non-definition runtime/reference consumer is introduced.
### FIX
Added exact-signature removal migration `supabase/migrations/20260827153000_drop_zero_consumer_executive_metrics.sql` with `DROP FUNCTION IF EXISTS public.get_executive_metrics(uuid, date, date);`. The drop is intentionally signature-specific and does not remove unrelated overloads. Added `test:executive-metrics-zero-consumer` and placed it in the main quality gate before downstream truth checks.
### REGRESSION
`check-executive-metrics-zero-consumer.mjs` proves zero runtime consumers before the removal remains valid and prevents resurrection of the legacy function as a source/runtime reference.
### EXACT-HEAD CI
`33084224087` / `98559343666` on `fedf63182c66b4c7fc0e8106a62017886e3e90ba`: SUCCESS, including all existing gates. The new removal batch began after that exact-head run. Therefore the current `32a4c438...` remains pending exact-head CI.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / ZERO-CONSUMER-PROVEN; CURRENT EXACT-HEAD CI PENDING.** Runtime migration execution is still required before claiming database/runtime removal.

## F44 — File-security pure-boundary regression
### FIND
The file-security regression imported the security module directly from Node. That module legitimately imports application Supabase infrastructure through the Vite alias `@/lib/supabase`, making the pure SHA-256 regression dependent on the browser/module-resolution environment.
### ROOT CAUSE
A pure cryptographic primitive and application-side tenant/database security operations were coupled in one test import boundary. Node's native ESM resolver does not understand the project's Vite alias.
### FIX
Added `src/lib/file-engine/sha256.ts` containing the fail-closed Web Crypto SHA-256 primitive with no application imports. `src/lib/file-engine/security.ts` now delegates to that canonical primitive and re-exports it for compatibility. The regression imports the pure primitive directly.
### CONSUMERS
`security.ts` remains the application consumer of the primitive; existing callers retain the same `computeSHA256` export.
### REGRESSION
`test:file-security-regressions` asserts the exact SHA-256 digest and prevents silent downgrade to a weaker hash.
### EXACT-HEAD CI
`33084224087` / `98559343666` on `fedf63182c66b4c7fc0e8106a62017886e3e90ba`: SUCCESS.
### STATUS
**GATED on `fedf631...`; current `32a4c438...` revalidation pending.**

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
`33084224087` / `98559343666` on `fedf631...`: SUCCESS, including Receivables truth and empty-page/completeness gates.
### STATUS
**REGRESSION-WIRED / CONSUMER-VERIFIED STATICALLY; runtime >page-size and cross-surface evidence remain open.**

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
`33084224087` / `98559343666` on `fedf631...`: SUCCESS, including profitability and effective-financial truth gates.
### STATUS
**GATED on `fedf631...`; current SHA revalidation pending.**

## F37/F40/F43 — Export Truth family and gate-detector closure
### FIND
The export gate needed explicit scope declarations, but the initial detector treated ordinary consumer calls such as `downloadReportArtifact(...)` as exporter implementations.
### ROOT CAUSE
The scanner used call-site-shaped regexes for exporter discovery. Consumer invocation, exporter implementation, and materialized browser download were not separated.
### FIX
The detector now requires actual exporter function/arrow declarations for scope enforcement and keeps materialized download detection limited to exporter/download files. `party-intelligence.ts` is retained as a false-positive regression guard.
### CONSUMERS
Known report consumers call the canonical `downloadReportArtifact` CURRENT_VIEW exporter.
### REGRESSION
The export contract separates implementation detection from consumer calls and guards a known non-exporter utility pattern.
### EXACT-HEAD CI
`33084224087` / `98559343666` on `fedf631...`: SUCCESS, including Export truth.
### STATUS
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-INVENTORIED; behavioral pagination→export proof remains open.**

## F38 — Receivables consumer retry
**IMPLEMENTED / REGRESSION-WIRED; runtime retry evidence remains required.**

## F39 — Analytics browser-truth sibling family
**IMPLEMENTED / REGRESSION-WIRED / CONSUMER-MIGRATED / LEGACY-REMOVED; exact current SHA revalidation pending.**

## F41 — Zero-consumer legacy financial intelligence calculator
**REMOVED / ZERO-CONSUMER-PROVEN; current exact-head CI revalidation pending.**

## Receivables
**IMPLEMENTED + REGRESSION-WIRED + ROUTE-CONSUMER-MIGRATED; CURRENT EXACT-HEAD CI PENDING.**
- Server-side snapshot truth and session-derived tenant authority.
- Cancelled/canceled/void exclusion.
- `UNDATED` and `INCOMPLETE` evidence retained explicitly.
- Aggregate metrics independent of display pagination, including empty pages.
- Aging Analytics reuses Receivables truth.
- Remaining: runtime >page-size proof, full export equivalence, cross-surface equivalence.

## Profitability
**PARTIAL / FAIL-CLOSED IMPLEMENTATION + REGRESSION-WIRED; CURRENT EXACT-HEAD CI PENDING.**
- Missing cost/incomplete/multi-currency evidence fails closed to `NULL` business totals.
- Reports route consumes canonical profitability truth.
- Remaining: complete domain contract for discounts/returns/currency/rounding/source records and sibling consumer/cross-surface proof.

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
1. Verify exact-head CI for `32a4c438...`; repair the next failure at root cause, never by weakening the gate.
2. Continue repository-wide export consumer inventory and behavioral full/filtered dataset proof.
3. Build invariant-level BI ↔ Decision ↔ Analytics ↔ Export equivalence regression.
4. Continue NULL/UNKNOWN/MISSING/EMPTY/ZERO sibling sweep.
5. Continue tenant indirect-path sweep across Storage/Realtime/AI/vector/Exports/Workers/Caches.
6. Complete worker state-machine/recovery sibling sweep and LIVE harness.
7. Prepare authenticated runtime proof for pagination/as-of/tenant/export invariants.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Current wave has real canonicalization and regression hardening, but current exact-head CI, runtime/live evidence, cross-surface behavioral equivalence, and production evidence remain outstanding.
