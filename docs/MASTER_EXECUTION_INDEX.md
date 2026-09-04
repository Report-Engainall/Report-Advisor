# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution manifest. Because embedding this file's own commit SHA would make the SHA self-invalidating, the exact current candidate is always the Git `HEAD` of `main` at the same checkout. Pair this manifest with `git rev-parse HEAD` for every evidence batch.

### BOUNDARY / GOVERNANCE
- Branch: `main`.
- Historical evidence is valid only for its recorded SHA.
- No deployment, test, DB result, or prior RC is reused across a changed exact head.
- Browser E2E uses real Chromium, real Supabase authentication when credentials exist, and browser-held access tokens; service-role and mocked sessions are prohibited.
- The browser workflow uses scoped path triggers and `workflow_dispatch`; broad push triggers are prohibited by the CI topology contract.

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
- Live row-bound source reconciliation: `94b446cc83be12caab477af4b93252dab32b927e`
- Workflow migration-trigger repair: `699c557a5615f71a957b4877bf2c1f9d6b5e8426`

### CURRENT E2E STATUS
| Area | Status | Required evidence |
|---|---|---|
| Real Chromium | BUILT | exact-head CI |
| Authenticated browser login | NOT PROVEN | current-head run with real credentials |
| Tenant A | NOT PROVEN | real browser session + `current_company_id()` |
| Tenant B | NOT PROVEN | real browser session + B credential |
| A/B isolation | NOT PROVEN | browser cross-tenant read/mutate attempts |
| 29 route discovery | NOT PROVEN on current head | browser run |
| CRUD persistence | NOT PROVEN on current head | browser action + DB truth |
| Import | NOT PROVEN on current head | upload/preview/commit + DB truth |
| OCR/document | NOT PROVEN | real corpus runtime |
| Evidence/decision | NOT PROVEN | authenticated browser flow |
| Reporting/export | PARTIAL | live export RPC grants repaired; browser output unproven |
| Realtime/workers | NOT PROVEN | runtime lifecycle evidence |
| Recovery | NOT PROVEN | backup/restore/rollback drill |
| Negative security | PARTIAL | DB RLS adversarial evidence; browser A/B pending |

### LIVE DB FORENSICS / REPAIR
1. Staging `fnqbvfuwbdpwvhcgzksl` is `ACTIVE_HEALTHY`.
2. Public tables checked have RLS enabled; no core `anon` table grants were found.
3. Rolled-back DB adversarial probes passed: Tenant A saw only its own products; Tenant B saw only its own products; cross-tenant UPDATE affected zero rows; malicious company reassignment was rejected.
4. **Real defect discovered:** authenticated users could not execute `get_sales_export_rows`, `get_purchase_export_rows`, `get_inventory_export_rows`, or `get_receivables_export_rows`, while the authenticated Reports UI consumes export RPCs.
5. **Live repair applied:** authenticated EXECUTE restored for all four; anon EXECUTE explicitly denied.
6. **Source repair:** `supabase/migrations/20260904190000_restore_authenticated_export_rpc_execute.sql`.
7. **Migration-lineage repair:** live fail-closed export row-bound implementation is represented by `supabase/migrations/20260904191000_reconcile_export_row_bounds_and_execute.sql`.
8. Post-repair authenticated sales/purchase/inventory export calls execute successfully. Invalid row limits and tenant-mismatch calls are rejected as designed.
9. The live staging migration history contains `p1_fail_closed_export_row_bounds`; its implementation was recovered from the security-hardening branch and reconciled into main rather than silently treating live-only state as source truth.
10. Supabase security advisor still reports several authenticated-callable SECURITY DEFINER helpers and leaked-password protection disabled. Major mutation helpers inspected include tenant/auth checks and secure search path; no exploit proven, so no blind revoke performed.

### GOLDEN CORPUS
Required cases: `exchange-arabic`, `exchange-ocr`, `inventory-excel`, `unknown-layout`, `corrupt-extraction`, `arithmetic-mismatch`, `reconciliation-mismatch`.

All seven have explicit expected-disposition contract coverage. Runtime source→parse→normalize→DB→reconcile→analytics→evidence→decision→output proof remains NOT PROVEN.

### ACTIVE LOCAL EXECUTION
- Current-head browser E2E and real report/data execution.
- A/B browser adversarial CRUD/direct-request checks.
- RPC caller/signature/migration parity and migration-lineage reconciliation.
- OCR/document golden runtime corpus.
- Worker/queue retry/idempotency/recovery.
- Realtime/storage/AI authorization and provenance.
- Report/export value truth and adversarial output cases.
- Performance scale, Electron/native Windows, SECURITY DEFINER least-privilege review.
- Final certification evidence.

### EXTERNAL / OWNER BLOCKERS
- Real authenticated browser credentials for Tenant A/B.
- Auth control-plane leaked-password protection.
- Protected production deployment/current alias access.
- Backup/restore and rollback drill access.
- Native Windows runtime where Linux CI is insufficient.

### CERTIFICATION RULE
No HTTP 200, UI success message, fixture PASS, simulated DB JWT, historical deployment, or old SHA may certify the current candidate. Final certification requires exact-head evidence for every required product surface and zero unresolved local actionable debt.
