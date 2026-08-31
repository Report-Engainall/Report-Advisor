import assert from 'node:assert/strict';

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';

function requireTenant(sessionTenant, requestedTenant) {
  assert.ok(sessionTenant, 'AUTH_REQUIRED');
  assert.equal(sessionTenant, requestedTenant, 'TENANT_MISMATCH');
  return true;
}

function storageObjectPath(tenant, object) {
  requireTenant(tenant, object.tenantId);
  assert.ok(object.path.startsWith(`${tenant}/`), 'STORAGE_NAMESPACE_MISMATCH');
  return object.path;
}

function realtimeEventVisible(sessionTenant, event) {
  return event.tenantId === sessionTenant;
}

function vectorVisible(sessionTenant, vector) {
  requireTenant(sessionTenant, vector.tenantId);
  return vector.tenantId === sessionTenant && vector.namespace === `tenant:${sessionTenant}`;
}

// Storage: namespace and authenticated tenant binding.
assert.equal(storageObjectPath(TENANT_A, { tenantId: TENANT_A, path: `${TENANT_A}/docs/a.pdf` }), `${TENANT_A}/docs/a.pdf`);
assert.throws(() => storageObjectPath(TENANT_A, { tenantId: TENANT_B, path: `${TENANT_B}/docs/b.pdf` }), /TENANT_MISMATCH/);
assert.throws(() => storageObjectPath(TENANT_A, { tenantId: TENANT_A, path: `${TENANT_B}/docs/b.pdf` }), /STORAGE_NAMESPACE_MISMATCH/);

// Realtime: events are tenant-scoped; foreign events are never surfaced.
const events = [
  { id: 'r1', tenantId: TENANT_A, table: 'decisions' },
  { id: 'r2', tenantId: TENANT_B, table: 'decisions' },
];
assert.deepEqual(events.filter(e => realtimeEventVisible(TENANT_A, e)).map(e => e.id), ['r1']);
assert.deepEqual(events.filter(e => realtimeEventVisible(TENANT_B, e)).map(e => e.id), ['r2']);

// Vector retrieval: authenticated tenant + namespace must agree.
assert.equal(vectorVisible(TENANT_A, { tenantId: TENANT_A, namespace: `tenant:${TENANT_A}` }), true);
assert.throws(() => vectorVisible(TENANT_A, { tenantId: TENANT_B, namespace: `tenant:${TENANT_B}` }), /TENANT_MISMATCH/);
assert.throws(() => vectorVisible(TENANT_A, { tenantId: TENANT_A, namespace: `tenant:${TENANT_B}` }), /TENANT_MISMATCH|TENANT/);

// Unauthenticated callers fail closed across every boundary.
assert.throws(() => requireTenant(null, TENANT_A), /AUTH_REQUIRED/);
assert.throws(() => storageObjectPath(null, { tenantId: TENANT_A, path: `${TENANT_A}/x` }), /AUTH_REQUIRED/);
assert.throws(() => vectorVisible(null, { tenantId: TENANT_A, namespace: `tenant:${TENANT_A}` }), /AUTH_REQUIRED/);

// Cross-tenant export payloads are rejected before serialization.
function assertExportTenant(sessionTenant, rows) {
  for (const row of rows) requireTenant(sessionTenant, row.tenantId);
  return rows;
}
assert.doesNotThrow(() => assertExportTenant(TENANT_A, [{ tenantId: TENANT_A, id: 'a1' }]));
assert.throws(() => assertExportTenant(TENANT_A, [{ tenantId: TENANT_A, id: 'a1' }, { tenantId: TENANT_B, id: 'b1' }]), /TENANT_MISMATCH/);

console.log('PASS storage tenant namespace');
console.log('PASS storage cross-tenant denial');
console.log('PASS realtime tenant event isolation');
console.log('PASS vector tenant namespace isolation');
console.log('PASS unauthenticated fail-closed boundaries');
console.log('PASS cross-tenant export denial');
console.log('PASS storage/realtime/AI synthetic runtime boundary harness');
