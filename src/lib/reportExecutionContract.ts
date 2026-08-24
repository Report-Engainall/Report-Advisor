export type ReportOutputFormat = 'web' | 'pdf' | 'xlsx';

export type ReportExecutionStatus =
  | 'queued'
  | 'claimed'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export interface ReportExecutionRequest {
  runId: string;
  companyId: string;
  reportId: string;
  semanticDefinitionVersion: string;
  snapshotId: string;
  requestedAt: string;
  output: ReportOutputFormat;
  parameters: Record<string, string | number | boolean | null>;
}

export interface ReportExecutionEvidence {
  runId: string;
  companyId: string;
  reportId: string;
  snapshotId: string;
  semanticDefinitionVersion: string;
  status: ReportExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  output?: ReportOutputFormat;
  artifactRef?: string;
  deliveryRef?: string;
  errorCode?: string;
  correlationId: string;
}

export function assertReportExecutionScope(request: ReportExecutionRequest): void {
  if (!request.companyId) throw new Error('REPORT_COMPANY_SCOPE_REQUIRED');
  if (!request.runId) throw new Error('REPORT_RUN_ID_REQUIRED');
  if (!request.reportId) throw new Error('REPORT_ID_REQUIRED');
  if (!request.semanticDefinitionVersion) throw new Error('REPORT_DEFINITION_VERSION_REQUIRED');
  if (!request.snapshotId) throw new Error('REPORT_SNAPSHOT_REQUIRED');
}

export function buildInitialEvidence(
  request: ReportExecutionRequest,
  correlationId: string,
): ReportExecutionEvidence {
  assertReportExecutionScope(request);
  return {
    runId: request.runId,
    companyId: request.companyId,
    reportId: request.reportId,
    snapshotId: request.snapshotId,
    semanticDefinitionVersion: request.semanticDefinitionVersion,
    status: 'queued',
    output: request.output,
    correlationId,
  };
}
