-- Preserve every source field during canonical imports.
-- Canonical business tables remain normalized, while import_job_rows retains the
-- complete source row so unmapped/custom columns are never silently discarded.

CREATE OR REPLACE FUNCTION public.import_commit_batch_with_lineage(
  p_company_id uuid,
  p_entity_type text,
  p_rows jsonb,
  p_source_rows jsonb,
  p_null_policy text DEFAULT 'preserve'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_result jsonb;
  v_ids jsonb;
  v_item jsonb;
  v_index integer;
  v_source jsonb;
BEGIN
  IF v_company_id IS NULL OR v_company_id <> p_company_id THEN
    RAISE EXCEPTION 'IMPORT_TENANT_CONTEXT_REQUIRED';
  END IF;

  IF jsonb_typeof(p_rows) <> 'array' OR jsonb_typeof(p_source_rows) <> 'array' THEN
    RAISE EXCEPTION 'IMPORT_ROWS_MUST_BE_JSON_ARRAYS';
  END IF;

  IF jsonb_array_length(p_rows) <> jsonb_array_length(p_source_rows) THEN
    RAISE EXCEPTION 'IMPORT_SOURCE_ROW_COUNT_MISMATCH';
  END IF;

  -- Existing canonical importer performs the normalized business write.
  -- This function is transactional: lineage insertion rolls back with it.
  v_result := public.import_commit_batch(
    p_company_id,
    p_entity_type,
    p_rows,
    p_null_policy
  );

  v_ids := COALESCE(v_result -> 'ids', '[]'::jsonb);
  IF jsonb_array_length(v_ids) <> jsonb_array_length(p_rows) THEN
    RAISE EXCEPTION 'IMPORT_COMMIT_RESULT_MISMATCH';
  END IF;

  FOR v_item, v_index IN
    SELECT value, ordinality::integer
    FROM jsonb_array_elements(p_source_rows) WITH ORDINALITY
  LOOP
    v_source := COALESCE(v_item -> 'source_data', v_item);

    INSERT INTO public.import_job_rows (
      job_id,
      row_number,
      status,
      source_data,
      mapped_data,
      target_table,
      target_id,
      lineage
    )
    VALUES (
      NULLIF(v_item ->> 'job_id', '')::uuid,
      COALESCE(NULLIF(v_item ->> 'row_number', '')::integer, v_index),
      COALESCE(NULLIF(v_item ->> 'status', ''), 'valid'),
      v_source,
      COALESCE(v_item -> 'mapped_data', p_rows -> (v_index - 1)),
      COALESCE(NULLIF(v_item ->> 'target_table', ''), p_entity_type),
      NULLIF(v_ids ->> (v_index - 1), '')::uuid,
      COALESCE(v_item -> 'lineage', '{}'::jsonb)
    );
  END LOOP;

  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.import_commit_batch_with_lineage(uuid, text, jsonb, jsonb, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.import_commit_batch_with_lineage(uuid, text, jsonb, jsonb, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch_with_lineage(uuid, text, jsonb, jsonb, text) TO authenticated;

COMMENT ON FUNCTION public.import_commit_batch_with_lineage(uuid, text, jsonb, jsonb, text)
IS 'Canonical import plus transactional preservation of complete source rows in import_job_rows; unmapped source fields are retained for analysis and lineage.';
