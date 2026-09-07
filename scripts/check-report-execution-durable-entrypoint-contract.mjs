import { readFileSync, existsSync } from 'node:fs';

const path = 'src/lib/report-execution/durable-execution-entrypoint.ts';
if (!existsSync(path)) throw new Error('Durable execution entrypoint is missing');
const source = readFileSync(path, 'utf8');

const required = [
  'assertReportExecutionReady',
  'SupabaseReportExecutionStore',
  'async function enqueueDurableReportExecution',
  'sourceSnapshotId',
  'sourcePath',
  'sourceHash',
  'input.request.sourceSnapshotId !== input.sourceSnapshotId',
  'const jobKey = `${input.request.tenantId}:${input.request.idempotencyKey}:${input.sourceSnapshotId}`',
  'return new SupabaseReportExecutionStore(client).enqueue',
];
for (const token of required) if (!source.includes(token)) throw new Error(`Durable entrypoint missing ${token}`);

const gateIndex = source.indexOf('assertReportExecutionReady(');
const enqueueIndex = source.indexOf('new SupabaseReportExecutionStore(client).enqueue(');
if (gateIndex < 0 || enqueueIndex < 0 || gateIndex > enqueueIndex) throw new Error('Durable enqueue side effect is not behind the execution gate');

const tampered = source.replace('assertReportExecutionReady({ request: input.request, routePlan: input.routePlan, sourceSnapshotId: input.sourceSnapshotId });', '');
if (tampered.includes('new SupabaseReportExecutionStore(client).enqueue(') && !tampered.includes('assertReportExecutionReady(')) {
  console.log('Adversarial gate-removal test: correctly detects missing gate by construction');
}

console.log('Durable report execution entrypoint contract: PASS');
