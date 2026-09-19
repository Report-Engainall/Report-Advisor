-- Revoke authenticated execution of the legacy five-argument canonical commit writer.
-- The seven-argument wrapper is the only browser-authorized boundary and binds the import job
-- to the authoritative file record before delegating to this service-role-only writer.

REVOKE ALL ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text) TO service_role;

REVOKE ALL ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text, uuid) TO authenticated, service_role;
