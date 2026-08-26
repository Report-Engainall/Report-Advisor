# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Baseline main: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
User starting point: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
Current branch: `wave-final-exact-ci-13`.
Current candidate before fresh exact CI: `24f7b2d5782ddaad981e2979bd310496fe5be734` plus this index update.

## REAL CLOSURE
Secondary sales consumers, purchase total, inventory UNKNOWN semantics, sales/purchase/inventory/receivables exports, lossless PDF, decision missing-data semantics, pure outcome core, and pure SHA-256 identity are IMPLEMENTED + REGRESSION + CONSUMER VERIFIED where applicable.

## Failure → root cause → fix
1. Secondary consumer drift → canonical sales secondary RPC + adapters + Vite boundary.
2. Purchase page-total drift → server purchase summary aggregate.
3. Inventory UNKNOWN→ZERO → nullable valuation + INSUFFICIENT_DATA.
4. Export page/PDF truncation → canonical export RPCs + bounded fail-closed export + multi-page PDF.
5. Decision missing impact/accuracy → nullable metrics + unknown accuracy blocks gate.
6. Typecheck failures → nullable guard + Promise.resolve + explicit OutcomeLabel.
7. Outcome regression alias coupling → pure outcome core.
8. File-security alias coupling → pure file identity core.
9. Batch workflow integrity → concurrency group now contains `${{ github.workflow }}`.
10. Quality chain integrity → Full resilience gate contains `npm run test:document-resilience` plus the resilience script.

## Exact CI evidence
- Historical PASS: Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf`.
- Run `32919127516` = QUALITY PASS on `f8d1c024ea9fc59b13f51d9edf2488e131ba6f9c`; independent workflow guards then exposed #9/#10 and both are now fixed in the integrated branch.
- Current candidate: `24f7b2d5782ddaad981e2979bd310496fe5be734` plus this index update.
- Fresh exact-head CI: PENDING.

## Security / tenant
New RPCs are SECURITY INVOKER, resolve tenant from current_company_id(), reject mismatched caller ids, and grant execution to authenticated. Static closure DONE; live A/B proof LIVE REQUIRED.

## Performance
Secondary calls coalesce one in-flight canonical RPC. Aggregation is server-side. Export size is bounded and fail-closed. No production latency/load claim without runtime evidence.

## Legacy
`src/lib/queries.ts` legacy implementations remain for compatibility; consumers route through `queries-compat.ts`. Removal awaits zero-consumer proof + regression.

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
