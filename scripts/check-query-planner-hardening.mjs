import assert from 'node:assert/strict';
import { planQuery } from '../src/lib/free-toolbox/queryPlanner.ts';

const a = planQuery({
  table: 'orders',
  columns: ['id', 'net_total', 'company_id'],
  filters: { status: 'paid', evil: 'ignored' },
  limit: 999999,
});
const b = planQuery({
  table: 'orders',
  columns: ['company_id', 'net_total', 'id'],
  filters: { evil: 'ignored', status: 'paid' },
  limit: 999999,
});

assert.equal(a.limit, 5000);
// Tenant scope is a planner invariant expressed by the required company_id column,
// not a caller-controlled filter value.
assert.deepEqual(a.filters, { status: 'paid' });
assert.ok(a.columns.includes('company_id'));
assert.equal(a.fingerprint, b.fingerprint);
assert.throws(() => planQuery({ table: 'orders', columns: ['id'], filters: { __sql: 'x' } }));
assert.throws(() => planQuery({ table: 'not_allowed', columns: ['id'] }));
assert.throws(() => planQuery({ table: 'orders', columns: ['id'], window: { from: 'not-a-date' } }));
assert.throws(() => planQuery({ table: 'orders', columns: ['id'], window: { from: '2026-09-02', to: '2026-09-01' } }));

console.log('query planner hardening: PASS (tenant column invariant, safe filters, deterministic fingerprint, bounds, and invalid-input rejection)');
