import type {
  ReportExecutionEvidence,
  ReportExecutionRequest,
} from './reportExecutionContract';

export type ReportWorkerLease = {
  leaseId: string;
  runId: string;
  companyId: string;
  claimedAt: string;
  leaseExpiresAt: string;
};

export type ReportArtifact = {
  runId: string;
  format: 'web' | 'pdf' | 'xlsx';
  artifactRef: string;
  checksum: string;
  createdAt: string;
};

export type ReportDeliveryResult = {
  runId: string;
  deliveryRef: string;
  channel: 'in_app' | 'email' | 'download';
  deliveredAt: string;
  status: 'delivered' | 'failed';
};

export interface TrustedReportWorker {
  queue(request: ReportExecutionRequest): Promise<ReportExecutionEvidence>;
  claim(runId: string, companyId: string, leaseSeconds?: number): Promise<ReportWorkerLease>;
  render(request: ReportExecutionRequest, lease: ReportWorkerLease): Promise<ReportArtifact>;
  deliver(artifact: ReportArtifact, channel?: ReportDeliveryResult['channel']): Promise<ReportDeliveryResult>;
}

export function assertTrustedWorkerContext(lease: ReportWorkerLease, companyId: string, runId: string): void {
  if (!companyId || lease.companyId !== companyId) throw new Error('REPORT_WORKER_COMPANY_SCOPE_MISMATCH');
  if (!runId || lease.runId !== runId) throw new Error('REPORT_WORKER_RUN_SCOPE_MISMATCH');
  if (Date.parse(lease.leaseExpiresAt) <= Date.now()) throw new Error('REPORT_WORKER_LEASE_EXPIRED');
}

export function buildWorkerLease(runId: string, companyId: string, leaseSeconds = 300, now = new Date()): ReportWorkerLease {
  if (leaseSeconds < 30 || leaseSeconds > 3600) throw new Error('REPORT_WORKER_LEASE_INVALID');
  if (!runId || !companyId) throw new Error('REPORT_WORKER_SCOPE_REQUIRED');
  const claimedAt = now.toISOString();
  return {
    leaseId: `${companyId}:${runId}:${now.getTime()}`,
    runId,
    companyId,
    claimedAt,
    leaseExpiresAt: new Date(now.getTime() + leaseSeconds * 1000).toISOString(),
  };
}

export function assertArtifactIntegrity(artifact: ReportArtifact, request: ReportExecutionRequest): void {
  assertTrustedWorkerContext(
    {
      leaseId: 'artifact-check',
      runId: artifact.runId,
      companyId: request.companyId,
      claimedAt: artifact.createdAt,
      leaseExpiresAt: new Date(Date.now() + 1).toISOString(),
    },
    request.companyId,
    request.runId,
  );
  if (!artifact.artifactRef || !artifact.checksum) throw new Error('REPORT_ARTIFACT_INTEGRITY_REQUIRED');
  if (artifact.format !== request.output) throw new Error('REPORT_ARTIFACT_FORMAT_MISMATCH');
}
