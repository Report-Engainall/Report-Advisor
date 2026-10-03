-- Refresh legacy source-intelligence recommendation provenance without weakening evidence gates.
-- The repair is allowed only when the recommendation already belongs to the same
-- company/decision and its stored evidence identifies the exact same report job/hash.
create or replace function public.refresh_source_intelligence_recommendation_evidence(
  p_recommendation_id uuid,
  p_report_job_id uuid,
  p_source_hash text,
  p_evidence_snapshot_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $function$
declare
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_recommendation public.recommendations%rowtype;
  v_evidence jsonb;
begin
  if v_company is null or v_user is null then
    raise exception 'TENANT_CONTEXT_REQUIRED';
  end if;

  if p_recommendation_id is null
     or p_report_job_id is null
     or nullif(btrim(coalesce(p_source_hash, '')), '') is null
     or p_evidence_snapshot_id is null then
    raise exception 'SOURCE_PROVENANCE_REPAIR_INPUT_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.report_evidence_passports p
    where p.company_id = v_company
      and p.report_execution_job_id = p_report_job_id
      and p.source_hash = p_source_hash
      and p.evidence_snapshot_id = p_evidence_snapshot_id
      and p.verification_status = 'VERIFIED'
      and p.decision_readiness = 'READY'
  ) then
    raise exception 'SOURCE_PROVENANCE_REPAIR_EVIDENCE_REQUIRED';
  end if;

  select *
    into v_recommendation
    from public.recommendations r
    where r.id = p_recommendation_id
      and r.company_id = v_company
    for update;

  if v_recommendation.id is null then
    raise exception 'SOURCE_RECOMMENDATION_NOT_FOUND';
  end if;

  if v_recommendation.evidence_snapshot_id = p_evidence_snapshot_id then
    return;
  end if;

  v_evidence := coalesce(v_recommendation.evidence, '{}'::jsonb);

  if coalesce(v_evidence ->> 'reportExecutionJobId', '') <> p_report_job_id::text
     or coalesce(v_evidence ->> 'sourceHash', '') <> p_source_hash then
    raise exception 'SOURCE_PROVENANCE_REPAIR_IDENTITY_MISMATCH';
  end if;

  update public.recommendations
     set evidence_snapshot_id = p_evidence_snapshot_id,
         evidence = v_evidence
           || jsonb_build_object(
                'evidenceSnapshotId', p_evidence_snapshot_id,
                'evidencePassportRefresh', jsonb_build_object(
                  'refreshedAt', now(),
                  'reportExecutionJobId', p_report_job_id,
                  'sourceHash', p_source_hash,
                  'reason', 'CURRENT_VERIFIED_PASSPORT'
                )
              )
   where id = v_recommendation.id
     and company_id = v_company;
end;
$function$;

revoke all on function public.refresh_source_intelligence_recommendation_evidence(uuid,uuid,text,uuid) from public, anon;
grant execute on function public.refresh_source_intelligence_recommendation_evidence(uuid,uuid,text,uuid) to authenticated;
