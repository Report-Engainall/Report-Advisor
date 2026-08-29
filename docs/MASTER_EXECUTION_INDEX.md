# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-29  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `closure/cross-tenant-reference-integrity`  

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Certification baseline before this closure: `4da16b9a7433e66ccf8a62b183552a872a718ef8`.
- Runtime routing closure head: `96826543ac146d91b54c38f82e2bf7d09f2670e5`.
- This branch adds a production-applied cross-tenant reference integrity hardening migration and its adversarial verification evidence.
- Runtime, LIVE, and production certification remain unclaimed.

## Batch — invoice page-read tenant/security closure
Finding: `fetchSalesInvoices()` and `fetchPurchaseInvoices()` were bounded paginated display reads but did not explicitly bind their query predicates to the authoritative tenant context, unlike sibling reads.

Classification: `SECURITY/TENANT ISSUE + PERFORMANCE/DETERMINISM`

Root cause: invoice list reads relied on downstream RLS alone while the shared query boundary lacked an explicit fail-closed tenant context and deterministic tie-break ordering.

Fix:
- `src/lib/queries.ts` requires `resolveCurrentCompanyId()` before either invoice read.
- Both queries explicitly constrain `company_id` to the resolved tenant.
- Both retain hard page-size bounds (1..500).
- Both use deterministic `invoice_date DESC, id ASC` ordering before range pagination.

Regression: `scripts/check-tenant-adversarial-contract.mjs` covers tenant context, explicit company predicates and bounded deterministic pagination.

Status: `IMPLEMENTED → REGRESSION GUARD`; exact-head CI/runtime/live pending.

## P0 — Data Quality
Browser business-quality aggregation was migrated to `get_data_quality_snapshot()` with tenant authority from `current_company_id()`. Legacy bridge/page removal was preceded by repository consumer proof.

Status: `IMPLEMENTED → CONSUMER MIGRATED → ZERO-LEGACY-PATH PROOF IN REPOSITORY → REGRESSION`; exact-head CI/database/runtime pending.

## P1 — Dashboard Intelligence tenant boundary
Direct browser reads of recommendations/alerts were replaced by `get_dashboard_intelligence(p_limit)`, deriving tenant authority from `current_company_id()`, with fixed search_path, bounded output and authenticated-only execution.

Regression: `src/lib/dashboard-canonical.intelligence.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/live runtime pending.

## P1 — Forecast read boundary
Direct `forecasts` table read was replaced by `get_forecast_snapshot(p_limit)`, tenant-authoritative, explicitly projected, bounded and deterministic.

Regression: `src/lib/queries.forecast.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI/runtime pending.

## P1 — Export tenant authority hardening
Finding: `get_inventory_export_rows(p_company_id, ...)` did not assert the caller-supplied company id matched server tenant authority.

Fix:
- Added `supabase/migrations/20260826080000_export_tenant_authority_hardening.sql`.
- Inventory export fails closed on `TENANT_CONTEXT_MISMATCH` and derives data from `current_company_id()`.
- Export RPCs have fixed `search_path`, anonymous execution revoked, and authenticated execution explicitly granted.

Regression: `src/lib/export-tenant-authority.contract.test.ts`.

Status: `IMPLEMENTED → REGRESSION`; exact-head CI and live A/B export isolation pending.

## Deep closure — cross-tenant reference integrity
Finding: several direct foreign-key relationships were structurally valid but did not themselves guarantee that referenced entities belonged to the same tenant.

Affected paths identified by live schema/trigger audit:
- `payments.customer_id`
- `payments.supplier_id`
- `payments.invoice_id`
- `sale_items.product_id`
- `purchase_items.product_id`
- `warehouses.branch_id`

Root cause: tenant-aware RLS protected row visibility, but relational integrity can still require an explicit same-tenant invariant when a child row carries tenant context independently or inherits it through an invoice.

Fix applied to the certification Supabase project as `harden_cross_tenant_reference_integrity_v2` and mirrored canonically in `supabase/migrations/20260829175705_harden_cross_tenant_reference_integrity_v2.sql`:
- payment references must resolve to the same `company_id` as the payment;
- sale/purchase item products must resolve to the company owning the referenced invoice;
- warehouse branch references must resolve to the warehouse company;
- mismatches fail closed with `TENANT_CONTEXT_MISMATCH`;
- missing referenced entities fail closed rather than being silently accepted.

Verification:
- migration application succeeded;
- all four new trigger families are present for INSERT/UPDATE;
- adversarial transaction exercised six cross-tenant mutation attempts and completed successfully only when every attempt was rejected with `TENANT_CONTEXT_MISMATCH`;
- all temporary test rows were removed; post-test counts for test customer/supplier/product/invoice/branch/warehouse markers are zero;
- business corpus remains unchanged: companies=2 and core product/customer/supplier/transaction tables remain empty.

Status: `PRODUCTION DB MUTATED FOR PROVEN DEFECT → ADVERSARIAL VERIFIED`; exact-head CI/live authenticated evidence still required.

## Deep closure — watched report file tenant boundary

Finding: `record_watched_report_file(p_folder_id,...)` was SECURITY DEFINER and derived the stored `company_id` from the caller, but did not independently verify that the caller's authoritative tenant owned the supplied `folder_id`.

Classification: `SECURITY/TENANT + WATCHER INTEGRITY`

Root cause: the function trusted the child row's derived company context without validating the referenced folder's company context.

Fix applied to the certification Supabase project as `harden_watched_report_file_tenant_boundary` and mirrored canonically in `supabase/migrations/20260829180903_harden_watched_report_file_tenant_boundary.sql`:
- requires authenticated tenant context;
- rejects blank identity fields;
- rejects negative/NULL file size;
- validates the accepted watcher-file state set;
- verifies `watched_report_folders.id` belongs to `current_company_id()`;
- fails closed with `FOLDER_NOT_FOUND_OR_FORBIDDEN` on cross-tenant or missing folders.

Adversarial verification:
- created two temporary folders under the two existing certification tenants inside a transaction;
- authenticated as the first tenant;
- attempted to record a file against the second tenant's folder;
- the call was rejected with the expected `FOLDER_NOT_FOUND_OR_FORBIDDEN`;
- transaction rolled back; no test data persisted.

Status: `PRODUCTION DB MUTATED FOR PROVEN DEFECT → ADVERSARIAL VERIFIED`; exact-head CI/live authenticated evidence still required.

## DB migration drift finding
Live database currently contains **62** tracked migrations after the latest hardening migration, while the repository routing closure head does not yet mirror all later production hardening migrations applied during the current execution wave.

Classification: `REPOSITORY/PRODUCTION SCHEMA DRIFT`

Impact: future fresh environments cannot be assumed equivalent to the currently hardened production database until the later applied migrations are restored into repository history and exact-head certification includes them.

Status: `OPEN / HIGH PRIORITY`; do not claim fresh-environment equivalence until reconciled.

## DB-only legacy candidate — get_sales_secondary_metrics
`supabase/migrations/20260826003000_sales_secondary_canonical_analytics.sql` still defines it. Repository consumer search found no source consumer, but external/database consumers cannot be excluded. Keep as `LEGACY CANDIDATE / EXTERNAL-CONSUMER RISK`; do not destructively drop yet.

## Batch — queries-compat tenant/canonical boundary regression
Finding: `src/lib/queries-compat.ts` is intentionally retained as a compatibility boundary, but it still owns several direct tenant-scoped operations and canonical export adapters; these paths require a permanent guard against accidental reintroduction of browser business truth or caller-controlled tenant authority.

Root cause: compatibility modules are high-risk drift points because they preserve old import surfaces while newer canonical services evolve independently.

Fix:
- Added `scripts/check-queries-compat-boundary.mjs`.
- The regression requires all secondary analytics exports to delegate to canonical implementations.
- It rejects direct sales-table aggregation and calls to the legacy `get_sales_secondary_metrics` RPC.
- It requires authoritative `resolveCurrentCompanyId()` / `TENANT_REQUIRED` fail-closed semantics.
- It checks tenant-scoped alerts, recommendations and import-job paths retain the shared tenant guard.
- It checks export compatibility retains the bounded `p_max_rows: 10000` contract.

Consumer state: compatibility remains only where repository consumers require the old import surface; business truth remains owned by canonical `queries.ts`/RPC paths.

Legacy state: no destructive removal of `queries-compat.ts`; DB-only secondary analytics remains protected by external-consumer risk.

Regression execution: **NOT EXECUTED in this environment**. The repository was updated with the guard, but no local checkout/runtime was available to execute it here; this is explicitly not counted as PASS.

Exact-head CI: **PENDING / NOT OBSERVED for the post-index SHA**.

Status: `IMPLEMENTED → REGRESSION ADDED → CI PENDING`; not CLOSED.


## Security advisor finding — SECURITY DEFINER review
A fresh Supabase security-advisor scan after the watcher hardening still reports authenticated EXECUTE on multiple SECURITY DEFINER functions, including `claim_report_execution_job`, `record_watched_report_file`, `current_company_id`, decision approval/outcome functions, and trust/eligibility predicates. These are not blindly revoked because several are deliberate privileged boundaries and revocation could break runtime paths. The next action is consumer-by-consumer classification followed by least-privilege grants or relocation where justified.

Additional advisor finding: leaked-password protection is disabled. This remains `NOT PROVEN` as closed in this cycle because no safe account-level mutation path was exercised.

## Current cycle evidence
- Migration `20260829180903_harden_watched_report_file_tenant_boundary` applied and tracked in Supabase.
- Current live migration count: **62**.
- Vercel deployment `dpl_9XiBy6ieMGwZRWCYg6CfX2ky8KJZ` is READY and tied to exact Git SHA `238c63ba129e5da3792adca94146187dd743d92f`.
- Vercel build error scan contains no build failures; only npm allow-scripts and Browserslist warnings.
- Vercel runtime error scan for the selected 24h window reports no runtime errors.
- Exact-head GitHub Actions for `238c63ba129e5da3792adca94146187dd7433e66ccf8a62b183552a872a718ef8` were not observed at the time of this update; no PASS is claimed.

## Parallel remaining fronts
### Front A — Canonical Data Truth
- Full `queries-compat.ts` function/consumer graph.
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.

### Front B — Consumer + Legacy Closure
- zero-consumer proof for compatibility functions.
- duplicate business engines.
- DB-only legacy candidates with external-consumer risk.

### Front C — BI / Decision / Export
- cross-surface equivalence.
- Forecast/Demand Velocity/Inventory Intelligence.
- export metric/date/status/as-of/filter equivalence.

### Front D — Security / Tenant
- RPC grants/search_path/RLS.
- Storage/Realtime/AI-vector.
- workers, notifications and generated files.
- cross-tenant relational integrity.

### Front E — Performance
- unbounded reads.
- query plans/indexes.
- N+1 and payload bounds.

### Front F — Reliability
- worker/watcher/queue/retry/idempotency/DLQ/recovery.
- backup/restore/RPO/RTO.

### Front G — Runtime/LIVE
- authenticated E2E.
- Supabase A/B isolation.
- OCR corpus, native watcher, telemetry, load/canary/rollback.

## Status ladder
- IMPLEMENTED: current fixes implemented.
- TESTED/REGRESSION: repository behavioral/contract evidence exists; execution must be separately evidenced.
- GATED: **NO CLAIM** for current HEAD until exact-head CI evidence exists.
- CONSUMER VERIFIED: only where consumer evidence is explicit.
- RUNTIME VERIFIED: NO CLAIM.
- LIVE VERIFIED: NO.
- PRODUCTION CERTIFIED: NO.

## LIVE REQUIRED
Supabase A/B tenant isolation; Storage; Realtime; AI/vector; authenticated browser E2E; real OCR/document corpus; worker crash/recovery/DLQ; native watcher; backup restore/RPO/RTO; production telemetry; load/canary/rollback; production scale/query-plan evidence.

## Next execution
Continue independent fronts without waiting for CI: cross-surface BI/Decision/Export truth, NULL semantics, tenant/security sibling discovery, relational integrity, migration reconciliation, and reliability/performance contract closure. Exact-head CI is a certification barrier, not a reason to pause independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.
