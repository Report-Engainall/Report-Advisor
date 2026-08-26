-- Secondary consumer domain truth: server-side, tenant-authoritative aggregates.
-- These functions intentionally own business semantics; browser consumers only adapt/display them.

CREATE OR REPLACE FUNCTION public.get_sales_monthly_trend_truth(p_company_id uuid, p_months integer DEFAULT 6)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public
AS $$
DECLARE v_company_id uuid := public.current_company_id(); v_months integer := GREATEST(1, LEAST(COALESCE(p_months,6),24)); v_start date := (date_trunc('month', current_date) - ((v_months-1) || ' months')::interval)::date;
BEGIN
 IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
 IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
 RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('month',m.month_key,'label',to_char(m.month_start,'TMMonth'),'sales',m.sales,'cost',m.cost,'profit',CASE WHEN m.sales IS NULL OR m.cost IS NULL THEN NULL ELSE m.sales-m.cost END,'invoices',m.invoices) ORDER BY m.month_start)
 FROM (SELECT gs::date AS month_start,to_char(gs,'YYYY-MM') AS month_key,
   (SELECT SUM(si.subtotal) FROM sales_invoices si WHERE si.company_id=v_company_id AND si.invoice_date >= gs AND si.invoice_date < gs + interval '1 month' AND COALESCE(si.status,'') NOT IN ('cancelled','void')) AS sales,
   (SELECT CASE WHEN COUNT(*) FILTER (WHERE it.cost_price IS NULL OR it.quantity IS NULL)>0 THEN NULL ELSE SUM(it.cost_price*it.quantity) END FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id WHERE si.company_id=v_company_id AND si.invoice_date >= gs AND si.invoice_date < gs + interval '1 month' AND COALESCE(si.status,'') NOT IN ('cancelled','void')) AS cost,
   (SELECT COUNT(*) FROM sales_invoices si WHERE si.company_id=v_company_id AND si.invoice_date >= gs AND si.invoice_date < gs + interval '1 month' AND COALESCE(si.status,'') NOT IN ('cancelled','void')) AS invoices
   FROM generate_series(v_start::timestamp,date_trunc('month',current_date),interval '1 month') gs) m),'[]'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION public.get_sales_top_customers_truth(p_company_id uuid, p_limit integer DEFAULT 5)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id(); v_limit integer:=GREATEST(1,LEAST(COALESCE(p_limit,5),100));
BEGIN IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF; IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('id',x.customer_id,'name',COALESCE(c.name,x.customer_id),'value',x.value) ORDER BY x.value DESC) FROM (SELECT si.customer_id,SUM(si.subtotal) value FROM sales_invoices si WHERE si.company_id=v_company_id AND si.customer_id IS NOT NULL AND COALESCE(si.status,'') NOT IN ('cancelled','void') GROUP BY si.customer_id ORDER BY value DESC LIMIT v_limit)x LEFT JOIN customers c ON c.id=x.customer_id AND c.company_id=v_company_id),'[]'::jsonb); END; $$;

CREATE OR REPLACE FUNCTION public.get_sales_top_products_truth(p_company_id uuid, p_limit integer DEFAULT 5)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id(); v_limit integer:=GREATEST(1,LEAST(COALESCE(p_limit,5),100));
BEGIN IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF; IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('id',x.product_id,'name',COALESCE(p.name,x.product_id),'value',x.value,'secondary',x.quantity) ORDER BY x.value DESC) FROM (SELECT it.product_id,SUM(it.line_total) value,SUM(it.quantity) quantity FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id WHERE si.company_id=v_company_id AND it.product_id IS NOT NULL AND COALESCE(si.status,'') NOT IN ('cancelled','void') GROUP BY it.product_id ORDER BY value DESC LIMIT v_limit)x LEFT JOIN products p ON p.id=x.product_id AND p.company_id=v_company_id),'[]'::jsonb); END; $$;

CREATE OR REPLACE FUNCTION public.get_sales_category_breakdown_truth(p_company_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id();
BEGIN IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF; IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('name',COALESCE(c.name,'غير مصنف'),'sales',x.sales,'profit',x.profit,'quantity',x.quantity) ORDER BY x.sales DESC) FROM (SELECT p.category_id,SUM(it.line_total) sales,CASE WHEN COUNT(*) FILTER(WHERE it.cost_price IS NULL OR it.quantity IS NULL)>0 THEN NULL ELSE SUM(it.line_total-it.cost_price*it.quantity) END profit,SUM(it.quantity) quantity FROM sale_items it JOIN sales_invoices si ON si.id=it.invoice_id JOIN products p ON p.id=it.product_id AND p.company_id=v_company_id WHERE si.company_id=v_company_id AND COALESCE(si.status,'') NOT IN ('cancelled','void') GROUP BY p.category_id)x LEFT JOIN categories c ON c.id=x.category_id AND c.company_id=v_company_id),'[]'::jsonb); END; $$;

CREATE OR REPLACE FUNCTION public.get_receivables_aging_truth(p_company_id uuid, p_as_of date DEFAULT current_date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id(); v_as_of date:=COALESCE(p_as_of,current_date);
BEGIN IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF; IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
RETURN (SELECT jsonb_build_object('as_of',v_as_of,'status',CASE WHEN COUNT(*) FILTER(WHERE si.total IS NULL OR si.paid_amount IS NULL)>0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,'buckets',COALESCE(jsonb_agg(jsonb_build_object('bucket',bucket,'amount',amount,'count',cnt) ORDER BY ord),'[]'::jsonb)) FROM (SELECT b.bucket,b.ord,COALESCE(SUM(b.outstanding),0) amount,COUNT(b.id) FILTER(WHERE b.outstanding>0) cnt FROM (SELECT si.id,si.total-si.paid_amount outstanding,CASE WHEN si.due_date IS NULL THEN 'UNDATED' WHEN v_as_of-si.due_date BETWEEN 0 AND 30 THEN '0-30' WHEN v_as_of-si.due_date BETWEEN 31 AND 60 THEN '31-60' WHEN v_as_of-si.due_date BETWEEN 61 AND 90 THEN '61-90' WHEN v_as_of-si.due_date>90 THEN '90+' ELSE '0-30' END bucket,CASE WHEN si.due_date IS NULL THEN 4 WHEN v_as_of-si.due_date BETWEEN 0 AND 30 THEN 0 WHEN v_as_of-si.due_date BETWEEN 31 AND 60 THEN 1 WHEN v_as_of-si.due_date BETWEEN 61 AND 90 THEN 2 WHEN v_as_of-si.due_date>90 THEN 3 ELSE 0 END ord FROM sales_invoices si WHERE si.company_id=v_company_id AND COALESCE(si.status,'') NOT IN ('cancelled','void')) b GROUP BY b.bucket,b.ord) q);
END; $$;

REVOKE ALL ON FUNCTION public.get_sales_monthly_trend_truth(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_top_customers_truth(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_top_products_truth(uuid,integer) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_sales_category_breakdown_truth(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.get_receivables_aging_truth(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_sales_monthly_trend_truth(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_top_customers_truth(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_top_products_truth(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_category_breakdown_truth(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_receivables_aging_truth(uuid,date) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_sales_invoices_company_date_status ON sales_invoices(company_id,invoice_date,status);
CREATE INDEX IF NOT EXISTS idx_sale_items_invoice_product ON sale_items(invoice_id,product_id);
