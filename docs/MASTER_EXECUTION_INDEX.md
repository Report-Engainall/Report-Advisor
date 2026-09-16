# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-16

> Authoritative execution manifest. This document never promotes historical evidence across an exact Git `HEAD` boundary. Pair every evidence batch with the exact Git `HEAD` and the exact environment/commit used.

### CURRENT EXACT HEAD
- Current code/test candidate: `539b5f949ee6dd029710565c171757ed79b8ba8c`.
- This candidate is the current executable certification candidate on PR #475 (`fix: close canonical import durable production path`).
- Historical evidence from earlier SHAs remains historical and is not promoted automatically.
- This index update is governance-only; it does not certify runtime, browser, tenant A/B, import, OCR, recovery, backup/restore, performance, or LIVE state.

### BOUNDARY / GOVERNANCE
- No rebuild from scratch.
- No historical migration rewrite.
- No Production alias mutation or rollback action as part of source reconciliation.
- No Staging data fixture is treated as certification unless an actual lifecycle is observed.
- No HTTP 200, UI shell, CI-created run, fixture assertion, simulated JWT, historical deployment, or old SHA can certify the current candidate.
- External operational blockers do not justify idle work on source reconciliation, contract hardening, test design, or evidence preparation.
- Browser E2E must use real Chromium, real Supabase authentication, and browser-held sessions; service-role or mocked sessions are prohibited for certification.

## DEEP AUDIT — 2026-09-07

### Database / Security baseline
- Staging Supabase project `fnqbvfuwbdpwvhcgzksl` is ACTIVE_HEALTHY.
- Critical-table RLS verification: 9/9 checked tables protected.
- Critical-table anonymous-policy verification: 9/9 checked tables have no anon policies.
- Security-definer authenticated surface: 16/16 authenticated-executable SECURITY DEFINER functions are bound to `current_company_id()`; 13/16 also use `auth.uid()`; 16/16 pin `search_path`.
- Critical tenant FK audit: 16 tenant-bound FKs verified.
- Critical index audit: 48 relevant indexes verified.
- Worker RPC surface: exactly eight durable worker RPCs; all are SECURITY DEFINER but have authenticated EXECUTE=false and anon EXECUTE=false, leaving execution to service_role.
- Import RPC surface: canonical import RPCs exist with authenticated execution and anon execution denied.
- Current canonical invoice import signature is exactly `import_upsert_sales_invoice(uuid,text,date,uuid,text,numeric,numeric,numeric,numeric,text,text)`.
- `import_commit_batch(uuid,text,jsonb,text)` is invoker-bound, tenant-checked, authenticated-only, and passes `customer_name` to the canonical invoice RPC.
