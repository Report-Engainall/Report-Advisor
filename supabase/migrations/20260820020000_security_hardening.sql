-- Security hardening: prevent self-service privilege escalation and cross-tenant membership injection.
-- Membership is an authorization primitive; users must not be able to choose arbitrary companies/roles.

-- Direct membership creation is disabled for normal authenticated clients.
DROP POLICY IF EXISTS tenant_memberships_insert ON tenant_memberships;
CREATE POLICY tenant_memberships_insert ON tenant_memberships
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- A member may read only their own memberships. Role/company changes are owner/admin operations.
DROP POLICY IF EXISTS tenant_memberships_update ON tenant_memberships;
CREATE POLICY tenant_memberships_update ON tenant_memberships
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS tenant_memberships_delete ON tenant_memberships;
CREATE POLICY tenant_memberships_delete ON tenant_memberships
  FOR DELETE TO authenticated
  USING (false);

-- Company creation happens only through create_tenant(), which atomically creates the owner membership.
DROP POLICY IF EXISTS tenant_insert_companies ON companies;
CREATE POLICY tenant_insert_companies ON companies
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- Explicit, auditable owner operation for inviting a user to an existing tenant.
CREATE OR REPLACE FUNCTION public.invite_tenant_member(
  p_company_id uuid,
  p_user_id uuid,
  p_role text DEFAULT 'member'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE membership_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF NOT public.has_company_access(p_company_id) THEN RAISE EXCEPTION 'company access denied'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = auth.uid() AND company_id = p_company_id
      AND status = 'active' AND role IN ('owner','admin')
  ) THEN RAISE EXCEPTION 'owner or admin privileges required'; END IF;
  IF p_role NOT IN ('member','admin') THEN RAISE EXCEPTION 'invalid role'; END IF;

  INSERT INTO public.tenant_memberships(user_id, company_id, role, status)
  VALUES (p_user_id, p_company_id, p_role, 'active')
  ON CONFLICT (user_id, company_id)
  DO UPDATE SET role = EXCLUDED.role, status = 'active'
  RETURNING id INTO membership_id;
  RETURN membership_id;
END;
$$;
REVOKE ALL ON FUNCTION public.invite_tenant_member(uuid,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invite_tenant_member(uuid,uuid,text) TO authenticated;

-- Owner/admin management of an existing membership without allowing tenant changes.
CREATE OR REPLACE FUNCTION public.set_tenant_member_status(
  p_membership_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE target_company uuid;
BEGIN
  IF p_status NOT IN ('active','suspended','invited') THEN RAISE EXCEPTION 'invalid status'; END IF;
  SELECT company_id INTO target_company FROM public.tenant_memberships WHERE id = p_membership_id;
  IF target_company IS NULL OR NOT public.has_company_access(target_company) THEN RAISE EXCEPTION 'company access denied'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = auth.uid() AND company_id = target_company
      AND status = 'active' AND role IN ('owner','admin')
  ) THEN RAISE EXCEPTION 'owner or admin privileges required'; END IF;
  UPDATE public.tenant_memberships SET status = p_status WHERE id = p_membership_id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.set_tenant_member_status(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_tenant_member_status(uuid,text) TO authenticated;

COMMENT ON TABLE tenant_memberships IS 'Security boundary: memberships cannot be self-created, self-promoted, moved between tenants, or deleted by normal clients.';
