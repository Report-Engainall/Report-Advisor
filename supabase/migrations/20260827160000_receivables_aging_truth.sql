CREATE OR REPLACE FUNCTION public.report_receivables_aging_truth()
RETURNS TABLE(bucket text,amount numeric,count bigint,status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
WITH inv AS (
 SELECT total,paid_amount,due_date FROM public.sales_invoices
 WHERE company_id=public.current_company_id()
   AND lower(coalesce(status,'')) NOT IN ('cancelled','canceled','void')
), classified AS (
 SELECT CASE WHEN total IS NULL OR paid_amount IS NULL THEN 'INCOMPLETE'
             WHEN due_date IS NULL THEN 'UNDATED'
             ELSE CASE WHEN GREATEST(0,(CURRENT_DATE-due_date))<=30 THEN '0-30'
                       WHEN GREATEST(0,(CURRENT_DATE-due_date))<=60 THEN '31-60'
                       WHEN GREATEST(0,(CURRENT_DATE-due_date))<=90 THEN '61-90' ELSE '90+' END END bucket,
        CASE WHEN total IS NULL OR paid_amount IS NULL THEN NULL ELSE total-paid_amount END amount
 FROM inv
)
SELECT bucket,sum(amount)::numeric,count(*)::bigint,
       CASE WHEN bucket='INCOMPLETE' THEN 'INSUFFICIENT_DATA' ELSE 'CALCULATED' END
FROM classified
WHERE (amount IS NULL OR amount>0)
GROUP BY bucket
ORDER BY CASE bucket WHEN '0-30' THEN 1 WHEN '31-60' THEN 2 WHEN '61-90' THEN 3 WHEN '90+' THEN 4 WHEN 'UNDATED' THEN 5 ELSE 6 END;
$$;
REVOKE ALL ON FUNCTION public.report_receivables_aging_truth() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_receivables_aging_truth() TO authenticated;
