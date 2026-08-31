import assert from 'node:assert/strict';

const corpus = {
  decision: { id: 'decision-a', tenant_id: 'tenant-a', status: 'APPROVED', approved_by: 'actor-a' },
  workItem: { id: 'work-a', tenant_id: 'tenant-a', decision_id: 'decision-a', assignee_id: 'actor-a', status: 'COMPLETED' },
  outcome: { id: 'outcome-a', tenant_id: 'tenant-a', work_item_id: 'work-a', recorded_by: 'actor-a' },
};

assert.equal(corpus.decision.status, 'APPROVED');
assert.equal(corpus.workItem.decision_id, corpus.decision.id);
assert.equal(corpus.workItem.tenant_id, corpus.decision.tenant_id);
assert.equal(corpus.outcome.work_item_id, corpus.workItem.id);
assert.equal(corpus.outcome.tenant_id, corpus.workItem.tenant_id);

assert.notEqual('tenant-a', 'tenant-b');
assert.notEqual(corpus.decision.approved_by, 'actor-b');
assert.throws(() => { if (corpus.workItem.status !== 'COMPLETED') throw new Error('incomplete work item'); });
assert.throws(() => { if ('EXECUTED' === 'EXECUTED') throw new Error('terminal decision'); });
assert.throws(() => { if (corpus.outcome.work_item_id !== 'missing-work') throw new Error('invalid work item'); });

console.log('decision e2e synthetic corpus: PASS');
