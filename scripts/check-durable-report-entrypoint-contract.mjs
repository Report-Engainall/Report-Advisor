import assert from 'node:assert/strict';
import fs from 'node:fs';

const entrypoint = fs.readFileSync('src/lib/report-execution/durable-execution-entrypoint.ts', 'utf8');
const adapter = fs.readFileSync('src/lib/report-execution/durable-worker-adapter.ts', 'utf8');

for (const token of [
  'assertReportExecutionReady',
  'sourceSnapshotId',
  'sourcePath',
  'sourceHash',
  'SupabaseReportExecutionStore',
  '.enqueue({',
]) assert.ok(entrypoint.includes(token), `missing durable entrypoint invariant: ${token}`);

for (const token of [
  "rpc('enqueue_report_execution_job'",
  'p_company_id: tenant',
  'p_job_key: jobKey',
  'p_source_path: sourcePath',
  'p_source_hash: sourceHash',
  'requestIdentity',
]) assert.ok(adapter.includes(token), `missing durable enqueue invariant: ${token}`);

assert.match(entrypoint, /assertReportExecutionReady\([\s\S]*?sourceSnapshotId/);
assert.match(entrypoint, /const jobKey = `\$\{input\.request\.tenantId\}:\$\{input\.request\.idempotencyKey\}:\$\{input\.sourceSnapshotId\}`/);

console.log('Durable report execution entrypoint contract: PASS');
