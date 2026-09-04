# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution index. Evidence never crosses an exact-SHA boundary. Historical records remain in Git history and dated evidence.

### CURRENT HEAD
- Branch: `main`
- **Exact current candidate:** `11aedc9f89fb92d177129890491def186803c035`
- Parent: `5ee6e8b10fcf311ab876855360e9a503f7690313`
- Latest source repair: authenticated report-export RPC execution contract restored.
- Latest evidence-ledger reconciliation: `11aedc9f89fb92d177129890491def186803c035`.
- Historical browser run `33843075245` is valid only for `1df662ae114505be2a6df1a2d5230d38d3d1ab3f`.

### E2E WAVE
- Baseline: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`
- Browser harness: `396086781a4723c23a90a8486b8b4cf81936bec9`
- Browser CI: `aa155ffdfce7a0addd17b337677e4b5c3039376d`
- Golden corpus contract repair: `38394120323da4f73bd2765b1f754b27e100111b`
- Failure ledger: `262fda100fcad7429ddd4928af96c8c3e14e05ff`
- Tenant-context verification: `4f34d33a8a3724fde55355763c4174639b42274b`
- CI topology repair: `95cf68908f5fb57de5712c90dd6ed297cfd5f65a`
- Browser forensic-depth repair: `dcbcbdbcc621cce23786d945e82005af94bcd05f`
- Product gap ledger: `1c0011188346f1543353fdc8d517a1021bc25743`, reconciled again at `11aedc9f89fb92d177129890491def186803c035`.
- Workflow binding: `8e532b4ff0484a86f95e9b536997459d94e0c77c`.
- Export RPC source repair: `5ee6e8b10fcf311ab876855360e9a503f7690313`.

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
| Reporting/export | PARTIAL | four live export RPC grants repaired; browser output still unproven |
| Realtime/workers | NOT PROVEN | runtime lifecycle evidence |
| Recovery | NOT PROVEN | backup/restore/rollback drill |
| Negative security | PARTIAL | DB RLS adversarial evidence; browser A/B pending |

### LIVE DB FORENSICS / REPAIR
1. Staging `fnqbvfuwbdpwvhcgzksl` is `ACTIVE_HEALTHY`.
2. Public tables checked have RLS enabled; no core `anon` table grants were found.
3. Rolled-back DB adversarial probes passed: Tenant A saw only its own products; Tenant B saw only its own products; cross-tenant UPDATE affected zero rows; malicious company reassignment was rejected.
4. **Real defect discovered:** authenticated users could not execute `get_sales_export_rows`, `get_purchase_export_rows`, `get_inventory_export_rows`, or `get_receivables_export_rows`, while the authenticated Reports UI consumes export RPCs.
5. **Live repair applied:** authenticated EXECUTE restored for all four; anon EXECUTE explicitly denied.
6. **Source repair committed:** `supabase/migrations/20260904190000_restore_authenticated_export_rpc_execute.sql` at `5ee6e8b10fcf311ab876855360e9a503f7690313`.
7. Post-repair authenticated DB calls to sales/purchase/inventory export RPCs execute successfully. Browser output proof remains pending.
8. The DB has a later migration (`p1_fail_closed_export_row_bounds`) present in live migration history but not represented by the same filename on current main; active migration-lineage reconciliation remains required.
9. Supabase security advisor still reports several authenticated-callable SECURITY DEFINER helpers and leaked-password protection disabled. Major mutation helpers inspected include tenant/auth checks and secure search path; no exploit proven, so no blind revoke performed.

### GOLDEN CORPUS
Required cases: `exchange-arabic`, `exchange-ocr`, `inventory-excel`, `unknown-layout`, `corrupt-extraction`, `arithmetic-mismatch`, `reconciliation-mismatch`.

All seven have explicit expected-disposition contract coverage. Runtime source→parse→normalize→DB→reconcile→analytics→evidence→decision→output proof remains NOT PROVEN.

### ACTIVE LOCAL EXECUTION
- Current-head browser E2E and real report/data execution.
- A/B browser adversarial CRUD/direct-request checks.
- RPC caller/signature/migration parity and live migration-lineage reconciliation.
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
