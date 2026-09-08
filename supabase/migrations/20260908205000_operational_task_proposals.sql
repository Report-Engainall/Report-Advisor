CREATE TABLE IF NOT EXISTS public.operational_task_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('manager','employee','sales','warehouse','accountant','purchasing')),
  horizon text NOT NULL CHECK (horizon IN ('today','tomorrow')),
  priority text NOT NULL CHECK (priority IN ('critical','high','medium','low')),
  title text NOT NULL,
  reason text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('recommendation','alert','forecast','kpi')),
  source_id uuid,
  expected_outcome text NOT NULL,
  evidence_required jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','dismissed','converted')),
  converted_work_item_id uuid REFERENCES public.decision_work_items(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS operational_task_proposals_company_horizon_idx ON public.operational_task_proposals(company_id,horizon,priority,created_at DESC);
CREATE INDEX IF NOT EXISTS operational_task_proposals_source_idx ON public.operational_task_proposals(company_id,source_type,source_id);
ALTER TABLE public.operational_task_proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS operational_task_proposals_select ON public.operational_task_proposals;
DROP POLICY IF EXISTS operational_task_proposals_insert ON public.operational_task_proposals;
DROP POLICY IF EXISTS operational_task_proposals_update ON public.operational_task_proposals;
CREATE POLICY operational_task_proposals_select ON public.operational_task_proposals FOR SELECT TO authenticated USING ((SELECT public.current_company_id())=company_id);
CREATE POLICY operational_task_proposals_insert ON public.operational_task_proposals FOR INSERT TO authenticated WITH CHECK ((SELECT public.current_company_id())=company_id);
CREATE POLICY operational_task_proposals_update ON public.operational_task_proposals FOR UPDATE TO authenticated USING ((SELECT public.current_company_id())=company_id) WITH CHECK ((SELECT public.current_company_id())=company_id);
REVOKE ALL ON public.operational_task_proposals FROM anon;
GRANT SELECT,INSERT,UPDATE ON public.operational_task_proposals TO authenticated;
