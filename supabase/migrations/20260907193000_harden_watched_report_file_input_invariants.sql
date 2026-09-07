-- Harden watched-file ledger input invariants after tenant binding repair.
-- Blank paths/hashes and negative sizes are not meaningful file provenance and
-- previously passed the database contract because only NOT NULL was enforced.

ALTER TABLE public.watched_report_files
  ADD CONSTRAINT watched_report_files_relative_path_nonblank_check
  CHECK (length(btrim(relative_path)) > 0),
  ADD CONSTRAINT watched_report_files_content_hash_nonblank_check
  CHECK (length(btrim(content_hash)) > 0),
  ADD CONSTRAINT watched_report_files_size_bytes_nonnegative_check
  CHECK (size_bytes >= 0),
  ADD CONSTRAINT watched_report_files_source_version_positive_check
  CHECK (source_version >= 1);

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
  IF p_relative_path IS NULL OR length(btrim(p_relative_path)) = 0 THEN
    RAISE EXCEPTION 'RELATIVE_PATH_REQUIRED';
  END IF;
  IF p_content_hash IS NULL OR length(btrim(p_content_hash)) = 0 THEN
    RAISE EXCEPTION 'CONTENT_HASH_REQUIRED';
  END IF;
  IF p_size_bytes IS NULL OR p_size_bytes < 0 THEN
    RAISE EXCEPTION 'SIZE_BYTES_INVALID';
  END IF;
  IF p_state IS NULL OR p_state NOT IN ('new','changed','unchanged','processing','processed','failed','dead_letter','deleted') THEN
    RAISE EXCEPTION 'STATE_INVALID';
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
    company_id, folder_id, relative_path, content_hash, size_bytes,
    modified_at, state
  ) VALUES (
    v_company_id, p_folder_id, p_relative_path, p_content_hash, p_size_bytes,
    p_modified_at, p_state
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
