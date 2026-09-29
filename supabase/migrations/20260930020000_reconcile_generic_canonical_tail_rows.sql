-- Governed recovery for an already-committed generic source whose corrected
-- authoritative parser output is a strict prefix of the existing canonical rows.
-- This is intentionally narrow: it never changes retained rows and only removes
-- trailing rows that are structurally invalid for generic sales/purchases.

CREATE OR REPLACE FUNCTION public.reconcile_generic_canonical_tail_rows(
  p_company_id uuid,
  p_entity_type text,
  p_source_hash text,
  p_expected_existing_count integer,
  p_rows jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
SET statement_timeout TO '30s'
AS $function$
DECLARE
  v_company_id uuid := public.current_company_id();
  v_existing public.canonical_import_commits%rowtype;
  v_existing_count integer;
  v_new_count integer;
  v_row jsonb;
  v_existing_row public.canonical_dataset_records%rowtype;
  v_key text;
BEGIN
  IF v_company_id IS NULL THEN RAISE EXCEPTION 'TENANT_CONTEXT_REQUIRED'; END IF;
  IF p_company_id IS DISTINCT FROM v_company_id THEN RAISE EXCEPTION 'TENANT_CONTEXT_MISMATCH'; END IF;
  IF p_entity_type NOT IN ('generic:sales','generic:purchases') THEN
    RAISE EXCEPTION 'GENERIC_CANONICAL_TAIL_RECONCILIATION_UNSUPPORTED';
  END IF;
  IF p_source_hash IS NULL OR btrim(p_source_hash) = '' OR p_source_hash !~ '^sha256:[0-9a-fA-F]{64}$' THEN
    RAISE EXCEPTION 'IMPORT_SOURCE_HASH_INVALID';
  END IF;
  IF p_expected_existing_count IS NULL OR p_expected_existing_count < 1 THEN
    RAISE EXCEPTION 'EXPECTED_EXISTING_COUNT_INVALID';
  END IF;
  IF jsonb_typeof(p_rows) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'IMPORT_ROWS_MUST_BE_ARRAY';
  END IF;

  SELECT *
  INTO v_existing
  FROM public.canonical_import_commits c
  WHERE c.company_id = v_company_id
    AND c.entity_type = p_entity_type
    AND c.source_hash = p_source_hash
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'CANONICAL_EXISTING_COMMIT_NOT_FOUND'; END IF;

  SELECT count(*)::integer
  INTO v_existing_count
  FROM public.canonical_dataset_records r
  WHERE r.company_id = v_company_id
    AND r.source_hash = p_source_hash
    AND r.semantic_domain = substr(p_entity_type, 9);

  IF v_existing.committed_count <> p_expected_existing_count
     OR v_existing_count <> v_existing.committed_count THEN
    RAISE EXCEPTION 'CANONICAL_EXISTING_COMMIT_STATE_MISMATCH';
  END IF;

  v_new_count := jsonb_array_length(p_rows);
  IF v_new_count >= v_existing_count THEN
    RETURN jsonb_build_object(
      'reconciled', false,
      'reason', 'NO_STRICT_TAIL_REDUCTION',
      'committed', v_existing_count,
      'ids', v_existing.committed_ids
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS x(value, ordinality)
    WHERE jsonb_typeof(value) IS DISTINCT FROM 'object'
       OR nullif(value->>'row_number','') IS NULL
       OR (value->>'row_number')::integer <> ordinality::integer
       OR nullif(btrim(value->>'record_key'),'') IS NULL
       OR jsonb_typeof(value->'data') IS DISTINCT FROM 'object'
       OR jsonb_typeof(value->'provenance') IS DISTINCT FROM 'object'
       OR value->'provenance'->>'sourceHash' IS DISTINCT FROM p_source_hash
  ) THEN
    RAISE EXCEPTION 'GENERIC_CANONICAL_CORRECTION_ROWS_INVALID';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (
      SELECT value->>'record_key' AS record_key, count(*) AS c
      FROM jsonb_array_elements(p_rows) AS x(value)
      GROUP BY value->>'record_key'
      HAVING count(*) > 1
    ) d
  ) THEN
    RAISE EXCEPTION 'GENERIC_CANONICAL_CORRECTION_DUPLICATE_RECORD_KEY';
  END IF;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows) ORDER BY (value->>'row_number')::integer LOOP
    SELECT *
    INTO v_existing_row
    FROM public.canonical_dataset_records r
    WHERE r.company_id = v_company_id
      AND r.source_hash = p_source_hash
      AND r.semantic_domain = substr(p_entity_type, 9)
      AND r.row_number = (v_row->>'row_number')::integer
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'GENERIC_CANONICAL_CORRECTION_PREFIX_GAP:%', v_row->>'row_number';
    END IF;

    IF v_existing_row.record_key IS DISTINCT FROM v_row->>'record_key'
       OR v_existing_row.data IS DISTINCT FROM v_row->'data'
       OR v_existing_row.provenance IS DISTINCT FROM v_row->'provenance' THEN
      RAISE EXCEPTION 'GENERIC_CANONICAL_CORRECTION_PREFIX_MISMATCH:%', v_row->>'row_number';
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM public.canonical_dataset_records r
    WHERE r.company_id = v_company_id
      AND r.source_hash = p_source_hash
      AND r.semantic_domain = substr(p_entity_type, 9)
      AND r.row_number > v_new_count
      AND (
        nullif(btrim(r.data->>'invoice_number'),'') IS NOT NULL
        OR nullif(btrim(r.data->>'date'),'') IS NOT NULL
      )
  ) THEN
    RAISE EXCEPTION 'GENERIC_CANONICAL_TAIL_CONTAINS_BUSINESS_ROW';
  END IF;

  DELETE FROM public.canonical_dataset_records
  WHERE company_id = v_company_id
    AND source_hash = p_source_hash
    AND semantic_domain = substr(p_entity_type, 9)
    AND row_number > v_new_count;

  SELECT coalesce(jsonb_agg(r.id ORDER BY r.row_number), '[]'::jsonb)
  INTO v_existing.committed_ids
  FROM public.canonical_dataset_records r
  WHERE r.company_id = v_company_id
    AND r.source_hash = p_source_hash
    AND r.semantic_domain = substr(p_entity_type, 9);

  v_existing.committed_count := v_new_count;
  v_existing.committed_at := clock_timestamp();

  UPDATE public.canonical_import_commits
  SET committed_ids = v_existing.committed_ids,
      committed_count = v_existing.committed_count,
      committed_at = v_existing.committed_at
  WHERE id = v_existing.id;

  RETURN jsonb_build_object(
    'reconciled', true,
    'previous_committed', v_existing_count,
    'committed', v_new_count,
    'ids', v_existing.committed_ids
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.reconcile_generic_canonical_tail_rows(uuid, text, text, integer, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reconcile_generic_canonical_tail_rows(uuid, text, text, integer, jsonb) TO authenticated;
