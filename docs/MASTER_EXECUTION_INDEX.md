# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `main` + active execution PRs.

## Mandatory truth rules
- PASS is bound to an exact commit and exact CI run/job evidence; no historical PASS transfer.
- FOUNDATION, DEEP CLOSURE, IMPLEMENTED, TESTED, REGRESSION, GATED, INTEGRATED, CONSUMER VERIFIED, RUNTIME VERIFIED, LIVE VERIFIED and PRODUCTION CERTIFIED remain separate states.
- UNKNOWN / MISSING / INSUFFICIENT_DATA never becomes a fabricated business zero.
- Domain truth belongs to domain-level canonical implementations, not page-local calculations.
- Destructive legacy removal requires consumer/dependency/rollback proof.

## Exact HEAD / CI
- Requested starting HEAD: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
- Previous active PR head before this closure batch: `b19d93cf6420d5020a3b2ae024b3d2bfde03c48b`.
- Active PR: `#27 — Wave 07 — Truth Certification + Canonical/RPC Deep Verification`.
- Execution branch: `execution-wave-07-truth-certification`.
- Closure work was built from the latest active PR head (`b19d93cf...`), which is 11 commits ahead of the requested `ef3f4a02...` baseline and contains the previously verified secondary-consumer closure.
- Current closure branch HEAD before PR fast-forward: `ce7fba057085a46714a685ad0cf109191dcb95cd`.
- Exact CI for `ce7fba057...`: **PENDING** until Actions completes. No PASS is claimed here.

## This execution batch — REAL CROSS-SURFACE CLOSURE

### Findings → root cause → fixes
1. **Export truth — FIXED locally**
   - Root cause: report exports for Sales/Purchases/Inventory/Receivables were sourced from display-page subsets (20/50 rows) or page-local inventory data.
   - Fix: added bounded tenant-authoritative export loaders in `src/lib/report-export-data.ts`; export is chunked at 500 rows and fails closed above 5,000 instead of silently truncating.
   - Consumer migration: `src/pages/ReportsPage.tsx` now uses full bounded export datasets while display pagination remains display-only.

2. **Inventory operational KPI drift — FIXED locally**
   - Root cause: Inventory report recomputed `lowStock` / `outOfStock` from display rows.
   - Fix: report now consumes canonical `get_inventory_valuation` counts (`low_stock`, `out_of_stock`).
   - Regression: closure gate rejects page-local `balances.filter(...)` KPI derivation.

3. **Receivables date semantics — FIXED locally**
   - Root cause: aging truth depended implicitly on `CURRENT_DATE` and duplicated page-local calculations; analytics aging also fell back from missing due date to invoice date.
   - Fix: added `get_receivables_aging_truth_as_of(p_company_id,p_as_of)` with trusted tenant authority and explicit as-of semantics; canonical analytics and Reports use it. Missing due dates remain `UNDATED`.

4. **RFM/ABC semantic drift — FIXED locally**
   - Root cause: canonical analytics were aggregating browser-side and did not apply the same `cancelled/void` status contract as the newer sales-domain aggregates.
   - Fix: added tenant-authoritative server-side `get_sales_rfm_truth` and `get_sales_abc_truth`; canonical analytics now consume those RPCs.

5. **Secondary nullable semantics — HARDENED**
   - Root cause: secondary adapter types could force nullable business values through strict numeric conversion.
   - Fix: `CanonicalTopEntity` and category metrics preserve `number | null`; consumers filter only for presentation/chartability and surface `INSUFFICIENT_DATA` instead of manufacturing zero.

### Files / migrations changed
- `src/pages/ReportsPage.tsx`
- `src/lib/canonical-analytics.ts`
- `src/lib/canonical-secondary-data-truth.ts`
- `src/lib/report-export-data.ts`
- `supabase/migrations/20260826130000_cross_surface_truth_closure.sql`
- `supabase/migrations/20260826131000_analytics_domain_truth.sql`
- `scripts/execution-wave-09-cross-surface-closure.mjs`
- `.github/workflows/wave09-cross-surface-closure.yml`
- `docs/MASTER_EXECUTION_INDEX.md`

## Capability truth matrix
| CAPABILITY | FOUNDATION | DEEP CLOSURE | IMPLEMENTED | TESTED | REGRESSION | GATED | CONSUMER VERIFIED | RUNTIME VERIFIED | LIVE VERIFIED | PRODUCTION CERTIFIED | CURRENT STATE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Export truth | YES | YES | YES | PENDING CI | YES (local contract) | PENDING | YES locally | NO | NO | NO | GATED/PENDING CI |
| Cross-surface business truth | YES | YES | YES for repaired report/analytics paths | PENDING CI | YES (local contract) | PENDING | PARTIAL | NO | NO | NO | PARTIAL: runtime equivalence remains |
| Inventory operational truth | YES | YES | YES | PENDING CI | YES | PENDING | YES locally | NO | NO | NO | GATED/PENDING CI |
| RFM/ABC domain truth | YES | YES | YES | PENDING CI | YES | PENDING | YES locally | NO | NO | NO | GATED/PENDING CI |
| Aging as-of truth | YES | YES | YES | PENDING CI | YES | PENDING | YES locally | NO | NO | NO | GATED/PENDING CI |
| Secondary consumers | YES | YES | YES | YES | YES | PASS on prior exact secondary head only | YES locally | LOCAL | NO | NO | CLOSED locally / prior CI PASS |
| Tenant/security authority | YES | YES | YES locally | YES | YES | prior gates | PARTIAL | PARTIAL | NO | NO | LIVE A/B required |
| Decision/action/outcome truth | YES | YES | PARTIAL | YES | YES | YES | PARTIAL | PARTIAL | NO | NO | PARTIAL: no proven metric bypass found in this batch; runtime loop remains |
| Document intelligence | YES | YES | existing | YES | YES | YES | PARTIAL | LOCAL | NO | NO | LIVE corpus required |
| Import/worker/watcher | YES | YES | existing | YES | YES | YES | YES* | SIMULATED | NO | NO | deployed runtime required |
| Backup/restore | YES | YES | existing | YES | YES | YES | N/A | LOCAL ARTIFACT | NO | NO | real restore required |
| Observability | YES | YES | existing | YES | YES | YES | PARTIAL | LOCAL | NO | NO | production telemetry required |

\* Deterministic harness/invariant proof does not mean deployed worker certification.

## Regression gate
`node scripts/execution-wave-09-cross-surface-closure.mjs` proves:
- exports use bounded full-dataset loaders;
- inventory operational counts are canonical;
- receivables uses explicit as-of truth;
- RFM/ABC use canonical RPCs;
- cancelled/void status semantics are enforced in analytics SQL;
- tenant authority is server-side;
- nullable secondary business values remain nullable;
- no page-local inventory KPI aggregation remains.

Dedicated workflow: `.github/workflows/wave09-cross-surface-closure.yml`.

## Remaining PARTIAL / LIVE REQUIRED
- Exact-head Actions proof for the final repository HEAD is still required.
- Dashboard = Report = Export = Decision runtime equivalence requires authenticated real-tenant execution; local source/regression proof is not LIVE proof.
- Decision metric/evidence full-loop runtime proof remains required; this batch found no safe static bypass to repair without inventing a contract.
- Supabase A/B tenant isolation, Storage/Realtime/AI-vector, deployed worker crash/restart/DLQ, real restore/RPO/RTO, native watcher, authenticated browser E2E, real document corpus/OCR, production telemetry, production-scale load/canary/rollback remain LIVE REQUIRED.

## Production certification
**NOT CERTIFIED.** This batch contains real implementation and behavioral regression work. No Production Certified or LIVE Verified claim is made without exact evidence.
