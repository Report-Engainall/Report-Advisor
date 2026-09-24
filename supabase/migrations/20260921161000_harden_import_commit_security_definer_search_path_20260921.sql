-- Harden the canonical import_commit_batch SECURITY DEFINER function.
-- Keep the existing RPC surface; only pin the execution search_path.
ALTER FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text)
  SET search_path TO 'pg_catalog';
