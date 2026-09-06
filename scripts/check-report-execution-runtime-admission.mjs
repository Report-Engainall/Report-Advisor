import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const runner = fs.readFileSync(path.join(root, 'src/lib/report-execution/durable-production-runner.ts'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'src/lib/report-execution/durable-worker-adapter.ts'), 'utf8');

const requiredRunnerContracts = [
  ['claim is tenant-bound at admission', /store\.claim\(input\.jobId,\s*input\.workerId,\s*leaseSeconds,\s*input\.request\.tenantId\)/],
  ['tenant mismatch is rejected after claim', /job\.tenantId\s*!==\s*input\.request\.tenantId/],
  ['source hash is immutable during resume', /job\.checkpoint\.sourceHash\s*&&\s*job\.checkpoint\.sourceHash\s*!==\s*input\.sourceHash/],
  ['heartbeat is scheduled below lease duration', /heartbeatIntervalMs\s*=\s*Math\.max\(5_000,\s*Math\.floor\(\(leaseSeconds \* 1000\) \/ 3\)\)/],
  ['heartbeat failure aborts progression', /if\s*\(heartbeatFailure\)\s*throw heartbeatFailure/],
  ['checkpoint persistence is lease-fenced', /store\.saveCheckpoint\(input\.jobId,\s*checkpoint\(following\),\s*input\.workerId,\s*input\.request\.tenantId\)/],
  ['completion is tenant-bound', /store\.complete\(input\.jobId,\s*input\.workerId,[\s\S]*?input\.request\.tenantId\)/],
  ['failure is tenant-bound', /store\.fail\(input\.jobId,\s*input\.workerId,[\s\S]*?input\.request\.tenantId\)/],
  ['retry is tenant-bound', /store\.retry\(input\.jobId,\s*input\.request\.tenantId\)/],
  ['heartbeat timer is cleared', /if\s*\(heartbeatTimer\)\s*clearInterval\(heartbeatTimer\)/],
];

for (const [name, pattern] of requiredRunnerContracts) {
  if (!pattern.test(runner)) throw new Error(`runtime admission regression: ${name}`);
}

const requiredAdapterContracts = [
  ['heartbeat checks tenant before RPC', /if\s*\(job\.tenantId\s*!==\s*tenant\)\s*throw new Error\('Worker tenant context does not match the durable job tenant'\)/],
  ['checkpoint requires worker identity', /if\s*\(!workerId\)\s*throw new Error\('Checkpoint persistence requires the active worker lease owner'\)/],
  ['checkpoint requires lease token', /if\s*\(!job\.leaseToken\)\s*throw new Error\('Worker lease token is missing'\)/],
  ['request identity requires tenant', /if\s*\(!request\.tenantId \|\| !request\.idempotencyKey\)/],
  ['request identity includes tenant and idempotency', /return `\$\{request\.tenantId\}:\$\{request\.idempotencyKey\}/],
];

for (const [name, pattern] of requiredAdapterContracts) {
  if (!pattern.test(adapter)) throw new Error(`adapter admission regression: ${name}`);
}

console.log('Report execution runtime admission contract: PASS');
console.log(`Runner contracts: ${requiredRunnerContracts.length} PASS`);
console.log(`Adapter contracts: ${requiredAdapterContracts.length} PASS`);
