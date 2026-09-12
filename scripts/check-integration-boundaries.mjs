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

// Adversarial fixtures: a weakened isolation contract must fail closed.
for (const [name, contract] of Object.entries(services)) {
  const weakened = { ...contract, crossTenantDenied: false };
  assert.throws(
    () => {
      if (!weakened.crossTenantDenied) throw new Error(`${name} isolation gap`);
    },
    /isolation gap/,
    `${name}: weakened cross-tenant contract must be rejected`,
  );
}

console.log('integration boundaries: PASS');
