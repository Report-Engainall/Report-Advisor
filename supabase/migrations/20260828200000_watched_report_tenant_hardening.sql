-- Tenant hardening: watched-folder RPC must prove the folder belongs to the
-- authoritative tenant before a SECURITY DEFINER write is allowed.
create or replace function public.record_watched_report_file(
  p_folder_id uuid,
  p_relative_path text,
  p_content_hash text,
  p_size_bytes bigint,
  p_modified_at timestamptz,
  p_state text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid := public.current_company_id();
  v_id uuid;
begin
  if v_company_id is null then
    raise exception 'TENANT_CONTEXT_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.watched_report_folders f
    where f.id = p_folder_id
      and f.company_id = v_company_id
  ) then
    raise exception 'TENANT_CONTEXT_MISMATCH';
  end if;

  if p_state not in ('new','changed','unchanged','processing','processed','failed','dead_letter','deleted') then
    raise exception 'INVALID_WATCHED_FILE_STATE';
  end if;

  insert into public.watched_report_files(
    company_id, folder_id, relative_path, content_hash,
    size_bytes, modified_at, state
  )
  values (
    v_company_id, p_folder_id, p_relative_path, p_content_hash,
    p_size_bytes, p_modified_at, p_state
  )
  on conflict(company_id,folder_id,relative_path) do update set
    content_hash=excluded.content_hash,
    size_bytes=excluded.size_bytes,
    modified_at=excluded.modified_at,
    state=excluded.state,
    source_version=watched_report_files.source_version+1,
    updated_at=now();

  select id into v_id
  from public.watched_report_files
  where company_id=v_company_id
    and folder_id=p_folder_id
    and relative_path=p_relative_path;

  return v_id;
end;
$$;

alter function public.record_watched_report_file(uuid,text,text,bigint,timestamptz,text) set search_path = public;
revoke all on function public.record_watched_report_file(uuid,text,text,bigint,timestamptz,text) from anon;
grant execute on function public.record_watched_report_file(uuid,text,text,bigint,timestamptz,text) to authenticated;
