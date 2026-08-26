# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26

## Truth rules
- PASS is bound to exact SHA + exact CI run/job; historical PASS is never transferred.
- UNKNOWN / MISSING / INSUFFICIENT_DATA is never silently converted to business ZERO.
- Domain truth belongs to canonical domain implementations, not page-local calculations.
- RUNTIME/LIVE/PRODUCTION_CERTIFIED are separate evidence levels.

## Execution identity
- Requested baseline: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
- PR: **#27 — Wave 07 — Truth Certification + Canonical/RPC Deep Verification**.
- Branch: `execution-wave-07-truth-certification`.
- Previous application/code HEAD: `ffb5e1f956530a1f415ab08cc8abdb556c6435ce`.
- Current application/code HEAD: `c325d7c97e9440a4a1ed5c3edb54c9c4189dc665`.
- Exact-head Wave 09 CI: run `32922121995`, job `98037598098`, **PASS**; behavioral regression and Typecheck succeeded.
- This index commit is documentation-only and is intentionally separate from the application/code HEAD.

## REAL CLOSURE EXECUTED

### Export truth — IMPLEMENTED / REGRESSION / CI VERIFIED
- Inventory export uses tenant-authoritative canonical RPC truth.
- Sales and purchase export loaders are bounded and explicitly exclude `cancelled`/`void`.
- Export loaders preserve nullable source values.

### Executive metric null semantics — IMPLEMENTED / REGRESSION / CI VERIFIED
- Root cause: previous executive SQL used `COALESCE(...,0)` for business totals and treated zero-revenue margin as zero.
- Fix: `supabase/migrations/20260826161000_executive_metric_null_semantics.sql` returns NULL + `INSUFFICIENT_DATA` when required source values are missing; tenant/date authority remains server-side.
- `src/lib/canonical-data-truth.ts` preserves nullable metrics and performs arithmetic only after explicit finite/non-null proof.

### Aging cross-surface truth — IMPLEMENTED / REGRESSION / CI VERIFIED
- Root cause: Dashboard reduced canonical aging buckets locally, allowing a partial dataset to appear as a complete total.
- Fix: `supabase/migrations/20260826160000_aging_total_canonical.sql` owns canonical `total` and returns NULL when incomplete.
- `src/lib/canonical-secondary-data-truth.ts` preserves nullable buckets/total.
- `src/pages/DashboardPage.tsx` no longer performs aging business aggregation.

### Category margin truth — IMPLEMENTED / REGRESSION / CI VERIFIED
- Root cause: Reports recalculated category margin from canonical sales/profit rows.
- Fix: `supabase/migrations/20260826162000_category_margin_canonical.sql` owns `margin_pct`; adapter and Reports consume it directly.

### Dashboard tenant boundary — IMPLEMENTED / REGRESSION / CI VERIFIED
- Root cause: dashboard KPI adapter directly read customer/product counts from browser Supabase queries instead of canonical service truth.
- Fix: `supabase/migrations/20260826163000_executive_dimension_counts_canonical.sql` adds tenant-authoritative counts RPC; `src/lib/canonical-data-truth.ts` now consumes that RPC.

### CI failure family — CLOSED
- `32922009120` / job `98037278057` on `67a51f4...`: **FAIL** because Wave 09 inspected the wrong analytics artifact layer.
- Root cause: regression gate looked for SQL tenant tokens in `src/lib/canonical-analytics.ts`.
- Fix: `ffb5e1f956530a1f415ab08cc8abdb556c6435ce` changed the regression to inspect `20260826131000_analytics_domain_truth.sql`.
- `32922065424` / job `98037433772` on `ffb5e1f...`: **PASS**.
- `32922121995` / job `98037598098` on `c325d7...`: **PASS**.

## Capability matrix
| Capability | Implemented | Tested | Regression | Gated | Consumer Verified | Runtime | LIVE | Production |
|---|---|---|---|---|---|---|---|---|
| Inventory export canonical truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Sales/Purchase export status truth | YES | YES | YES | YES | YES (source/code) | NO | NO | NO |
| Executive metric null semantics | YES | YES | YES | YES | YES | NO | NO | NO |
| Executive dimension counts | YES | YES | YES | YES | YES | NO | NO | NO |
| Secondary domain aggregates | YES | YES | YES | YES | YES | NO | NO | NO |
| Secondary RPC payload contract | YES | YES | YES | YES | YES | NO | NO | NO |
| Dashboard aging total truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Category margin canonical truth | YES | YES | YES | YES | YES | NO | NO | NO |
| RFM/ABC domain truth | YES | YES | YES | YES | YES | NO | NO | NO |
| Decision fail-closed truth | YES | YES | YES | YES | YES (code path) | PARTIAL | NO | NO |
| Tenant/RLS boundary | Existing + hardened | YES | YES | YES | PARTIAL | PARTIAL | REQUIRED | NO |
| Cross-surface runtime equivalence | PARTIAL | YES (static) | YES | YES | PARTIAL | REQUIRED | REQUIRED | NO |

## Consumer / legacy status
- `ExecutiveCommandCenterPage` has zero dependency on legacy `fetchDashboardKPIs`.
- Secondary consumer pages use canonical secondary adapters.
- Legacy secondary wrappers remain only where compatibility proof is still required.
- `src/lib/queries.ts` still contains historical business-calculation implementations; zero-consumer proof/removal remains OPEN and follows SEARCH → INVENTORY → MIGRATE → REGRESSION → ZERO CONSUMERS → REMOVE.
- No destructive legacy deletion without dependency proof.

## Data Truth status
- UNKNOWN / NULL / INSUFFICIENT_DATA is preserved for executive profitability, inventory valuation, secondary aggregates and aging totals.
- Cancelled/void semantics are aligned for closed export/secondary paths.
- Date/as-of semantics are canonical for aging and bounded secondary aggregates.
- Repository-wide sibling sweep remains OPEN outside migrated consumers.

## LIVE REQUIRED
1. Authenticated Dashboard → Reports → Exports → Decisions equivalence against real tenant data.
2. Supabase A/B DB/Storage/Realtime/AI-vector isolation.
3. Deployed worker crash/restart/stale lease/DLQ/resume and duplicate-side-effect drill.
4. Real backup restore/migration replay/rollback/RPO/RTO.
5. Native Windows/Android/iOS watcher proof.
6. Real PDF/OCR/XLSX/CSV/corrupt/ambiguous corpus accuracy.
7. Production telemetry trace with tenant context and PII redaction.
8. Production-scale load/canary/rollback.
9. Decision → Evidence → Recommendation → Action → Outcome → Feedback live provenance.

## Remaining work — NOW
- Full repository-wide business-calculation sibling sweep and zero-consumer legacy removal.
- Full export truth for remaining CSV/XLSX/PDF/report-download surfaces not yet covered.
- Decision metric/evidence/outcome runtime provenance.
- Full date/status equivalence across remaining domains.
- Tenant authority verification for Storage, Realtime, AI/vector, Workers, Notifications, Decisions and Outcomes.
- Real document corpus/OCR evidence.
- Worker/Watcher/Backup live drills.
- Authenticated browser E2E and production-scale performance evidence.

## Completion truth
**NOT CERTIFIED.** Real code/data-truth fixes, consumer migration, export status alignment, canonical aging total, canonical category margin, tenant-authoritative dimension counts, regressions and exact-head CI closure are implemented and verified. Runtime, LIVE and Production Certification are not claimed.
