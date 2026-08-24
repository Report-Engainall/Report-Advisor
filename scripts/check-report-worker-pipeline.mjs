import { readFileSync } from 'node:fs';

const worker = readFileSync('src/lib/reportWorkerPipeline.ts', 'utf8');
const adapter = readFileSync('src/lib/reportWorkerAdapter.ts', 'utf8');

for (const token of ['createReportWorkerPipeline', 'claim(', 'render(', 'complete(', 'REPORT_CLAIM_EXPIRED', 'REPORT_RUN_EVIDENCE_MISMATCH', 'REPORT_DELIVERY_EVIDENCE_REQUIRED']) {
  if (!worker.includes(token)) throw new Error(`Missing report pipeline contract: ${token}`);
}
for (const token of ['TrustedReportWorker', 'buildWorkerLease', 'assertTrustedWorkerContext', 'assertArtifactIntegrity']) {
  if (!adapter.includes(token)) throw new Error(`Missing worker adapter contract: ${token}`);
}
console.log('Report worker pipeline: PASS');
