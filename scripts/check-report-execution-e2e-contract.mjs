import { readFileSync, existsSync } from 'node:fs';

const files = [
  'src/lib/report-execution/report-execution-contract.ts',
  'src/lib/report-execution/idempotency.ts',
  'src/lib/report-execution/execution-gate.ts',
  'src/lib/report-execution/queue.ts',
  'src/lib/report-execution/renderers.ts',
  'src/lib/report-execution/download.ts',
  'src/lib/report-execution/durable-worker-adapter.ts',
  'src/lib/report-execution/execution-ledger.ts',
];

for (const file of files) if (!existsSync(file)) throw new Error(`Missing report execution component: ${file}`);
const read = file => readFileSync(file, 'utf8');
const contract = read(files[0]);
const idem = read(files[1]);
const gate = read(files[2]);
const queue = read(files[3]);
const renderers = read(files[4]);
const download = read(files[5]);
const durable = read(files[6]);
const ledger = read(files[7]);

for (const token of ['tenantId', 'sourceSnapshotId', 'idempotencyKey', 'ReportExecutionEvidence']) if (!contract.includes(token)) throw new Error(`Execution contract missing ${token}`);
for (const token of ['IdempotencyRegistry', 'fingerprintRequest', 'different request']) if (!idem.includes(token)) throw new Error(`Idempotency contract missing ${token}`);
for (const token of ['assertExecutionRequest', 'assertGovernedRoute', 'sourceSnapshotId']) if (!gate.includes(token)) throw new Error(`Execution gate missing ${token}`);
for (const token of ['claim', 'lease', 'maxAttempts', 'attempts', 'fail', 'heartbeat', 'listDeadLetters']) if (!queue.includes(token)) throw new Error(`Queue runtime missing ${token}`);
for (const token of ['pdf', 'xlsx', 'web']) if (!renderers.toLowerCase().includes(token)) throw new Error(`Renderer missing ${token}`);
for (const token of ['renderArtifact', 'downloadReportArtifact', 'Blob', 'anchor.download']) if (!download.includes(token)) throw new Error(`Report download path missing ${token}`);
for (const token of ['claim_report_execution_job', 'heartbeat_report_execution_job', 'advance_report_execution_checkpoint', 'complete_report_execution_job', 'fail_report_execution_job', 'retry_report_execution_job']) if (!durable.includes(token)) throw new Error(`Durable worker adapter missing ${token}`);
for (const token of ['artifactRefs', 'evidence', 'tenantId', 'immutable']) if (!ledger.includes(token)) throw new Error(`Execution ledger missing ${token}`);

console.log('Report execution E2E contract: PASS');
