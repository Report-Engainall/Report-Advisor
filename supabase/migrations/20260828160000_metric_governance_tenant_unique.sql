-- Governance versions are unique per tenant, not globally.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname='metric_governance_metric_id_version_key' AND conrelid='public.metric_governance'::regclass) THEN
    ALTER TABLE public.metric_governance DROP CONSTRAINT metric_governance_metric_id_version_key;
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS uq_metric_governance_company_metric_version ON public.metric_governance(company_id, metric_id, version);
