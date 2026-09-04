# Evidence Batch R5 — 2026-09-04

## Exact boundary
- Base: `46156969f506d7fb6c3c75fde419c6de76f6e14d`
- Branch: `repair/currency-analytics-truth-46156969`
- **Current exact HEAD: `71f13e6151e36833694e606fd70aa527b7615846`**
- PR #316: OPEN / DRAFT / NOT MERGED
- Certification: **NOT CERTIFIED**

## Internal debt closure
### Customer / Product CRUD
- Visible `عميل جديد` and `منتج جديد` actions were real dead actions; they are now wired to persistent create flows.
- Added edit/delete actions, validation, error surfacing, reload-after-save, and tenant-derived persistence.
- Added tenant + active-membership-role RLS gates for INSERT/UPDATE/DELETE.
- Mutation roles currently allowed: `member`, `manager`, `warehouse`, `accountant`, `system_admin`; `viewer` is blocked from mutation.
- Added normalized unique customer code index.
- Added DB domain constraints for nonblank entity identity and nonnegative numeric fields.
- Legacy `wholesale` customer segment is preserved in the editor.

### Live CRUD / adversarial DB tests
- Same-tenant create/update/delete: executed inside rollback transaction; rows appeared, updated, disappeared as expected.
- Forged cross-tenant product insert: rejected by RLS.
- Duplicate customer code: rejected by unique normalized index.
- Invalid product blank name / negative cost: rejected by DB constraints.
- Viewer-role mutation: rejected after temporarily changing the runtime test membership to `viewer`; membership change rolled back.
- Cross-tenant authenticated reads for customer/product tables: returned 0 rows under Tenant A context.
- No test fixture mutation was left committed.

## Frontend action completeness
- Added `scripts/frontend-action-completeness-scan.mjs` and dedicated CI workflow.
- Scanner covers empty callbacks, TODO/FIXME/coming-soon/mock markers, and unwired button heuristics.
- Known high-confidence dead entity actions were repaired before the scan gate was added.
- **Current CI execution is queued; scanner result is not yet certification evidence.**

## Business E2E architecture
- Added 20-flow oracle catalog: BF-001..BF-020.
- Each flow explicitly defines input/action, expected UI, expected RPC/API, expected DB effect, business result, security, persistence, and expected failure.
- Added business-flow contract CI gate.
- Route navigation is not considered flow completion.

## Real report business wrappers
- Existing deterministic corpus remains intact: 7 required parser/quality cases.
- Added business wrapper manifest with 14 scenarios covering exchange, OCR, inventory, sales, purchases, receivables, mixed-format, duplicate, partial, empty, unknown, corrupt, arithmetic and reconciliation conditions.
- Wrapper contract is `SOURCE -> UPLOAD -> PROCESS -> DB -> RECONCILIATION -> ANALYTICS -> UI -> EXPORT/EVIDENCE`.
- Added truth envelope fields: source, parsed, normalized, DB, RPC, analytics, UI, export, mismatch list, security, persistence, evidence, exact HEAD.
- **These wrappers are READY, not EXECUTED. Real authenticated runtime is still required for PASS.**

## Currency / financial truth
- Invoice storage contract hardened: sales and purchase invoice currency is NOT NULL, defaults to `SAR`, and must be a normalized 3-letter uppercase code.
- Live invalid storage probes for `NULL` and malformed/whitespace currency were rejected.
- Receivables report now fail-closes on company/transaction currency mismatch and suppresses monetary outputs.
- Existing analytics mismatch path remains fail-closed for profitability, purchases, secondary metrics, RFM, ABC, aging and dashboard.
- Positive-path alignment remains proven only in rolled-back transaction tests.

## RPC parity
- Static frontend->migration parity gate remains enabled.
- New contract scanners and current workflows are attached to PR #316.
- Live inventory: 65 public functions; 44 authenticated-executable; 0 anon EXECUTE.
- SECURITY DEFINER: 33 total; 20 authenticated-executable with auth/tenant identity and secure search-path structural evidence; 13 are not authenticated-executable; 0 have anon EXECUTE.
- This is strong static/DB evidence, not a substitute for authenticated browser adversarial proof.

## RLS attack matrix — current DB proof
| Attack | Result |
|---|---|
| Tenant A -> Tenant B product read | REJECTED / 0 visible rows |
| Tenant A -> Tenant B customer read | REJECTED / 0 visible rows |
| Forged company_id on product insert | REJECTED |
| Viewer-role product mutation | REJECTED |
| Duplicate customer code | REJECTED |
| Invalid product domain values | REJECTED |
| Cross-tenant export invocation | REJECTED with tenant-context guard |
| RLS tables without any policy | 0 / 81 |

## Import lifecycle / concurrency readiness
- Existing repair rejects invalid/out-of-range counters and premature completion.
- Live functions use row locking (`FOR UPDATE`) for import job progress/finish and product identity upsert, giving deterministic serialization for concurrent workers.
- Duplicate product creation handles unique races by resolving the winning row after `unique_violation`.
- Current boundary has not yet had a two-independent-browser concurrent runtime drill; that remains a real E2E requirement.

## Recommendation / Decision / Evidence
- Recommendation aliases `accepted -> approved` and `done -> completed` are repaired and authenticated-only.
- Decision approval enforces tenant identity and forbids self-approval.
- Work creation requires an APPROVED decision and active tenant assignee.
- Work completion requires IN_PROGRESS state, correct assignee, and tenant-owned evidence snapshot.
- Outcome recording requires an approved decision, completed work item, tenant-owned evidence, valid outcome label, and rejects duplicate observation identity.
- Live data-integrity scan found legacy seeded fixtures: 1 recommendation without evidence and 1 orphaned decision outcome. These are historical/golden fixture records, not new runtime records; they remain explicitly classified as legacy fixture debt rather than silently relabeled as production PASS.

## CI current state
At exact HEAD `71f13e6151e36833694e606fd70aa527b7615846`, the fresh PR-triggered wave contains 42 observed workflow runs. The newly added contract workflows are currently `queued`; Windows desktop is `in_progress`; phase-9 Windows and decision-DML/recommendation-DML runs are `pending`. No queued/pending state is counted as PASS.

Relevant fresh run IDs:
- `frontend-action-completeness`: `33847952541` — QUEUED
- `entity-crud-contract`: `33847952600` — QUEUED
- `business-e2e-contract`: `33847952584` — QUEUED
- `real-report-contract`: `33847952698` — QUEUED
- `canonical-aggregation-truth`: `33847952605` — QUEUED
- `quality`: `33847952623` — QUEUED
- `security-definer-exposure-contract`: `33847952436` — QUEUED
- `desktop-windows`: `33847952254` — IN_PROGRESS

## Browser / deployment
- Browser exact-head build and preview startup were previously proven, but authenticated gate remains BLOCKED when required secrets are unavailable.
- No old deployment is promoted as current-head proof.
- Current-head Vercel deployment remains blocked by platform rate limiting.
- Auth A/B credentials are external configuration and are not present in the workflow.
- Backup/restore and rollback remain external operational drills.
- Native Windows certification remains in progress/external to Linux-only browser evidence.

## Certification impact
**NOT CERTIFIED.**

Internal progress is materially advanced: entity CRUD is no longer a known dead action; financial source currency storage and receivables are hardened; business-flow and report wrappers are ready; attack-matrix coverage is deeper; CI now has dedicated contract gates.

However, `PASS` is still prohibited until fresh exact-head CI completes and real authenticated runtime proves the business flows end-to-end, including Tenant A/B isolation, real report execution, OCR/import, evidence/decision lifecycle, export, realtime, refresh/recovery, logout/re-login, and Windows/operational certification where required.
