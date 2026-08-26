# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + active execution PRs. Wave 05 branch is the active real-consumer closure branch.

## Mandatory truth rules
- PASS is bound to an exact commit and exact CI run/job evidence.
- A prior PASS is never transferred to a newer HEAD.
- FOUNDATION, DEEP CLOSURE, CONSUMER VERIFIED, TESTED, GATED, INTEGRATED, RUNTIME VERIFIED, LIVE VERIFIED and PRODUCTION CERTIFIED are separate states.
- Missing/unknown data never becomes measured zero.
- No fake runtime/live evidence and no cryptographic fallback.
- Independent fronts run in parallel; destructive consolidation requires consumer/dependency/rollback analysis.

## Exact HEAD / CI truth
- Wave 05 started from Wave 04 exact-head/index truth: `bf00299ec1f9ff91db8e6a99a18a5b4b608111cd`.
- Wave 05 implementation branch: `execution-wave-05-consumer-closure`.
- Latest code/workflow commit before the latest index update: `dc59de79a3e49f11385b234dd5c3c4b2e365ae8c`.
- Previous index commit: `6739e4774713b932b4838fb606d7a93fc36a26fc`.
- Current branch HEAD is the new index commit created by this update; its exact SHA must be checked separately and no PASS may be inferred from `dc59de79...` or `6739e477...`.
- PR #25: `execution-wave-05-consumer-closure` → `main`.
- Base `main`: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Exact-head workflow/status lookup for `dc59de79a3e49f11385b234dd5c3c4b2e365ae8c` returned no completed workflow/status records at verification time.
- Therefore Wave 05 CI = **PENDING**, never PASS.
- Historical runs remain historical evidence only and are not transferred to Wave 05.

## Wave 05 real findings → fixes
1. **REAL ARCHITECTURE / DATA-CONSUMER FINDING — FIXED:** `src/pages/AnalyticsPage.tsx` contained page-local RFM, ABC and Aging business calculations and directly owned tenant resolution/Supabase access.
   - Root cause: analytics consumer logic was duplicated at the page boundary instead of a canonical service.
   - Fix: `src/lib/canonical-analytics.ts` now owns RFM/ABC/Aging calculations and derives tenant context through the existing authority resolver.
   - Consumer repair: RFM, ABC and Aging pages now call only the canonical analytics service.
   - Regression: `scripts/execution-wave-05-consumer-regression.mjs` blocks direct Supabase/tenant resolution in `AnalyticsPage.tsx` and requires all three canonical functions.
   - Status: **FIXED / REGRESSION ADDED / CI PENDING**.

2. **REAL CROSS-SURFACE OBSERVATION:** `get_executive_metrics(...)` exists as a database canonical calculation with tenant authority, while `src/lib/queries.ts` still contains a separate dashboard calculation path.
   - Status: **FOUND / NOT YET MIGRATED**.
   - Reason: the current dashboard query preserves nullable/INSUFFICIENT_DATA semantics and several consumers depend on its return contract; a safe migration needs an explicit null/status/date regression before replacing it.
   - Next action: migrate dashboard/report KPI consumers to the canonical RPC only after equivalence tests are in place.

3. **REAL REPORT TRUTH OBSERVATION:** `PurchasesReportPage` calculates totals from only the first 20 fetched purchase invoices while labeling the value as total purchases.
   - Status: **FOUND / NOT YET FIXED**.
   - Reason: a naive client-side all-pages scan would introduce unbounded work; the safe fix is a canonical aggregate contract.

4. **REAL REPORT TRUTH OBSERVATION:** `InventoryReportPage` converts missing `quantity`/`unit_cost` to zero in its local valuation.
   - Status: **FOUND / NOT YET FIXED**.
   - Reason: direct unknown→zero violation; safe fix requires canonical valuation or explicit unknown state.

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | CONSUMER VERIFIED | TESTED | GATED | INTEGRATED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | LAST CODE COMMIT | LAST INDEX COMMIT | LAST CI | REMAINING | DEPENDENCY | RISK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | dc59de7 | 6739e47 | PENDING | Supabase A/B indirect runtime proof | live Supabase | CRITICAL |
| BI/data truth | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | dc59de7 | 6739e47 | PENDING | canonical KPI migration + runtime equivalence | real tenant runtime | HIGH |
| Cross-surface truth | YES | YES | PARTIAL | YES | YES | YES | LOCAL/PARTIAL | NO | NO | dc59de7 | 6739e47 | PENDING | Dashboard=Report=Export=Decision runtime equivalence | real tenant runtime | HIGH |
| Import/reconciliation | YES | YES | YES* | YES | YES | YES | DETERMINISTIC | NO | NO | bf00299 | 6739e47 | PENDING | deployed worker concurrency/retry/rollback | live worker | CRITICAL |
| Runtime/workers | YES | YES | YES* | YES | YES | YES | SIMULATED | NO | NO | bf00299 | 6739e47 | PENDING | deployed crash/restart/DLQ/resume | deployed worker | CRITICAL |
| Document intelligence | YES | YES | PARTIAL | YES | YES | YES | LOCAL SEMANTIC | NO | NO | bf00299 | 6739e47 | PENDING | larger real corpus + OCR accuracy | real corpus | HIGH |
| Evidence/provenance | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | 6739e47 | PENDING | real document evidence chain | real corpus | HIGH |
| Decision/action/outcome/feedback | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | 6739e47 | PENDING | runtime full-loop action/outcome/feedback | runtime outcome | CRITICAL |
| Observability | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | bf00299 | 6739e47 | PENDING | production telemetry chain | telemetry environment | HIGH |
| Backup/restore | YES | YES | N/A | YES | YES | YES | LOCAL ARTIFACT | NO | NO | bf00299 | 6739e47 | PENDING | real restore/RPO/RTO/rollback | live DB/backup | CRITICAL |
| Watched folder | YES | YES | PARTIAL | YES | YES | YES | LOCAL IDENTITY | NO | NO | bf00299 | 6739e47 | PENDING | native persistent watcher | native adapters/devices | HIGH |
| Performance | YES | YES | N/A | PARTIAL | YES | YES | LOCAL | NO | NO | bf00299 | 6739e47 | PENDING | before/fix/after + production benchmark | production-scale data | MEDIUM |
| UI/E2E | YES | YES | PARTIAL | PARTIAL | YES | PARTIAL | STATIC | NO | NO | dc59de7 | 6739e47 | PENDING | authenticated browser proof | auth runtime | HIGH |
| CI topology | YES | YES | N/A | YES | YES | YES | PENDING | NO | NO | dc59de7 | 6739e47 | PENDING | exact current HEAD run evidence | GitHub Actions | MEDIUM |
| Production hygiene | YES | YES | PARTIAL | PARTIAL | YES | YES | NO | NO | NO | bf00299 | 6739e47 | PENDING | concrete production-risk closure | code/runtime | MEDIUM |

\* Import/worker consumer state means proof harnesses and invariants are integrated; it does not mean deployed runtime is verified.

## Wave 05 implementation
- `src/lib/canonical-analytics.ts`: canonical RFM/ABC/Aging consumer calculations.
- `src/pages/AnalyticsPage.tsx`: repaired real consumers to use canonical analytics service.
- `scripts/execution-wave-05-consumer-regression.mjs`: regression for canonical analytics routing.
- `.github/workflows/quality.yml`: integrated the regression into the existing quality workflow; no duplicate workflow created.
- PR #25: active Wave 05 execution branch.

## Consumer closure truth
- **DONE:** RFM/ABC/Aging page-local business logic removed and replaced by canonical service path.
- **PARTIAL:** Dashboard/Reports canonical KPI migration identified but not performed blindly.
- **PARTIAL:** Purchase report page-limited total identified.
- **PARTIAL:** Inventory report unknown→zero identified.
- **NO LIVE CLAIM:** static consumer repair is not runtime equivalence proof.

## Security authority truth
- Wave 05 introduced no new client-selected tenant authority.
- Canonical analytics derives tenant from the existing authenticated authority resolver.
- Storage/signed URL, Realtime, AI/vector, cache/IDOR and A/B isolation remain live-proof surfaces.

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
- Verify CI against the current branch HEAD after this index update; if failure, fix the full failure family and rerun.
- Migrate dashboard KPI calculation to canonical truth with null/status/date regression.
- Replace purchase-report page-limited total with canonical aggregate.
- Replace inventory-report unknown→zero valuation with canonical valuation/unknown state.
- Add consumer-level cross-surface equivalence regression after KPI migration.

### PARALLEL
- Live Supabase A/B authority proof preparation.
- Worker duplicate-side-effect review.
- Document provenance expansion.
- Decision/action/outcome consumer verification.
- Observability critical-flow verification.
- Backup live-drill preparation.
- Native watcher preparation.
- Performance before/fix/after work.
- Authenticated UI flow inventory.

### DEPENDENCY
- Live Supabase, deployed worker, real DB/backup, native adapters/devices, authenticated browser tenant, real document corpus, production telemetry/load.

### DO NOT TOUCH
- BI NaN/Infinity, trend chronology, outcome identity, missing-impact truth and SHA-256 fallback unless regression/bypass/new evidence appears.
- Destructive legacy removal without consumer/dependency/rollback proof.

## Completion truth
**Wave 05 = REAL CONSUMER REPAIR EXECUTED; one real consumer family closed with regression; additional real truth gaps identified; CI PENDING; runtime PARTIAL; LIVE UNVERIFIED; production certification NOT CLAIMED.**
