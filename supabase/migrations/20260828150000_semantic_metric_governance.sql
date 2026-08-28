-- W2.1 Semantic Metric Layer: persistent governance snapshots.
-- BUSINESS_METRICS in the application remains the calculation-definition SSOT.

CREATE TABLE IF NOT EXISTS public.metric_governance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  metric_id text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  name text NOT NULL,
  definition text NOT NULL,
  formula text NOT NULL,
  source jsonb NOT NULL DEFAULT '[]'::jsonb,
  dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  filters jsonb NOT NULL DEFAULT '[]'::jsonb,
  time_semantics jsonb NOT NULL DEFAULT '{}'::jsonb,
  freshness jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner text NOT NULL,
  certification_status text NOT NULL DEFAULT 'DRAFT' CHECK (certification_status IN ('DRAFT','REVIEWED','CERTIFIED','DEPRECATED')),
  dependencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  consumers jsonb NOT NULL DEFAULT '[]'::jsonb,
  tests jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deprecated_at timestamptz NULL,
  UNIQUE(metric_id, version)
);
CREATE INDEX IF NOT EXISTS idx_metric_governance_metric_version ON public.metric_governance(metric_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_metric_governance_status ON public.metric_governance(certification_status);

CREATE TABLE IF NOT EXISTS public.metric_governance_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_governance_id uuid NOT NULL REFERENCES public.metric_governance(id) ON DELETE CASCADE,
  company_id uuid NOT NULL,
  metric_id text NOT NULL,
  from_status text,
  to_status text NOT NULL,
  actor_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  previous_version integer NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_metric_governance_audit_metric ON public.metric_governance_audit(metric_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metric_governance_audit_governance_id ON public.metric_governance_audit(metric_governance_id);
CREATE INDEX IF NOT EXISTS idx_metric_governance_audit_actor_id ON public.metric_governance_audit(actor_id);

ALTER TABLE public.metric_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_governance_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.metric_governance FROM anon;
REVOKE ALL ON public.metric_governance_audit FROM anon;
GRANT SELECT ON public.metric_governance TO authenticated;
GRANT SELECT ON public.metric_governance_audit TO authenticated;
DROP POLICY IF EXISTS metric_governance_authenticated_read ON public.metric_governance;
CREATE POLICY metric_governance_authenticated_tenant_read ON public.metric_governance FOR SELECT TO authenticated USING (company_id = public.current_company_id());
DROP POLICY IF EXISTS metric_governance_audit_authenticated_read ON public.metric_governance_audit;
CREATE POLICY metric_governance_audit_authenticated_tenant_read ON public.metric_governance_audit FOR SELECT TO authenticated USING (company_id = public.current_company_id());

CREATE SCHEMA IF NOT EXISTS private;
CREATE OR REPLACE FUNCTION private.metric_governance_transition(p_metric_id text,p_version integer,p_to_status text,p_reason text)
RETURNS public.metric_governance LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_company uuid := public.current_company_id(); v_row public.metric_governance; v_from_status text; v_previous_version integer;
BEGIN
  IF auth.uid() IS NULL OR v_company IS NULL THEN RAISE EXCEPTION 'authenticated tenant actor required'; END IF;
  IF p_to_status NOT IN ('DRAFT','REVIEWED','CERTIFIED','DEPRECATED') THEN RAISE EXCEPTION 'invalid certification status'; END IF;
  IF NULLIF(trim(p_reason), '') IS NULL THEN RAISE EXCEPTION 'transition reason required'; END IF;
  SELECT * INTO v_row FROM public.metric_governance WHERE company_id=v_company AND metric_id=p_metric_id AND version=p_version FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'metric version not found: % v%',p_metric_id,p_version; END IF;
  v_from_status := v_row.certification_status;
  IF v_from_status='CERTIFIED' AND p_to_status NOT IN ('CERTIFIED','DEPRECATED') THEN RAISE EXCEPTION 'certified metric may only remain certified or be deprecated'; END IF;
  IF v_from_status='DEPRECATED' AND p_to_status <> 'DEPRECATED' THEN RAISE EXCEPTION 'deprecated metric cannot be reactivated'; END IF;
  IF v_from_status='DRAFT' AND p_to_status NOT IN ('DRAFT','REVIEWED') THEN RAISE EXCEPTION 'draft metric must be reviewed before certification'; END IF;
  IF v_from_status='REVIEWED' AND p_to_status NOT IN ('REVIEWED','CERTIFIED','DEPRECATED') THEN RAISE EXCEPTION 'reviewed metric has an invalid transition'; END IF;
  SELECT max(version) INTO v_previous_version FROM public.metric_governance WHERE company_id=v_company AND metric_id=p_metric_id AND version<p_version;
  UPDATE public.metric_governance SET certification_status=p_to_status, deprecated_at=CASE WHEN p_to_status='DEPRECATED' THEN now() ELSE deprecated_at END, updated_at=now() WHERE id=v_row.id RETURNING * INTO v_row;
  INSERT INTO public.metric_governance_audit(metric_governance_id,company_id,metric_id,from_status,to_status,actor_id,reason,previous_version) VALUES(v_row.id,v_company,v_row.metric_id,v_from_status,p_to_status,auth.uid(),p_reason,v_previous_version);
  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION private.metric_governance_transition(text,integer,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.metric_governance_transition(text,integer,text,text) FROM anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.metric_governance_transition(text,integer,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.metric_governance_guard_certified_update()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
  IF OLD.certification_status='CERTIFIED' THEN
    IF NEW.metric_id<>OLD.metric_id OR NEW.version<>OLD.version OR NEW.name<>OLD.name OR NEW.definition<>OLD.definition OR NEW.formula<>OLD.formula OR NEW.source<>OLD.source OR NEW.dimensions<>OLD.dimensions OR NEW.filters<>OLD.filters OR NEW.time_semantics<>OLD.time_semantics OR NEW.freshness<>OLD.freshness OR NEW.owner<>OLD.owner OR NEW.dependencies<>OLD.dependencies OR NEW.consumers<>OLD.consumers OR NEW.tests<>OLD.tests OR NEW.evidence<>OLD.evidence THEN RAISE EXCEPTION 'certified metric version is immutable; create a new version'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS metric_governance_guard_certified_update ON public.metric_governance;
CREATE TRIGGER metric_governance_guard_certified_update BEFORE UPDATE ON public.metric_governance FOR EACH ROW EXECUTE FUNCTION public.metric_governance_guard_certified_update();
CREATE OR REPLACE FUNCTION public.metric_governance_touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS metric_governance_touch_updated_at ON public.metric_governance;
CREATE TRIGGER metric_governance_touch_updated_at BEFORE UPDATE ON public.metric_governance FOR EACH ROW EXECUTE FUNCTION public.metric_governance_touch_updated_at();
COMMENT ON TABLE public.metric_governance IS 'Versioned semantic metric governance snapshots; BUSINESS_METRICS remains calculation SSOT.';
COMMENT ON TABLE public.metric_governance_audit IS 'Immutable certification lifecycle audit trail for semantic metrics.';
