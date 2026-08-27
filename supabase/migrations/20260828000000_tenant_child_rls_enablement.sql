-- Defense-in-depth tenant isolation for child tables.
-- The canonical hardening migration defines tenant policies for these tables;
-- this follow-up explicitly enables RLS so policy presence can never be mistaken
-- for executable row-level isolation.
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_job_rows ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE sale_items IS 'Tenant-isolated child rows; RLS is explicitly enabled and scoped through sales_invoices.';
COMMENT ON TABLE purchase_items IS 'Tenant-isolated child rows; RLS is explicitly enabled and scoped through purchase_invoices.';
COMMENT ON TABLE import_rows IS 'Tenant-isolated child rows; RLS is explicitly enabled and scoped through imports.';
COMMENT ON TABLE import_job_rows IS 'Tenant-isolated child rows; RLS is explicitly enabled and scoped through import_jobs.';
