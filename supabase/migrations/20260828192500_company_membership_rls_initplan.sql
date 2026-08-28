-- Avoid per-row auth.uid() evaluation on the canonical membership read policy.
DROP POLICY IF EXISTS company_memberships_select_self ON public.company_memberships;
CREATE POLICY company_memberships_select_self
  ON public.company_memberships
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));
