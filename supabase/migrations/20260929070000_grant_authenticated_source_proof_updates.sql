-- The canonical import endpoint persists authoritative source provenance through
-- the authenticated user-scoped client. RLS remains the tenant boundary; these
-- table grants only permit the already-policy-constrained SELECT/UPDATE operations.
GRANT SELECT, UPDATE ON public.file_records TO authenticated;
GRANT SELECT, UPDATE ON public.import_jobs TO authenticated;
