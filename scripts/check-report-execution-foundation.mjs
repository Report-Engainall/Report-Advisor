import { readFileSync } from 'node:fs';
const files = {
  'src/lib/report-execution/report-execution-contract.ts': ['ReportExecutionRequest','ReportExecutionEvidence','assertExecutionRequest'],
  'src/lib/report-execution/idempotency.ts': ['IdempotencyRegistry','fingerprintRequest','tenantId'],
  'src/lib/report-execution/execution-gate.ts': ['assertReportExecutionReady','assertNoQuarantine','assertGovernedRoute'],
  'src/lib/report-execution/durable-worker-adapter.ts': ['leaseToken','p_company_id','p_lease_token','typeof data !== \'object\'','Durable worker claim did not return a fencing lease token'],
  'supabase/migrations/20260906200000_bind_report_execution_worker_tenant_context.sql': ['p_company_id uuid','drop function if exists public.claim_report_execution_job(uuid,text,integer)','grant execute on function public.claim_report_execution_job(uuid,uuid,text,integer) to service_role','revoke all on function public.claim_report_execution_job(uuid,uuid,text,integer) from public,anon,authenticated'],
  'supabase/migrations/20260906201000_bind_report_execution_recovery_tenant_context.sql': ['recover_expired_report_execution_jobs(p_company_id uuid, p_limit integer default 100)','company_id = p_company_id','grant execute on function public.recover_expired_report_execution_jobs(uuid, integer) to service_role','drop function if exists public.recover_expired_report_execution_jobs(integer)'],
  'supabase/migrations/20260907000000_harden_report_execution_claim_token.sql': ['returns jsonb','lease_expired_max_attempts','return claimed_row','grant execute on function public.claim_report_execution_job(uuid,uuid,text,integer) to service_role'],
};
for (const [path, tokens] of Object.entries(files)) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const token of tokens) if (!source.includes(token)) throw new Error(`Report execution foundation missing ${token} in ${path}`);
}
console.log('Report execution foundation contract: PASS');

const canonical = readFileSync(new URL('../src/lib/report-execution/durable-worker-adapter.ts', import.meta.url), 'utf8');
if (!canonical.includes('leaseToken')) throw new Error('Lease fencing contract missing');
if (!canonical.includes('p_company_id')) throw new Error('Explicit tenant contract missing');
if (!canonical.includes('lease_token === data')) throw new Error('Atomic claim token must be consumed from the claim RPC result');
console.log('Report execution foundation: tenant + lease fencing + atomic claim token verified');
