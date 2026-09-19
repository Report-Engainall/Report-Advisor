-- Harden the canonical import evidence ledger so browser-authenticated clients cannot forge, update, or delete commit evidence.
-- The existing import_commit_batch RPC remains the single authoritative write path.
-- Historical migrations remain immutable; this is a forward-only hardening migration.

DROP POLICY IF EXISTS canonical_import_commits_tenant_insert ON public.canonical_import_commits;

REVOKE INSERT, UPDATE, DELETE ON public.canonical_import_commits FROM authenticated;
GRANT SELECT ON public.canonical_import_commits TO authenticated;

ALTER FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text)
  SECURITY DEFINER
  SET search_path TO '';

REVOKE ALL ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text) TO authenticated, service_role;
