# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-28  
Repository: `Report-Engainall/Report-Advisor`  
Branch: `parallel/batch-48-data-truth`

## Permanent execution policy
`PARALLEL DISCOVERY → FAILURE-FAMILY INVENTORY → ROOT-CAUSE CLUSTERING → BATCH IMPLEMENTATION → CONSUMER/LEGACY CLOSURE → BATCH REGRESSION → EXACT-HEAD CI → VERIFY → INDEX → NEXT PARALLEL FRONTS`

No historical PASS promotion. No scanner-only closure. No runtime/LIVE/production claims without matching evidence.

## Exact state
- Main contains the integrated deep-closure wave through commit `c7b21db4d68e396fa6ceefe3f6fdc15b1a8b8d4c` before this branch's work.
- Current batch branch contains Batch 48 data-truth hardening through the indexed HEAD recorded below.
- Exact-head CI must be evaluated against the current SHA; no historical run is promoted.
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

## Batch 48 — ABC/XYZ Data Truth
Finding: the ABC/XYZ classifier accepted non-finite numeric inputs, allowing `NaN`/`Infinity` to contaminate classification and downstream evidence.

Root cause: the classifier had numeric business calculations but no explicit finite-input boundary before sorting, cumulative value calculation, or coefficient-of-variation calculation.

Canonical fix:
- `src/lib/free-toolbox/abc-xyz.ts` now rejects non-finite `annualValue` and non-finite demand values with `RangeError`.
- Existing negative annual-value normalization and cumulative classification semantics are retained.

Regression:
- `scripts/abc-xyz-runtime.test.ts` exercises normal classification and rejection of `NaN`, `Infinity`, `-Infinity`, and non-finite demand.
- `package.json` exposes `test:abc-xyz-runtime`.
- `scripts/check-abc-xyz-truth.mjs` requires both the implementation boundary and executable runtime regression wiring.

Consumer proof: **OPEN**. The current repository search establishes the Reports inventory consumer and its canonical `row.value` path, but full ABC/XYZ consumer graph and cross-surface equivalence remain unverified.

## Batch 49 — Reports inventory consumer migration
Finding: `src/pages/ReportsPage.tsx` recalculated inventory row value in the browser as `quantity × unit_cost`, despite the canonical `InventoryReportRow.value` contract.

Root cause: the report table retained presentation-era business arithmetic after the authoritative inventory snapshot had been introduced.

Canonical fix:
- Migrated the inventory report table to render `row.value` directly.
- Missing value remains `—`; no browser fallback-to-zero was introduced.
- Existing canonical `snapshot.totalValue`, `unknownRows`, and `dataStatus` remain the report-level source of truth.

Consumer proof: **IMPLEMENTED** for this identified Reports inventory consumer.

Regression: **PENDING EXECUTION**. A repository regression proving the report consumer does not reintroduce `quantity × unit_cost` should be added/executed before closure.

Legacy proof: **OPEN** until repository-wide search establishes no remaining duplicate inventory-value calculations in other report/BI/export consumers.

Exact code HEAD after consumer migration: `82b6db7ecf51088678de497ba67506223fad0c9d`.

Exact-head CI: **NOT OBSERVED** for `82b6db7ecf51088678de497ba67506223fad0c9d`; no historical PASS promoted.

Status: `IMPLEMENTED → CONSUMER MIGRATED → REGRESSION PENDING → EXACT-HEAD CI PENDING`; not CLOSED.

## Parallel remaining fronts
### Front A — Canonical Data Truth
- Full `queries-compat.ts` function/consumer graph.
- NULL/UNKNOWN/INSUFFICIENT_DATA semantics.
- date/status/as-of consistency.
- remaining browser business aggregation.
- ABC/XYZ consumer graph and cross-surface metric equivalence.

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
Continue independent fronts without waiting for CI: cross-surface BI/Decision/Export truth, NULL semantics, tenant/security sibling discovery, and reliability/performance contract closure. Exact-head CI is a certification barrier, not a reason to pause independent work.

PRODUCTION CERTIFIED = NO until real LIVE evidence exists.


## Batch 50 — Canonical query boundary promotion / compatibility collapse

Finding: the repository had a split query surface: `@/lib/queries` was forcibly aliased to `queries-compat.ts`, while canonical consumers could also import `queries.ts` directly. Two real consumers (`src/App.tsx`, `src/lib/import/batch-folder.ts`) imported the compatibility module explicitly. This created a future drift path where a compatibility layer could regain business logic or silently diverge from the canonical API.

Root cause: the compatibility boundary was still an implementation owner rather than a pure re-export, and both TypeScript and Vite redirected the canonical-looking `@/lib/queries` path to it.

Closure implementation:
- Promoted the complete tenant-aware import/job operations, alert/recommendation mutations, purchase summary, inventory valuation, and bounded canonical export adapters into `src/lib/queries.ts`.
- Preserved the stronger import-job progress semantics: progress is translated against the authoritative job total and the current row counters rather than treating percentage as row counts.
- Migrated the two direct compatibility consumers to `@/lib/queries`.
- Reduced `src/lib/queries-compat.ts` to a pure `export * from './queries'` compatibility boundary.
- Removed the `@/lib/queries` compatibility alias from both `tsconfig.app.json` and `vite.config.ts`; the canonical path now resolves naturally to `src/lib/queries.ts`.
- Added `test:queries-compat-boundary` and rewrote `scripts/check-queries-compat-boundary.mjs` to fail if compatibility regains business functions, tenant DB access, or legacy secondary analytics calls.

Consumer proof:
- Before migration, explicit repository consumers were `src/App.tsx` and `src/lib/import/batch-folder.ts`.
- Both were migrated.
- No intentional compatibility implementation remains; the file is now a re-export-only bridge.
- Repository search results can be stale/default-branch scoped, therefore this index records the direct consumer proof from the exact branch reads rather than claiming a repository-wide zero-consumer search from stale results.

Legacy state: `queries-compat.ts` remains temporarily for external/old import compatibility, but it no longer contains business logic. Destructive deletion is deferred until external-consumer risk is explicitly ruled out.

Regression:
- `scripts/check-queries-compat-boundary.mjs` updated as a permanent anti-drift guard.
- `package.json` exposes `test:queries-compat-boundary`.
- Execution in this environment: **NOT EXECUTED**. No PASS is claimed.

Exact-head:
- Code HEAD after this batch: `1bb6845fe10c40aebf81887ad59f038cde162132`.
- Index update is the next commit and must be treated as the certification reference once committed.
- Exact-head CI: **PENDING / NOT OBSERVED**. No historical PASS is promoted.

Certification state: `IMPLEMENTED → CONSUMER MIGRATED → REGRESSION WIRED → CI PENDING`; not CLOSED.

## Future-development architecture invariant
New features must import the canonical query/API surface directly. `queries-compat.ts` is not an extension point. Any new business function added there is a regression by definition. New capabilities must follow:
`UI → Capability Contract → Canonical Adapter → Authoritative Service/RPC → Tenant Authority → Evidence/Typed Result → Presentation`.

## Next high-value families
1. Inventory Truth: eliminate remaining browser-derived metrics and prove cross-surface equivalence.
2. Receivables/Profitability: remove remaining client-side business aggregation where an authoritative snapshot/RPC can own it.
3. Tenant Security: continue storage/realtime/AI/vector/worker indirect-tenant paths.
4. Reliability: crash/retry/lease/DLQ/idempotency evidence.
5. Performance: bounded reads/query plans/N+1/payload measurement.
6. Runtime/LIVE: execute only in a real environment; no local contract is promoted to LIVE.

Production certification remains **NO**.


## Batch 51 — Receivables / profitability truth follow-through

Finding: receivables and profitability surfaces were rechecked after the canonical query-boundary promotion. Receivables already has a server-side snapshot with independent business totals and pagination-separated rows. Profitability consumes the canonical dashboard snapshot; its category margin is presentation-only, derived from canonical sales/profit values.

Root cause status:
- Receivables: previous pagination/business-total risk is already addressed at the authoritative RPC boundary.
- Profitability: no second authoritative data source was found in the inspected report path; the remaining client calculation is a presentation ratio, not a replacement for the canonical gross-profit truth.
- Hardening issue: presentation margin did not explicitly guard non-finite numeric inputs.

Implementation:
- Hardened profitability margin rendering to emit `—` unless both sales and profit are finite and sales is positive.
- Did not move a presentation ratio into another RPC unnecessarily; the authoritative sales/profit values remain owned by `get_dashboard_snapshot`.

Consumer evidence:
- `src/pages/ReceivablesReportPageCanonical.tsx` consumes `fetchReceivablesReportSnapshot`.
- `src/lib/receivables-truth.ts` delegates to `report_receivables_snapshot`.
- `src/pages/ReportsPage.tsx` profitability consumes `fetchDashboardSnapshot`.
- `supabase/migrations/20260826052000_dashboard_canonical_aggregation.sql` owns dashboard sales/cost/profit/margin truth.
- Receivables RPC explicitly computes business totals independently of display pagination.

Regression:
- Existing report-data-truth regression covers pagination-derived totals and unknown inventory valuation.
- Profitability non-finite presentation guard was implemented, but dedicated execution is **NOT EXECUTED** in this environment.

Exact-head:
- Latest code commit from this batch: `9b2379d21f2fc594806cc34b21ef77a69e939836`.
- Exact-head CI: **PENDING / NOT OBSERVED**.
- Therefore this batch is **PARTIAL**, not CLOSED.

Next failure family selected: **Tenant Security / indirect tenant paths**, prioritizing storage, realtime, AI/vector metadata, exports, workers and imports over further UI-only metric polishing.


## Batch 52 — Watched-folder indirect tenant bypass hardening

Finding: `record_watched_report_file` was SECURITY DEFINER and derived the inserted `company_id` from `current_company_id()`, but it accepted a caller-controlled `p_folder_id` without first proving that the folder itself belonged to the authoritative tenant. This left an indirect cross-tenant reference path: a valid tenant session could attempt to reference another tenant's folder UUID.

Root cause: tenant authority was enforced on the row being written, but not on the referenced parent resource before the SECURITY DEFINER operation.

Canonical fix:
- Added `supabase/migrations/20260828200000_watched_report_tenant_hardening.sql`.
- The RPC now resolves `v_company_id := public.current_company_id()`.
- It rejects missing tenant context.
- It explicitly verifies `watched_report_folders.id = p_folder_id` AND `company_id = v_company_id` before any write.
- Invalid state values are rejected explicitly.
- Search path and grants are hardened; anon execution is revoked and authenticated execution is granted.

Regression:
- Added `scripts/check-watched-report-tenant-hardening.mjs`.
- Added `test:watched-report-tenant-hardening` to package scripts.
- Execution: **NOT EXECUTED** in this environment; therefore no regression PASS is claimed.

Consumer/runtime evidence:
- The client watcher already calls the canonical RPC path; this change hardens the database boundary beneath it.
- Adversarial A/B tenant execution still requires a real Supabase environment and two authenticated tenants. That is **LIVE REQUIRED**, not locally claimed.

Exact-head discipline:
- Code/index branch changed after Batch 52; exact current branch SHA must be obtained from the branch tip before certification.
- Exact-head CI: **PENDING / NOT OBSERVED**.
- Batch status: **PARTIAL**.

Next parallel families:
- Continue indirect tenant audit across storage/realtime/vector metadata and background workers.
- In parallel, inspect reliability lease/retry/DLQ invariants because those are independent of tenant DB hardening.
- Then perform exact-head regression/CI once the active implementation wave is coherent.

Production certification: **NO**.


## Batch 53 — Report execution reliability regression depth

Finding: the in-memory report queue already implemented idempotency, lease ownership, heartbeat, lease-expiry recovery, bounded retries and terminal failed/dead-letter reporting, but the runtime regression only covered checkpoint/idempotency identity and did not exercise the queue state machine itself.

Root cause: reliability behavior existed but its executable regression evidence was incomplete, leaving duplicate-worker, stale-lease recovery and terminal retry behavior insufficiently guarded.

Implementation:
- Extended `scripts/report-execution-runtime.test.ts` to exercise:
  - duplicate idempotency enqueue returns the original run;
  - first worker claims the job;
  - a different worker cannot complete another worker's lease;
  - expired lease can be reclaimed by another worker;
  - reclaimed attempt count increments;
  - old worker cannot heartbeat after ownership changes;
  - terminal failure after max attempts is surfaced by `listDeadLetters()`.
- No production queue redesign was performed because the current state machine already expresses the required invariants.

Regression execution: **NOT EXECUTED** in this environment. The test is wired but no PASS is claimed.

Runtime/LIVE: durable Supabase worker behavior still requires real crash/restart, concurrent worker and stale-lease tests against the deployed database. Local/in-memory PASS would not certify that layer.

Exact-head CI: **PENDING / NOT OBSERVED**.

Certification state: **PARTIAL**.

Next family: continue P0/P1 tenant + reliability audit at the database/RPC level, then cross-surface truth and performance evidence.
