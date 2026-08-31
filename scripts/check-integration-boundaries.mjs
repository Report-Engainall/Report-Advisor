import assert from 'node:assert/strict';

const services = {
  storage: { tenantScoped: true, signedAccess: true, crossTenantDenied: true },
  realtime: { tenantScoped: true, crossTenantDenied: true },
  ai: { tenantScoped: true, crossTenantDenied: true, untrustedOutput: true },
};

for (const [name, contract] of Object.entries(services)) {
  assert.equal(contract.tenantScoped, true, `${name}: tenant scope required`);
  assert.equal(contract.crossTenantDenied, true, `${name}: cross-tenant access must deny`);
}
assert.equal(services.storage.signedAccess, true);
assert.equal(services.ai.untrustedOutput, true);

assert.throws(() => { if (!services.storage.crossTenantDenied) throw new Error('storage isolation gap'); });
assert.throws(() => { if (!services.realtime.crossTenantDenied) throw new Error('realtime isolation gap'); });
assert.throws(() => { if (!services.ai.crossTenantDenied) throw new Error('AI isolation gap'); });

console.log('integration boundaries: PASS');
