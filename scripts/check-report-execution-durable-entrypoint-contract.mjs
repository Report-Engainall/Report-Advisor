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

function assertContract(value) {
  for (const token of required) {
    if (!value.includes(token)) throw new Error(`Durable entrypoint missing ${token}`);
  }

  const gateIndex = value.indexOf('assertReportExecutionReady(');
  const enqueueIndex = value.indexOf('new SupabaseReportExecutionStore(client).enqueue(');
  if (gateIndex < 0 || enqueueIndex < 0 || gateIndex > enqueueIndex) {
    throw new Error('Durable enqueue side effect is not behind the execution gate');
  }
}

assertContract(source);

// Test-of-test: deleting the actual gate invocation must make the checker fail.
const gateInvocation = 'assertReportExecutionReady({ request: input.request, routePlan: input.routePlan, sourceSnapshotId: input.sourceSnapshotId });';
if (!source.includes(gateInvocation)) throw new Error('Expected canonical gate invocation was not found');
const gateRemoved = source.replace(gateInvocation, '');
let gateRemovalRejected = false;
try {
  assertContract(gateRemoved);
} catch {
  gateRemovalRejected = true;
}
if (!gateRemovalRejected) throw new Error('Test-of-test failed: removal of the execution gate was not detected');

// Test-of-test: moving the gate invocation after the enqueue side effect must fail.
const enqueueStatement = '  return new SupabaseReportExecutionStore(client).enqueue({';
const gateBeforeBody = `${gateInvocation}\n`;
if (!source.includes(enqueueStatement) || !source.includes(gateBeforeBody)) throw new Error('Canonical gate/enqueue ordering markers were not found');
const movedAfterEnqueue = source
  .replace(gateBeforeBody, '')
  .replace(enqueueStatement, `${enqueueStatement}\n${gateBeforeBody}`);
let orderRejected = false;
try {
  assertContract(movedAfterEnqueue);
} catch {
  orderRejected = true;
}
if (!orderRejected) throw new Error('Test-of-test failed: moving the execution gate after enqueue was not detected');

console.log('Durable report execution entrypoint contract: PASS (including gate-removal and gate-order adversarial tests)');
