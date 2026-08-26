# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + active execution PRs. Wave 07/08 branch is the active execution truth.

## Mandatory truth rules
- PASS is bound to an exact commit and exact CI run/job evidence; no historical PASS transfer.
- FOUNDATION, DEEP CLOSURE, CONSUMER VERIFIED, TESTED, GATED, INTEGRATED, RUNTIME VERIFIED, LIVE VERIFIED and PRODUCTION CERTIFIED are separate states.
- Missing/unknown data never becomes measured zero.
- Domain truth belongs to domain-level canonical implementations, not page-local calculations.
- Destructive legacy removal requires consumer/dependency/rollback proof.

## Current exact HEAD / CI truth
- Previous confirmed Wave 07 HEAD: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
- Active PR: `#27 — Wave 07 — Truth Certification + Canonical/RPC Deep Verification`.
- Active branch: `execution-wave-07-truth-certification`.
- Current code HEAD: `8fad4b753fdc970c01ac0d4a9fc1d3936d819524`.
- Exact-head Actions runs for `8fad4b7...`: **NO RUN OBSERVED YET**. No CI PASS is claimed.
- Historical PASS is not transferred.

## Wave 08 real execution findings → fixes
1. **Secondary consumer duplication — FIXED at the compatibility boundary:** `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, `fetchCategoryBreakdown`, and `fetchAgingBuckets` now resolve through canonical secondary domain adapters rather than the legacy browser aggregation implementations. Existing consumers importing `@/lib/queries` are covered by the existing `queries-compat.ts` path alias.
2. **Secondary canonical aggregation — IMPLEMENTED:** added tenant-authoritative server-side aggregates for top customers, top products, category breakdown, and receivables aging.
3. **Secondary tenant authority — FIXED:** all new RPCs derive authority from `current_company_id()` and reject a caller-supplied tenant mismatch; adapters resolve the tenant from trusted context.
4. **Secondary unknown/zero semantics — FIXED:** canonical adapters never coerce unknown top/customer/product/category values to zero. Unknown values produce `REPORT_DATA_UNAVAILABLE` rather than a fabricated metric. Aging uses an explicit `UNDATED` bucket; empty buckets remain legitimate zeroes.
5. **Bounded secondary aggregation — FIXED:** top-N server aggregation is bounded to 1–50 and does not fetch raw sales rows into the browser for aggregation.
6. **RPC execution boundary — HARDENED:** new secondary functions are `SECURITY INVOKER`, set `search_path = public`, revoke PUBLIC/anon execution and grant only `authenticated`.
7. **Behavioral closure gate — IMPLEMENTED:** `scripts/execution-wave-08-secondary-consumer-closure.mjs` verifies tenant authority, execution boundary, bounded aggregation and unknown semantics; a dedicated GitHub Actions workflow gates those checks.

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | CONSUMER VERIFIED | TESTED | GATED | INTEGRATED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | LAST CODE COMMIT | LAST INDEX COMMIT | LAST CI | REMAINING | DEPENDENCY | RISK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | 8fad4b7 | 8fad4b7 | NO RUN | Supabase A/B authority proof | live Supabase | CRITICAL |
| Data truth / consumer closure | YES | YES | IMPROVED / PARTIAL | YES | PENDING EXACT CI | YES | LOCAL | NO | NO | 8fad4b7 | 8fad4b7 | NO RUN | exports/decision equivalence; remaining non-query business logic sweep | real tenant runtime | HIGH |
| Cross-surface truth | YES | YES | PARTIAL | PARTIAL | PENDING | PARTIAL | LOCAL | NO | NO | 8fad4b7 | 8fad4b7 | NO RUN | Dashboard=Report=Export=Decision runtime equivalence | real tenant runtime | HIGH |
| Import/reconciliation | YES | YES | YES* | YES | YES | YES | DETERMINISTIC | NO | NO | bf00299 | 8fad4b7 | NO RUN | deployed worker concurrency/retry/rollback | live worker | CRITICAL |
| Runtime/workers | YES | YES | YES* | YES | YES | YES | SIMULATED | NO | NO | bf00299 | 8fad4b7 | NO RUN | deployed crash/restart/DLQ/resume + side effects | deployed worker | CRITICAL |
| Document intelligence | YES | YES | PARTIAL | YES | YES | YES | LOCAL SEMANTIC | NO | NO | bf00299 | 8fad4b7 | NO RUN | larger real corpus + OCR accuracy | real corpus | HIGH |
| Evidence/provenance | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | 8fad4b7 | NO RUN | real document provenance chain | real corpus | HIGH |
| Decision/action/outcome/feedback | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | 8fad4b7 | NO RUN | runtime full-loop consumer proof | runtime outcome | CRITICAL |
| Observability | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | bf00299 | 8fad4b7 | NO RUN | production telemetry chain | telemetry environment | HIGH |
| Backup/restore | YES | YES | N/A | YES | YES | YES | LOCAL ARTIFACT | NO | NO | bf00299 | 8fad4b7 | NO RUN | real restore/RPO/RTO/rollback | live DB/backup | CRITICAL |
| Watched folder | YES | YES | PARTIAL | YES | YES | YES | LOCAL IDENTITY | NO | NO | bf00299 | 8fad4b7 | NO RUN | native persistent watcher | native adapters/devices | HIGH |
| Performance | YES | YES | N/A | PARTIAL | YES | YES | LOCAL | NO | NO | bf00299 | 8fad4b7 | NO RUN | production-scale benchmark and remaining hotspots | production-scale data | MEDIUM |
| UI/E2E | YES | YES | PARTIAL | PARTIAL | YES | PARTIAL | STATIC | NO | NO | 8fad4b7 | 8fad4b7 | NO RUN | authenticated browser proof | auth runtime | HIGH |
| CI topology | YES | YES | N/A | YES | PENDING | YES | PENDING | NO | NO | 8fad4b7 | 8fad4b7 | NO RUN | exact current-head Actions evidence | GitHub Actions | MEDIUM |
| Production hygiene | YES | YES | PARTIAL | PARTIAL | YES | YES | NO | NO | NO | bf00299 | 8fad4b7 | NO RUN | remaining concrete production-risk closure | code/runtime | MEDIUM |

\* Import/worker state means deterministic harness/invariant proof is integrated; it does not mean deployed runtime is verified.

## Wave 08 implementation
- `supabase/migrations/20260826120000_secondary_consumer_truth.sql`: canonical secondary aggregates for top customers, top products, category breakdown and aging, with trusted tenant authority and bounded top-N.
- `src/lib/canonical-secondary-data-truth.ts`: browser adapter for canonical secondary aggregates; unknown numeric values are not converted to zero.
- `src/lib/queries-compat.ts`: existing `@/lib/queries` compatibility boundary now routes the five secondary consumers to canonical adapters, so existing pages are migrated without duplicating business logic in UI.
- `scripts/execution-wave-08-secondary-consumer-closure.mjs`: behavioral contract checks.
- `.github/workflows/wave08-secondary-consumer-closure.yml`: exact-branch CI gate for the new secondary closure checks.

## Consumer closure truth
- **DONE locally:** secondary monthly trend/top customers/top products/category/aging query consumers are routed through canonical domain adapters.
- **DONE locally:** secondary aggregation is server-side and tenant-authoritative.
- **DONE locally:** top-N aggregation is bounded; browser no longer performs the secondary business aggregation.
- **DONE locally:** unknown secondary values are not fabricated as zero.
- **PARTIAL:** export truth, decision metric equivalence, full date/status semantic equivalence and complete repository-wide direct-Supabase business calculation sweep remain.
- **NO LIVE CLAIM:** local source/regression proof is not runtime/live tenant equivalence.

## Behavioral regression invariants
- Secondary top-N is bounded to 1–50.
- Caller-selected tenant mismatch is rejected by every new secondary RPC.
- New secondary RPCs are not executable by PUBLIC/anon.
- Secondary adapters resolve tenant from trusted current-company context.
- Top customer/product/category unknown values remain unknown and surface as unavailable rather than zero.
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
- Obtain exact-head CI evidence for `8fad4b7...`; if failure occurs, close the failure family and rerun.
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
**This execution batch has real secondary consumer closure implemented, but the overall Wave 07/08 objective is NOT certified. Exact-head CI evidence is not yet observable and cross-surface/export/decision/runtime/live closure remains open. No production certification is claimed.**
