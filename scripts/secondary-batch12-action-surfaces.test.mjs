import assert from 'node:assert/strict';

const normalize = (input = {}) => ({
  version: 1,
  filters: { ...(input.filters ?? {}) },
  grouping: [...(input.grouping ?? [])],
  columns: [...(input.columns ?? [])],
  sorting: [...(input.sorting ?? [])],
  scope: input.scope,
});

const apply = (state, event) => {
  const next = normalize(state);
  next.filters[event.dimension] = event.value;
  return next;
};

const evidenceVisible = alert => Boolean(alert.evidenceId);
const classify = input => (!input.evidenceId && input.status === 'open' ? 'unknown' : input.status);

const base = normalize({ filters: { warehouse: 'W1' }, columns: ['sku'] });
assert.deepEqual(base.filters, { warehouse: 'W1' });
assert.deepEqual(apply(base, { dimension: 'category', value: 'A' }).filters, { warehouse: 'W1', category: 'A' });
assert.equal(evidenceVisible({ evidenceId: 'ev-1' }), true);
assert.equal(evidenceVisible({ evidenceId: null }), false);
assert.equal(classify({ status: 'open', evidenceId: null }), 'unknown');
assert.equal(classify({ status: 'open', evidenceId: 'ev-1' }), 'open');
console.log('secondary batch12 action-surface contract: PASS — 6 assertions');
