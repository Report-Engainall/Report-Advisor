import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtimeHarness = fs.readFileSync('scripts/report-execution-runtime.test.ts', 'utf8');

assert.match(runtimeHarness, /InMemoryReportQueue/);
assert.match(runtimeHarness, /SupabaseReportExecutionStore/);
assert.match(runtimeHarness, /durable-production-runner\.ts/);

// This harness is repository-side contract coverage. It must never claim a live
// lifecycle PASS because it does not authenticate against Staging or observe a
// real report_execution_jobs transition.
assert.doesNotMatch(runtimeHarness, /Report execution runtime: PASS \(/);
assert.match(runtimeHarness, /NOT PROVEN|contract|repository/i);

console.log('Report execution truth contract: PASS (repository harness is prevented from masquerading as live runtime evidence)');
