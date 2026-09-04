-- Import lifecycle truth hardening.
-- Never silently clamp invalid counters or allow a completed job before all rows are processed.

create or replace function public.import_update_job_progress(
  p_job_id uuid,
  p_processed_rows integer,
  p_valid_rows integer,
  p_invalid_rows integer,
  p_duplicate_rows integer,
  p_status text
) returns void
language plpgsql
set search_path='public'
as $function$
declare
  v_company_id uuid:=public.current_company_id();
  v_total integer;
  v_existing_processed integer;
  v_existing_valid integer;
  v_existing_invalid integer;
  v_existing_duplicate integer;
  v_current_status text;
  v_processed integer;
  v_valid integer;
  v_invalid integer;
  v_duplicate integer;
  v_status text:=coalesce(nullif(trim(p_status),''),'processing');
begin
  if v_company_id is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if v_status not in ('queued','processing') then raise exception 'IMPORT_NON_TERMINAL_STATUS_REQUIRED'; end if;
  if p_processed_rows is null or p_processed_rows<0
     or p_valid_rows is null or p_valid_rows<0
     or p_invalid_rows is null or p_invalid_rows<0
     or p_duplicate_rows is null or p_duplicate_rows<0 then
    raise exception 'IMPORT_PROGRESS_COUNTER_INVALID';
  end if;

  select total_rows,processed_rows,valid_rows,invalid_rows,duplicate_rows,status
    into v_total,v_existing_processed,v_existing_valid,v_existing_invalid,v_existing_duplicate,v_current_status
    from public.import_jobs where id=p_job_id and company_id=v_company_id for update;
  if not found then raise exception 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_current_status in ('completed','partial','failed','cancelled') then raise exception 'IMPORT_JOB_ALREADY_TERMINAL'; end if;
  if v_current_status not in ('queued','processing') then raise exception 'IMPORT_JOB_STATE_INVALID'; end if;

  if p_processed_rows>coalesce(v_total,0)
     or p_valid_rows>p_processed_rows
     or p_invalid_rows>p_processed_rows
     or p_duplicate_rows>p_processed_rows then
    raise exception 'IMPORT_PROGRESS_COUNTER_OUT_OF_RANGE';
  end if;

  v_processed:=greatest(coalesce(v_existing_processed,0),p_processed_rows);
  v_valid:=greatest(coalesce(v_existing_valid,0),p_valid_rows);
  v_invalid:=greatest(coalesce(v_existing_invalid,0),p_invalid_rows);
  v_duplicate:=greatest(coalesce(v_existing_duplicate,0),p_duplicate_rows);
  if v_valid>v_processed or v_invalid>v_processed or v_duplicate>v_processed then
    raise exception 'IMPORT_PROGRESS_COUNTER_INCONSISTENT';
  end if;

  update public.import_jobs
     set status=v_status,
         processed_rows=v_processed,
         valid_rows=v_valid,
         invalid_rows=v_invalid,
         duplicate_rows=v_duplicate,
         progress=case when coalesce(v_total,0)>0 then least(100,greatest(0,round(v_processed::numeric/v_total::numeric*100)::integer)) else 0 end,
         started_at=coalesce(started_at,now())
   where id=p_job_id and company_id=v_company_id and status in ('queued','processing');
  if not found then raise exception 'IMPORT_JOB_STATE_CHANGED'; end if;
end;
$function$;

create or replace function public.import_finish_job(
  p_job_id uuid,
  p_status text,
  p_result_summary jsonb default '{}'::jsonb,
  p_error_message text default null
) returns void
language plpgsql
set search_path='public'
as $function$
declare
  v_company_id uuid:=public.current_company_id();
  v_job_company_id uuid;
  v_current_status text;
  v_total integer;
  v_processed integer;
begin
  if v_company_id is null then raise exception 'TENANT_CONTEXT_REQUIRED'; end if;
  if p_status not in ('completed','partial','failed','cancelled') then raise exception 'IMPORT_TERMINAL_STATUS_REQUIRED'; end if;

  select company_id,status,total_rows,processed_rows
    into v_job_company_id,v_current_status,v_total,v_processed
    from public.import_jobs where id=p_job_id for update;
  if not found or v_job_company_id is distinct from v_company_id then raise exception 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_current_status in ('completed','partial','failed','cancelled') then raise exception 'IMPORT_JOB_ALREADY_TERMINAL'; end if;

  if p_status='completed' and coalesce(v_processed,0)<>coalesce(v_total,0) then
    raise exception 'IMPORT_COMPLETION_REQUIRES_ALL_ROWS_PROCESSED';
  end if;

  update public.import_jobs
     set status=p_status,
         progress=case when p_status='completed' then 100 else progress end,
         completed_at=now(),
         duration_ms=case when started_at is null then duration_ms else extract(epoch from(now()-started_at))*1000 end,
         result_summary=coalesce(p_result_summary,'{}'::jsonb),
         error_message=p_error_message
   where id=p_job_id and company_id=v_company_id and status in ('queued','processing');
  if not found then raise exception 'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'; end if;
end;
$function$;
