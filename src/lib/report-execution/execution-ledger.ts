import type { Dataset, FileFormat } from '../file-engine/types';
import { parseFile } from '../file-engine/adapters';
import { computeSHA256 } from '../file-engine/file-identity-core';
import type { ReportExecutionEvidence, ReportExecutionResult } from './report-execution-contract';
import { fingerprintRequest, IdempotencyRegistry } from './idempotency';
import { assertNoQuarantine, assertReportExecutionReady, type ExecutionGateInput } from './execution-gate';
import { InMemoryReportQueue } from './queue';
import { advanceCheckpoint, createInitialCheckpoint, type ReportExecutionCheckpoint } from './checkpoint';
import { runProductionLifecycle, type ProductionLifecycleInput, type ProductionLifecycleResult } from './production-coordinator-bridge';

export interface ExecutionLedgerRecord extends ReportExecutionEvidence { requestFingerprint: string; immutable: true; }

export interface FilePipelineValidation {
  ok: boolean;
  evidenceKeys: string[];
  errorCode?: string;
  errorMessage?: string;
}

export interface FilePipelineDependencies<T = unknown> {
  canonicalize: (datasets: Dataset[]) => Promise<readonly T[]> | readonly T[];
  validate: (rows: readonly T[]) => Promise<FilePipelineValidation> | FilePipelineValidation;
  reconcile: (rows: readonly T[]) => Promise<{ evidenceKeys: string[] }> | { evidenceKeys: string[] };
  buildLifecycleInput: (args: { sourceHash: string; datasets: Dataset[]; rows: readonly T[]; reconciliation: { evidenceKeys: string[] } }) => Promise<ProductionLifecycleInput<T>> | ProductionLifecycleInput<T>;
}

export interface FilePipelineInput<T = unknown> {
  bytes: ArrayBuffer;
  fileName: string;
  format: FileFormat;
  dependencies: FilePipelineDependencies<T>;
  initialEvidenceKeys?: string[];
}

export interface FilePipelineResult<T = unknown> {
  sourceHash: string;
  datasets: Dataset[];
  rows: readonly T[];
  reconciliation: { evidenceKeys: string[] };
  lifecycle: ProductionLifecycleResult<T>;
  observedCheckpointHistory: ReportExecutionCheckpoint[];
  executedStages: ReportExecutionCheckpoint['stage'][];
}

export class ReportExecutionCoordinator {
  readonly queue = new InMemoryReportQueue();
  readonly idempotency = new IdempotencyRegistry();
  private readonly ledger = new Map<string, ExecutionLedgerRecord>();

  enqueue(input: ExecutionGateInput, runId: string, maxAttempts = 3): ReportExecutionResult {
    assertReportExecutionReady(input);
    assertNoQuarantine(input.routePlan);
    const fingerprint = fingerprintRequest(input.request);
    const claim = this.idempotency.claim(input.request.idempotencyKey, input.request.tenantId, fingerprint, runId);
    const job = this.queue.enqueue(input.request, claim.runId, maxAttempts);
    const evidence: ExecutionLedgerRecord = {
      runId: job.runId, reportId: job.request.reportId, tenantId: job.request.tenantId,
      status: job.status, rowCount: 0, outputFormats: [...job.request.formats], artifactRefs: [],
      inputFingerprint: fingerprint, engineVersion: 'report-execution-v1', requestFingerprint: fingerprint, immutable: true,
    };
    this.ledger.set(job.runId, evidence);
    return { runId: job.runId, status: job.status, artifacts: [], evidence };
  }

  /** Orchestration-only bridge for a real file. Existing parser, canonicalization, validation and reconciliation components remain injected; production lifecycle remains the existing decision engine. */
  async runFilePipeline<T = unknown>(input: FilePipelineInput<T>): Promise<FilePipelineResult<T>> {
    if (!input.fileName.trim()) throw new Error('File pipeline requires a file name');
    if (!(input.bytes instanceof ArrayBuffer)) throw new Error('File pipeline requires an ArrayBuffer');

    const sourceHash = await computeSHA256(input.bytes);
    let checkpoint = createInitialCheckpoint(sourceHash, input.initialEvidenceKeys ?? []);
    const observedCheckpointHistory: ReportExecutionCheckpoint[] = [checkpoint];

    checkpoint = advanceCheckpoint(checkpoint, { stage: 'fingerprinted', sourceHash, evidenceKeys: [`source.sha256:${sourceHash}`] });
    observedCheckpointHistory.push(checkpoint);

    const datasets = await parseFile(input.bytes, input.fileName, input.format);
    if (!datasets.length || datasets.every(dataset => dataset.rowCount === 0)) throw new Error('FILE_PIPELINE_EMPTY_EXTRACTION');
    const extractedRowCount = datasets.reduce((sum, dataset) => sum + dataset.rowCount, 0);
    checkpoint = advanceCheckpoint(checkpoint, { stage: 'extracted', sourceHash, rowCount: extractedRowCount, evidenceKeys: [`extraction.datasets:${datasets.length}`, `extraction.rows:${extractedRowCount}`] });
    observedCheckpointHistory.push(checkpoint);

    const rows = await input.dependencies.canonicalize(datasets);
    if (!rows.length) throw new Error('FILE_PIPELINE_EMPTY_CANONICAL_DATA');
    checkpoint = advanceCheckpoint(checkpoint, { stage: 'canonicalized', sourceHash, rowCount: rows.length, evidenceKeys: [`canonical.rows:${rows.length}`] });
    observedCheckpointHistory.push(checkpoint);

    const validation = await input.dependencies.validate(rows);
    if (!validation.ok) throw new Error(`${validation.errorCode ?? 'FILE_PIPELINE_VALIDATION_FAILED'}:${validation.errorMessage ?? 'Validation failed'}`);
    checkpoint = advanceCheckpoint(checkpoint, { stage: 'validated', sourceHash, rowCount: rows.length, evidenceKeys: validation.evidenceKeys });
    observedCheckpointHistory.push(checkpoint);

    const reconciliation = await input.dependencies.reconcile(rows);
    checkpoint = advanceCheckpoint(checkpoint, { stage: 'analyzed', sourceHash, rowCount: rows.length, evidenceKeys: reconciliation.evidenceKeys });
    observedCheckpointHistory.push(checkpoint);

    const lifecycleInput = await input.dependencies.buildLifecycleInput({ sourceHash, datasets, rows, reconciliation });
    if (lifecycleInput.sourceHash !== sourceHash) throw new Error('FILE_PIPELINE_SOURCE_HASH_MISMATCH');
    const lifecycle = runProductionLifecycle(lifecycleInput);

    checkpoint = advanceCheckpoint(checkpoint, {
      stage: 'decisioned',
      sourceHash,
      rowCount: rows.length,
      evidenceKeys: [
        `decision.scenario:${lifecycle.scenario?.key ?? 'none'}`,
        `decision.portfolio:${lifecycle.portfolio.length}`,
        `decision.autonomy:${lifecycle.autonomy.eligible ? 'eligible' : 'blocked'}`,
      ],
    });
    observedCheckpointHistory.push(checkpoint);

    checkpoint = advanceCheckpoint(checkpoint, { stage: 'committed', sourceHash, rowCount: rows.length, evidenceKeys: [`lifecycle.job:${lifecycle.jobId}`, `lifecycle.tenant:${lifecycle.companyId}`] });
    observedCheckpointHistory.push(checkpoint);
    checkpoint = advanceCheckpoint(checkpoint, { stage: 'rendered', sourceHash, rowCount: rows.length, evidenceKeys: [`lifecycle.source:${lifecycle.sourceHash}`] });
    observedCheckpointHistory.push(checkpoint);

    return { sourceHash, datasets, rows, reconciliation, lifecycle, observedCheckpointHistory, executedStages: observedCheckpointHistory.map(c => c.stage) };
  }

  getEvidence(runId: string): ExecutionLedgerRecord | undefined { const item = this.ledger.get(runId); return item ? { ...item, outputFormats: [...item.outputFormats], artifactRefs: [...item.artifactRefs] } : undefined; }
}
