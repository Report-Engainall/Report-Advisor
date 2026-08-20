-- Unified, auditable import execution path.
-- Bulk writes for products/customers/sales must go through these tenant-guarded RPCs.

CREATE OR REPLACE FUNCTION public.start_import_job(
  p_company_id uuid,
  p_file_record_id uuid DEFAULT NULL,
  p_profile_id uuid DEFAULT NULL,
  p_job_type text DEFAULT 'import',
  p_total_rows integer DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE v_job uuid;
BEGIN
  IF NOT public.has_company_access(p_company_id) THEN RAISE EXCEPTION 'tenant_access_denied'; END IF;
  INSERT INTO public.import_jobs(company_id,file_record_id,profile_id,job_type,status,total_rows,processed_rows,progress)
  VALUES(p_company_id,p_file_record_id,p_profile_id,p_job_type,'processing',greatest(0,p_total_rows),0,0)
  RETURNING id INTO v_job;
  RETURN v_job;
END;
$$;
REVOKE ALL ON FUNCTION public.start_import_job(uuid,uuid,uuid,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_import_job(uuid,uuid,uuid,text,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.import_upsert_chunk(
  p_job_id uuid,
  p_entity_type text,
  p_rows jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_job public.import_jobs;
  v_row jsonb;
  v_data jsonb;
  v_row_number integer;
  v_target_id uuid;
  v_customer_id uuid;
  v_existing uuid;
  v_sku text;
  v_code text;
  v_name text;
  v_invoice_number text;
  v_processed integer := 0;
  v_inserted integer := 0;
  v_updated integer := 0;
  v_failed integer := 0;
  v_error text;
BEGIN
  SELECT * INTO v_job FROM public.import_jobs WHERE id = p_job_id FOR UPDATE;
  IF NOT FOUND OR NOT public.has_company_access(v_job.company_id) THEN RAISE EXCEPTION 'import_job_access_denied'; END IF;
  IF jsonb_typeof(p_rows) <> 'array' THEN RAISE EXCEPTION 'rows_must_be_array'; END IF;
  IF p_entity_type NOT IN ('products','customers','sales_invoices') THEN RAISE EXCEPTION 'unsupported_entity_type'; END IF;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows)
  LOOP
    v_processed := v_processed + 1;
    v_row_number := COALESCE((v_row->>'rowNumber')::integer, v_processed);
    v_data := COALESCE(v_row->'data','{}'::jsonb);
    v_error := NULL;
    v_target_id := NULL;
    v_existing := NULL;
    v_customer_id := NULL;

    BEGIN
      IF p_entity_type = 'products' THEN
        v_sku := NULLIF(trim(v_data->>'sku'),'');
        v_name := NULLIF(trim(v_data->>'name'),'');
        IF v_sku IS NULL OR v_name IS NULL THEN RAISE EXCEPTION 'sku_and_name_required'; END IF;
        SELECT id INTO v_existing FROM public.products WHERE company_id=v_job.company_id AND sku=v_sku ORDER BY created_at LIMIT 1;
        IF v_existing IS NULL THEN
          INSERT INTO public.products(company_id,sku,name,unit,cost_price,selling_price,min_stock,reorder_point,is_active)
          VALUES(v_job.company_id,v_sku,v_name,COALESCE(NULLIF(trim(v_data->>'unit'),''),'قطعة'),
            COALESCE(NULLIF(trim(v_data->>'cost_price'),''),'0')::numeric,
            COALESCE(NULLIF(trim(v_data->>'selling_price'),''),'0')::numeric,
            COALESCE(NULLIF(trim(v_data->>'min_stock'),''),'0')::numeric,
            COALESCE(NULLIF(trim(v_data->>'reorder_point'),''),'0')::numeric,true)
          RETURNING id INTO v_target_id;
          v_inserted := v_inserted + 1;
        ELSE
          UPDATE public.products SET name=v_name,unit=COALESCE(NULLIF(trim(v_data->>'unit'),''),unit),
            cost_price=COALESCE(NULLIF(trim(v_data->>'cost_price'),''),cost_price),
            selling_price=COALESCE(NULLIF(trim(v_data->>'selling_price'),''),selling_price),
            min_stock=COALESCE(NULLIF(trim(v_data->>'min_stock'),''),min_stock),
            reorder_point=COALESCE(NULLIF(trim(v_data->>'reorder_point'),''),reorder_point)
          WHERE id=v_existing RETURNING id INTO v_target_id;
          v_updated := v_updated + 1;
        END IF;

      ELSIF p_entity_type = 'customers' THEN
        v_name := NULLIF(trim(v_data->>'name'),'');
        v_code := NULLIF(trim(COALESCE(v_data->>'code',v_data->>'customer_code')),'');
        IF v_name IS NULL THEN RAISE EXCEPTION 'customer_name_required'; END IF;
        IF v_code IS NOT NULL THEN
          SELECT id INTO v_existing FROM public.customers WHERE company_id=v_job.company_id AND code=v_code ORDER BY created_at LIMIT 1;
        END IF;
        IF v_existing IS NULL THEN
          SELECT id INTO v_existing FROM public.customers WHERE company_id=v_job.company_id AND lower(trim(name))=lower(v_name) ORDER BY created_at LIMIT 1;
        END IF;
        IF v_existing IS NULL THEN
          INSERT INTO public.customers(company_id,name,code,phone,email,segment,credit_limit,payment_terms_days)
          VALUES(v_job.company_id,v_name,v_code,NULLIF(trim(v_data->>'phone'),''),NULLIF(trim(v_data->>'email'),''),
            COALESCE(NULLIF(trim(v_data->>'segment'),''),'regular'),
            COALESCE(NULLIF(trim(v_data->>'credit_limit'),''),'0')::numeric,
            COALESCE(NULLIF(trim(v_data->>'payment_terms_days'),''),'30')::integer)
          RETURNING id INTO v_target_id;
          v_inserted := v_inserted + 1;
        ELSE
          UPDATE public.customers SET name=v_name,code=COALESCE(v_code,code),phone=COALESCE(NULLIF(trim(v_data->>'phone'),''),phone),
            email=COALESCE(NULLIF(trim(v_data->>'email'),''),email),segment=COALESCE(NULLIF(trim(v_data->>'segment'),''),segment),
            credit_limit=COALESCE(NULLIF(trim(v_data->>'credit_limit'),''),credit_limit),
            payment_terms_days=COALESCE(NULLIF(trim(v_data->>'payment_terms_days'),''),payment_terms_days)
          WHERE id=v_existing RETURNING id INTO v_target_id;
          v_updated := v_updated + 1;
        END IF;

      ELSE
        v_invoice_number := NULLIF(trim(v_data->>'invoice_number'),'');
        IF v_invoice_number IS NULL THEN RAISE EXCEPTION 'invoice_number_required'; END IF;
        IF NULLIF(trim(v_data->>'customer_id'),'') IS NOT NULL THEN
          SELECT id INTO v_customer_id FROM public.customers WHERE id=(v_data->>'customer_id')::uuid AND company_id=v_job.company_id;
        END IF;
        IF v_customer_id IS NULL THEN
          v_code := NULLIF(trim(COALESCE(v_data->>'customer_code',v_data->>'customer_number')),'');
          IF v_code IS NOT NULL THEN SELECT id INTO v_customer_id FROM public.customers WHERE company_id=v_job.company_id AND code=v_code ORDER BY created_at LIMIT 1; END IF;
        END IF;
        IF v_customer_id IS NULL THEN
          v_name := NULLIF(trim(COALESCE(v_data->>'customer_name',v_data->>'customer')),'');
          IF v_name IS NOT NULL THEN SELECT id INTO v_customer_id FROM public.customers WHERE company_id=v_job.company_id AND lower(trim(name))=lower(v_name) ORDER BY created_at LIMIT 1; END IF;
        END IF;
        IF v_customer_id IS NULL THEN RAISE EXCEPTION 'customer_not_resolved'; END IF;
        SELECT id INTO v_existing FROM public.sales_invoices WHERE company_id=v_job.company_id AND invoice_number=v_invoice_number ORDER BY created_at LIMIT 1;
        IF v_existing IS NULL THEN
          INSERT INTO public.sales_invoices(company_id,customer_id,invoice_number,invoice_date,due_date,status,subtotal,discount_amount,tax_amount,total,paid_amount,sales_rep)
          VALUES(v_job.company_id,v_customer_id,v_invoice_number,COALESCE(NULLIF(trim(v_data->>'invoice_date'),''),CURRENT_DATE::text)::date,
            NULLIF(trim(v_data->>'due_date'),'')::date,COALESCE(NULLIF(trim(v_data->>'status'),''),'confirmed'),
            COALESCE(NULLIF(trim(v_data->>'subtotal'),''),NULLIF(trim(v_data->>'total'),''),'0')::numeric,
            COALESCE(NULLIF(trim(v_data->>'discount_amount'),''),'0')::numeric,
            COALESCE(NULLIF(trim(v_data->>'tax_amount'),''),'0')::numeric,
            COALESCE(NULLIF(trim(v_data->>'total'),''),'0')::numeric,
            COALESCE(NULLIF(trim(v_data->>'paid_amount'),''),'0')::numeric,NULLIF(trim(v_data->>'sales_rep'),''))
          RETURNING id INTO v_target_id;
          v_inserted := v_inserted + 1;
        ELSE
          UPDATE public.sales_invoices SET customer_id=v_customer_id,
            invoice_date=COALESCE(NULLIF(trim(v_data->>'invoice_date'),''),invoice_date::text)::date,
            due_date=COALESCE(NULLIF(trim(v_data->>'due_date'),''),due_date::text)::date,
            status=COALESCE(NULLIF(trim(v_data->>'status'),''),status),
            subtotal=COALESCE(NULLIF(trim(v_data->>'subtotal'),''),subtotal),
            discount_amount=COALESCE(NULLIF(trim(v_data->>'discount_amount'),''),discount_amount),
            tax_amount=COALESCE(NULLIF(trim(v_data->>'tax_amount'),''),tax_amount),
            total=COALESCE(NULLIF(trim(v_data->>'total'),''),total),
            paid_amount=COALESCE(NULLIF(trim(v_data->>'paid_amount'),''),paid_amount),
            sales_rep=COALESCE(NULLIF(trim(v_data->>'sales_rep'),''),sales_rep)
          WHERE id=v_existing RETURNING id INTO v_target_id;
          v_updated := v_updated + 1;
        END IF;
      END IF;

      INSERT INTO public.import_job_rows(job_id,row_number,status,source_data,mapped_data,target_table,target_id,lineage)
      VALUES(p_job_id,v_row_number,'valid',v_data,v_data,p_entity_type,v_target_id,jsonb_build_object('engine','unified-import-v1','company_id',v_job.company_id,'row',v_row_number));
    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
      v_error := SQLERRM;
      INSERT INTO public.import_job_rows(job_id,row_number,status,source_data,mapped_data,target_table,error_message,error_type,lineage)
      VALUES(p_job_id,v_row_number,'invalid',v_data,v_data,p_entity_type,v_error,'validation_or_upsert_error',jsonb_build_object('engine','unified-import-v1','company_id',v_job.company_id,'row',v_row_number));
    END;
  END LOOP;

  UPDATE public.import_jobs SET processed_rows=processed_rows+v_processed,
    valid_rows=valid_rows+(v_processed-v_failed), invalid_rows=invalid_rows+v_failed,
    progress=CASE WHEN total_rows>0 THEN least(100,round(((processed_rows+v_processed)::numeric/total_rows)*100)::integer) ELSE progress END,
    status=CASE WHEN total_rows>0 AND processed_rows+v_processed>=total_rows THEN 'completed' ELSE 'processing' END,
    completed_at=CASE WHEN total_rows>0 AND processed_rows+v_processed>=total_rows THEN now() ELSE completed_at END
  WHERE id=p_job_id;

  RETURN jsonb_build_object('processed',v_processed,'inserted',v_inserted,'updated',v_updated,'failed',v_failed);
END;
$$;
REVOKE ALL ON FUNCTION public.import_upsert_chunk(uuid,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_upsert_chunk(uuid,text,jsonb) TO authenticated;

COMMENT ON FUNCTION public.import_upsert_chunk(uuid,text,jsonb) IS 'Only supported bulk import write path. Whitelists entity types and enforces tenant context through the import job.';
