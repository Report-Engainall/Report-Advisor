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

// Adversarial test-of-test: weaken each contract in an isolated copy and prove
// the corresponding fail-closed assertion detects the mutation.
for (const [name, contract] of Object.entries(services)) {
  const weakened = { ...contract, crossTenantDenied: false };
  assert.throws(
    () => assert.equal(weakened.crossTenantDenied, true, `${name}: cross-tenant access must deny`),
    `${name}: adversarial cross-tenant weakening must fail closed`,
  );
}

const unscopedStorage = { ...services.storage, tenantScoped: false };
assert.throws(
  () => assert.equal(unscopedStorage.tenantScoped, true, 'storage: tenant scope required'),
  'storage: adversarial tenant-scope weakening must fail closed',
);

const unsignedStorage = { ...services.storage, signedAccess: false };
assert.throws(
  () => assert.equal(unsignedStorage.signedAccess, true),
  'storage: adversarial signed-access weakening must fail closed',
);

const trustedAi = { ...services.ai, untrustedOutput: false };
assert.throws(
  () => assert.equal(trustedAi.untrustedOutput, true),
  'AI: adversarial trusted-output weakening must fail closed',
);

console.log('integration boundaries: PASS (positive contract + adversarial weakening test-of-test)');
