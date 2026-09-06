-- Align the durable worker table's fresh-replay schema with the verified live contract.
-- Historical migration files remain immutable; this forward migration closes drift.

alter table public.report_execution_jobs
  alter column source_path set not null,
  alter column source_hash set not null,
  alter column max_attempts set default 5,
  alter column last_error set not null,
  alter column evidence set not null;

alter table public.report_execution_jobs
  alter column max_attempts set default 5;
