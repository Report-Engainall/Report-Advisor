  task_key: string;
  stage: string;
  ordinal: number;
  label: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  worker_id: string | null;
  attempt: number;
  started_at: string | null;
  completed_at: string | null;
  last_error: Record<string, unknown>;
  evidence: Record<string, unknown>;
};

export async function fetchReportExecutionTasks(jobId: string): Promise<ReportExecutionTaskRecord[]> {
  if (!jobId.trim()) throw new Error('REPORT_EXECUTION_JOB_ID_REQUIRED');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('report_execution_tasks')
    .select('id,report_execution_job_id,task_key,stage,ordinal,label,status,worker_id,attempt,started_at,completed_at,last_error,evidence')
    .eq('company_id', companyId).eq('report_execution_job_id', jobId).order('ordinal', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id), report_execution_job_id: String(row.report_execution_job_id), task_key: String(row.task_key),
    stage: String(row.stage), ordinal: Number(row.ordinal), label: String(row.label),
    status: row.status as ReportExecutionTaskRecord['status'], worker_id: row.worker_id ? String(row.worker_id) : null,
    attempt: Number(row.attempt ?? 0), started_at: row.started_at ? String(row.started_at) : null,
    completed_at: row.completed_at ? String(row.completed_at) : null,
    last_error: row.last_error && typeof row.last_error === 'object' ? row.last_error as Record<string, unknown> : {},
    evidence: row.evidence && typeof row.evidence === 'object' ? row.evidence as Record<string, unknown> : {},
  }));
}


export type ReportExecutionJobRecord = {
  id: string;
  company_id: string;
  status: string;
  checkpoint: Record<string, unknown>;
  evidence: Record<string, unknown>;
  attempt: number;
  max_attempts: number;
  completed_at: string | null;
  updated_at: string;
};

export type RenderedReportOutput = {
  key: string;
  path: string;
  label: string;
  eligibility: string;
  rendered: boolean;
  sourceHash: string;
  importId: string;
};

export type RenderedReportManifest = {
  contractVersion: string;
  renderedAt: string;
  sourceBound: boolean;
  sourceHash: string;
  importId: string;
  entityType: string;
  sourceSpecialty: string | null;
  rowCount: number;
  qualityScore: number;
  evidenceStatus: string;
  outputs: RenderedReportOutput[];
};

export function getBoundRenderedReportManifest(
  job: ReportExecutionJobRecord | null,
  expectedImportId: string,
  expectedSourceHash: string,
): RenderedReportManifest | null {
  if (!job || !expectedImportId.trim() || !expectedSourceHash.trim()) return null;
  const raw = job.evidence?.renderedOutput;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const manifest = raw as Record<string, unknown>;
  if (
    manifest.sourceBound !== true ||
    manifest.importId !== expectedImportId ||
    manifest.sourceHash !== expectedSourceHash ||
    typeof manifest.contractVersion !== 'string' ||
    typeof manifest.renderedAt !== 'string' ||
    typeof manifest.entityType !== 'string' ||
    !Array.isArray(manifest.outputs) ||
    manifest.outputs.length === 0
  ) return null;
  const outputs: RenderedReportOutput[] = [];
  for (const value of manifest.outputs) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const output = value as Record<string, unknown>;
    if (
      typeof output.key !== 'string' ||
      typeof output.path !== 'string' ||
      typeof output.label !== 'string' ||
      typeof output.eligibility !== 'string' ||
      output.rendered !== true ||
      output.importId !== expectedImportId ||
      output.sourceHash !== expectedSourceHash
    ) return null;
    outputs.push({
      key: output.key,
      path: output.path,
      label: output.label,
      eligibility: output.eligibility,
      rendered: true,
      sourceHash: output.sourceHash,
      importId: output.importId,
    });
  }
  return {
    contractVersion: manifest.contractVersion,
    renderedAt: manifest.renderedAt,
    sourceBound: true,
    sourceHash: manifest.sourceHash,
    importId: manifest.importId,
    entityType: manifest.entityType,
    sourceSpecialty: typeof manifest.sourceSpecialty === 'string' ? manifest.sourceSpecialty : null,
    rowCount: typeof manifest.rowCount === 'number' ? manifest.rowCount : 0,
    qualityScore: typeof manifest.qualityScore === 'number' ? manifest.qualityScore : 0,
    evidenceStatus: typeof manifest.evidenceStatus === 'string' ? manifest.evidenceStatus : 'REVIEW',
    outputs,
  };
}

export async function fetchReportExecutionJob(jobId: string): Promise<ReportExecutionJobRecord | null> {
  if (!jobId.trim()) throw new Error('REPORT_EXECUTION_JOB_ID_REQUIRED');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('report_execution_jobs')
    .select('id,company_id,status,checkpoint,evidence,attempt,max_attempts,completed_at,updated_at')
    .eq('company_id', companyId).eq('id', jobId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: String(data.id),
    company_id: String(data.company_id),
    status: String(data.status),
    checkpoint: data.checkpoint && typeof data.checkpoint === 'object' ? data.checkpoint as Record<string, unknown> : {},
    evidence: data.evidence && typeof data.evidence === 'object' ? data.evidence as Record<string, unknown> : {},
    attempt: Number(data.attempt ?? 0),
    max_attempts: Number(data.max_attempts ?? 0),
    completed_at: data.completed_at ? String(data.completed_at) : null,
    updated_at: String(data.updated_at),
  };
}

export async function fetchWorkerHealthSnapshot(): Promise<WorkerHealthSnapshot> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const now = new Date();
  const [queuedResult, activeResult] = await Promise.all([
    supabase
      .from('report_execution_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'queued'),
    supabase
      .from('report_execution_jobs')
      .select('status,lease_expires_at', { count: 'exact' })
      .eq('company_id', companyId)
      .in('status', ['leased', 'processing'])
      .order('lease_expires_at', { ascending: true })
      .range(0, 499),
  ]);

  if (queuedResult.error) throw queuedResult.error;
  if (activeResult.error) throw activeResult.error;

  const activeRows = (activeResult.data ?? []) as Array<{ status: string; lease_expires_at: string | null }>;
  const activeTotal = activeResult.count ?? activeRows.length;
  const expiredActive = activeRows.filter((row) => {
    if (!row.lease_expires_at) return false;
    const expiresAt = new Date(row.lease_expires_at);
    return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= now.getTime();
  }).length;

  return {
    queued: queuedResult.count ?? 0,
    active: activeTotal,
    expiredActive,
    activeReadComplete: activeTotal <= activeRows.length,
  };
}