import assert from 'node:assert/strict';
import { planQuery, planDateWindow } from '../src/lib/free-toolbox/queryPlanner.ts';

// 1. Tenant identity is structural, never caller-controlled.
const a = planQuery({
  table: 'orders',
  columns: ['id', 'net_total', 'company_id'],
  filters: { status: 'paid', company_id: 'attacker', evil: 'ignored' },
  limit: 999999,
});
assert.equal(a.limit, 5000);
assert.ok(a.columns.includes('company_id'));
assert.deepEqual(a.filters, { status: 'paid' });
assert.ok(!Object.hasOwn(a.filters, 'company_id'));

// 2. Filter allow-list strips unknown keys.
assert.ok(!Object.hasOwn(a.filters, 'evil'));

// 3. Fingerprints are deterministic across input ordering.
const b = planQuery({
  table: 'orders',
  columns: ['company_id', 'net_total', 'id'],
  filters: { evil: 'ignored', status: 'paid' },
  limit: 999999,
});
assert.equal(a.fingerprint, b.fingerprint);

// 4. Column allow-list cannot produce an empty projection.
assert.throws(() => planQuery({ table: 'orders', columns: ['not_safe'] }));

// 5. Unsupported tables are rejected.
assert.throws(() => planQuery({ table: 'secrets', columns: ['id'] }));

// 6. SQL-shaped filter input is rejected/removed rather than executed.
assert.deepEqual(
  planQuery({ table: 'orders', columns: ['id'], filters: { __sql: 'DROP TABLE orders' } }).filters,
  {},
);

// 7. Limits are bounded and normalized.
assert.equal(planQuery({ table: 'orders', columns: ['id'], limit: 0 }).limit, 1);
assert.equal(planQuery({ table: 'orders', columns: ['id'], limit: 5000.9 }).limit, 5000);

// 8. Array filter values are normalized deterministically.
const arrayPlan = planQuery({ table: 'orders', columns: ['id'], filters: { status: ['paid', 'new'] } });
assert.deepEqual(arrayPlan.filters.status, ['new', 'paid']);

// 9. Invalid date windows fail closed.
assert.throws(() => planDateWindow('not-a-date', '2026-09-01'));

// 10. Reversed date windows fail closed.
assert.throws(() => planDateWindow('2026-09-02', '2026-09-01'));

console.log('query planner hardening: PASS');
