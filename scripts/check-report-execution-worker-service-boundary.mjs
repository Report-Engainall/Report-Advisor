import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260918041200_report_execution_worker_service_only.sql');
const sql = fs.readFileSync(migrationPath, 'utf8').replace(/\r\n/g, '\n');
const compact = sql.replace(/,\s+/g, ',');

const workers = [
  ['enqueue_report_execution_job', 'uuid,text,text,text,text[],integer'],
  ['claim_report_execution_job', 'uuid,uuid,text,integer'],
  ['heartbeat_report_execution_job', 'uuid,uuid,text,uuid,integer'],
  ['advance_report_execution_checkpoint', 'uuid,uuid,text,uuid,jsonb'],
  ['complete_report_execution_job', 'uuid,uuid,text,uuid,jsonb'],
  ['fail_report_execution_job', 'uuid,uuid,text,uuid,jsonb'],
];

for (const [name, args] of workers) {
  const signature = `public.${name}(${args})`;
  assert.match(compact, new RegExp(`REVOKE\\s+ALL\\s+ON\\s+FUNCTION\\s+${signature.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s+FROM\\s+PUBLIC,anon,authenticated\\s*;`, 'i'), `missing authenticated revoke for ${signature}`);
  assert.match(compact, new RegExp(`GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+${signature.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s+TO\\s+service_role\\s*;`, 'i'), `missing service_role grant for ${signature}`);
}

assert.doesNotMatch(sql, /retry_report_execution_job/i, 'retry_report_execution_job is intentionally outside this service-only migration');
assert.match(sql, /REPORT_EXECUTION_WORKER_AUTHENTICATED_EXECUTE_REMAINS/);
assert.match(sql, /REPORT_EXECUTION_WORKER_SERVICE_ROLE_EXECUTE_MISSING/);

console.log('Report execution worker service-only boundary: PASS');