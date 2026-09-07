import assert from 'node:assert/strict';
import { assertExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';

const request = {
  reportId: 'report-1',
  tenantId: 'tenant-a',
  requestedBy: 'user-1',
  parameters: {},
  formats: ['web'],
  idempotencyKey: 'request-1',
};

assert.doesNotThrow(() => assertExecutionRequest(request));
for (const field of ['reportId', 'tenantId', 'requestedBy', 'idempotencyKey']) {
  assert.throws(() => assertExecutionRequest({ ...request, [field]: '   ' }), /Invalid report execution/);
}
assert.throws(() => assertExecutionRequest({ ...request, parameters: [] }), /Invalid report execution parameters/);
assert.throws(() => assertExecutionRequest({ ...request, sourceSnapshotId: '   ' }), /source snapshot identity/);
console.log('Report execution input contract: PASS');
