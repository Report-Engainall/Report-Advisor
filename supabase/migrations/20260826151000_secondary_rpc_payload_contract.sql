-- Secondary RPC payload contract: every adapter-facing aggregate returns {status, rows, as_of}.
-- This closes the adapter/runtime mismatch without moving business logic into the browser.

CREATE OR REPLACE FUNCTION public.get_sales_monthly_trend_truth(p_company_id uuid, p_months integer DEFAULT 6)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id(); v_months integer:=GREATEST(1,LEAST(COALESCE(p_months,6),24)); v_start date:=(date_trunc('month',current_date)-((v_months-1)||' months')::interval)::date; v_result jsonb;
BEGIN
 IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF; IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
 WITH months AS (SELECT gs::date month_start,to_char(gs,'YYYY-MM') month_key FROM generate_series(v_start::timestamp,date_trunc('month',current_date),interval '1 month') gs), rows AS (
 SELECT m.month_key, m.month_start, (SELECT SUM(si.subtotal) FROM sales_invoices si WHERE si.company_id=v_company_id AND si.invoice_date>=m.month_start AND si.invoice_date<m.month_start+interval '1 month' AND COALESCE(si.status,'') NOT IN ('cancelled','void')) sales,
 (SELECT CASE WHEN COUNT(*) FILTER(WHERE it.cost_price IS NULL OR it.quantity IS NULL)>0 THEN NULL ELSE SUM(it.cost_price*it.quantity) END FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id WHERE si.company_id=v_company_id AND si.invoice_date>=m.month_start AND si.invoice_date<m.month_start+interval '1 month' AND COALESCE(si.status,'') NOT IN ('cancelled','void')) cost,
 (SELECT COUNT(*) FROM sales_invoices si WHERE si.company_id=v_company_id AND si.invoice_date>=m.month_start AND si.invoice_date<m.month_start+interval '1 month' AND COALESCE(si.status,'') NOT IN ('cancelled','void')) invoices FROM months m)
 SELECT jsonb_build_object('status',CASE WHEN EXISTS(SELECT 1 FROM rows r WHERE r.invoices>0 AND r.cost IS NULL) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,'rows',COALESCE((SELECT jsonb_agg(jsonb_build_object('month',month_key,'label',month_key,'sales',sales,'cost',cost,'profit',CASE WHEN sales IS NULL OR cost IS NULL THEN NULL ELSE sales-cost END,'invoices',invoices,'status',CASE WHEN invoices>0 AND cost IS NULL THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END) ORDER BY month_start) FROM rows),'[]'::jsonb)) INTO v_result; RETURN v_result;
END; $$;

CREATE OR REPLACE FUNCTION public.get_sales_top_customers_truth(p_company_id uuid,p_limit integer DEFAULT 5)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id(); v_limit integer:=GREATEST(1,LEAST(COALESCE(p_limit,5),100)); v_result jsonb;
BEGIN IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF; IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
SELECT jsonb_build_object('status','CALCULATED','rows',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',x.customer_id,'name',COALESCE(c.name,x.customer_id::text),'value',x.value) ORDER BY x.value DESC) FROM (SELECT si.customer_id,SUM(si.subtotal) value FROM sales_invoices si WHERE si.company_id=v_company_id AND si.customer_id IS NOT NULL AND COALESCE(si.status,'') NOT IN ('cancelled','void') AND si.subtotal IS NOT NULL GROUP BY si.customer_id ORDER BY value DESC LIMIT v_limit)x LEFT JOIN customers c ON c.id=x.customer_id AND c.company_id=v_company_id),'[]'::jsonb)) INTO v_result; RETURN v_result; END; $$;

CREATE OR REPLACE FUNCTION public.get_sales_top_products_truth(p_company_id uuid,p_limit integer DEFAULT 5)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id(); v_limit integer:=GREATEST(1,LEAST(COALESCE(p_limit,5),100)); v_result jsonb;
BEGIN IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF; IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
SELECT jsonb_build_object('status',CASE WHEN EXISTS(SELECT 1 FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id WHERE si.company_id=v_company_id AND COALESCE(si.status,'') NOT IN ('cancelled','void') AND it.line_total IS NULL) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,'rows',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',x.product_id,'name',COALESCE(p.name,x.product_id::text),'value',x.value,'secondary',x.quantity) ORDER BY x.value DESC) FROM (SELECT it.product_id,SUM(it.line_total) value,SUM(it.quantity) quantity FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id WHERE si.company_id=v_company_id AND it.product_id IS NOT NULL AND COALESCE(si.status,'') NOT IN ('cancelled','void') AND it.line_total IS NOT NULL GROUP BY it.product_id ORDER BY value DESC LIMIT v_limit)x LEFT JOIN products p ON p.id=x.product_id AND p.company_id=v_company_id),'[]'::jsonb)) INTO v_result; RETURN v_result; END; $$;

CREATE OR REPLACE FUNCTION public.get_sales_category_breakdown_truth(p_company_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id(); v_result jsonb;
BEGIN IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF; IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
SELECT jsonb_build_object('status',CASE WHEN EXISTS(SELECT 1 FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id WHERE si.company_id=v_company_id AND COALESCE(si.status,'') NOT IN ('cancelled','void') AND (it.line_total IS NULL OR it.quantity IS NULL OR it.cost_price IS NULL)) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,'rows',COALESCE((SELECT jsonb_agg(jsonb_build_object('name',COALESCE(c.name,'غير مصنف'),'sales',x.sales,'profit',x.profit,'quantity',x.quantity) ORDER BY x.sales DESC) FROM (SELECT p.category_id,SUM(it.line_total) sales,CASE WHEN COUNT(*) FILTER(WHERE it.cost_price IS NULL OR it.quantity IS NULL)>0 THEN NULL ELSE SUM(it.line_total-it.cost_price*it.quantity) END profit,SUM(it.quantity) quantity FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id JOIN products p ON p.id=it.product_id AND p.company_id=v_company_id WHERE si.company_id=v_company_id AND COALESCE(si.status,'') NOT IN ('cancelled','void') GROUP BY p.category_id)x LEFT JOIN categories c ON c.id=x.category_id AND c.company_id=v_company_id),'[]'::jsonb)) INTO v_result; RETURN v_result; END; $$;

CREATE OR REPLACE FUNCTION public.get_sales_monthly_truth(p_company_id uuid,p_months integer DEFAULT 6) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT public.get_sales_monthly_trend_truth(p_company_id,p_months); $$;
CREATE OR REPLACE FUNCTION public.get_sales_top_customers(p_company_id uuid,p_limit integer DEFAULT 5) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT public.get_sales_top_customers_truth(p_company_id,p_limit); $$;
CREATE OR REPLACE FUNCTION public.get_sales_top_products(p_company_id uuid,p_limit integer DEFAULT 5) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT public.get_sales_top_products_truth(p_company_id,p_limit); $$;
CREATE OR REPLACE FUNCTION public.get_sales_category_breakdown(p_company_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT public.get_sales_category_breakdown_truth(p_company_id); $$;

REVOKE ALL ON FUNCTION public.get_sales_monthly_trend_truth(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_top_customers_truth(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_top_products_truth(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_category_breakdown_truth(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_monthly_truth(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_top_customers(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_top_products(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_category_breakdown(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_sales_monthly_trend_truth(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_top_customers_truth(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_top_products_truth(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_category_breakdown_truth(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_monthly_truth(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_top_customers(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_top_products(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_category_breakdown(uuid) TO authenticated;
