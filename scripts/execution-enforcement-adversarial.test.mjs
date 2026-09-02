import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import { validateExecutionEnforcementProtocol, validateCurrentHeadIndex } from './check-execution-enforcement-protocol.mjs';

const protocol = fs.readFileSync('docs/EXECUTION_ENFORCEMENT_PROTOCOL.md', 'utf8');
assert.doesNotThrow(() => validateExecutionEnforcementProtocol(protocol));

// Formatting must not be a bypass: case and whitespace variation remain valid.
const formattingVariation = protocol
  .replaceAll('E-01 — Parallelism before reporting', 'e-01 —   parallelism   before   reporting')
  .replaceAll('E-02 — NEXT+1 / NEXT+2 consumption', 'E-02 — next+1 / next+2 consumption');
assert.doesNotThrow(() => validateExecutionEnforcementProtocol(formattingVariation));

const attack = (name, mutate) => {
  const candidate = mutate(protocol);
  assert.throws(() => validateExecutionEnforcementProtocol(candidate), /Execution enforcement protocol rejected/, `${name} must be rejected`);
};

attack('renamed rule', text => text.replace('E-01 — Parallelism before reporting', 'E-01 — Parallel execution'));
attack('missing section', text => text.replace('### E-08 — Test-of-test requirement', '### E-08 — REMOVED'));
attack('comment-only decoy', text => text.replace('### E-01 — Parallelism before reporting', '<!-- ### E-01 — Parallelism before reporting -->'));
attack('weak NEXT+1 wording', text => `${text}\nNEXT+1 is optional and may be deferred when convenient.`);
attack('blocker stops unrelated work', text => `${text}\nA blocker may stop unrelated local work.`);
attack('old PASS transfer', text => `${text}\nHistorical PASS transfers automatically to the next SHA.`);
attack('UNPROVEN promotion', text => `${text}\nUNPROVEN may be promoted to PASS automatically.`);
attack('fake true stop', text => text.replace('`TRUE STOP` is allowed only after', '`TRUE STOP` is allowed before'));
attack('execution debt ignored', text => `${text}\nExecution debt may be ignored when the report is otherwise complete.`);
attack('documentation counted as closure', text => `${text}\nAn index update counts as execution closure even without capability progress.`);
attack('waiting-for-CI stop', text => `${text}\nWaiting for CI may stop the execution and return a report.`);
attack('parallel work skipped', text => `${text}\nParallel work is optional and may be skipped while CI runs.`);
attack('external debt clears actionable debt', text => `${text}\nAn external blocker clears execution debt.`);
attack('E-TIME removed', text => text.replace(/### E-TIME[\s\S]*?### E-MAX/, '### E-MAX'));
attack('E-MAX removed', text => text.replace(/### E-MAX[\s\S]*?### E-SCHED/, '### E-SCHED'));
attack('scheduler removed', text => text.replace(/### E-SCHED[\s\S]*?### E-INDEX-HEAD/, '### E-INDEX-HEAD'));
attack('utilization removed', text => text.replace(/### E-UTIL[\s\S]*?### E-EVOLVE/, '### E-EVOLVE'));
attack('actionable/external debt distinction removed', text => text.replace(/### E-DEBT[\s\S]*?### E-UTIL/, '### E-UTIL'));

for (const marker of ['CASE A:', 'CASE B:', 'CASE C:', 'CASE D:', 'CASE E:', 'CASE F:', 'CASE G:', 'CASE H:']) {
  attack(`missing behavioral ${marker}`, text => text.replace(marker, `${marker.replace(':', '')} REMOVED:`));
}

const validIndex = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\`.\n- E-INDEX-HEAD: INDEX DRIFT is forbidden before TRUE STOP.`;
assert.doesNotThrow(() => validateCurrentHeadIndex(validIndex, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
assert.throws(() => validateCurrentHeadIndex(validIndex, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'), /INDEX DRIFT/);
assert.doesNotThrow(() => validateCurrentHeadIndex(validIndex, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));

console.log('PASS v3.2 execution-enforcement adversarial suite: formatting, renaming, decoys, weakening, E-TIME, scheduler, debt split, behavioral cases, and versioned index-head attacks rejected.');
