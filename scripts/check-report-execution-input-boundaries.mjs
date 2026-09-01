import fs from 'node:fs';

const contract = fs.readFileSync('src/lib/report-execution/report-execution-contract.ts', 'utf8');
const checkpoint = fs.readFileSync('src/lib/report-execution/checkpoint.ts', 'utf8');
const adapter = fs.readFileSync('src/lib/report-execution/durable-worker-adapter.ts', 'utf8');

for (const token of [
  "requireNonBlank(request.reportId",
  "requireNonBlank(request.tenantId",
  "requireNonBlank(request.requestedBy",
  "requireNonBlank(request.idempotencyKey",
  "request.sourceSnapshotId !== undefined",
]) if (!contract.includes(token)) throw new Error(`missing execution input boundary: ${token}`);

for (const token of [
  'canonicalEvidence',
  'next.rowCount !== undefined',
  'next.sourceHash !== current.sourceHash',
  'checkpoint.rowCount !== undefined',
]) if (!checkpoint.includes(token)) throw new Error(`missing checkpoint boundary: ${token}`);

for (const token of [
  'requireNonBlank(jobId',
  'requireNonBlank(workerId',
  'requirePositiveLease(leaseSeconds)',
  'request.sourceSnapshotId !== undefined',
]) if (!adapter.includes(token)) throw new Error(`missing worker input boundary: ${token}`);

console.log('Report execution input boundaries: PASS');
