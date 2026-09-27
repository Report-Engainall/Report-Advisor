# RESUME TOKEN — 2026-09-28 / NAVIGATION EVIDENCE CONTRACT + EXACT-HEAD HOSTED PROOF

- MAIN CONTROL HEAD AT FRONT → `4ec779a0a1573fc3e0e395862f6761a70f775d49`.
- FUNCTIONAL HEAD BEFORE THIS PERSIST → `aacd3662f3289251feccc46c239269b0f87397db`.
- ROOT CAUSE FOUND AND FIXED → `scripts/check-navigation-route-contract.mjs` read Sidebar route literals that do not exist because Sidebar renders canonical `NAVIGATION_SECTIONS`; the check therefore evaluated zero Sidebar paths. The contract also lacked its required `node:assert/strict` import and crashed on execution.
- IMPLEMENTED → contract now asserts Sidebar binding to `NAVIGATION_SECTIONS`, derives navigation paths from the canonical registry, fixes duplicate-path checking, and imports `node:assert/strict`.
- ACTUAL DEVICE EXECUTION → the patched contract was executed on PC01 with Node 24.20.0 and returned PASS on a representative fixture: canonical registry paths resolved and Sidebar binding was detected. This fixture proof is not a substitute for full exact-project CI.
- HOSTED EXACT-HEAD → Vercel deployment `dpl_Db9sDnpPE92z5Gfaix5RTRC5PepC` is READY and is explicitly built from `aacd3662f3289251feccc46c239269b0f87397db`; temporary protected access rendered the Arabic RTL landing/login surface successfully. Authenticated application/browser E2E remains NOT PROVEN because the deployment requires login.
- CURRENT CI BOUNDARY → exact `aacd...` spawned 49 workflows; 43 queued, 3 pending, 1 in progress, 2 skipped/completed. No terminal non-skipped result yet.
- SECURITY/DATA RESCAN → changed import SQL keeps `current_company_id()` tenant binding, source-hash/file-record verification, RLS-compatible writes, advisory transaction locking, and only the deliberate SECURITY DEFINER boundaries for `current_customer_company_id` and six-argument `import_commit_batch`.
- DEVICE → PC01 is online and usable; the local checkout itself is not the exact candidate, so local checkout tests are not counted as candidate proof.
- DO NOT REPEAT → do not count the old Sidebar regex contract as evidence; do not transfer pre-`aacd...` CI; do not treat Vercel READY or hosted login-page render as authenticated Browser E2E PASS.
- NEXT EXECUTABLE ACTION → consume the first terminal exact-head CI result; if failed, repair only that current-SHA root; otherwise continue route/state/import/security rescan and then stabilize/re-anchor the functional front.

---

# RESUME TOKEN — 2026-09-28 / STABLE REANCHOR AFTER CANONICAL CONTROL UPDATE

- CURRENT MAIN BEFORE REANCHOR → `4ec779a0a1573fc3e0e395862f6761a70f775d49`.
- PRIOR FUNCTIONAL HEAD → `9a0660b408476fea8aa641a388a02aa0bc89c51f`.
- RESULT → canonical import-to-decision implementation plus client-ui tenant-policy parity repair reconstructed as a direct child of the latest main control plane.
- LIVE REPAIR VERIFIED → Staging migration `reconcile_client_ui_settings_tenant_policy` applied successfully; policy readback matches `current_company_id()`.
- EVIDENCE LAW → prior CI PASS remains historical to its exact SHA; fresh proof is required on this resulting SHA.
- DEVICE → PC01 offline; no browser/device/production evidence.
- NEXT → consume fresh CI, first-failure repair only, then stable persist/rescan.

---

# RESUME TOKEN — 2026-09-28 / CLIENT UI TENANT POLICY PARITY CLOSED

- FUNCTIONAL BRANCH HEAD BEFORE THIS WRITE → `7cc24af022362ec7fd61d278ac935c2b86429e0e`.
- ACTUAL CODE CHANGE → added `supabase/migrations/20260928200000_reconcile_client_ui_settings_tenant_policy.sql`.
- ROOT CAUSE → clean-restore migration created `client_ui_settings` SELECT policy against `current_customer_company_id()`, while live Staging policy uses canonical `current_company_id()`; this was a restore-parity drift.
- LIVE EXECUTION → migration `reconcile_client_ui_settings_tenant_policy` applied successfully to Staging.
- LIVE READBACK → `ui_settings_customer_select` now explicitly binds `organization_id = current_company_id()`; authenticated grants remain SELECT/INSERT/UPDATE, service_role full, anon revoked, matching the live boundary.
- CUSTOMER PORTAL BOUNDARY → `current_customer_company_id()` remains intentionally separate and continues to serve customer-portal RLS policies; it was not altered.
- EVIDENCE → exact live database readback completed after migration; no production/browser/device PASS inferred.
- NEXT → fresh CI on the updated branch; first terminal failure only, then persist main control state when the functional front stabilizes.

---

# RESUME TOKEN — 2026-09-28 / THIRD REANCHOR — CUSTOMER TENANT BOUNDARY CLASSIFIED

- CURRENT MAIN BEFORE REANCHOR → `b39d585803f7bca021cb68bb75a522c8bce115d6`.
- PRIOR FUNCTIONAL HEAD → `1c658d5efc9cc21061be858db3b9352263ec49b5`.
- RESULT → same canonical import-to-decision implementation reconstructed as a direct child of latest main; main control-plane memory is preserved.
- CUSTOMER TENANT RESOLVER → distinct staff/company and customer-portal boundaries confirmed; no merge mutation.
- FRESH PROOF LAW → prior `desktop-windows` SUCCESS remains tied to `0a48b4e`; fresh result required for resulting SHA.
- DEVICE → PC01 offline; no browser/device/production PASS.

---

# RESUME TOKEN — 2026-09-28 / SECOND RE-ANCHOR AFTER CONTROL-PLANE WRITE

- CURRENT MAIN CONTROL HEAD BEFORE REANCHOR → `b6357e6e0686c6d7835cc9043ba7e023781a3955`.
- PRIOR FUNCTIONAL HEAD → `0a48b4e19edf221d68e5d5c3d7497260b08352da`.
- REANCHOR → same functional implementation tree reconstructed as a direct child of the latest main; current main control-plane documentation is preserved.
- EXACT CI EVIDENCE RETAINED → `desktop-windows` run `36351392998` SUCCESS on prior functional SHA; fresh proof is required on this resulting SHA.
- STORAGE SECURITY → documents bucket authenticated tenant-prefix policies verified live; owner binding on inserts; no cross-tenant relaxation found.
- DEVICE → PC01 offline; no device/browser/production PASS.
- NEXT → consume fresh exact-head CI for this resulting SHA and repair only first reproducible failure.

---

# RESUME TOKEN — 2026-09-28 / RE-ANCHORED IMPORT FRONT

- CURRENT MAIN BEFORE REANCHOR → `517d01af74e72f8d7325bfca9ebfc4cb13eee5b6`.
- PR #672 SOURCE CANDIDATE → `cf0d30c4015642313d899d9d8262bc7159abb220`.
- REANCHOR RESULT → candidate implementation tree reconstructed as a direct child of current main; main-only control-plane updates are preserved and candidate implementation changes are overlaid.
- EVIDENCE RULE → prior candidate PASS remains candidate-only until fresh exact-head CI executes on the resulting SHA.
- DEVICE → PC01 offline; no device/browser/production proof claimed.
- NEXT → consume fresh exact-head CI for the re-anchored branch; repair only first reproducible failure; then global UI/core/security/data rescan.

---

# RESUME TOKEN — 2026-09-27 / READ RPC INVOKER SAFETY VERIFIED

- CURRENT MAIN CONTROL HEAD → `9e35c768c7548ab87174e3ffa9426dc4605489d3`.
- CURRENT PR #672 / branch `exec/20260927-current-main-import-ui-rebased`.
- CURRENT CODE CANDIDATE BEFORE THIS MEMORY WRITE → `6a485896dd92d648385c59eb374204158406ae50`.
- READ-RPC SAFETY PROOF → `get_receivables_report_page`, `get_cash_account_balances`, and `get_staff_receivables` are INVOKER; their source tables have authenticated tenant SELECT RLS; `cash_accounts` is company-scoped; `sales_invoices` and `customers` are company-scoped.
- ROLE-GATE PROOF → `get_cash_account_balances` and `get_staff_receivables` retain explicit `auth.uid()` + active company membership role checks. `company_memberships` SELECT RLS permits only the current user's own membership, which is sufficient for those predicates under INVOKER.
- `compute_control_plane_health` remains SECURITY DEFINER because its five source tables have no authenticated SELECT RLS policies. This is intentionally NOT downgraded.
- LIVE SECURITY ADVISOR → authenticated SECURITY DEFINER warnings = 40.
- STATIC CONTRACT → six safe import/report RPCs are now locked to INVOKER and critical invariant tokens.
- NEXT → current exact-head CI remains unavailable; no PASS inferred. Consume the next exact SHA checks, or select another proof-backed safe front only.

---
# RESUME TOKEN — 2026-09-27 / READ-ONLY RPC SECURITY BATCH CLOSED

- CURRENT MAIN CONTROL HEAD → `9e35c768c7548ab87174e3ffa9426dc4605489d3`.
- CURRENT PR #672 / branch `exec/20260927-current-main-import-ui-rebased`.
- CURRENT CODE CANDIDATE BEFORE THIS MEMORY WRITE → `6a485896dd92d648385c59eb374204158406ae50`.
- LIVE SECURITY BATCH EXECUTED → `import_create_job`, `import_update_job_progress`, `import_finish_job`, `get_receivables_report_page`, `get_cash_account_balances`, `get_staff_receivables` are now SECURITY INVOKER in Staging with authenticated/postgres/service_role execution and no public/anon execution.
- ROOT-CAUSE CLASS → migration-lineage drift, not business-logic failure. Repository replay migrations preserve existing live validation/role predicates and restore the narrower invoker/RLS boundary.
- SUPABASE SECURITY ADVISOR → authenticated SECURITY DEFINER warning count is now 40. The session removed five previously exposed functions from this warning class by proof-backed reconciliation; 40 remain separate and intentionally untouched.