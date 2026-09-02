-- Repair: the canonical receivables page is SECURITY DEFINER and must use a pinned search_path.
-- The function body already qualifies all application objects with public.*.
ALTER FUNCTION public.get_receivables_report_page(integer, integer)
  SET search_path = pg_catalog;

REVOKE ALL ON FUNCTION public.get_receivables_report_page(integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_receivables_report_page(integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_receivables_report_page(integer, integer) TO authenticated;
