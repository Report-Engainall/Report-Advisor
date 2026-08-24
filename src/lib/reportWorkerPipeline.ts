import type { ReportExecutionEvidence, ReportExecutionRequest } from './reportExecutionContract';
import { assertReportExecutionScope, buildInitialEvidence } from './reportExecutionContract';
import { assertTrustedWorkerExecution } from './reportWorkerAdapter';

export type WorkerClaim = { runId: string; companyId: string; workerId: string; leaseExpiresAt: string };
export type RenderedArtifact = { runId: string; format: ReportExecutionRequest['output']; artifactRef: string; checksum: string; sizeBytes: number };
export type DeliveryResult = { runId: string; deliveryRef: string; deliveredAt: string; destination: string };

export interface ReportWorkerPipeline {
  claim(request: ReportExecutionRequest, workerId: string, now?: Date): WorkerClaim;
  render(request: ReportExecutionRequest, claim: WorkerClaim): RenderedArtifact;
  complete(request: ReportExecutionRequest, claim: WorkerClaim, artifact: RenderedArtifact, delivery: DeliveryResult): ReportExecutionEvidence;
}

const LEASE_MS = 5 * 60 * 1000;

export function createReportWorkerPipeline(): ReportWorkerPipeline {
  return {
    claim(request, workerId, now = new Date()) {
      assertReportExecutionScope(request);
      assertTrustedWorkerExecution({ companyId: request.companyId, runId: request.runId, workerId, leaseExpiresAt: new Date(now.getTime() + LEASE_MS).toISOString() });
      return { runId: request.runId, companyId: request.companyId, workerId, leaseExpiresAt: new Date(now.getTime() + LEASE_MS).toISOString() };
    },
    render(request, claim) {
      assertActiveClaim(request, claim);
      const payload = `${request.companyId}:${request.reportId}:${request.snapshotId}:${request.semanticDefinitionVersion}:${request.output}`;
      return { runId: request.runId, format: request.output, artifactRef: `artifact://${request.runId}/${request.output}`, checksum: stableChecksum(payload), sizeBytes: new TextEncoder().encode(payload).byteLength };
    },
    complete(request, claim, artifact, delivery) {
      assertActiveClaim(request, claim);
      if (artifact.runId !== request.runId || delivery.runId !== request.runId) throw new Error('REPORT_RUN_EVIDENCE_MISMATCH');
      if (artifact.format !== request.output) throw new Error('REPORT_OUTPUT_FORMAT_MISMATCH');
      if (!artifact.checksum || !artifact.artifactRef) throw new Error('REPORT_ARTIFACT_INTEGRITY_REQUIRED');
      if (!delivery.deliveryRef || !delivery.deliveredAt) throw new Error('REPORT_DELIVERY_EVIDENCE_REQUIRED');
      const evidence = buildInitialEvidence(request, `report:${request.runId}`);
      return { ...evidence, status: 'succeeded', startedAt: new Date().toISOString(), completedAt: delivery.deliveredAt, artifactRef: artifact.artifactRef, deliveryRef: delivery.deliveryRef };
    },
  };
}

function assertActiveClaim(request: ReportExecutionRequest, claim: WorkerClaim, now = new Date()): void {
  if (claim.runId !== request.runId || claim.companyId !== request.companyId) throw new Error('REPORT_CLAIM_SCOPE_MISMATCH');
  if (new Date(claim.leaseExpiresAt).getTime() <= now.getTime()) throw new Error('REPORT_CLAIM_EXPIRED');
}

function stableChecksum(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) hash = Math.imul(hash ^ input.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}
