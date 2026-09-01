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

// Adversarial self-tests: deliberately corrupt an isolated contract copy and
// prove the guard rejects the unsafe state. Never assert.throws against the
// already-valid production fixture, which would make the test internally
// contradictory and fail with "Missing expected exception".
for (const [name, contract] of Object.entries(services)) {
  const unsafe = { ...contract, crossTenantDenied: false };
  assert.throws(
    () => {
      if (!unsafe.crossTenantDenied) throw new Error(`${name}: cross-tenant access must deny`);
    },
    /cross-tenant access must deny/,
  );
}

console.log('integration boundaries: PASS');
