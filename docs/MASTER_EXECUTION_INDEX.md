# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Baseline main: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
User starting point: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
Current branch: `wave-final-exact-ci-2`.
Current candidate before fresh exact CI: `96502c9d9b064a03fe6db106e36721b4bac62cb4`.

## REAL CLOSURE
- Secondary sales consumers: **IMPLEMENTED / REGRESSION / CONSUMER VERIFIED**.
- Purchase total: **IMPLEMENTED / REGRESSION / CONSUMER VERIFIED**.
- Inventory UNKNOWN≠ZERO: **IMPLEMENTED / REGRESSION / CONSUMER VERIFIED**.
- Sales/Purchase/Inventory/Receivables export truth: **IMPLEMENTED / REGRESSION / CONSUMER VERIFIED**.
- Lossless PDF export: **IMPLEMENTED / REGRESSION**.
- Decision missing impact/accuracy semantics: **IMPLEMENTED / REGRESSION**.
- Pure outcome semantics are now isolated in `outcome-feedback-core.ts`; direct Node regression no longer depends on browser `import.meta.env`/Vite alias resolution.

## Findings closed
1. Secondary consumer page/business aggregation drift → canonical `get_sales_secondary_metrics` + adapters + Vite canonical import boundary.
2. Purchase first-page total → `get_purchase_summary` server aggregate.
3. Inventory missing quantity/cost → `get_inventory_valuation` returns `null` + `INSUFFICIENT_DATA`.
4. Export page/PDF truncation → canonical export RPCs + explicit 10,000-row fail-closed cap + multi-page PDF.
5. Decision missing impact → nullable impact averages; missing outcome accuracy blocks the gate.
6. CI type errors → nullable accuracy guard + `Promise.resolve` around Supabase RPC thenable.
7. Outcome regression runtime coupling → pure outcome core + regression imports core directly.

## Regression / CI chain
- Historical verified baseline: Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS.
- Run `32918482113`: custom data-truth gates, typecheck, lint, build, performance, report truth passed; outcome regression failed due direct Node alias/runtime coupling. Root cause fixed.
- Fresh candidate: `96502c9d9b064a03fe6db106e36721b4bac62cb4`.
- Exact-head CI for this candidate: PENDING.

## Security
- New RPCs use `SECURITY INVOKER`.
- Tenant authority = `current_company_id()`; mismatched client tenant is rejected.
- New RPC grants = `authenticated` only.
- Static tenant/security proof = DONE; live A/B proof = LIVE REQUIRED.

## Performance
- Secondary dashboard calls share one in-flight RPC.
- Business aggregation is server-side.
- Export size is bounded and fail-closed.
- No production latency/load claim without live evidence.

## Legacy
Legacy implementations in `src/lib/queries.ts` remain for compatibility. Consumer routing is canonical through `queries-compat.ts` at TypeScript/Vite boundaries. Removal requires zero-consumer proof + regression; no destructive deletion.

## Cross-surface
Dashboard/report secondary truth, purchase/inventory truth, and four export row sources are DONE at implementation/regression/consumer level. Full Dashboard=Reports=Exports=Analytics=Decisions equivalence remains PARTIAL because remaining non-secondary domain metrics and live multi-surface execution still need closure. Newly migrated paths have explicit tenant/status/date contracts.

## LIVE REQUIRED / production blockers
Supabase A/B tenant isolation; authenticated browser E2E; real document/OCR corpus; native watcher persistence; worker crash/replay/DLQ drill; real backup restore/RPO/RTO/rollback; production telemetry trace; production load/canary/rollback.

## Evidence classification
IMPLEMENTED = YES
TESTED/REGRESSION = YES
CONSUMER VERIFIED = YES for migrated surfaces
EXACT CI = PENDING for `96502c9d9b064a03fe6db106e36721b4bac62cb4`
RUNTIME VERIFIED = NO
LIVE VERIFIED = NO
PRODUCTION CERTIFIED = NO
