import assert from 'node:assert/strict';

const phases = ['BACKUP','VERIFY_BACKUP','RESTORE','VERIFY_RESTORE','ROLLBACK','VERIFY_ROLLBACK'];
const evidenceTypes = new Set(['STATIC','CI','SYNTHETIC_RUNTIME','LIVE_SQL','AUTHENTICATED_LIVE','PRODUCTION']);

function validateRun(run) {
  assert.equal(run.phases.length, phases.length);
  phases.forEach((phase, i) => assert.equal(run.phases[i], phase));
  assert(evidenceTypes.has(run.evidence.type));
  assert(/^[0-9a-f]{40}$/.test(run.evidence.sha));
  assert(run.evidence.environment);
}

const syntheticRun = {
  phases,
  evidence: {
    type: 'SYNTHETIC_RUNTIME',
    sha: 'a'.repeat(40),
    environment: 'test',
  },
};

validateRun(syntheticRun);
assert.throws(() => validateRun({ ...syntheticRun, phases: ['BACKUP'] }));
assert.throws(() => validateRun({ ...syntheticRun, evidence: { ...syntheticRun.evidence, type: 'PRODUCTION', sha: 'invalid' } }));

console.log('dr recovery readiness: PASS');
