import assert from 'node:assert/strict';

const evidenceTypes = new Set(['STATIC','CI','SYNTHETIC_RUNTIME','LIVE_SQL','AUTHENTICATED_LIVE','PRODUCTION']);

function requireEvidence(e) {
  assert(e && evidenceTypes.has(e.type), 'invalid evidence type');
  assert(e.sha && /^[0-9a-f]{40}$/.test(e.sha), 'exact SHA required');
  assert(e.environment, 'environment required');
}

function sameTenant(resourceTenant, actorTenant) {
  return resourceTenant === actorTenant;
}

function terminalTransition(current, next) {
  const terminal = new Set(['COMPLETED','EXECUTED','FINALIZED']);
  assert(!terminal.has(current), 'terminal state cannot transition');
  return next;
}

requireEvidence({ type: 'SYNTHETIC_RUNTIME', sha: 'a'.repeat(40), environment: 'test' });
assert.throws(() => requireEvidence({ type: 'PRODUCTION', sha: 'bad', environment: 'prod' }));
assert(sameTenant('tenant-a', 'tenant-a'));
assert(!sameTenant('tenant-a', 'tenant-b'));
assert.throws(() => terminalTransition('COMPLETED', 'COMPLETED'));
console.log('runtime boundaries: PASS');
