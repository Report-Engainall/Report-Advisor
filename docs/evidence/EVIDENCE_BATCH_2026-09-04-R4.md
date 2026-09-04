# Evidence Batch R4 — 2026-09-04

## Exact-head discipline
- Base boundary: `46156969f506d7fb6c3c75fde419c6de76f6e14d`
- Current repair branch: `repair/currency-analytics-truth-46156969`
- Current repair head: `3fed662e3114efce3a9fd7ed3737d9f9dd894b94`
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
- `company_memberships` has a unique partial index enforcing at most one active default membership per user; `current_company_id()` therefore does not have arbitrary multi-default tenant selection in the current schema.
- Staging contains 2 active/default tenant memberships for distinct runtime users.
- Added static frontend→migration RPC parity gate: `scripts/rpc-frontend-migration-parity.mjs`.

## Security-definer forensic review
- Authenticated-callable decision/evidence/work-item helpers inspected for owner, search path, caller identity, tenant guard, evidence ownership, state transitions, and write scope.
- No cross-tenant privilege escalation was proven in the inspected paths.
- Cross-tenant export invocation rejected with `TENANT_CONTEXT_MISMATCH`.
- Remaining control-plane item: leaked-password protection is external auth configuration and remains blocked.

## Truth / currency
- Staging production-shaped data has company currency `SAR` while transaction rows contain `YER`; no missing currency rows were present in the live sample.
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
- CI workflow `canonical-aggregation-truth` now runs the regression and the RPC parity sweep.

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
- `CustomersPage` and `ProductsPage` expose `عميل جديد` / `منتج جديد` buttons without action handlers. Genuine unresolved P1 dead-action gap; not claimed fixed.
- `RecommendationsPage` had a real backend contract failure; repaired above.
- `DecisionExperiencePage` explicitly reports runtime-required blocked states for approval/work/outcome; runtime proof remains absent.
- Browser route inventory remains 29; navigation is not business-flow certification.

## Import forensic boundary
- `products` has a unique `(company_id, normalize_import_key(sku))` index, protecting normalized SKU identity against concurrent duplicate logical SKUs.
- Import job tables are tenant-keyed and progress/finish RPCs enforce current tenant and job ownership.
- Remaining browser proof: upload/parse/commit/retry/interruption through the real UI.

## Golden corpus
Deterministic contract corpus contains 7 required cases:
1. `exchange-arabic`
2. `exchange-ocr`
3. `inventory-excel`
4. `unknown-layout`
5. `corrupt-extraction`
6. `arithmetic-mismatch`
7. `reconciliation-mismatch`

These are production-shaped regression contracts, not evidence that real customer documents have been executed through authenticated runtime.

## Current executable classification
| Capability | Can prove now | Blocked / not yet provable | Exact dependency |
|---|---|---|---|
| DB tenant/RLS | YES, staging adversarial | — | — |
| Currency/analytics truth | YES, staging + rollback positive/negative | — | — |
| Import lifecycle contract | YES, DB transaction test + static regression | Real UI lifecycle | Authenticated browser runtime |
| RPC source parity | STATIC GATE READY | Live signature comparison | Authenticated DB metadata path |
| SECURITY DEFINER | Static/DB review substantially executed | Full adversarial browser proof | Authenticated A/B browser |
| Frontend route discovery | Harness READY | Current-head runtime execution | Auth credentials |
| CRUD | Backend/source partially ready | End-to-end behavior | Auth credentials |
| OCR/document | Corpus contract READY | Real extraction/runtime | Auth + runtime |
| Evidence/decision | Contracts/source reviewed | Persisted runtime chain | Auth + runtime |
| Reporting/export | DB grant/tenant repair proven | Browser output/value proof | Auth + runtime |
| Realtime | Not proven | Runtime lifecycle | Auth + deployed runtime |
| Backup/restore | Runbook/dependency known | Operational drill | External ops access |
| Rollback | Runbook/dependency known | Operational drill | External ops access |

## CI snapshot
The current-head status is not certification-grade while Vercel remains rate-limited and PR runtime secrets are unavailable. Fresh checks are expected to run against the latest branch head; historical failures are not reused as current-head conclusions.

## Exact blockers
1. GitHub Actions authenticated E2E runtime secrets unavailable: `REPORT_ADVISOR_SUPABASE_URL`, `REPORT_ADVISOR_SUPABASE_ANON_KEY`, `REPORT_ADVISOR_E2E_USER_A_EMAIL`, `REPORT_ADVISOR_E2E_USER_A_PASSWORD`, `REPORT_ADVISOR_E2E_USER_B_EMAIL`, `REPORT_ADVISOR_E2E_USER_B_PASSWORD`.
2. Vercel deployment rate limit blocks current-head deployment.
3. Backup/restore and rollback operational drill access is not available through the current tool surface.
4. Native Windows runtime evidence remains external to Linux CI.

## Certification impact
**NOT CERTIFIED.**

No old deployment, old SHA, fixture-only result, HTTP 200, or blocked workflow is promoted into release proof.
