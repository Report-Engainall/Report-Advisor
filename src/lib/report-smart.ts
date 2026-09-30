import { supabase, resolveCurrentCompanyId } from './supabase';

export type SmartReportCatalogItem = {
  jobId: string;
  sourcePath: string;
  sourceHash: string;
  entityType: string;
  rowCount: number | null;
  qualityScore: number | null;
  trustState: string | null;
  specialty: string | null;
  evidenceStatus: string | null;
  completedAt: string | null;
};

export type SmartReportDetail = SmartReportCatalogItem & {
  importId: string | null;
  checkpointStage: string | null;
  renderedOutput: Record<string, unknown>;
  sourceAnalysis: {
    id: string;
    importJobId: string | null;
    sourceFormat: string | null;
    analysisStatus: string | null;
    qualityScore: number | null;
    rowCount: number | null;
    columnCount: number | null;
    datasets: unknown[];
  } | null;
  stages: Array<{
    ordinal: number;
    stage: string;
    status: string;
    attempt: number;
    startedAt: string | null;
    completedAt: string | null;
    lastError: Record<string, unknown>;
    evidence: Record<string, unknown>;
  }>;
};

function renderedOutputOf(evidence: unknown): Record<string, unknown> | null {
  if (!evidence || typeof evidence !== 'object') return null;
  const value = (evidence as Record<string, unknown>).renderedOutput;
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function effectiveEvidenceStatus(
  rendered: Record<string, unknown>,
  sourceAnalysis: SmartReportDetail['sourceAnalysis'],
): string | null {
  const current = rendered.evidenceStatus == null ? null : String(rendered.evidenceStatus);
  if (
    current === 'AWAITING_EVIDENCE_SNAPSHOT' &&
    sourceAnalysis?.analysisStatus === 'analyzed' &&
    rendered.canonicalCommitVerified === true
  ) {
    return 'VERIFIED';
  }
  if (rendered.canonicalCommitVerified === true) return 'VERIFIED';
  return current;
}

function entityTypeFrom(jobKey: string): string {
  const parts = jobKey.split(':');
  return parts.length >= 3 ? parts.slice(2).join(':') : jobKey;
}

function isReportSourcePath(path: string): boolean {
  return /\.(xlsx|xls|xlsm|csv|tsv|ods|pdf|docx|doc|rtf|json|jsonl|txt|md|markdown|jpg|jpeg|png|webp|tiff|bmp)$/i.test(path);
}

function mapCatalogItem(job: Record<string, unknown>): SmartReportCatalogItem | null {
  const rendered = renderedOutputOf(job.evidence);
  const path = String(job.source_path ?? '');
  if (!rendered || !isReportSourcePath(path)) return null;
  if (/^(customer|product|invoice)-\d+/i.test(path)) return null;
  return {
    jobId: String(job.id),
    sourcePath: path || 'مصدر غير مسمى',
    sourceHash: String(job.source_hash ?? ''),
    entityType: entityTypeFrom(String(job.job_key ?? '')),
    rowCount: rendered.rowCount == null ? null : Number(rendered.rowCount),
    qualityScore: rendered.qualityScore == null ? null : Number(rendered.qualityScore),
    trustState: rendered.trustState == null ? null : String(rendered.trustState),
    specialty: rendered.sourceSpecialty == null ? null : String(rendered.sourceSpecialty),
    evidenceStatus: rendered.canonicalCommitVerified === true
      ? 'VERIFIED'
      : rendered.evidenceStatus == null ? null : String(rendered.evidenceStatus),
    completedAt: job.completed_at == null ? null : String(job.completed_at),
  };
}

export async function fetchSmartReportCatalog(limit = 60): Promise<SmartReportCatalogItem[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('REPORT_QUERY_INVALID_SMART_REPORT_LIMIT');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const { data: jobs, error } = await supabase
    .from('report_execution_jobs')
    .select('id,source_path,source_hash,job_key,status,checkpoint,evidence,completed_at')
    .eq('company_id', companyId)
    .eq('status', 'completed')
    .like('job_key', 'canonical-import:generic:%')
    .not('evidence->renderedOutput', 'is', null)
    .order('completed_at', { ascending: false })
    .range(0, limit - 1);

  if (error) throw error;
  return (jobs ?? [])
    .map((job) => mapCatalogItem(job as Record<string, unknown>))
    .filter((item): item is SmartReportCatalogItem => item !== null);
}

export async function fetchSmartReport(jobId: string): Promise<SmartReportDetail | null> {
  const normalizedJobId = jobId.trim();
  if (!normalizedJobId) throw new Error('REPORT_QUERY_INVALID_SMART_REPORT_ID');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const { data: job, error: jobError } = await supabase
    .from('report_execution_jobs')
    .select('id,source_path,source_hash,job_key,status,checkpoint,evidence,completed_at')
    .eq('company_id', companyId)
    .eq('id', normalizedJobId)
    .maybeSingle();

  if (jobError) throw jobError;
  if (!job || job.status !== 'completed') return null;

  const rendered = renderedOutputOf(job.evidence);
  if (!rendered) throw new Error('SMART_REPORT_RENDERED_OUTPUT_MISSING');

  const { data: stages, error: stageError } = await supabase
    .from('report_execution_tasks')
    .select('ordinal,stage,status,attempt,started_at,completed_at,last_error,evidence')
    .eq('company_id', companyId)
    .eq('report_execution_job_id', job.id)
    .order('ordinal', { ascending: true });

  if (stageError) throw stageError;

  const { data: analyses, error: analysisError } = await supabase
    .from('source_analysis_snapshots')
    .select('id,import_job_id,source_format,analysis_status,quality_score,row_count,column_count,datasets,created_at')
    .eq('company_id', companyId)
    .eq('source_hash', job.source_hash)
    .order('created_at', { ascending: false })
    .limit(1);

  if (analysisError) throw analysisError;
  const analysis = analyses?.[0] ?? null;
  const sourceAnalysis = analysis ? {
    id: String(analysis.id),
    importJobId: analysis.import_job_id == null ? null : String(analysis.import_job_id),
    sourceFormat: analysis.source_format == null ? null : String(analysis.source_format),
    analysisStatus: analysis.analysis_status == null ? null : String(analysis.analysis_status),
    qualityScore: analysis.quality_score == null ? null : Number(analysis.quality_score),
    rowCount: analysis.row_count == null ? null : Number(analysis.row_count),
    columnCount: analysis.column_count == null ? null : Number(analysis.column_count),
    datasets: Array.isArray(analysis.datasets) ? analysis.datasets : [],
  } : null;

  return {
    jobId: String(job.id),
    sourcePath: String(job.source_path ?? 'مصدر غير مسمى'),
    sourceHash: String(job.source_hash ?? ''),
    entityType: entityTypeFrom(String(job.job_key ?? '')),
    rowCount: rendered.rowCount == null ? null : Number(rendered.rowCount),
    qualityScore: rendered.qualityScore == null ? null : Number(rendered.qualityScore),
    trustState: rendered.trustState == null ? null : String(rendered.trustState),
    specialty: rendered.sourceSpecialty == null ? null : String(rendered.sourceSpecialty),
    evidenceStatus: effectiveEvidenceStatus(rendered, sourceAnalysis),
    completedAt: job.completed_at == null ? null : String(job.completed_at),
    importId: rendered.importId == null ? null : String(rendered.importId),
    checkpointStage: job.checkpoint?.stage == null ? null : String(job.checkpoint.stage),
    renderedOutput: rendered,
    sourceAnalysis,
    stages: (stages ?? []).map((row) => ({
      ordinal: Number(row.ordinal),
      stage: String(row.stage),
      status: String(row.status),
      attempt: Number(row.attempt ?? 0),
      startedAt: row.started_at == null ? null : String(row.started_at),
      completedAt: row.completed_at == null ? null : String(row.completed_at),
      lastError: row.last_error && typeof row.last_error === 'object' ? row.last_error as Record<string, unknown> : {},
      evidence: row.evidence && typeof row.evidence === 'object' ? row.evidence as Record<string, unknown> : {},
    })),
  };
}
