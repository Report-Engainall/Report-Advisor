# Owner-Level Closure Addendum — 2026-09-02

## Exact evidence boundary
- Code/Test candidate at current closure: `eb5e5fa4d841171d561b861014b6f79230c28bdf`.
- Original frozen Code/Test baseline: `9b522bf7314b25306b25175e1477c7daa46a1e69`.
- Audit documentation lineage remains separate and append-only.
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

Repair:
- `src/lib/dashboard-canonical.ts` now normalizes the authoritative RPC payload at the frontend boundary.
- `normalizeTrend`, `normalizeCategories`, and `normalizeAging` preserve canonical numeric values while adding the UI contract fields required by consumers.
- No database contract mutation was performed.

### 2. File-security regression harness imported the browser Supabase client
The archive traversal test imported `security.ts`, which also imports `src/lib/supabase.ts`; Node execution therefore failed before the pure scanner could run because `import.meta.env.VITE_SUPABASE_URL` is unavailable in the test process.

Repair:
- Pure archive/security scanning moved to `src/lib/file-engine/security-scan.ts` with no browser/environment dependency.
- `security.ts` re-exports the pure scanner and retains tenant-bound persistence logic.
- Archive traversal tests can now execute deterministically in Node.

### 3. Phase-2 SECURITY DEFINER checker rejected the hardened catalog-only path
The checker required `SET search_path = public`, while the current staging hardening migration intentionally uses `SET search_path = pg_catalog`.

Repair:
- `scripts/check-phase2-security-definer-surface.mjs` accepts the hardened `pg_catalog` path as well as the historical fixed `public` path.
- The staging migration itself was NOT weakened or rewritten.

### 4. Tenant-security checker conflated schema lineage with later resolver hardening
The checker incorrectly required the latest `CREATE OR REPLACE current_company_id` migration to also `ALTER company_memberships`.

Repair:
- `scripts/check-tenant-security-contract.mjs` validates membership schema across the complete migration lineage and resolver invariants against the latest resolver definition independently.

### 5. Dashboard truth checker required a historical helper not used by the canonical frontend contract
The checker required `get_dashboard_top_entities()` in the frontend adapter even though the authoritative `get_dashboard_snapshot()` already contains `topCustomers` and `topProducts`, and the current adapter consumes those fields directly.

Repair:
- `scripts/dashboard-truth-adversarial-regression.mjs` now binds the guard to the actual canonical snapshot consumer instead of requiring a redundant helper call.

### 6. Dashboard regression lock added
`scripts/dashboard-canonical-regression.mjs` now contains an adversarial source-level lock requiring the payload normalizers and a tamper test that fails when the aging normalizer is removed.

## Exact-head CI evidence
PR-triggered GitHub Actions supplied an executable repository checkout and exact-head verification capability.

- PR: #303
- Branch: `fix/exact-9b-dashboard-rpc-contract`
- Current candidate: `eb5e5fa4d841171d561b861014b6f79230c28bdf`
- Preceding candidate `17bbe1d6...` produced actionable CI findings; those findings were repaired before advancing the candidate.
- On `17bbe1d6...`: `Phase 2 security closure` passed; `security-definer-exposure-contract`, `dashboard-null-truth`, `certification-evidence-boundary`, `storage-tenant-isolation`, `data-quality-runtime`, `work-item-completion-gate`, `integrity-batch`, and several other targeted workflows passed. `canonical-aggregation-truth` and `file-intelligence-security` exposed stale/incorrect harness assumptions; these were repaired.
- Current candidate `eb5e5fa4...` has fresh PR-triggered workflows launched, including quality, canonical aggregation, file-intelligence security, Phase-2 security, and dashboard truth workflows. At documentation time these current runs were still queued/pending/in progress; therefore no full exact-head CI PASS is claimed.
- Quality workflow itself is configured to print and validate `PR_HEAD_SHA` separately from the merge ref; no merge-ref evidence is transferred to the candidate SHA.

## Regression scope already executed
- Live staging DB/RLS/tenant adversarial SQL: executed; no staging mutation.
- GitHub runner full repository checkout: demonstrated by CI; npm install, typecheck/build/lint, 20-stage release readiness, architecture, import, security, document, decision, production-contract and regression suites have executed on preceding exact candidate(s).
- Current final candidate still requires fresh CI completion before any `REGRESSION=PASS` or certification claim.

## Gate status
- DATABASE: CLOSED / PROVEN for inspected live controls.
- KNOWN CANONICAL RPC CONTRACTS: CLOSED / PROVEN.
- FRONTEND KNOWN CONTRACTS: CLOSED / PROVEN after dashboard normalization repair.
- REPOSITORY-WIDE RPC INVENTORY/PARITY/DEPENDENCY GRAPH: TOOLING-BLOCKED / UNPROVEN.
- FULL MIGRATION CONTENT/OBJECT PARITY: TOOLING-BLOCKED / UNPROVEN.
- FULL BYPASS SEARCH: TOOLING-BLOCKED / UNPROVEN beyond executed targeted adversarial paths.
- EXACT-HEAD CI: IN-PROGRESS for `eb5e5fa4...`; not yet certification evidence.
- FULL APPLICATION REGRESSION: UNPROVEN until current exact candidate CI completes.
- PRODUCTION RUNTIME: EXTERNAL-BLOCKED.
- AUTHENTICATED E2E: EXTERNAL-BLOCKED.
- LIVE TENANT A/B: EXTERNAL-BLOCKED.
- BACKUP/RESTORE: EXTERNAL-BLOCKED.
- RPO/RTO: EXTERNAL-BLOCKED.
- ROLLBACK/DR: EXTERNAL-BLOCKED.
- PHASE-E: NOT STARTED.

## Mutation boundary
- Staging DB mutation in this cycle: NONE.
- Production mutation: NONE.
- Code/test mutations: dashboard RPC adapter normalization; pure file-security scanner extraction; TypeScript import compatibility; Phase-2 security checker correction; tenant-security checker correction; dashboard truth checker correction; dashboard adversarial regression lock.
- Historical evidence preserved; no evidence transferred across SHA boundaries.
