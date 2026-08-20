-- Compatibility guard for clients that create a file record and then start an
-- import job without explicitly passing file_record_id. The binding is tenant
-- scoped, type scoped and time bounded; explicit file_record_id always wins.
CREATE OR REPLACE FUNCTION public.bind_import_job_file_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.file_record_id IS NULL THEN
    SELECT fr.id INTO NEW.file_record_id
    FROM public.file_records fr
    WHERE fr.company_id = NEW.company_id
      AND fr.created_at >= now() - interval '10 minutes'
      AND fr.status IN ('scanned','uploaded')
      AND COALESCE(fr.metadata->>'entity_type','') = NEW.job_type
    ORDER BY fr.created_at DESC
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bind_import_job_file_record ON public.import_jobs;
CREATE TRIGGER trg_bind_import_job_file_record
BEFORE INSERT ON public.import_jobs
FOR EACH ROW
EXECUTE FUNCTION public.bind_import_job_file_record();

REVOKE ALL ON FUNCTION public.bind_import_job_file_record() FROM PUBLIC;
COMMENT ON FUNCTION public.bind_import_job_file_record() IS 'Tenant/type/time bounded compatibility binding between an import job and its scanned file record.';
