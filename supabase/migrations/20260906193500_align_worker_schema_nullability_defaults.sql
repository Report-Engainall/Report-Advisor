-- Align the durable worker table's fresh-replay schema with the verified live contract.
-- Historical migration files remain immutable; this forward migration closes drift.

-- Do not silently destroy provenance. Any pre-existing row without authoritative
-- source metadata blocks the schema hardening and must be quarantined/reconciled
-- by an operator before this migration can proceed.
do $$
declare invalid_rows integer;
begin
  select count(*) into invalid_rows
    from public.report_execution_jobs
   where source_path is null
      or source_hash is null;
  if invalid_rows > 0 then
    raise exception 'Cannot harden report_execution_jobs: % row(s) have null source_path/source_hash and require provenance reconciliation first', invalid_rows;
  end if;
end;
$$;

alter table public.report_execution_jobs
  alter column source_path set not null,
  alter column source_hash set not null,
  alter column max_attempts set default 5,
  alter column last_error set not null,
  alter column evidence set not null;
