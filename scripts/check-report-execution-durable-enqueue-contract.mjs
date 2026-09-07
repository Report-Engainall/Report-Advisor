import { readFileSync, existsSync } from 'node:fs';

const migration = 'supabase/migrations/20260907001015_add_report_execution_durable_enqueue_20260907.sql';
const adapter = 'src/lib/report-execution/durable-worker-adapter.ts';
if (!existsSync(migration) || !existsSync(adapter)) throw new Error('Durable enqueue contract files are missing');

const sql = readFileSync(migration, 'utf8');
const source = readFileSync(adapter, 'utf8');

const required = (value, tokens, label) => {
  for (const token of tokens) if (!value.includes(token)) throw new Error(`${label} missing ${token}`);
};

required(sql, [
  'create or replace function public.enqueue_report_execution_job',
  'p_company_id uuid',
  'p_job_key text',
  'p_source_path text',
  'p_source_hash text',
  'on conflict (company_id, job_key) do nothing',
  'Durable job key already exists with different source identity',
  'revoke all on function public.enqueue_report_execution_job',
  'grant execute on function public.enqueue_report_execution_job',
  "to service_role",
], 'Durable enqueue migration');

required(source, [
  'export interface DurableEnqueueInput',
  'async enqueue(input: DurableEnqueueInput)',
  "rpc('enqueue_report_execution_job'",
  'p_company_id: tenant',
  'p_job_key: jobKey',
  'p_source_path: sourcePath',
  'p_source_hash: sourceHash',
], 'Durable enqueue adapter');

// Test-of-test: removing the conflict identity guard must be rejected.
const tampered = sql.replace("if existing.source_hash <> btrim(p_source_hash) or existing.source_path <> btrim(p_source_path) then\n      raise exception 'Durable job key already exists with different source identity';\n    end if;", '');
if (tampered.includes('Durable job key already exists with different source identity')) throw new Error('Test-of-test could not remove source identity guard');

console.log('Durable report enqueue contract: PASS');
