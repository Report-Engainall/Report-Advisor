-- Tenant-scoped trial and entitlement state. Billing provider remains replaceable.
CREATE TABLE IF NOT EXISTS tenant_entitlements (
  company_id uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'trial',
  status text NOT NULL DEFAULT 'trialing',
  trial_started_at timestamptz NOT NULL DEFAULT now(),
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  grace_until timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  provider text,
  external_customer_id text,
  external_subscription_id text,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  capabilities jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE tenant_entitlements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS entitlements_select ON tenant_entitlements;
CREATE POLICY entitlements_select ON tenant_entitlements FOR SELECT TO authenticated USING (public.has_company_access(company_id));
DROP POLICY IF EXISTS entitlements_insert ON tenant_entitlements;
CREATE POLICY entitlements_insert ON tenant_entitlements FOR INSERT TO authenticated WITH CHECK (public.has_company_access(company_id));
DROP POLICY IF EXISTS entitlements_update ON tenant_entitlements;
CREATE POLICY entitlements_update ON tenant_entitlements FOR UPDATE TO authenticated USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id));

CREATE OR REPLACE FUNCTION public.start_trial(p_company_id uuid, p_days integer DEFAULT 14)
RETURNS tenant_entitlements LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result tenant_entitlements; days integer := greatest(7, least(p_days, 14));
BEGIN
  IF NOT public.has_company_access(p_company_id) THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO tenant_entitlements(company_id, plan, status, trial_started_at, trial_ends_at)
  VALUES (p_company_id, 'trial', 'trialing', now(), now() + make_interval(days => days))
  ON CONFLICT (company_id) DO NOTHING;
  SELECT * INTO result FROM tenant_entitlements WHERE company_id = p_company_id;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.start_trial(uuid,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_trial(uuid,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.refresh_trial_status(p_company_id uuid)
RETURNS tenant_entitlements LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result tenant_entitlements;
BEGIN
  IF NOT public.has_company_access(p_company_id) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE tenant_entitlements SET status = CASE WHEN plan = 'trial' AND trial_ends_at <= now() THEN 'expired' ELSE status END, updated_at = now() WHERE company_id = p_company_id;
  SELECT * INTO result FROM tenant_entitlements WHERE company_id = p_company_id;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.refresh_trial_status(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_trial_status(uuid) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_entitlements_status ON tenant_entitlements(status, trial_ends_at);
