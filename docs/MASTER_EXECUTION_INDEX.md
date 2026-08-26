# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Baseline main: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
User starting point: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
Current branch: `wave-final-exact-ci-5`.
Current exact-head candidate: `f856474c3699d0151ac9da8a4dd8ddd762301d27` plus this index update; fresh exact CI is required.

## REAL CLOSURE
- Secondary sales consumers: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Purchase total: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Inventory UNKNOWN≠ZERO: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Sales/Purchase/Inventory/Receivables export truth: IMPLEMENTED / REGRESSION / CONSUMER VERIFIED.
- Lossless PDF export: IMPLEMENTED / REGRESSION.
- Decision missing impact/accuracy semantics: IMPLEMENTED / REGRESSION.
- Pure outcome semantics: isolated in `outcome-feedback-core.ts`; direct regression has no browser runtime dependency.
- File SHA-256 regression: now imports the local Supabase boundary relatively, so direct Node regression does not depend on Vite alias resolution.

## Findings / fixes / regressions
1. Secondary consumer page/business aggregation drift → `get_sales_secondary_metrics` + canonical adapters + Vite alias. Regression: `check-secondary-consumer-canonical.mjs`.
2. Purchase first-page total → `get_purchase_summary`. Regression: 21/101-row pagination fixture.
3. Inventory missing quantity/cost → `get_inventory_valuation` returns `null` + `INSUFFICIENT_DATA`. Regression: missing-value cases.
4. Export page/PDF truncation → canonical export RPCs, 10,000-row fail-closed cap, multi-page PDF. Regression: report export closure.
5. Decision missing impact → nullable impact averages; unknown outcome accuracy blocks gate. Regression: decision unknown semantics.
6. CI typecheck family → nullable accuracy guard + `Promise.resolve` around Supabase RPC thenable + explicit `OutcomeLabel` mapping.
7. Outcome regression runtime coupling → pure outcome core + direct core regression.
8. File-security regression runtime coupling → relative `../supabase` import in `file-engine/security.ts`; SHA-256 behavior unchanged.

## Exact CI evidence
- Historical verified baseline: Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS.
- Run `32918895138` reached Typecheck and later failed at File security regression because direct Node execution could not resolve `@/lib/supabase` from `file-engine/security.ts`. All prior data-truth, report-truth, typecheck, build, lint, performance gates had passed. Root cause is fixed.
- Current exact-head candidate: `f856474c3699d0151ac9da8a4dd8ddd762301d27` plus this index update.
- Fresh exact-head CI: PENDING.

## Security / tenant
New RPCs are `SECURITY INVOKER`, resolve tenant from `current_company_id()`, reject mismatched client tenant ids, and grant execution to `authenticated` only. Static proof DONE; live A/B proof LIVE REQUIRED.

## Performance
Secondary dashboard calls coalesce one in-flight canonical RPC; business aggregation is server-side; exports are bounded and fail closed. No production latency/load claim without runtime evidence.

## Legacy
`src/lib/queries.ts` legacy implementations remain for compatibility. Consumers route through `queries-compat.ts` at TypeScript/Vite boundaries. Removal awaits zero-consumer proof + regression.

## Cross-surface
Migrated dashboard secondary truth, purchase/inventory truth and four export sources are DONE at implementation/regression/consumer level. Full Dashboard=Reports=Exports=Analytics=Decisions equivalence remains PARTIAL due remaining non-secondary domain metrics and live multi-surface execution. Newly migrated paths have explicit tenant/date/status contracts.

## LIVE REQUIRED / production blockers
Supabase A/B tenant isolation; authenticated browser E2E; real OCR/document corpus; native watcher proof; worker crash/replay/DLQ; real backup restore/RPO/RTO/rollback; production telemetry; production load/canary/rollback.

## Evidence classification
IMPLEMENTED = YES
TESTED/REGRESSION = YES
CONSUMER VERIFIED = YES for migrated surfaces
EXACT CI = PENDING for final index head
RUNTIME VERIFIED = NO
LIVE VERIFIED = NO
PRODUCTION CERTIFIED = NO
