# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26

## Truth rules
- PASS is bound to an exact SHA + exact CI run/job. Historical PASS is never transferred.
- UNKNOWN / MISSING / INSUFFICIENT_DATA is never silently converted to business ZERO.
- Domain truth belongs to domain-level canonical implementations, not page-local calculations.
- RUNTIME/LIVE/PRODUCTION_CERTIFIED are separate from local implementation and CI proof.

## Execution identity
- Requested baseline: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
- Active PR: **#27 — Wave 07 — Truth Certification + Canonical/RPC Deep Verification**.
- Original execution branch: `execution-wave-07-truth-certification`.
- Closure work branch: `execution-wave-closure-export-decision`.
- Current exact application/CI HEAD: `fe4b29681618e3c6300846a454c8cdd85796df2e`.
- Previous closure HEAD: `2c08085c3bd6980caae79973deb500b212750a02`.
- Exact-head CI for `fe4b296...`: **PENDING / NOT YET OBSERVED**. No PASS is claimed.

## REAL CLOSURE EXECUTED

### Export truth — IMPLEMENTED
Root cause: Inventory export reconstructed business valuation in the page from `quantity * unit_cost`, creating a second business-truth calculation and risking UNKNOWN→ZERO drift.

Fix:
- Added `get_inventory_export_truth(uuid)` in `supabase/migrations/20260826140000_inventory_export_truth.sql`.
- RPC is `SECURITY INVOKER`, `search_path=public`, tenant-authoritative via `current_company_id()`, rejects caller-selected tenant mismatch, and grants execution only to `authenticated`.
- Canonical export rows carry `quantity`, `unit_cost`, nullable `value`, and explicit `value_status`.
- `src/lib/report-export-data.ts` now consumes the canonical RPC for inventory export.
- `src/pages/ReportsPage.tsx` now renders inventory export from canonical `result.rows`; the export path no longer performs page-local `quantity * unit_cost`.
- Sales/Purchase exports remain bounded (500-row chunks, 5,000-row hard cap) and tenant-scoped.

### CI topology / gate integrity — FIXED
A real CI-topology finding was identified in the Wave 07 branch diff: several established quality gates had been removed from `.github/workflows/quality.yml` (Import RPC tenant context, business key, lint, build, performance budget, intelligence/production contracts, analysis runtime contracts, document service runtime contracts, report truth, production readiness, full resilience). These were not accepted as a simplification.

Fix:
- Restored the removed gates from the main quality contract.
- Kept the new Wave 08 and Wave 09 truth regressions in the same canonical quality job.
- No skip, whitelist, expected-result manipulation, or checker weakening was used.

### Regression — IMPLEMENTED
`execution-wave-09-cross-surface-closure.mjs` now fails if inventory export returns to page-local valuation or if the canonical export RPC loses tenant authority. Existing secondary/cross-surface assertions remain active.

### CI gate — IMPLEMENTED
`.github/workflows/quality.yml` directly executes the Wave 09 cross-surface/export regression and retains the previously established downstream quality gates.

## Existing closure retained
- Dashboard/Purchase/Inventory core KPI paths remain canonical.
- Secondary analytics (monthly trend/top customers/top products/category/aging) use canonical RPC adapters.
- RFM/ABC use tenant-authoritative domain RPCs with cancelled/void semantics.
- Receivables aging uses explicit as-of canonical truth.
- Decision score/chain fail closed on missing or non-finite decision factors.
- Canonical adapters preserve nullable business values.

## Capability matrix
| Capability | Implemented | Tested | Regression | Gated | Consumer verified | Runtime | LIVE | Production |
|---|---|---|---|---|---|---|---|---|
| Inventory export canonical truth | YES | PENDING exact-head | YES | YES | YES (source proof) | NO | NO | NO |
| Export truth overall | YES | PENDING exact-head | YES | YES | YES (source proof) | NO | NO | NO |
| CI gate integrity | YES | PENDING exact-head | YES | YES | YES | NO | NO | NO |
| Dashboard/secondary canonical truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Inventory operational truth | YES | YES | YES | YES | YES | NO | NO | NO |
| RFM/ABC domain truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Aging as-of truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Decision fail-closed truth | YES | YES | YES | YES | YES (code path) | PARTIAL | NO | NO |
| Tenant/RLS boundary | Existing + hardened | YES | YES | YES | PARTIAL | PARTIAL | REQUIRED | NO |
| Cross-surface runtime equivalence | PARTIAL | YES (static) | YES (static) | YES | PARTIAL | REQUIRED | REQUIRED | NO |

## Legacy closure
- Secondary legacy wrappers remain where compatibility is still required.
- Removal rule remains: SEARCH → MIGRATE → REGRESSION → ZERO CONSUMERS → REMOVE.
- No destructive deletion was used to make CI pass.

## Exact-head CI truth
- Current HEAD `fe4b29681618e3c6300846a454c8cdd85796df2e`: **PENDING / NOT OBSERVED**.
- Previous Wave 09 PASS evidence belongs to prior SHA(s) and is not transferred.
- The next exact-head run must validate workflow integrity, restored gates, typecheck/build/lint/performance, Wave 08 regression, Wave 09 cross-surface/export regression, and all existing quality gates.

## LIVE REQUIRED
1. Authenticated Dashboard → Reports → Exports → Decisions equivalence against real tenant data.
2. Supabase A/B DB/Storage/Realtime/AI-vector isolation.
3. Deployed worker crash/restart/stale lease/DLQ/resume and duplicate-side-effect drill.
4. Real backup restore/migration replay/rollback/RPO/RTO.
5. Native Windows/Android/iOS watcher proof.
6. Real PDF/OCR/XLSX/CSV/corrupt/ambiguous corpus accuracy.
7. Production telemetry trace with tenant context and PII redaction.
8. Production-scale load/canary/rollback.

## Remaining work — NOW
- Obtain exact-head CI evidence for `fe4b296...`; fix any real failure and rerun on the new SHA.
- Continue full business-calculation sibling sweep for remaining page/component/export/decision formulas.
- Continue date/status equivalence verification for metrics not yet covered by canonical contracts.
- Complete decision metric → evidence → outcome runtime provenance.
- Remove only legacy paths proven to have zero consumers.

## Completion truth
**NOT CERTIFIED.** Real export-truth implementation and CI gate restoration are complete in code, but exact-head CI for `fe4b296...` is pending, runtime/live evidence is not claimed, and Production Certification remains blocked by live requirements.
