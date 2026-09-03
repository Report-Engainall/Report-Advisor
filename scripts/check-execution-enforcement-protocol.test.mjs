import assert from 'node:assert/strict';
import fs from 'node:fs';
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
  assert.throws(() => validateExecutionEnforcementProtocol(candidate), undefined, name);
}

const validIndex = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\`.\n- E-INDEX-HEAD: INDEX DRIFT is forbidden before TRUE STOP.`;
assert.equal(validateCurrentHeadIndex(validIndex, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), true);
assert.throws(() => validateCurrentHeadIndex(validIndex, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'), /INDEX DRIFT/);

const indexOnlyBoundary = `## CURRENT PROJECT STATE\n- Current repository index boundary head: \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\`.\n- Current code/test candidate: \`bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\`.`;
assert.equal(
  validateCurrentHeadIndex(
    indexOnlyBoundary,
    'cccccccccccccccccccccccccccccccccccccccc',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ['docs/MASTER_EXECUTION_INDEX.md'],
  ),
  true,
);
assert.throws(
  () => validateCurrentHeadIndex(
    indexOnlyBoundary,
    'cccccccccccccccccccccccccccccccccccccccc',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ['docs/MASTER_EXECUTION_INDEX.md', 'src/app.tsx'],
  ),
  /INDEX DRIFT/,
);

const enforcementOnlyBoundary = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\`.`;
assert.equal(
  validateCurrentHeadIndex(
    enforcementOnlyBoundary,
    'cccccccccccccccccccccccccccccccccccccccc',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ['scripts/check-execution-enforcement-protocol.mjs', 'scripts/check-execution-enforcement-protocol.test.mjs'],
  ),
  true,
);
assert.throws(
  () => validateCurrentHeadIndex(
    enforcementOnlyBoundary,
    'cccccccccccccccccccccccccccccccccccccccc',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ['scripts/check-execution-enforcement-protocol.mjs', 'src/app.tsx'],
  ),
  /INDEX DRIFT/,
);

console.log('PASS v3.4 enforcement adversarial test-of-test');
