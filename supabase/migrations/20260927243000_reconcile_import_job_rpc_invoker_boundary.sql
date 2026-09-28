-- Reconcile the live import job RPCs back to the canonical SECURITY INVOKER
-- boundary. Preserve their current tenant/state validation and source metadata
-- behavior while letting authenticated RLS remain the data boundary.

CREATE OR REPLACE FUNCTION public.import_create_job(
  p_company_id uuid,
  p_entity_type text DEFAULT 'import',
  p_total_rows integer DEFAULT 0,
  p_source_object_path text DEFAULT NULL,
  p_file_name text DEFAULT NULL,
  p_file_size bigint DEFAULT NULL,
  p_file_mime text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_id uuid;
  v_file_record_id uuid;
BEGIN
  IF v_company_id IS NULL OR auth.uid() IS NULL OR p_company_id IS NULL OR p_company_id <> v_company_id THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH';
  END IF;

  IF p_total_rows < 0 THEN
    RAISE EXCEPTION 'IMPORT_TOTAL_ROWS_INVALID';
  END IF;

  IF p_source_object_path IS NULL THEN
    IF p_file_name IS NOT NULL OR p_file_size IS NOT NULL OR p_file_mime IS NOT NULL THEN
      RAISE EXCEPTION 'IMPORT_SOURCE_METADATA_INCOMPLETE';
    END IF;
  ELSE
    IF p_file_name IS NULL OR btrim(p_file_name) = '' OR length(p_file_name) > 512 THEN
      RAISE EXCEPTION 'IMPORT_FILE_NAME_INVALID';
    END IF;
    IF p_file_size IS NULL OR p_file_size <= 0 OR p_file_size > 52428800 THEN
      RAISE EXCEPTION 'IMPORT_FILE_SIZE_INVALID';
    END IF;
    IF p_file_mime IS NULL OR p_file_mime NOT IN (
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/tiff',
      'image/webp'
    ) THEN
      RAISE EXCEPTION 'IMPORT_FILE_MIME_INVALID';
    END IF;
    IF p_source_object_path !~ ('^' || v_company_id::text || '/imports/[0-9a-fA-F-]{36}\.[A-Za-z0-9]{1,12}$') THEN
      RAISE EXCEPTION 'IMPORT_SOURCE_OBJECT_PATH_INVALID';
    END IF;

    INSERT INTO public.file_records(
      company_id,
      file_name,
      file_extension,
      file_mime,
      file_size,
      file_hash,
      security_status,
      status,
      metadata
    )
    VALUES(
      v_company_id,
      p_file_name,
      lower(CASE WHEN position('.' IN reverse(p_file_name)) > 0 THEN right(p_file_name, position('.' IN reverse(p_file_name)) - 1) ELSE NULL END),
      p_file_mime,
      p_file_size,
      NULL,
      'pending',
      'uploaded',
      jsonb_build_object(
        'storage_bucket','documents',
        'storage_path',p_source_object_path,
        'uploaded_by',auth.uid()::text
      )
    )
    RETURNING id INTO v_file_record_id;
  END IF;

  INSERT INTO public.import_jobs(
    company_id,
    file_record_id,
    job_type,
    processing_mode,
    status,
    total_rows,
    processed_rows,
    valid_rows,
    invalid_rows,
    quarantined_rows,
    duplicate_rows,
    progress,
    started_at,
    source_fingerprint,
    result_summary
  )
  VALUES(
    v_company_id,
    v_file_record_id,
    COALESCE(NULLIF(btrim(p_entity_type), ''), 'import'),
    'import',
    'processing',
    p_total_rows,
    0,
    0,
    0,
    0,
    0,
    0,
    now(),
    NULL,
    CASE
      WHEN v_file_record_id IS NULL THEN '{}'::jsonb
      ELSE jsonb_build_object(
        'file_name', p_file_name,
        'source_storage_bucket', 'documents',
        'source_storage_path', p_source_object_path,
        'source_record_pending_hash', true
      )
    END
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.import_update_job_progress(
  p_job_id uuid,
  p_processed_rows integer,
  p_valid_rows integer,
  p_invalid_rows integer,
  p_duplicate_rows integer,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_total integer;
  v_existing_processed integer;
  v_existing_valid integer;
  v_existing_invalid integer;
  v_existing_duplicate integer;
  v_current_status text;
  v_processed integer;
  v_valid integer;
  v_invalid integer;
  v_duplicate integer;
  v_status text := coalesce(nullif(trim(p_status),''),'processing');
BEGIN
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;

  IF v_status NOT IN ('queued','processing') THEN
    RAISE EXCEPTION 'IMPORT_NON_TERMINAL_STATUS_REQUIRED';
  END IF;

  IF p_processed_rows IS NULL OR p_processed_rows < 0
     OR p_valid_rows IS NULL OR p_valid_rows < 0
     OR p_invalid_rows IS NULL OR p_invalid_rows < 0
     OR p_duplicate_rows IS NULL OR p_duplicate_rows < 0
  THEN
    RAISE EXCEPTION 'IMPORT_PROGRESS_COUNTER_INVALID';
  END IF;

  SELECT total_rows, processed_rows, valid_rows, invalid_rows, duplicate_rows, status
    INTO v_total, v_existing_processed, v_existing_valid, v_existing_invalid, v_existing_duplicate, v_current_status
  FROM public.import_jobs
  WHERE id=p_job_id AND company_id=v_company_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  IF v_current_status IN ('completed','partial','failed','cancelled') THEN
    RAISE EXCEPTION 'IMPORT_JOB_ALREADY_TERMINAL';
  END IF;

  IF v_current_status NOT IN ('queued','processing') THEN
    RAISE EXCEPTION 'IMPORT_JOB_STATE_INVALID';
  END IF;

  IF p_processed_rows > coalesce(v_total,0)
     OR p_valid_rows > p_processed_rows
     OR p_invalid_rows > p_processed_rows
     OR p_duplicate_rows > p_processed_rows
  THEN
    RAISE EXCEPTION 'IMPORT_PROGRESS_COUNTER_OUT_OF_RANGE';
  END IF;

  v_processed := greatest(coalesce(v_existing_processed,0), p_processed_rows);
  v_valid := greatest(coalesce(v_existing_valid,0), p_valid_rows);
  v_invalid := greatest(coalesce(v_existing_invalid,0), p_invalid_rows);
  v_duplicate := greatest(coalesce(v_existing_duplicate,0), p_duplicate_rows);

  IF v_valid > v_processed OR v_invalid > v_processed OR v_duplicate > v_processed THEN
    RAISE EXCEPTION 'IMPORT_PROGRESS_COUNTER_INCONSISTENT';
  END IF;

  UPDATE public.import_jobs
  SET status=v_status,
      processed_rows=v_processed,
      valid_rows=v_valid,
      invalid_rows=v_invalid,
      duplicate_rows=v_duplicate,
      progress=CASE
        WHEN coalesce(v_total,0)>0
          THEN least(100,greatest(0,round(v_processed::numeric/v_total::numeric*100)::integer))
        ELSE 0
      END,
      started_at=coalesce(started_at,now())
  WHERE id=p_job_id AND company_id=v_company_id AND status IN ('queued','processing');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'IMPORT_JOB_STATE_CHANGED';
  END IF;
END;
$function$;

ALTER FUNCTION public.import_create_job(uuid,text,integer,text,text,bigint,text)
  SECURITY INVOKER;
ALTER FUNCTION public.import_create_job(uuid,text,integer,text,text,bigint,text)
  SET search_path TO 'public', 'pg_catalog';

ALTER FUNCTION public.import_update_job_progress(uuid,integer,integer,integer,integer,text)
  SECURITY INVOKER;
ALTER FUNCTION public.import_update_job_progress(uuid,integer,integer,integer,integer,text)
  SET search_path TO 'public', 'pg_catalog';

REVOKE ALL ON FUNCTION public.import_create_job(uuid,text,integer,text,text,bigint,text)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.import_update_job_progress(uuid,integer,integer,integer,integer,text)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.import_create_job(uuid,text,integer,text,text,bigint,text)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.import_update_job_progress(uuid,integer,integer,integer,integer,text)
  TO authenticated, service_role;
