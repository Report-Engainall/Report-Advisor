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

for (const [name, candidate] of mustReject) {
  assert.throws(() => validateExecutionEnforcementProtocol(candidate), name);
}

const indexBoundaryError = /INDEX (?:DRIFT|BOUNDARY NOT ANCESTOR)/;

const validIndex = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\`.\n- E-INDEX-HEAD: INDEX DRIFT is forbidden before TRUE STOP.`;
assert.equal(validateCurrentHeadIndex(validIndex, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), true);
assert.throws(() => validateCurrentHeadIndex(validIndex, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'), indexBoundaryError);

const boldCandidateIndex = `## CURRENT EXECUTION BOUNDARY\n- **CURRENT CODE/TEST CANDIDATE:** \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\`.`;
assert.equal(validateCurrentHeadIndex(boldCandidateIndex, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), true);

const currentHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const parentHead = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim();

const indexOnlyBoundary = `## CURRENT PROJECT STATE\n- Current repository index boundary head: \`${parentHead}\`.\n- Current code/test candidate: \`${parentHead}\`.`;
assert.equal(validateCurrentHeadIndex(indexOnlyBoundary, currentHead, parentHead, ['docs/MASTER_EXECUTION_INDEX.md']), true);
assert.throws(() => validateCurrentHeadIndex(indexOnlyBoundary, currentHead, parentHead, ['docs/MASTER_EXECUTION_INDEX.md', 'src/app.tsx']), indexBoundaryError);

const enforcementOnlyBoundary = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`${parentHead}\`.`;
assert.equal(validateCurrentHeadIndex(enforcementOnlyBoundary, currentHead, parentHead, ['scripts/check-execution-enforcement-protocol.mjs', 'scripts/check-execution-enforcement-protocol.test.mjs']), true);
assert.throws(() => validateCurrentHeadIndex(enforcementOnlyBoundary, currentHead, parentHead, ['scripts/check-execution-enforcement-protocol.mjs', 'src/app.tsx']), indexBoundaryError);

console.log('PASS v3.6 enforcement adversarial test-of-test (real ancestry for governed special boundaries)');
