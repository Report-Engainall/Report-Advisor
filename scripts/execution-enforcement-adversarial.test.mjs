import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import { validateExecutionEnforcementProtocol } from './check-execution-enforcement-protocol.mjs';

const protocol = fs.readFileSync('docs/EXECUTION_ENFORCEMENT_PROTOCOL.md', 'utf8');

assert.doesNotThrow(() => validateExecutionEnforcementProtocol(protocol));

// Formatting must not be a bypass: case and whitespace variation remain valid.
const formattingVariation = protocol
  .replaceAll('E-01 — Parallelism before reporting', 'e-01 —   parallelism   before   reporting')
  .replaceAll('E-02 — NEXT+1 / NEXT+2 consumption', 'E-02 — next+1 / next+2 consumption');
assert.doesNotThrow(() => validateExecutionEnforcementProtocol(formattingVariation));

const attack = (name, mutate) => {
  const candidate = mutate(protocol);
  assert.throws(() => validateExecutionEnforcementProtocol(candidate), /Execution enforcement protocol rejected/,
    `${name} must be rejected`);
};

attack('renamed rule', text => text.replace('E-01 — Parallelism before reporting', 'E-01 — Parallel execution'));
attack('missing section', text => text.replace('### E-08 — Test-of-test requirement', '### E-08 — REMOVED'));
attack('comment decoy', text => `${text}\n<!-- E-01 — Parallelism before reporting -->` .replace('If an independent safe executable front exists', 'If an independent safe executable front exists'));
attack('weak NEXT+1 wording', text => `${text}\nNEXT+1 is optional and may be deferred when convenient.`);
attack('blocker stops unrelated work', text => `${text}\nA blocker may stop unrelated local work.`);
attack('old PASS transfer', text => `${text}\nHistorical PASS transfers automatically to the next SHA.`);
attack('UNPROVEN promotion', text => `${text}\nUNPROVEN may be promoted to PASS automatically.`);
attack('fake true stop', text => text.replace('`TRUE STOP` is allowed only after', '`TRUE STOP` is allowed before'));
attack('execution debt ignored', text => `${text}\nExecution debt may be ignored when the report is otherwise complete.`);
attack('documentation counted as closure', text => `${text}\nAn index update counts as execution closure even without capability progress.`);

// Removing any behavioral case must fail: presence of the rules alone is not enough.
for (const marker of ['CASE A:', 'CASE B:', 'CASE C:', 'CASE D:', 'CASE E:', 'CASE F:', 'CASE G:', 'CASE H:']) {
  attack(`missing behavioral ${marker}`, text => text.replace(marker, `${marker}REMOVED`));
}

console.log('PASS execution-enforcement adversarial suite: formatting, renaming, decoys, weakening, behavioral-case and true-stop attacks rejected.');
