# Report Advisor — Execution & Evidence Delta — Batch 35
Date: 2026-08-27

## Exact execution state
- Requested predecessor: `407e6bb1e506a29ae35f741d5530400a3675b9a9`.
- Corrective deep-closure wave: PR #59.
- Current Code HEAD: `174087d4af3862e5c1a88f8c44afced31b20b92c`.
- Base of PR #59: `c7b21db4d68e396fa6ceefe3f6fdc15b1a8b8d4c`.
- PR #59 is open and unmerged; mergeable currently false. Mergeability is not treated as an application defect without proof.
- Exact-head workflow query for `174087d4...` currently returns no observable workflow run/status. Therefore **NO EXACT-HEAD CI PASS CLAIM**.

## FIND → ROOT CAUSE → FIX

### F35-01 — build-breaking ReportsPage syntax
- FIND: the exact PR #59 head contained escaped template-literal sequences (`\\``) in `ReportsPage.tsx`; CodeRabbit identified line-level syntax failure.
- ROOT CAUSE: malformed source text introduced during compact page migration.
- FIX: replaced the malformed page source with a valid canonical-consumer implementation retaining all six report-center/report surfaces and server-backed report truth adapters.
- REGRESSION: TypeScript/build remains the authoritative compiler gate; no PASS claimed until exact-head CI runs.
- Status: **FIXED IN CODE / CI PENDING**.

### F35-02 — SECURITY DEFINER alternative-group RPCs retained PUBLIC EXECUTE
- FIND: revoking `anon` alone did not revoke PostgreSQL PUBLIC execution for the newly created SECURITY DEFINER RPCs.
- ROOT CAUSE: default function privilege remained broader than the intended authenticated-only boundary.
- FIX: explicit `REVOKE ALL ... FROM PUBLIC` added for all three RPC signatures, followed by authenticated grants.
- REGRESSION: alternative-group tenant authority gate now requires the three PUBLIC revokes, fixed search_path, server-derived tenant, and no caller-supplied tenant.
- Status: **FIXED / REGRESSION ENFORCED / CI PENDING**.

### F35-03 — inventory tenant gate was globally scoped instead of definition-scoped
- FIND: the inventory intelligence guard could pass because one function's `current_company_id()` satisfied a repository-wide check for all functions.
- ROOT CAUSE: assertion scope did not match the security contract boundary.
- FIX: guard now extracts each effective RPC definition and verifies its own tenant resolution and authenticated grant. `demand_reorder_snapshot` receives an explicit later migration override with its own `current_company_id()` check and PUBLIC revoke.
- Status: **FIXED / REGRESSION ENFORCED / CI PENDING**.

### F35-04 — inventory valuation NULL was being lost inside SUM
- FIND: `SUM(CASE ... THEN NULL ELSE value END)` ignores NULLs, so incomplete rows could produce a partial numeric total rather than a NULL business value.
- ROOT CAUSE: SQL aggregate NULL semantics were misunderstood.
- FIX: `total_value` is now explicitly NULL whenever any inventory row lacks quantity or unit cost; complete datasets still sum normally. Outer page ordering repeats the deterministic page sort.
- Status: **FIXED / REGRESSION CONTRACT EXISTING / CI PENDING**.

## Consumer families
- ReportsPage → canonical dashboard/report adapters: active migration retained.
- Purchases → `fetchPurchaseReportSummary()` for business totals; current page only for display/export.
- Inventory → `fetchInventoryReportSnapshot()` for server metrics; page rows are display data.
- Receivables → `fetchReceivablesReportSnapshot()` for server totals/aging/pagination.
- Profitability → `fetchProfitabilityTruth()` for financial totals/categories.
- Alternative groups → tenant-authoritative SECURITY DEFINER RPCs.
- Inventory intelligence → effective tenant-authoritative RPC definitions.

## Exact-head CI
- Historical requested SHA `407e6bb1...`: quality Run `32928717071` FAILED at Typecheck; this remains historical evidence only.
- PR #59 head before current fixes `81a0adbf...`: review tooling found the ReportsPage syntax defect and security privilege defect.
- Current HEAD `174087d4...`: workflow/status surface currently returns no observable run. **NOT CI-GATED / NOT PASS**.

## Runtime / LIVE / Production
- **NO RUNTIME EVIDENCE** for this batch.
- Storage/Reatime/AI/vector adversarial isolation: **LIVE REQUIRED**.
- Authenticated browser E2E: **LIVE REQUIRED**.
- Worker crash/restart/stale-lease/DLQ/resume: **LIVE REQUIRED**.
- Backup restore/RPO/RTO/rollback: **LIVE REQUIRED**.
- Real OCR/PDF/XLSX/CSV corpus: **LIVE REQUIRED**.
- Production telemetry/load/canary/rollback: **LIVE REQUIRED**.
- **NOT PRODUCTION CERTIFIED**.

## Remaining high-value execution fronts
1. Exact-head CI on `174087d4...`; do not promote until exact SHA is observed.
2. Complete per-definition tenant sibling scan for every sensitive RPC, including Storage/Realtime/AI/vector paths.
3. Complete cross-surface equivalence with one dataset/filter/as-of across Dashboard, Reports, Analytics, BI, Decision and Export.
4. Complete full export taxonomy and eliminate any pagination→export truncation path.
5. Complete profitability financial semantics for returns/discounts/currency/rounding/date boundaries and prove equivalence.
6. Complete worker state-machine regression and deployed crash/recovery evidence.
7. Execute runtime/live evidence matrix when environments are available.
