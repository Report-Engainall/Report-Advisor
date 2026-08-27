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
 SELECT si.id invoice_id,sai.line_total,sai.cost_price,sai.quantity
 FROM inv si JOIN public.sale_items sai ON sai.invoice_id=si.id
), q AS (
 SELECT count(*) invoice_count,
        sum(i.total) total_sales,
        sum(i.total-i.paid_amount) total_receivables,
        sum(CASE WHEN i.due_date IS NOT NULL AND i.due_date < CURRENT_DATE AND i.paid_amount < i.total THEN i.total-i.paid_amount ELSE 0 END) overdue_receivables,
        sum(i.paid_amount) paid,sum(i.total) invoice_total
 FROM inv i
), iq AS (
 SELECT sum(line_total) total_sales,sum(cost_price*quantity) total_cost
 FROM items WHERE line_total IS NOT NULL AND cost_price IS NOT NULL AND quantity IS NOT NULL
), invv AS (
 SELECT sum(quantity*unit_cost) inventory_value
 FROM public.inventory_balances WHERE company_id=public.current_company_id()
), purch AS (
 SELECT sum(total-paid_amount) total_payables
 FROM public.purchase_invoices WHERE company_id=public.current_company_id()
), counts AS (
 SELECT (SELECT count(*) FROM public.customers WHERE company_id=public.current_company_id()) total_customers,
        (SELECT count(*) FROM public.products WHERE company_id=public.current_company_id()) total_products
), quality AS (
 SELECT count(*) FILTER(WHERE total IS NULL OR paid_amount IS NULL) bad_inv,
        count(*) FILTER(WHERE line_total IS NULL OR cost_price IS NULL OR quantity IS NULL) bad_items
 FROM inv i LEFT JOIN public.sale_items si ON si.invoice_id=i.id
)
SELECT iq.total_sales,iq.total_cost,
       iq.total_sales-iq.total_cost,
       CASE WHEN iq.total_sales>0 THEN (iq.total_sales-iq.total_cost)/iq.total_sales*100 ELSE NULL END,
       q.total_receivables,q.overdue_receivables,purch.total_payables,invv.inventory_value,
       counts.total_customers,NULL::bigint,counts.total_products,q.invoice_count,
       CASE WHEN q.invoice_count>0 THEN q.total_sales/q.invoice_count ELSE NULL END,
       CASE WHEN q.invoice_total>0 THEN q.paid/q.invoice_total*100 ELSE NULL END,
       CASE WHEN q.invoice_count=0 AND counts.total_customers=0 AND counts.total_products=0 THEN 'INSUFFICIENT_DATA'
            WHEN quality.bad_inv>0 OR quality.bad_items>0 THEN 'INSUFFICIENT_DATA'
            ELSE 'CALCULATED' END
FROM q,iq,purch,invv,counts,quality;
$$;
REVOKE ALL ON FUNCTION public.report_dashboard_truth() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_dashboard_truth() TO authenticated;
