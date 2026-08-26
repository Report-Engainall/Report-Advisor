-- Preserve the Dashboard contract while making the database aggregate the sole
-- business-truth source. Missing values remain NULL/INSUFFICIENT_DATA rather than
-- being fabricated in the consumer.
CREATE OR REPLACE FUNCTION public.get_executive_metrics(
  p_company_id uuid,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_result jsonb;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;

  WITH sales AS (
    SELECT
      COALESCE(SUM(si.line_total),0)::numeric AS revenue,
      COALESCE(SUM(si.quantity * si.cost_price),0)::numeric AS cost,
      COUNT(DISTINCT si.invoice_id)::integer AS invoices
    FROM sale_items si JOIN sales_invoices s ON s.id = si.invoice_id
    WHERE s.company_id = v_company_id AND s.status NOT IN ('cancelled','void')
      AND (p_from IS NULL OR s.invoice_date >= p_from) AND (p_to IS NULL OR s.invoice_date <= p_to)
  ),
  purchases AS (
    SELECT COALESCE(SUM(pi.total),0)::numeric AS total
    FROM purchase_invoices pi
    WHERE pi.company_id = v_company_id AND pi.status NOT IN ('cancelled','void')
      AND (p_from IS NULL OR pi.invoice_date >= p_from) AND (p_to IS NULL OR pi.invoice_date <= p_to)
  ),
  receivables AS (
    SELECT COALESCE(SUM(GREATEST(s.total - s.paid_amount,0)),0)::numeric AS total,
           COALESCE(SUM(CASE WHEN s.due_date < CURRENT_DATE AND s.total > s.paid_amount THEN s.total-s.paid_amount ELSE 0 END),0)::numeric AS overdue
    FROM sales_invoices s
    WHERE s.company_id = v_company_id AND s.status NOT IN ('cancelled','void')
      AND (p_to IS NULL OR s.invoice_date <= p_to)
  ),
  payables AS (
    SELECT COALESCE(SUM(GREATEST(p.total - p.paid_amount,0)),0)::numeric AS total
    FROM purchase_invoices p
    WHERE p.company_id = v_company_id AND p.status NOT IN ('cancelled','void')
      AND (p_to IS NULL OR p.invoice_date <= p_to)
  ),
  collection AS (
    SELECT COALESCE(SUM(s.paid_amount),0)::numeric AS paid,
           COALESCE(SUM(s.total),0)::numeric AS invoiced
    FROM sales_invoices s
    WHERE s.company_id = v_company_id AND s.status NOT IN ('cancelled','void')
      AND (p_from IS NULL OR s.invoice_date >= p_from) AND (p_to IS NULL OR s.invoice_date <= p_to)
  ),
  stock AS (
    SELECT COUNT(*)::integer AS rows,
           COUNT(*) FILTER (WHERE ib.quantity IS NULL OR ib.unit_cost IS NULL)::integer AS missing,
           SUM(ib.quantity * ib.unit_cost)::numeric AS value,
           COALESCE(SUM(ib.quantity),0)::numeric AS units,
           COUNT(*) FILTER (WHERE ib.quantity <= COALESCE(pr.reorder_point,0))::integer AS reorder_count,
           COUNT(*) FILTER (WHERE ib.quantity <= 0)::integer AS out_of_stock
    FROM inventory_balances ib JOIN products pr ON pr.id = ib.product_id AND pr.company_id = ib.company_id
    WHERE ib.company_id = v_company_id
  ),
  active_products AS (
    SELECT COUNT(*)::integer AS total FROM products WHERE company_id = v_company_id AND is_active = true
  )
  SELECT jsonb_build_object(
    'revenue', sales.revenue,
    'cost', sales.cost,
    'gross_profit', sales.revenue - sales.cost,
    'gross_margin_pct', CASE WHEN sales.revenue = 0 THEN NULL ELSE round(((sales.revenue-sales.cost)/sales.revenue)*100,2) END,
    'invoice_count', sales.invoices,
    'purchases', purchases.total,
    'receivables', receivables.total,
    'overdue_receivables', receivables.overdue,
    'payables', payables.total,
    'inventory_units', stock.units,
    'inventory_value', CASE WHEN stock.rows > 0 AND stock.missing = 0 THEN stock.value ELSE NULL END,
    'inventory_status', CASE WHEN stock.rows = 0 OR stock.missing > 0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
    'reorder_count', stock.reorder_count,
    'out_of_stock', stock.out_of_stock,
    'active_products', active_products.total,
    'collection_rate', CASE WHEN collection.invoiced = 0 THEN NULL ELSE round((collection.paid / collection.invoiced)*100,2) END,
    'as_of', COALESCE(p_to, CURRENT_DATE)
  ) INTO v_result
  FROM sales, purchases, receivables, payables, collection, stock, active_products;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_executive_metrics(uuid, date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_executive_metrics(uuid, date, date) TO authenticated;
