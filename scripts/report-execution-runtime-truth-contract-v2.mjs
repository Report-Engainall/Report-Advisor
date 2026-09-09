import assert from 'node:assert/strict';
import fs from 'node:fs';

const harness = fs.readFileSync('scripts/report-execution-runtime.test.ts', 'utf8');
assert.match(harness, /InMemoryReportQueue/);
assert.match(harness, /SupabaseReportExecutionStore/);
assert.match(harness, /durable-production-runner\.ts/);
assert.match(harness, /Report execution runtime: PASS/);

console.error('FINDING: repository runtime harness contains a PASS label but does not itself prove authenticated live lifecycle evidence. Treat that PASS as contract/harness-only until Staging observes a real durable job transition.');
process.exitCode = 1;
