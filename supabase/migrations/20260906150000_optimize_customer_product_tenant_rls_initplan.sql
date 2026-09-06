-- Optimize tenant RLS predicates for customers/products.
-- Keep the existing authorization semantics while evaluating tenant/user context
-- once per statement instead of once per candidate row.

DROP POLICY IF EXISTS tenant_select ON public.customers;
DROP POLICY IF EXISTS tenant_insert ON public.customers;
DROP POLICY IF EXISTS tenant_update ON public.customers;
DROP POLICY IF EXISTS tenant_delete ON public.customers;

CREATE POLICY tenant_select ON public.customers
  FOR SELECT TO authenticated
  USING (company_id = (SELECT public.current_company_id()));

CREATE POLICY tenant_insert ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = (SELECT public.current_company_id())
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = (SELECT public.current_company_id())
        AND cm.user_id = (SELECT auth.uid())
        AND cm.is_active = true
        AND cm.role = ANY (ARRAY['member','manager','warehouse','accountant','system_admin'])
    )
  );

CREATE POLICY tenant_update ON public.customers
  FOR UPDATE TO authenticated
  USING (
    company_id = (SELECT public.current_company_id())
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = (SELECT public.current_company_id())
        AND cm.user_id = (SELECT auth.uid())
        AND cm.is_active = true
        AND cm.role = ANY (ARRAY['member','manager','warehouse','accountant','system_admin'])
    )
  )
  WITH CHECK (
    company_id = (SELECT public.current_company_id())
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = (SELECT public.current_company_id())
        AND cm.user_id = (SELECT auth.uid())
        AND cm.is_active = true
        AND cm.role = ANY (ARRAY['member','manager','warehouse','accountant','system_admin'])
    )
  );

CREATE POLICY tenant_delete ON public.customers
  FOR DELETE TO authenticated
  USING (
    company_id = (SELECT public.current_company_id())
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = (SELECT public.current_company_id())
        AND cm.user_id = (SELECT auth.uid())
        AND cm.is_active = true
        AND cm.role = ANY (ARRAY['member','manager','warehouse','accountant','system_admin'])
    )
  );

DROP POLICY IF EXISTS tenant_select ON public.products;
DROP POLICY IF EXISTS tenant_insert ON public.products;
DROP POLICY IF EXISTS tenant_update ON public.products;
DROP POLICY IF EXISTS tenant_delete ON public.products;

CREATE POLICY tenant_select ON public.products
  FOR SELECT TO authenticated
  USING (company_id = (SELECT public.current_company_id()));

CREATE POLICY tenant_insert ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = (SELECT public.current_company_id())
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = (SELECT public.current_company_id())
        AND cm.user_id = (SELECT auth.uid())
        AND cm.is_active = true
        AND cm.role = ANY (ARRAY['member','manager','warehouse','accountant','system_admin'])
    )
  );

CREATE POLICY tenant_update ON public.products
  FOR UPDATE TO authenticated
  USING (
    company_id = (SELECT public.current_company_id())
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = (SELECT public.current_company_id())
        AND cm.user_id = (SELECT auth.uid())
        AND cm.is_active = true
        AND cm.role = ANY (ARRAY['member','manager','warehouse','accountant','system_admin'])
    )
  )
  WITH CHECK (
    company_id = (SELECT public.current_company_id())
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = (SELECT public.current_company_id())
        AND cm.user_id = (SELECT auth.uid())
        AND cm.is_active = true
        AND cm.role = ANY (ARRAY['member','manager','warehouse','accountant','system_admin'])
    )
  );

CREATE POLICY tenant_delete ON public.products
  FOR DELETE TO authenticated
  USING (
    company_id = (SELECT public.current_company_id())
    AND EXISTS (
      SELECT 1
      FROM public.company_memberships cm
      WHERE cm.company_id = (SELECT public.current_company_id())
        AND cm.user_id = (SELECT auth.uid())
        AND cm.is_active = true
        AND cm.role = ANY (ARRAY['member','manager','warehouse','accountant','system_admin'])
    )
  );
