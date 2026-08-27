# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-27
Source of truth: PR #45 / branch `wave/parallel-compat-closure-20260826`.
Base: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

> Evidence states are separate: IMPLEMENTED → REGRESSION-ENFORCED → GATED → INTEGRATED → CONSUMER-VERIFIED → RUNTIME-EVIDENCED → LIVE-VERIFIED → PRODUCTION-CERTIFIED. No promotion without evidence on the exact SHA.

## Current exact-head state
- Code HEAD: `c2f4a01902eec7b2a11a1e38bd84e4ed0efa2074`.
- Exact-head quality Run `33089346132` / Job `98577622993`: **SUCCESS on exactly `c2f4a019...`**. The run completed the tenant sibling boundary, profitability, receivables, analytics, export, production-readiness, typecheck, lint, build, performance, behavioral/BI/golden-corpus/outcome/file-security/decision regressions, durable-runner recovery contract and routing/security gates. This proves CI for `c2f4a019...` only.
- This index update creates a new code tip and therefore requires a fresh exact-head CI before the resulting tip can be called CI-verified.

## F47 — Receivables empty-page sentinel leakage
**FIXED / REGRESSION-WIRED / EXACT-HEAD CI VERIFIED at c2f4a019...**
- Finding: the canonical Receivables RPC emits a metadata sentinel row when a requested page is empty, while the adapter previously mapped every returned row into `snapshot.rows`.
- Root cause: transport metadata and domain business rows were not separated at the adapter boundary.
- Fix: `src/lib/receivables-truth.ts` filters `row.id != null` before mapping business rows while retaining aggregate metadata from the first RPC row.
- Regression: `scripts/check-receivables-empty-page-contract.mjs` requires the sentinel filter and includes an explicit sentinel fixture proving zero business rows are exposed.
- Remaining: real >page-size runtime proof, export equivalence and cross-surface evidence.

## F46 — Dashboard secondary truth
**IMPLEMENTED / REAL CONSUMER MIGRATED / REGRESSION-ENFORCED / EXACT-HEAD CI VERIFIED at c2f4a019...** Remaining: zero-consumer legacy function removal and runtime proof.

## F45 — Executive metrics compatibility removal
- Zero-consumer scan found no runtime consumer for `get_executive_metrics(uuid,date,date)`.
- Exact-signature drop migration added.
- Run `33085041491` / Job `98562277560` on `89367a9...`: **SUCCESS** for F45 only.
- Runtime migration execution remains separate evidence.

## Receivables Truth
**IMPLEMENTED / REGRESSION-ENFORCED / ROUTE CONSUMER MIGRATED / EXACT-HEAD CI VERIFIED.** Canonical `report_receivables_snapshot` owns aggregate truth independently of page boundaries and derives tenant from `current_company_id()`. Incomplete rows are retained as `INCOMPLETE`; missing financial evidence produces `INSUFFICIENT_DATA`; `UNDATED` is explicit; cancelled/canceled/void are excluded. Source-level `as-of` and incomplete-row counting fixes are regression-enforced. F47 is fixed. Remaining: zero-consumer legacy removal, >page-size runtime proof, export equivalence and cross-surface proof.

## Profitability Truth
**PARTIAL / FAIL-CLOSED / EXACT-HEAD CI VERIFIED.** Canonical `report_profitability_truth` derives tenant from `current_company_id()`; missing line revenue/cost/quantity or multi-currency evidence fails closed to NULL totals. Remaining: explicit discounts/returns/currency-conversion/rounding contract and equivalence across Dashboard/BI/Decision/Export.

## Export Truth
**PARTIAL / EXACT-HEAD CI VERIFIED.** Scope is explicit: `CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET`. Browser report export is explicitly current-view. Static export gate detects ambiguous exporter names and pagination/client-aggregation mixing. Remaining: repository-wide consumer inventory, canonical full/filtered implementations and pagination→export regression across every exporter.

## BI ↔ Decision ↔ Analytics ↔ Export
**OPEN.** Canonical BI/Analytics sources and Decision/Outcome hardening exist, but no runtime evidence proves equivalent records/totals/counts/date/as-of/tenant/NULL semantics across all surfaces.

## Tenant Security sibling sweep
**REGRESSION-WIRED / EXACT-HEAD CI VERIFIED.** `test:tenant-sibling-boundaries` scans all SQL migrations for SECURITY DEFINER functions that accept caller-supplied tenant identity without `current_company_id()` or an explicit `TENANT_AUTHORITY: TRUSTED_INTERNAL` boundary. Run `33089346132` executed this gate successfully on exact `c2f4a019...`. This is static/CI evidence, not A/B runtime isolation proof.

## Worker / Reliability
**IMPLEMENTED / REGRESSION-WIRED / EXACT-HEAD CI VERIFIED / LIVE REQUIRED.** Durable runner uses deterministic `jobId:stage:sourceHash` idempotency keys and unsafe post-side-effect failures require manual reconciliation. `check-durable-production-runner.mjs` is now a first-class quality gate and passed on exact `c2f4a019...`. Remaining: real crash/restart/stale lease/duplicate worker/DLQ/resume/receipt drills.

## Storage / Realtime / AI / Vector
**STATIC/CONTRACT WORK ONLY — NO RUNTIME EVIDENCE.** Required: tenant A/B adversarial denial, signed URL isolation, realtime event isolation, vector metadata/retrieval/cache/deletion isolation.

## Semantic NULL / UNKNOWN / MISSING / ZERO
**ACTIVE.** Receivables, Profitability, Outcome and Dashboard secondary hardenings exist. Repository-wide implicit conversion sweep remains open.

## Document Intelligence
**REGRESSION/GATED FOUNDATION; REAL CORPUS NOT VERIFIED.** Real OCR/PDF/XLSX/CSV execution evidence remains LIVE REQUIRED.

## Inventory / Data Truth
**IMPLEMENTED / REGRESSION-WIRED IN COVERED ROUTES; CROSS-SURFACE OPEN.**

## Database / Migration Safety
**ACTIVE.** Receivables replacement uses the exact existing function signature and preserves authenticated execute grants. Full dependency/signature/grant/RLS/security-definer audit remains required; the new sibling gate extends this sweep.

## Runtime / LIVE evidence
**NO RUNTIME EVIDENCE.** Authenticated browser, tenant A/B DB+Storage+Realtime+AI/vector, worker crash/recovery, native watcher, backup restore/RPO/RTO, real document corpus, production telemetry/load/canary/rollback and crypto matrix remain required.

## Production Certification
**NOT PRODUCTION CERTIFIED.** Static/CI evidence is insufficient.

## Historical evidence — retained, not promoted
- `32910806786` / `25eef521...`: historical quality PASS; not current-head evidence.
- `32912319688` / `1773cbd...`: historical quality SUCCESS; not current-head evidence.
- `33084224087` / `fedf631...`: historical exact-head SUCCESS.
- `33085041491` / `89367a9...`: exact-head SUCCESS for F45.
- `33085371844` / `3561bf3...`: exact-head FAILURE at Dashboard secondary regression.
- `33085904618` / `e3bb2ea...`: exact-head FAILURE at Dashboard secondary regression.
- `33086226689` / `c103d249...`: exact-head FAILURE at stale effective-financial regression.
- `33086322239` / `1fe8eb2...`: exact-head FAILURE at the same stale regression.
- `33086397054` / `8ab145f...`: historical superseded state.
- `33087319123` / `4ef95a5...`: SUCCESS, exact-head CI for prior code/index state.
- `33087625052` / `f7419f3...`: SUCCESS, exact-head CI for prior code/index state.
- `33089165530` / `b86b33b2...`: SUCCESS, exact-head quality CI for the prior code/index state.
- `33089346132` / `c2f4a019...`: **SUCCESS, exact-head quality CI for the current pre-index-update state.**

## Active execution matrix
| Front | State | Next proof |
|---|---|---|
| Exact-head CI | ACTIVE | CI for resulting index tip; no PASS yet |
| Receivables | ACTIVE | zero-consumer + >page-size runtime |
| Dashboard secondary | ACTIVE | zero-consumer legacy removal + runtime |
| Profitability | ACTIVE | explicit financial contract + cross-surface equivalence |
| Export | ACTIVE | full consumer inventory + pagination regression |
| BI/Decision/Analytics | ACTIVE | invariant regression + runtime equivalence |
| Tenant siblings | CI VERIFIED / LIVE OPEN | Storage/Realtime/AI/vector + A/B adversarial runtime |
| Worker reliability | CI VERIFIED / LIVE OPEN | crash/restart/stale lease/duplicate/DLQ/resume drills |
| NULL semantics | ACTIVE | global implicit conversion sweep |
| Documents | ACTIVE | real corpus execution |
| Runtime/LIVE | BLOCKED | deployment/authenticated environment |
| Production certification | BLOCKED | required LIVE/production evidence |

## Completion percentage — evidence-weighted, not commit-count
**Current engineering completion estimate: ~70%.**

This percentage is deliberately not calculated from commits or CI green steps. It weights the lifecycle evidence maturity across the major requirement families: implementation/regression/gating/integration/consumer migration are substantially advanced; runtime and live evidence are still largely absent; production certification is not granted. Therefore the project is materially beyond foundation, but it is **not** 90–100% complete while runtime/LIVE/production proof remains missing.

Evidence maturity by lifecycle layer:
- IMPLEMENTED: high coverage across core truth/security/reliability families.
- REGRESSION-ENFORCED: high coverage; current exact-head CI `c2f4a019...` passed the registered gates.
- GATED: high coverage through Quality CI.
- INTEGRATED: substantial, but sibling consumers remain in several families.
- CONSUMER-VERIFIED: partial; zero-consumer and repository-wide consumer proof remain open for some surfaces.
- RUNTIME-EVIDENCED: **NO RUNTIME EVIDENCE**.
- LIVE-VERIFIED: **NOT VERIFIED**.
- PRODUCTION-CERTIFIED: **NOT CERTIFIED**.

## Next autonomous wave
1. Fresh exact-head CI for this resulting index tip; record only that SHA.
2. Receivables zero-consumer inventory and safe legacy removal proof.
3. Cross-surface invariant regression for tenant/date/as-of/status/NULL semantics.
4. Repository-wide exporter consumer classification and pagination→export regression.
5. Tenant sibling hardening for Storage/Realtime/AI/vector and background paths.
6. Worker state-machine recovery analysis and LIVE harness preparation.
7. Repository-wide NULL/UNKNOWN/MISSING/ZERO semantic sweep.
8. Convert CI-stable families into concrete runtime drills; do not label LIVE without evidence.

## Completion truth
**NOT PRODUCTION-CERTIFIED.** Exact-head quality CI `33089346132` successfully verifies `c2f4a019...` only. F47 exposed and fixed a real adapter/domain-boundary defect; tenant sibling and durable-runner gates also passed on that exact SHA. Runtime/live/production evidence remains absent. The ~70% figure is an evidence-weighted engineering estimate, not a certification claim.
