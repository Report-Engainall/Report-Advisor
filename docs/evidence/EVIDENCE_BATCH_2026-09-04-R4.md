# Evidence Batch R4 — 2026-09-04

## Exact-head discipline
- Base boundary: `46156969f506d7fb6c3c75fde419c6de76f6e14d`
- Current repair branch: `repair/currency-analytics-truth-46156969`
- Current repair head: `e1f8b2ee0324ca6a021fab8050b0cce088d1da2b`
- PR: #316, Draft, open, not merged.
- Historical evidence is not reused as current-head certification.

## Runtime
- Browser Run `33845264769`: build PASS, preview startup PASS, Chromium PASS; authenticated gate BLOCKED because six required runtime secrets were unavailable.
- Current-head Vercel: deployment rate-limited; no old deployment is accepted as current-head evidence.
- Authenticated browser: NOT PROVEN.

## Database / RPC inventory
- Public functions: 65.
- SECURITY DEFINER functions: 33.
- SECURITY DEFINER + authenticated EXECUTE: 19.
- Public anon EXECUTE: 0.
- Authenticated-executable public functions: 44.
- `company_memberships` has a unique partial index enforcing at most one active default membership per user; `current_company_id()` therefore does not have an arbitrary multi-default tenant selection in the current schema.
- Staging companies: 2 active default tenant memberships; both existing runtime users are assigned as active/default members of distinct companies.

## Security-definer forensic review
- Authenticated-callable decision/evidence/work-item helpers inspected for owner, search path, caller identity, tenant guard, evidence ownership, state transitions, and write scope.
- No cross-tenant privilege escalation was proven in the inspected paths.
- Cross-tenant export invocation rejected with `TENANT_CONTEXT_MISMATCH`.
- `current_company_id()` uses the database membership authority; browser code does not retain a mutable tenant id.
- Remaining control-plane item: leaked-password protection is external auth configuration and remains blocked.

## Truth / currency
- Staging production-shaped data currently has company currency `SAR` while transaction rows contain `YER`; no missing currency rows were present in the live sample.
- Mismatch path: profitability, purchase summary, secondary metrics, RFM, ABC and aging return `INSUFFICIENT_DATA` and suppress monetary outputs.
- Aligned temporary transaction path: all six return `CALCULATED`; transaction was rolled back.
- ABC schema drift fixed: no use of nonexistent `sale_items.company_id`; tenant scope follows `sales_invoices.company_id`.

## New finding — import lifecycle truth
The original import progress RPC silently clamped forged counters to the job total and the terminal RPC could mark a job `completed` before all declared rows were processed. This allowed a false-success lifecycle state.

### Repair
- `import_update_job_progress` now rejects null/negative counters.
- It rejects processed/valid/invalid/duplicate counters outside their declared range.
- It preserves monotonic counters but no longer silently converts an out-of-range report into apparent progress.
- `import_finish_job` now requires `processed_rows == total_rows` before `completed`.
- Live functions were repaired and tested in rolled-back transactions.
- Source migration: `20260904200000_harden_import_progress_truth.sql`.
- Regression: `scripts/import-lifecycle-truth-adversarial-regression.mjs`.
- CI workflow `canonical-aggregation-truth` now runs the regression.

## New finding — recommendation RPC contract
Frontend `RecommendationsPage` calls `update_recommendation_status`, but the live RPC had no authenticated EXECUTE grant and rejected UI aliases `accepted` and `done`. Existing staging recommendation data also contains legacy `OPEN` status.

### Repair
- Added authenticated EXECUTE and explicit anon revoke.
- Added caller identity requirement.
- Mapped UI aliases `accepted -> approved` and `done -> completed` while retaining canonical backend states.
- Retained tenant-scoped update condition.
- Live transaction test proved alias mapping and invalid-status rejection.
- Source migration: `20260904201500_reconcile_recommendation_status_contract.sql`.

## New finding — CI file security regression
Current PR CI failed `test:file-security-archive-traversal` before reaching the traversal assertions because Node ESM could not resolve extensionless imports from `src/lib/file-engine/security.ts`.

### Repair
- Added explicit `.ts` extensions to local ESM imports in `security.ts`.
- No security assertion was weakened and no dependency version changed.
- Fresh CI is required to certify the repair.

## Frontend forensic findings
- `CustomersPage` and `ProductsPage` currently expose `عميل جديد` / `منتج جديد` buttons without action handlers. This is a genuine dead-action gap and is not claimed as fixed in this batch.
- `RecommendationsPage` had a real backend contract failure; the RPC grant/status mismatch was repaired above.
- `DecisionExperiencePage` explicitly reports runtime-required blocked states for approval/work/outcome; this remains a product runtime dependency, not a fabricated PASS.
- Route count in the browser harness remains 29; navigation is not business-flow certification.

## Import forensic boundary
- `products` has a unique `(company_id, normalize_import_key(sku))` index, so normalized SKU identity is protected against concurrent duplicate logical SKUs.
- Import job tables are tenant-keyed and progress/finish RPCs enforce current tenant and job ownership.
- Remaining browser proof: upload/parse/commit/retry/interruption through the real UI.

## Golden corpus
Current deterministic contract corpus contains 7 required cases:
1. `exchange-arabic`
2. `exchange-ocr`
3. `inventory-excel`
4. `unknown-layout`
5. `corrupt-extraction`
6. `arithmetic-mismatch`
7. `reconciliation-mismatch`

Contract expectations are defined in `scripts/golden-e2e-corpus.mjs`. These are production-shaped regression contracts, not evidence that real customer documents have been executed through the authenticated runtime.

## CI snapshot
At the time of this batch, the new PR-head check wave was queued/pending across the repository. A concrete current-head PASS is not asserted. The earlier file-intelligence failure was a real ESM harness defect and has been repaired.

## Exact blockers
1. GitHub Actions authenticated E2E runtime secrets unavailable to the workflow: URL, anon key, Tenant A email/password, Tenant B email/password. Secret values are not requested or stored in source.
2. Vercel deployment rate limit blocks current-head deployment.
3. Backup/restore and rollback operational drill access is not available through the current tool surface.
4. Native Windows runtime evidence remains external to Linux CI.

## Certification impact
**NOT CERTIFIED.**

Current local progress is materially stronger than the previous boundary, but final certification still requires current-head CI, authenticated browser proof, Tenant A/B adversarial proof, real report/import/OCR/evidence/decision flow, and operational recovery evidence.
