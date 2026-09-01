import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReportExecutionRequest } from './report-execution-contract.ts';
import type { ReportExecutionCheckpoint } from './checkpoint.ts';

export interface DurableExecutionJob {
  id: string;
  tenantId: string;
  status: string;
  checkpoint: ReportExecutionCheckpoint;
  attempt: number;
  maxAttempts: number;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
}

function requireNonBlank(value: unknown, message: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(message);
}

function requirePositiveLease(leaseSeconds: number): void {
  if (!Number.isInteger(leaseSeconds) || leaseSeconds <= 0) throw new Error('Worker lease duration must be a positive integer');
}

export class SupabaseReportExecutionStore {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async claim(jobId: string, workerId: string, leaseSeconds = 300): Promise<DurableExecutionJob> {
    requireNonBlank(jobId, 'Report execution job id is required');
    requireNonBlank(workerId, 'Report execution worker id is required');
    requirePositiveLease(leaseSeconds);
    const { data, error } = await this.client.rpc('claim_report_execution_job', { p_job_id: jobId, p_lease_owner: workerId, p_lease_seconds: leaseSeconds });
    if (error) throw error;
    if (data !== true) throw new Error('Report execution job could not be claimed');
    return this.require(jobId);
  }

  async heartbeat(jobId: string, workerId: string, leaseSeconds = 300): Promise<void> {
    requireNonBlank(jobId, 'Report execution job id is required');
    requireNonBlank(workerId, 'Report execution worker id is required');
    requirePositiveLease(leaseSeconds);
    const { data, error } = await this.client.rpc('heartbeat_report_execution_job', { p_job_id: jobId, p_worker_id: workerId, p_lease_seconds: leaseSeconds });
    if (error) throw error;
    if (data !== true) throw new Error('Heartbeat rejected: active worker lease is missing, expired, or no longer owns the job');
  }

  async saveCheckpoint(jobId: string, checkpoint: ReportExecutionCheckpoint, workerId?: string): Promise<void> {
    requireNonBlank(jobId, 'Report execution job id is required');
    if (!workerId) throw new Error('Checkpoint persistence requires the active worker lease owner');
    requireNonBlank(workerId, 'Report execution worker id is required');
    const { data, error } = await this.client.rpc('advance_report_execution_checkpoint', { p_job_id: jobId, p_worker_id: workerId, p_checkpoint: checkpoint });
    if (error) throw error;
    if (data !== true) throw new Error('Checkpoint rejected: lease is missing, expired, or no longer owns the job');
  }

  async complete(jobId: string, workerId: string, evidence: Record<string, unknown> = {}): Promise<void> {
    requireNonBlank(jobId, 'Report execution job id is required');
    requireNonBlank(workerId, 'Report execution worker id is required');
    const { data, error } = await this.client.rpc('complete_report_execution_job', { p_job_id: jobId, p_worker_id: workerId, p_evidence: evidence });
    if (error) throw error;
    if (data !== true) throw new Error('Completion rejected: active worker lease is missing or expired');
  }

  async fail(jobId: string, workerId: string, errorPayload: Record<string, unknown>): Promise<void> {
    requireNonBlank(jobId, 'Report execution job id is required');
    requireNonBlank(workerId, 'Report execution worker id is required');
    const { data, error } = await this.client.rpc('fail_report_execution_job', { p_job_id: jobId, p_worker_id: workerId, p_error: errorPayload });
    if (error) throw error;
    if (data !== true) throw new Error('Failure update rejected: active worker lease is missing');
  }

  async retry(jobId: string): Promise<void> {
    requireNonBlank(jobId, 'Report execution job id is required');
    const { data, error } = await this.client.rpc('retry_report_execution_job', { p_job_id: jobId });
    if (error) throw error;
    if (data !== true) throw new Error('Retry rejected: job is not failed, belongs to another tenant, or has exhausted its retry budget');
  }

  async require(jobId: string): Promise<DurableExecutionJob> {
    requireNonBlank(jobId, 'Report execution job id is required');
    const { data, error } = await this.client.from('report_execution_jobs').select('id,company_id,status,checkpoint,attempt,max_attempts,lease_owner,lease_expires_at').eq('id', jobId).single();
    if (error) throw error;
    return { id: data.id, tenantId: data.company_id, status: data.status, checkpoint: data.checkpoint, attempt: data.attempt, maxAttempts: data.max_attempts, leaseOwner: data.lease_owner, leaseExpiresAt: data.lease_expires_at };
  }

  static requestIdentity(request: ReportExecutionRequest): string {
    requireNonBlank(request.tenantId, 'Durable execution requires tenant and idempotency context');
    requireNonBlank(request.idempotencyKey, 'Durable execution requires tenant and idempotency context');
    if (request.sourceSnapshotId !== undefined && !request.sourceSnapshotId.trim()) throw new Error('Durable execution source snapshot id cannot be blank');
    return `${request.tenantId}:${request.idempotencyKey}:${request.sourceSnapshotId ?? 'latest'}`;
  }
}
