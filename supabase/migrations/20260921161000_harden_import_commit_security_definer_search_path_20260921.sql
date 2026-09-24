-- Harden the canonical import_commit_batch SECURITY DEFINER overloads.
-- Keep the existing RPC surface. The legacy import-job-aware overload may exist in
-- already-live environments even when its historical creation migration is no longer
-- present in a clean replay; preserve its hardening conditionally without inventing it.
ALTER FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text)
  SET search_path TO 'pg_catalog';

DO $$
BEGIN
  IF to_regprocedure('public.import_commit_batch(uuid,text,jsonb,text,text,uuid)') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text, uuid) SET search_path TO ''pg_catalog''';
  END IF;
END
$$;
