import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql', 'utf8');

const functions = [
  'heartbeat_report_execution_job(uuid, text, integer)',
  'advance_report_execution_checkpoint(uuid, text, jsonb)',
  'complete_report_execution_job(uuid, text, jsonb)',
  'fail_report_execution_job(uuid, text, jsonb)',
  'retry_report_execution_job(uuid)',
];

for (const signature of functions) {
  const escaped = signature.replace(/[()]/g, '\\$&');
  const grant = new RegExp(`grant execute on function public\\.${escaped} to service_role`);
  const revoke = new RegExp(`revoke all on function public\\.${escaped} from public, anon`);
  if (!grant.test(migration)) throw new Error(`missing service_role execute grant: ${signature}`);
  if (!revoke.test(migration)) throw new Error(`missing public/anon revoke: ${signature}`);
}

console.log(`PASS: ${functions.length}/${functions.length} lifecycle RPC grants are fail-closed`);
