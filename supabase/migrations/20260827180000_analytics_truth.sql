-- Canonical analytics truth: server-side tenant authority, deterministic as-of semantics,
-- and fail-closed quality semantics for RFM/ABC. Aging reuses report_receivables_snapshot.

CREATE OR REPLACE FUNCTION public.report_rfm_snapshot(p_as_of_date date DEFAULT current_date)
RETURNS TABLE(customer_id uuid, customer_name text, recency_days integer, frequency bigint, monetary numeric, r_score integer, f_score integer, m_score integer, rfm_segment text, total_rows bigint, incomplete_rows bigint, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
WITH scoped AS (
  SELECT si.customer_id, c.name AS customer_name, si.invoice_date, si.total
  FROM public.sales_invoices si
  JOIN public.customers c ON c.id = si.customer_id
  WHERE si.company_id = public.current_company_id()
    AND lower(coalesce(si.status, '')) NOT IN ('cancelled', 'canceled', 'void')
), quality AS (
  SELECT count(*)::bigint AS total_rows, count(*) FILTER (WHERE total IS NULL)::bigint AS incomplete_rows FROM scoped
), customer_rollup AS (
  SELECT customer_id, max(customer_name) AS customer_name,
         greatest(p_as_of_date - max(invoice_date), 0) AS recency_days,
         count(*)::bigint AS frequency, sum(total)::numeric AS monetary
  FROM scoped GROUP BY customer_id
), ranked AS (
  SELECT r.*,
    floor(((row_number() OVER (ORDER BY recency_days ASC, customer_id) - 1)::numeric / NULLIF(count(*) OVER (), 0)) * 5)::integer + 1 AS r_score_raw,
    floor(((row_number() OVER (ORDER BY frequency DESC, customer_id) - 1)::numeric / NULLIF(count(*) OVER (), 0)) * 5)::integer + 1 AS f_score_raw,
    floor(((row_number() OVER (ORDER BY monetary DESC NULLS LAST, customer_id) - 1)::numeric / NULLIF(count(*) OVER (), 0)) * 5)::integer + 1 AS m_score_raw
  FROM customer_rollup r
), scored AS (
  SELECT ranked.*, least(r_score_raw, 5) AS r_score, least(f_score_raw, 5) AS f_score, least(m_score_raw, 5) AS m_score FROM ranked
), truth AS (
  SELECT total_rows, incomplete_rows, CASE WHEN total_rows = 0 OR incomplete_rows > 0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END AS status FROM quality
)
SELECT s.customer_id, s.customer_name,
       CASE WHEN t.status='CALCULATED' THEN s.recency_days ELSE NULL END,
       CASE WHEN t.status='CALCULATED' THEN s.frequency ELSE NULL END,
       CASE WHEN t.status='CALCULATED' THEN s.monetary ELSE NULL END,
       CASE WHEN t.status='CALCULATED' THEN s.r_score ELSE NULL END,
       CASE WHEN t.status='CALCULATED' THEN s.f_score ELSE NULL END,
       CASE WHEN t.status='CALCULATED' THEN s.m_score ELSE NULL END,
       CASE WHEN t.status='CALCULATED' THEN
         CASE WHEN s.r_score+s.f_score+s.m_score >= 13 THEN 'أبطال'
              WHEN s.r_score+s.f_score+s.m_score >= 10 THEN 'مخلصون'
              WHEN s.r_score+s.f_score+s.m_score >= 7 THEN 'واعدون'
              WHEN s.r_score+s.f_score+s.m_score >= 4 THEN 'معرضون للخطر'
              ELSE 'خاملون' END
       ELSE 'INSUFFICIENT_DATA' END,
       t.total_rows, t.incomplete_rows, t.status
FROM scored s CROSS JOIN truth t ORDER BY s.customer_id;
$$;

CREATE OR REPLACE FUNCTION public.report_abc_snapshot()
RETURNS TABLE(product_id uuid, product_name text, revenue numeric, cumulative_revenue numeric, cumulative_pct numeric, class text, total_rows bigint, incomplete_rows bigint, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
WITH scoped AS (
  SELECT sai.product_id, coalesce(p.name, 'غير معروف') AS product_name, sai.line_total
  FROM public.sale_items sai
  JOIN public.sales_invoices si ON si.id = sai.invoice_id
  LEFT JOIN public.products p ON p.id = sai.product_id
  WHERE si.company_id = public.current_company_id()
    AND lower(coalesce(si.status, '')) NOT IN ('cancelled', 'canceled', 'void')
), quality AS (
  SELECT count(*)::bigint AS total_rows, count(*) FILTER (WHERE product_id IS NULL OR line_total IS NULL)::bigint AS incomplete_rows FROM scoped
), valid AS (
  SELECT product_id, product_name, sum(line_total)::numeric AS revenue FROM scoped WHERE product_id IS NOT NULL AND line_total IS NOT NULL GROUP BY product_id, product_name
), ranked AS (
  SELECT v.*, sum(v.revenue) OVER () AS total_revenue,
         sum(v.revenue) OVER (ORDER BY v.revenue DESC, v.product_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_revenue
  FROM valid v
), totals AS (
  SELECT coalesce(sum(revenue), 0)::numeric AS total_revenue FROM valid
), truth AS (
  SELECT q.total_rows, q.incomplete_rows,
         CASE WHEN q.total_rows = 0 OR q.incomplete_rows > 0 OR t.total_revenue <= 0 THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END AS status
  FROM quality q CROSS JOIN totals t
)
SELECT r.product_id, r.product_name,
       CASE WHEN t.status='CALCULATED' THEN r.revenue ELSE NULL END,
       CASE WHEN t.status='CALCULATED' THEN r.cumulative_revenue ELSE NULL END,
       CASE WHEN t.status='CALCULATED' THEN r.cumulative_revenue / NULLIF(r.total_revenue,0) * 100 ELSE NULL END,
       CASE WHEN t.status='CALCULATED' THEN
         CASE WHEN r.cumulative_revenue / NULLIF(r.total_revenue,0) * 100 <= 80 THEN 'A'
              WHEN r.cumulative_revenue / NULLIF(r.total_revenue,0) * 100 <= 95 THEN 'B'
              ELSE 'C' END
       ELSE 'INSUFFICIENT_DATA' END,
       t.total_rows, t.incomplete_rows, t.status
FROM ranked r CROSS JOIN truth t ORDER BY r.revenue DESC, r.product_id;
$$;

REVOKE ALL ON FUNCTION public.report_rfm_snapshot(date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.report_abc_snapshot() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_rfm_snapshot(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_abc_snapshot() TO authenticated;
