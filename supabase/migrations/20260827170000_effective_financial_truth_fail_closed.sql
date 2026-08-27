-- Effective fail-closed override for financial truth functions.
-- This migration intentionally supersedes earlier definitions that could expose
-- partial numeric aggregates while status = INSUFFICIENT_DATA.

CREATE OR REPLACE FUNCTION public.report_dashboard_truth()
RETURNS TABLE(
 total_sales numeric,total_cost numeric,gross_profit numeric,gross_margin numeric,
 total_receivables numeric,overdue_receivables numeric,total_payables numeric,
 inventory_value numeric,total_customers bigint,active_customers bigint,total_products bigint,
 invoice_count bigint,avg_invoice_value numeric,collection_rate numeric,status text
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
WITH inv AS (
 SELECT id,total,paid_amount,invoice_date,due_date
 FROM public.sales_invoices
 WHERE company_id=public.current_company_id()
   AND lower(coalesce(status,'')) NOT IN ('cancelled','canceled','void')
), items AS (
 SELECT sai.invoice_id,sai.line_total,sai.cost_price,sai.quantity
 FROM public.sale_items sai JOIN inv ON inv.id=sai.invoice_id
), q AS (
 SELECT count(*) invoice_count,sum(total) total_sales,sum(paid_amount) paid,
        sum(total-paid_amount) total_receivables,
        sum(CASE WHEN due_date IS NOT NULL AND due_date<CURRENT_DATE AND paid_amount<total THEN total-paid_amount ELSE 0 END) overdue_receivables
 FROM inv
), iq AS (
 SELECT sum(line_total) total_sales,sum(cost_price*quantity) total_cost,
        count(*) FILTER(WHERE line_total IS NULL OR cost_price IS NULL OR quantity IS NULL) bad_items
 FROM items
), invv AS (
 SELECT sum(quantity*unit_cost) inventory_value,
        count(*) FILTER(WHERE quantity IS NULL OR unit_cost IS NULL) bad_inventory
 FROM public.inventory_balances WHERE company_id=public.current_company_id()
), purch AS (
 SELECT sum(total-paid_amount) total_payables,
        count(*) FILTER(WHERE total IS NULL OR paid_amount IS NULL) bad_purchase
 FROM public.purchase_invoices WHERE company_id=public.current_company_id()
), counts AS (
 SELECT (SELECT count(*) FROM public.customers WHERE company_id=public.current_company_id()) total_customers,
        (SELECT count(*) FROM public.products WHERE company_id=public.current_company_id()) total_products
), quality AS (
 SELECT count(*) FILTER(WHERE total IS NULL OR paid_amount IS NULL) bad_inv FROM inv
), state AS (
 SELECT CASE WHEN q.invoice_count=0 AND counts.total_customers=0 AND counts.total_products=0 THEN 'INSUFFICIENT_DATA'
             WHEN quality.bad_inv>0 OR iq.bad_items>0 OR invv.bad_inventory>0 OR purch.bad_purchase>0 THEN 'INSUFFICIENT_DATA'
             WHEN iq.total_sales IS NULL OR iq.total_cost IS NULL OR invv.inventory_value IS NULL THEN 'INSUFFICIENT_DATA'
             ELSE 'CALCULATED' END status
 FROM q,iq,invv,purch,counts,quality
)
SELECT CASE WHEN state.status='CALCULATED' THEN iq.total_sales ELSE NULL END,
       CASE WHEN state.status='CALCULATED' THEN iq.total_cost ELSE NULL END,
       CASE WHEN state.status='CALCULATED' THEN iq.total_sales-iq.total_cost ELSE NULL END,
       CASE WHEN state.status='CALCULATED' AND iq.total_sales>0 THEN (iq.total_sales-iq.total_cost)/iq.total_sales*100 ELSE NULL END,
       CASE WHEN state.status='CALCULATED' THEN q.total_receivables ELSE NULL END,
       CASE WHEN state.status='CALCULATED' THEN q.overdue_receivables ELSE NULL END,
       CASE WHEN state.status='CALCULATED' THEN purch.total_payables ELSE NULL END,
       CASE WHEN state.status='CALCULATED' THEN invv.inventory_value ELSE NULL END,
       counts.total_customers,NULL::bigint,counts.total_products,q.invoice_count,
       CASE WHEN state.status='CALCULATED' AND q.invoice_count>0 THEN q.total_sales/q.invoice_count ELSE NULL END,
       CASE WHEN state.status='CALCULATED' AND q.total_sales>0 THEN q.paid/q.total_sales*100 ELSE NULL END,
       state.status
FROM q,iq,invv,purch,counts,quality,state;
$$;
REVOKE ALL ON FUNCTION public.report_dashboard_truth() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_dashboard_truth() TO authenticated;

CREATE OR REPLACE FUNCTION public.report_profitability_truth(
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL
)
RETURNS TABLE(category_id uuid,category_name text,revenue numeric,cost_of_sales numeric,gross_profit numeric,margin_pct numeric,quantity numeric,total_rows bigint,incomplete_rows bigint,currency_count bigint,currency text,status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
WITH scoped AS (
 SELECT si.invoice_date,si.currency,sai.product_id,sai.quantity,sai.line_total,sai.cost_price,p.category_id,
        COALESCE(c.name,'غير مصنف') category_name
 FROM public.sales_invoices si
 JOIN public.sale_items sai ON sai.invoice_id=si.id
 LEFT JOIN public.products p ON p.id=sai.product_id
 LEFT JOIN public.categories c ON c.id=p.category_id
 WHERE si.company_id=public.current_company_id()
   AND lower(coalesce(si.status,'')) NOT IN ('cancelled','canceled','void')
   AND (p_from IS NULL OR si.invoice_date>=p_from)
   AND (p_to IS NULL OR si.invoice_date<=p_to)
), quality AS (
 SELECT count(*)::bigint total_rows,
        count(*) FILTER(WHERE line_total IS NULL OR cost_price IS NULL OR quantity IS NULL)::bigint incomplete_rows,
        count(DISTINCT currency)::bigint currency_count,min(currency) currency
 FROM scoped
), valid AS (
 SELECT * FROM scoped WHERE line_total IS NOT NULL AND cost_price IS NOT NULL AND quantity IS NOT NULL
), cats AS (
 SELECT category_id,category_name,sum(line_total)::numeric revenue,sum(cost_price*quantity)::numeric cost_of_sales,
        sum(line_total-cost_price*quantity)::numeric gross_profit,
        CASE WHEN sum(line_total)>0 THEN sum(line_total-cost_price*quantity)/sum(line_total)*100 ELSE NULL END margin_pct,
        sum(quantity)::numeric quantity
 FROM valid GROUP BY category_id,category_name
), totals AS (
 SELECT sum(line_total)::numeric revenue,sum(cost_price*quantity)::numeric cost_of_sales,
        sum(line_total-cost_price*quantity)::numeric gross_profit,
        CASE WHEN sum(line_total)>0 THEN sum(line_total-cost_price*quantity)/sum(line_total)*100 ELSE NULL END margin_pct,
        sum(quantity)::numeric quantity
 FROM valid
), truth AS (
 SELECT q.*,t.revenue total_revenue,t.cost_of_sales total_cost,t.gross_profit total_profit,t.margin_pct total_margin,t.quantity total_quantity,
        CASE WHEN q.total_rows=0 OR q.incomplete_rows>0 OR q.currency_count>1 OR t.revenue IS NULL OR t.cost_of_sales IS NULL THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END status
 FROM quality q CROSS JOIN totals t
)
SELECT c.category_id,c.category_name,
       CASE WHEN tr.status='CALCULATED' THEN c.revenue ELSE NULL END,
       CASE WHEN tr.status='CALCULATED' THEN c.cost_of_sales ELSE NULL END,
       CASE WHEN tr.status='CALCULATED' THEN c.gross_profit ELSE NULL END,
       CASE WHEN tr.status='CALCULATED' THEN c.margin_pct ELSE NULL END,
       CASE WHEN tr.status='CALCULATED' THEN c.quantity ELSE NULL END,
       tr.total_rows,tr.incomplete_rows,tr.currency_count,tr.currency,tr.status
FROM cats c CROSS JOIN truth tr
UNION ALL
SELECT NULL::uuid,'__TOTAL__',
       CASE WHEN tr.status='CALCULATED' THEN tr.total_revenue ELSE NULL END,
       CASE WHEN tr.status='CALCULATED' THEN tr.total_cost ELSE NULL END,
       CASE WHEN tr.status='CALCULATED' THEN tr.total_profit ELSE NULL END,
       CASE WHEN tr.status='CALCULATED' THEN tr.total_margin ELSE NULL END,
       CASE WHEN tr.status='CALCULATED' THEN tr.total_quantity ELSE NULL END,
       tr.total_rows,tr.incomplete_rows,tr.currency_count,tr.currency,tr.status
FROM truth tr;
$$;
REVOKE ALL ON FUNCTION public.report_profitability_truth(date,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_profitability_truth(date,date) TO authenticated;
