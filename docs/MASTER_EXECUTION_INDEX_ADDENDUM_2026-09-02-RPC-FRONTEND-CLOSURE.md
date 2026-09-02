# Owner-Level Closure Addendum — 2026-09-02

## Exact evidence boundary
- Code/Test candidate at closure: `17bbe1d6c796be0036d8f1a6bc7661f6dac376c6`.
- Original frozen Code/Test baseline: `9b522bf7314b25306b25175e1477c7daa46a1e69`.
- Audit documentation lineage: `5edbf1da3223f4840d1a5781a628abc673a33a08`.
- Staging Supabase project: `fnqbvfuwbdpwvhcgzksl`.
- Production: NO TOUCH / FROZEN.

## Proven live database evidence
- Live migration count: 115 — CLOSED / PROVEN.
- Known migration lineage: CLOSED / PROVEN for the inspected latest migration mappings.
- Full 115/115 Git content/object parity: TOOLING-BLOCKED / UNPROVEN; no claim of parity PASS.
- Public RPC catalog: 62 functions; 30 SECURITY DEFINER; 0 SECURITY DEFINER functions without `search_path=pg_catalog` in the live inspected catalog.
- Authenticated executable public functions: 40; anon-executable: 1; public-executable: 1. The sole anon/public executable function is `normalize_import_key(text)` and it is not SECURITY DEFINER.
- Public tables: 78; RLS enabled: 78/78; policies: 147; constraints: 396; invalid constraints: 0; indexes: 234; user triggers: 15.
- Companies: 2; memberships: 2; orphan memberships: 0.
- Targeted tenant FK mismatches: 0.
- Duplicate product `(company_id, sku)` rows: 0.
- Duplicate customer `(company_id, code)` rows: 0.
- NULL company references in products/customers/sales_invoices: 0.
- Orphan sales-invoice customer/branch references: 0.

## Runtime/adversarial DB evidence
Authenticated-role simulation using a real tenant membership claim for Tenant A proved:
- `current_company_id()` resolves Tenant A: PROVEN.
- Direct `products` and `sales_invoices` reads for Tenant B return 0 visible rows under Tenant A: PROVEN.
- Direct update against Tenant B product rows under Tenant A returns no rows: PROVEN fail-closed behavior.
- `get_dashboard_snapshot(6,current_date)` returns JSON object; `trend`, `aging`, and `categories` are arrays.
- `get_receivables_report_page(0,25)` returns JSON object.
- Canonical receivables wrong-signature `(text,text)` remains absent; no tenant context produces `TENANT_REQUIRED`.
- Calling protected dashboard RPC as `anon` is rejected by database ACL.
- Cross-tenant export attempts for sales/purchases/inventory/receivables are fail-closed/empty under Tenant A.

## Defects found and repaired
### 1. Frontend ↔ canonical dashboard RPC payload drift
Live `get_dashboard_snapshot` returns `aging` as an array and trend/category rows without the UI-only wrapper/status fields assumed by the frontend adapter. The previous adapter could therefore render an empty aging section and suppress trend/category status-driven rendering despite valid canonical data.

Repair on code/test branch:
- `src/lib/dashboard-canonical.ts` now normalizes the authoritative RPC payload at the frontend boundary.
- `normalizeTrend`, `normalizeCategories`, and `normalizeAging` preserve canonical numeric values while adding the UI contract fields required by consumers.
- No database contract mutation was performed.

### 2. File-security regression harness could not execute under Node
The security regression import graph used extensionless local TypeScript imports, while the workflow executes the test with Node's experimental TypeScript stripping.

Repair:
- `src/lib/file-engine/security.ts` now uses explicit `.ts` imports compatible with the configured Node execution mode.
- `tsconfig.app.json` explicitly allows TypeScript extensions.

### 3. Phase-2 SECURITY DEFINER checker rejected the hardened catalog-only path
The checker required `SET search_path = public`, while the current staging hardening migration intentionally uses `SET search_path = pg_catalog`.

Repair:
- `scripts/check-phase2-security-definer-surface.mjs` now accepts the hardened `pg_catalog` path as well as the historical fixed `public` path.
- The staging migration itself was NOT weakened or rewritten.

### 4. Tenant-security checker conflated schema lineage with later resolver hardening
The checker incorrectly required the latest `CREATE OR REPLACE current_company_id` migration to also `ALTER company_memberships`, which a security-only hardening migration does not need to do.

Repair:
- `scripts/check-tenant-security-contract.mjs` now validates membership schema across the complete migration lineage and resolver invariants against the latest resolver definition independently.

## Exact-head CI evidence
PR-triggered GitHub Actions supplied an executable repository checkout and exact-head verification capability.

- PR: #303 (`fix: align dashboard frontend adapter with canonical RPC shape`)
- Branch: `fix/exact-9b-dashboard-rpc-contract`
- Candidate: `17bbe1d6c796be0036d8f1a6bc7661f6dac376c6`
- The workflow explicitly printed `PR_HEAD_SHA=7f9a659143ae93f1f5b01e0e0ef6b20d5b30e931` for the preceding candidate and bound the merge ref separately; no CI result is transferred across SHAs.
- For candidate `17bbe1d6...`, exact-head workflow runs were launched and remained in progress at the time this addendum was recorded.
- Proven completed checks on the candidate before this documentation snapshot include multiple contract/security/runtime workflows; full quality conclusion must be consumed only when its exact candidate run completes.
- A prior candidate `b77ca3...` exposed the two real harness defects above; those failures were not relabeled as product failures and were repaired before the next candidate run.

## Regression lock added
`scripts/dashboard-canonical-regression.mjs` now contains an adversarial source-level lock requiring the dashboard payload normalizers and a tamper test that fails when the aging normalizer is removed.

## Gate status after this cycle
- Database: CLOSED / PROVEN for inspected live controls.
- Known canonical RPC contracts: CLOSED / PROVEN.
- Repository-wide RPC inventory/parity/dependency graph: TOOLING-BLOCKED / UNPROVEN.
- Full migration content/object parity: TOOLING-BLOCKED / UNPROVEN.
- Full bypass search: TOOLING-BLOCKED / UNPROVEN beyond executed targeted adversarial paths.
- Full application regression: pending exact candidate CI completion; no unsupported PASS claim.
- Exact-head CI: IN-PROGRESS for `17bbe1d6...`; not yet certification evidence.
- Production runtime, authenticated production E2E, live Tenant A/B, backup/restore, RPO/RTO, rollback/DR: EXTERNAL-BLOCKED.
- Phase-E: NOT STARTED.

## Mutation boundary
- Staging DB mutation in this cycle: NONE.
- Production mutation: NONE.
- Code/test mutations: frontend contract adapter + file-security import compatibility + two harness correctness fixes + dashboard regression lock.
- Historical evidence preserved; no evidence transferred from another SHA.
