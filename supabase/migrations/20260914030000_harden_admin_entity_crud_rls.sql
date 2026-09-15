-- Allow the canonical admin role to perform the same tenant-scoped CRUD mutations
-- already permitted to operational roles. Read isolation remains unchanged.

DROP POLICY IF EXISTS tenant_insert ON public.customers;
CREATE POLICY tenant_insert ON public.customers
FOR INSERT TO authenticated
WITH CHECK (
  company_id = (SELECT public.current_company_id())
  AND EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = (SELECT public.current_company_id())
      AND cm.user_id = (SELECT auth.uid())
      AND cm.is_active = true
      AND cm.role = ANY (ARRAY['admin','member','manager','warehouse','accountant','system_admin'])
  )
);

DROP POLICY IF EXISTS tenant_update ON public.customers;
CREATE POLICY tenant_update ON public.customers
FOR UPDATE TO authenticated
USING (
  company_id = (SELECT public.current_company_id())
  AND EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = (SELECT public.current_company_id())
      AND cm.user_id = (SELECT auth.uid())
      AND cm.is_active = true
      AND cm.role = ANY (ARRAY['admin','member','manager','warehouse','accountant','system_admin'])
  )
)
WITH CHECK (
  company_id = (SELECT public.current_company_id())
  AND EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = (SELECT public.current_company_id())
      AND cm.user_id = (SELECT auth.uid())
      AND cm.is_active = true
      AND cm.role = ANY (ARRAY['admin','member','manager','warehouse','accountant','system_admin'])
  )
);

DROP POLICY IF EXISTS tenant_delete ON public.customers;
CREATE POLICY tenant_delete ON public.customers
FOR DELETE TO authenticated
USING (
  company_id = (SELECT public.current_company_id())
  AND EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = (SELECT public.current_company_id())
      AND cm.user_id = (SELECT auth.uid())
      AND cm.is_active = true
      AND cm.role = ANY (ARRAY['admin','member','manager','warehouse','accountant','system_admin'])
  )
);

DROP POLICY IF EXISTS tenant_insert ON public.products;
CREATE POLICY tenant_insert ON public.products
FOR INSERT TO authenticated
WITH CHECK (
  company_id = (SELECT public.current_company_id())
  AND EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = (SELECT public.current_company_id())
      AND cm.user_id = (SELECT auth.uid())
      AND cm.is_active = true
      AND cm.role = ANY (ARRAY['admin','member','manager','warehouse','accountant','system_admin'])
  )
);

DROP POLICY IF EXISTS tenant_update ON public.products;
CREATE POLICY tenant_update ON public.products
FOR UPDATE TO authenticated
USING (
  company_id = (SELECT public.current_company_id())
  AND EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = (SELECT public.current_company_id())
      AND cm.user_id = (SELECT auth.uid())
      AND cm.is_active = true
      AND cm.role = ANY (ARRAY['admin','member','manager','warehouse','accountant','system_admin'])
  )
)
WITH CHECK (
  company_id = (SELECT public.current_company_id())
  AND EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = (SELECT public.current_company_id())
      AND cm.user_id = (SELECT auth.uid())
      AND cm.is_active = true
      AND cm.role = ANY (ARRAY['admin','member','manager','warehouse','accountant','system_admin'])
  )
);

DROP POLICY IF EXISTS tenant_delete ON public.products;
CREATE POLICY tenant_delete ON public.products
FOR DELETE TO authenticated
USING (
  company_id = (SELECT public.current_company_id())
  AND EXISTS (
    SELECT 1 FROM public.company_memberships cm
    WHERE cm.company_id = (SELECT public.current_company_id())
      AND cm.user_id = (SELECT auth.uid())
      AND cm.is_active = true
      AND cm.role = ANY (ARRAY['admin','member','manager','warehouse','accountant','system_admin'])
  )
);
