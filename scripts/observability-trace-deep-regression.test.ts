import assert from 'node:assert/strict';
import { childTrace, redactTraceMetadata, requireTraceContext } from '../src/lib/observability/trace-context.ts';

const trace = requireTraceContext({
  user_action_id: 'ua-1', request_id: 'req-1', job_id: 'job-1', import_id: 'imp-1', evidence_id: 'ev-1',
  report_id: 'rep-1', decision_id: 'dec-1', outcome_id: 'out-1', tenant_id: 'tenant-a',
});
assert.equal(trace.tenant_id, 'tenant-a');
assert.throws(() => requireTraceContext({ ...trace, report_id: '' }), /TRACE_CONTEXT_MISSING:report_id/);
const child = childTrace(trace, { request_id: 'req-2' });
assert.equal(child.tenant_id, trace.tenant_id);
assert.equal(child.request_id, 'req-2');
const safe = redactTraceMetadata({ tenant_id: 'tenant-a', request_id: 'req-1', email: 'secret@example.com', phone: '+967000000' });
assert.equal(safe.tenant_id, 'tenant-a');
assert.equal(safe.email, '[REDACTED]');
assert.equal(safe.phone, '[REDACTED]');
console.log('Observability deep trace regression: PASS');
