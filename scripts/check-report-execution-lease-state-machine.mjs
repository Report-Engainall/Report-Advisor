import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260906200000_bind_report_execution_worker_tenant_context.sql'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'src/lib/report-execution/durable-worker-adapter.ts'), 'utf8');

const required = [
  ['claim admits queued/expired leased/processing jobs only', /status in \('queued','leased','processing'\)/],
  ['claim increments attempt', /attempt=attempt\+1/],
  ['claim creates lease token', /lease_token=gen_random_uuid\(\)/],
  ['heartbeat requires matching owner', /lease_owner=p_worker_id/],
  ['heartbeat requires matching token', /lease_token=p_lease_token/],
  ['checkpoint locks the selected job', /for update/],
  ['checkpoint requires sequential stage', /new_pos<>old_pos\+1/],
  ['completion requires rendered checkpoint', /checkpoint->>'stage'='rendered'/],
  ['failure dead-letters exhausted attempts', /attempt>=max_attempts then 'dead_letter'/],
  ['retry requires failed state and budget', /status='failed' and attempt<max_attempts/],
  ['adapter clears no lease client-side', /p_lease_token:\s*job\.leaseToken/],
];

for (const [name, pattern] of required) {
  const source = name.startsWith('adapter') ? adapter : migration;
  if (!pattern.test(source)) throw new Error(`lease-state-machine regression: ${name}`);
}

console.log('Report execution lease/state-machine contract: PASS');
console.log(`Assertions: ${required.length} PASS`);
