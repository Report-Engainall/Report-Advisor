-- Harden the legacy recommendation-outcome writer so the terminal outcome
-- cannot bypass the canonical Recommendation -> Decision -> Work -> Outcome chain.
create or replace function public.record_recommendation_outcome(
  p_recommendation_key text,
  p_observed_at timestamptz,
  p_expected_impact numeric default null,
  p_actual_impact numeric default null,
  p_outcome_quality numeric default null,
  p_status text default 'insufficient',
  p_decision_id uuid default null,
  p_evidence jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
declare
  v_company uuid := public.current_company_id();
  v_user uuid := auth.uid();
  v_id uuid;
  v_recommendation_id uuid;
  v_recommendation_decision uuid;
  v_decision_id uuid;
  v_evidence_snapshot_id text := nullif(btrim(coalesce(p_evidence->>'evidence_snapshot_id','')), '');
begin
  if v_company is null or v_user is null then
    raise exception 'TENANT_CONTEXT_REQUIRED';
  end if;
  if p_recommendation_key is null or btrim(p_recommendation_key) = '' or p_observed_at is null then
    raise exception 'OUTCOME_IDENTITY_INCOMPLETE';
  end if;

  -- Resolve the recommendation inside the caller's tenant. When the legacy
  -- path is keyed by a decision_key, resolve the decision directly below.
  select r.id, r.decision_id
    into v_recommendation_id, v_recommendation_decision
  from public.recommendations r
  where r.id::text = p_recommendation_key
    and r.company_id = v_company;

  if v_recommendation_id is null then
    select d.id
      into v_decision_id
    from public.business_intelligence_decisions d
    where d.decision_key = p_recommendation_key
      and d.company_id = v_company;
    if v_decision_id is null then
      raise exception 'OUTCOME_PROVENANCE_NOT_FOUND';
    end if;
  else
    if v_recommendation_decision is not null then
      v_decision_id := v_recommendation_decision;
    end if;
  end if;

  if p_decision_id is not null then
    if not exists (
      select 1
      from public.business_intelligence_decisions d
      where d.id = p_decision_id
        and d.company_id = v_company
    ) then
      raise exception 'DECISION_NOT_FOUND_OR_FORBIDDEN';
    end if;
    if v_decision_id is not null and v_decision_id <> p_decision_id then
      raise exception 'RECOMMENDATION_DECISION_MISMATCH';
    end if;
    v_decision_id := p_decision_id;
  end if;

  if v_decision_id is null then
    raise exception 'DECISION_PROVENANCE_REQUIRED';
  end if;

  -- Terminal outcomes are only legal after the decision has been approved
  -- and an associated work item has actually completed.
  if not exists (
    select 1
    from public.business_intelligence_decisions d
    where d.id = v_decision_id
      and d.company_id = v_company
      and d.status = 'APPROVED'
  ) then
    raise exception 'OUTCOME_DECISION_NOT_APPROVED_OR_FORBIDDEN';
  end if;

  if not exists (
    select 1
    from public.decision_work_items w
    where w.decision_id = v_decision_id
      and w.company_id = v_company
      and w.status = 'COMPLETED'
  ) then
    raise exception 'OUTCOME_WORK_NOT_COMPLETED';
  end if;

  if v_evidence_snapshot_id is null then
    raise exception 'OUTCOME_EVIDENCE_REQUIRED';
  end if;

  if not (
    exists (select 1 from public.kpi_evidence_snapshots s where s.id::text = v_evidence_snapshot_id and s.company_id = v_company)
    or exists (select 1 from public.business_state_snapshots s where s.id::text = v_evidence_snapshot_id and s.company_id = v_company)
    or exists (select 1 from public.import_snapshots s where s.id::text = v_evidence_snapshot_id and s.company_id = v_company)
    or exists (select 1 from public.operational_health_snapshots s where s.id::text = v_evidence_snapshot_id and s.company_id = v_company)
    or exists (select 1 from public.decision_action_receipts r where r.id::text = v_evidence_snapshot_id and r.company_id = v_company and r.status in ('SUCCEEDED','RUNNING'))
  ) then
    raise exception 'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN';
  end if;

  if p_status not in ('positive','negative','neutral','insufficient') then
    raise exception 'INVALID_OUTCOME_STATUS';
  end if;
  if p_status in ('positive','negative','neutral') and (p_expected_impact is null or p_actual_impact is null) then
    raise exception 'OUTCOME_VALUES_REQUIRED_FOR_KNOWN_STATUS';
  end if;
  if p_outcome_quality is not null and (p_outcome_quality < 0 or p_outcome_quality > 1) then
    raise exception 'OUTCOME_QUALITY_OUT_OF_RANGE';
  end if;

  insert into public.recommendation_outcomes(
    company_id, recommendation_key, decision_id, observed_at,
    expected_impact, actual_impact, outcome_quality, status, evidence
  )
  values (
    v_company, p_recommendation_key, v_decision_id, p_observed_at,
    p_expected_impact, p_actual_impact, p_outcome_quality, p_status, coalesce(p_evidence,'{}'::jsonb)
  )
  on conflict(company_id, recommendation_key)
  do update set
    decision_id = excluded.decision_id,
    observed_at = excluded.observed_at,
    expected_impact = excluded.expected_impact,
    actual_impact = excluded.actual_impact,
    outcome_quality = excluded.outcome_quality,
    status = excluded.status,
    evidence = excluded.evidence
  returning id into v_id;

  return v_id;
end;
$function$;

revoke execute on function public.record_recommendation_outcome(text, timestamptz, numeric, numeric, numeric, text, uuid, jsonb) from anon;
grant execute on function public.record_recommendation_outcome(text, timestamptz, numeric, numeric, numeric, text, uuid, jsonb) to authenticated;
