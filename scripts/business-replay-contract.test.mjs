import assert from 'node:assert/strict';
import fs from 'node:fs';

const lib = fs.readFileSync('src/lib/business-replay.ts', 'utf8');
const page = fs.readFileSync('src/pages/BusinessReplayPage.tsx', 'utf8');
assert.ok(lib.includes('reportExecutionJobId'));
assert.ok(lib.includes('recommendation_outcomes'));
assert.ok(page.includes('BUSINESS REPLAY'));
assert.ok(page.includes('SOURCE-BOUND TIMELINE'));
console.log('BUSINESS_REPLAY_CONTRACT_PASS');
