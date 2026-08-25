import assert from 'node:assert/strict';

// Static contract checks: these do not require a browser, network, database, or paid service.
const source = await import('../src/lib/lowBandwidthPolicy.ts');
const mobile = await import('../src/lib/mobileReadiness.ts');

assert.equal(source.classifyNetwork(undefined, false), 'offline');
assert.equal(source.getReadPolicy('slow').progressive, true);
assert.equal(source.getReadPolicy('slow').maxRows <= 100, true);
assert.equal(source.getReadPolicy('fast').allowStaleCache, false);
assert.equal(source.canUseCachedRead(undefined, source.getReadPolicy('normal')), false);
assert.equal(mobile.safeInternalPath('/reports?id=1', 'https://app.local'), '/reports?id=1');
assert.equal(mobile.safeInternalPath('https://evil.example/path', 'https://app.local'), null);
assert.equal(mobile.createMobileReadinessPolicy().touchTarget.minCssPx >= 44, true);

console.log('Batch 16 policy checks: PASS');
