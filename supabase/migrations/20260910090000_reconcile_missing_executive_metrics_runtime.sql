-- Forward-only reconciliation for Staging migration drift.
-- Restores the deterministic executive metric RPC without rewriting migration history.
CREATE OR REPLACE FUNCTION get_executive_metrics(
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
  IF v_company_id IS NULL OR v_company_id <> p_company_id THEN
    RAISE EXCEPTION 'EXECUTIVE_METRICS_TENANT_CONTEXT_REQUIRED';
  END IF;

  WITH sales AS (
    SELECT coalesce(sum(si.line_total),0)::numeric AS revenue,
           coalesce(sum(si.quantity * si.cost_price),0)::numeric AS cost,
           count(DISTINCT si.invoice_id)::integer AS invoices
    FROM sale_items si JOIN sales_invoices s ON s.id=si.invoice_id
    WHERE s.company_id=p_company_id AND s.status NOT IN ('cancelled','void')
      AND (p_from IS NULL OR s.invoice_date>=p_from) AND (p_to IS NULL OR s.invoice_date<=p_to)
  ), purchases AS (
    SELECT coalesce(sum(pi.total),0)::numeric AS total FROM purchase_invoices pi
    WHERE pi.company_id=p_company_id AND pi.status NOT IN ('cancelled','void')
      AND (p_from IS NULL OR pi.invoice_date>=p_from) AND (p_to IS NULL OR pi.invoice_date<=p_to)
  ), receivables AS (
    SELECT coalesce(sum(greatest(s.total-s.paid_amount,0)),0)::numeric AS total FROM sales_invoices s
    WHERE s.company_id=p_company_id AND s.status NOT IN ('cancelled','void') AND (p_to IS NULL OR s.invoice_date<=p_to)
  ), payables AS (
    SELECT coalesce(sum(greatest(p.total-p.paid_amount,0)),0)::numeric AS total FROM purchase_invoices p
    WHERE p.company_id=p_company_id AND p.status NOT IN ('cancelled','void') AND (p_to IS NULL OR p.invoice_date<=p_to)
  ), stock AS (
    SELECT coalesce(sum(ib.quantity),0)::numeric AS units,
           coalesce(sum(ib.quantity*ib.unit_cost),0)::numeric AS value,
           count(*) FILTER (WHERE ib.quantity<=coalesce(pr.reorder_point,0))::integer AS reorder_count,
           count(*) FILTER (WHERE ib.quantity<=0)::integer AS out_of_stock
    FROM inventory_balances ib JOIN products pr ON pr.id=ib.product_id AND pr.company_id=ib.company_id
    WHERE ib.company_id=p_company_id
  ), active_products AS (
    SELECT count(*)::integer AS total FROM products WHERE company_id=p_company_id AND is_active=true
  )
  SELECT jsonb_build_object(
   'revenue',sales.revenue,'cost',sales.cost,'gross_profit',sales.revenue-sales.cost,
   'gross_margin_pct',CASE WHEN sales.revenue=0 THEN 0 ELSE round(((sales.revenue-sales.cost)/sales.revenue)*100,2) END,
   'invoice_count',sales.invoices,'purchases',purchases.total,'receivables',receivables.total,'payables',payables.total,
   'inventory_units',stock.units,'inventory_value',stock.value,'reorder_count',stock.reorder_count,'out_of_stock',stock.out_of_stock,
   'active_products',active_products.total,'as_of',coalesce(p_to,current_date)
  ) INTO v_result FROM sales,purchases,receivables,payables,stock,active_products;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_executive_metrics(uuid,date,date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_executive_metrics(uuid,date,date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_executive_metrics(uuid,date,date) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_sales_invoices_company_date_status ON sales_invoices(company_id,invoice_date,status);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_company_date_status ON purchase_invoices(company_id,invoice_date,status);
CREATE INDEX IF NOT EXISTS idx_sale_items_invoice_product ON sale_items(invoice_id,product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_invoice_product ON purchase_items(invoice_id,product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_balances_company_product ON inventory_balances(company_id,product_id);
