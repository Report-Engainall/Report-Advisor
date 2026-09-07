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
  leaseToken: string | null;
  leaseExpiresAt: string | null;
}

export class SupabaseReportExecutionStore {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async claim(jobId: string, workerId: string, leaseSeconds = 300, tenantId?: string): Promise<DurableExecutionJob> {
    const tenant = tenantId ?? (await this.require(jobId)).tenantId;
    const { data, error } = await this.client.rpc('claim_report_execution_job', { p_job_id: jobId, p_company_id: tenant, p_lease_owner: workerId, p_lease_seconds: leaseSeconds });
    if (error) throw error;
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Report execution job could not be claimed');
    const row = data as Record<string, unknown>;
    const leaseToken = typeof row.lease_token === 'string' ? row.lease_token : null;
    if (!leaseToken) throw new Error('Durable worker claim did not return a fencing lease token');
    if (row.company_id !== tenant || row.lease_owner !== workerId) throw new Error('Claimed durable job does not match the requested tenant or worker');
    return {
      id: String(row.id),
      tenantId: String(row.company_id),
      status: String(row.status),
      checkpoint: row.checkpoint as ReportExecutionCheckpoint,
      attempt: Number(row.attempt),
      maxAttempts: Number(row.max_attempts),
      leaseOwner: row.lease_owner as string | null,
      leaseToken,
      leaseExpiresAt: row.lease_expires_at as string | null,
    };
  }

  async heartbeat(jobId: string, workerId: string, leaseSeconds = 300, tenantId?: string): Promise<void> {
    const tenant = tenantId ?? (await this.require(jobId)).tenantId;
    const job = await this.require(jobId);
    if (job.tenantId !== tenant) throw new Error('Worker tenant context does not match the durable job tenant');
    if (!job.leaseToken) throw new Error('Worker lease token is missing');
    const { data, error } = await this.client.rpc('heartbeat_report_execution_job', { p_job_id: jobId, p_company_id: tenant, p_worker_id: workerId, p_lease_token: job.leaseToken, p_lease_seconds: leaseSeconds });
    if (error) throw error;
    if (data !== true) throw new Error('Heartbeat rejected: active worker lease is missing, expired, or no longer owns the job');
  }

  async saveCheckpoint(jobId: string, checkpoint: ReportExecutionCheckpoint, workerId?: string, tenantId?: string): Promise<void> {
    if (!workerId) throw new Error('Checkpoint persistence requires the active worker lease owner');
    const tenant = tenantId ?? (await this.require(jobId)).tenantId;
    const job = await this.require(jobId);
    if (job.tenantId !== tenant) throw new Error('Worker tenant context does not match the durable job tenant');
    if (!job.leaseToken) throw new Error('Worker lease token is missing');
    const { data, error } = await this.client.rpc('advance_report_execution_checkpoint', { p_job_id: jobId, p_company_id: tenant, p_worker_id: workerId, p_lease_token: job.leaseToken, p_checkpoint: checkpoint });
    if (error) throw error;
    if (data !== true) throw new Error('Checkpoint rejected: lease is missing, expired, or no longer owns the job');
  }

  async complete(jobId: string, workerId: string, evidence: Record<string, unknown> = {}, tenantId?: string): Promise<void> {
    const tenant = tenantId ?? (await this.require(jobId)).tenantId;
    const job = await this.require(jobId);
    if (job.tenantId !== tenant) throw new Error('Worker tenant context does not match the durable job tenant');
    if (!job.leaseToken) throw new Error('Worker lease token is missing');
    const { data, error } = await this.client.rpc('complete_report_execution_job', { p_job_id: jobId, p_company_id: tenant, p_worker_id: workerId, p_lease_token: job.leaseToken, p_evidence: evidence });
    if (error) throw error;
    if (data !== true) throw new Error('Completion rejected: active worker lease is missing or expired');
  }

  async fail(jobId: string, workerId: string, errorPayload: Record<string, unknown>, tenantId?: string): Promise<void> {
    const tenant = tenantId ?? (await this.require(jobId)).tenantId;
    const job = await this.require(jobId);
    if (job.tenantId !== tenant) throw new Error('Worker tenant context does not match the durable job tenant');
    if (!job.leaseToken) throw new Error('Worker lease token is missing');
    const { data, error } = await this.client.rpc('fail_report_execution_job', { p_job_id: jobId, p_company_id: tenant, p_worker_id: workerId, p_lease_token: job.leaseToken, p_error: errorPayload });
    if (error) throw error;
    if (data !== true) throw new Error('Failure update rejected: active worker lease is missing');
  }

  async retry(jobId: string, tenantId?: string): Promise<void> {
    const tenant = tenantId ?? (await this.require(jobId)).tenantId;
    const job = await this.require(jobId);
    if (job.tenantId !== tenant) throw new Error('Worker tenant context does not match the durable job tenant');
    const { data, error } = await this.client.rpc('retry_report_execution_job', { p_job_id: jobId, p_company_id: tenant });
    if (error) throw error;
    if (data !== true) throw new Error('Retry rejected: job is not failed, belongs to another tenant, or has exhausted its retry budget');
  }

  async require(jobId: string): Promise<DurableExecutionJob> {
    const { data, error } = await this.client.from('report_execution_jobs').select('id,company_id,status,checkpoint,attempt,max_attempts,lease_owner,lease_token,lease_expires_at').eq('id', jobId).single();
    if (error) throw error;
    return { id: data.id, tenantId: data.company_id, status: data.status, checkpoint: data.checkpoint, attempt: data.attempt, maxAttempts: data.max_attempts, leaseOwner: data.lease_owner, leaseToken: data.lease_token, leaseExpiresAt: data.lease_expires_at };
  }

  static requestIdentity(request: ReportExecutionRequest): string {
    if (!request.tenantId || !request.idempotencyKey) throw new Error('Durable execution requires tenant and idempotency context');
    return `${request.tenantId}:${request.idempotencyKey}:${request.sourceSnapshotId ?? 'latest'}`;
  }
}
