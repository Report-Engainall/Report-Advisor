import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrations = path.join(root, 'supabase', 'migrations');

const workerFile = path.join(migrations, '20260906200000_bind_report_execution_worker_tenant_context.sql');
const recoveryFile = path.join(migrations, '20260906201000_bind_report_execution_recovery_tenant_context.sql');

for (const file of [workerFile, recoveryFile]) {
  if (!fs.existsSync(file)) throw new Error(`required tenant-bound migration missing: ${path.basename(file)}`);
}

const worker = fs.readFileSync(workerFile, 'utf8');
const recovery = fs.readFileSync(recoveryFile, 'utf8');

const workerContracts = [
  ['claim_report_execution_job', /create\s+or\s+replace\s+function\s+public\.claim_report_execution_job\(p_job_id\s+uuid,p_company_id\s+uuid,p_lease_owner\s+text/i],
  ['heartbeat_report_execution_job', /create\s+or\s+replace\s+function\s+public\.heartbeat_report_execution_job\(p_job_id\s+uuid,p_company_id\s+uuid/i],
  ['advance_report_execution_checkpoint', /create\s+or\s+replace\s+function\s+public\.advance_report_execution_checkpoint\(p_job_id\s+uuid,p_company_id\s+uuid/i],
  ['complete_report_execution_job', /create\s+or\s+replace\s+function\s+public\.complete_report_execution_job\(p_job_id\s+uuid,p_company_id\s+uuid/i],
  ['fail_report_execution_job', /create\s+or\s+replace\s+function\s+public\.fail_report_execution_job\(p_job_id\s+uuid,p_company_id\s+uuid/i],
  ['retry_report_execution_job', /create\s+or\s+replace\s+function\s+public\.retry_report_execution_job\(p_job_id\s+uuid,p_company_id\s+uuid/i],
];

for (const [name, pattern] of workerContracts) {
  if (!pattern.test(worker)) throw new Error(`worker RPC is not explicitly tenant-bound: ${name}`);
}

const requiredCompanyPredicates = [
  'where id=p_job_id and company_id=p_company_id',
  'where id=p_job_id and company_id=p_company_id',
  'where id=p_job_id and company_id=p_company_id',
  'where id=p_job_id and company_id=p_company_id',
  'where id=p_job_id and company_id=p_company_id',
  'where id=p_job_id and company_id=p_company_id',
];
for (const predicate of requiredCompanyPredicates) {
  if (!worker.includes(predicate)) throw new Error(`worker tenant predicate missing: ${predicate}`);
}

if (/current_company_id\s*\(/i.test(worker)) {
  throw new Error('worker tenant isolation regression: current_company_id() remains in service-role worker contract');
}
if (/current_company_id\s*\(/i.test(recovery)) {
  throw new Error('recovery tenant isolation regression: current_company_id() remains in service-role recovery contract');
}

const workerFns = [
  'claim_report_execution_job(uuid,uuid,text,integer)',
  'heartbeat_report_execution_job(uuid,uuid,text,uuid,integer)',
  'advance_report_execution_checkpoint(uuid,uuid,text,uuid,jsonb)',
  'complete_report_execution_job(uuid,uuid,text,uuid,jsonb)',
  'fail_report_execution_job(uuid,uuid,text,uuid,jsonb)',
  'retry_report_execution_job(uuid,uuid)',
];
for (const signature of workerFns) {
  if (!new RegExp(`grant\\s+execute\\s+on\\s+function\\s+public\\.${signature.replace(/[()]/g, '\\$&')}\\s+to\\s+service_role`, 'i').test(worker)) {
    throw new Error(`worker RPC is not service_role-only: ${signature}`);
  }
}

const legacySignatures = [
  'claim_report_execution_job(uuid,text,integer)',
  'heartbeat_report_execution_job(uuid,text,uuid,integer)',
  'advance_report_execution_checkpoint(uuid,text,uuid,jsonb)',
  'complete_report_execution_job(uuid,text,uuid,jsonb)',
  'fail_report_execution_job(uuid,text,uuid,jsonb)',
  'retry_report_execution_job(uuid)',
];
for (const signature of legacySignatures) {
  if (!new RegExp(`drop\\s+function\\s+if\\s+exists\\s+public\\.${signature.replace(/[()]/g, '\\$&')}`, 'i').test(worker)) {
    throw new Error(`legacy worker signature was not explicitly removed: ${signature}`);
  }
}

if (!/create\s+or\s+replace\s+function\s+public\.recover_expired_report_execution_jobs\(p_company_id\s+uuid\s*,\s*p_limit\s+integer/i.test(recovery)) {
  throw new Error('recovery RPC is not explicitly tenant-bound');
}
if (!/company_id\s*=\s*p_company_id/i.test(recovery)) {
  throw new Error('recovery tenant predicate is missing');
}
if (!/grant\s+execute\s+on\s+function\s+public\.recover_expired_report_execution_jobs\(uuid, integer\)\s+to\s+service_role/i.test(recovery)) {
  throw new Error('recovery RPC is not service_role-only');
}
if (!/revoke\s+all\s+on\s+function\s+public\.recover_expired_report_execution_jobs\(uuid, integer\)\s+from\s+public, anon, authenticated/i.test(recovery)) {
  throw new Error('recovery RPC must deny public/anon/authenticated execution');
}

console.log('Report execution tenant-isolation adversarial contract: PASS');
