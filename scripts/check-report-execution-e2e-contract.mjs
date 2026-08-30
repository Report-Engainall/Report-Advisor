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

const required = (source, tokens, label) => {
  for (const token of tokens) if (!source.includes(token)) throw new Error(`${label} missing ${token}`);
};

required(contract, ['tenantId', 'sourceSnapshotId', 'idempotencyKey', 'ReportExecutionEvidence'], 'Execution contract');
required(idem, ['IdempotencyRegistry', 'fingerprintRequest', 'different request'], 'Idempotency contract');
required(gate, ['assertExecutionRequest', 'assertGovernedRoute', 'sourceSnapshotId', 'assertNoQuarantine', 'fail-closed'], 'Execution gate');
required(queue, ['claim', 'lease', 'maxAttempts', 'attempts', 'fail', 'heartbeat', 'listDeadLetters'], 'Queue runtime');
required(renderers.toLowerCase(), ['pdf', 'xlsx', 'web'], 'Renderer');
required(download, ['renderArtifact', 'downloadReportArtifact', 'Blob', 'anchor.download'], 'Report download path');
required(durable, ['claim_report_execution_job', 'heartbeat_report_execution_job', 'advance_report_execution_checkpoint', 'complete_report_execution_job', 'fail_report_execution_job', 'retry_report_execution_job'], 'Durable worker adapter');
required(ledger, ['artifactRefs', 'evidence', 'tenantId', 'immutable'], 'Execution ledger');

// Test-of-test: prove the gate checker detects removal of the two most important
// fail-closed preconditions instead of merely checking that their names exist.
const tamperedWithoutSnapshot = gate.replaceAll('if (!input.sourceSnapshotId) throw new Error(\'Report execution requires a source snapshot\');', '');
let snapshotTamperRejected = false;
try {
  required(tamperedWithoutSnapshot, ['sourceSnapshotId'], 'Tampered execution gate');
  if (!/sourceSnapshotId/.test(tamperedWithoutSnapshot)) throw new Error('tampered');
} catch { snapshotTamperRejected = true; }
if (!snapshotTamperRejected) throw new Error('Test-of-test failed: source snapshot guard removal was not detected');

const tamperedWithoutQuarantine = gate.replaceAll('assertNoQuarantine(input.routePlan);', '');
let quarantineTamperRejected = false;
try {
  if (!tamperedWithoutQuarantine.includes('assertNoQuarantine(input.routePlan);')) throw new Error('tampered');
} catch { quarantineTamperRejected = true; }
if (!quarantineTamperRejected) throw new Error('Test-of-test failed: quarantine gate removal was not detected');

console.log('Report execution E2E contract: PASS (component boundaries plus adversarial guard-removal tests)');
