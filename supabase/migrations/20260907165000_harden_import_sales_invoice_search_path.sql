-- Security hardening: pin the canonical invoice import RPC search_path.
-- The function is SECURITY INVOKER and remains tenant-bound through current_company_id().
ALTER FUNCTION public.import_upsert_sales_invoice(
  uuid, text, date, uuid, text, numeric, numeric, numeric, numeric, text, text
) SET search_path = public, pg_catalog;

REVOKE ALL ON FUNCTION public.import_upsert_sales_invoice(
  uuid, text, date, uuid, text, numeric, numeric, numeric, numeric, text, text
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.import_upsert_sales_invoice(
  uuid, text, date, uuid, text, numeric, numeric, numeric, numeric, text, text
) TO authenticated;
