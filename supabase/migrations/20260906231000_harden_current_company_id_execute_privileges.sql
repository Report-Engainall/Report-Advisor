-- Internal tenant-context helper: not a direct client RPC surface.
REVOKE EXECUTE ON FUNCTION public.current_company_id() FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.current_company_id() TO service_role;
