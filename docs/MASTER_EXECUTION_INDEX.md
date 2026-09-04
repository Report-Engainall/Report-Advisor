# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution manifest. Because embedding this file's own commit SHA would make the SHA self-invalidating, the exact current candidate is always the Git `HEAD` of the relevant checkout/ref. Pair this manifest with `git rev-parse HEAD` for every evidence batch.

### CURRENT REPAIR CANDIDATE
- Repair branch: `repair/currency-analytics-truth-46156969`.
- Base boundary: `46156969f506d7fb6c3c75fde419c6de76f6e14d`.
- Repair lineage recorded in this wave: `461569...` → `c78b7c7cf9efb8404f312f95e7315213547be21b` → `31bbc941a4857cb5f0b270a5c92944111814fd02` → subsequent HEAD created by this index update.
- PR #316: OPEN / DRAFT / NOT MERGED.
- Certification: NOT CERTIFIED.
- Historical evidence is never promoted to the subsequent exact HEAD.

### BOUNDARY / GOVERNANCE
- Main release boundary remains separate from this repair candidate until review/merge.
- Historical evidence is valid only for its recorded SHA.
- No deployment, test, DB result, or prior RC is reused across a changed exact head.
- Browser E2E uses real Chromium, real Supabase authentication when credentials exist, and browser-held access tokens; service-role and mocked sessions are prohibited.
- The browser workflow uses scoped path triggers and `workflow_dispatch`; broad push triggers are prohibited by the CI topology contract.
- PASS requires correct behavior + correct data + correct security + persistence + evidence + exact HEAD.
- QUEUED/PENDING/RUNNING is never PASS.

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
- Current-wave dashboard currency truth repair: `5be528826ac7e7aa1638e1b70784e9c22473506b`.
- Current-wave dashboard regression/test-of-test: `9c2a4077cd4107757df40e7189018286d3f81ca8`.
- Current-wave browser exact-checkout hardening: `0d2d3931b687fdf1daa41ceb56c9341fd7667430`.
- Current-wave analytics currency fail-closed repair: `05678e4d9b134a1a3bfa5014b2724c03e6269356`.
- Current-wave analytics adversarial regression: `11038f53552df6876fd31ffc33808638d8a5a109`.
- Current-wave CI enforcement update: `cf6efda9a63742d4e18fac9769f90f3d7e7dcf11`.
- Current-wave dashboard regression stale-contract correction: `13a9d2ec71399dedaebd03f04a0a1c9e6fe2e9ba`.
- Current-wave browser cache/pinned-runner optimization: `8e9dc64a411d6772b01b58066e185a25e3ded93b`.

### CURRENT E2E STATUS
| Area | Status | Required evidence |
|---|---|---|
| Real Chromium | BUILT / current-head CI pending | exact-head CI |
| Authenticated browser login | BLOCKED / NOT PROVEN | current-head run with real credentials |
| Tenant A | NOT PROVEN | real browser session + `current_company_id()` |
| Tenant B | NOT PROVEN | real browser session + B credential |
| A/B isolation | PARTIAL / NOT PROVEN IN BROWSER | browser cross-tenant read/mutate attempts |
| 29 route discovery | NOT PROVEN on current head | browser run |
| CRUD persistence | NOT PROVEN on current head | browser action + DB truth |
| Import | NOT PROVEN on current head | upload/preview/commit + DB truth |
| OCR/document | NOT PROVEN | real corpus runtime |
| Evidence/decision | NOT PROVEN | authenticated browser flow |
| Reporting/export | PARTIAL | live export RPC grants repaired; browser output unproven |
| Realtime/workers | NOT PROVEN | runtime lifecycle evidence |
| Recovery | NOT PROVEN | backup/restore/rollback drill |
| Negative security | PARTIAL | DB RLS adversarial evidence; browser A/B pending |

### INTERNAL P1 CLOSURE / BUSINESS E2E PREBUILD
- Customer and Product create/edit/delete actions are wired to real tenant-scoped persistence with validation, error surfacing, reload persistence, and DB role/RLS enforcement.
- Duplicate customer code and invalid entity values are rejected by DB constraints.
- Frontend action completeness scanner is active; its result is exact-head CI evidence, not a static claim.
- Business catalog BF-001..BF-020 is defined with UI/backend/DB/security/persistence/failure oracles.
- Real-report business wrappers cover 14 production-shaped scenarios and are runnable once authenticated runtime is available.
- Truth comparator spans source → parsed → normalized → DB → RPC → analytics → UI → export/evidence.

### LIVE DB FORENSICS / REPAIR
1. Staging `fnqbvfuwbdpwvhcgzksl` is `ACTIVE_HEALTHY`.
2. Public base tables currently have RLS enabled; current catalog count is 81 public tables with RLS enabled. No core `anon` table grants were found.
3. Rolled-back DB adversarial probes passed: Tenant A saw only its own products; Tenant B saw only its own products; cross-tenant UPDATE affected zero rows; malicious company reassignment was rejected.
4. Authenticated execution was restored for the four Reports export RPCs; anon execution remains denied.
5. Source repair/migration lineage for export row bounds and execution was reconciled into source control.
6. Dashboard currency truth was repaired to fail closed when company currency and invoice currency disagree.
7. Analytics currency truth was extended to profitability, purchases, secondary sales metrics, RFM, ABC, and aging; mismatch suppresses monetary outputs.
8. `get_abc_snapshot` schema drift referencing nonexistent `sale_items.company_id` was repaired; tenant scope derives through sales invoices.
9. Mismatch verification returned `INSUFFICIENT_DATA` across affected analytics; positive aligned-currency tests returned `CALCULATED` inside rolled-back transactions.
10. Financial invoice currency storage is required, normalized to uppercase 3-letter form, with default SAR; malformed/null probes were rejected.
11. Import lifecycle guards reject null/negative/out-of-range counters and premature completion; row locking and normalized SKU race handling are present.
12. Recommendation aliases `accepted -> approved` and `done -> completed`; authenticated execution is tenant-scoped.
13. Approval rejects self-approval; work creation requires APPROVED; work completion requires correct state/assignee/evidence; outcome requires completed work and tenant-owned evidence.
14. One legacy seeded recommendation without evidence and one legacy seeded orphan decision outcome remain explicit fixture debt; they are not promoted to production PASS.

### SECURITY-DEFINER AUDIT
- Full public `SECURITY DEFINER` inventory was reviewed for owner, `search_path`, grants, tenant/auth validation, and touched domains.
- Current inventory: 33 total; 20 authenticated-executable; 13 not authenticated-executable; 0 anon-executable.
- Authenticated-callable helpers were not blindly revoked because inspected helpers have tenant/auth guards and secure `search_path` where privilege elevation would otherwise be possible.
- Cross-tenant export invocation under an authenticated database role was rejected by `TENANT_CONTEXT_MISMATCH`.
- Dedicated CI remains required before any certification claim.

### CANONICAL TRUTH MATRIX
| Domain | Current state |
|---|---|
| Sales | REPAIRED / RETESTED — currency mismatch fail-closed |
| Purchases | REPAIRED / RETESTED — currency mismatch fail-closed |
| Inventory | PARTIAL — tenant/null guards; real E2E required |
| Receivables | PARTIAL — tenant authority + currency gate; real E2E required |
| Dashboard | REPAIRED — financial mismatch gated |
| Profitability | REPAIRED / RETESTED |
| RFM | REPAIRED / RETESTED |
| ABC | REPAIRED / RETESTED — schema drift fixed |
| Aging | REPAIRED / RETESTED |
| Reconciliation | BLOCKED BY AUTHENTICATED E2E |
| Evidence | BLOCKED BY AUTHENTICATED E2E |
| Export | PARTIAL — DB grant/guard proven; browser output unproven |

### GOLDEN CORPUS / REAL REPORTS
- Core deterministic corpus: 7 cases: `exchange-arabic`, `exchange-ocr`, `inventory-excel`, `unknown-layout`, `corrupt-extraction`, `arithmetic-mismatch`, `reconciliation-mismatch`.
- Business wrapper manifest: 14 scenarios, including sales, purchases, receivables, mixed format, duplicate, partial, and empty report cases.
- Runtime execution: 0. Certified runtime PASS: 0.
- Every runtime scenario requires source/upload/process/DB/reconciliation/analytics/UI/export-or-evidence assertions plus cleanup and exact-head evidence.

### IMPORT / RETRY / RECOVERY
- Proven now: counter integrity, premature-completion guard, row locking, normalized SKU uniqueness/race handling.
- Not proven without runtime: concurrent two-worker retry, same-file concurrency, browser refresh during import, network interruption, crash recovery, full idempotency drill.

### FRONTEND / RPC / ACTION AUDIT
- Frontend action completeness scanner is committed and attached to PR CI.
- Static RPC frontend→migration parity is committed and attached to CI.
- Runtime/live signature/grant/tenant parity remains a certification-grade audit surface; no dynamic RPC is promoted without explicit verification.
- Customers/Products dead actions are closed at source level; runtime persistence remains NOT PROVEN until authenticated browser execution.

### EXTERNAL / OWNER BLOCKERS
- Real authenticated browser credentials for Tenant A/B are not provisioned in GitHub Actions. Required variable names are documented by the browser workflow; secret values are never written to source/evidence.
- Current-head Vercel deployment is blocked by platform deployment rate limiting; no older deployment is accepted as current-head evidence.
- Auth control-plane leaked-password protection requires owner/provider access.
- Backup/restore and rollback drills require operational access.
- Native Windows runtime remains required where Linux CI cannot prove desktop behavior.

### CERTIFICATION RULE
No HTTP 200, UI success message, fixture PASS, simulated DB JWT, historical deployment, queued workflow, or old SHA may certify the current candidate. Final certification requires exact-head evidence for every required product surface and zero unresolved local actionable debt.
