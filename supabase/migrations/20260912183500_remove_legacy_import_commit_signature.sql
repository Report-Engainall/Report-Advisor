-- The source-bound five-argument RPC is now the sole canonical write boundary.
DROP FUNCTION IF EXISTS public.import_commit_batch(uuid,text,jsonb,text);
