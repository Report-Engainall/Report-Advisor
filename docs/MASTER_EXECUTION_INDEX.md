# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Baseline main: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
User starting point: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
Current branch: `wave-final-exact-ci-7`.
Current candidate: `f8d1c024ea9fc59b13f51d9edf2488e131ba6f9c` plus this index update; fresh exact-head CI required.

## REAL CLOSURE
- Secondary sales consumers: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Purchase total: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Inventory UNKNOWN≠ZERO: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Sales/Purchase/Inventory/Receivables export truth: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Lossless PDF export: IMPLEMENTED / REGRESSION.
- Decision missing impact/accuracy semantics: IMPLEMENTED / REGRESSION.
- Pure outcome semantics: isolated in `outcome-feedback-core.ts`.
- Pure SHA-256 identity: isolated in `file-identity-core.ts`; file-security regression imports the pure core directly.

## Failure → root cause → fix
1. Secondary consumer drift → `get_sales_secondary_metrics` + adapters + Vite alias.
2. Purchase page-total drift → `get_purchase_summary`.
3. Inventory UNKNOWN→ZERO → nullable `get_inventory_valuation` + `INSUFFICIENT_DATA`.
4. Export page/PDF truncation → canonical export RPCs + 10,000-row fail-closed cap + multi-page PDF.
5. Decision missing impact/accuracy → nullable metrics + unknown accuracy blocks gate.
6. Typecheck failures → nullable guard + `Promise.resolve` + explicit `OutcomeLabel`.
7. Outcome regression alias coupling → pure outcome core.
8. File-security regression alias coupling → pure file identity core; security persistence remains behind Supabase boundary.

## Exact CI evidence
- Historical PASS: Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf`.
- Run `32918895138`: all data-truth/report/typecheck/build/lint/performance gates passed; File security regression failed only because direct Node imported the Supabase-coupled security module. Pure-core extraction fixes that coupling.
- Current candidate: `f8d1c024ea9fc59b13f51d9edf2488e131ba6f9c` plus this index update.
- Fresh exact-head quality CI: PENDING.

## Security / tenant
New RPCs are `SECURITY INVOKER`, resolve tenant from `current_company_id()`, reject mismatched caller ids, and grant execution to `authenticated`. Static closure DONE; live A/B proof LIVE REQUIRED.

## Performance
Secondary dashboard calls share one in-flight canonical RPC. Business aggregation is server-side. Exports are bounded and fail closed. No production latency/load claim without live evidence.

## Legacy
`src/lib/queries.ts` legacy implementations remain for compatibility. Consumers route through `queries-compat.ts` at TypeScript/Vite boundaries. Removal awaits zero-consumer proof + regression.

## Cross-surface
Migrated dashboard secondary truth, purchase/inventory truth and four export sources are DONE at implementation/regression/consumer level. Full Dashboard=Reports=Exports=Analytics=Decisions equivalence remains PARTIAL due remaining non-secondary domain metrics and live multi-surface execution.

## LIVE REQUIRED / production blockers
Supabase A/B tenant isolation; authenticated browser E2E; real OCR/document corpus; native watcher; worker crash/replay/DLQ; real backup restore/RPO/RTO/rollback; production telemetry; production load/canary/rollback.

## Evidence classification
IMPLEMENTED = YES
REGRESSION = YES
CONSUMER VERIFIED = YES for migrated surfaces
EXACT CI = PENDING
RUNTIME VERIFIED = NO
LIVE VERIFIED = NO
PRODUCTION CERTIFIED = NO
