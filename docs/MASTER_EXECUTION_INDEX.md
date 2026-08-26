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
- Execution branch: `execution-wave-07-truth-certification`.
- Application/code head for this closure snapshot: `3fc22d4d087d617d2a91ce713f6941be2d79c0b2`.
- Metadata/CI-path commit after that code head: `e81cf6d9115d649f6122b4d5f9b4031ab1a7babe`.
- The metadata-only follow-up is intentionally covered by the same closure workflow; the application/code SHA remains `3fc22d4...`.

## Exact CI evidence
- **Wave 09 closure:** Run `32917584237`, job `98024419620`, exact SHA `3fc22d4d087d617d2a91ce713f6941be2d79c0b2` — **PASS**.
  - Behavioral truth regression: **12/12 PASS**.
  - Typecheck: **PASS**.
  - Job conclusion: **success**.
- Additional Wave 09 exact run on the same SHA: `32917580254`, job `98024408130` — **PASS**.
- **Wave 08 secondary-consumer gate:** Run `32917545812` — **PASS** after the regression contract was updated to accept nullable canonical status semantics.
- Earlier Wave 09 failures were not transferred as PASS: `32917247184` and `32917406163` failed during iterative repair; their root causes were fixed and re-run.

## REAL CROSS-SURFACE CLOSURE — implemented

### 1. Export truth — IMPLEMENTED + REGRESSION + CI VERIFIED
- Root cause: report exports could be sourced from display-page subsets or page-local inventory data.
- Fix: `src/lib/report-export-data.ts` adds tenant-authoritative, chunked export loaders (500-row chunks, 5,000-row hard bound) for Sales/Purchases/Inventory.
- Receivables export derives from the same bounded sales dataset and preserves missing values.
- `src/pages/ReportsPage.tsx` now separates display pagination from export dataset acquisition.
- No unbounded fetch-all is used as a business aggregation workaround.

### 2. Inventory operational truth — IMPLEMENTED + REGRESSION + CI VERIFIED
- Root cause: `lowStock` / `outOfStock` were recomputed from display rows.
- Fix: Inventory report uses canonical `get_inventory_valuation` counts (`low_stock`, `out_of_stock`).
- Page-local inventory KPI filtering is explicitly gated against regression.

### 3. Receivables aging/as-of truth — IMPLEMENTED + REGRESSION + CI VERIFIED
- Root cause: aging could depend implicitly on current date and page-local semantics; missing due dates could be conflated with a numeric aging bucket.
- Fix: `get_receivables_aging_truth_as_of(p_company_id,p_as_of)` uses trusted tenant context, explicit as-of semantics, and `UNDATED` for missing due dates.
- `canonical-analytics.ts` and Reports consume the canonical path.

### 4. RFM/ABC truth — IMPLEMENTED + REGRESSION + CI VERIFIED
- Root cause: browser-side analytic aggregation did not share the same cancelled/void status contract as sales canonical truth.
- Fix: `get_sales_rfm_truth` and `get_sales_abc_truth` are tenant-authoritative server-side domain functions; analytics consumes them.

### 5. Secondary nullable truth — IMPLEMENTED + REGRESSION + CI VERIFIED
- `CanonicalTopEntity.value`, category sales/profit/quantity preserve `number | null`.
- `CanonicalRowsResult` is array-compatible for existing consumers while exposing `status` and `asOf` metadata.
- Dashboard filters only null values for chart presentation; it does not turn them into zero.
- Wave 08 regression was repaired to assert nullable preservation instead of requiring the old strict-number implementation.

### 6. Decision truth — IMPLEMENTED + TYPECHECK/REGRESSION + CI VERIFIED
- `calculateDecisionScore` now returns `score: number | null` and blocks on missing/non-finite factors with `INSUFFICIENT_DATA`.
- `resolveDecisionChain` blocks when the score is unknown instead of treating it as a numeric threshold failure.
- `explainDecision` preserves the unknown score and produces a blocking explanation rather than fabricated confidence.
- `intelligence-gate` now blocks unknown outcome accuracy when the outcome sample is otherwise eligible.

## Files / migrations materially changed
- `src/pages/DashboardPage.tsx`
- `src/pages/ReportsPage.tsx`
- `src/lib/canonical-secondary-data-truth.ts`
- `src/lib/canonical-analytics.ts`
- `src/lib/report-export-data.ts`
- `src/lib/intelligence/decisionScore.ts`
- `src/lib/intelligence/decisionChain.ts`
- `src/lib/intelligence/decisionExplainability.ts`
- `src/lib/analytics/intelligence-gate.ts`
- `supabase/migrations/20260826130000_cross_surface_truth_closure.sql`
- `supabase/migrations/20260826131000_analytics_domain_truth.sql`
- `scripts/execution-wave-09-cross-surface-closure.mjs`
- `scripts/execution-wave-08-secondary-consumer-closure.mjs`
- `.github/workflows/wave09-cross-surface-closure.yml`
- `docs/MASTER_EXECUTION_INDEX.md`

## Capability matrix
| Capability | Implemented | Tested | Regression | Gated | Consumer verified | Runtime | LIVE | Production |
|---|---|---|---|---|---|---|---|---|
| Export truth | YES | YES | YES | YES | YES (source-level) | NO | NO | NO |
| Dashboard canonical secondary truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Inventory operational truth | YES | YES | YES | YES | YES | NO | NO | NO |
| RFM/ABC domain truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Aging as-of truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Decision fail-closed truth | YES | YES | YES | YES | YES (code path) | PARTIAL | NO | NO |
| Tenant/RLS boundary | Existing + hardened | YES | YES | YES | PARTIAL | PARTIAL | REQUIRED | NO |
| Cross-surface runtime equivalence | PARTIAL | YES (static) | YES (static) | YES | PARTIAL | REQUIRED | REQUIRED | NO |

## Legacy closure
- Secondary legacy wrappers remain only where compatibility is still required by existing import contracts.
- Removal must continue as: SEARCH → MIGRATE → REGRESSION → ZERO CONSUMERS → REMOVE.
- No destructive legacy deletion was performed merely to make a gate pass.

## Remaining PARTIAL / LIVE REQUIRED
- Authenticated runtime equivalence across Dashboard → Reports → Exports → Decisions still requires a real tenant/browser execution; CI source proof is not LIVE proof.
- Decision Metric → Evidence → Recommendation → Decision → Outcome → Feedback runtime provenance remains partially unverified because no live evidence loop is available in CI.
- Supabase A/B tenant isolation, Storage/Realtime/AI-vector, deployed worker crash/restart/DLQ, real backup restore/RPO/RTO, native watcher, authenticated browser E2E, real OCR/document corpus, production telemetry, load/canary/rollback remain LIVE REQUIRED.
- Production certification remains blocked until those live requirements and exact production evidence exist.

## Production certification
**NOT CERTIFIED.** This snapshot has real implementation, behavioral regression and exact CI evidence, but no LIVE or Production Certified claim is made.
