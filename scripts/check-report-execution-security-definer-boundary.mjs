import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const workerPath = 'supabase/migrations/20260906200000_bind_report_execution_worker_tenant_context.sql';
const recoveryPath = 'supabase/migrations/20260906201000_bind_report_execution_recovery_tenant_context.sql';
const migrations = [workerPath, recoveryPath];

const worker = fs.readFileSync(path.join(root, workerPath), 'utf8');

const expectedWorkerFunctions = [
  'claim_report_execution_job',
  'heartbeat_report_execution_job',
  'advance_report_execution_checkpoint',
  'complete_report_execution_job',
  'fail_report_execution_job',
  'retry_report_execution_job',
];

for (const relative of migrations) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const functions = [...source.matchAll(/create or replace function public\.([a-z0-9_]+)\(([^)]*)\)[\s\S]*?returns[\s\S]*?language plpgsql security definer set search_path to 'pg_catalog' as \$function\$/g)];
  if (!functions.length) throw new Error(`security-definer boundary: no hardened function found in ${relative}`);
  for (const [, name, args] of functions) {
    if (!args.includes('p_company_id uuid')) throw new Error(`security-definer boundary: ${name} lacks explicit tenant parameter`);
    const bodyStart = source.indexOf('$function$', source.indexOf(`function public.${name}`));
    const bodyEnd = source.indexOf('$function$', bodyStart + 10);
    const body = source.slice(bodyStart, bodyEnd);
    if (!/company_id\s*=\s*p_company_id/.test(body)) throw new Error(`security-definer boundary: ${name} lacks company predicate`);
  }
}

for (const name of expectedWorkerFunctions) {
  if (!new RegExp(`create or replace function public\\.${name}\\(`).test(worker)) {
    throw new Error(`security-definer boundary: missing canonical worker function ${name}`);
  }
}

const lifecycleContracts = [
  ['claim increments attempt', /attempt=attempt\+1/],
  ['claim generates a fresh lease token', /lease_token=gen_random_uuid\(\)/],
  ['heartbeat fences by owner and token', /lease_owner=p_worker_id and lease_token=p_lease_token/],
  ['checkpoint is row-locked before transition', /for update/],
  ['checkpoint source hash is immutable', /old_hash<>new_hash/],
  ['checkpoint transitions are exactly one stage forward', /new_pos<>old_pos\+1/],
  ['completion is tenant and lease fenced', /company_id=p_company_id[\s\S]*lease_owner=p_worker_id[\s\S]*lease_token=p_lease_token/],
  ['completion requires rendered checkpoint', /checkpoint->>'stage'='rendered'/],
  ['failure converges exhausted attempts to dead_letter', /attempt>=max_attempts then 'dead_letter'/],
  ['retry remains tenant scoped and budget bounded', /company_id=p_company_id[\s\S]*status='failed' and attempt<max_attempts/],
];
for (const [name, pattern] of lifecycleContracts) {
  if (!pattern.test(worker)) throw new Error(`security-definer lifecycle boundary: ${name}`);
}

const forbiddenLegacyCalls = [
  'claim_report_execution_job(uuid,text,integer)',
  'heartbeat_report_execution_job(uuid,text,uuid,integer)',
  'advance_report_execution_checkpoint(uuid,text,uuid,jsonb)',
  'complete_report_execution_job(uuid,text,uuid,jsonb)',
  'fail_report_execution_job(uuid,text,uuid,jsonb)',
  'retry_report_execution_job(uuid)',
];
for (const signature of forbiddenLegacyCalls) {
  if (!worker.includes(`drop function if exists public.${signature};`)) {
    throw new Error(`security-definer boundary: legacy signature not explicitly removed: ${signature}`);
  }
}

for (const name of expectedWorkerFunctions) {
  if (!new RegExp(`revoke all on function public\\.${name}\\(`).test(worker)) {
    throw new Error(`security-definer boundary: ${name} is not explicitly revoked from end-user roles`);
  }
  if (!new RegExp(`grant execute on function public\\.${name}\\(`).test(worker)) {
    throw new Error(`security-definer boundary: ${name} lacks explicit service_role grant`);
  }
}

console.log('Report execution SECURITY DEFINER boundary: PASS');
console.log(`Audited migrations: ${migrations.length}`);
console.log(`Worker lifecycle functions: ${expectedWorkerFunctions.length}`);
console.log(`Lifecycle assertions: ${lifecycleContracts.length} PASS`);
console.log(`Legacy signatures fenced: ${forbiddenLegacyCalls.length}`);
