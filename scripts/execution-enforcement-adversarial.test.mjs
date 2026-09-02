import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import { validateExecutionEnforcementProtocol, validateAdaptiveGovernance, validateCurrentHeadIndex } from './check-execution-enforcement-protocol.mjs';

const protocol = fs.readFileSync('docs/EXECUTION_ENFORCEMENT_PROTOCOL.md', 'utf8');
const governance = fs.readFileSync('docs/ADAPTIVE_EXECUTION_GOVERNANCE.md', 'utf8');
assert.doesNotThrow(() => validateExecutionEnforcementProtocol(protocol));
assert.doesNotThrow(() => validateAdaptiveGovernance(governance));

const formattingVariation = protocol.replaceAll('E-01 — Parallelism before reporting', 'e-01 —   parallelism   before   reporting').replaceAll('E-02 — NEXT+1 / NEXT+2 consumption', 'E-02 — next+1 / next+2 consumption');
assert.doesNotThrow(() => validateExecutionEnforcementProtocol(formattingVariation));

const attack = (name, mutate) => { const candidate = mutate(protocol); assert.throws(() => validateExecutionEnforcementProtocol(candidate), /Execution enforcement protocol rejected/, `${name} must be rejected`); };
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
attack('compact evidence rule removed', text => text.replace(/### E-16 — Compact Evidence \/ Auditability[\\s\\S]*?### E-17/, '### E-17'));
attack('project identity rule removed', text => text.replace(/### E-17 — Project Identity \/ Old Branding Integrity[\\s\\S]*?### E-18/, '### E-18'));
attack('certification provenance rule removed', text => text.replace(/### E-18 — Certification Configuration Provenance[\\s\\S]*?### E-19/, '### E-19'));
attack('production safety rule removed', text => text.replace(/### E-19 — Production Safety Boundary[\\s\\S]*?### Protocol-first execution order/, '### Protocol-first execution order'));
attack('protocol-first order removed', text => text.replace('### Protocol-first execution order', '### Protocol-order removed'));
attack('external debt clears actionable debt', text => `${text}\nAn external blocker may clear execution debt.`);
attack('E-TIME removed', text => text.replace(/### E-TIME[\s\S]*?### E-MAX/, '### E-MAX'));
attack('E-MAX removed', text => text.replace(/### E-MAX[\s\S]*?### E-SCHED/, '### E-SCHED'));
attack('scheduler removed', text => text.replace(/### E-SCHED[\s\S]*?### E-INDEX-HEAD/, '### E-INDEX-HEAD'));
attack('utilization removed', text => text.replace(/### E-UTIL[\s\S]*?### E-EVOLVE/, '### E-EVOLVE'));
attack('actionable/external debt distinction removed', text => text.replace(/### E-DEBT[\s\S]*?### E-UTIL/, '### E-UTIL'));
for (const marker of ['CASE A:', 'CASE B:', 'CASE C:', 'CASE D:', 'CASE E:', 'CASE F:', 'CASE G:', 'CASE H:']) attack(`missing behavioral ${marker}`, text => text.replace(marker, `${marker.replace(':', '')} REMOVED:`));

const governanceAttack = (name, mutate) => { const candidate = mutate(governance); assert.throws(() => validateAdaptiveGovernance(candidate), /Adaptive governance rejected/, `${name} must be rejected`); };
governanceAttack('missing layer separation', text => text.replaceAll('LAYER 3 — Adaptive Execution Governance', 'LAYER X — Adaptive Execution Governance').replaceAll('LAYER 3 of the execution system', 'LAYER X of the execution system'));
governanceAttack('precedence removed', text => text.replace('P0 — Safety / Security / Evidence Integrity', 'P0 — Convenience'));
governanceAttack('performance ledger removed', text => text.replace('EXECUTION PERFORMANCE LEDGER', 'PERFORMANCE LEDGER REMOVED'));
governanceAttack('under-execution detection removed', text => text.replace('UNDER-EXECUTION EVENT', 'UNDER-EXECUTION REMOVED'));
governanceAttack('low-value detection removed', text => text.replace('LOW-VALUE EXECUTION', 'LOW-VALUE REMOVED'));
governanceAttack('strategy memory removed', text => text.replace('STRATEGY MEMORY', 'STRATEGY STATE'));
governanceAttack('measured-data rule removed', text => text.replace('REAL MEASURED DATA > ESTIMATE > NO CLAIM', 'USE ANY PERCENTAGE'));
governanceAttack('silent evolution', text => text.replace('Protocol changes must never be silently introduced.', 'Protocol changes may be silent.'));
governanceAttack('one-off threshold weakened', text => text.replace('ONE-OFF INCIDENT → RECORD', 'SINGLE INCIDENT → RECORD'));
governanceAttack('precedence weakening', text => text.replace('A lower-priority instruction MUST NOT override a higher-priority safety, truth, evidence, certification, or exact-SHA constraint.', 'A lower-priority instruction may override a higher-priority constraint.'));
governanceAttack('discovery promoted to closure', text => text.replace('an executable fix must be executed and verified before closure is claimed.', 'an executable fix may be reported as closure without execution.'));
governanceAttack('evidence transfer', text => text.replace('evidence from an older SHA MUST NOT be transferred to a newer SHA.', 'evidence from an older SHA may be transferred to a newer SHA.'));
governanceAttack('unproven promoted', text => text.replace('missing runtime/operational proof remains UNPROVEN.', 'missing runtime/operational proof may be treated as PASS.'));
governanceAttack('external blocker local stop', text => text.replace('independent actionable work MUST continue.', 'independent actionable work may stop.'));
governanceAttack('index-only boundary weakened', text => text.replace('every changed path is exactly `docs/MASTER_EXECUTION_INDEX.md`', 'changed paths may include source code'));
governanceAttack('index update as capability closure', text => text.replace('never counts as product capability progress by itself.', 'counts as product capability progress by itself.'));

const exactIndex = `## CURRENT PROJECT STATE\n- Exact code/test head entering this sweep: \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\`.\n- E-INDEX-HEAD: INDEX DRIFT is forbidden before TRUE STOP.`;
assert.doesNotThrow(() => validateCurrentHeadIndex(exactIndex, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
const currentIndex = `## CURRENT PROJECT STATE\n- Current code/test head: \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\`.\n- E-INDEX-HEAD: INDEX DRIFT is forbidden before TRUE STOP.`;
assert.doesNotThrow(() => validateCurrentHeadIndex(currentIndex, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
assert.throws(() => validateCurrentHeadIndex(exactIndex, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'), /INDEX DRIFT/);
assert.throws(() => validateCurrentHeadIndex(exactIndex, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), /INDEX DRIFT/);
assert.doesNotThrow(() => validateCurrentHeadIndex(exactIndex, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', ['docs/MASTER_EXECUTION_INDEX.md']));
assert.throws(() => validateCurrentHeadIndex(exactIndex, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', ['src/app.tsx']), /INDEX DRIFT/);
assert.throws(() => validateCurrentHeadIndex(exactIndex, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', []), /INDEX DRIFT/);

console.log('PASS v4 governance adversarial suite: protocol integrity, layer separation, precedence, performance ledger, under/over-execution, strategy memory, controlled evolution, discovery/evidence truth, canonical index wording, and exact-SHA/index-only boundary attacks rejected.');