import { readFileSync } from 'node:fs';

const worker = readFileSync('src/lib/reportWorkerAdapter.ts', 'utf8');
const automation = readFileSync('src/lib/automationExecutionContract.ts', 'utf8');

for (const token of ['TrustedReportWorker', 'buildWorkerLease', 'assertTrustedWorkerContext', 'assertArtifactIntegrity']) {
  if (!worker.includes(token)) throw new Error(`Missing worker contract: ${token}`);
}
for (const token of ['idempotencyKey', 'assertExternalSideEffectAllowed', 'buildIdempotencyKey', 'assertReceiptMatchesAction']) {
  if (!automation.includes(token)) throw new Error(`Missing automation contract: ${token}`);
}

if (!worker.includes('REPORT_WORKER_COMPANY_SCOPE_MISMATCH')) throw new Error('Worker tenant boundary missing');
if (!automation.includes('AUTOMATION_APPROVAL_REQUIRED')) throw new Error('Automation approval boundary missing');
if (!automation.includes('AUTOMATION_RECEIPT_IDEMPOTENCY_MISMATCH')) throw new Error('Automation receipt boundary missing');

console.log('Worker + automation contract: PASS');
