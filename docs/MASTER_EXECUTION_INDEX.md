# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Baseline main inspected: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
User-provided starting point: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
Current execution branch: `wave-final-truth-certification`.
Current code/index head: `9c4810aab7ed8d51128c3ee1b8e02ef12110be2a`.

## Closure matrix
| Capability | Implemented | Regression | Exact CI | Consumer | Runtime | LIVE | Production |
|---|---|---|---|---|---|---|---|
| Secondary sales analytics canonical migration | DONE | DONE | PENDING | VERIFIED | NOT RUN | A/B REQUIRED | NO |
| Purchase total canonical aggregate | DONE | DONE | PENDING | VERIFIED | NOT RUN | REQUIRED | NO |
| Inventory UNKNOWN/INSUFFICIENT_DATA valuation | DONE | DONE | PENDING | VERIFIED | NOT RUN | REQUIRED | NO |
| Canonical Sales/Purchase/Inventory/Receivables exports | DONE | DONE | PENDING | VERIFIED | NOT RUN | REQUIRED | NO |
| Lossless multi-page PDF export | DONE | DONE | PENDING | VERIFIED | NOT RUN | browser proof REQUIRED | NO |
| Decision missing-impact / missing-accuracy semantics | DONE | DONE | PENDING | VERIFIED | NOT RUN | outcome loop REQUIRED | NO |

## Real findings and closure
### F-01 Secondary consumer drift — HIGH
FOUND → ROOT CAUSE: five secondary sales consumers were page-facing business calculations/queries rather than one domain aggregate.
FIX: `get_sales_secondary_metrics`; canonical adapters; Vite alias routes `@/lib/queries` through `queries-compat.ts`.
REGRESSION: `check-secondary-consumer-canonical.mjs`.

### F-02 Purchase pagination-derived total — HIGH
FOUND → ROOT CAUSE: report total could depend on the first 20 displayed invoices.
FIX: `get_purchase_summary`; report KPI reads server aggregate; export uses canonical full-row RPC.
REGRESSION: 21/101-row fixture + report closure regression.

### F-03 Inventory UNKNOWN→ZERO — HIGH
FOUND → ROOT CAUSE: missing quantity/cost could be treated as zero.
FIX: `get_inventory_valuation` returns `null` + `INSUFFICIENT_DATA`; UI/export preserve unknown semantics.
REGRESSION: missing quantity/cost cases + source guard.

### F-04 Export truncation — HIGH
FOUND → ROOT CAUSE: export could be tied to page rows and PDF renderer truncated to 42 rows.
FIX: canonical export RPCs with explicit 10,000-row fail-closed cap; PDF renderer now pages instead of truncating.
REGRESSION: report data-truth + PDF no-truncation guard.

### F-05 Decision unknown→zero — HIGH
FOUND → ROOT CAUSE: missing expected/actual impact was included as zero.
FIX: nullable impact averages; unknown outcome accuracy now blocks the intelligence gate instead of being treated as valid.
REGRESSION: `check-decision-metrics-unknown-regression.mjs`.

### F-06 CI typecheck failure — HIGH, CLOSED IN CODE
Exact-head Run `32918482113` exposed:
1. `intelligence-gate.ts`: nullable `outcomes.accuracy` was dereferenced.
2. `queries-compat.ts`: Supabase RPC returned `PromiseLike`, so `.finally()` was not type-safe.
FIX:
1. gate now explicitly treats null accuracy as `OUTCOME_ACCURACY_LOW`.
2. shared secondary RPC loader wraps the RPC thenable in `Promise.resolve(...)` before `.then/.finally`.
REGRESSION: decision unknown-semantics regression now covers the gate.
A fresh exact-head CI is required for the post-fix head.

## Security / tenant truth
- New RPCs are `SECURITY INVOKER`.
- Tenant authority comes from `current_company_id()` and mismatched caller ids are rejected.
- Grants are restricted to `authenticated`.
- Export RPCs enforce the same tenant/status boundary.
- Static security proof is DONE; live A/B tenant proof remains LIVE REQUIRED.

## Performance
- Secondary dashboard calls coalesce through one in-flight canonical RPC.
- Aggregations happen server-side, not through page scans.
- Exports have an explicit 10,000-row safety ceiling and fail closed instead of silently truncating.
- No production latency/load claim without live measurement.

## Legacy
`src/lib/queries.ts` implementations remain for compatibility. Consumer routing is migrated through the canonical adapter boundary. Removal awaits zero-consumer proof plus removal regression; no destructive deletion performed.

## Cross-surface
- Dashboard/report secondary truth: DONE.
- Purchase/inventory truth: DONE.
- Export truth for sales/purchases/inventory/receivables: DONE.
- Decision missing-data semantics: DONE.
- Full Dashboard = Reports = Exports = Analytics = Decisions equivalence: PARTIAL; remaining non-secondary domain metrics and live multi-surface dataset execution are still required.
- Date/status semantics: explicit on newly migrated paths; repository-wide equivalence remains open.

## Current CI evidence
- Historical baseline PASS: Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf`.
- Exact-head Run `32918482113` on merge ref `19755b07e08c7a78cdbb403fd61f5b8ef267bece` FAILED only at Typecheck after all custom data-truth regressions passed; failure family was fixed above.
- Current code head: `9c4810aab7ed8d51128c3ee1b8e02ef12110be2a`.
- Current exact-head CI: PENDING.
- Never promote historical PASS to current-head PASS.

## LIVE REQUIRED / Production blockers
1. Supabase tenant A/B adversarial runtime proof.
2. Authenticated browser E2E against real tenant data.
3. Real OCR/PDF/XLSX/CSV corpus execution.
4. Native Windows/Android/iOS watcher proof.
5. Real worker crash/restart/DLQ/replay drill.
6. Real backup restore/checksum/RPO/RTO/rollback drill.
7. Production telemetry trace through report/decision/outcome.
8. Production load/canary/rollback.

## Final truth for this index commit
IMPLEMENTED = YES.
REGRESSION = YES.
CI VERIFIED = PENDING for `9c4810aab7ed8d51128c3ee1b8e02ef12110be2a`.
RUNTIME VERIFIED = NO.
LIVE VERIFIED = NO.
PRODUCTION CERTIFIED = NO.
