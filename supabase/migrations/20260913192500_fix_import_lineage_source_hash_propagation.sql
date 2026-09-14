-- Preserve source-hash idempotency when the governed lineage path delegates to import_commit_batch.
-- The source hash is mandatory provenance for the atomic canonical commit.
DO $$
DECLARE
  v_definition text;
  v_old_decl text := 'v_source jsonb;';
  v_new_decl text := 'v_source jsonb; v_min_hash text; v_max_hash text;';
  v_old_call text := 'v_result := public.import_commit_batch(p_company_id, p_entity_type, p_rows, p_null_policy);';
  v_new_call text := 'SELECT min(NULLIF(COALESCE(value ->> ''source_hash'', value -> ''lineage'' ->> ''sourceHash'', value -> ''lineage'' ->> ''source_hash''), '''')), max(NULLIF(COALESCE(value ->> ''source_hash'', value -> ''lineage'' ->> ''sourceHash'', value -> ''lineage'' ->> ''source_hash''), '''')) INTO v_min_hash, v_max_hash FROM jsonb_array_elements(p_source_rows); IF v_min_hash IS NULL OR v_max_hash IS NULL THEN RAISE EXCEPTION ''IMPORT_SOURCE_HASH_REQUIRED''; END IF; IF v_min_hash <> v_max_hash THEN RAISE EXCEPTION ''IMPORT_SOURCE_HASH_MISMATCH''; END IF; v_result := public.import_commit_batch(p_company_id, p_entity_type, p_rows, p_null_policy, v_min_hash);';
BEGIN
  SELECT pg_get_functiondef(p.oid)
    INTO v_definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.proname='import_commit_batch_with_lineage'
    AND pg_get_function_identity_arguments(p.oid)='p_company_id uuid, p_entity_type text, p_rows jsonb, p_source_rows jsonb, p_null_policy text';

  IF v_definition IS NULL THEN
    RAISE EXCEPTION 'IMPORT_LINEAGE_FUNCTION_MISSING';
  END IF;

  IF position(v_old_decl IN v_definition)=0 OR position(v_old_call IN v_definition)=0 THEN
    RAISE EXCEPTION 'IMPORT_LINEAGE_CONTRACT_DRIFTED';
  END IF;

  v_definition := replace(v_definition,v_old_decl,v_new_decl);
  v_definition := replace(v_definition,v_old_call,v_new_call);
  EXECUTE v_definition;
END
$$;
