# MASTER EXECUTION INDEX — APPEND-ONLY ADDENDUM

## Cycle
DB/RPC parity closure — receivables canonical RPC + security-definer hardening

## Evidence boundary
- Certification Baseline: `ec6eb4cce7803af8e94697adfa6d9308f69a9ee2` — reference only; no evidence transferred.
- Repair HEAD before this cycle: `c2fecabe69576ddfbaa4127219970653b20d347a`.
- Repair HEAD after this cycle: `9b522bf7314b25306b25175e1477c7daa46a1e69`.
- Staging Supabase target: `fnqbvfuwbdpwvhcgzksl1`.
- Production binding remains untouched and BLOCKED.

## Timestamp
2026-09-02T09:30:55Z

## Finding / RCA
The active frontend receivables page calls `public.get_receivables_report_page(p_page, p_page_size)` and expects a JSONB page contract. The canonical Git migration is `supabase/migrations/20260827160000_receivables_authoritative_page.sql` (Git blob SHA `05523e2c392136286038599eb0b7539cebf08e2c`).

Read-only Staging inspection before mutation proved:
- canonical migration version `20260827160000` was not recorded in live migration history;
- `public.get_receivables_report_page` did not exist in live `pg_proc`;
- therefore this was a real Git → live DB parity defect, not a frontend workaround issue.

The canonical migration was applied to Staging through the migration API and recorded by the target as live migration `20260902092929` with name `receivables_authoritative_page_20260827160000`.

The canonical function is SECURITY DEFINER. Its source specifies `search_path=public`, which reintroduced a SECURITY DEFINER search-path gap after the earlier global hardening. A deterministic repair migration was therefore added to the repair branch and applied to Staging:
`supabase/migrations/20260902093000_harden_receivables_authoritative_page_search_path.sql`

The repair pins the function to `search_path=pg_catalog` and reasserts PUBLIC/anon revoke + authenticated execute.

## Tests
### Canonical RPC contract
PASS — Exact HEAD `9b522bf7314b25306b25175e1477c7daa46a1e69` — Staging — `get_receivables_report_page`
- signature: `p_page integer, p_page_size integer`
- return: `jsonb`
- SECURITY DEFINER: true
- search_path: `pg_catalog`
- PUBLIC EXECUTE: false
- anon EXECUTE: false
- authenticated EXECUTE: true

### Tenant A DB-level isolation
PASS — Exact HEAD `9b522bf7314b25306b25175e1477c7daa46a1e69` — Staging — authenticated JWT-context simulation
- `current_company_id()` resolved
- returned invoice rows matched current tenant
- cross-tenant row count = 0
- total_rows matched the current tenant's authoritative receivables dataset
- result shape valid

### Tenant B DB-level isolation
PASS — Exact HEAD `9b522bf7314b25306b25175e1477c7daa46a1e69` — Staging — authenticated JWT-context simulation
- `current_company_id()` resolved
- returned invoice rows matched current tenant
- cross-tenant row count = 0
- total_rows matched the current tenant's authoritative receivables dataset
- result shape valid

### Global security regression
PASS — Exact HEAD `9b522bf7314b25306b25175e1477c7daa46a1e69` — Staging
- unsafe SECURITY DEFINER search_path count = 0
- SECURITY DEFINER functions executable by anon count = 0
- public tables with RLS = all public tables
- unvalidated public constraints = 0
- cross-tenant sales→customer references = 0
- cross-tenant purchase→supplier references = 0
- cross-tenant payment→customer references = 0

### Runtime/report/billing/decision RPC surface
PASS — Exact HEAD `9b522bf7314b25306b25175e1477c7daa46a1e69` — Staging read-only catalog audit
Canonical report execution and decision/outcome functions were present with expected signatures and hardened SECURITY DEFINER search_path. Worker lifecycle RPCs remain service/worker scoped where expected; authenticated decision/work-item mutation RPCs remain authenticated-only.

### Harness classification
One earlier expected-signature SQL harness attempt in this cycle had malformed SQL and was not treated as a system failure. The query was corrected before the recorded PASS results above. Classification: HARNESS FAILURE only; no database mutation resulted from the malformed query.

## Frontend ↔ Supabase
`src/lib/queries.ts` and `src/pages/ReceivablesReportCanonicalPage.tsx` were inspected at the pre-mutation repair HEAD. The page directly imports `fetchReceivablesReportPage`, which directly calls `get_receivables_report_page`; this establishes an active application contract, unlike legacy/unreferenced Phase-KL runtime modules.

## Known legacy/unresolved surface
`src/lib/phase-kl-supabase-runtime.ts` contains RPC names `record_control_plane_health`, `record_executive_evidence_edge`, and `autonomy_runtime_gate`, which are absent from live `pg_proc`. Import/usage evidence for this legacy module was not proven in this cycle, so no speculative DB RPCs were created. Status: UNPROVEN/LEGACY CANDIDATE, not repaired.

## Production boundary
No Production Supabase mutation, Vercel binding change, production migration, restore, rollback, DR action, or Dashboard RPC change was performed.

## Next
Continue repository-wide RPC caller extraction beyond the inspected canonical query surface, then close remaining proven Git→live migration parity gaps. Only after migration parity + RPC regression are proven should Phase-E Staging runtime inputs be exercised. Production remains blocked pending a proven Production Supabase target and real runtime evidence.
