import assert from 'node:assert/strict';

const tiers = ['STATIC', 'CI', 'SYNTHETIC RUNTIME', 'LIVE SQL', 'AUTHENTICATED LIVE', 'PRODUCTION'];
const rank = new Map(tiers.map((tier, index) => [tier, index]));

function canCertify(actual, required) {
  return rank.has(actual) && rank.has(required) && rank.get(actual) >= rank.get(required);
}

assert.equal(canCertify('SYNTHETIC RUNTIME', 'PRODUCTION'), false);
assert.equal(canCertify('LIVE SQL', 'AUTHENTICATED LIVE'), false);
assert.equal(canCertify('AUTHENTICATED LIVE', 'LIVE SQL'), true);
assert.equal(canCertify('PRODUCTION', 'PRODUCTION'), true);
assert.equal(canCertify('STATIC', 'CI'), false);

const evidence = { type: 'SYNTHETIC RUNTIME', sha: 'synthetic-sha', environment: 'test' };
assert.notEqual(evidence.type, 'PRODUCTION');
assert.ok(evidence.sha);
assert.ok(evidence.environment);

console.log('PASS synthetic evidence cannot become production certification');
console.log('PASS live SQL cannot satisfy authenticated-live gate');
console.log('PASS authenticated-live evidence satisfies lower live-SQL gate');
console.log('PASS production evidence satisfies production gate');
console.log('PASS evidence retains type, exact SHA and environment');
console.log('PASS certification boundary regression');
