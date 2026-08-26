-- Canonical metric null-semantics closure.
-- Business truth never substitutes missing source values with zero.
-- Client-supplied p_company_id is a compatibility assertion; current_company_id() is authority.
CREATE OR REPLACE FUNCTION public.get_executive_metrics(
  p_company_id uuid,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_result jsonb;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_from IS NOT NULL AND p_to IS NOT NULL AND p_from > p_to THEN RAISE EXCEPTION 'INVALID_DATE_RANGE'; END IF;

  WITH sales AS (
    SELECT
      count(DISTINCT si.invoice_id)::integer AS invoices,
      count(*) FILTER (WHERE si.line_total IS NULL)::integer AS missing_revenue_rows,
      count(*) FILTER (WHERE si.cost_price IS NULL OR si.quantity IS NULL)::integer AS missing_cost_rows,
      CASE WHEN count(*) FILTER (WHERE si.line_total IS NULL) > 0 THEN NULL ELSE sum(si.line_total)::numeric END AS revenue,
      CASE WHEN count(*) FILTER (WHERE si.cost_price IS NULL OR si.quantity IS NULL) > 0 THEN NULL ELSE sum(si.quantity * si.cost_price)::numeric END AS cost
    FROM sale_items si
    JOIN sales_invoices s ON s.id = si.invoice_id
    WHERE s.company_id = v_company_id
      AND s.status NOT IN ('cancelled','void')
      AND (p_from IS NULL OR s.invoice_date >= p_from)
      AND (p_to IS NULL OR s.invoice_date <= p_to)
  ),
  purchases AS (
    SELECT count(*)::integer AS invoices, count(*) FILTER (WHERE pi.total IS NULL)::integer AS missing_rows,
      CASE WHEN count(*) FILTER (WHERE pi.total IS NULL) > 0 THEN NULL ELSE sum(pi.total)::numeric END AS total
    FROM purchase_invoices pi
    WHERE pi.company_id = v_company_id AND pi.status NOT IN ('cancelled','void')
      AND (p_from IS NULL OR pi.invoice_date >= p_from) AND (p_to IS NULL OR pi.invoice_date <= p_to)
  ),
  receivables AS (
    SELECT count(*) FILTER (WHERE s.total IS NULL OR s.paid_amount IS NULL)::integer AS missing_rows,
      CASE WHEN count(*) FILTER (WHERE s.total IS NULL OR s.paid_amount IS NULL) > 0 THEN NULL ELSE sum(greatest(s.total - s.paid_amount, 0))::numeric END AS total,
      CASE WHEN count(*) FILTER (WHERE s.total IS NULL OR s.paid_amount IS NULL) > 0 THEN NULL ELSE sum(s.total)::numeric END AS invoice_total,
      CASE WHEN count(*) FILTER (WHERE s.total IS NULL OR s.paid_amount IS NULL) > 0 THEN NULL ELSE sum(s.paid_amount)::numeric END AS paid_total,
      CASE WHEN count(*) FILTER (WHERE s.total IS NULL OR s.paid_amount IS NULL) > 0 THEN NULL ELSE sum(CASE WHEN s.due_date IS NOT NULL AND s.due_date < coalesce(p_to,current_date) AND s.total > s.paid_amount THEN greatest(s.total-s.paid_amount,0) ELSE 0 END)::numeric END AS overdue_total
    FROM sales_invoices s
    WHERE s.company_id = v_company_id AND s.status NOT IN ('cancelled','void') AND (p_to IS NULL OR s.invoice_date <= p_to)
  ),
  payables AS (
    SELECT count(*) FILTER (WHERE p.total IS NULL OR p.paid_amount IS NULL)::integer AS missing_rows,
      CASE WHEN count(*) FILTER (WHERE p.total IS NULL OR p.paid_amount IS NULL) > 0 THEN NULL ELSE sum(greatest(p.total - p.paid_amount, 0))::numeric END AS total
    FROM purchase_invoices p
    WHERE p.company_id = v_company_id AND p.status NOT IN ('cancelled','void') AND (p_to IS NULL OR p.invoice_date <= p_to)
  ),
  stock AS (
    SELECT count(*)::integer AS rows, count(*) FILTER (WHERE ib.quantity IS NULL OR ib.unit_cost IS NULL)::integer AS missing_rows,
      count(*) FILTER (WHERE ib.quantity <= coalesce(pr.reorder_point, 0))::integer AS reorder_count,
      count(*) FILTER (WHERE ib.quantity <= 0)::integer AS out_of_stock,
      CASE WHEN count(*) FILTER (WHERE ib.quantity IS NULL OR ib.unit_cost IS NULL) > 0 THEN NULL ELSE sum(ib.quantity * ib.unit_cost)::numeric END AS value
    FROM inventory_balances ib JOIN products pr ON pr.id = ib.product_id AND pr.company_id = ib.company_id
    WHERE ib.company_id = v_company_id
  ),
  active_products AS (SELECT count(*)::integer AS total FROM products WHERE company_id = v_company_id AND is_active = true)
  SELECT jsonb_build_object(
    'status', CASE WHEN sales.invoices = 0 AND purchases.invoices = 0 AND stock.rows = 0 THEN 'INSUFFICIENT_DATA'
                   WHEN sales.missing_revenue_rows > 0 OR sales.missing_cost_rows > 0 OR purchases.missing_rows > 0 OR receivables.missing_rows > 0 OR payables.missing_rows > 0 OR stock.missing_rows > 0 THEN 'INSUFFICIENT_DATA'
                   ELSE 'CALCULATED' END,
    'profitability_status', CASE WHEN sales.invoices > 0 AND (sales.revenue IS NULL OR sales.cost IS NULL) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
    'revenue', sales.revenue, 'cost', sales.cost,
    'gross_profit', CASE WHEN sales.revenue IS NULL OR sales.cost IS NULL THEN NULL ELSE sales.revenue - sales.cost END,
    'gross_margin_pct', CASE WHEN sales.revenue IS NULL OR sales.cost IS NULL OR sales.revenue = 0 THEN NULL ELSE round(((sales.revenue-sales.cost)/sales.revenue)*100,2) END,
    'invoice_count', sales.invoices, 'purchases', purchases.total, 'receivables', receivables.total, 'overdue_receivables', receivables.overdue_total, 'payables', payables.total,
    'inventory_units', CASE WHEN stock.missing_rows > 0 THEN NULL ELSE (SELECT coalesce(sum(ib.quantity),0)::numeric FROM inventory_balances ib WHERE ib.company_id = v_company_id) END,
    'inventory_value', stock.value, 'inventory_status', CASE WHEN stock.missing_rows > 0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
    'inventory_rows', stock.rows, 'missing_inventory_rows', stock.missing_rows, 'reorder_count', stock.reorder_count, 'out_of_stock', stock.out_of_stock,
    'active_products', active_products.total,
    'collection_rate', CASE WHEN receivables.invoice_total IS NULL OR receivables.paid_total IS NULL OR receivables.invoice_total = 0 THEN NULL ELSE round((receivables.paid_total / receivables.invoice_total) * 100, 2) END,
    'as_of', coalesce(p_to, current_date)
  ) INTO v_result FROM sales, purchases, receivables, payables, stock, active_products;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.get_executive_metrics(uuid, date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_executive_metrics(uuid, date, date) TO authenticated;
