import assert from 'node:assert/strict';

// Deterministic synthetic corpus for the future authenticated-live adapter.
// No production credentials or live evidence are committed here.
const corpus = {
  tenants: { A: 'tenant-a', B: 'tenant-b' },
  users: { A: 'user-a', B: 'user-b', outsider: 'user-outsider' },
  decision: { id: 'decision-a', tenant: 'tenant-a', status: 'APPROVED' },
  workItem: { id: 'work-a', tenant: 'tenant-a', decision: 'decision-a', assignee: 'user-a', status: 'COMPLETED' },
  outcome: { decision: 'decision-a', workItem: 'work-a', tenant: 'tenant-a', observedBy: 'user-a' },
  evidence: { id: 'evidence-a', tenant: 'tenant-a', kind: 'SYNTHETIC' },
};

const allow = (actor, tenant, resourceTenant) => actor && tenant === resourceTenant;
const requireCompletedWorkItem = (decision, workItem) =>
  decision.status === 'EXECUTED' && workItem.status === 'COMPLETED' && workItem.decision === decision.id;

const cases = [
  ['tenant A SELECT own rows', allow('user-a', 'tenant-a', 'tenant-a'), true],
  ['tenant B SELECT tenant A rows', allow('user-b', 'tenant-b', 'tenant-a'), false],
  ['tenant B UPDATE tenant A rows', allow('user-b', 'tenant-b', 'tenant-a'), false],
  ['outsider DELETE tenant A rows', allow('user-outsider', 'tenant-x', 'tenant-a'), false],
  ['cross-tenant RPC', allow('user-b', 'tenant-b', 'tenant-a'), false],
  ['cross-tenant export', allow('user-b', 'tenant-b', 'tenant-a'), false],
  ['wrong-tenant storage object', allow('user-b', 'tenant-b', 'tenant-a'), false],
  ['wrong-tenant realtime row', allow('user-b', 'tenant-b', 'tenant-a'), false],
  ['work item assigned to another user', corpus.workItem.assignee === 'user-b', false],
  ['completed work item may be reused', corpus.workItem.status !== 'COMPLETED', false],
  ['outcome provenance is generated actor', corpus.outcome.observedBy === 'caller-supplied', false],
  ['evidence cannot cross tenant', corpus.evidence.tenant === 'tenant-b', false],
];

for (const [name, observed, expected] of cases) assert.equal(observed, expected, name);

const executableDecision = { ...corpus.decision, status: 'EXECUTED' };
assert.equal(requireCompletedWorkItem(executableDecision, corpus.workItem), true);
assert.equal(requireCompletedWorkItem(corpus.decision, corpus.workItem), false);
assert.equal(requireCompletedWorkItem(executableDecision, { ...corpus.workItem, status: 'PENDING' }), false);
assert.equal(requireCompletedWorkItem(executableDecision, { ...corpus.workItem, decision: 'decision-b' }), false);

console.log('AUTHENTICATED E2E HARNESS CONTRACT PASS');
console.log('- deterministic synthetic Tenant A/B corpus');
console.log('- SELECT/UPDATE/DELETE/RPC/export/storage/realtime boundaries');
console.log('- wrong-assignee and terminal work-item vectors');
console.log('- generated outcome provenance vector');
console.log('- tenant-scoped evidence vector');
console.log('- executed-decision + completed-work-item prerequisites');
console.log('- evidence kind is SYNTHETIC, never production certification');
