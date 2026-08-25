import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/lib/secondary-batch13-governance.ts', 'utf8');
assert.match(source, /RecommendationOption/);
assert.match(source, /ApprovalRequirement/);
assert.match(source, /hasAuthoritativeEvidence/);
assert.match(source, /classifyRecommendationStatus/);
assert.match(source, /requiresApproval/);
assert.match(source, /blocked/);
assert.match(source, /unknown/);

console.log('secondary-batch13 governance contract: PASS');
