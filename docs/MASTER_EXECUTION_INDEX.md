# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + active execution PRs. Wave 06 branch is the active data-truth closure branch.

## Mandatory truth rules
- PASS is bound to an exact commit and exact CI run/job evidence; no historical PASS transfer.
- FOUNDATION, DEEP CLOSURE, CONSUMER VERIFIED, TESTED, GATED, INTEGRATED, RUNTIME VERIFIED, LIVE VERIFIED and PRODUCTION CERTIFIED are separate states.
- Missing/unknown data never becomes measured zero.
- Domain truth belongs to domain-level canonical implementations, not page-local calculations.
- Destructive legacy removal requires consumer/dependency/rollback proof.

## Exact HEAD / CI truth
- Wave 06 starts from `e3163e47ef1c43afd45b65211c438c512edde746`.
- Wave 06 branch: `execution-wave-06-data-truth-closure`.
- Latest code/regression commit before this index update: `b3e58f812fa0579339ed77a852f225aa6dd8cc6f`.
- This index update creates a new HEAD; the resulting SHA must be checked independently. No CI PASS is claimed until a completed successful run exists on that exact resulting SHA.
- PR #26: `execution-wave-06-data-truth-closure` → `main`.
- Historical Wave 05/earlier PASS evidence is not transferred.

## Wave 06 real findings → fixes
1. **Dashboard KPI drift — FIXED LOCALLY:** Dashboard now calls `fetchCanonicalDashboardKPIs()` backed by tenant-authoritative `get_executive_metrics`, instead of the page-facing legacy calculation.
2. **Purchase pagination truth — FIXED LOCALLY:** purchase report totals/count/supplier count/average now come from bounded server-side `get_purchase_summary`; the 20-row query remains display-only.
3. **Inventory unknown→zero — FIXED LOCALLY:** inventory valuation now comes from `get_inventory_valuation`; if any balance row lacks quantity or unit cost, status is `INSUFFICIENT_DATA` and value is `null`.
4. **KPI contract preservation — FIXED LOCALLY:** canonical executive metrics now also return `overdue_receivables`, `collection_rate`, and explicit `inventory_status`; zero revenue yields null gross margin instead of fake zero.
5. **Consumer migration expanded — FIXED LOCALLY:** Sales and Profitability KPI cards use the same canonical KPI adapter.

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | CONSUMER VERIFIED | TESTED | GATED | INTEGRATED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | LAST CODE COMMIT | LAST INDEX COMMIT | LAST CI | REMAINING | DEPENDENCY | RISK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | b3e58f8 | PENDING | PENDING | Supabase A/B indirect authority proof | live Supabase | CRITICAL |
| Data truth / consumer closure | YES | YES | YES (Dashboard/Purchase/Inventory/Sales/Profitability core paths) | YES | PENDING | PENDING | LOCAL | NO | NO | b3e58f8 | PENDING | PENDING | full consumer sweep; date/status equivalence; runtime equivalence | real tenant runtime | HIGH |
| Cross-surface truth | YES | YES | PARTIAL | YES | PENDING | PENDING | LOCAL | NO | NO | b3e58f8 | PENDING | PENDING | Dashboard=Report=Export=Decision runtime equivalence | real tenant runtime | HIGH |
| Import/reconciliation | YES | YES | YES* | YES | YES | YES | DETERMINISTIC | NO | NO | bf00299 | PENDING | PENDING | deployed worker concurrency/retry/rollback | live worker | CRITICAL |
| Runtime/workers | YES | YES | YES* | YES | YES | YES | SIMULATED | NO | NO | bf00299 | PENDING | PENDING | deployed crash/restart/DLQ/resume + side effects | deployed worker | CRITICAL |
| Document intelligence | YES | YES | PARTIAL | YES | YES | YES | LOCAL SEMANTIC | NO | NO | bf00299 | PENDING | PENDING | larger real corpus + OCR accuracy | real corpus | HIGH |
| Evidence/provenance | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | PENDING | PENDING | real document provenance chain | real corpus | HIGH |
| Decision/action/outcome/feedback | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | PENDING | PENDING | runtime full-loop consumer proof | runtime outcome | CRITICAL |
| Observability | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | bf00299 | PENDING | PENDING | production telemetry chain | telemetry environment | HIGH |
| Backup/restore | YES | YES | N/A | YES | YES | YES | LOCAL ARTIFACT | NO | NO | bf00299 | PENDING | PENDING | real restore/RPO/RTO/rollback | live DB/backup | CRITICAL |
| Watched folder | YES | YES | PARTIAL | YES | YES | YES | LOCAL IDENTITY | NO | NO | bf00299 | PENDING | PENDING | native persistent watcher | native adapters/devices | HIGH |
| Performance | YES | YES | N/A | PARTIAL | YES | YES | LOCAL | NO | NO | bf00299 | PENDING | PENDING | concrete before/fix/after hotspots + production benchmark | production-scale data | MEDIUM |
| UI/E2E | YES | YES | PARTIAL | PARTIAL | YES | PARTIAL | STATIC | NO | NO | b3e58f8 | PENDING | PENDING | authenticated browser proof | auth runtime | HIGH |
| CI topology | YES | YES | N/A | YES | YES | YES | PENDING | NO | NO | b3e58f8 | PENDING | PENDING | exact current-head Actions evidence | GitHub Actions | MEDIUM |
| Production hygiene | YES | YES | PARTIAL | PARTIAL | YES | YES | NO | NO | NO | bf00299 | PENDING | PENDING | remaining concrete production-risk closure | code/runtime | MEDIUM |

\* Import/worker consumer state means deterministic harness/invariant proof is integrated; it does not mean deployed runtime is verified.

## Wave 06 implementation
- `supabase/migrations/20260826100000_data_truth_canonical_aggregates.sql`: tenant-authoritative purchase summary and inventory valuation aggregates.
- `supabase/migrations/20260826101500_executive_metrics_truth_contract.sql`: canonical KPI contract preserving collection/overdue semantics and inventory sufficiency.
- `src/lib/canonical-data-truth.ts`: canonical adapters for dashboard KPIs, purchase summary and inventory valuation.
- `src/pages/DashboardPage.tsx`: repaired real dashboard KPI consumer.
- `src/pages/ReportsPage.tsx`: repaired sales/profitability KPI consumers, purchase page-limited total, and inventory unknown→zero valuation.
- `scripts/execution-wave-05-consumer-regression.mjs`: extended behavioral regression for Wave 06; existing quality gate reused, no duplicate workflow.

## Consumer closure truth
- **DONE locally:** Dashboard core KPI source migrated to canonical domain aggregate.
- **DONE locally:** Purchase total no longer depends on display pagination.
- **DONE locally:** Inventory unknown valuation no longer becomes zero.
- **DONE locally:** Sales/Profitability KPI cards use the same canonical KPI adapter.
- **PARTIAL:** Reports/Exports/Decisions full equivalence across all metrics, filters, dates and as-of semantics remains to be swept.
- **NO LIVE CLAIM:** local code/regression proof is not runtime or live tenant equivalence.

## Behavioral regression invariants
- 21 purchase rows produce total 231; first-page 20-row total is not accepted as business total.
- Inventory missing quantity/unit cost remains `INSUFFICIENT_DATA`/`null`.
- Dashboard and reports cannot call the legacy Dashboard KPI calculation directly.
- Canonical RPCs reject caller-selected tenant mismatch.
- Zero revenue produces null gross margin; collection/overdue metrics remain nullable when unavailable.

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
- Verify CI against the final index commit; if failure occurs, fix the failure family and rerun.
- Complete full data-truth consumer sweep for page-local totals, pagination-derived metrics, null→zero semantics, date/status semantics and tenant authority.
- Prove consumer-level Dashboard=Report=Export=Decision equivalence for shared metrics.

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
**Wave 06 = REAL DATA TRUTH CONSUMER REPAIR EXECUTED locally with behavioral regressions integrated into the existing quality gate. The final index commit itself still requires exact-head CI evidence. Runtime/live/production certification is not claimed.**
