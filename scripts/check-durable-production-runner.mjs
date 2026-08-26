import fs from 'node:fs';

const file = 'src/lib/report-execution/durable-production-runner.ts';
if (!fs.existsSync(file)) throw new Error('Durable production runner missing');
const source = fs.readFileSync(file, 'utf8');
for (const token of [
  'store.claim', 'store.saveCheckpoint', 'store.complete', 'store.fail', 'store.retry',
  'runProductionLifecycle', 'sourceHash', 'Tenant mismatch', 'executeStage',
  'heartbeatTimer', 'AggregateError', 'failure/recovery state could not be persisted',
  'MANUAL_RECONCILIATION_REQUIRED', 'AUTO_RETRY_ELIGIBLE', 'recoveryBoundaryStarted',
  'idempotencyKey',
]) {
  if (!source.includes(token)) throw new Error(`Durable runner contract missing: ${token}`);
}

// A stage/commit may have produced an external side effect before checkpoint or completion
// persistence. Automatic replay is unsafe unless execution never crossed that boundary.
if (!/if\s*\(!unsafeReplay\s*&&\s*job\.attempt\s*<\s*job\.maxAttempts\)\s*await\s+store\.retry/.test(source)) {
  throw new Error('Durable runner must not auto-retry after an unsafe replay boundary');
}
if (!/recoveryBoundaryStarted\s*=\s*true/.test(source)) throw new Error('Durable runner must track side-effect boundary start');
if (!/recovery:\s*unsafeReplay\s*\?\s*'MANUAL_RECONCILIATION_REQUIRED'\s*:\s*'AUTO_RETRY_ELIGIBLE'/.test(source)) {
  throw new Error('Durable runner must persist explicit recovery classification');
}

console.log('Durable production runner contract: PASS');
