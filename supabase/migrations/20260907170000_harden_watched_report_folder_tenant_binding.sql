-- Harden watched-file provenance: a SECURITY DEFINER recorder must never accept
-- a folder belonging to another tenant. The original schema only referenced
-- watched_report_folders(id), allowing a caller who knows another tenant's folder
-- UUID to create a file row under their own company with that foreign folder_id.

ALTER TABLE public.watched_report_folders
  ADD CONSTRAINT watched_report_folders_company_id_id_key UNIQUE (company_id, id);

ALTER TABLE public.watched_report_files
  DROP CONSTRAINT IF EXISTS watched_report_files_folder_id_fkey;

ALTER TABLE public.watched_report_files
  ADD CONSTRAINT watched_report_files_folder_company_fkey
  FOREIGN KEY (company_id, folder_id)
  REFERENCES public.watched_report_folders(company_id, id)
  ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.record_watched_report_file(
  p_folder_id uuid,
  p_relative_path text,
  p_content_hash text,
  p_size_bytes bigint,
  p_modified_at timestamptz,
  p_state text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_id uuid;
BEGIN
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED';
  END IF;

  IF p_folder_id IS NULL THEN
    RAISE EXCEPTION 'FOLDER_ID_REQUIRED';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.watched_report_folders f
    WHERE f.id = p_folder_id
      AND f.company_id = v_company_id
  ) THEN
    RAISE EXCEPTION 'FOLDER_TENANT_MISMATCH';
  END IF;

  INSERT INTO public.watched_report_files(
    company_id,
    folder_id,
    relative_path,
    content_hash,
    size_bytes,
    modified_at,
    state
  ) VALUES (
    v_company_id,
    p_folder_id,
    p_relative_path,
    p_content_hash,
    p_size_bytes,
    p_modified_at,
    p_state
  )
  ON CONFLICT(company_id, folder_id, relative_path) DO UPDATE SET
    content_hash = EXCLUDED.content_hash,
    size_bytes = EXCLUDED.size_bytes,
    modified_at = EXCLUDED.modified_at,
    state = EXCLUDED.state,
    source_version = public.watched_report_files.source_version + 1,
    updated_at = now();

  SELECT id INTO v_id
  FROM public.watched_report_files
  WHERE company_id = v_company_id
    AND folder_id = p_folder_id
    AND relative_path = p_relative_path;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_watched_report_file(uuid,text,text,bigint,timestamptz,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_watched_report_file(uuid,text,text,bigint,timestamptz,text) TO authenticated;
