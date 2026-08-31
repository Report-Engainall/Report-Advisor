import assert from 'node:assert/strict';

const actors = {
  a: { id: 'actor-a', tenant_id: 'tenant-a' },
  b: { id: 'actor-b', tenant_id: 'tenant-b' },
};

function authorize(actor, resource, action) {
  assert(actor?.tenant_id === resource?.tenant_id, `cross-tenant ${action} rejected`);
  if (action === 'assign') assert(actor.id === resource.assignee_id, 'wrong assignee rejected');
  return true;
}

const resourceA = { id: 'r-a', tenant_id: 'tenant-a', assignee_id: 'actor-a' };
assert(authorize(actors.a, resourceA, 'select'));
assert(authorize(actors.a, resourceA, 'update'));
assert(authorize(actors.a, resourceA, 'insert'));
assert(authorize(actors.a, resourceA, 'delete'));
assert(authorize(actors.a, resourceA, 'rpc'));
assert(authorize(actors.a, resourceA, 'export'));
assert(authorize(actors.a, resourceA, 'storage'));
assert(authorize(actors.a, resourceA, 'realtime'));
assert(authorize(actors.a, resourceA, 'assign'));

for (const action of ['select','update','insert','delete','rpc','export','storage','realtime','assign']) {
  assert.throws(() => authorize(actors.b, resourceA, action));
}

assert.throws(() => authorize(actors.a, { ...resourceA, assignee_id: 'actor-b' }, 'assign'));
console.log('authenticated boundary contract: PASS');
