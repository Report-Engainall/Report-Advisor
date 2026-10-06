create table if not exists public.report_intelligence_calculations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  report_execution_job_id uuid not null references public.report_execution_jobs(id) on delete cascade,
  source_hash text not null,
  evidence_snapshot_id uuid references public.report_evidence_snapshots(id) on delete set null,
  evidence_passport_id uuid references public.report_evidence_passports(id) on delete set null,
  archetype_id text not null,
  profile_version integer not null,
  metric_id text not null,
  name text not null,
  formula text not null,
  availability_state text not null check (availability_state in ('CALCULATED','NOT_AVAILABLE','INSUFFICIENT_SAMPLE','REVIEW_REQUIRED')),
  value numeric,
  unit text,
  sample_size integer not null default 0 check (sample_size >= 0),
  usable_sample integer not null default 0 check (usable_sample >= 0 and usable_sample <= sample_size),
  source_fields jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  confidence numeric not null default 0 check (confidence >= 0 and confidence <= 1),
  limitation text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_intelligence_calculations_unique_lineage
    unique (company_id, report_execution_job_id, source_hash, archetype_id, profile_version, metric_id)
);

create index if not exists report_intelligence_calculations_job_idx
  on public.report_intelligence_calculations (company_id, report_execution_job_id, source_hash);

create index if not exists report_intelligence_calculations_metric_idx
  on public.report_intelligence_calculations (company_id, archetype_id, metric_id);

alter table public.report_intelligence_calculations enable row level security;

drop policy if exists report_intelligence_calculations_select on public.report_intelligence_calculations;
create policy report_intelligence_calculations_select
  on public.report_intelligence_calculations for select to authenticated
  using (company_id = current_company_id());

drop policy if exists report_intelligence_calculations_insert on public.report_intelligence_calculations;
create policy report_intelligence_calculations_insert
  on public.report_intelligence_calculations for insert to authenticated
  with check (company_id = current_company_id());

drop policy if exists report_intelligence_calculations_update on public.report_intelligence_calculations;
create policy report_intelligence_calculations_update
  on public.report_intelligence_calculations for update to authenticated
  using (company_id = current_company_id())
  with check (company_id = current_company_id());

grant select, insert, update on public.report_intelligence_calculations to authenticated;
