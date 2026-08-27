-- Financial truth semantic closure: INSUFFICIENT_DATA must not coexist with apparently complete numeric business totals.

CREATE OR REPLACE FUNCTION public.report_profitability_truth(
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL
)
RETURNS TABLE (category_id uuid, category_name text, revenue numeric, cost_of_sales numeric, gross_profit numeric, margin_pct numeric, quantity numeric, total_rows bigint, incomplete_rows bigint, currency_count bigint, currency text, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
WITH scoped AS (
  SELECT si.invoice_date, si.currency, sai.product_id, sai.quantity, sai.line_total, sai.cost_price, p.category_id, COALESCE(c.name, 'غير مصنف') AS category_name
  FROM public.sales_invoices si
  JOIN public.sale_items sai ON sai.invoice_id = si.id
  LEFT JOIN public.products p ON p.id = sai.product_id
  LEFT JOIN public.categories c ON c.id = p.category_id
  WHERE si.company_id = public.current_company_id()
    AND lower(coalesce(si.status, '')) NOT IN ('cancelled', 'canceled', 'void')
    AND (p_from IS NULL OR si.invoice_date >= p_from)
    AND (p_to IS NULL OR si.invoice_date <= p_to)
), quality AS (
  SELECT count(*)::bigint total_rows, count(*) FILTER (WHERE line_total IS NULL OR cost_price IS NULL OR quantity IS NULL)::bigint incomplete_rows, count(DISTINCT currency)::bigint currency_count, min(currency) currency FROM scoped
), valid AS (
  SELECT * FROM scoped WHERE line_total IS NOT NULL AND cost_price IS NOT NULL AND quantity IS NOT NULL
), cats AS (
  SELECT category_id, category_name, sum(line_total)::numeric revenue, sum(cost_price * quantity)::numeric cost_of_sales, sum(line_total - cost_price * quantity)::numeric gross_profit, CASE WHEN sum(line_total) > 0 THEN sum(line_total - cost_price * quantity) / sum(line_total) * 100 ELSE NULL END margin_pct, sum(quantity)::numeric quantity
  FROM valid GROUP BY category_id, category_name
), totals AS (
  SELECT sum(v.line_total)::numeric revenue, sum(v.cost_price * v.quantity)::numeric cost_of_sales, sum(v.line_total - v.cost_price * v.quantity)::numeric gross_profit, CASE WHEN sum(v.line_total) > 0 THEN sum(v.line_total - v.cost_price * v.quantity) / sum(v.line_total) * 100 ELSE NULL END margin_pct, sum(v.quantity)::numeric quantity FROM valid v
), truth AS (
  SELECT q.total_rows,q.incomplete_rows,q.currency_count,q.currency,CASE WHEN q.total_rows=0 OR q.incomplete_rows>0 OR q.currency_count>1 OR t.revenue IS NULL OR t.cost_of_sales IS NULL THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END status,t.revenue,t.cost_of_sales,t.gross_profit,t.margin_pct,t.quantity FROM quality q CROSS JOIN totals t
)
SELECT c.category_id,c.category_name,CASE WHEN tr.status='CALCULATED' THEN c.revenue ELSE NULL END,CASE WHEN tr.status='CALCULATED' THEN c.cost_of_sales ELSE NULL END,CASE WHEN tr.status='CALCULATED' THEN c.gross_profit ELSE NULL END,CASE WHEN tr.status='CALCULATED' THEN c.margin_pct ELSE NULL END,CASE WHEN tr.status='CALCULATED' THEN c.quantity ELSE NULL END,tr.total_rows,tr.incomplete_rows,tr.currency_count,tr.currency,tr.status FROM cats c CROSS JOIN truth tr
UNION ALL
SELECT NULL::uuid,'__TOTAL__',CASE WHEN tr.status='CALCULATED' THEN tr.revenue ELSE NULL END,CASE WHEN tr.status='CALCULATED' THEN tr.cost_of_sales ELSE NULL END,CASE WHEN tr.status='CALCULATED' THEN tr.gross_profit ELSE NULL END,CASE WHEN tr.status='CALCULATED' THEN tr.margin_pct ELSE NULL END,CASE WHEN tr.status='CALCULATED' THEN tr.quantity ELSE NULL END,tr.total_rows,tr.incomplete_rows,tr.currency_count,tr.currency,tr.status FROM truth tr;
$$;
REVOKE ALL ON FUNCTION public.report_profitability_truth(date,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_profitability_truth(date,date) TO authenticated;

CREATE OR REPLACE FUNCTION public.report_dashboard_truth()
RETURNS TABLE(total_sales numeric,total_cost numeric,gross_profit numeric,gross_margin numeric,total_receivables numeric,overdue_receivables numeric,total_payables numeric,inventory_value numeric,total_customers bigint,active_customers bigint,total_products bigint,invoice_count bigint,avg_invoice_value numeric,collection_rate numeric,status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
WITH inv AS (SELECT id,total,paid_amount,invoice_date,due_date FROM public.sales_invoices WHERE company_id=public.current_company_id() AND lower(coalesce(status,'')) NOT IN ('cancelled','canceled','void')),
items AS (SELECT sai.invoice_id,sai.line_total,sai.cost_price,sai.quantity FROM public.sale_items sai JOIN inv ON inv.id=sai.invoice_id),
q AS (SELECT count(*) invoice_count,sum(i.total) invoice_total,sum(i.paid_amount) paid,sum(i.total-i.paid_amount) total_receivables,sum(CASE WHEN i.due_date IS NOT NULL AND i.due_date<CURRENT_DATE AND i.paid_amount<i.total THEN i.total-i.paid_amount ELSE 0 END) overdue_receivables FROM inv i),
iq AS (SELECT sum(line_total) total_sales,sum(cost_price*quantity) total_cost,count(*) FILTER(WHERE line_total IS NULL OR cost_price IS NULL OR quantity IS NULL) bad_items FROM items),
invv AS (SELECT sum(CASE WHEN quantity IS NULL OR unit_cost IS NULL THEN NULL ELSE quantity*unit_cost END) inventory_value,count(*) FILTER(WHERE quantity IS NULL OR unit_cost IS NULL) bad_inventory FROM public.inventory_balances WHERE company_id=public.current_company_id()),
purch AS (SELECT sum(total-paid_amount) total_payables,count(*) FILTER(WHERE total IS NULL OR paid_amount IS NULL) bad_purchase FROM public.purchase_invoices WHERE company_id=public.current_company_id()),
counts AS (SELECT (SELECT count(*) FROM public.customers WHERE company_id=public.current_company_id()) total_customers,(SELECT count(*) FROM public.products WHERE company_id=public.current_company_id()) total_products),
quality AS (SELECT count(*) FILTER(WHERE total IS NULL OR paid_amount IS NULL) bad_inv FROM inv),
state AS (SELECT CASE WHEN q.invoice_count=0 AND counts.total_customers=0 AND counts.total_products=0 THEN 'INSUFFICIENT_DATA' WHEN q.bad_inv>0 OR iq.bad_items>0 OR invv.bad_inventory>0 OR purch.bad_purchase>0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END status FROM q,iq,invv,purch,counts,quality)
SELECT CASE WHEN state.status='CALCULATED' THEN iq.total_sales ELSE NULL END,CASE WHEN state.status='CALCULATED' THEN iq.total_cost ELSE NULL END,CASE WHEN state.status='CALCULATED' THEN iq.total_sales-iq.total_cost ELSE NULL END,CASE WHEN state.status='CALCULATED' AND iq.total_sales>0 THEN (iq.total_sales-iq.total_cost)/iq.total_sales*100 ELSE NULL END,CASE WHEN state.status='CALCULATED' THEN q.total_receivables ELSE NULL END,CASE WHEN state.status='CALCULATED' THEN q.overdue_receivables ELSE NULL END,CASE WHEN state.status='CALCULATED' THEN purch.total_payables ELSE NULL END,CASE WHEN state.status='CALCULATED' THEN invv.inventory_value ELSE NULL END,counts.total_customers,NULL::bigint,counts.total_products,q.invoice_count,CASE WHEN state.status='CALCULATED' AND q.invoice_count>0 THEN q.invoice_total/q.invoice_count ELSE NULL END,CASE WHEN state.status='CALCULATED' AND q.invoice_total>0 THEN q.paid/q.invoice_total*100 ELSE NULL END,state.status FROM q,iq,invv,purch,counts,state;
$$;
REVOKE ALL ON FUNCTION public.report_dashboard_truth() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_dashboard_truth() TO authenticated;

CREATE OR REPLACE FUNCTION public.report_inventory_snapshot(p_page integer DEFAULT 0,p_page_size integer DEFAULT 25)
RETURNS TABLE(id uuid,company_id uuid,warehouse_id uuid,product_id uuid,quantity numeric,unit_cost numeric,last_movement_date timestamptz,product jsonb,warehouse jsonb,total_rows bigint,total_value numeric,incomplete_rows bigint,low_stock_rows bigint,out_of_stock_rows bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
WITH scoped AS (SELECT ib.id,ib.company_id,ib.warehouse_id,ib.product_id,ib.quantity,ib.unit_cost,ib.last_movement_date,p.id p_id,p.name p_name,p.reorder_point,w.id w_id,w.name w_name FROM inventory_balances ib LEFT JOIN products p ON p.id=ib.product_id LEFT JOIN warehouses w ON w.id=ib.warehouse_id WHERE ib.company_id=public.current_company_id()),
metrics AS (SELECT count(*)::bigint total_rows,sum(CASE WHEN quantity IS NULL OR unit_cost IS NULL THEN NULL ELSE quantity*unit_cost END) total_value,count(*) FILTER(WHERE quantity IS NULL OR unit_cost IS NULL)::bigint incomplete_rows,count(*) FILTER(WHERE quantity IS NOT NULL AND reorder_point IS NOT NULL AND quantity<=reorder_point)::bigint low_stock_rows,count(*) FILTER(WHERE quantity IS NOT NULL AND quantity<=0)::bigint out_of_stock_rows FROM scoped),
page AS (SELECT * FROM scoped ORDER BY last_movement_date DESC NULLS LAST,id DESC OFFSET greatest(p_page,0)*greatest(p_page_size,1) LIMIT greatest(least(p_page_size,500),1))
SELECT page.id,page.company_id,page.warehouse_id,page.product_id,page.quantity,page.unit_cost,page.last_movement_date,CASE WHEN page.p_id IS NULL THEN NULL ELSE jsonb_build_object('id',page.p_id,'name',page.p_name,'reorder_point',page.reorder_point) END,CASE WHEN page.w_id IS NULL THEN NULL ELSE jsonb_build_object('id',page.w_id,'name',page.w_name) END,metrics.total_rows,CASE WHEN metrics.incomplete_rows>0 THEN NULL ELSE metrics.total_value END,metrics.incomplete_rows,metrics.low_stock_rows,metrics.out_of_stock_rows FROM page CROSS JOIN metrics;
$$;
REVOKE ALL ON FUNCTION public.report_inventory_snapshot(integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_inventory_snapshot(integer,integer) TO authenticated;
