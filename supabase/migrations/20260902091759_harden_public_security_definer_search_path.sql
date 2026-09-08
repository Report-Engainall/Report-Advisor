-- Harden SECURITY DEFINER functions against search_path manipulation.
-- Scope: non-production staging certification target only.

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
  SELECT cm.company_id
  FROM public.company_memberships AS cm
  WHERE cm.user_id = auth.uid()
    AND cm.is_active = true
    AND cm.is_default = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.claim_report_execution_job(
  p_job_id uuid,
  p_lease_owner text,
  p_lease_seconds integer DEFAULT 300
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.report_execution_jobs
     SET status='leased',
         lease_owner=p_lease_owner,
         lease_expires_at=now() + make_interval(secs => greatest(p_lease_seconds,30)),
         attempt=attempt+1,
         updated_at=now()
   WHERE id=p_job_id
     AND company_id=public.current_company_id()
     AND status IN ('queued','leased','processing')
     AND (lease_expires_at IS NULL OR lease_expires_at < now())
     AND attempt < max_attempts;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected > 0;
END;
$$;

ALTER FUNCTION public.advance_report_execution_checkpoint(uuid,text,jsonb) SET search_path = pg_catalog;
ALTER FUNCTION public.audit_decision_runtime_change() SET search_path = pg_catalog;
ALTER FUNCTION public.can_certify_autonomous_domain(text) SET search_path = pg_catalog;
ALTER FUNCTION public.can_execute_bi_decision(text) SET search_path = pg_catalog;
ALTER FUNCTION public.can_execute_control_plane_run(text) SET search_path = pg_catalog;
ALTER FUNCTION public.can_release_production_certification(text) SET search_path = pg_catalog;
ALTER FUNCTION public.claim_report_execution_job(uuid,text,integer) SET search_path = pg_catalog;
ALTER FUNCTION public.complete_decision_work_item(uuid,numeric,jsonb) SET search_path = pg_catalog;
ALTER FUNCTION public.complete_report_execution_job(uuid,text,jsonb) SET search_path = pg_catalog;
ALTER FUNCTION public.create_decision_work_item(uuid,uuid,text,uuid,text,text,text,text,timestamptz,numeric,jsonb) SET search_path = pg_catalog;
ALTER FUNCTION public.create_runtime_decision(text,text,numeric,numeric,jsonb) SET search_path = pg_catalog;
ALTER FUNCTION public.create_runtime_recommendation(text,text,text,text,jsonb,numeric,uuid,jsonb) SET search_path = pg_catalog;
ALTER FUNCTION public.current_company_id() SET search_path = pg_catalog;
ALTER FUNCTION public.decide_approval(uuid,boolean,text) SET search_path = pg_catalog;
ALTER FUNCTION public.fail_report_execution_job(uuid,text,jsonb) SET search_path = pg_catalog;
ALTER FUNCTION public.finalize_runtime_decision(uuid) SET search_path = pg_catalog;
ALTER FUNCTION public.heartbeat_report_execution_job(uuid,text,integer) SET search_path = pg_catalog;
ALTER FUNCTION public.is_continuous_trust_healthy(text) SET search_path = pg_catalog;
ALTER FUNCTION public.is_trust_certificate_valid(text) SET search_path = pg_catalog;
ALTER FUNCTION public.link_recommendation_to_decision(uuid,uuid) SET search_path = pg_catalog;
ALTER FUNCTION public.mark_alert_read(uuid) SET search_path = pg_catalog;
ALTER FUNCTION public.notify_decision_work_item(uuid,text,text) SET search_path = pg_catalog;
ALTER FUNCTION public.record_decision_outcome(text,text,text,timestamptz,text,numeric,numeric,numeric,text) SET search_path = pg_catalog;
ALTER FUNCTION public.record_recommendation_outcome(text,timestamptz,numeric,numeric,numeric,text,uuid,jsonb) SET search_path = pg_catalog;
ALTER FUNCTION public.record_watched_report_file(uuid,text,text,bigint,timestamptz,text) SET search_path = pg_catalog;
ALTER FUNCTION public.request_decision_approval(uuid,text) SET search_path = pg_catalog;
ALTER FUNCTION public.retry_report_execution_job(uuid) SET search_path = pg_catalog;
ALTER FUNCTION public.start_decision_work_item(uuid) SET search_path = pg_catalog;
ALTER FUNCTION public.update_recommendation_status(uuid,text) SET search_path = pg_catalog;

REVOKE EXECUTE ON FUNCTION public.enforce_item_reference_same_invoice_company() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_payment_reference_same_company() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_same_company_reference() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_governance_audit_require_tenant() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_governance_guard_certified_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_governance_require_tenant() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.metric_governance_touch_updated_at() FROM PUBLIC, anon, authenticated;
