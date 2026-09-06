-- Import upsert RPCs already enforce the authenticated tenant context explicitly.
-- Run them as invoker so table RLS remains an independent enforcement layer.
ALTER FUNCTION public.import_upsert_customer(uuid,text,text,text,text,text,numeric,integer,text) SECURITY INVOKER;
ALTER FUNCTION public.import_upsert_sales_invoice(uuid,text,date,uuid,numeric,numeric,numeric,numeric,text,text) SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.import_upsert_customer(uuid,text,text,text,text,text,numeric,integer,text) FROM public, anon;
REVOKE ALL ON FUNCTION public.import_upsert_sales_invoice(uuid,text,date,uuid,numeric,numeric,numeric,numeric,text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.import_upsert_customer(uuid,text,text,text,text,text,numeric,integer,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.import_upsert_sales_invoice(uuid,text,date,uuid,numeric,numeric,numeric,numeric,text,text) TO authenticated;
