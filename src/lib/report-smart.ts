import { supabase, resolveCurrentCompanyId } from './supabase.ts';
import { deriveReportIntelligence, type ReportIntelligence } from './report-intelligence/report-smart-insights.ts';
import { resolveReportEvidenceStatus } from './report-smart-evidence-status.ts';
import { detectReportArchetype, runReportArchetype } from './report-intelligence/archetype-registry.ts';

export type SmartReportCatalogItem = {
  jobId: string;
  sourcePath: string;
  sourceHash: string;
  entityType: string;
  rowCount: number | null;
  qualityScore: number | null;
  trustState: string | null;
  reportVerificationState: string | null;
  specialty: string | null;
  evidenceStatus: string | null;
  archetypeId: string | null;
  archetypeVersion: number | null;
  archetypeState: string | null;
  recommendationStatus: string | null;
  decisionStatus: string | null;
  approvalStatus: string | null;
  actionStatus: string | null;
  outcomeStatus: string | null;
  learningStatus: string | null;
  completedAt: string | null;
};

export type SmartReportDetail = SmartReportCatalogItem & {
  tenantId: string;
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
    createdAt: string | null;
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
  authoritativeCurrentRowCount: number | null;
  canonicalCommitGap: number | null;
  canonicalCommitCount: number;
  canonicalCommitVerified: boolean;
  canonicalAnalysisScope: 'FULL_SOURCE' | 'PARTIAL_FETCH_CEILING' | 'PARTIAL_FETCH_ERROR';
  sourceTrustState: string | null;
  reportVerificationState: string;
  canonicalRows: Array<{ row_number: number; data: Record<string, unknown> }>;
  intelligence: ReportIntelligence;
  runtimeWarnings?: string[];
};

function renderedOutputOf(evidence: unknown): Record<string, unknown> | null {
  if (!evidence || typeof evidence !== 'object') return null;
  const value = (evidence as Record<string, unknown>).renderedOutput;
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function entityTypeFrom(jobKey: string): string {
  const parts = jobKey.split(':');
  if (parts[0] === 'canonical-import' && parts[1] === 'generic' && parts[2]) return `generic:${parts[2]}`;
  if (parts[0] === 'canonical-import' && parts[1]) return parts[1];
  return parts.length >= 3 ? parts.slice(2).join(':') : jobKey;
}

function isReportSourcePath(path: string): boolean {
  return /\.(xlsx|xls|xlsm|csv|tsv|ods|pdf|docx|doc|rtf|json|jsonl|txt|md|markdown|jpg|jpeg|png|webp|tiff|bmp)$/i.test(path);
}

type AnalysisSnapshotLike = {
  datasets?: unknown;
};

function inferSpecialtyFromAnalysis(analysis: AnalysisSnapshotLike | null | undefined): string | null {
  const datasets = Array.isArray(analysis?.datasets) ? analysis.datasets : [];
  const parts: string[] = [];
  for (const dataset of datasets) {
    if (!dataset || typeof dataset !== 'object') continue;
    const row = dataset as Record<string, unknown>;
    const columns = Array.isArray(row.columns) ? row.columns : [];
    for (const column of columns) {
      if (!column || typeof column !== 'object') continue;
      const item = column as Record<string, unknown>;
      parts.push(String(item.name ?? ''), String(item.mappedField ?? ''));
    }
    const preview = Array.isArray(row.preview) ? row.preview.slice(0, 100) : [];
    for (const sample of preview) {
      if (!sample || typeof sample !== 'object') continue;
      for (const [key, value] of Object.entries(sample as Record<string, unknown>)) {
        parts.push(key, String(value ?? ''));
      }
    }
  }

  const text = parts.join(' ').toLowerCase().normalize('NFKC');
  if (!text.trim()) return null;

  const score = (tokens: string[]) =>
    tokens.reduce((sum, token) => sum + (text.includes(token.toLowerCase()) ? 1 : 0), 0);

  const scores = {
    inventory: score(['sku', 'productcode', 'productname', 'itemname', 'رقم الصنف', 'الصنف', 'مخزون', 'المخزن', 'كمية', 'warehouse', 'stock']),
    sales: score(['sales', 'sale', 'المبيعات', 'فاتورة', 'customer', 'العميل', 'total_amount', 'net_amount']),
    purchases: score(['purchase', 'purchases', 'المشتريات', 'supplier', 'المورد', 'cost']),
    receivables: score(['receivable', 'receivables', 'ذمم', 'العملاء الآجل', 'الرصيد المستحق', 'debit', 'credit', 'due']),
    payments: score(['payments', 'payment', 'الصراف', 'النقد', 'البنك', 'cash', 'bank']),
    profitability: score(['profit', 'profitability', 'margin', 'الربح', 'الأرباح', 'الهامش']),
  } as const;

  const ranked = (Object.entries(scores) as Array<[string, number]>)
    .sort((a, b) => b[1] - a[1]);
  const [best, bestScore] = ranked[0] ?? [null, 0];
  const secondScore = ranked[1]?.[1] ?? 0;

  if (!best || bestScore < 2 || bestScore === secondScore) return null;
  return best;
}

function resolveEffectiveSpecialty(renderedSpecialty: unknown, analysis: AnalysisSnapshotLike | null | undefined): string | null {
  const renderedValue = renderedSpecialty == null ? null : String(renderedSpecialty).trim() || null;
  const inferred = inferSpecialtyFromAnalysis(analysis);
  return inferred ?? renderedValue;
}

function analysisUsabilityScore(analysis: Record<string, unknown>): number {
  const datasets = Array.isArray(analysis.datasets) ? analysis.datasets : [];
  let datasetsWithColumns = 0;
  let totalColumns = 0;
  let previewRows = 0;
  for (const dataset of datasets) {
    if (!dataset || typeof dataset !== 'object') continue;
    const row = dataset as Record<string, unknown>;
    const columns = Array.isArray(row.columns) ? row.columns : [];
    if (columns.length > 0) datasetsWithColumns += 1;
    totalColumns += columns.length;
    if (Array.isArray(row.preview)) previewRows += row.preview.length;
  }
  const rowCountValue = Number(analysis.row_count ?? 0);
  const qualityValue = Number(analysis.quality_score ?? 0);
  const rowCount = Number.isFinite(rowCountValue) ? rowCountValue : 0;
  const quality = Number.isFinite(qualityValue) ? qualityValue : 0;
  return (
    datasetsWithColumns * 1_000_000 +
    totalColumns * 10_000 +
    Math.min(10_000, Math.max(0, previewRows)) * 10 +
    Math.min(100, Math.max(0, quality)) +
    Math.min(1_000_000, Math.max(0, rowCount)) / 1_000_000
  );
}

function chooseBestAnalysisSnapshot(rows: Array<Record<string, unknown>>): Record<string, unknown> | null {
  if (!rows.length) return null;
  return [...rows].sort((left, right) => {
    const usabilityDelta = analysisUsabilityScore(right) - analysisUsabilityScore(left);
    if (usabilityDelta !== 0) return usabilityDelta;
    const rightTime = Date.parse(String(right.created_at ?? ''));
    const leftTime = Date.parse(String(left.created_at ?? ''));
    return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
  })[0] ?? null;
}

function resolveImportJobId(
  job: Record<string, unknown>,
  rendered: Record<string, unknown>,
  analysis: Record<string, unknown> | null,
): string {
  const renderedImportId = rendered.importId == null ? '' : String(rendered.importId).trim();
  if (renderedImportId) return renderedImportId;

  const checkpoint = job.checkpoint;
  if (checkpoint && typeof checkpoint === 'object') {
    const evidenceKeys = (checkpoint as Record<string, unknown>).evidenceKeys;
    if (Array.isArray(evidenceKeys)) {
      const importKey = evidenceKeys
        .map((value) => String(value ?? '').trim())
        .find((value) => value.startsWith('import:') && value.slice('import:'.length).trim());
      if (importKey) return importKey.slice('import:'.length).trim();
    }
  }

  const analysisImportId = analysis?.import_job_id == null ? '' : String(analysis.import_job_id).trim();
  return analysisImportId;
}

function mapCatalogItem(job: Record<string, unknown>, analysis?: AnalysisSnapshotLike | null): SmartReportCatalogItem | null {
  const rendered = renderedOutputOf(job.evidence) ?? {};
  const path = String(job.source_path ?? '');
  if (!isReportSourcePath(path)) return null;

  const specialty = resolveEffectiveSpecialty(rendered.sourceSpecialty, analysis);

  const datasets = Array.isArray(analysis?.datasets) ? analysis.datasets : [];
  const availableFields = [...new Set(datasets.flatMap((dataset) => {
    if (!dataset || typeof dataset !== 'object') return [];
    const columns = (dataset as Record<string, unknown>).columns;
    if (!Array.isArray(columns)) return [];
    return columns
      .filter((column): column is Record<string, unknown> => Boolean(column) && typeof column === 'object')
      .flatMap((column) => {
        const mapped = String(column.mappedField ?? '').trim();
        const name = String(column.name ?? '').trim();
        return [mapped, name].filter(Boolean);
      });
  }))] as Parameters<typeof detectReportArchetype>[0]['availableFields'];

  const detected = detectReportArchetype({
    sourcePath: path,
    specialty,
    availableFields,
  });

  const renderedArchetypeId =
    typeof rendered.archetypeId === 'string' ? rendered.archetypeId.trim() : '';
  const detectedArchetypeId = detected.profile?.id ?? null;
  const archetypeId = renderedArchetypeId && renderedArchetypeId === detectedArchetypeId
    ? renderedArchetypeId
    : detectedArchetypeId;
  const archetypeVersion =
    archetypeId && detected.profile ? Number(detected.profile.version) : null;

  const normalizedEvidenceStatus =
    rendered.evidenceStatus === 'VERIFIED' && !(
      typeof rendered.evidenceSnapshotId === 'string' && rendered.evidenceSnapshotId.trim()
    )
      ? 'AWAITING_EVIDENCE_SNAPSHOT'
      : rendered.evidenceStatus == null
        ? null
        : String(rendered.evidenceStatus);

  return {
    jobId: String(job.id),
    sourcePath: path || 'مصدر غير مسمى',
    sourceHash: String(job.source_hash ?? ''),
    entityType: entityTypeFrom(String(job.job_key ?? '')),
    rowCount: rendered.rowCount == null && analysis && 'row_count' in (analysis as Record<string, unknown>) ? Number((analysis as Record<string, unknown>).row_count) : rendered.rowCount == null ? null : Number(rendered.rowCount),
    qualityScore: rendered.qualityScore == null && analysis && 'quality_score' in (analysis as Record<string, unknown>) ? Number((analysis as Record<string, unknown>).quality_score) : rendered.qualityScore == null ? null : Number(rendered.qualityScore),
    trustState: rendered.trustState == null ? null : String(rendered.trustState),
    reportVerificationState: normalizedEvidenceStatus ?? 'PENDING_EVIDENCE',
    specialty,
    evidenceStatus: normalizedEvidenceStatus,
    archetypeId,
    archetypeVersion,
    archetypeState: detected.state,
    recommendationStatus: rendered.recommendationStatus == null ? null : String(rendered.recommendationStatus),
    decisionStatus: rendered.decisionStatus == null ? null : String(rendered.decisionStatus),
    approvalStatus: rendered.approvalStatus == null ? null : String(rendered.approvalStatus),
    actionStatus: rendered.actionStatus == null ? null : String(rendered.actionStatus),
    outcomeStatus: rendered.outcomeStatus == null ? null : String(rendered.outcomeStatus),
    learningStatus: rendered.learningStatus == null ? null : String(rendered.learningStatus),
    completedAt: job.completed_at == null ? null : String(job.completed_at),
  };
}

export async function fetchSmartReportCatalog(limit = 500): Promise<SmartReportCatalogItem[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 5000) throw new Error('REPORT_QUERY_INVALID_SMART_REPORT_LIMIT');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const pageSize = 200;
  const jobs: Array<Record<string, unknown>> = [];

  for (let offset = 0; offset < limit; offset += pageSize) {
    const endRange = Math.min(offset + pageSize - 1, limit - 1);
    const { data, error } = await supabase
      .from('report_execution_jobs')
      .select('id,source_path,source_hash,job_key,status,checkpoint,evidence,completed_at')
      .eq('company_id', companyId)
      .eq('status', 'completed')
      .like('job_key', 'canonical-import:generic:%')
      .order('completed_at', { ascending: false })
      .range(offset, endRange);

    if (error) throw error;
    if (!data?.length) break;
    jobs.push(...(data as Array<Record<string, unknown>>));
    if (data.length < endRange - offset + 1) break;
  }

  const sourceHashes = [...new Set(jobs
    .map(job => String(job.source_hash ?? ''))
    .filter(Boolean))];
  const analysesByHash = new Map<string, Record<string, unknown>>();

  for (let i = 0; i < sourceHashes.length; i += 100) {
    const batch = sourceHashes.slice(i, i + 100);
    if (!batch.length) continue;
    const { data: analyses, error: analysisError } = await supabase
      .from('source_analysis_snapshots')
      .select('source_hash,source_format,analysis_status,quality_score,row_count,column_count,datasets,created_at')
      .eq('company_id', companyId)
      .in('source_hash', batch)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (analysisError) {
      // Catalog reads must never freeze the reports center when an optional analysis snapshot is unavailable.
      continue;
    }
    const byHash = new Map<string, Record<string, unknown>[]>();
    for (const analysis of analyses ?? []) {
      const hash = String(analysis.source_hash ?? '');
      if (!hash) continue;
      const rows = byHash.get(hash) ?? [];
      rows.push(analysis as Record<string, unknown>);
      byHash.set(hash, rows);
    }
    for (const [hash, rows] of byHash) {
      const best = chooseBestAnalysisSnapshot(rows);
      if (best) analysesByHash.set(hash, best);
    }
  }

  const latestBySourceHash = new Map<string, SmartReportCatalogItem>();
  for (const job of jobs) {
    const item = mapCatalogItem(
      job,
      analysesByHash.get(String(job.source_hash ?? '')) ?? null,
    );
    if (!item || !item.sourceHash) continue;
    if (!latestBySourceHash.has(item.sourceHash)) latestBySourceHash.set(item.sourceHash, item);
  }

  return [...latestBySourceHash.values()].slice(0, limit);
}
function emptyReportIntelligence(specialty: string | null): ReportIntelligence {
  const owner =
    specialty === 'inventory' ? 'مسؤول المخزون' :
    specialty === 'sales' ? 'مسؤول المبيعات' :
    specialty === 'purchases' ? 'مسؤول المشتريات' :
    specialty === 'receivables' ? 'مسؤول التحصيل' :
    specialty === 'payments' ? 'مسؤول الخزينة' :
    specialty === 'profitability' ? 'المدير المالي' :
    'المسؤول التشغيلي المناسب للمصدر';
  return {
    businessQuestion: 'ما الذي يمكن إثباته من المصدر الحالي، وما الذي يحتاج مراجعة قبل القرار؟',
    summary: 'تعذر تشغيل طبقة الاستدلال المتخصصة على البيانات الحالية. بقيت حالة المصدر والدليل معروضة دون اختلاق نتائج.',
    signals: [],
    recommendations: [],
    forecast: {
      status: 'INSUFFICIENT_SAMPLE',
      metric: null,
      method: 'fail-soft-runtime',
      observedPeriods: 0,
      nextPeriod: null,
      nextValue: null,
      direction: null,
      note: 'تعذر تشغيل التنبؤ أثناء قراءة التقرير؛ لا يتم اختلاق قيمة متوقعة.',
    },
    guidance: {
      focus: 'مراجعة المصدر والدليل',
      inspect: [],
      ownerHint: owner,
      boundary: 'النتائج المتخصصة محجوبة حتى تتوفر قراءة صالحة للمصدر؛ لا يتم اختلاق تحليل بديل.',
    },
    findings: [],
    risks: [],
    opportunities: [],
    advisorBrief: {
      health: 'REVIEW_REQUIRED',
      headline: 'تحتاج طبقة الذكاء إلى مراجعة تشغيلية قبل إصدار استنتاج متخصص.',
      topFinding: null,
      topRisk: null,
      topOpportunity: null,
      recommendedAction: 'افتح المصدر والصفوف الكانونية وراجع سبب فشل القراءة قبل اعتماد أي قرار.',
      ownerHint: owner,
      expectedOutcome: 'استعادة القراءة ثم إعادة اشتقاق الإشارات والتوصيات من نفس source/job lineage.',
      measurement: 'تحقق من عودة signals/findings/recommendations من نفس المصدر بعد الإصلاح.',
      proofRequirement: 'كل نتيجة يجب أن تبقى مرتبطة بـsourceHash + jobId + evidence.',
    },
  };
}

export async function fetchSmartReport(jobId: string, expectedSourceHash: string): Promise<SmartReportDetail | null> {
  const normalizedJobId = jobId.trim();
  const normalizedSourceHash = expectedSourceHash.trim();
  if (!normalizedJobId) throw new Error('INVALID_REPORT_CONTEXT');
  if (!/^sha256:[0-9a-fA-F]{64}$/.test(normalizedSourceHash)) throw new Error('INVALID_REPORT_CONTEXT');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const { data: job, error: jobError } = await supabase
    .from('report_execution_jobs')
    .select('id,source_path,source_hash,job_key,status,checkpoint,evidence,completed_at')
    .eq('company_id', companyId)
    .eq('id', normalizedJobId)
    .maybeSingle();

  if (jobError) throw jobError;
  if (!job || job.status !== 'completed') throw new Error('INVALID_REPORT_CONTEXT');
  if (String(job.source_hash ?? '').trim() !== normalizedSourceHash) throw new Error('INVALID_REPORT_CONTEXT');

  const runtimeWarnings: string[] = [];
  const renderedOutput = renderedOutputOf(job.evidence);
  if (!renderedOutput) {
    runtimeWarnings.push('لم تُحفظ renderedOutput لهذا التقرير؛ تم بناء العرض من المصدر الكانوني ولقطة التحليل المتاحة دون اختلاق مخرجات سابقة.');
  }
  const rendered: Record<string, unknown> = renderedOutput ?? {};
  const { data: passportRows, error: passportError } = await supabase
    .from('report_evidence_passports')
    .select('id,evidence_snapshot_id,verification_status,decision_readiness,updated_at')
    .eq('company_id', companyId)
    .eq('report_execution_job_id', job.id)
    .eq('source_hash', job.source_hash)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (passportError) runtimeWarnings.push('تعذر قراءة Evidence Passport الحالي؛ تم خفض حالة الدليل إلى المراجعة بدل إيقاف التقرير.');

  const currentPassport = passportRows?.[0] ?? null;
  const passportStatus =
    currentPassport?.verification_status === 'VERIFIED' && currentPassport?.decision_readiness === 'READY'
      ? 'VERIFIED'
      : currentPassport?.verification_status === 'REVIEW'
        ? 'REVIEW'
        : currentPassport?.verification_status === 'BLOCKED'
          ? 'BLOCKED'
          : currentPassport
            ? 'PENDING_EVIDENCE'
            : null;

  const effectiveRendered: Record<string, unknown> = currentPassport
    ? {
        ...rendered,
        evidenceSnapshotId: currentPassport.evidence_snapshot_id == null ? null : String(currentPassport.evidence_snapshot_id),
        evidencePassportId: String(currentPassport.id),
        evidenceStatus: passportStatus,
      }
    : rendered.evidenceStatus === 'VERIFIED'
      ? {
          ...rendered,
          evidenceSnapshotId: null,
          evidencePassportId: null,
          evidenceStatus: 'AWAITING_EVIDENCE_SNAPSHOT',
        }
      : rendered;

  const { data: stages, error: stageError } = await supabase
    .from('report_execution_tasks')
    .select('ordinal,stage,status,attempt,started_at,completed_at,last_error,evidence')
    .eq('company_id', companyId)
    .eq('report_execution_job_id', job.id)
    .order('ordinal', { ascending: true });

  if (stageError) runtimeWarnings.push('تعذر قراءة مراحل التنفيذ؛ بقي التحليل الذكي منفصلًا عن حالة المراحل.');

  // Prefer the analysis snapshot that belongs to this exact import job. A source hash can
  // legitimately have multiple analyses (for example, a newer compact summary and the
  // report's full 7-column analysis). Using the latest snapshot by time alone can silently
  // drop source-quality signals needed by Advisor.
  let analysis: Record<string, unknown> | null = null;
  const renderedImportId = resolveImportJobId(job as Record<string, unknown>, effectiveRendered, analysis);

  if (renderedImportId) {
    const { data: importAnalyses, error: importAnalysisError } = await supabase
      .from('source_analysis_snapshots')
      .select('id,import_job_id,source_format,analysis_status,quality_score,row_count,column_count,datasets,created_at')
      .eq('company_id', companyId)
      .eq('source_hash', job.source_hash)
      .eq('import_job_id', renderedImportId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (importAnalysisError) runtimeWarnings.push('تعذر قراءة لقطة التحليل المرتبطة بالاستيراد؛ تم استخدام أحدث لقطة متاحة أو التحليل الكانوني.');
    analysis = (importAnalyses?.[0] ?? null) as Record<string, unknown> | null;
  }

  if (!analysis) {
    const { data: analyses, error: analysisError } = await supabase
      .from('source_analysis_snapshots')
      .select('id,import_job_id,source_format,analysis_status,quality_score,row_count,column_count,datasets,created_at')
      .eq('company_id', companyId)
      .eq('source_hash', job.source_hash)
      .order('created_at', { ascending: false })
      .limit(20);

    if (analysisError) {
      runtimeWarnings.push('تعذر قراءة لقطات التحليل البديلة؛ استمر التقرير اعتمادًا على المخرجات المحفوظة والصفوف الكانونية المتاحة.');
    }
    analysis = chooseBestAnalysisSnapshot((analyses ?? []) as Array<Record<string, unknown>>);
  }
  if (analysis) {
    if (effectiveRendered.rowCount == null && analysis.row_count != null) effectiveRendered.rowCount = Number(analysis.row_count);
    if (effectiveRendered.qualityScore == null && analysis.quality_score != null) effectiveRendered.qualityScore = Number(analysis.quality_score);
    if (effectiveRendered.sourceFormat == null && analysis.source_format != null) effectiveRendered.sourceFormat = String(analysis.source_format);
  }

  const { data: canonicalCommits, error: canonicalCommitError } = await supabase
    .from('canonical_import_commits')
    .select('committed_count')
    .eq('company_id', companyId)
    .eq('entity_type', entityTypeFrom(String(job.job_key ?? '')))
    .eq('source_hash', job.source_hash);

  if (canonicalCommitError) runtimeWarnings.push('تعذر قراءة سجل Canonical Commit؛ لم يُعتبر ذلك تحققًا، وبقيت حالة الدليل غير موثقة تلقائيًا.');
  const canonicalCommitQueryFailed = Boolean(canonicalCommitError);
  const authoritativeCurrentRowCount = effectiveRendered.authoritativeCurrentRowCount == null
    ? (effectiveRendered.rowCount == null ? null : Number(effectiveRendered.rowCount))
    : Number(effectiveRendered.authoritativeCurrentRowCount);
  const canonicalCommitCandidates = (canonicalCommits ?? []).map((row) => Number(row.committed_count ?? 0)).filter((value) => Number.isFinite(value));
  const exactCanonicalCommit = authoritativeCurrentRowCount == null
    ? null
    : canonicalCommitCandidates.find((value) => value === authoritativeCurrentRowCount);
  const canonicalCommitCount = exactCanonicalCommit != null
    ? exactCanonicalCommit
    : canonicalCommitCandidates.length === 1
      ? canonicalCommitCandidates[0]
      : canonicalCommitCandidates.reduce((sum, value) => sum + value, 0);
  const sourceRowCount = effectiveRendered.rowCount == null ? null : Number(effectiveRendered.rowCount);
  const canonicalCommitGap = canonicalCommitQueryFailed || authoritativeCurrentRowCount == null
    ? null
    : Math.max(0, authoritativeCurrentRowCount - canonicalCommitCount);
  const canonicalCommitVerified =
    !canonicalCommitQueryFailed &&
    authoritativeCurrentRowCount != null &&
    canonicalCommitCount === authoritativeCurrentRowCount;

  // Smart-report intelligence must inspect the canonical source, not an arbitrary preview.
  // Supabase REST can cap a single response; page deterministically until the full source
  // is consumed (with a defensive ceiling so a pathological source cannot freeze the browser).
  const canonicalRows: Array<{ row_number: number; data: Record<string, unknown> }> = [];
  const canonicalFetchPageSize = 1000;
  const canonicalFetchLimit = 50000;
  const canonicalImportJobId = renderedImportId || (
    analysis?.import_job_id == null ? '' : String(analysis.import_job_id).trim()
  );
  if (!canonicalImportJobId) throw new Error('INVALID_REPORT_CONTEXT');
  let canonicalOffset = 0;
  let canonicalFetchError = false;

  while (canonicalOffset < canonicalFetchLimit) {
    const canonicalSourceQuery = supabase
      .from('canonical_dataset_records')
      .select('row_number,data')
      .eq('company_id', companyId);
    const canonicalScopedQuery = canonicalSourceQuery.eq('import_job_id', canonicalImportJobId);
    const { data: pageRows, error: pageError } = await canonicalScopedQuery
      .order('row_number', { ascending: true })
      .range(canonicalOffset, canonicalOffset + canonicalFetchPageSize - 1);

    if (pageError) {
      canonicalFetchError = true;
      runtimeWarnings.push('تعذر قراءة جزء من الصفوف الكانونية؛ تم الإبقاء على الصفوف المقروءة فقط وعدم اختلاق بقية المصدر.');
      break;
    }

    const normalizedPage = (pageRows ?? [])
      .filter((row) => row && typeof row.data === 'object' && row.data !== null)
      .map((row) => ({
        row_number: Number(row.row_number ?? 0),
        data: row.data as Record<string, unknown>,
      }));

    canonicalRows.push(...normalizedPage);

    if ((pageRows ?? []).length < canonicalFetchPageSize) break;
    canonicalOffset += canonicalFetchPageSize;
  }

  const canonicalFetchCeilingReached = canonicalRows.length >= canonicalFetchLimit;
  const canonicalRowsPartial = canonicalFetchError || canonicalFetchCeilingReached;
  const canonicalRowsComplete =
    sourceRowCount == null ||
    canonicalRows.length >= sourceRowCount;
  const canonicalAnalysisScope =
    canonicalFetchError
      ? 'PARTIAL_FETCH_ERROR'
      : sourceRowCount != null && sourceRowCount > canonicalFetchLimit
        ? 'PARTIAL_FETCH_CEILING'
        : 'FULL_SOURCE';

  const sourceAnalysis = analysis ? {
    id: String(analysis.id),
    importJobId: analysis.import_job_id == null ? null : String(analysis.import_job_id),
    sourceFormat: analysis.source_format == null ? null : String(analysis.source_format),
    analysisStatus: analysis.analysis_status == null ? null : String(analysis.analysis_status),
    qualityScore: analysis.quality_score == null ? null : Number(analysis.quality_score),
    rowCount: analysis.row_count == null ? null : Number(analysis.row_count),
    columnCount: analysis.column_count == null ? null : Number(analysis.column_count),
    createdAt: analysis.created_at == null ? null : String(analysis.created_at),
    datasets: Array.isArray(analysis.datasets) ? analysis.datasets : [],
  } : null;

  const evidenceStatus = resolveReportEvidenceStatus(effectiveRendered, canonicalCommitVerified);

  const specialty = resolveEffectiveSpecialty(effectiveRendered.sourceSpecialty, sourceAnalysis);

  let baseIntelligence: ReportIntelligence;
  try {
    baseIntelligence = deriveReportIntelligence({
      specialty,
      rowCount: effectiveRendered.rowCount == null ? null : Number(effectiveRendered.rowCount),
      sourceAnalysis,
      renderedOutput: effectiveRendered,
      canonicalRows,
    });
  } catch (error) {
    runtimeWarnings.push('تعذر اشتقاق طبقة الذكاء من هذا المصدر؛ تم إظهار حالة مراجعة بدل تجميد التقرير.');
    console.error('[SmartReport] deriveReportIntelligence failed', error);
    baseIntelligence = emptyReportIntelligence(specialty);
  }

  const catalogItem = mapCatalogItem(
    job as Record<string, unknown>,
    sourceAnalysis,
  );
  if (!catalogItem) throw new Error('SMART_REPORT_CATALOG_ITEM_UNAVAILABLE');

  const availableFields = [...new Set((Array.isArray(sourceAnalysis?.datasets) ? sourceAnalysis.datasets : []).flatMap((dataset) => {
    if (!dataset || typeof dataset !== 'object') return [];
    const columns = (dataset as Record<string, unknown>).columns;
    if (!Array.isArray(columns)) return [];
    return columns
      .filter((column): column is Record<string, unknown> => Boolean(column) && typeof column === 'object')
      .flatMap((column) => {
        const mapped = String(column.mappedField ?? '').trim();
        const name = String(column.name ?? '').trim();
        return [mapped, name].filter(Boolean);
      });
  }))] as Parameters<typeof detectReportArchetype>[0]['availableFields'];

  const detectedArchetype = detectReportArchetype({
    sourcePath: String(job.source_path ?? ''),
    specialty,
    availableFields,
  });

  let intelligence: ReportIntelligence = baseIntelligence;
  let archetypeState = detectedArchetype.state;

  if (detectedArchetype.profile) {
    try {
      const archetypeRun = runReportArchetype({
        intelligence: baseIntelligence,
        provenance: {
          tenantId: companyId,
          sourceHash: String(job.source_hash ?? ''),
          reportExecutionJobId: String(job.id),
          evidenceSnapshotId: typeof effectiveRendered.evidenceSnapshotId === 'string' ? effectiveRendered.evidenceSnapshotId : null,
          evidencePassportId: typeof effectiveRendered.evidencePassportId === 'string' ? effectiveRendered.evidencePassportId : null,
          sourceVersionId: typeof effectiveRendered.sourceVersionId === 'string' ? effectiveRendered.sourceVersionId : null,
        },
        availableFields,
        sampleSize: effectiveRendered.rowCount == null ? 0 : Number(effectiveRendered.rowCount),
        archetypeId: detectedArchetype.profile.id,
        profileVersion: detectedArchetype.profile.version,
        report: {
          specialty,
          rowCount: effectiveRendered.rowCount == null ? null : Number(effectiveRendered.rowCount),
          sourceAnalysis,
          renderedOutput: effectiveRendered,
          canonicalRows,
        },
      });

      archetypeState = archetypeRun.state;
      intelligence = archetypeRun.state === 'SUPPORTED'
        ? archetypeRun.intelligence
        : {
            ...baseIntelligence,
            advisorBrief: {
              ...baseIntelligence.advisorBrief,
              headline: 'النموذج لم يجتز بوابة التشغيل: ' + archetypeRun.state + ' — تم إبقاء الذكاء المصدرّي المتاح دون اعتماد النموذج المتخصص.',
            },
          };
    } catch (error) {
      runtimeWarnings.push('تعذر تشغيل النموذج المتخصص لهذا المصدر؛ تم الإبقاء على الذكاء المصدرّي المتاح وحالة المراجعة.');
      console.error('[SmartReport] runReportArchetype failed', error);
      archetypeState = 'REVIEW_REQUIRED';
      intelligence = {
        ...baseIntelligence,
        advisorBrief: {
          ...baseIntelligence.advisorBrief,
          headline: 'تعذر تشغيل النموذج المتخصص؛ تم الإبقاء على الذكاء المصدرّي المتاح دون اختلاق نتيجة.',
        },
      };
    }
  } else {
    // A specialty-level generic recommendation is not an archetype proof.
    // Keep source-quality understanding available, but block recommendation/decision output.
    intelligence = {
      ...baseIntelligence,
      advisorBrief: {
        ...baseIntelligence.advisorBrief,
        headline: 'لا يوجد نموذج مصدرّي مثبت لهذا التقرير: ' + detectedArchetype.state + ' — تم إبقاء الذكاء المصدرّي المتاح دون اختلاق نموذج متخصص.',
      },
    };
  }

  const runtimeSignalStatus = intelligence.signals.length
    ? 'SIGNALS_PRESENT'
    : 'NO_EXCEPTIONAL_SIGNALS';
  const runtimeIntelligenceStatus =
    archetypeState === 'BLOCKED'
      ? 'BLOCKED'
      : archetypeState === 'INSUFFICIENT_SAMPLE'
        ? 'INSUFFICIENT_SAMPLE'
        : archetypeState === 'SUPPORTED' && evidenceStatus === 'VERIFIED'
          ? 'READY'
          : 'REVIEW_REQUIRED';
  const runtimeRendered = {
    ...effectiveRendered,
    archetypeId: detectedArchetype.profile?.id ?? null,
    archetypeVersion: detectedArchetype.profile?.version ?? null,
    profileVersion: detectedArchetype.profile?.version ?? null,
    archetypeState,
    archetypeReason: detectedArchetype.reason,
    signalStatus: runtimeSignalStatus,
    intelligenceStatus: runtimeIntelligenceStatus,
  };

  return {
    ...catalogItem,
    archetypeState,
    archetypeId: detectedArchetype.profile?.id ?? null,
    archetypeVersion: detectedArchetype.profile?.version ?? null,
    jobId: String(job.id),
    tenantId: companyId,
    sourcePath: String(job.source_path ?? 'مصدر غير مسمى'),
    sourceHash: String(job.source_hash ?? ''),
    entityType: entityTypeFrom(String(job.job_key ?? '')),
    rowCount: effectiveRendered.rowCount == null ? null : Number(effectiveRendered.rowCount),
    qualityScore: effectiveRendered.qualityScore == null ? null : Number(effectiveRendered.qualityScore),
    trustState: effectiveRendered.trustState == null ? null : String(effectiveRendered.trustState),
    specialty,
    canonicalRows,
    intelligence,
    evidenceStatus,
    completedAt: job.completed_at == null ? null : String(job.completed_at),
    importId: effectiveRendered.importId == null ? null : String(effectiveRendered.importId),
    checkpointStage: job.checkpoint?.stage == null ? null : String(job.checkpoint.stage),
    renderedOutput: runtimeRendered,
    sourceAnalysis,
    authoritativeCurrentRowCount,
    canonicalCommitGap,
    canonicalCommitCount,
    canonicalCommitVerified,
    canonicalAnalysisScope,
    sourceTrustState: effectiveRendered.trustState == null ? null : String(effectiveRendered.trustState),
    reportVerificationState: canonicalCommitQueryFailed || !canonicalRowsComplete || canonicalRowsPartial
      ? 'PARTIAL_ANALYSIS'
      : canonicalCommitGap != null && canonicalCommitGap > 0
        ? 'GAP_DETECTED'
: evidenceStatus === 'VERIFIED'
          ? 'VERIFIED'
          : 'PENDING_EVIDENCE',
    runtimeWarnings,
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
