-- Canonical sales-report truth. Summary metrics are server-owned and tenant-authoritative.
CREATE OR REPLACE FUNCTION public.report_sales_truth()
RETURNS TABLE(
  total_sales numeric,
  invoice_count bigint,
  avg_invoice_value numeric,
  total_paid numeric,
  collection_rate numeric,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path=public
AS $$
WITH inv AS (
  SELECT id,total,paid_amount
  FROM public.sales_invoices
  WHERE company_id = public.current_company_id()
    AND lower(coalesce(status,'')) NOT IN ('cancelled','canceled','void')
),
quality AS (
  SELECT
    count(*) FILTER (WHERE total IS NULL OR paid_amount IS NULL) AS bad_rows,
    count(*) AS invoice_count,
    sum(total) AS total_sales,
    sum(paid_amount) AS total_paid
  FROM inv
)
SELECT
  CASE WHEN quality.bad_rows > 0 THEN NULL ELSE quality.total_sales END,
  quality.invoice_count,
  CASE WHEN quality.bad_rows > 0 OR quality.invoice_count = 0 THEN NULL
       ELSE quality.total_sales / quality.invoice_count END,
  CASE WHEN quality.bad_rows > 0 THEN NULL ELSE quality.total_paid END,
  CASE WHEN quality.bad_rows > 0 OR quality.total_sales IS NULL OR quality.total_sales = 0 THEN NULL
       ELSE quality.total_paid / quality.total_sales * 100 END,
  CASE WHEN quality.bad_rows > 0 THEN 'INSUFFICIENT_DATA'
       WHEN quality.invoice_count = 0 THEN 'INSUFFICIENT_DATA'
       ELSE 'CALCULATED' END
FROM quality;
$$;

REVOKE ALL ON FUNCTION public.report_sales_truth() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_sales_truth() TO authenticated;
