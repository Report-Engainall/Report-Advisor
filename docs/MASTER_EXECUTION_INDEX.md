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
- Latest code-fix commit before this index update: `bac3acbd1739591eea0df52708303122d5821143`.
- Latest branch HEAD after this index update: **recorded by GitHub as the resulting commit of this update; CI must be checked against that exact SHA before PASS is recorded.**
- PR #25: `execution-wave-05-consumer-closure` → `main`.
- Base `main`: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Exact-head workflow/status lookup for the code-fix HEAD `bac3acbd1739591eea0df52708303122d5821143` returned no completed workflow/status records at verification time.
- Therefore Wave 05 CI = **PENDING**, never PASS.
- Historical runs remain historical evidence only and are not transferred to Wave 05.

## Wave 05 real findings → fixes
1. **REAL ARCHITECTURE / DATA-CONSUMER FINDING:** `src/pages/AnalyticsPage.tsx` contained page-local RFM, ABC and Aging business calculations and directly owned tenant resolution/Supabase access.
   - Root cause: analytics consumer logic was duplicated at the page boundary instead of a canonical service.
   - Fix: created `src/lib/canonical-analytics.ts` with server-derived tenant context and canonical RFM/ABC/Aging implementations.
   - Consumer repair: RFM, ABC and Aging pages now call only the canonical analytics service.
   - Regression: `scripts/execution-wave-05-consumer-regression.mjs` blocks direct Supabase/tenant resolution in `AnalyticsPage.tsx` and requires all three canonical functions.
   - Status: **FIXED LOCALLY / REGRESSION ADDED / CI PENDING**.

2. **REAL CROSS-SURFACE OBSERVATION:** `get_executive_metrics(...)` exists as a database canonical calculation with tenant authority, while `src/lib/queries.ts` still contains a separate dashboard calculation path.
   - Status: **FOUND / NOT YET MIGRATED**.
   - Reason not blindly rewritten: the current dashboard query also preserves nullable/INSUFFICIENT_DATA semantics and several consumers depend on its return contract; migration requires consumer inventory plus regression against date/status/null semantics.
   - Next action: migrate dashboard/report KPI consumers to the canonical RPC in a dedicated safe change, then prove equivalence.

3. **REAL REPORT TRUTH OBSERVATION:** `PurchasesReportPage` calculates totals from only the first 20 fetched purchase invoices, while the report label presents the result as total purchases.
   - Status: **FOUND / NOT YET FIXED**.
   - Reason: safe fix requires a canonical server-side aggregate or an explicit paginated-summary contract; changing it to an unbounded client scan would create a performance regression.
   - Next action: add/verify canonical aggregate consumer, then regression for full-dataset total vs page data.

4. **REAL REPORT TRUTH OBSERVATION:** `InventoryReportPage` converts missing `quantity`/`unit_cost` to zero in its local total calculation.
   - Status: **FOUND / NOT YET FIXED**.
   - Reason: this is a direct violation of unknown≠zero; the safe fix is to consume canonical inventory valuation or surface unknown state, not silently substitute zero.

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | CONSUMER VERIFIED | TESTED | GATED | INTEGRATED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | LAST CODE COMMIT | LAST CI | LAST TEST | REMAINING | DEPENDENCY | RISK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tenant/security authority | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bac3acb | PENDING | Wave04 authority + Wave05 consumer review | Supabase A/B indirect runtime proof | live Supabase | CRITICAL |
| BI/data truth | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | bac3acb | PENDING | Wave05 consumer findings | migrate dashboard KPI to canonical RPC; runtime equivalence | real tenant runtime | HIGH |
| Cross-surface truth | YES | YES | PARTIAL | YES | YES | YES | LOCAL/PARTIAL | NO | NO | bac3acb | PENDING | Wave04 + Wave05 consumer review | Dashboard=Report=Export=Decision runtime equivalence | real tenant runtime | HIGH |
| Import/reconciliation | YES | YES | YES* | YES | YES | YES | DETERMINISTIC | NO | NO | bf00299 | PENDING | Wave03/04 import invariants | deployed worker concurrency/retry/rollback | live worker | CRITICAL |
| Runtime/workers | YES | YES | YES* | YES | YES | YES | SIMULATED | NO | NO | bf00299 | PENDING | Wave03/04 runtime invariants | deployed crash/restart/DLQ/resume | deployed worker | CRITICAL |
| Document intelligence | YES | YES | PARTIAL | YES | YES | YES | LOCAL SEMANTIC | NO | NO | bf00299 | PENDING | measured semantic execution | larger real corpus + OCR accuracy | real corpus | HIGH |
| Evidence/provenance | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | PENDING | provenance proof | real document evidence chain | real corpus | HIGH |
| Decision/action/outcome/feedback | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | NO | NO | bf00299 | PENDING | graph regressions + consumer scan | runtime full-loop action/outcome/feedback | runtime outcome | CRITICAL |
| Observability | YES | YES | PARTIAL | YES | YES | YES | LOCAL | NO | NO | bf00299 | PENDING | trace regressions | production telemetry chain | telemetry environment | HIGH |
| Backup/restore | YES | YES | N/A | YES | YES | YES | LOCAL ARTIFACT | NO | NO | bf00299 | PENDING | readiness harness | real restore/RPO/RTO/rollback | live DB/backup | CRITICAL |
| Watched folder | YES | YES | PARTIAL | YES | YES | YES | LOCAL IDENTITY | NO | NO | bf00299 | PENDING | watcher invariants | native persistent watcher | native adapters/devices | HIGH |
| Performance | YES | YES | N/A | PARTIAL | YES | YES | LOCAL | NO | NO | bf00299 | PENDING | deep static scan | before/fix/after + production benchmark | production-scale data | MEDIUM |
| UI/E2E | YES | YES | PARTIAL | PARTIAL | YES | PARTIAL | STATIC | NO | NO | bac3acb | PENDING | consumer regression | authenticated browser proof | auth runtime | HIGH |
| CI topology | YES | YES | N/A | YES | YES | YES | PENDING | NO | NO | bac3acb | PENDING | Wave05 workflow wiring | exact-head run evidence | GitHub Actions | MEDIUM |
| Production hygiene | YES | YES | PARTIAL | PARTIAL | YES | YES | NO | NO | NO | bf00299 | PENDING | hygiene/authority scan | concrete production-risk closure | code/runtime | MEDIUM |

\* Import/worker consumer state means proof harnesses and invariants are integrated; it does not mean deployed runtime is verified.

## Wave 05 implementation
1. `src/lib/canonical-analytics.ts` — canonical RFM/ABC/Aging consumer calculations with tenant authority derived from authenticated context.
2. `src/pages/AnalyticsPage.tsx` — removed page-local Supabase/business calculations and routed the three analytics consumers through the canonical service.
3. `scripts/execution-wave-05-consumer-regression.mjs` — regression enforcing canonical analytics routing and prohibiting page-local tenant authority.
4. `.github/workflows/quality.yml` — integrated the Wave 05 regression into the existing canonical quality workflow; no duplicate workflow created.
5. PR #25 — active execution PR carrying the Wave 05 changes.

## Real consumer closure truth
- **FIXED:** Analytics RFM/ABC/Aging were real page-local calculations; they are now service-backed.
- **PARTIAL:** Dashboard/Reports still have a canonical-RPC migration gap identified but intentionally not changed blindly.
- **PARTIAL:** Purchase report page summary is currently page-limited despite total wording.
- **PARTIAL:** Inventory report page currently has an unknown→zero conversion in local total valuation.
- Static proof is not runtime proof; no live equivalence is claimed.

## Security authority truth
- No new client-selected tenant authority was introduced by Wave 05.
- Canonical analytics derives tenant through `resolveCurrentCompanyId()` and queries tenant-scoped rows.
- Existing live-only surfaces remain: Storage/signed URLs, Realtime, AI/vector, cache/IDOR and A/B tenant isolation.

## LIVE REQUIRED — only environment-dependent evidence
1. Supabase A/B DB/Storage/Realtime/AI-vector isolation.
2. Deployed worker crash/restart/stale lease/DLQ/resume and duplicate side-effect drill.
3. Real backup restore + migration replay + rollback + RPO/RTO.
4. Windows/Android persistent watcher and iOS capability proof.
5. Authenticated browser E2E against real tenant data.
6. Real PDF/OCR/XLSX/CSV/corrupt/ambiguous corpus accuracy.
7. Production telemetry trace with tenant context and PII redaction.
8. Production-scale load/canary/rollback.

## Remaining Work Inventory
### NOW
- Obtain CI for the current exact Wave 05 HEAD; if failure occurs, fix the full failure family and rerun.
- Migrate dashboard KPI calculation to `get_executive_metrics` without losing null/unknown semantics.
- Replace purchase-report page-limited total with a canonical aggregate.
- Replace inventory-report unknown→zero valuation with canonical valuation/unknown state.
- Add consumer-level cross-surface equivalence regression after the above migration.

### PARALLEL
- Security authority proof preparation for live Supabase A/B.
- Import/worker duplicate-side-effect review.
- Document provenance expansion.
- Decision/action/outcome consumer verification.
- Observability critical-flow verification.
- Backup live drill preparation.
- Native watcher preparation.
- Performance before/fix/after fixes.
- Authenticated UI flow inventory.

### DEPENDENCY
- Live Supabase environment.
- Deployed worker.
- Real DB/backup.
- Native adapters/devices.
- Authenticated browser tenant.
- Real document corpus.
- Production telemetry/load environment.

### DO NOT TOUCH
- Closed BI NaN/Infinity, trend chronology, outcome identity, missing-impact truth and SHA-256 fallback unless regression/bypass/new evidence appears.
- Destructive legacy removal or migration without consumer/dependency/rollback proof.

## Completion truth
**Wave 05 = REAL CONSUMER REPAIR STARTED AND PROVEN LOCALLY; CI PENDING; RUNTIME PARTIAL; LIVE UNVERIFIED; NOT PRODUCTION CERTIFIED.**
