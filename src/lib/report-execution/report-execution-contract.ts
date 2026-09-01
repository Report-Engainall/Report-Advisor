export type ReportOutputFormat = 'web' | 'pdf' | 'xlsx';
export type ReportJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface ReportExecutionRequest {
  reportId: string;
  tenantId: string;
  requestedBy: string;
  parameters: Record<string, unknown>;
  formats: ReportOutputFormat[];
  idempotencyKey: string;
  sourceSnapshotId?: string;
}

export interface ReportExecutionEvidence {
  runId: string;
  reportId: string;
  tenantId: string;
  status: ReportJobStatus;
  startedAt?: string;
  completedAt?: string;
  rowCount: number;
  outputFormats: ReportOutputFormat[];
  artifactRefs: string[];
  errorCode?: string;
  errorMessage?: string;
  inputFingerprint: string;
  engineVersion: string;
}

export interface ReportExecutionResult {
  runId: string;
  status: ReportJobStatus;
  artifacts: Array<{ format: ReportOutputFormat; ref: string }>;
  evidence: ReportExecutionEvidence;
}

function requireNonBlank(value: unknown, message: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(message);
}

export function assertExecutionRequest(request: ReportExecutionRequest): void {
  if (!request) throw new Error('Invalid report execution identity');
  requireNonBlank(request.reportId, 'Invalid report execution identity');
  requireNonBlank(request.tenantId, 'Invalid report execution identity');
  requireNonBlank(request.requestedBy, 'Invalid report execution identity');
  requireNonBlank(request.idempotencyKey, 'Report execution requires an idempotency key');
  if (!Array.isArray(request.formats) || request.formats.length === 0) throw new Error('Report execution requires at least one output format');
  if (new Set(request.formats).size !== request.formats.length) throw new Error('Duplicate output formats are not allowed');
  if (request.formats.some((format) => !['web', 'pdf', 'xlsx'].includes(format))) throw new Error('Unsupported report output format');
  if (request.sourceSnapshotId !== undefined && !request.sourceSnapshotId.trim()) throw new Error('Source snapshot id cannot be blank');
}

export function assertEvidenceTenant(evidence: ReportExecutionEvidence, tenantId: string): void {
  requireNonBlank(tenantId, 'Report evidence tenant context is required');
  if (!evidence || evidence.tenantId !== tenantId) throw new Error('Report evidence tenant mismatch');
}
