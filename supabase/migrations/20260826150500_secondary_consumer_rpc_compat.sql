-- Complete the canonical adapter contract used by src/lib/canonical-secondary-data-truth.ts.
-- These names are the public domain API; implementation remains in the truth functions.

CREATE OR REPLACE FUNCTION public.get_sales_monthly_truth(p_company_id uuid, p_months integer DEFAULT 6)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT public.get_sales_monthly_trend_truth(p_company_id,p_months);
$$;

CREATE OR REPLACE FUNCTION public.get_sales_top_customers(p_company_id uuid, p_limit integer DEFAULT 5)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT public.get_sales_top_customers_truth(p_company_id,p_limit);
$$;

CREATE OR REPLACE FUNCTION public.get_sales_top_products(p_company_id uuid, p_limit integer DEFAULT 5)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT public.get_sales_top_products_truth(p_company_id,p_limit);
$$;

CREATE OR REPLACE FUNCTION public.get_sales_category_breakdown(p_company_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
  SELECT public.get_sales_category_breakdown_truth(p_company_id);
$$;

REVOKE ALL ON FUNCTION public.get_sales_monthly_truth(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_top_customers(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_top_products(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_category_breakdown(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_sales_monthly_truth(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_top_customers(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_top_products(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_category_breakdown(uuid) TO authenticated;
