import { strict as assert } from 'node:assert';
import { resolveReportExecutionScope } from '../src/lib/report-execution/report-scope.ts';
import { fingerprintReportSource } from '../src/lib/report-execution/source-fingerprint.ts';

const base = {
  tenantId: 'tenant-a',
  parameters: {
    dataset: 'sales',
    from: '2026-09-01',
    to: '2026-09-10',
    asOf: '2026-09-10',
    statusPolicy: 'posted-confirmed-paid',
  },
};

const scope = resolveReportExecutionScope(base);
assert.deepEqual(scope, { tenantId: 'tenant-a', dataset: 'sales', from: '2026-09-01', to: '2026-09-10', asOf: '2026-09-10', statusPolicy: 'posted-confirmed-paid' });
assert.throws(() => resolveReportExecutionScope({ ...base, parameters: { ...base.parameters, from: '2026-09-11' } }), /REPORT_SCOPE_PERIOD_INVALID/);
assert.throws(() => resolveReportExecutionScope({ ...base, parameters: { ...base.parameters, asOf: '2026-09-09' } }), /REPORT_SCOPE_AS_OF_BEFORE_PERIOD_END/);

const first = await fingerprintReportSource(scope, [{ invoice: 'B', total: 2 }, { invoice: 'A', total: 1 }]);
const reordered = await fingerprintReportSource(scope, [{ total: 1, invoice: 'A' }, { total: 2, invoice: 'B' }]);
assert.equal(first, reordered, 'row/object ordering must not change the source fingerprint');
const differentScope = await fingerprintReportSource({ ...scope, asOf: '2026-09-11' }, [{ invoice: 'A', total: 1 }, { invoice: 'B', total: 2 }]);
assert.notEqual(first, differentScope, 'scope identity must change the source fingerprint');
assert.rejects(() => fingerprintReportSource(scope, [{ invoice: 'A', total: Number.POSITIVE_INFINITY }]), /REPORT_SOURCE_NON_FINITE_NUMBER/);

console.log('Report execution scope: PASS');
console.log('Report source fingerprint: PASS');
