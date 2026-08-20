-- Final hardening for the shared synonym dictionary and high-frequency import lookups.
-- synonym_dictionary is global metadata (it has no company_id), so it must not
-- inherit the old anonymous full-CRUD policies from the initial file schema.
ALTER TABLE public.synonym_dictionary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS anon_select_synonym_dictionary ON public.synonym_dictionary;
DROP POLICY IF EXISTS anon_insert_synonym_dictionary ON public.synonym_dictionary;
DROP POLICY IF EXISTS anon_update_synonym_dictionary ON public.synonym_dictionary;
DROP POLICY IF EXISTS anon_delete_synonym_dictionary ON public.synonym_dictionary;
DROP POLICY IF EXISTS dictionary_authenticated_select ON public.synonym_dictionary;
CREATE POLICY dictionary_authenticated_select
  ON public.synonym_dictionary
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Dictionary mutations are performed by controlled server-side/admin tooling,
-- not by arbitrary client sessions.
DROP POLICY IF EXISTS dictionary_authenticated_insert ON public.synonym_dictionary;
DROP POLICY IF EXISTS dictionary_authenticated_update ON public.synonym_dictionary;
DROP POLICY IF EXISTS dictionary_authenticated_delete ON public.synonym_dictionary;
CREATE POLICY dictionary_authenticated_insert
  ON public.synonym_dictionary
  FOR INSERT TO authenticated
  WITH CHECK (false);
CREATE POLICY dictionary_authenticated_update
  ON public.synonym_dictionary
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);
CREATE POLICY dictionary_authenticated_delete
  ON public.synonym_dictionary
  FOR DELETE TO authenticated
  USING (false);

-- Import matching is SKU/code driven. These indexes improve normalization and
-- matching without assuming the existing production data is duplicate-free.
CREATE INDEX IF NOT EXISTS idx_products_company_sku_lookup
  ON public.products(company_id, sku);
CREATE INDEX IF NOT EXISTS idx_customers_company_code_lookup
  ON public.customers(company_id, code);
CREATE INDEX IF NOT EXISTS idx_customers_company_name_lookup
  ON public.customers(company_id, lower(trim(name)));
CREATE INDEX IF NOT EXISTS idx_sales_invoices_company_invoice_lookup
  ON public.sales_invoices(company_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_import_jobs_company_created
  ON public.import_jobs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_records_company_hash
  ON public.file_records(company_id, file_hash);

COMMENT ON TABLE public.synonym_dictionary IS 'Global Arabic/English import mapping dictionary. Read-only to authenticated clients; mutations require controlled administrative tooling.';
