import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateExecutionEnforcementProtocol, validateCurrentHeadIndex } from './check-execution-enforcement-protocol.mjs';

const protocol = fs.readFileSync('docs/EXECUTION_ENFORCEMENT_PROTOCOL.md', 'utf8');
assert.equal(validateExecutionEnforcementProtocol(protocol), true);

const commentDecoy = protocol.replace(
  /### E-TIME[\s\S]*?### E-MAX/,
  '<!-- E-TIME — Waiting-Time Parallelization -->\n\n### E-MAX',
);
const mustReject = [
  ['comment decoy', commentDecoy],
  ['missing E-TIME', protocol.replace(/### E-TIME[\s\S]*?### E-MAX/, '### E-MAX')],
  ['waiting bypass', `${protocol}\nwaiting for CI may stop and report`],
  ['optional NEXT+1', `${protocol}\nNEXT+1 is optional`],
  ['ignored debt', `${protocol}\nexecution debt may be ignored`],
  ['index closure decoy', `${protocol}\nindex update counts as execution closure`],
];

for (const [name, candidate] of mustReject) assert.throws(() => validateExecutionEnforcementProtocol(candidate), undefined, name);

const currentHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const parentHead = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim();
const governanceOnlyFiles = [
  'docs/MASTER_EXECUTION_INDEX.md',
  'ONE-PROGRAMMER-SESSION-MEMORY.md',
  'docs/MASTER_PRODUCT_REFERENCE.md',
  'scripts/check-execution-enforcement-protocol.mjs',
  'scripts/check-execution-enforcement-protocol.test.mjs',
];

const validIndex = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`${currentHead}\`.\n- E-INDEX-HEAD: INDEX DRIFT is forbidden before TRUE STOP.`;
assert.equal(validateCurrentHeadIndex(validIndex, currentHead), true);
assert.throws(() => validateCurrentHeadIndex(validIndex, parentHead), /(INDEX DRIFT|INDEX BOUNDARY NOT ANCESTOR)/);

const underscoreCandidateIndex = `## CURRENT EXECUTION BOUNDARY\n- CURRENT_CODE_TEST_CANDIDATE: \`${currentHead}\`.`;
assert.equal(validateCurrentHeadIndex(underscoreCandidateIndex, currentHead), true);

const boldCandidateIndex = `## CURRENT EXECUTION BOUNDARY\n- **CURRENT CODE/TEST CANDIDATE:** \`${currentHead}\`.`;
assert.equal(validateCurrentHeadIndex(boldCandidateIndex, currentHead), true);

const indexOnlyBoundary = `## CURRENT PROJECT STATE\n- Current repository index boundary head: \`${parentHead}\`.\n- Current code/test candidate: \`${parentHead}\`.`;
assert.equal(validateCurrentHeadIndex(indexOnlyBoundary, currentHead, parentHead, governanceOnlyFiles), true);
assert.throws(
  () => validateCurrentHeadIndex(indexOnlyBoundary, currentHead, parentHead, [...governanceOnlyFiles, 'src/app.tsx']),
  /(INDEX DRIFT|INDEX BOUNDARY NOT ANCESTOR)/,
);

const enforcementOnlyBoundary = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`${parentHead}\`.`;
assert.equal(validateCurrentHeadIndex(enforcementOnlyBoundary, currentHead, parentHead), true);
assert.throws(
  () => validateCurrentHeadIndex(enforcementOnlyBoundary, currentHead, parentHead, [...governanceOnlyFiles, 'src/app.tsx']),
  /(INDEX DRIFT|INDEX BOUNDARY NOT ANCESTOR)/,
);

console.log('PASS v3.6 enforcement adversarial test-of-test (real git ancestry + governance-only boundary)');
