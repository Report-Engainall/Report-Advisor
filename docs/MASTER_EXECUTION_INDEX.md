# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-05

> Authoritative execution manifest. Because embedding this file's own commit SHA would make the SHA self-invalidating, the exact current candidate is always the Git `HEAD` of `main` at the same checkout. Pair this manifest with `git rev-parse HEAD` for every evidence batch.

### CURRENT EXACT HEAD
- Latest functional candidate before this governance synchronization: `25893735f2efd1562c25813dec0c54d6e0bcc289` — semantic lock-removal test-of-test correction.
- This synchronization is documentation-only and changes the exact HEAD; therefore all runtime/release evidence must be re-established against the new HEAD after the index commit.
- **Current Code/Test Candidate:** `25893735f2efd1562c25813dec0c54d6e0bcc289`.
- Latest functional commit: `25893735f2efd1562c25813dec0c54d6e0bcc289`.

### BOUNDARY / GOVERNANCE
- Branch: `main`.
- Historical evidence is valid only for its recorded SHA.
- No deployment, test, DB result, or prior RC is reused across a changed exact head.
- Browser E2E uses real Chromium, real Supabase authentication when credentials exist, and browser-held access tokens; service-role and mocked sessions are prohibited.
- The browser workflow uses scoped path triggers and `workflow_dispatch`; broad push triggers are prohibited by the CI topology contract.
- No rebuild from scratch; no reopening closed work without new evidence.
- Work continues in parallel on independent fronts; external owner/device blockers do not justify idle time on analysis, source reconciliation, test design, or evidence preparation.
- Certification remains fail-closed: no HTTP 200, UI success message, fixture PASS, simulated DB JWT, historical deployment, or old SHA may certify the current candidate.

### LATEST FUNCTIONAL REPAIR
- `b52b943858b156ecda44506156b6aca99f9dd9e5` restores authenticated `SELECT` privileges for `alternative_item_groups` and `alternative_item_group_members`.
- The repair was driven by a live authenticated browser 403 where RLS policies existed but the tables had no authenticated table privileges.
- Anonymous access remains explicitly denied; tenant isolation continues to be enforced by RLS.
- Supabase staging migration history records the live repair as `restore_authenticated_alternative_group_read_grants`.
- The inventory-intelligence authenticated read boundary is source/live aligned; remaining closure requires current-head request-level browser evidence.

### E2E WAVE
- Baseline: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`
- Browser harness: `396086781a4723c23a90a8486b8b4cf81936bec9`
- Browser CI: `aa155ffdfce7a0addd17b337677e4b5c3039376d`
- Golden corpus contract repair: `38394120323da4f73bd2765b1f754b27e100111b`
- Failure ledger: `262fda100fcad7429ddd4928af96c8c3e14e05ff`
- Tenant-context verification: `4f34d33a8a3724fde55355763c4174639b42274b`
- CI topology repair: `95cf68908f5fb57de5712c90dd6ed297cfd5f65a`
- Browser forensic-depth repair: `dcbcbdbcc621cce23786d945e82005af94bcd05f`
- Product gap ledger: `1c0011188346f1543353fdc8d517a1021bc25743`
- Export RPC execution repair: `5ee6e8b10fcf311ab876855360e9a503f7690313`
- Live row-bound source reconciliation: `94b446cc83be12caab4774af4b93252dab32b927e`
- Workflow migration-trigger repair: `699c557a5615f71a957b4877bf2c1f9d6b5e8426`
- Current-wave dashboard currency-truth repair: `5be528826ac7e7aa1638e1b70784e9c22473506b`.
- Current-wave dashboard regression/test-of-test: `9c2a4077cd4107757df40e7189018286d3f81ca8`.
- Current-wave browser exact-checkout hardening: `0d2d3931b687fdf1daa41ceb56c9341fd7667430`.
- Authenticated-runtime fail-closed secret gate: `f1f9a3d7426128aadbdadcf9e4c62361b7c247a6`.
- Canonical certification decision evaluator: `cb1a6091b0860979957ae60005fd5c017bdc525d`.
- Browser auth proof repair: `cff0886152795286c5422b07a247b966d3ae5c92`.
- Alternative-group authenticated read-grant repair: `010192dbc6505444dacc9f46a41ccb34a4c5c2eb` (migration lineage reconciled; exact live version is `20260905173336`).

### CURRENT E2E STATUS
| Area | Status | Required evidence |
|---|---|---|
| Real Chromium | BUILT / EXACT-HEAD EXECUTION READY | exact-head CI |
| Authenticated browser login | PASS on prior functional head; current-head rerun required | current-head run with real credentials |
| Tenant A | PASS on prior functional head; current-head rerun required | real browser session + `current_company_id()` |
| Tenant B | PASS on prior functional head; current-head rerun required | real browser session + B credential |
| A/B isolation | PASS in DB; browser current-head proof pending | browser cross-tenant read/mutate attempts |
| 28 route discovery | PASS on prior functional head; current-head rerun required | browser run |
| CRUD persistence | NOT PROVEN on current head | browser action + DB truth |
| Import | NOT PROVEN on current head | upload/preview/commit + DB truth |
| OCR/document | NOT PROVEN | real corpus runtime |
| Evidence/decision | NOT PROVEN | authenticated browser flow |
| Reporting/export | PARTIAL | live export RPC grants and row bounds repaired; browser output unproven |
| Realtime/workers | NOT PROVEN | runtime lifecycle evidence |
| Recovery | NOT PROVEN | backup/restore/rollback drill |
| Negative security | PARTIAL | DB RLS adversarial evidence; browser A/B pending |

### LIVE DB FORENSICS / REPAIR
1. Staging `fnqbvfuwbdpwvhcgzksl` is `ACTIVE_HEALTHY`.
2. Public tables checked have RLS enabled; no core `anon` table grants were found.
3. Rolled-back DB adversarial probes passed: Tenant A saw only its own products; Tenant B saw only its own products; cross-tenant UPDATE affected zero rows; malicious company reassignment was rejected.
4. Real defect discovered: authenticated users could not execute `get_sales_export_rows`, `get_purchase_export_rows`, `get_inventory_export_rows`, or `get_receivables_export_rows`, while the authenticated Reports UI consumes export RPCs.
5. Live repair applied: authenticated EXECUTE restored for all four; anon EXECUTE explicitly denied.
6. Source repair: `supabase/migrations/20260904190000_restore_authenticated_export_rpc_execute.sql`.
7. Migration-lineage repair: live fail-closed export row-bound implementation is represented by `supabase/migrations/20260904191000_reconcile_export_row_bounds_and_execute.sql`.
8. Post-repair authenticated sales/purchase/inventory export calls execute successfully. Invalid row limits and tenant-mismatch calls are rejected as designed.
9. The live staging migration history contains `p1_fail_closed_export_row_bounds`; its implementation was recovered from the security-hardening branch and reconciled into main rather than silently treating live-only state as source truth.
10. Supabase security advisor still reports several authenticated-callable SECURITY DEFINER helpers and leaked-password protection disabled. Major mutation helpers inspected include tenant/auth checks and secure search path; no exploit proven, so no blind revoke performed.
11. Current-wave data-truth defect discovered: staging companies use `SAR` while source sales/purchase invoices contain `YER`; profitability correctly marks financial truth insufficient, but dashboard previously reported calculated financial KPIs. Dashboard snapshot was repaired to gate financial KPIs/breakdowns on currency consistency while preserving non-financial counts/inventory value.
12. Live dashboard retest for both authenticated tenant contexts now returns `INSUFFICIENT_DATA` with invalid financial KPIs null and financial breakdown arrays empty under the mismatch condition.
13. Supabase migration history records the dashboard repair as `20260904063122_reconcile_dashboard_currency_truth`; source migration filename was reconciled to that exact live version to eliminate the Preview migration-lineage failure.
14. Current-wave live 403 forensic: `alternative_item_groups` and `alternative_item_group_members` had RLS policies but no authenticated table privileges. The least-privilege repair grants only `SELECT` to `authenticated` and revokes all privileges from `anon`.
15. `inventory_balances`, `products`, `sale_items`, and `sales_invoices` already had authenticated `SELECT`; therefore the remaining inventory-intelligence 403 is intentionally left unmutated pending exact request tracing.

### RECOVERY / BACKUP / RESTORE BOUNDARY
- Recovery remains **UNPROVEN** at runtime until a real backup/restore/rollback drill produces exact-head operational evidence.
- Required recovery concepts are explicitly tracked as **backup/restore**, **RPO**, **RTO**, and **DR**.
- Current state is **UNPROVEN**, not a certification pass; measured RPO/RTO and restore-integrity evidence must come from the operational environment.

### CERTIFICATION DECISION CONTRACT
- The canonical evaluator added in `cb1a6091b0860979957ae60005fd5c017bdc525d` is fail-closed.
- It rejects certification unless the decision is an object, `certification_result=passed`, `blocker_state=clear`, `blocker_count=0`, source SHA matches, release manifest ID matches, certification run ID matches, and the mandatory evidence-contract set matches exactly.
- It additionally requires all three identity assertions to be explicitly true: source SHA ↔ manifest, manifest ID ↔ payload, and certification run ID ↔ manifest.
- This evaluator does not create operational evidence; it only prevents an invalid/incomplete decision payload from being accepted as certification.

### GOLDEN CORPUS
Required cases: `exchange-arabic`, `exchange-ocr`, `inventory-excel`, `unknown-layout`, `corrupt-extraction`, `arithmetic-mismatch`, `reconciliation-mismatch`.

All seven have explicit expected-disposition contract coverage. Runtime source→parse→normalize→DB→reconcile→analytics→evidence→decision→output proof remains NOT PROVEN.

### ACTIVE LOCAL / INDEPENDENT EXECUTION
- Current-head authenticated browser E2E and real report/data execution preparation.
- A/B browser adversarial CRUD/direct-request checks.
- RPC caller/signature/migration parity and migration-lineage reconciliation.
- OCR/document golden runtime corpus.
- Worker/queue retry/idempotency/recovery.
- Realtime/storage/AI authorization and provenance.
- Report/export value truth and adversarial output cases.
- Performance scale, Electron/native Windows, SECURITY DEFINER least-privilege review.
- Canonical certification decision validation.
- Final certification evidence assembly.

### LATEST OPERATIONAL HANDOFF STATE — 2026-09-05
- Authenticated E2E remains the primary P0 operational gate.
- The authenticated runtime script has been made fail-closed when required environment values are absent; required inputs include authenticated E2E base URL, Supabase URL/anon key, distinct Tenant A/B context, and A/B credentials.
- The local machine/device needed for browser execution is currently unavailable for approximately 9 hours. This is an owner/device availability blocker, not evidence that the implementation is broken.
- No credential values are recorded in this index. Secrets must remain outside source control and evidence manifests.
- While the device is unavailable, independent work can continue on source/test/evidence analysis, migration parity, certification contracts, and blocker reconciliation; final browser proof must wait for an actual real-browser environment.

### EXTERNAL / OWNER BLOCKERS
- Real authenticated browser credentials for Tenant A/B are not provisioned in GitHub Actions.
- Auth control-plane leaked-password protection.
- Backup/restore and rollback drill access.
- Production exact-head deployment/alias binding.
- Current-head golden OCR/document runtime evidence.
