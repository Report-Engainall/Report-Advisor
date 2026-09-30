create or replace function public.rehydrate_legacy_import_job(
  p_company_id uuid,
  p_file_record_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_catalog
as $function$
declare
  v_file public.file_records%rowtype;
  v_latest public.import_jobs%rowtype;
  v_job_id uuid;
begin
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED';
  end if;

  select * into v_file
  from public.file_records
  where id = p_file_record_id
    and company_id = p_company_id
  for update;

  if not found then
    raise exception 'FILE_RECORD_NOT_FOUND_OR_FORBIDDEN';
  end if;

  if not exists (
    select 1
    from public.file_records fr
    where fr.id = v_file.id
      and coalesce(fr.metadata->>'storage_path','') like p_company_id::text || '/imports/%'
  ) then
    raise exception 'LEGACY_SOURCE_STORAGE_BINDING_INVALID';
  end if;

  select * into v_latest
  from public.import_jobs
  where file_record_id = v_file.id
    and company_id = p_company_id
  order by created_at desc
  limit 1;

  if found and v_latest.status in ('queued','processing') and coalesce(v_latest.result_summary->>'source_record_pending_hash','false') <> 'true' then
    return v_latest.id;
  end if;

  insert into public.import_jobs(
    company_id,
    file_record_id,
    job_type,
    processing_mode,
    status,
    total_rows,
    processed_rows,
    valid_rows,
    invalid_rows,
    quarantined_rows,
    duplicate_rows,
    progress,
    started_at,
    source_fingerprint,
    result_summary
  )
  values(
    p_company_id,
    v_file.id,
    coalesce(nullif(btrim(v_latest.job_type),''), 'import'),
    'rehydration',
    'processing',
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    now(),
    null,
    jsonb_build_object(
      'file_name', v_file.file_name,
      'source_storage_bucket', coalesce(v_file.metadata->>'storage_bucket','documents'),
      'source_storage_path', v_file.metadata->>'storage_path',
      'rehydrated_from_import_job_id', v_latest.id,
      'legacy_rehydration', true
    )
  )
  returning id into v_job_id;

  return v_job_id;
end;
$function$;

revoke all on function public.rehydrate_legacy_import_job(uuid, uuid) from public;
grant execute on function public.rehydrate_legacy_import_job(uuid, uuid) to service_role;
