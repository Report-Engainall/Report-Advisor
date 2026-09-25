-- Harden both canonical import_commit_batch SECURITY DEFINER overloads.
-- Keep the existing RPC surface; only pin the execution search_path.
ALTER FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text)
  SET search_path TO 'pg_catalog';

ALTER FUNCTION IF EXISTS public.import_commit_batch(uuid, text, jsonb, text, text, uuid)
  SET search_path TO 'pg_catalog';
