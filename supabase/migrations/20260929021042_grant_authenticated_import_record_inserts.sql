-- Restore the minimum authenticated DML privileges required by the tenant-scoped import_create_job RPC.
-- RLS tenant_insert policies remain the authorization boundary.
grant insert on table public.file_records to authenticated;
grant insert on table public.import_jobs to authenticated;
