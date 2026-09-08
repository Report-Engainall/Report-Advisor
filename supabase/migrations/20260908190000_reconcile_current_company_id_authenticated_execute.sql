-- Reconcile the live Staging privilege boundary observed on 2026-09-08.
-- Forward-only migration; historical migration files are intentionally untouched.
-- The function itself is already canonical on current main; this migration restores
-- its explicit authenticated EXECUTE grant for fresh environments.

REVOKE ALL ON FUNCTION public.current_company_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_company_id() FROM anon;
GRANT EXECUTE ON FUNCTION public.current_company_id() TO authenticated;
