create or replace function public.import_finish_job(p_job_id uuid, p_status text, p_result_summary jsonb default '{}'::jsonb, p_error_message text default null)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_company_id uuid:=public.current_company_id();
  v_job_company_id uuid;
  v_current_status text;
  v_total integer;
  v_processed integer;
  v_summary jsonb:=coalesce(p_result_summary,'{}'::jsonb);
  v_committed integer;
  v_invalid integer;
  v_valid integer;
begin
  if v_company_id is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if p_status not in ('completed','partial','failed','cancelled') then raise exception 'IMPORT_TERMINAL_STATUS_REQUIRED'; end if;
  select company_id,status,total_rows,processed_rows into v_job_company_id,v_current_status,v_total,v_processed
  from public.import_jobs where id=p_job_id for update;
  if not found or v_job_company_id is distinct from v_company_id then raise exception 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_current_status in ('completed','partial','failed','cancelled') then raise exception 'IMPORT_JOB_ALREADY_TERMINAL'; end if;
  v_committed:=case when jsonb_typeof(v_summary->'committed')='number' then (v_summary->>'committed')::integer else null end;
  v_invalid:=case when jsonb_typeof(v_summary->'invalidRows')='number' then (v_summary->>'invalidRows')::integer else null end;
  if p_status='completed' and v_committed is not null and v_invalid is not null then
    v_valid:=v_committed;
    if v_committed<0 or v_invalid<0 or v_committed+v_invalid<>coalesce(v_total,0) then raise exception 'IMPORT_COMPLETION_SUMMARY_MISMATCH'; end if;
  elsif p_status='completed' then
    if coalesce(v_processed,0)<>coalesce(v_total,0) then raise exception 'IMPORT_COMPLETION_REQUIRES_ALL_ROWS_PROCESSED'; end if;
    v_valid:=null;
  end if;
  update public.import_jobs set status=p_status,
    processed_rows=case when p_status='completed' and v_committed is not null then v_total else processed_rows end,
    valid_rows=case when p_status='completed' and v_valid is not null then v_valid else valid_rows end,
    invalid_rows=case when p_status='completed' and v_invalid is not null then v_invalid else invalid_rows end,
    progress=case when p_status='completed' then 100 else progress end,
    completed_at=now(),
    duration_ms=case when started_at is null then duration_ms else extract(epoch from(now()-started_at))*1000 end,
    result_summary=v_summary,
    error_message=p_error_message
  where id=p_job_id and company_id=v_company_id and status in ('queued','processing');
  if not found then raise exception 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'; end if;
end;
$$;
