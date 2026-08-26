# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + active execution PRs. Wave 07/08 branch is the active execution truth.

## Mandatory truth rules
- PASS is bound to an exact commit and exact CI run/job evidence; no historical PASS transfer.
- FOUNDATION, DEEP CLOSURE, CONSUMER VERIFIED, TESTED, GATED, INTEGRATED, RUNTIME VERIFIED, LIVE VERIFIED and PRODUCTION CERTIFIED are separate states.
- Missing/unknown data never becomes measured zero.
- Domain truth belongs to domain-level canonical implementations, not page-local calculations.
- Destructive legacy removal requires consumer/dependency/rollback proof.

## Current exact code HEAD / CI truth
- Previous confirmed starting HEAD: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
- Active PR: `#27 — Wave 07 — Truth Certification + Canonical/RPC Deep Verification`.
- Active branch: `execution-wave-07-truth-certification`.
- Latest application/code commit before this index-only update: `bf0afb31905b00e1ff64024dd3aad008c2c923b5`.
- Exact secondary-closure CI for `bf0afb3...`: **PASS**, run `32916579545`, job `98021440854`.
- Prior exact secondary-closure run `32916517317` on `8fad4b7...` failed because the regression assertion still expected the pre-fix nullable adapter shape; that false-positive was corrected in `bf0afb3...` and the rerun passed.
- No historical PASS is transferred to any other SHA.

## Wave 08 real execution findings → fixes
1. **Secondary consumer duplication — FIXED at the compatibility boundary:** `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, `fetchCategoryBreakdown`, and `fetchAgingBuckets` now resolve through canonical secondary domain adapters. Existing consumers importing `@/lib/queries` are covered by the existing `queries-compat.ts` path alias.
2. **Secondary canonical aggregation — IMPLEMENTED:** added tenant-authoritative server-side aggregates for top customers, top products, category breakdown, and receivables aging.
3. **Secondary tenant authority — FIXED:** all new RPCs derive authority from `current_company_id()` and reject caller-supplied tenant mismatch; adapters resolve tenant from trusted context.
4. **Secondary unknown/zero semantics — FIXED:** unknown top/customer/product/category values are never coerced to zero. They raise `REPORT_DATA_UNAVAILABLE` at the strict UI adapter boundary. Aging uses explicit `UNDATED`; empty buckets remain legitimate zeroes.
5. **Bounded secondary aggregation — FIXED:** top-N server aggregation is bounded to 1–50 and does not fetch raw sales rows into the browser for aggregation.
6. **RPC execution boundary — HARDENED:** new secondary functions are `SECURITY INVOKER`, set `search_path = public`, revoke PUBLIC/anon execution and grant only `authenticated`.
7. **Regression false-positive — FIXED:** the Wave 08 gate was updated to validate the actual strict unknown-data contract instead of requiring a nullable adapter implementation that had already been intentionally hardened.

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | CONSUMER VERIFIED | TESTED | GATED | INTEGRATED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | LAST CODE COMMIT | LAST INDEX COMMIT | LAST CI | REMAINING | DEPENDENCY | RISK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf0afb3 | index update | 32916579545 | Supabase A/B authority proof | live Supabase | CRITICAL |
| Data truth / consumer closure | YES | YES | IMPROVED / PARTIAL | YES | YES | YES | LOCAL | NO | NO | bf0afb3 | index update | 32916579545 | exports/decision equivalence; remaining non-query business logic sweep | real tenant runtime | HIGH |
| Cross-surface truth | YES | YES | PARTIAL | PARTIAL | PARTIAL | PARTIAL | LOCAL | NO | NO | bf0afb3 | index update | 32916579545 | Dashboard=Report=Export=Decision runtime equivalence | real tenant runtime | HIGH |
| Import/reconciliation | YES | YES | YES* | YES | YES | YES | DETERMINISTIC | NO | NO | bf00299 | index update | 32916579545 | deployed worker concurrency/retry/rollback | live worker | CRITICAL |
| Runtime/workers | YES | YES | YES* | YES | YES | YES | SIMULATED | NO | NO | bf00299 | index update | 32916579545 | deployed crash/restart/DLQ/resume + side effects | deployed worker | CRITICAL |
| Document intelligence | YES | YES | PARTIAL | YES | YES | YES | LOCAL SEMANTIC | NO | NO | bf00299 | index update | 32916579545 | larger real corpus + OCR accuracy | real corpus | HIGH |
| Evidence/provenance | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | index update | 32916579545 | real document provenance chain | real corpus | HIGH |
| Decision/action/outcome/feedback | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | index update | 32916579545 | runtime full-loop consumer proof | runtime outcome | CRITICAL |
| Observability | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | bf00299 | index update | 32916579545 | production telemetry chain | telemetry environment | HIGH |
| Backup/restore | YES | YES | N/A | YES | YES | YES | LOCAL ARTIFACT | NO | NO | bf00299 | index update | 32916579545 | real restore/RPO/RTO/rollback | live DB/backup | CRITICAL |
| Watched folder | YES | YES | PARTIAL | YES | YES | YES | LOCAL IDENTITY | NO | NO | bf00299 | index update | 32916579545 | native persistent watcher | native adapters/devices | HIGH |
| Performance | YES | YES | N/A | PARTIAL | YES | YES | LOCAL | NO | NO | bf00299 | index update | 32916579545 | production-scale benchmark and remaining hotspots | production-scale data | MEDIUM |
| UI/E2E | YES | YES | PARTIAL | PARTIAL | YES | PARTIAL | STATIC | NO | NO | bf0afb3 | index update | 32916579545 | authenticated browser proof | auth runtime | HIGH |
| CI topology | YES | YES | N/A | YES | YES | YES | PENDING | NO | NO | bf0afb3 | index update | 32916579545 | full quality workflow exact-head evidence | GitHub Actions | MEDIUM |
| Production hygiene | YES | YES | PARTIAL | PARTIAL | YES | YES | NO | NO | NO | bf00299 | index update | 32916579545 | remaining concrete production-risk closure | code/runtime | MEDIUM |

\* Import/worker state means deterministic harness/invariant proof is integrated; it does not mean deployed runtime is verified.

## Wave 08 implementation
- `supabase/migrations/20260826120000_secondary_consumer_truth.sql`: canonical secondary aggregates for top customers, top products, category breakdown and aging, with trusted tenant authority and bounded top-N.
- `src/lib/canonical-secondary-data-truth.ts`: browser adapter for canonical secondary aggregates; unknown numeric values are never coerced to zero.
- `src/lib/queries-compat.ts`: existing `@/lib/queries` compatibility boundary routes the five secondary consumers to canonical adapters, so existing pages are migrated without duplicating business logic in UI.
- `scripts/execution-wave-08-secondary-consumer-closure.mjs`: behavioral contract checks.
- `.github/workflows/wave08-secondary-consumer-closure.yml`: exact-branch CI gate, including the execution index as evidence input.
- `.github/workflows/quality.yml`: canonical quality workflow now includes the Wave 08 secondary consumer closure regression command.

## Consumer closure truth
- **DONE locally:** secondary monthly trend/top customers/top products/category/aging query consumers route through canonical domain adapters.
- **DONE locally:** secondary aggregation is server-side and tenant-authoritative.
- **DONE locally:** top-N aggregation is bounded; browser no longer performs secondary business aggregation.
- **DONE locally:** unknown secondary values are not fabricated as zero.
- **PARTIAL:** export truth, decision metric equivalence, full date/status semantic equivalence and complete repository-wide direct-Supabase business calculation sweep remain.
- **NO LIVE CLAIM:** local source/regression proof is not runtime/live tenant equivalence.

## Behavioral regression invariants
- Secondary top-N is bounded to 1–50.
- Caller-selected tenant mismatch is rejected by every new secondary RPC.
- New secondary RPCs are not executable by PUBLIC/anon.
- Secondary adapters resolve tenant from trusted current-company context.
- Top customer/product/category unknown values surface as unavailable rather than zero.
- Aging distinguishes `UNDATED` from numeric aging buckets.
- Browser adapters do not aggregate raw `sales_invoices` or `sale_items` for these secondary metrics.
- Monthly trend remains on the canonical sales-truth path and refuses to fabricate missing numeric values.

## LIVE REQUIRED
1. Supabase A/B DB/Storage/Realtime/AI-vector isolation.
2. Deployed worker crash/restart/stale lease/DLQ/resume and duplicate-side-effect drill.
3. Real backup restore + migration replay + rollback + RPO/RTO.
4. Windows/Android persistent watcher and iOS capability proof.
5. Authenticated browser E2E against real tenant data.
6. Real PDF/OCR/XLSX/CSV/corrupt/ambiguous corpus accuracy.
7. Production telemetry trace with tenant context and PII redaction.
8. Production-scale load/canary/rollback.

## Remaining Work
### NOW
- Obtain exact-head evidence for the final repository/index commit; the dedicated secondary closure gate is already green on the latest application code commit.
- Complete full repository consumer sweep for exports, decisions and any remaining direct business calculations.
- Prove Dashboard=Report=Export=Decision equivalence for shared metrics under identical tenant/filter/date/status/as-of contracts.
- Continue legacy consumer inventory and remove only after zero-consumer proof.

### PARALLEL
- Import/worker side-effect closure.
- Document evidence provenance expansion.
- Decision/action/outcome consumer verification.
- Observability critical-flow verification.
- Backup local deterministic restore preparation.
- Watched-folder native preparation.
- Performance hotspot fixes.
- Authenticated UI flow preparation.

### DEPENDENCY
- Live Supabase tenant/storage/realtime/AI environment, deployed worker, real DB/backup, native adapters/devices, authenticated browser tenant, real document corpus, production telemetry/load.

### DO NOT TOUCH
- BI NaN/Infinity, trend chronology, outcome identity, missing-impact truth and SHA-256 fallback unless regression/bypass/new evidence appears.
- Destructive legacy removal without consumer/dependency/rollback proof.

## Completion truth
**Secondary consumer closure is implemented and has exact dedicated CI PASS on `bf0afb3...`; overall production certification is NOT claimed. Full cross-surface/export/decision/runtime/live closure remains open.**
