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
const tampered = source.replace(gateInvocation, '');
let rejected = false;
try {
  assertContract(tampered);
} catch {
  rejected = true;
}
if (!rejected) throw new Error('Test-of-test failed: removal of the execution gate was not detected');

// Test-of-test: moving the enqueue side effect ahead of the gate must also fail.
const reordered = source.replace(
  `${gateInvocation}\n`,
  '',
).replace(
  '  return new SupabaseReportExecutionStore(client).enqueue({',
  `  ${gateInvocation}\n  return new SupabaseReportExecutionStore(client).enqueue({`,
);
let orderRejected = false;
try {
  assertContract(reordered);
} catch {
  orderRejected = true;
}
if (!orderRejected) throw new Error('Test-of-test failed: enqueue-before-gate reordering was not detected');

console.log('Durable report execution entrypoint contract: PASS (including gate-removal and ordering adversarial tests)');
