-- Authoritative source upload binding:
-- browser uploads raw bytes to the existing private documents bucket;
-- this SECURITY DEFINER RPC creates the immutable source record and binds the import job to it.
-- The server later derives SHA-256 from the stored raw bytes before canonical commit.

CREATE OR REPLACE FUNCTION public.import_create_job(
  p_company_id uuid,
  p_entity_type text DEFAULT 'import',
  p_total_rows integer DEFAULT 0,
  p_source_object_path text DEFAULT NULL,
  p_file_name text DEFAULT NULL,
  p_file_size bigint DEFAULT NULL,
  p_file_mime text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
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

REVOKE INSERT, UPDATE, DELETE ON public.file_records FROM authenticated;
GRANT SELECT ON public.file_records TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.import_jobs FROM authenticated;
GRANT SELECT ON public.import_jobs TO authenticated;

REVOKE ALL ON FUNCTION public.import_create_job(uuid, text, integer, text, text, bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_create_job(uuid, text, integer, text, text, bigint, text) TO authenticated, service_role;

-- Legacy invocation remains available through defaulted parameters; identity-bearing
-- source records are created only when the caller supplies the complete upload metadata.
