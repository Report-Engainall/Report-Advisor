-- Phase K/L runtime closure: all mutations are tenant-scoped and lease-aware.
CREATE OR REPLACE FUNCTION public.advance_report_execution_checkpoint(
  p_job_id uuid, p_worker_id text, p_checkpoint jsonb
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE affected integer;
BEGIN
  UPDATE report_execution_jobs
  SET checkpoint=p_checkpoint, status='processing', updated_at=now()
  WHERE id=p_job_id
    AND company_id=public.current_company_id()
    AND lease_owner=p_worker_id
    AND lease_expires_at > now()
    AND status IN ('leased','processing');
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected=1;
END; $$;
GRANT EXECUTE ON FUNCTION public.advance_report_execution_checkpoint(uuid,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_report_execution_job(
  p_job_id uuid, p_worker_id text, p_evidence jsonb DEFAULT '{}'::jsonb
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE affected integer;
BEGIN
  UPDATE report_execution_jobs
  SET status='completed', evidence=COALESCE(p_evidence,'{}'::jsonb), completed_at=now(), updated_at=now(), lease_owner=null, lease_expires_at=null
  WHERE id=p_job_id AND company_id=public.current_company_id() AND lease_owner=p_worker_id AND lease_expires_at > now()
    AND status IN ('leased','processing');
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected=1;
END; $$;
GRANT EXECUTE ON FUNCTION public.complete_report_execution_job(uuid,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.fail_report_execution_job(
  p_job_id uuid, p_worker_id text, p_error jsonb
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE affected integer;
BEGIN
  UPDATE report_execution_jobs
  SET status=CASE WHEN attempt >= max_attempts THEN 'dead_letter' ELSE 'failed' END,
      last_error=COALESCE(p_error,'{}'::jsonb), updated_at=now(), lease_owner=null, lease_expires_at=null
  WHERE id=p_job_id AND company_id=public.current_company_id() AND lease_owner=p_worker_id
    AND status IN ('leased','processing');
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected=1;
END; $$;
GRANT EXECUTE ON FUNCTION public.fail_report_execution_job(uuid,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_control_plane_health(
  p_snapshot_key text, p_health_score numeric, p_trust_healthy boolean,
  p_critical_drift_count integer DEFAULT 0, p_stale_job_count integer DEFAULT 0,
  p_blocked_decision_count integer DEFAULT 0, p_evidence jsonb DEFAULT '{}'::jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result_id uuid;
BEGIN
  INSERT INTO control_plane_health_snapshots(company_id,snapshot_key,health_score,trust_healthy,critical_drift_count,stale_job_count,blocked_decision_count,evidence)
  VALUES(public.current_company_id(),p_snapshot_key,LEAST(1,GREATEST(0,p_health_score)),p_trust_healthy,GREATEST(0,p_critical_drift_count),GREATEST(0,p_stale_job_count),GREATEST(0,p_blocked_decision_count),COALESCE(p_evidence,'{}'::jsonb))
  ON CONFLICT(company_id,snapshot_key) DO UPDATE SET health_score=EXCLUDED.health_score,trust_healthy=EXCLUDED.trust_healthy,critical_drift_count=EXCLUDED.critical_drift_count,stale_job_count=EXCLUDED.stale_job_count,blocked_decision_count=EXCLUDED.blocked_decision_count,evidence=EXCLUDED.evidence,created_at=now()
  RETURNING id INTO result_id;
  RETURN result_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.record_control_plane_health(text,numeric,boolean,integer,integer,integer,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_executive_evidence_node(
  p_graph_key text, p_node_type text, p_node_key text, p_parent_key text,
  p_weight numeric, p_confidence numeric, p_evidence jsonb DEFAULT '{}'::jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result_id uuid;
BEGIN
  IF p_node_type NOT IN ('source','metric','finding','decision','scenario','outcome','risk','recommendation') THEN RAISE EXCEPTION 'invalid evidence node type'; END IF;
  INSERT INTO executive_evidence_graph(company_id,graph_key,node_type,node_key,parent_key,weight,confidence,evidence)
  VALUES(public.current_company_id(),p_graph_key,p_node_type,p_node_key,p_parent_key,p_weight,LEAST(1,GREATEST(0,p_confidence)),COALESCE(p_evidence,'{}'::jsonb))
  ON CONFLICT(company_id,graph_key,node_type,node_key) DO UPDATE SET parent_key=EXCLUDED.parent_key,weight=EXCLUDED.weight,confidence=EXCLUDED.confidence,evidence=EXCLUDED.evidence,created_at=now()
  RETURNING id INTO result_id;
  RETURN result_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.record_executive_evidence_node(text,text,text,text,numeric,numeric,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.autonomy_runtime_gate(p_domain_key text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  SELECT jsonb_build_object(
    'domain',p_domain_key,
    'eligible',public.can_run_phase_l_autonomy(p_domain_key),
    'health',COALESCE((SELECT health_score FROM control_plane_health_snapshots WHERE company_id=public.current_company_id() ORDER BY created_at DESC LIMIT 1),0),
    'trust_healthy',public.is_continuous_trust_healthy('production'),
    'critical_drift',EXISTS(SELECT 1 FROM control_plane_drift_events d WHERE d.company_id=public.current_company_id() AND d.severity IN ('high','critical') AND d.status IN ('open','blocked'))
  );
$$;
GRANT EXECUTE ON FUNCTION public.autonomy_runtime_gate(text) TO authenticated;
