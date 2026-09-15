-- The authenticated import RPC is SECURITY INVOKER and locks the canonical
-- commit row with SELECT ... FOR UPDATE. PostgreSQL requires UPDATE table
-- privilege for that lock operation even though the RPC does not issue a
-- direct UPDATE. Keep the existing tenant RLS boundary unchanged.
GRANT UPDATE ON TABLE public.canonical_import_commits TO authenticated;
