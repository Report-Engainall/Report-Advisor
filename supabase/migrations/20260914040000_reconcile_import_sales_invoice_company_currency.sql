CREATE OR REPLACE FUNCTION public.import_upsert_sales_invoice(
  p_company_id uuid,
  p_invoice_number text,
  p_invoice_date date,
  p_customer_id uuid DEFAULT NULL::uuid,
  p_customer_name text DEFAULT NULL::text,
  p_subtotal numeric DEFAULT NULL::numeric,
  p_tax_amount numeric DEFAULT NULL::numeric,
  p_total numeric DEFAULT NULL::numeric,
  p_paid_amount numeric DEFAULT NULL::numeric,
  p_status text DEFAULT NULL::text,
  p_null_policy text DEFAULT 'preserve'::text
)
RETURNS TABLE(target_id uuid, action text)
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_id uuid;
  v_customer_id uuid := p_customer_id;
  v_currency text;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF NULLIF(trim(p_invoice_number), '') IS NULL THEN RAISE EXCEPTION 'INVOICE_NUMBER_REQUIRED'; END IF;
  IF p_invoice_date IS NULL THEN RAISE EXCEPTION 'INVOICE_DATE_REQUIRED'; END IF;

  SELECT currency INTO v_currency FROM public.companies WHERE id = v_company_id;
  IF NULLIF(trim(v_currency), '') IS NULL THEN RAISE EXCEPTION 'COMPANY_CURRENCY_REQUIRED'; END IF;

  IF v_customer_id IS NULL AND NULLIF(trim(p_customer_name), '') IS NOT NULL THEN
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE company_id = v_company_id
      AND public.normalize_import_key(name) = public.normalize_import_key(p_customer_name)
    LIMIT 1;
  END IF;
  IF v_customer_id IS NULL THEN RAISE EXCEPTION 'CUSTOMER_REQUIRED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.customers WHERE id = v_customer_id AND company_id = v_company_id) THEN
    RAISE EXCEPTION 'CUSTOMER_TENANT_MISMATCH';
  END IF;

  SELECT id INTO v_id
  FROM public.sales_invoices
  WHERE company_id = v_company_id
    AND public.normalize_import_key(invoice_number) = public.normalize_import_key(p_invoice_number)
  LIMIT 1
  FOR UPDATE;

  IF v_id IS NULL THEN
    IF p_subtotal IS NULL OR p_subtotal::text IN ('NaN', 'Infinity', '-Infinity') THEN RAISE EXCEPTION 'SUBTOTAL_REQUIRED'; END IF;
    IF p_tax_amount IS NULL OR p_tax_amount::text IN ('NaN', 'Infinity', '-Infinity') THEN RAISE EXCEPTION 'TAX_AMOUNT_REQUIRED'; END IF;
    IF p_total IS NULL OR p_total::text IN ('NaN', 'Infinity', '-Infinity') THEN RAISE EXCEPTION 'TOTAL_REQUIRED'; END IF;
    IF p_paid_amount IS NULL OR p_paid_amount::text IN ('NaN', 'Infinity', '-Infinity') THEN RAISE EXCEPTION 'PAID_AMOUNT_REQUIRED'; END IF;
    IF NULLIF(trim(p_status), '') IS NULL THEN RAISE EXCEPTION 'STATUS_REQUIRED'; END IF;

    INSERT INTO public.sales_invoices(company_id, customer_id, invoice_number, invoice_date, status, subtotal, tax_amount, total, paid_amount, currency)
    VALUES (v_company_id, v_customer_id, trim(p_invoice_number), p_invoice_date, trim(p_status), p_subtotal, p_tax_amount, p_total, p_paid_amount, v_currency)
    RETURNING id INTO v_id;
    RETURN QUERY SELECT v_id, 'inserted'::text;
    RETURN;
  END IF;

  UPDATE public.sales_invoices
  SET customer_id = v_customer_id,
      invoice_date = CASE WHEN p_null_policy = 'preserve' AND p_invoice_date IS NULL THEN invoice_date ELSE p_invoice_date END,
      status = CASE WHEN p_null_policy = 'preserve' AND p_status IS NULL THEN status ELSE coalesce(NULLIF(trim(p_status), ''), status) END,
      subtotal = CASE WHEN p_null_policy = 'preserve' AND p_subtotal IS NULL THEN subtotal ELSE p_subtotal END,
      tax_amount = CASE WHEN p_null_policy = 'preserve' AND p_tax_amount IS NULL THEN tax_amount ELSE p_tax_amount END,
      total = CASE WHEN p_null_policy = 'preserve' AND p_total IS NULL THEN total ELSE p_total END,
      paid_amount = CASE WHEN p_null_policy = 'preserve' AND p_paid_amount IS NULL THEN paid_amount ELSE p_paid_amount END
  WHERE id = v_id AND company_id = v_company_id;

  RETURN QUERY SELECT v_id, 'updated'::text;
END;
$function$;
