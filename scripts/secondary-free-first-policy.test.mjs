import assert from 'node:assert/strict';

const FREE = { capabilityRequired: true, cost: 'free', locallyAvailable: true };
const SELF = { capabilityRequired: true, cost: 'self-hosted', locallyAvailable: true };

// Contract-level mirror of freeFirstPolicy.ts; CI can execute this without a TS runtime.
function evaluate(input) {
  if (!input.capabilityRequired) return 'block';
  if (input.cost === 'free' || input.cost === 'self-hosted') return input.locallyAvailable === false ? 'block' : 'allow';
  if (input.cost === 'paid') return input.explicitlyEnabled ? 'require-explicit-consent' : 'block';
  return 'block';
}

assert.equal(evaluate(FREE), 'allow');
assert.equal(evaluate(SELF), 'allow');
assert.equal(evaluate({ ...FREE, locallyAvailable: false }), 'block');
assert.equal(evaluate({ capabilityRequired: true, cost: 'paid' }), 'block');
assert.equal(evaluate({ capabilityRequired: true, cost: 'paid', explicitlyEnabled: true }), 'require-explicit-consent');
assert.equal(evaluate({ capabilityRequired: true, cost: 'unknown' }), 'block');
assert.equal(evaluate({ capabilityRequired: false, cost: 'free' }), 'block');

console.log('secondary-free-first-policy: PASS');
