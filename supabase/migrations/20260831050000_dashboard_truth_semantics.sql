-- Dashboard truth semantics: server-authoritative trend/category/aging payloads.
-- No browser aggregation; unavailable facts remain explicit instead of becoming zero.
CREATE OR REPLACE FUNCTION public.get_dashboard_truth_semantics(p_months integer DEFAULT 6,p_as_of date DEFAULT CURRENT_DATE)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE v_company_id uuid:=public.current_company_id(); v_months integer:=LEAST(GREATEST(COALESCE(p_months,6),1),24); v_result jsonb;
BEGIN
 IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
 WITH sales_base AS (
   SELECT s.id,s.subtotal,s.total,s.paid_amount,s.invoice_date,s.due_date FROM public.sales_invoices s
   WHERE s.company_id=v_company_id AND s.status IS NOT NULL AND s.status NOT IN ('cancelled','void') AND s.invoice_date<=p_as_of
 ), items AS (SELECT i.invoice_id,i.product_id,i.quantity,i.line_total,i.cost_price FROM public.sale_items i JOIN sales_base s ON s.id=i.invoice_id),
 trend AS (
   SELECT jsonb_agg(jsonb_build_object('month',to_char(m.month_start,'YYYY-MM'),'label',to_char(m.month_start,'Mon YYYY'),'sales',x.sales,'cost',x.cost,'profit',CASE WHEN x.sales IS NOT NULL AND x.cost IS NOT NULL THEN x.sales-x.cost END,'invoices',x.invoices,'status',CASE WHEN x.invoice_count=0 THEN 'NO_DATA' WHEN x.bad_rows>0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END) ORDER BY m.month_start) rows
   FROM generate_series(date_trunc('month',p_as_of::timestamp)-((v_months-1)*interval '1 month'),date_trunc('month',p_as_of::timestamp),interval '1 month') m(month_start)
   LEFT JOIN LATERAL (
     SELECT count(DISTINCT s.id) invoice_count,count(DISTINCT s.id) FILTER(WHERE s.subtotal IS NULL OR EXISTS(SELECT 1 FROM items bad WHERE bad.invoice_id=s.id AND (bad.quantity IS NULL OR bad.cost_price IS NULL OR bad.line_total IS NULL)))::integer bad_rows,
            sum(s.subtotal) FILTER(WHERE s.subtotal IS NOT NULL AND NOT EXISTS(SELECT 1 FROM items bad WHERE bad.invoice_id=s.id AND (bad.quantity IS NULL OR bad.cost_price IS NULL OR bad.line_total IS NULL))) sales,
            sum(i.quantity*i.cost_price) FILTER(WHERE i.quantity IS NOT NULL AND i.cost_price IS NOT NULL AND i.line_total IS NOT NULL) cost,
            count(DISTINCT s.id) FILTER(WHERE s.subtotal IS NOT NULL AND NOT EXISTS(SELECT 1 FROM items bad WHERE bad.invoice_id=s.id AND (bad.quantity IS NULL OR bad.cost_price IS NULL OR bad.line_total IS NULL))) invoices
     FROM sales_base s LEFT JOIN items i ON i.invoice_id=s.id
     WHERE s.invoice_date>=m.month_start::date AND s.invoice_date<(m.month_start+interval '1 month')::date
   ) x ON true
 ),
 categories AS (
   SELECT jsonb_agg(jsonb_build_object('name',CASE WHEN p.category_id IS NULL THEN 'UNKNOWN' ELSE COALESCE(c.name,'UNKNOWN') END,'sales',q.sales,'profit',q.profit,'quantity',q.quantity,'status',CASE WHEN q.unknown_rows>0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END) ORDER BY q.sales DESC NULLS LAST) rows
   FROM (SELECT p.category_id,sum(i.line_total) sales,sum(i.line_total-(i.cost_price*i.quantity)) profit,sum(i.quantity) quantity,count(*) FILTER(WHERE i.product_id IS NULL OR p.id IS NULL OR p.category_id IS NULL)::integer unknown_rows
         FROM items i LEFT JOIN public.products p ON p.id=i.product_id AND p.company_id=v_company_id
         WHERE i.line_total IS NOT NULL AND i.quantity IS NOT NULL AND i.cost_price IS NOT NULL GROUP BY p.category_id) q
   LEFT JOIN public.categories c ON c.id=q.category_id AND c.company_id=v_company_id
 ),
 aging_base AS (
   SELECT s.total-s.paid_amount outstanding,s.due_date,CASE WHEN s.due_date IS NULL THEN NULL ELSE GREATEST(0,p_as_of-s.due_date) END age_days,CASE WHEN s.total IS NULL OR s.paid_amount IS NULL OR s.due_date IS NULL THEN 1 ELSE 0 END unknown
   FROM sales_base s WHERE s.total IS NOT NULL OR s.paid_amount IS NOT NULL OR s.due_date IS NOT NULL
 ), aging_rows AS (
   SELECT '0-30' bucket,COALESCE(sum(outstanding) FILTER(WHERE age_days BETWEEN 0 AND 30),0) amount,count(*) FILTER(WHERE age_days BETWEEN 0 AND 30 AND outstanding>0) count,1 sort_order FROM aging_base WHERE unknown=0
   UNION ALL SELECT '31-60',COALESCE(sum(outstanding) FILTER(WHERE age_days BETWEEN 31 AND 60),0),count(*) FILTER(WHERE age_days BETWEEN 31 AND 60 AND outstanding>0),2 FROM aging_base WHERE unknown=0
   UNION ALL SELECT '61-90',COALESCE(sum(outstanding) FILTER(WHERE age_days BETWEEN 61 AND 90),0),count(*) FILTER(WHERE age_days BETWEEN 61 AND 90 AND outstanding>0),3 FROM aging_base WHERE unknown=0
   UNION ALL SELECT '90+',COALESCE(sum(outstanding) FILTER(WHERE age_days>90),0),count(*) FILTER(WHERE age_days>90 AND outstanding>0),4 FROM aging_base WHERE unknown=0
   UNION ALL SELECT 'UNKNOWN',NULL::numeric,count(*) FILTER(WHERE unknown=1),5 FROM aging_base WHERE unknown=1
 ), aging AS (
   SELECT jsonb_build_object('rows',COALESCE(jsonb_agg(jsonb_build_object('bucket',bucket,'amount',amount,'count',count,'status',CASE WHEN bucket='UNKNOWN' THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END) ORDER BY sort_order),'[]'::jsonb),'total',sum(amount),'unknownRows',(SELECT count(*) FROM aging_base WHERE unknown=1),'status',CASE WHEN NOT EXISTS(SELECT 1 FROM aging_base) THEN 'NO_DATA' WHEN (SELECT count(*) FROM aging_base WHERE unknown=1)>0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END) payload FROM aging_rows
 )
 SELECT jsonb_build_object('status',CASE WHEN NOT EXISTS(SELECT 1 FROM sales_base) THEN 'NO_DATA' WHEN EXISTS(SELECT 1 FROM sales_base s WHERE s.subtotal IS NULL OR s.total IS NULL OR s.paid_amount IS NULL) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,'trend',(SELECT rows FROM trend),'categories',(SELECT rows FROM categories),'aging',(SELECT payload FROM aging),'asOf',p_as_of,'months',v_months) INTO v_result;
 RETURN v_result;
END; $$;
REVOKE ALL ON FUNCTION public.get_dashboard_truth_semantics(integer,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_truth_semantics(integer,date) TO authenticated;
