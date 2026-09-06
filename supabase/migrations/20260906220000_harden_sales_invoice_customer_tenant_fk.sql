-- Bind sales invoice customer references to the same tenant.
-- The preflight prevents silently hardening over existing cross-tenant/orphaned links.
DO $$
DECLARE
  v_bad bigint;
BEGIN
  SELECT count(*) INTO v_bad
  FROM public.sales_invoices si
  LEFT JOIN public.customers c
    ON c.id = si.customer_id
   AND c.company_id = si.company_id
  WHERE si.customer_id IS NOT NULL
    AND c.id IS NULL;

  IF v_bad > 0 THEN
    RAISE EXCEPTION 'SALES_INVOICE_CUSTOMER_TENANT_MISMATCH:%', v_bad;
  END IF;
END $$;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_company_id_id_key UNIQUE (company_id, id);

ALTER TABLE public.sales_invoices
  DROP CONSTRAINT IF EXISTS sales_invoices_customer_id_fkey;

ALTER TABLE public.sales_invoices
  ADD CONSTRAINT sales_invoices_customer_company_fkey
  FOREIGN KEY (company_id, customer_id)
  REFERENCES public.customers(company_id, id)
  ON DELETE CASCADE;
