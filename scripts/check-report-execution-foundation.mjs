import { readFileSync } from 'node:fs';
const files = {
  'src/lib/report-execution/report-execution-contract.ts': ['ReportExecutionRequest','ReportExecutionEvidence','assertExecutionRequest'],
  'src/lib/report-execution/idempotency.ts': ['IdempotencyRegistry','fingerprintRequest','tenantId'],
  'src/lib/report-execution/execution-gate.ts': ['assertReportExecutionReady','assertNoQuarantine','assertGovernedRoute'],
  'src/lib/report-execution/durable-worker-adapter.ts': ['leaseToken','p_company_id','p_lease_token','Worker tenant context does not match the durable job tenant'],
  'supabase/migrations/20260906200000_bind_report_execution_worker_tenant_context.sql': ['p_company_id uuid','drop function if exists public.claim_report_execution_job(uuid,text,integer)','grant execute on function public.claim_report_execution_job(uuid,uuid,text,integer) to service_role','revoke all on function public.claim_report_execution_job(uuid,uuid,text,integer) from public,anon,authenticated'],
};
for (const [path, tokens] of Object.entries(files)) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const token of tokens) if (!source.includes(token)) throw new Error(`Report execution foundation missing ${token} in ${path}`);
}
console.log('Report execution foundation contract: PASS');
