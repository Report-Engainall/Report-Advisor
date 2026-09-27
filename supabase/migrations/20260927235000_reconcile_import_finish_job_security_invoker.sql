-- Reconcile the live staging migration-lineage drift for the canonical import terminalizer.
-- Preserve the existing function body while restoring the repository security boundary.
ALTER FUNCTION public.import_finish_job(uuid,text,jsonb,text)
  SECURITY INVOKER;

ALTER FUNCTION public.import_finish_job(uuid,text,jsonb,text)
  SET search_path = public, pg_catalog;

REVOKE ALL ON FUNCTION public.import_finish_job(uuid,text,jsonb,text)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.import_finish_job(uuid,text,jsonb,text)
  TO authenticated, service_role;
