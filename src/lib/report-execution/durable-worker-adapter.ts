import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReportExecutionRequest } from './report-execution-contract';
import type { ReportExecutionCheckpoint } from './checkpoint';

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

export class SupabaseReportExecutionStore {
  constructor(private readonly client: SupabaseClient) {}

  async claim(jobId: string, workerId: string, leaseSeconds = 300): Promise<DurableExecutionJob> {
    const { data, error } = await this.client.rpc('claim_report_execution_job', { p_job_id: jobId, p_lease_owner: workerId, p_lease_seconds: leaseSeconds });
    if (error) throw error;
    if (data !== true) throw new Error('Report execution job could not be claimed');
    return this.require(jobId);
  }

  async heartbeat(jobId: string, workerId: string, leaseSeconds = 300): Promise<void> {
    const { data, error } = await this.client.rpc('heartbeat_report_execution_job', { p_job_id: jobId, p_worker_id: workerId, p_lease_seconds: leaseSeconds });
    if (error) throw error;
    if (data !== true) throw new Error('Heartbeat rejected: active worker lease is missing, expired, or no longer owns the job');
  }

  async saveCheckpoint(jobId: string, checkpoint: ReportExecutionCheckpoint, workerId?: string): Promise<void> {
    if (!workerId) throw new Error('Checkpoint persistence requires the active worker lease owner');
    const { data, error } = await this.client.rpc('advance_report_execution_checkpoint', { p_job_id: jobId, p_worker_id: workerId, p_checkpoint: checkpoint });
    if (error) throw error;
    if (data !== true) throw new Error('Checkpoint rejected: lease is missing, expired, or no longer owns the job');
  }

  async complete(jobId: string, workerId: string, evidence: Record<string, unknown> = {}): Promise<void> {
    const { data, error } = await this.client.rpc('complete_report_execution_job', { p_job_id: jobId, p_worker_id: workerId, p_evidence: evidence });
    if (error) throw error;
    if (data !== true) throw new Error('Completion rejected: active worker lease is missing or expired');
  }

  async fail(jobId: string, workerId: string, errorPayload: Record<string, unknown>): Promise<void> {
    const { data, error } = await this.client.rpc('fail_report_execution_job', { p_job_id: jobId, p_worker_id: workerId, p_error: errorPayload });
    if (error) throw error;
    if (data !== true) throw new Error('Failure update rejected: active worker lease is missing');
  }

  async retry(jobId: string): Promise<void> {
    const { data, error } = await this.client.rpc('retry_report_execution_job', { p_job_id: jobId });
    if (error) throw error;
    if (data !== true) throw new Error('Retry rejected: job is not failed, belongs to another tenant, or has exhausted its retry budget');
  }

  async require(jobId: string): Promise<DurableExecutionJob> {
    const { data, error } = await this.client.from('report_execution_jobs').select('id,company_id,status,checkpoint,attempt,max_attempts,lease_owner,lease_expires_at').eq('id', jobId).single();
    if (error) throw error;
    return { id: data.id, tenantId: data.company_id, status: data.status, checkpoint: data.checkpoint, attempt: data.attempt, maxAttempts: data.max_attempts, leaseOwner: data.lease_owner, leaseExpiresAt: data.lease_expires_at };
  }

  static requestIdentity(request: ReportExecutionRequest): string {
    if (!request.tenantId || !request.idempotencyKey) throw new Error('Durable execution requires tenant and idempotency context');
    return `${request.tenantId}:${request.idempotencyKey}:${request.sourceSnapshotId ?? 'latest'}`;
  }
}
