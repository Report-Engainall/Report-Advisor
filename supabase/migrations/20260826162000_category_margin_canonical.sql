-- Category margin is a domain metric, not a browser/export calculation.
CREATE OR REPLACE FUNCTION public.get_sales_category_breakdown_truth(p_company_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id(); v_result jsonb;
BEGIN
 IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
 IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
 SELECT jsonb_build_object(
   'status',CASE WHEN EXISTS(SELECT 1 FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id WHERE si.company_id=v_company_id AND COALESCE(si.status,'') NOT IN ('cancelled','void') AND (it.line_total IS NULL OR it.quantity IS NULL OR it.cost_price IS NULL)) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
   'rows',COALESCE((SELECT jsonb_agg(jsonb_build_object('name',COALESCE(c.name,'غير مصنف'),'sales',x.sales,'profit',x.profit,'margin_pct',CASE WHEN x.sales IS NULL OR x.profit IS NULL OR x.sales=0 THEN NULL ELSE round((x.profit/x.sales)*100,2) END,'quantity',x.quantity) ORDER BY x.sales DESC) FROM (SELECT p.category_id,SUM(it.line_total) sales,CASE WHEN COUNT(*) FILTER(WHERE it.cost_price IS NULL OR it.quantity IS NULL)>0 THEN NULL ELSE SUM(it.line_total-it.cost_price*it.quantity) END profit,SUM(it.quantity) quantity FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id JOIN products p ON p.id=it.product_id AND p.company_id=v_company_id WHERE si.company_id=v_company_id AND COALESCE(si.status,'') NOT IN ('cancelled','void') GROUP BY p.category_id)x LEFT JOIN categories c ON c.id=x.category_id AND c.company_id=v_company_id),'[]'::jsonb)
 ) INTO v_result;
 RETURN v_result;
END; $$;
CREATE OR REPLACE FUNCTION public.get_sales_category_breakdown(p_company_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT public.get_sales_category_breakdown_truth(p_company_id); $$;
REVOKE ALL ON FUNCTION public.get_sales_category_breakdown_truth(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_category_breakdown(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_sales_category_breakdown_truth(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_category_breakdown(uuid) TO authenticated;
