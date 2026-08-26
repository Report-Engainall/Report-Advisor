-- Cross-surface truth closure: explicit as-of semantics for receivables aging.
-- The authenticated tenant is authoritative; p_company_id is only a compatibility assertion.
CREATE OR REPLACE FUNCTION public.get_receivables_aging_truth_as_of(
  p_company_id uuid,
  p_as_of date DEFAULT CURRENT_DATE
)
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
    SELECT
      CASE
        WHEN s.due_date IS NULL THEN 'UNDATED'
        WHEN GREATEST(v_as_of - s.due_date, 0) <= 30 THEN '0-30'
        WHEN GREATEST(v_as_of - s.due_date, 0) <= 60 THEN '31-60'
        WHEN GREATEST(v_as_of - s.due_date, 0) <= 90 THEN '61-90'
        ELSE '90+'
      END AS bucket,
      GREATEST(s.total - s.paid_amount, 0)::numeric AS amount
    FROM sales_invoices s
    WHERE s.company_id = v_company_id
      AND s.status NOT IN ('cancelled','void')
      AND s.total IS NOT NULL
      AND s.paid_amount IS NOT NULL
      AND s.total > s.paid_amount
  ), buckets AS (
    SELECT bucket, SUM(amount)::numeric AS amount, COUNT(*)::integer AS count
    FROM base GROUP BY bucket
  ), ordered AS (
    SELECT v.bucket, COALESCE(b.amount,0)::numeric AS amount, COALESCE(b.count,0)::integer AS count
    FROM (VALUES ('0-30',1),('31-60',2),('61-90',3),('90+',4),('UNDATED',5)) v(bucket, ord)
    LEFT JOIN buckets b ON b.bucket = v.bucket
    ORDER BY v.ord
  )
  SELECT jsonb_build_object(
    'status', CASE WHEN EXISTS (
      SELECT 1 FROM sales_invoices s
      WHERE s.company_id = v_company_id AND s.status NOT IN ('cancelled','void')
        AND (s.total IS NULL OR s.paid_amount IS NULL)
    ) THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END,
    'as_of', v_as_of,
    'rows', COALESCE((SELECT jsonb_agg(jsonb_build_object('bucket', bucket, 'amount', amount, 'count', count) ORDER BY ord) FROM ordered), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_receivables_aging_truth_as_of(uuid,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_receivables_aging_truth_as_of(uuid,date) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_sales_invoices_company_status_due_total_paid
  ON sales_invoices(company_id, status, due_date, total, paid_amount);
