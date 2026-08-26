-- Domain analytics truth closure: RFM, ABC and aging use the same tenant/status/as-of contract.
CREATE OR REPLACE FUNCTION public.get_sales_rfm_truth(p_company_id uuid, p_as_of date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_as_of date := COALESCE(p_as_of, CURRENT_DATE);
  v_result jsonb;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;

  WITH base AS (
    SELECT s.customer_id, COALESCE(c.name, s.customer_id::text) AS customer_name,
           MAX(s.invoice_date) AS last_invoice, COUNT(*)::integer AS frequency,
           SUM(s.total)::numeric AS monetary
    FROM sales_invoices s
    LEFT JOIN customers c ON c.id = s.customer_id AND c.company_id = s.company_id
    WHERE s.company_id = v_company_id
      AND s.status NOT IN ('cancelled','void')
      AND s.customer_id IS NOT NULL
      AND s.invoice_date IS NOT NULL
      AND s.invoice_date <= v_as_of
      AND s.total IS NOT NULL
    GROUP BY s.customer_id, c.name
  ), ranked AS (
    SELECT *,
      GREATEST(1, LEAST(5, floor(((row_number() OVER (ORDER BY (v_as_of - last_invoice)) - 1)::numeric / COUNT(*) OVER () * 5) + 1))::integer) AS r_score,
      GREATEST(1, LEAST(5, floor(((row_number() OVER (ORDER BY frequency DESC, customer_id)) - 1)::numeric / COUNT(*) OVER () * 5) + 1))::integer AS f_score,
      GREATEST(1, LEAST(5, floor(((row_number() OVER (ORDER BY monetary DESC, customer_id)) - 1)::numeric / COUNT(*) OVER () * 5) + 1))::integer AS m_score
    FROM base
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'customer_id', customer_id,
    'customer_name', customer_name,
    'recency', GREATEST(v_as_of - last_invoice, 0),
    'frequency', frequency,
    'monetary', monetary,
    'r_score', r_score,
    'f_score', f_score,
    'm_score', m_score,
    'rfm_segment', CASE WHEN r_score + f_score + m_score >= 13 THEN 'أبطال'
                        WHEN r_score + f_score + m_score >= 10 THEN 'مخلصون'
                        WHEN r_score + f_score + m_score >= 7 THEN 'واعدون'
                        WHEN r_score + f_score + m_score >= 4 THEN 'معرضون للخطر'
                        ELSE 'خاملون' END
  ) ORDER BY (r_score + f_score + m_score) DESC, customer_id), '[]'::jsonb)
  INTO v_result FROM ranked;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_sales_abc_truth(p_company_id uuid)
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

  WITH totals AS (
    SELECT si.product_id, COALESCE(p.name, si.product_id::text) AS product_name,
           SUM(si.line_total)::numeric AS revenue
    FROM sale_items si
    JOIN sales_invoices s ON s.id = si.invoice_id AND s.company_id = v_company_id
    LEFT JOIN products p ON p.id = si.product_id AND p.company_id = s.company_id
    WHERE si.product_id IS NOT NULL
      AND s.status NOT IN ('cancelled','void')
      AND si.line_total IS NOT NULL
    GROUP BY si.product_id, p.name
  ), ranked AS (
    SELECT *, SUM(revenue) OVER () AS total_revenue,
           SUM(revenue) OVER (ORDER BY revenue DESC, product_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative
    FROM totals
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'product_id', product_id,
    'product_name', product_name,
    'revenue', revenue,
    'cumulative', cumulative,
    'cumulative_pct', CASE WHEN total_revenue > 0 THEN cumulative / total_revenue * 100 ELSE NULL END,
    'class', CASE WHEN total_revenue <= 0 THEN NULL
                  WHEN cumulative / total_revenue * 100 <= 80 THEN 'A'
                  WHEN cumulative / total_revenue * 100 <= 95 THEN 'B'
                  ELSE 'C' END
  ) ORDER BY revenue DESC, product_id), '[]'::jsonb)
  INTO v_result FROM ranked;
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_sales_rfm_truth(uuid,date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_sales_abc_truth(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_sales_rfm_truth(uuid,date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_abc_truth(uuid) TO authenticated;
