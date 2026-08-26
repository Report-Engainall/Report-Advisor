# Report Advisor — Master Execution & Truth Index

Snapshot: 2026-08-26
Source of truth: `wave-next-cross-surface-closure` until merged; baseline `main` was `4095e0f0d427652eb705ba3955389ae978d7b5bf`.

## Execution truth
- User-provided starting point: `ef3f4a02bfbbc2996dbf0b8601e3f80c251f2548`.
- Actual repository main inspected at execution start: `4095e0f0d427652eb705ba3955389ae978d7b5bf`.
- Current execution branch: `wave-next-cross-surface-closure`.
- Current final candidate head before this index commit: `580d73d762d2f975304612f137fffb3b31270709`.
- Exact-head CI is **PENDING** for the final candidate; no PASS claim is made until the matching quality run completes.
- Historical verified baseline remains Run `32910806786` on `25eef5212dbc63d2255ad7998e76c3d02a5191cf` = PASS.

## Wave closure status
| Capability | IMPLEMENTED | TESTED | REGRESSION | CI | CONSUMER VERIFIED | RUNTIME | LIVE | Production |
|---|---|---|---|---|---|---|---|---|
| Secondary sales analytics canonical migration | YES | YES | YES | PENDING final head | YES via Vite canonical alias + adapters | NOT RUN | LIVE A/B required | NOT CERTIFIED |
| Purchase total canonical aggregate | YES | YES | YES | PENDING final head | YES in ReportsPage | NOT RUN | LIVE required | NOT CERTIFIED |
| Inventory UNKNOWN≠ZERO valuation | YES | YES | YES | PENDING final head | YES in ReportsPage | NOT RUN | LIVE required | NOT CERTIFIED |
| Report export canonical row sources | YES | YES | YES | PENDING final head | Sales/Purchases/Inventory/Receivables migrated | NOT RUN | LIVE required | NOT CERTIFIED |
| Lossless PDF export paging | YES | YES | YES | PENDING final head | report renderer | NOT RUN | LIVE browser/download proof required | NOT CERTIFIED |
| Decision impact UNKNOWN semantics | YES | YES | YES | PENDING final head | decision metrics contract | NOT RUN | LIVE outcome loop required | NOT CERTIFIED |

## Real findings → root cause → fix
### F-01 Secondary consumer canonical drift — HIGH
- FOUND: `fetchMonthlyTrend`, `fetchTopCustomers`, `fetchTopProducts`, `fetchCategoryBreakdown`, `fetchAgingBuckets` performed legacy client-facing business reads/aggregation.
- ROOT CAUSE: domain truth lived in page-facing query implementations instead of a single server aggregate boundary.
- FIX: added `get_sales_secondary_metrics`; migrated adapters; Vite exact alias now routes `@/lib/queries` through `queries-compat.ts` so production consumers actually use the adapter.
- REGRESSION: `scripts/check-secondary-consumer-canonical.mjs`.
- CI: exact final-head pending.

### F-02 Purchase total pagination truth — HIGH
- FOUND: purchase KPI could be derived from page rows.
- ROOT CAUSE: display pagination was coupled to business aggregation.
- FIX: `get_purchase_summary` server-side aggregate; `PurchasesReportPage` reads canonical total/count/supplier/average; export has independent canonical full-row source.
- REGRESSION: 21/101-row pagination fixtures and report closure regression.
- CI: exact final-head pending.

### F-03 Inventory UNKNOWN→ZERO — HIGH
- FOUND: valuation could turn missing quantity/cost into zero.
- ROOT CAUSE: browser calculation used zero fallback for incomplete data.
- FIX: `get_inventory_valuation` returns `value:null` + `INSUFFICIENT_DATA` when any required value is missing; UI renders `—` and an explicit insufficient-data state; row-level export preserves null value.
- REGRESSION: unknown quantity/cost fixture plus source guard.
- CI: exact final-head pending.

### F-04 Export row truncation — HIGH
- FOUND: report exports could use only the visible page, and PDF renderer explicitly truncated to 42 rows.
- ROOT CAUSE: presentation pagination and export payload were not separated.
- FIX: canonical tenant/status export RPCs for sales/purchases/inventory/receivables with a fail-closed 10,000-row safety cap; PDF renderer now emits multiple pages instead of truncating.
- REGRESSION: export closure + PDF no-truncation guard.
- CI: exact final-head pending.

### F-05 Decision missing-impact→ZERO — HIGH
- FOUND: decision metrics used zero as the average for missing expected/actual impact.
- ROOT CAUSE: missing measurements were coerced into business zero.
- FIX: `summarizeDecisions` returns nullable impact averages and excludes missing values from the denominator.
- REGRESSION: `scripts/check-decision-metrics-unknown-regression.mjs`.
- CI: exact final-head pending.

## Security / tenant boundary
- New canonical RPCs use `SECURITY INVOKER` rather than privileged definer execution.
- All new RPCs resolve authority from `current_company_id()` and reject mismatched caller company ids.
- Grants are explicitly restricted to `authenticated`.
- Export functions enforce the same tenant authority and status semantics.
- LIVE A/B adversarial verification is still required; static implementation is not runtime certification.

## Performance
- Secondary dashboard consumers now share one in-flight RPC request for common concurrent loads.
- Business aggregation is server-side instead of browser fetch/reduce.
- Export payloads have a hard server-side 10,000-row safety cap; oversized exports fail explicitly rather than silently truncating.
- Exact production latency/load numbers are not claimed without runtime load evidence.

## Legacy closure
- `src/lib/queries.ts` legacy implementations remain intentionally retained for compatibility.
- Consumer routing has been moved through the compatibility boundary by Vite alias.
- Removal is not yet destructive: zero-consumer proof and a dedicated removal regression remain before deleting legacy implementations.

## Cross-surface status
- Dashboard/report secondary metrics: IMPLEMENTED + consumer migrated.
- Purchase report totals: IMPLEMENTED + consumer migrated.
- Inventory valuation: IMPLEMENTED + consumer migrated.
- Sales/purchase/inventory/receivables export row sources: IMPLEMENTED + consumers migrated.
- Decision impact semantics: IMPLEMENTED + regression.
- Full dashboard=reports=exports=decisions equivalence: **PARTIAL** because live multi-surface datasets and remaining non-secondary domain metrics still need equivalence execution.
- Date/status contract: new sales/purchase/export paths explicit; full repository-wide semantic equivalence remains to be closed.

## Document / Import / Worker / Watcher / Backup / Observability
- Document intelligence static contracts and service unit tests remain PASS; real corpus/OCR remains LIVE REQUIRED.
- Import/worker/watcher foundations remain gated; crash/replay/native watcher proofs remain LIVE REQUIRED.
- Backup/restore automation contracts remain; real restore/RPO/RTO remains LIVE REQUIRED.
- Observability static lineage remains; production telemetry remains LIVE REQUIRED.

## CI evidence
- Previous exact-head failure: Run `32916517317` = FAIL, followed by Run `32916579545` = PASS and Run `32916650231` = PASS on the then-current repository state.
- Current candidate exact-head: `580d73d762d2f975304612f137fffb3b31270709`.
- Current matching quality run: **PENDING** at index update time.
- Never promote a historical PASS to current-head PASS.

## LIVE REQUIRED
1. Supabase tenant A/B adversarial runtime proof for DB, Storage, Realtime, AI/vector, reports, exports, decisions, outcomes, notifications and workers.
2. Authenticated browser E2E against real tenant-scoped data.
3. Real document corpus/OCR/PDF/XLSX/CSV execution.
4. Native Windows/Android/iOS watcher persistence/capability proof.
5. Real worker crash/restart/DLQ/replay drill.
6. Real backup restore/checksum/RPO/RTO/rollback drill.
7. Production telemetry trace from user action through report/decision/outcome.
8. Production load/canary/rollback evidence.

## Production certification blockers
- Final exact-head CI for this branch.
- Live tenant isolation proof.
- Live authenticated UI E2E.
- Live document corpus/OCR proof.
- Live worker/watcher resilience proof.
- Live backup restore/RPO/RTO.
- Live telemetry and canary/rollback evidence.

## Completion truth
**IMPLEMENTED:** real data-truth fixes and consumer migrations are in the branch.
**TESTED/REGRESSION:** executable regression guards are committed.
**CI VERIFIED:** pending for final candidate head `580d73d762d2f975304612f137fffb3b31270709`.
**RUNTIME/LIVE:** not claimed.
**PRODUCTION CERTIFIED:** NO.
