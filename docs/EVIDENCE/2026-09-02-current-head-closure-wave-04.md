# Closure Wave 04 — Live Supabase Security/RPC/Runtime Truth

Date: 2026-09-02
Source repository boundary: `3fa9e9c839b1ef3d7d71c06f93b7a29c76de43d4`
Closure branch: `closure/current-head-3fa9e9c`

## DATE → EXACT HEAD → ACTION → RESULT → BLOCKER → NEXT

`2026-09-02 → 3fa9e9c839b1ef3d7d71c06f93b7a29c76de43d4 → live Supabase security/RPC/runtime contract audit → five concrete closure results recorded below → Master Index remains stale on main and exact-head CI is not fresh for this boundary → synchronize index safely, then consume exact-head CI; do not promote runtime evidence to Production certification`

## 1. Anonymous table exposure closed

Live database inspection confirmed that the checked `public` tables have RLS enabled and `anon` has no SELECT privilege. This is stronger than relying on migration history alone because it checks the actual database state.

## 2. Anonymous executable RPC exposure closed

Live inspection of `public` functions found only `normalize_import_key` executable by `anon`; it is `SECURITY INVOKER` and therefore is not an elevated anonymous `SECURITY DEFINER` path. The sensitive elevated RPC set is not executable by `anon`.

## 3. Authenticated SECURITY DEFINER RPCs were individually reviewed

The currently authenticated-executable `SECURITY DEFINER` business RPCs were inspected from live function definitions. The reviewed functions establish authenticated tenant context through `auth.uid()` directly or through `current_company_id()`, and their data mutations/reads are constrained by the resolved company ID. Examples include decision creation, recommendation creation, approval, work-item execution, outcomes, alert updates, recommendation/decision linking, and receivables reporting.

The Security Advisor warning about authenticated SECURITY DEFINER executability therefore cannot be treated as an automatic defect or fixed by blanket revocation: these RPCs are business application contracts and several are actively required by the authenticated runtime. No unsafe privilege mutation was performed.

## 4. Current runtime RPC contract is operationally responding

Recent live Supabase API logs showed successful authenticated calls for `current_company_id`, `get_dashboard_intelligence`, `get_dashboard_snapshot`, and `get_forecast_snapshot`, plus authenticated reads of `companies` and `import_jobs`. Password authentication and `/auth/v1/user` requests also returned successful `200` responses in the inspected runtime window. This supersedes the earlier observed dashboard-RPC 404/authentication-failure state for the inspected current runtime window, but it does not prove an exact deployed source SHA or Production readiness.

## 5. Refresh-token error isolated, not misclassified

The inspected Auth logs contained an `Invalid Refresh Token` / HTTP 400 event, but successful password authentication followed and `/auth/v1/user` subsequently returned 200. The event is therefore recorded as a session-refresh transient rather than incorrectly promoted to a persistent password-auth defect.

## Security certification boundary

- RLS/table exposure: verified against live DB state for the inspected public-table set.
- Anonymous elevated RPC exposure: not present in the inspected live public function set.
- Authenticated SECURITY DEFINER authorization: reviewed; no blanket privilege removal is justified.
- Live dashboard RPC existence/response: observed successfully in current API logs.
- Production Runtime: UNPROVEN.
- Authenticated E2E: UNPROVEN.
- Tenant A/B live isolation: UNPROVEN.
- Backup/Restore/RPO/RTO/DR/Rollback operational proof: UNPROVEN.

No Production mutation, alias mutation, backup fabrication, restore simulation, or certification evidence transfer was performed.
