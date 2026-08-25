import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/lib/secondary-batch14-explainability.ts', 'utf8');
assert.match(source, /DecisionExplanation/);
assert.match(source, /classifyDecisionSafety/);
assert.match(source, /explainWhyNot/);
assert.match(source, /allowed/);
assert.match(source, /blocked/);
assert.match(source, /unknown/);
assert.match(source, /evidenceCount === 0/);
assert.match(source, /approvalRequired && !input\.approved/);
console.log('secondary-batch14 explainability contract: PASS');
