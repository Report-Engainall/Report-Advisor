import assert from 'node:assert/strict';
import { diffScalar, diffSnapshotMetadata, formatTrust, type ReportSnapshotModel } from '../src/lib/secondary-evidence-ux.ts';

assert.equal(diffScalar('metricVersion', 'Metric Version', 'v1', 'v2').status, 'changed');
assert.equal(diffScalar('metricVersion', 'Metric Version', 'v1', 'v1').status, 'unchanged');
assert.equal(diffScalar('metricVersion', 'Metric Version', undefined, 'v2').status, 'unknown');
assert.equal(formatTrust(101), '100%');
assert.equal(formatTrust(-1), '0%');
assert.equal(formatTrust(undefined), 'UNKNOWN');

const before: ReportSnapshotModel = { reportId: 'r1', snapshotId: 's1', dataAsOf: '2026-08-24', metricVersion: 'm1', rulesVersion: 'rules-1', mappingVersion: 'map-1', generatedAt: '2026-08-24T10:00:00Z', state: 'READY' };
const after: ReportSnapshotModel = { ...before, snapshotId: 's2', metricVersion: 'm2', generatedAt: '2026-08-25T10:00:00Z' };
const diff = diffSnapshotMetadata(before, after);
assert.equal(diff.find(x => x.key === 'metricVersion')?.status, 'changed');
assert.equal(diff.find(x => x.key === 'rulesVersion')?.status, 'unchanged');
assert.equal(diff.find(x => x.key === 'dataAsOf')?.status, 'unchanged');
console.log('secondary-evidence-ux: PASS');
