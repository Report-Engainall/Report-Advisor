import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validateExecutionEnforcementProtocol, validateCurrentHeadIndex, validateControlSignalProtocols } from './check-execution-enforcement-protocol.mjs';

const protocol = fs.readFileSync('docs/EXECUTION_ENFORCEMENT_PROTOCOL.md', 'utf8');
assert.equal(validateControlSignalProtocols(), true);
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
  'scripts/check-execution-enforcement-protocol.mjs',
  'scripts/check-execution-enforcement-protocol.test.mjs',
];

const validIndex = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`${currentHead}\`.\n- E-INDEX-HEAD: INDEX DRIFT is forbidden before TRUE STOP.`;
assert.equal(validateCurrentHeadIndex(validIndex, currentHead), true);
assert.throws(() => validateCurrentHeadIndex(validIndex, parentHead), /(INDEX DRIFT|INDEX BOUNDARY NOT ANCESTOR)/);

const boldCandidateIndex = `## CURRENT EXECUTION BOUNDARY\n- **CURRENT CODE/TEST CANDIDATE:** \`${currentHead}\`.`;
assert.equal(validateCurrentHeadIndex(boldCandidateIndex, currentHead), true);

const indexOnlyBoundary = `## CURRENT PROJECT STATE\n- Current repository index boundary head: \`${parentHead}\`.\n- Current code/test candidate: \`${parentHead}\`.`;
assert.equal(validateCurrentHeadIndex(indexOnlyBoundary, currentHead, parentHead, ['docs/MASTER_EXECUTION_INDEX.md']), true);
assert.throws(
  () => validateCurrentHeadIndex(indexOnlyBoundary, currentHead, parentHead, ['docs/MASTER_EXECUTION_INDEX.md', 'src/app.tsx']),
  /(INDEX DRIFT|INDEX BOUNDARY NOT ANCESTOR)/,
);

const enforcementOnlyBoundary = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`${parentHead}\`.`;
assert.equal(validateCurrentHeadIndex(enforcementOnlyBoundary, currentHead, parentHead), true);
assert.throws(
  () => validateCurrentHeadIndex(enforcementOnlyBoundary, currentHead, parentHead, [...governanceOnlyFiles, 'src/app.tsx']),
  /(INDEX DRIFT|INDEX BOUNDARY NOT ANCESTOR)/,
);

console.log('PASS v3.6 enforcement adversarial test-of-test (real git ancestry + governance-only boundary)');


const controlSignal = fs.readFileSync('docs/AUTONOMOUS_CONTROL_SIGNAL_PROTOCOL.md', 'utf8');
const leadProtocol = fs.readFileSync('docs/AI_ENGINEERING_LEAD_PROTOCOL.md', 'utf8');
const programmerProtocol = fs.readFileSync('docs/PROGRAMMER_AUTONOMOUS_OPERATING_PROTOCOL.md', 'utf8');

const invalidLeadProtocol = leadProtocol.replace(
  /## 23\. Self-Execution Gate[\s\S]*?## 24\. Leadership Cycle Contract/,
  '## 24. Leadership Cycle Contract',
);
assert.notEqual(invalidLeadProtocol, leadProtocol);
assert.throws(
  () => validateControlSignalProtocols({
    'docs/AI_ENGINEERING_LEAD_PROTOCOL.md': invalidLeadProtocol,
  }),
  /Control signal protocol rejected/,
  'validator must reject a lead protocol with the non-idle section removed',
);

const invalidProgrammerProtocol = programmerProtocol.replace(
  /## 25\. Non-Idle Execution Gate[\s\S]*$/,
  '',
);
assert.notEqual(invalidProgrammerProtocol, programmerProtocol);
assert.throws(
  () => validateControlSignalProtocols({
    'docs/PROGRAMMER_AUTONOMOUS_OPERATING_PROTOCOL.md': invalidProgrammerProtocol,
  }),
  /Control signal protocol rejected/,
  'validator must reject a programmer protocol with the non-idle section removed',
);

assert.match(controlSignal, /Operator Non-Idle Invariant/i);
assert.match(leadProtocol, /Queue-is-not-a-stop rule/i);
assert.match(programmerProtocol, /Non-Idle Execution Gate/i);

console.log('PASS autonomous control-signal non-idle protocol guard');
