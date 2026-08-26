# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Baseline main inspected: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
User-provided starting point: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
Current execution branch: `wave-final-exact-ci-2`.
Current code/index candidate: `5b24871d77e2b9105cfcd67b8d06207f930b5906`.

## Closure matrix
| Capability | Implemented | Regression | Exact CI | Consumer | Runtime | LIVE | Production |
|---|---|---|---|---|---|---|---|
| Secondary sales analytics canonical migration | DONE | DONE | PENDING | VERIFIED | NOT RUN | A/B REQUIRED | NO |
| Purchase total canonical aggregate | DONE | DONE | PENDING | VERIFIED | NOT RUN | REQUIRED | NO |
| Inventory UNKNOWN/INSUFFICIENT_DATA valuation | DONE | DONE | PENDING | VERIFIED | NOT RUN | REQUIRED | NO |
| Canonical Sales/Purchase/Inventory/Receivables exports | DONE | DONE | PENDING | VERIFIED | NOT RUN | REQUIRED | NO |
| Lossless multi-page PDF export | DONE | DONE | PENDING | VERIFIED | NOT RUN | browser proof REQUIRED | NO |
| Decision missing-impact / missing-accuracy semantics | DONE | DONE | PENDING | VERIFIED | NOT RUN | outcome loop REQUIRED | NO |

## Real findings → root cause → fix → regression
1. **Secondary consumer drift — HIGH:** five sales secondary consumers were legacy page-facing calculations. Fixed with `get_sales_secondary_metrics`, canonical adapters, shared in-flight RPC, and Vite alias routing. Regression: `check-secondary-consumer-canonical.mjs`.
2. **Purchase pagination-derived total — HIGH:** report total could depend on first 20 rows. Fixed with `get_purchase_summary`; report reads canonical aggregate. Regression: 21/101-row fixture.
3. **Inventory UNKNOWN→ZERO — HIGH:** missing quantity/cost could become zero. Fixed with nullable `get_inventory_valuation` + `INSUFFICIENT_DATA`; UI/export preserve unknown. Regression: missing-value cases.
4. **Export truncation — HIGH:** page rows and a 42-row PDF cap could silently lose export truth. Fixed with canonical export RPCs, 10,000-row fail-closed cap, and multi-page PDF rendering. Regression: report export closure + PDF no-truncation guard.
5. **Decision missing-data→ZERO — HIGH:** missing expected/actual impact was included as zero. Fixed with nullable impact averages and explicit unknown accuracy blocking. Regression: decision unknown semantics.
6. **CI typecheck — CLOSED:** nullable outcome accuracy dereference and Supabase `PromiseLike.finally()` type issue were fixed; next exact CI must verify.
7. **CI outcome regression import — CLOSED:** outcome-feedback regression could not resolve `@/lib` under direct Node execution. Fixed the module to use the local relative `../supabase` boundary; existing behavioral regression now directly exercises the pure outcome contract.

## Security / tenant truth
- New canonical RPCs are `SECURITY INVOKER`.
- Tenant authority comes from `current_company_id()`; mismatched caller ids are rejected.
- Grants are restricted to `authenticated`.
- Export RPCs preserve tenant/status semantics and fail closed on oversized exports.
- Static security = DONE; live A/B tenant proof = LIVE REQUIRED.

## Performance
- Secondary dashboard calls coalesce into one in-flight canonical RPC.
- Aggregation is server-side rather than browser/page based.
- Export cap is explicit and fail-closed; no silent truncation.
- Production latency/load numbers are not claimed without runtime evidence.

## Legacy
`src/lib/queries.ts` legacy implementations remain for compatibility. Consumer routing now passes through `queries-compat.ts` at both TypeScript and Vite resolution boundaries. Removal awaits zero-consumer proof + removal regression; no destructive deletion.

## Cross-surface status
- Dashboard/report secondary truth: DONE.
- Purchase/inventory truth: DONE.
- Sales/purchase/inventory/receivables export source truth: DONE.
- Decision missing-data semantics: DONE.
- Full Dashboard = Reports = Exports = Analytics = Decisions equivalence: PARTIAL because remaining non-secondary domain metrics and live multi-surface datasets still require equivalence execution.
- Date/status semantics: explicit on migrated paths; repository-wide equivalence remains open.

## CI evidence
- Historical verified baseline: Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS.
- Exact-head Run `32918482113` on merge ref `19755b07e08c7a78cdbb403fd61f5b8ef267bece` failed at the outcome regression due to direct Node alias resolution; all data-truth custom gates, typecheck, lint, build, performance and report truth gates passed. Root cause was fixed by the relative import change.
- Current candidate: `5b24871d77e2b9105cfcd67b8d06207f930b5906`.
- Fresh exact-head CI for this candidate: PENDING.

## LIVE REQUIRED / production blockers
1. Supabase tenant A/B adversarial runtime proof.
2. Authenticated browser E2E against real tenant data.
3. Real OCR/PDF/XLSX/CSV corpus execution.
4. Native Windows/Android/iOS watcher proof.
5. Real worker crash/restart/DLQ/replay drill.
6. Real backup restore/checksum/RPO/RTO/rollback drill.
7. Production telemetry trace through report/decision/outcome.
8. Production load/canary/rollback evidence.

## Final truth
IMPLEMENTED = YES.
REGRESSION = YES.
CI VERIFIED = PENDING for `5b24871d77e2b9105cfcd67b8d06207f930b5906`.
RUNTIME VERIFIED = NO.
LIVE VERIFIED = NO.
PRODUCTION CERTIFIED = NO.
