# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + active execution PRs. Wave 07 branch is the active truth-certification branch.

## Mandatory truth rules
- PASS is bound to an exact commit and exact CI run/job evidence; no historical PASS transfer.
- FOUNDATION, DEEP CLOSURE, CONSUMER VERIFIED, TESTED, GATED, INTEGRATED, RUNTIME VERIFIED, LIVE VERIFIED and PRODUCTION CERTIFIED are separate states.
- Missing/unknown data never becomes measured zero.
- Domain truth belongs to domain-level canonical implementations, not page-local calculations.
- Destructive legacy removal requires consumer/dependency/rollback proof.

## Wave 07 exact HEAD / CI truth
- Wave 07 starts from `e471d1fd09aa5a8a66cb541e894f55d8740a7167`.
- Wave 07 branch: `execution-wave-07-truth-certification`.
- Latest code commit: `a73bdb31da8bffb6d6e737218d01e3c701bb6364`.
- Exact-head CI for `a73bdb31...`: **PENDING / NOT OBSERVABLE** at this snapshot. No PASS is claimed.
- Exact-head combined status checked on `e471d1fd...` before Wave 07 work contained only pending CodeRabbit and no workflow run; historical PASS is not transferred.

## Wave 07 real findings → fixes
1. **Canonical profitability null-semantics gap — FIXED:** `get_executive_metrics` now tracks missing quantity/cost rows and returns nullable cost/profit/margin plus `INSUFFICIENT_DATA` instead of silently aggregating a partial cost basis.
2. **Canonical inventory operational counts — FIXED:** `get_inventory_valuation` now exposes canonical `low_stock` and `out_of_stock` counts so consumers do not recompute those domain metrics locally.
3. **Canonical monthly sales truth path — IMPLEMENTED:** `get_sales_monthly_truth` is tenant-authoritative, bounded to 1–24 months, status-aware and preserves nullable cost/profit semantics.
4. **RPC execution boundary hardening — FIXED:** canonical functions set `search_path=public`, reject invalid date ranges where applicable, revoke PUBLIC/anon execution and explicitly grant only `authenticated`.
5. **Canonical adapter semantics — FIXED:** the browser adapter preserves nullable trend values and exposes the canonical inventory operational counts without coercing unknown values to zero.

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | CONSUMER VERIFIED | TESTED | GATED | INTEGRATED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | LAST CODE COMMIT | LAST INDEX COMMIT | LAST CI | REMAINING | DEPENDENCY | RISK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | a73bdb3 | PENDING | PENDING | Supabase A/B indirect authority proof | live Supabase | CRITICAL |
| Data truth / consumer closure | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | a73bdb3 | PENDING | PENDING | full consumer migration for analytics beyond core KPIs; cross-surface runtime equivalence | real tenant runtime | HIGH |
| Cross-surface truth | YES | YES | PARTIAL | YES | PENDING | PARTIAL | LOCAL | NO | NO | a73bdb3 | PENDING | PENDING | Dashboard=Report=Export=Decision equivalence for shared metrics | real tenant runtime | HIGH |
| Import/reconciliation | YES | YES | YES* | YES | YES | YES | DETERMINISTIC | NO | NO | bf00299 | PENDING | PENDING | deployed worker concurrency/retry/rollback | live worker | CRITICAL |
| Runtime/workers | YES | YES | YES* | YES | YES | YES | SIMULATED | NO | NO | bf00299 | PENDING | PENDING | deployed crash/restart/DLQ/resume + side effects | deployed worker | CRITICAL |
| Document intelligence | YES | YES | PARTIAL | YES | YES | YES | LOCAL SEMANTIC | NO | NO | bf00299 | PENDING | PENDING | larger real corpus + OCR accuracy | real corpus | HIGH |
| Evidence/provenance | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | PENDING | PENDING | real document provenance chain | real corpus | HIGH |
| Decision/action/outcome/feedback | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | PENDING | PENDING | runtime full-loop consumer proof | runtime outcome | CRITICAL |
| Observability | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | bf00299 | PENDING | PENDING | production telemetry chain | telemetry environment | HIGH |
| Backup/restore | YES | YES | N/A | YES | YES | YES | LOCAL ARTIFACT | NO | NO | bf00299 | PENDING | PENDING | real restore/RPO/RTO/rollback | live DB/backup | CRITICAL |
| Watched folder | YES | YES | PARTIAL | YES | YES | YES | LOCAL IDENTITY | NO | NO | bf00299 | PENDING | PENDING | native persistent watcher | native adapters/devices | HIGH |
| Performance | YES | YES | N/A | PARTIAL | YES | YES | LOCAL | NO | NO | bf00299 | PENDING | PENDING | production-scale benchmark and remaining hotspots | production-scale data | MEDIUM |
| UI/E2E | YES | YES | PARTIAL | PARTIAL | YES | PARTIAL | STATIC | NO | NO | a73bdb3 | PENDING | PENDING | authenticated browser proof | auth runtime | HIGH |
| CI topology | YES | YES | N/A | YES | YES | YES | PENDING | NO | NO | a73bdb3 | PENDING | PENDING | exact current-head Actions evidence | GitHub Actions | MEDIUM |
| Production hygiene | YES | YES | PARTIAL | PARTIAL | YES | YES | NO | NO | NO | bf00299 | PENDING | PENDING | remaining concrete production-risk closure | code/runtime | MEDIUM |

\* Import/worker state means deterministic harness/invariant proof is integrated; it does not mean deployed runtime is verified.

## Wave 07 implementation
- `supabase/migrations/20260826110000_wave07_truth_certification.sql`: hardened canonical executive/inventory RPCs and added canonical monthly sales truth.
- `src/lib/canonical-data-truth.ts`: canonical adapter hardening and nullable monthly truth adapter.
- `scripts/execution-wave-07-truth-certification.mjs`: behavioral regression checks for tenant authority, RPC boundary, unknown/zero semantics, pagination invariant and canonical trend.
- Existing Wave 06 migrations and consumer wiring remain intact; no foundation rebuild was performed.

## Consumer closure truth
- **DONE locally:** Dashboard/Purchase/Inventory core KPI paths remain on canonical sources.
- **DONE locally:** canonical RPC authority and execution boundary are hardened.
- **DONE locally:** profitability missing-data semantics no longer fabricate partial cost/profit/margin.
- **DONE locally:** inventory low/out counts have a canonical domain source.
- **PARTIAL:** full consumer sweep remains for secondary analytics (monthly trend/top entities/category/aging), exports and decision metric equivalence.
- **NO LIVE CLAIM:** local source/regression proof is not runtime/live tenant equivalence.

## Behavioral regression invariants
- 21 purchase rows produce total 231; display page size cannot define the business total.
- Inventory missing quantity/unit cost remains `INSUFFICIENT_DATA`/`null`.
- Canonical RPCs reject caller-selected tenant mismatch.
- Anonymous/public callers cannot execute the canonical RPCs.
- Invalid executive date ranges are rejected.
- Missing sales quantity/cost invalidates profitability rather than silently producing partial cost/profit.
- Zero revenue produces null gross margin.
- Canonical monthly truth preserves nullable cost/profit; unknown is not coerced to zero.

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
- Obtain exact-head CI evidence for the final Wave 07 commit; if failure occurs, fix the failure family and rerun.
- Complete migration of remaining real analytics consumers to canonical domain truth.
- Prove consumer-level Dashboard=Report=Export=Decision equivalence for shared metrics.
- Complete date/status semantics and export/decision metric sweep.

### PARALLEL
- Import/worker side-effect closure.
- Document evidence provenance expansion.
- Decision/action/outcome consumer verification.
- Observability critical-flow verification.
- Backup live-drill preparation.
- Watched-folder native preparation.
- Performance hotspot fixes.
- Authenticated UI flow preparation.

### DEPENDENCY
- Live Supabase tenant/storage/realtime/AI environment, deployed worker, real DB/backup, native adapters/devices, authenticated browser tenant, real document corpus, production telemetry/load.

### DO NOT TOUCH
- BI NaN/Infinity, trend chronology, outcome identity, missing-impact truth and SHA-256 fallback unless regression/bypass/new evidence appears.
- Destructive legacy removal without consumer/dependency/rollback proof.

## Completion truth
**Wave 07 is NOT certified. Canonical/RPC deep hardening and local behavioral regressions are implemented, but full consumer closure and exact-head CI remain open. Runtime/live/production certification is not claimed.**
