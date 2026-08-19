-- Report-Advisor production SaaS isolation layer.
-- Existing company_id becomes the tenant boundary. No tenant may cross this boundary.

CREATE TABLE IF NOT EXISTS tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user ON tenant_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_company ON tenant_memberships(company_id, status);

CREATE OR REPLACE FUNCTION public.current_company_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.tenant_memberships
  WHERE user_id = auth.uid() AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.has_company_access(target_company uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenant_memberships
    WHERE user_id = auth.uid() AND company_id = target_company AND status = 'active');
$$;

-- Safe onboarding primitive: the authenticated user creates a company and becomes owner.
CREATE OR REPLACE FUNCTION public.create_tenant(p_name text, p_industry text DEFAULT 'retail')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_company uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  INSERT INTO companies(name, industry) VALUES (trim(p_name), coalesce(nullif(trim(p_industry), ''), 'retail')) RETURNING id INTO new_company;
  INSERT INTO tenant_memberships(user_id, company_id, role) VALUES (auth.uid(), new_company, 'owner');
  RETURN new_company;
END;
$$;
REVOKE ALL ON FUNCTION public.create_tenant(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_tenant(text,text) TO authenticated;

ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_memberships_select ON tenant_memberships;
CREATE POLICY tenant_memberships_select ON tenant_memberships FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS tenant_memberships_insert ON tenant_memberships;
CREATE POLICY tenant_memberships_insert ON tenant_memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS tenant_memberships_update ON tenant_memberships;
CREATE POLICY tenant_memberships_update ON tenant_memberships FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS tenant_memberships_delete ON tenant_memberships;
CREATE POLICY tenant_memberships_delete ON tenant_memberships FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Remove the legacy anonymous all-access policies from tenant-owned tables.
DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT unnest(ARRAY['companies','branches','warehouses','categories','customers','suppliers','products','sales_invoices','sale_items','purchase_invoices','purchase_items','payments','inventory_movements','inventory_balances','imports','import_rows','recommendations','alerts','forecasts','audit_logs','file_records','import_profiles','import_snapshots','import_jobs','import_job_rows','data_quality_reports']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS anon_select_%I ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS anon_insert_%I ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS anon_update_%I ON %I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS anon_delete_%I ON %I', t, t);
  END LOOP;
END $$;

-- Direct company-owned tables.
DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT unnest(ARRAY['branches','warehouses','categories','customers','suppliers','products','sales_invoices','payments','inventory_movements','inventory_balances','imports','recommendations','alerts','forecasts','audit_logs','file_records','import_profiles','import_snapshots','import_jobs','data_quality_reports']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_select_%I ON %I', t, t);
    EXECUTE format('CREATE POLICY tenant_select_%I ON %I FOR SELECT TO authenticated USING (public.has_company_access(company_id))', t, t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_insert_%I ON %I', t, t);
    EXECUTE format('CREATE POLICY tenant_insert_%I ON %I FOR INSERT TO authenticated WITH CHECK (public.has_company_access(company_id))', t, t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_update_%I ON %I', t, t);
    EXECUTE format('CREATE POLICY tenant_update_%I ON %I FOR UPDATE TO authenticated USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id))', t, t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_delete_%I ON %I', t, t);
    EXECUTE format('CREATE POLICY tenant_delete_%I ON %I FOR DELETE TO authenticated USING (public.has_company_access(company_id))', t, t);
  END LOOP;
END $$;

-- Companies are visible only to members; membership is the source of authorization.
DROP POLICY IF EXISTS tenant_select_companies ON companies;
CREATE POLICY tenant_select_companies ON companies FOR SELECT TO authenticated USING (public.has_company_access(id));
DROP POLICY IF EXISTS tenant_insert_companies ON companies;
CREATE POLICY tenant_insert_companies ON companies FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS tenant_update_companies ON companies;
CREATE POLICY tenant_update_companies ON companies FOR UPDATE TO authenticated USING (public.has_company_access(id)) WITH CHECK (public.has_company_access(id));
DROP POLICY IF EXISTS tenant_delete_companies ON companies;
CREATE POLICY tenant_delete_companies ON companies FOR DELETE TO authenticated USING (public.has_company_access(id));

-- Child rows inherit isolation from their parent invoice/import/job.
DROP POLICY IF EXISTS tenant_select_sale_items ON sale_items;
CREATE POLICY tenant_select_sale_items ON sale_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM sales_invoices s WHERE s.id = invoice_id AND public.has_company_access(s.company_id)));
DROP POLICY IF EXISTS tenant_insert_sale_items ON sale_items;
CREATE POLICY tenant_insert_sale_items ON sale_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM sales_invoices s WHERE s.id = invoice_id AND public.has_company_access(s.company_id)));
DROP POLICY IF EXISTS tenant_update_sale_items ON sale_items;
CREATE POLICY tenant_update_sale_items ON sale_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM sales_invoices s WHERE s.id = invoice_id AND public.has_company_access(s.company_id))) WITH CHECK (EXISTS (SELECT 1 FROM sales_invoices s WHERE s.id = invoice_id AND public.has_company_access(s.company_id)));
DROP POLICY IF EXISTS tenant_delete_sale_items ON sale_items;
CREATE POLICY tenant_delete_sale_items ON sale_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM sales_invoices s WHERE s.id = invoice_id AND public.has_company_access(s.company_id)));

DROP POLICY IF EXISTS tenant_select_purchase_items ON purchase_items;
CREATE POLICY tenant_select_purchase_items ON purchase_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM purchase_invoices p WHERE p.id = invoice_id AND public.has_company_access(p.company_id)));
DROP POLICY IF EXISTS tenant_insert_purchase_items ON purchase_items;
CREATE POLICY tenant_insert_purchase_items ON purchase_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM purchase_invoices p WHERE p.id = invoice_id AND public.has_company_access(p.company_id)));
DROP POLICY IF EXISTS tenant_update_purchase_items ON purchase_items;
CREATE POLICY tenant_update_purchase_items ON purchase_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM purchase_invoices p WHERE p.id = invoice_id AND public.has_company_access(p.company_id))) WITH CHECK (EXISTS (SELECT 1 FROM purchase_invoices p WHERE p.id = invoice_id AND public.has_company_access(p.company_id)));
DROP POLICY IF EXISTS tenant_delete_purchase_items ON purchase_items;
CREATE POLICY tenant_delete_purchase_items ON purchase_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM purchase_invoices p WHERE p.id = invoice_id AND public.has_company_access(p.company_id)));

DROP POLICY IF EXISTS tenant_select_import_rows ON import_rows;
CREATE POLICY tenant_select_import_rows ON import_rows FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM imports i WHERE i.id = import_id AND public.has_company_access(i.company_id)));
DROP POLICY IF EXISTS tenant_insert_import_rows ON import_rows;
CREATE POLICY tenant_insert_import_rows ON import_rows FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM imports i WHERE i.id = import_id AND public.has_company_access(i.company_id)));
DROP POLICY IF EXISTS tenant_update_import_rows ON import_rows;
CREATE POLICY tenant_update_import_rows ON import_rows FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM imports i WHERE i.id = import_id AND public.has_company_access(i.company_id))) WITH CHECK (EXISTS (SELECT 1 FROM imports i WHERE i.id = import_id AND public.has_company_access(i.company_id)));
DROP POLICY IF EXISTS tenant_delete_import_rows ON import_rows;
CREATE POLICY tenant_delete_import_rows ON import_rows FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM imports i WHERE i.id = import_id AND public.has_company_access(i.company_id)));

DROP POLICY IF EXISTS tenant_select_import_job_rows ON import_job_rows;
CREATE POLICY tenant_select_import_job_rows ON import_job_rows FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM import_jobs j WHERE j.id = job_id AND public.has_company_access(j.company_id)));
DROP POLICY IF EXISTS tenant_insert_import_job_rows ON import_job_rows;
CREATE POLICY tenant_insert_import_job_rows ON import_job_rows FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM import_jobs j WHERE j.id = job_id AND public.has_company_access(j.company_id)));
DROP POLICY IF EXISTS tenant_update_import_job_rows ON import_job_rows;
CREATE POLICY tenant_update_import_job_rows ON import_job_rows FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM import_jobs j WHERE j.id = job_id AND public.has_company_access(j.company_id))) WITH CHECK (EXISTS (SELECT 1 FROM import_jobs j WHERE j.id = job_id AND public.has_company_access(j.company_id)));
DROP POLICY IF EXISTS tenant_delete_import_job_rows ON import_job_rows;
CREATE POLICY tenant_delete_import_job_rows ON import_job_rows FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM import_jobs j WHERE j.id = job_id AND public.has_company_access(j.company_id)));

-- Realtime must be enabled only after table policies are in place; never publish tenant data to an unauthenticated channel.
COMMENT ON TABLE tenant_memberships IS 'Authorization boundary: every customer-facing record is isolated by company_id membership.';
