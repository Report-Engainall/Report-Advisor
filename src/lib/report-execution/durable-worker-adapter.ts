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

type LeaseContext = {
  tenantId: string;
  workerId: string;
  leaseToken: string;
};

export class SupabaseReportExecutionStore {
  private readonly client: SupabaseClient;
  private readonly leases = new Map<string, LeaseContext>();

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async enqueue(
    companyId: string,
    jobKey: string,
    sourcePath: string,
    sourceHash: string,
    evidenceKeys: string[] = [],
    maxAttempts = 3,
  ): Promise<DurableExecutionJob> {
    const { data, error } = await this.client.rpc('enqueue_report_execution_job', {
      p_company_id: companyId,
      p_job_key: jobKey,
      p_source_path: sourcePath,
      p_source_hash: sourceHash,
      p_evidence_keys: evidenceKeys,
      p_max_attempts: maxAttempts,
    });
    if (error) throw error;
    return this.fromRpcJob(data);
  }

  async claim(jobId: string, workerId: string, leaseSeconds = 300): Promise<DurableExecutionJob> {
    const current = await this.require(jobId);
    const { data, error } = await this.client.rpc('claim_report_execution_job', {
      p_job_id: jobId,
      p_company_id: current.tenantId,
      p_lease_owner: workerId,
      p_lease_seconds: leaseSeconds,
    });
    if (error) throw error;
    if (!data || typeof data !== 'object') throw new Error('Report execution job could not be claimed');

    const job = this.fromRpcJob(data);
    if (!job.leaseToken) throw new Error('Report execution claim returned no lease token');
    this.leases.set(jobId, { tenantId: job.tenantId, workerId, leaseToken: job.leaseToken });
    return job;
  }

  async heartbeat(jobId: string, workerId: string, leaseSeconds = 300): Promise<void> {
    const lease = this.requireLease(jobId, workerId);
    const { data, error } = await this.client.rpc('heartbeat_report_execution_job', {
      p_job_id: jobId,
      p_company_id: lease.tenantId,
      p_worker_id: workerId,
      p_lease_token: lease.leaseToken,
      p_lease_seconds: leaseSeconds,
    });
    if (error) throw error;
    if (data !== true) throw new Error('Heartbeat rejected: active worker lease is missing, expired, or no longer owns the job');
  }

  async saveCheckpoint(jobId: string, checkpoint: ReportExecutionCheckpoint, workerId?: string): Promise<void> {
    if (!workerId) throw new Error('Checkpoint persistence requires the active worker lease owner');
    const lease = this.requireLease(jobId, workerId);
    const { data, error } = await this.client.rpc('advance_report_execution_checkpoint', {
      p_job_id: jobId,
      p_company_id: lease.tenantId,
      p_worker_id: workerId,
      p_lease_token: lease.leaseToken,
      p_checkpoint: checkpoint,
    });
    if (error) throw error;
    if (data !== true) throw new Error('Checkpoint rejected: lease is missing, expired, or no longer owns the job');
  }

  async complete(jobId: string, workerId: string, evidence: Record<string, unknown> = {}): Promise<void> {
    const lease = this.requireLease(jobId, workerId);
    const { data, error } = await this.client.rpc('complete_report_execution_job', {
      p_job_id: jobId,
      p_company_id: lease.tenantId,
      p_worker_id: workerId,
      p_lease_token: lease.leaseToken,
      p_evidence: evidence,
    });
    if (error) throw error;
    if (data !== true) throw new Error('Completion rejected: active worker lease is missing or expired');
    this.leases.delete(jobId);
  }

  async fail(jobId: string, workerId: string, errorPayload: Record<string, unknown>): Promise<void> {
    const lease = this.requireLease(jobId, workerId);
    const { data, error } = await this.client.rpc('fail_report_execution_job', {
      p_job_id: jobId,
      p_company_id: lease.tenantId,
      p_worker_id: workerId,
      p_lease_token: lease.leaseToken,
      p_error: errorPayload,
    });
    if (error) throw error;
    if (data !== true) throw new Error('Failure update rejected: active worker lease is missing');
    this.leases.delete(jobId);
  }

  async retry(jobId: string): Promise<void> {
    const current = await this.require(jobId);
    const { data, error } = await this.client.rpc('retry_report_execution_job', {
      p_job_id: jobId,
      p_company_id: current.tenantId,
    });
    if (error) throw error;
    if (data !== true) throw new Error('Retry rejected: job is not failed, belongs to another tenant, or has exhausted its retry budget');
  }

  async require(jobId: string): Promise<DurableExecutionJob> {
    const { data, error } = await this.client
      .from('report_execution_jobs')
      .select('id,company_id,status,checkpoint,attempt,max_attempts,lease_owner,lease_token,lease_expires_at')
      .eq('id', jobId)
      .single();
    if (error) throw error;
    return this.fromRpcJob(data);
  }

  static requestIdentity(request: ReportExecutionRequest): string {
    if (!request.tenantId || !request.idempotencyKey) throw new Error('Durable execution requires tenant and idempotency context');
    return `${request.tenantId}:${request.idempotencyKey}:${request.sourceSnapshotId ?? 'latest'}`;
  }

  private requireLease(jobId: string, workerId: string): LeaseContext {
    const lease = this.leases.get(jobId);
    if (!lease || lease.workerId !== workerId) {
      throw new Error('Active worker lease context is unavailable; claim the job before mutating its durable state');
    }
    return lease;
  }

  private fromRpcJob(value: unknown): DurableExecutionJob {
    if (!value || typeof value !== 'object') throw new Error('Invalid durable execution job payload');
    const row = value as Record<string, unknown>;
    if (!row.id || !row.company_id || !row.checkpoint) throw new Error('Incomplete durable execution job payload');
    return {
      id: String(row.id),
      tenantId: String(row.company_id),
      status: String(row.status ?? ''),
      checkpoint: row.checkpoint as ReportExecutionCheckpoint,
      attempt: Number(row.attempt ?? 0),
      maxAttempts: Number(row.max_attempts ?? 0),
      leaseOwner: row.lease_owner == null ? null : String(row.lease_owner),
      leaseToken: row.lease_token == null ? null : String(row.lease_token),
      leaseExpiresAt: row.lease_expires_at == null ? null : String(row.lease_expires_at),
    };
  }
}
