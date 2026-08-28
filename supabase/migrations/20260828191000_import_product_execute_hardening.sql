-- The canonical product import RPC is authenticated-only. Remove inherited
-- PUBLIC/anon execute from the canonical signature.
REVOKE ALL ON FUNCTION public.import_upsert_product(uuid,text,text,text,numeric,numeric,numeric,numeric,boolean,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_upsert_product(uuid,text,text,text,numeric,numeric,numeric,numeric,boolean,text) TO authenticated;
