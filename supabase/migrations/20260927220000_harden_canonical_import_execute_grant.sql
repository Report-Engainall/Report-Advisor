-- Canonical import RPC grant hardening.
-- The browser uses the authenticated server boundary and the server executor
-- passes the authenticated user client into the authoritative 6-argument RPC.
-- Keep authenticated/service_role execution; explicitly remove PUBLIC/anon access.
revoke all on function public.import_commit_batch(uuid, text, jsonb, text, text, uuid) from public, anon;
grant execute on function public.import_commit_batch(uuid, text, jsonb, text, text, uuid) to authenticated, service_role;
