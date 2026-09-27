-- Canonical specialty import expansion.
-- Reuses the existing authoritative 6-argument import_commit_batch RPC.
-- Legacy products/customers/sales/generic flows continue through the canonical 5-argument RPC.
-- New purchase/supplier/inventory/payment writes stay tenant-bound, source-bound and idempotent.

ALTER TABLE public.canonical_import_commits
  DROP CONSTRAINT IF EXISTS canonical_import_commits_entity_type_check;

ALTER TABLE public.canonical_import_commits
  ADD CONSTRAINT canonical_import_commits_entity_type_check
  CHECK (
    entity_type IN ('products','customers','sales_invoices','purchase_invoices','suppliers','inventory_balances','payments')
    OR entity_type ~ '^generic:[a-z][a-z0-9_-]{0,63}$'
  );

DROP FUNCTION IF EXISTS public.import_commit_batch(uuid,text,jsonb,text,text,uuid);

CREATE FUNCTION public.import_commit_batch(
  p_company_id uuid,
  p_entity_type text,
  p_rows jsonb,
  p_null_policy text,
  p_source_hash text,
  p_import_job_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
SET statement_timeout TO '30s'
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_file_record_id uuid;
  v_file_hash text;
  v_file_status text;
  v_file_security_status text;
  v_file_metadata jsonb;
  v_source_fingerprint text;
  v_job_type text;
  v_existing public.canonical_import_commits%rowtype;
  v_row jsonb;
  v_id uuid;
  v_count integer := 0;
  v_ids jsonb := '[]'::jsonb;
  v_company_currency text;
  v_customer_id uuid;
  v_supplier_id uuid;
  v_product_id uuid;
  v_warehouse_id uuid;
  v_invoice_id uuid;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_import_job_id IS NULL THEN RAISE EXCEPTION 'IMPORT_JOB_ID_REQUIRED'; END IF;
  IF p_source_hash IS NULL OR btrim(p_source_hash) = '' THEN RAISE EXCEPTION 'IMPORT_SOURCE_HASH_REQUIRED'; END IF;
  IF p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN RAISE EXCEPTION 'IMPORT_SOURCE_HASH_INVALID'; END IF;
  IF p_entity_type !~ '^generic:[a-z][a-z0-9_-]{0,63}$'
     AND p_entity_type NOT IN ('products','customers','sales_invoices','purchase_invoices','suppliers','inventory_balances','payments') THEN
    RAISE EXCEPTION 'IMPORT_ENTITY_TYPE_UNSUPPORTED';
  END IF;
  IF jsonb_typeof(p_rows) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'IMPORT_ROWS_MUST_BE_ARRAY'; END IF;

  SELECT i.file_record_id, fr.file_hash, fr.status, fr.security_status, fr.metadata, i.source_fingerprint, i.job_type
  INTO v_file_record_id, v_file_hash, v_file_status, v_file_security_status, v_file_metadata, v_source_fingerprint, v_job_type
  FROM public.import_jobs i
  JOIN public.file_records fr ON fr.id = i.file_record_id AND fr.company_id = i.company_id
  WHERE i.id = p_import_job_id
    AND i.company_id = v_company_id
  FOR SHARE OF i;

  IF NOT FOUND OR v_file_record_id IS NULL THEN RAISE EXCEPTION 'IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN'; END IF;
  IF v_file_hash IS NULL OR v_file_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_HASH_INVALID'; END IF;
  IF v_file_hash IS DISTINCT FROM p_source_hash THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_HASH_MISMATCH'; END IF;
  IF v_file_status IS DISTINCT FROM 'ready' OR v_file_security_status IS DISTINCT FROM 'passed' THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_NOT_VERIFIED'; END IF;
  IF coalesce(v_file_metadata->>'storage_bucket','') IS DISTINCT FROM 'documents' THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_STORAGE_BINDING_INVALID'; END IF;
  IF v_file_metadata->>'raw_bytes_sha256' IS DISTINCT FROM v_file_hash THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_RAW_HASH_PROOF_MISSING'; END IF;
  IF v_source_fingerprint IS NULL OR btrim(v_source_fingerprint) = '' THEN RAISE EXCEPTION 'IMPORT_SOURCE_FINGERPRINT_REQUIRED'; END IF;
  IF v_source_fingerprint IS DISTINCT FROM v_file_hash THEN RAISE EXCEPTION 'AUTHORITATIVE_SOURCE_HASH_DRIFT'; END IF;
  IF v_job_type IN ('products','customers','sales_invoices','purchase_invoices','suppliers','inventory_balances','payments')
     AND v_job_type IS DISTINCT FROM p_entity_type THEN
    RAISE EXCEPTION 'IMPORT_JOB_ENTITY_TYPE_MISMATCH';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(coalesce(v_company_id::text,'') || ':' || p_entity_type || ':' || p_source_hash, 0));

  SELECT * INTO v_existing
  FROM public.canonical_import_commits c
  WHERE c.company_id = v_company_id
    AND c.entity_type = p_entity_type
    AND c.source_hash = p_source_hash
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing.committed_count <> jsonb_array_length(p_rows) THEN
      RAISE EXCEPTION 'CANONICAL_EXISTING_COMMIT_COUNT_MISMATCH';
    END IF;
    RETURN jsonb_build_object('committed', v_existing.committed_count, 'ids', v_existing.committed_ids, 'idempotent_replay', true, 'import_job_id', p_import_job_id);
  END IF;

  IF p_entity_type IN ('products','customers','sales_invoices') OR p_entity_type ~ '^generic:' THEN
    RETURN public.import_commit_batch(
      p_company_id,
      p_entity_type,
      p_rows,
      p_null_policy,
      p_source_hash
    );
  END IF;

  IF jsonb_array_length(p_rows) = 0 THEN
    INSERT INTO public.canonical_import_commits(company_id, entity_type, source_hash, committed_ids, committed_count)
    VALUES(v_company_id, p_entity_type, p_source_hash, '[]'::jsonb, 0);
    RETURN jsonb_build_object('committed', 0, 'ids', '[]'::jsonb, 'idempotent_replay', false, 'import_job_id', p_import_job_id);
  END IF;

  SELECT currency INTO v_company_currency FROM public.companies WHERE id = v_company_id;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
    IF p_entity_type = 'suppliers' THEN
      IF nullif(btrim(v_row->>'name'),'') IS NULL THEN RAISE EXCEPTION 'SUPPLIER_NAME_REQUIRED'; END IF;

      SELECT id INTO v_id
      FROM public.suppliers
      WHERE company_id = v_company_id
        AND (
          (nullif(btrim(v_row->>'code'),'') IS NOT NULL AND public.normalize_import_key(code) = public.normalize_import_key(v_row->>'code'))
          OR
          (nullif(btrim(v_row->>'code'),'') IS NULL AND public.normalize_import_key(name) = public.normalize_import_key(v_row->>'name'))
        )
      ORDER BY id
      LIMIT 1
      FOR UPDATE;

      IF v_id IS NULL THEN
        INSERT INTO public.suppliers(company_id,name,code,phone,email,address,tax_id,payment_terms_days)
        VALUES(
          v_company_id,
          btrim(v_row->>'name'),
          nullif(btrim(v_row->>'code'),''),
          nullif(btrim(v_row->>'phone'),''),
          nullif(btrim(v_row->>'email'),''),
          nullif(btrim(v_row->>'address'),''),
          nullif(btrim(v_row->>'tax_id'),''),
          nullif(v_row->>'payment_terms_days','')::integer
        )
        RETURNING id INTO v_id;
      ELSE
        UPDATE public.suppliers
        SET name = CASE WHEN p_null_policy='preserve' AND v_row->>'name' IS NULL THEN name ELSE coalesce(nullif(btrim(v_row->>'name'),''),name) END,
            code = CASE WHEN p_null_policy='preserve' AND v_row->>'code' IS NULL THEN code ELSE coalesce(nullif(btrim(v_row->>'code'),''),code) END,
            phone = CASE WHEN p_null_policy='preserve' AND v_row->>'phone' IS NULL THEN phone ELSE coalesce(nullif(btrim(v_row->>'phone'),''),phone) END,
            email = CASE WHEN p_null_policy='preserve' AND v_row->>'email' IS NULL THEN email ELSE coalesce(nullif(btrim(v_row->>'email'),''),email) END,
            address = CASE WHEN p_null_policy='preserve' AND v_row->>'address' IS NULL THEN address ELSE coalesce(nullif(btrim(v_row->>'address'),''),address) END,
            tax_id = CASE WHEN p_null_policy='preserve' AND v_row->>'tax_id' IS NULL THEN tax_id ELSE coalesce(nullif(btrim(v_row->>'tax_id'),''),tax_id) END,
            payment_terms_days = CASE WHEN p_null_policy='preserve' AND v_row->>'payment_terms_days' IS NULL THEN payment_terms_days ELSE nullif(v_row->>'payment_terms_days','')::integer END
        WHERE id = v_id AND company_id = v_company_id;
      END IF;

    ELSIF p_entity_type = 'purchase_invoices' THEN
      IF nullif(btrim(v_row->>'invoice_number'),'') IS NULL THEN RAISE EXCEPTION 'PURCHASE_INVOICE_NUMBER_REQUIRED'; END IF;
      IF nullif(btrim(v_row->>'invoice_date'),'') IS NULL THEN RAISE EXCEPTION 'PURCHASE_INVOICE_DATE_REQUIRED'; END IF;
      IF nullif(v_row->>'subtotal','') IS NULL OR (v_row->>'subtotal') IN ('NaN','Infinity','-Infinity') OR (v_row->>'subtotal')::numeric < 0 THEN RAISE EXCEPTION 'PURCHASE_SUBTOTAL_REQUIRED'; END IF;
      IF nullif(v_row->>'tax_amount','') IS NULL OR (v_row->>'tax_amount') IN ('NaN','Infinity','-Infinity') OR (v_row->>'tax_amount')::numeric < 0 THEN RAISE EXCEPTION 'PURCHASE_TAX_AMOUNT_REQUIRED'; END IF;
      IF nullif(v_row->>'total','') IS NULL OR (v_row->>'total') IN ('NaN','Infinity','-Infinity') OR (v_row->>'total')::numeric < 0 THEN RAISE EXCEPTION 'PURCHASE_TOTAL_REQUIRED'; END IF;
      IF nullif(v_row->>'paid_amount','') IS NULL OR (v_row->>'paid_amount') IN ('NaN','Infinity','-Infinity') OR (v_row->>'paid_amount')::numeric < 0 THEN RAISE EXCEPTION 'PURCHASE_PAID_AMOUNT_REQUIRED'; END IF;
      IF nullif(btrim(v_row->>'status'),'') IS NULL THEN RAISE EXCEPTION 'PURCHASE_STATUS_REQUIRED'; END IF;

      SELECT id INTO v_supplier_id
      FROM public.suppliers
      WHERE company_id = v_company_id
        AND (
          (nullif(v_row->>'supplier_id','') IS NOT NULL AND id = nullif(v_row->>'supplier_id','')::uuid)
          OR
          (nullif(v_row->>'supplier_code','') IS NOT NULL AND public.normalize_import_key(code)=public.normalize_import_key(v_row->>'supplier_code'))
          OR
          (nullif(v_row->>'supplier_name','') IS NOT NULL AND public.normalize_import_key(name)=public.normalize_import_key(v_row->>'supplier_name'))
        )
      ORDER BY id
      LIMIT 1
      FOR UPDATE;

      IF v_supplier_id IS NULL THEN RAISE EXCEPTION 'PURCHASE_SUPPLIER_REQUIRED'; END IF;

      SELECT id INTO v_invoice_id
      FROM public.purchase_invoices
      WHERE company_id = v_company_id
        AND public.normalize_import_key(invoice_number)=public.normalize_import_key(v_row->>'invoice_number')
      LIMIT 1
      FOR UPDATE;

      IF v_invoice_id IS NULL THEN
        INSERT INTO public.purchase_invoices(
          company_id,supplier_id,invoice_number,invoice_date,due_date,status,
          subtotal,discount_amount,tax_amount,total,paid_amount,currency,notes
        )
        VALUES(
          v_company_id,
          v_supplier_id,
          btrim(v_row->>'invoice_number'),
          (v_row->>'invoice_date')::date,
          nullif(v_row->>'due_date','')::date,
          btrim(v_row->>'status'),
          (v_row->>'subtotal')::numeric,
          nullif(v_row->>'discount_amount','')::numeric,
          (v_row->>'tax_amount')::numeric,
          (v_row->>'total')::numeric,
          (v_row->>'paid_amount')::numeric,
          nullif(upper(btrim(v_row->>'currency')), ''),
          nullif(btrim(v_row->>'notes'),'')
        )
        RETURNING id INTO v_id;
      ELSE
        UPDATE public.purchase_invoices
        SET supplier_id = v_supplier_id,
            invoice_date = CASE WHEN p_null_policy='preserve' AND v_row->>'invoice_date' IS NULL THEN invoice_date ELSE (v_row->>'invoice_date')::date END,
            due_date = CASE WHEN p_null_policy='preserve' AND v_row->>'due_date' IS NULL THEN due_date ELSE nullif(v_row->>'due_date','')::date END,
            status = CASE WHEN p_null_policy='preserve' AND v_row->>'status' IS NULL THEN status ELSE btrim(v_row->>'status') END,
            subtotal = CASE WHEN p_null_policy='preserve' AND v_row->>'subtotal' IS NULL THEN subtotal ELSE (v_row->>'subtotal')::numeric END,
            discount_amount = CASE WHEN p_null_policy='preserve' AND v_row->>'discount_amount' IS NULL THEN discount_amount ELSE nullif(v_row->>'discount_amount','')::numeric END,
            tax_amount = CASE WHEN p_null_policy='preserve' AND v_row->>'tax_amount' IS NULL THEN tax_amount ELSE (v_row->>'tax_amount')::numeric END,
            total = CASE WHEN p_null_policy='preserve' AND v_row->>'total' IS NULL THEN total ELSE (v_row->>'total')::numeric END,
            paid_amount = CASE WHEN p_null_policy='preserve' AND v_row->>'paid_amount' IS NULL THEN paid_amount ELSE (v_row->>'paid_amount')::numeric END,
            currency = CASE WHEN p_null_policy='preserve' AND v_row->>'currency' IS NULL THEN currency ELSE coalesce(nullif(upper(btrim(v_row->>'currency')), ''), currency) END,
            notes = CASE WHEN p_null_policy='preserve' AND v_row->>'notes' IS NULL THEN notes ELSE coalesce(nullif(btrim(v_row->>'notes'),''), notes) END
        WHERE id = v_invoice_id AND company_id = v_company_id;
        v_id := v_invoice_id;
      END IF;

    ELSIF p_entity_type = 'inventory_balances' THEN
      IF nullif(v_row->>'quantity','') IS NULL OR (v_row->>'quantity') IN ('NaN','Infinity','-Infinity') OR (v_row->>'quantity')::numeric < 0 THEN RAISE EXCEPTION 'INVENTORY_QUANTITY_REQUIRED'; END IF;

      SELECT id INTO v_product_id
      FROM public.products
      WHERE company_id = v_company_id
        AND (
          (nullif(v_row->>'product_id','') IS NOT NULL AND id = nullif(v_row->>'product_id','')::uuid)
          OR
          (nullif(v_row->>'sku','') IS NOT NULL AND public.normalize_import_key(sku)=public.normalize_import_key(v_row->>'sku'))
        )
      ORDER BY id
      LIMIT 1;

      IF v_product_id IS NULL THEN RAISE EXCEPTION 'INVENTORY_PRODUCT_REQUIRED'; END IF;

      SELECT id INTO v_warehouse_id
      FROM public.warehouses
      WHERE company_id = v_company_id
        AND (
          (nullif(v_row->>'warehouse_id','') IS NOT NULL AND id = nullif(v_row->>'warehouse_id','')::uuid)
          OR
          (nullif(v_row->>'warehouse','') IS NOT NULL AND (
            public.normalize_import_key(code)=public.normalize_import_key(v_row->>'warehouse')
            OR public.normalize_import_key(name)=public.normalize_import_key(v_row->>'warehouse')
          ))
        )
      ORDER BY id
      LIMIT 1;

      IF v_warehouse_id IS NULL THEN RAISE EXCEPTION 'INVENTORY_WAREHOUSE_REQUIRED'; END IF;

      SELECT id INTO v_id
      FROM public.inventory_balances
      WHERE company_id=v_company_id
        AND warehouse_id=v_warehouse_id
        AND product_id=v_product_id
      LIMIT 1
      FOR UPDATE;

      IF v_id IS NULL THEN
        INSERT INTO public.inventory_balances(company_id,warehouse_id,product_id,quantity,unit_cost,last_movement_date)
        VALUES(
          v_company_id,
          v_warehouse_id,
          v_product_id,
          (v_row->>'quantity')::numeric,
          nullif(v_row->>'unit_cost','')::numeric,
          nullif(v_row->>'last_movement_date','')::date
        )
        RETURNING id INTO v_id;
      ELSE
        UPDATE public.inventory_balances
        SET quantity=CASE WHEN p_null_policy='preserve' AND v_row->>'quantity' IS NULL THEN quantity ELSE (v_row->>'quantity')::numeric END,
            unit_cost=CASE WHEN p_null_policy='preserve' AND v_row->>'unit_cost' IS NULL THEN unit_cost ELSE nullif(v_row->>'unit_cost','')::numeric END,
            last_movement_date=CASE WHEN p_null_policy='preserve' AND v_row->>'last_movement_date' IS NULL THEN last_movement_date ELSE nullif(v_row->>'last_movement_date','')::date END
        WHERE id=v_id AND company_id=v_company_id;
      END IF;

    ELSIF p_entity_type = 'payments' THEN
      IF nullif(btrim(v_row->>'reference'),'') IS NULL THEN RAISE EXCEPTION 'PAYMENT_REFERENCE_REQUIRED'; END IF;
      IF v_row->>'direction' NOT IN ('in','out') THEN RAISE EXCEPTION 'PAYMENT_DIRECTION_INVALID'; END IF;
      IF nullif(v_row->>'payment_date','') IS NULL THEN RAISE EXCEPTION 'PAYMENT_DATE_REQUIRED'; END IF;
      IF nullif(v_row->>'payment_amount','') IS NULL OR (v_row->>'payment_amount') IN ('NaN','Infinity','-Infinity') OR (v_row->>'payment_amount')::numeric <= 0 THEN RAISE EXCEPTION 'PAYMENT_AMOUNT_REQUIRED'; END IF;

      v_customer_id := nullif(v_row->>'customer_id','')::uuid;
      v_supplier_id := nullif(v_row->>'supplier_id','')::uuid;
      IF v_customer_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.customers WHERE id=v_customer_id AND company_id=v_company_id) THEN RAISE EXCEPTION 'PAYMENT_CUSTOMER_TENANT_MISMATCH'; END IF;
      IF v_supplier_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.suppliers WHERE id=v_supplier_id AND company_id=v_company_id) THEN RAISE EXCEPTION 'PAYMENT_SUPPLIER_TENANT_MISMATCH'; END IF;
      IF v_customer_id IS NULL AND nullif(v_row->>'customer_name','') IS NOT NULL THEN
        SELECT id INTO v_customer_id FROM public.customers WHERE company_id=v_company_id AND public.normalize_import_key(name)=public.normalize_import_key(v_row->>'customer_name') ORDER BY id LIMIT 1;
      END IF;
      IF v_supplier_id IS NULL AND nullif(v_row->>'supplier_name','') IS NOT NULL THEN
        SELECT id INTO v_supplier_id FROM public.suppliers WHERE company_id=v_company_id AND public.normalize_import_key(name)=public.normalize_import_key(v_row->>'supplier_name') ORDER BY id LIMIT 1;
      END IF;

      v_invoice_id := nullif(v_row->>'invoice_id','')::uuid;
      IF v_invoice_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.sales_invoices WHERE id=v_invoice_id AND company_id=v_company_id
      ) AND NOT EXISTS (
        SELECT 1 FROM public.purchase_invoices WHERE id=v_invoice_id AND company_id=v_company_id
      ) THEN
        RAISE EXCEPTION 'PAYMENT_INVOICE_TENANT_MISMATCH';
      END IF;

      SELECT id INTO v_id
      FROM public.payments
      WHERE company_id=v_company_id
        AND public.normalize_import_key(reference)=public.normalize_import_key(v_row->>'reference')
        AND direction=v_row->>'direction'
        AND payment_date=(v_row->>'payment_date')::date
      LIMIT 1
      FOR UPDATE;

      IF v_id IS NULL THEN
        INSERT INTO public.payments(
          id,company_id,direction,customer_id,supplier_id,invoice_id,amount,payment_date,method,reference,currency,notes
        )
        VALUES(
          coalesce(nullif(v_row->>'payment_id','')::uuid, gen_random_uuid()),
          v_company_id,
          v_row->>'direction',
          v_customer_id,
          v_supplier_id,
          v_invoice_id,
          (v_row->>'payment_amount')::numeric,
          (v_row->>'payment_date')::date,
          nullif(btrim(v_row->>'payment_method'),''),
          btrim(v_row->>'reference'),
          coalesce(nullif(upper(btrim(v_row->>'currency')), ''), upper(v_company_currency)),
          nullif(btrim(v_row->>'notes'),'')
        )
        RETURNING id INTO v_id;
      ELSE
        UPDATE public.payments
        SET direction=v_row->>'direction',
            customer_id=v_customer_id,
            supplier_id=v_supplier_id,
            invoice_id=v_invoice_id,
            amount=(v_row->>'payment_amount')::numeric,
            payment_date=(v_row->>'payment_date')::date,
            method=CASE WHEN p_null_policy='preserve' AND v_row->>'payment_method' IS NULL THEN method ELSE coalesce(nullif(btrim(v_row->>'payment_method'),''),method) END,
            reference=CASE WHEN p_null_policy='preserve' AND v_row->>'reference' IS NULL THEN reference ELSE btrim(v_row->>'reference') END,
            currency=CASE WHEN p_null_policy='preserve' AND v_row->>'currency' IS NULL THEN currency ELSE coalesce(nullif(upper(btrim(v_row->>'currency')), ''),currency) END,
            notes=CASE WHEN p_null_policy='preserve' AND v_row->>'notes' IS NULL THEN notes ELSE coalesce(nullif(btrim(v_row->>'notes'),''),notes) END
        WHERE id=v_id AND company_id=v_company_id;
      END IF;
    END IF;

    IF v_id IS NULL THEN RAISE EXCEPTION 'IMPORT_TARGET_ID_MISSING'; END IF;
    v_count := v_count + 1;
    v_ids := v_ids || jsonb_build_array(v_id);
  END LOOP;

  INSERT INTO public.canonical_import_commits(company_id,entity_type,source_hash,committed_ids,committed_count)
  VALUES(v_company_id,p_entity_type,p_source_hash,v_ids,v_count);

  RETURN jsonb_build_object('committed',v_count,'ids',v_ids,'idempotent_replay',false,'import_job_id',p_import_job_id);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text,uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text,uuid) TO authenticated;

COMMENT ON FUNCTION public.import_commit_batch(uuid,text,jsonb,text,text,uuid)
IS 'Authoritative source-bound import commit. Verifies import job/file provenance and writes canonical specialty entities through one transaction-bound RPC.';
