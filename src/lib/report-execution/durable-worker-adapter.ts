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

  async enqueue(request: ReportExecutionRequest, sourcePath: string, sourceHash: string, evidenceKeys: string[] = [], maxAttempts = 3): Promise<DurableExecutionJob> {
    if (!request.sourceSnapshotId) throw new Error('Report execution requires a source snapshot');
    if (!request.tenantId || !request.idempotencyKey) throw new Error('Durable execution requires tenant and idempotency context');
    if (!sourcePath.trim()) throw new Error('Report execution source path is required');
    if (!/^sha256:[0-9a-fA-F]{64}$/.test(sourceHash)) throw new Error('Report execution source hash is invalid');
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) throw new Error('Report execution max attempts is invalid');

    const { data: snapshot, error: snapshotError } = await this.client
      .from('source_analysis_snapshots')
      .select('id,company_id,source_hash,source_path')
      .eq('id', request.sourceSnapshotId)
      .eq('company_id', request.tenantId)
      .single();
    if (snapshotError) throw snapshotError;
    if (!snapshot || snapshot.company_id !== request.tenantId) throw new Error('Report source snapshot tenant mismatch');
    if (snapshot.source_hash !== sourceHash) throw new Error('Report source snapshot hash mismatch');
    if (snapshot.source_path !== sourcePath) throw new Error('Report source snapshot path mismatch');

    const jobKey = `report:${request.reportId}:${request.idempotencyKey}:${request.sourceSnapshotId}`;
    const boundEvidenceKeys = [...new Set([`source:snapshot:${request.sourceSnapshotId}`, ...evidenceKeys])];
    const { data, error } = await this.client.rpc('enqueue_report_execution_job', {
      p_company_id: request.tenantId,
      p_job_key: jobKey,
      p_source_path: sourcePath,
      p_source_hash: sourceHash,
      p_evidence_keys: boundEvidenceKeys,
      p_max_attempts: maxAttempts,
    });
    if (error) throw error;
    if (!data || typeof data !== 'object' || typeof data.id !== 'string') throw new Error('Durable report execution enqueue returned no job');
    const job = await this.require(data.id);
    if (job.tenantId !== request.tenantId) throw new Error('Enqueued durable job tenant does not match request tenant');
    if (job.checkpoint?.sourceHash !== sourceHash) throw new Error('Enqueued durable job source hash does not match request');
    return job;
  }

  async claim(jobId: string, workerId: string, leaseSeconds = 300, tenantId: string): Promise<DurableExecutionJob> {
    const { data, error } = await this.client.rpc('claim_report_execution_job', { p_job_id: jobId, p_company_id: tenantId, p_lease_owner: workerId, p_lease_seconds: leaseSeconds });
    if (error) throw error;
    if (!data || typeof data !== 'object') throw new Error('Report execution job could not be claimed');
    const job = await this.require(jobId);
    if (job.tenantId !== tenantId) throw new Error('Claimed durable job tenant does not match request tenant');
    if (!job.leaseToken) throw new Error('Claimed durable job lease token is missing');
    const { data: queuedTask, error: queuedTaskError } = await this.client
      .from('report_execution_tasks')
      .select('status')
      .eq('company_id', job.tenantId)
      .eq('report_execution_job_id', jobId)
      .eq('stage', 'queued')
      .maybeSingle();
    if (queuedTaskError) throw queuedTaskError;
    if (queuedTask?.status === 'queued') {
      await this.startTask(jobId, workerId, job.leaseToken, 'queued', tenantId);
      await this.completeTask(jobId, workerId, job.leaseToken, 'queued', { claimedAt: new Date().toISOString() }, tenantId);
    }
    return job;
  }

  async startTask(jobId: string, workerId: string, leaseToken: string, stage: string, tenantId: string): Promise<void> {
    const job = await this.require(jobId);
    if (job.tenantId !== tenantId) throw new Error('Worker tenant context does not match the durable job tenant');
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const { data, error } = await this.client.rpc('start_report_execution_task', {
        p_job_id: jobId, p_company_id: tenantId, p_worker_id: workerId, p_lease_token: leaseToken, p_stage: stage,
      });
      if (error) throw error;
      if (data === true) return;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 150));
    }
    const state = await this.require(jobId);
    throw new Error(`Execution task start rejected for ${stage}: status=${state.status}; checkpoint=${JSON.stringify(state.checkpoint)}`);
  }

  async completeTask(jobId: string, workerId: string, leaseToken: string, stage: string, evidence: Record<string, unknown> = {}, tenantId: string): Promise<void> {
    const job = await this.require(jobId);
    if (job.tenantId !== tenantId) throw new Error('Worker tenant context does not match the durable job tenant');
    const { data, error } = await this.client.rpc('complete_report_execution_task', {
      p_job_id: jobId, p_company_id: tenantId, p_worker_id: workerId, p_lease_token: leaseToken, p_stage: stage, p_evidence: evidence,
    });
    if (error) throw error;
    if (data !== true) throw new Error('Execution task completion rejected for ' + stage);
  }

  async failTask(jobId: string, workerId: string, leaseToken: string, stage: string, errorPayload: Record<string, unknown>, tenantId: string): Promise<void> {
    const job = await this.require(jobId);
    if (job.tenantId !== tenantId) throw new Error('Worker tenant context does not match the durable job tenant');
    const { data, error } = await this.client.rpc('fail_report_execution_task', {
      p_job_id: jobId, p_company_id: tenantId, p_worker_id: workerId, p_lease_token: leaseToken, p_stage: stage, p_error: errorPayload,
    });
    if (error) throw error;
    if (data === true) return;
    const state = await this.require(jobId);
    const { data: task } = await this.client.from('report_execution_tasks')
      .select('status')
      .eq('company_id', tenantId)
      .eq('report_execution_job_id', jobId)
      .eq('stage', stage)
      .maybeSingle();
    if (task?.status === 'running') {
      throw new Error(`Execution task failure update rejected for ${stage}: job_status=${state.status}`);
    }
  }

  async heartbeat(jobId: string, workerId: string, leaseSeconds = 300, tenantId: string): Promise<void> {
    const job = await this.require(jobId);
    if (job.tenantId !== tenantId) throw new Error('Worker tenant context does not match the durable job tenant');
    if (!job.leaseToken) throw new Error('Worker lease token is missing');
    const { data, error } = await this.client.rpc('heartbeat_report_execution_job', { p_job_id: jobId, p_company_id: tenantId, p_worker_id: workerId, p_lease_token: job.leaseToken, p_lease_seconds: leaseSeconds });
    if (error) throw error;
    if (data !== true) throw new Error('Heartbeat rejected: active worker lease is missing, expired, or no longer owns the job');
  }

  async saveCheckpoint(jobId: string, checkpoint: ReportExecutionCheckpoint, workerId: string, tenantId: string): Promise<void> {
    const job = await this.require(jobId);
    if (job.tenantId !== tenantId) throw new Error('Worker tenant context does not match the durable job tenant');
    if (!job.leaseToken) throw new Error('Worker lease token is missing');
    const { data, error } = await this.client.rpc('advance_report_execution_checkpoint', { p_job_id: jobId, p_company_id: tenantId, p_worker_id: workerId, p_lease_token: job.leaseToken, p_checkpoint: checkpoint });
    if (error) throw error;
    if (data !== true) throw new Error('Checkpoint rejected: lease is missing, expired, or no longer owns the job');
  }

  async complete(jobId: string, workerId: string, evidence: Record<string, unknown> = {}, tenantId: string): Promise<void> {
    const job = await this.require(jobId);
    if (job.tenantId !== tenantId) throw new Error('Worker tenant context does not match the durable job tenant');
    if (!job.leaseToken) throw new Error('Worker lease token is missing');
    const { data, error } = await this.client.rpc('complete_report_execution_job', { p_job_id: jobId, p_company_id: tenantId, p_worker_id: workerId, p_lease_token: job.leaseToken, p_evidence: evidence });
    if (error) throw error;
    if (data !== true) throw new Error('Completion rejected: active worker lease is missing or expired');
  }

  async fail(jobId: string, workerId: string, errorPayload: Record<string, unknown>, tenantId: string): Promise<void> {
    const job = await this.require(jobId);
    if (job.tenantId !== tenantId) throw new Error('Worker tenant context does not match the durable job tenant');
    if (!job.leaseToken) throw new Error('Worker lease token is missing');
    const { data, error } = await this.client.rpc('fail_report_execution_job', { p_job_id: jobId, p_company_id: tenantId, p_worker_id: workerId, p_lease_token: job.leaseToken, p_error: errorPayload });
    if (error) throw error;
    if (data !== true) throw new Error('Failure update rejected: active worker lease is missing');
  }

  async retry(jobId: string, tenantId: string): Promise<void> {
    const job = await this.require(jobId);
    if (job.tenantId !== tenantId) throw new Error('Worker tenant context does not match the durable job tenant');
    const { data, error } = await this.client.rpc('retry_report_execution_job', { p_job_id: jobId, p_company_id: tenantId });
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
