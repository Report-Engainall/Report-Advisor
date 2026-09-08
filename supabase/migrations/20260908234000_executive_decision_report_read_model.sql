create or replace function public.get_executive_decision_report(p_limit integer default 50)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_company uuid;
  v_limit integer;
  v_rows jsonb;
begin
  v_company := public.current_company_id();
  if v_company is null then raise exception 'TENANT_REQUIRED'; end if;
  v_limit := least(greatest(coalesce(p_limit,50),1),100);
  select coalesce(jsonb_agg(row_data order by created_at desc),'[]'::jsonb) into v_rows
  from (
    select d.created_at,
      jsonb_build_object(
        'decision', jsonb_build_object('id',d.id,'decision_key',d.decision_key,'policy_key',d.policy_key,'decision_type',d.decision_type,'status',d.status,'confidence',d.confidence,'expected_impact',d.expected_impact,'created_at',d.created_at,'executed_at',d.executed_at,'approved_by',d.approved_by,'approved_at',d.approved_at,'rejection_reason',d.rejection_reason,'evidence',d.evidence),
        'recommendation', case when r.id is null then null else jsonb_build_object('id',r.id,'category',r.category,'priority',r.priority,'title',r.title,'description',r.description,'expected_impact',r.expected_impact,'confidence',r.confidence,'status',r.status,'owner',r.owner,'deadline',r.deadline,'impact_result',r.impact_result,'impact_measured_at',r.impact_measured_at,'evidence_snapshot_id',r.evidence_snapshot_id,'metric_versions',r.metric_versions) end,
        'approval', jsonb_build_object('approved_by',d.approved_by,'approved_at',d.approved_at,'status',case when d.approved_at is not null then 'APPROVED' when d.rejection_reason is not null then 'REJECTED' else 'PENDING' end),
        'work_items', coalesce((select jsonb_agg(jsonb_build_object('id',w.id,'department',w.department,'assignee_id',w.assignee_id,'assignee_label',w.assignee_label,'title',w.title,'description',w.description,'priority',w.priority,'status',w.status,'due_at',w.due_at,'started_at',w.started_at,'completed_at',w.completed_at,'evidence_refs',w.evidence_refs,'expected_impact',w.expected_impact,'actual_impact',w.actual_impact,'created_at',w.created_at,'updated_at',w.updated_at) order by w.created_at desc) from decision_work_items w where w.company_id=v_company and w.decision_id=d.id),'[]'::jsonb),
        'decision_outcome', (select jsonb_build_object('id',o.id,'decision_fingerprint',o.decision_fingerprint,'evidence_snapshot_id',o.evidence_snapshot_id,'action_id',o.action_id,'observed_at',o.observed_at,'label',o.label,'actual_value',o.actual_value,'expected_value',o.expected_value,'impact_value',o.impact_value,'notes',o.notes,'observed_by',o.observed_by) from decision_outcomes o where o.company_id=v_company and o.decision_fingerprint=d.id::text order by o.observed_at desc nulls last, o.created_at desc limit 1),
        'recommendation_outcome', (select jsonb_build_object('id',ro.id,'recommendation_key',ro.recommendation_key,'decision_id',ro.decision_id,'observed_at',ro.observed_at,'expected_impact',ro.expected_impact,'actual_impact',ro.actual_impact,'outcome_quality',ro.outcome_quality,'status',ro.status,'evidence',ro.evidence) from recommendation_outcomes ro where ro.company_id=v_company and (ro.decision_id=d.id or (r.id is not null and ro.recommendation_key=r.id::text)) order by ro.observed_at desc nulls last limit 1),
        'learning', (select jsonb_build_object('sample_size',count(*),'correct',count(*) filter(where o.label='correct'),'partial',count(*) filter(where o.label='partial'),'incorrect',count(*) filter(where o.label='incorrect'),'unknown',count(*) filter(where o.label='unknown')) from decision_outcomes o where o.company_id=v_company and o.decision_fingerprint=d.id::text)
      ) as row_data
    from business_intelligence_decisions d
    left join recommendations r on r.company_id=v_company and r.id=d.recommendation_id
    where d.company_id=v_company
    order by d.created_at desc
    limit v_limit
  ) q;
  return jsonb_build_object('generated_at',now(),'limit',v_limit,'count',jsonb_array_length(v_rows),'rows',v_rows);
end;
$$;

revoke all on function public.get_executive_decision_report(integer) from public, anon;
grant execute on function public.get_executive_decision_report(integer) to authenticated;
