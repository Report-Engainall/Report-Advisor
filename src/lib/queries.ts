import { supabase, resolveCurrentCompanyId } from './supabase';
import { fetchDashboardSnapshot, fetchDashboardIntelligence, type DashboardKPIs, type MonthlyTrend, type TopEntity, type AgingBucket, type CategoryBreakdown } from './dashboard-canonical';
import type { Recommendation, RecommendationOutcome, DecisionEvidenceSnapshot, Alert, SalesInvoice, PurchaseInvoice, ImportRecord, Customer, Forecast, Product } from './types';
export type { DashboardKPIs, MonthlyTrend, TopEntity, AgingBucket, CategoryBreakdown };
export async function fetchDashboardKPIs(): Promise<DashboardKPIs> { return (await fetchDashboardSnapshot(6)).kpis; }
export async function fetchMonthlyTrend(months = 6): Promise<MonthlyTrend[]> { return (await fetchDashboardSnapshot(months)).trend; }
export async function fetchTopCustomers(limit = 5): Promise<TopEntity[]> { return (await fetchDashboardSnapshot(6)).topCustomers.slice(0, limit); }
export async function fetchTopProducts(limit = 5): Promise<TopEntity[]> { return (await fetchDashboardSnapshot(6)).topProducts.slice(0, limit); }
export async function fetchCategoryBreakdown(): Promise<CategoryBreakdown[]> { return (await fetchDashboardSnapshot(6)).categories; }
export async function fetchAgingBuckets(): Promise<AgingBucket[]> { return (await fetchDashboardSnapshot(6)).aging.rows; }
export async function fetchRecommendations(): Promise<Recommendation[]> { return (await fetchDashboardIntelligence()).recommendations; }
export async function fetchAlerts(): Promise<Alert[]> { return (await fetchDashboardIntelligence()).alerts; }

async function requireCurrentUserContext(): Promise<{ id: string; label: string }> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const user = data.user;
  if (!user?.id) throw new Error('AUTHENTICATED_USER_REQUIRED');
  return { id: user.id, label: user.email?.trim() || user.id };
}

export type RecommendationDecisionContext = {
  decisionId: string | null;
  decisionStatus: string | null;
  approvalId: string | null;
  approvalStatus: string | null;
  workItemId: string | null;
  workItemStatus: string | null;
};

export async function fetchRecommendationDecisionContext(recommendationId: string): Promise<RecommendationDecisionContext> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const [{ data: decision, error: decisionError }, { data: recommendation, error: recommendationError }] = await Promise.all([
    supabase.from('business_intelligence_decisions')
      .select('id,status')
      .eq('company_id', companyId)
      .eq('recommendation_id', recommendationId)
      .maybeSingle(),
    supabase.from('recommendations')
      .select('id')
      .eq('company_id', companyId)
      .eq('id', recommendationId)
      .maybeSingle(),
  ]);
  if (decisionError) throw decisionError;
  if (recommendationError) throw recommendationError;
  if (!recommendation) throw new Error('RECOMMENDATION_NOT_FOUND_OR_FORBIDDEN');
  if (!decision) return { decisionId: null, decisionStatus: null, approvalId: null, approvalStatus: null, workItemId: null, workItemStatus: null };

  const [{ data: approval, error: approvalError }, { data: workItem, error: workError }] = await Promise.all([
    supabase.from('decision_approvals')
      .select('id,status')
      .eq('company_id', companyId)
      .eq('decision_id', decision.id)
      .maybeSingle(),
    supabase.from('decision_work_items')
      .select('id,status')
      .eq('company_id', companyId)
      .eq('decision_id', decision.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (approvalError) throw approvalError;
  if (workError) throw workError;
  return {
    decisionId: decision.id,
    decisionStatus: decision.status,
    approvalId: approval?.id ?? null,
    approvalStatus: approval?.status ?? null,
    workItemId: workItem?.id ?? null,
    workItemStatus: workItem?.status ?? null,
  };
}

export async function fetchLatestDecisionEvidenceSnapshot(): Promise<DecisionEvidenceSnapshot | null> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const results = await Promise.all([
    supabase.from('business_state_snapshots').select('id,observed_at,created_at').eq('company_id', companyId).order('observed_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('kpi_evidence_snapshots').select('id,observed_at').eq('company_id', companyId).order('observed_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('import_snapshots').select('id,created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('operational_health_snapshots').select('id,observed_at').eq('company_id', companyId).order('observed_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('source_analysis_snapshots').select('id,created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  const normalized: DecisionEvidenceSnapshot[] = [];
  const specs: Array<{ kind: DecisionEvidenceSnapshot['kind']; result: typeof results[number]; timeKey: 'observed_at' | 'created_at' }> = [
    { kind: 'business_state', result: results[0], timeKey: 'observed_at' },
    { kind: 'kpi', result: results[1], timeKey: 'observed_at' },
    { kind: 'import', result: results[2], timeKey: 'created_at' },
    { kind: 'operational_health', result: results[3], timeKey: 'observed_at' },
    { kind: 'source_analysis', result: results[4], timeKey: 'created_at' },
  ];
  for (const spec of specs) {
    if (spec.result.error) throw spec.result.error;
    const row = spec.result.data as Record<string, unknown> | null;
    if (!row || typeof row.id !== 'string') continue;
    const observed = row[spec.timeKey];
    if (typeof observed !== 'string' || !observed.trim()) continue;
    normalized.push({ id: row.id, kind: spec.kind, observed_at: observed });
  }
  normalized.sort((a, b) => Date.parse(b.observed_at) - Date.parse(a.observed_at));
  return normalized[0] ?? null;
}

function decisionConfidenceValue(confidence: string): number | null {
  switch (confidence) {
    case 'CONFIRMED': return 1;
    case 'CALCULATED': return 0.8;
    case 'ESTIMATED': return 0.6;
    case 'FORECAST': return 0.5;
    default: return null;
  }
}

function workPriority(priority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  switch (priority.toLowerCase()) {
    case 'critical': return 'CRITICAL';
    case 'high': return 'HIGH';
    case 'medium': return 'MEDIUM';
    default: return 'LOW';
  }
}

export async function prepareRecommendationDecision(recommendation: Recommendation, evidence: DecisionEvidenceSnapshot): Promise<RecommendationDecisionContext> {
  const existing = await fetchRecommendationDecisionContext(recommendation.id);
  if (existing.decisionId) return existing;

  const confidence = decisionConfidenceValue(recommendation.confidence);
  if (confidence == null) throw new Error('DECISION_CONFIDENCE_UNAVAILABLE');
  if (!recommendation.title.trim()) throw new Error('DECISION_TITLE_REQUIRED');

  const { data: decisionId, error } = await supabase.rpc('create_runtime_decision', {
    p_decision_key: `recommendation:${recommendation.id}`,
    p_decision_type: 'recommendation',
    p_confidence: confidence,
    p_expected_impact: recommendation.expected_impact,
    p_evidence: {
      evidence_snapshot_id: evidence.id,
      evidence_snapshot_kind: evidence.kind,
      evidence_observed_at: evidence.observed_at,
      recommendation_id: recommendation.id,
      title: recommendation.title,
      category: recommendation.category,
      priority: recommendation.priority,
    },
  });
  if (error) throw error;
  if (typeof decisionId !== 'string') throw new Error('DECISION_CREATE_RESPONSE_INVALID');

  await supabase.rpc('link_recommendation_to_decision', {
    p_recommendation_id: recommendation.id,
    p_decision_id: decisionId,
  }).then(({ error: linkError }) => { if (linkError) throw linkError; });

  await updateRecommendationStatus(recommendation.id, 'open');
  return fetchRecommendationDecisionContext(recommendation.id);
}

export async function requestRecommendationApproval(decisionId: string, reason: string): Promise<string> {
  const { data, error } = await supabase.rpc('request_decision_approval', {
    p_decision_id: decisionId,
    p_reason: reason.trim() || null,
  });
  if (error) throw error;
  if (typeof data !== 'string') throw new Error('DECISION_APPROVAL_RESPONSE_INVALID');
  return data;
}

export async function decideRecommendationApproval(approvalId: string, approve: boolean, reason: string): Promise<void> {
  const { error } = await supabase.rpc('decide_approval', {
    p_approval_id: approvalId,
    p_approve: approve,
    p_reason: reason.trim() || null,
  });
  if (error) throw error;
}

export async function createAndStartRecommendationWork(recommendation: Recommendation, context: RecommendationDecisionContext, evidence: DecisionEvidenceSnapshot): Promise<string> {
  const decisionId = context.decisionId;
  if (!decisionId) throw new Error('DECISION_REQUIRED_BEFORE_WORK');
  if (context.decisionStatus !== 'APPROVED') throw new Error('DECISION_APPROVAL_REQUIRED_BEFORE_WORK');

  if (context.workItemId) {
    if (context.workItemStatus === 'OPEN') {
      await supabase.rpc('start_decision_work_item', { p_work_item_id: context.workItemId }).then(({ error }) => { if (error) throw error; });
    }
    return context.workItemId;
  }

  const assignee = await requireCurrentUserContext();
  const { data: workItemId, error } = await supabase.rpc('create_decision_work_item', {
    p_decision_id: decisionId,
    p_recommendation_id: recommendation.id,
    p_department: 'العمليات',
    p_assignee_id: assignee.id,
    p_assignee_label: assignee.label,
    p_title: recommendation.title,
    p_description: recommendation.description?.trim() || 'تنفيذ الإجراء المعتمد وفق القرار الموثق.',
    p_priority: workPriority(recommendation.priority),
    p_due_at: recommendation.deadline,
    p_expected_impact: recommendation.expected_impact,
    p_evidence_refs: [{ id: evidence.id, kind: evidence.kind, observed_at: evidence.observed_at }],
  });
  if (error) throw error;
  if (typeof workItemId !== 'string') throw new Error('WORK_ITEM_CREATE_RESPONSE_INVALID');
  await supabase.rpc('start_decision_work_item', { p_work_item_id: workItemId }).then(({ error: startError }) => { if (startError) throw startError; });
  await updateRecommendationStatus(recommendation.id, 'in_progress');
  return workItemId;
}

export async function completeRecommendationWork(workItemId: string, recommendationId: string, actualImpact: number, evidence: DecisionEvidenceSnapshot): Promise<void> {
  if (!Number.isFinite(actualImpact)) throw new Error('ACTUAL_IMPACT_INVALID');
  const { error } = await supabase.rpc('complete_decision_work_item', {
    p_work_item_id: workItemId,
    p_actual_impact: actualImpact,
    p_evidence: {
      evidence_snapshot_id: evidence.id,
      evidence_snapshot_kind: evidence.kind,
      evidence_observed_at: evidence.observed_at,
    },
  });
  if (error) throw error;
  await updateRecommendationStatus(recommendationId, 'completed');
}

export type BusinessReplayEvent = {
  id: string;
  occurredAt: string;
  kind: 'SNAPSHOT' | 'OUTCOME' | 'WORK';
  title: string;
  status: string | null;
  detail: string | null;
  expectedImpact: number | null;
  actualImpact: number | null;
  qualityScore: number | null;
  sourceVersion: string | null;
  evidencePresent: boolean;
};

export type BusinessReplaySnapshot = {
  snapshotCount: number;
  outcomeCount: number;
  workItemCount: number;
  latestSnapshotAt: string | null;
  latestOutcomeAt: string | null;
  windowLimit: number;
  hasMoreHistory: boolean;
  events: BusinessReplayEvent[];
};

function replayTimestamp(value: string | null | undefined): string | null {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime()) ? value : null;
}

export async function fetchBusinessReplaySnapshot(): Promise<BusinessReplaySnapshot> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const windowLimit = 100;
  const [snapshots, outcomes, workItems] = await Promise.all([
    supabase.from('business_state_snapshots')
      .select('id,observed_at,snapshot_key,source_version,quality_score,evidence')
      .eq('company_id', companyId)
      .order('observed_at', { ascending: false })
      .limit(windowLimit + 1),
    supabase.from('recommendation_outcomes')
      .select('id,observed_at,recommendation_key,status,expected_impact,actual_impact,outcome_quality,evidence')
      .eq('company_id', companyId)
      .order('observed_at', { ascending: false })
      .limit(windowLimit + 1),
    supabase.from('decision_work_items')
      .select('id,title,status,priority,description,completed_at,updated_at,evidence_refs,expected_impact,actual_impact')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false })
      .limit(windowLimit + 1),
  ]);

  if (snapshots.error) throw snapshots.error;
  if (outcomes.error) throw outcomes.error;
  if (workItems.error) throw workItems.error;

  const snapshotRows = (snapshots.data ?? []).slice(0, windowLimit);
  const outcomeRows = (outcomes.data ?? []).slice(0, windowLimit);
  const workRows = (workItems.data ?? []).slice(0, windowLimit);

  const events: BusinessReplayEvent[] = [
    ...snapshotRows.map((row) => ({
      id: String(row.id),
      occurredAt: replayTimestamp(row.observed_at) ?? new Date(0).toISOString(),
      kind: 'SNAPSHOT' as const,
      title: typeof row.snapshot_key === 'string' && row.snapshot_key.trim() ? row.snapshot_key : 'لقطة حالة تشغيلية',
      status: 'CAPTURED',
      detail: typeof row.source_version === 'string' && row.source_version.trim() ? `المصدر ${row.source_version}` : 'لقطة محفوظة من الحالة التجارية.',
      expectedImpact: null,
      actualImpact: null,
      qualityScore: typeof row.quality_score === 'number' && Number.isFinite(row.quality_score) ? row.quality_score : null,
      sourceVersion: typeof row.source_version === 'string' ? row.source_version : null,
      evidencePresent: Boolean(row.evidence && typeof row.evidence === 'object'),
    })),
    ...outcomeRows.map((row) => ({
      id: String(row.id),
      occurredAt: replayTimestamp(row.observed_at) ?? new Date(0).toISOString(),
      kind: 'OUTCOME' as const,
      title: typeof row.recommendation_key === 'string' && row.recommendation_key.trim() ? `نتيجة: ${row.recommendation_key}` : 'نتيجة توصية',
      status: typeof row.status === 'string' ? row.status : null,
      detail: row.actual_impact == null ? 'الأثر الفعلي غير متاح؛ لا يتم تحويله إلى نجاح/فشل مالي.' : `الأثر الفعلي: ${String(row.actual_impact)}`,
      expectedImpact: typeof row.expected_impact === 'number' && Number.isFinite(row.expected_impact) ? row.expected_impact : null,
      actualImpact: typeof row.actual_impact === 'number' && Number.isFinite(row.actual_impact) ? row.actual_impact : null,
      qualityScore: typeof row.outcome_quality === 'number' && Number.isFinite(row.outcome_quality) ? row.outcome_quality : null,
      sourceVersion: null,
      evidencePresent: Boolean(row.evidence && typeof row.evidence === 'object'),
    })),
    ...workRows.map((row) => ({
      id: String(row.id),
      occurredAt: replayTimestamp(row.completed_at ?? row.updated_at) ?? new Date(0).toISOString(),
      kind: 'WORK' as const,
      title: typeof row.title === 'string' && row.title.trim() ? row.title : 'عنصر عمل',
      status: typeof row.status === 'string' ? row.status : null,
      detail: typeof row.description === 'string' && row.description.trim() ? row.description : `الأولوية: ${typeof row.priority === 'string' ? row.priority : 'غير متاحة'}`,
      expectedImpact: typeof row.expected_impact === 'number' && Number.isFinite(row.expected_impact) ? row.expected_impact : null,
      actualImpact: typeof row.actual_impact === 'number' && Number.isFinite(row.actual_impact) ? row.actual_impact : null,
      qualityScore: null,
      sourceVersion: null,
      evidencePresent: Array.isArray(row.evidence_refs) && row.evidence_refs.length > 0,
    })),
  ]
    .filter((event) => event.occurredAt !== new Date(0).toISOString())
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, windowLimit);

  return {
    snapshotCount: snapshotRows.length,
    outcomeCount: outcomeRows.length,
    workItemCount: workRows.length,
    latestSnapshotAt: snapshotRows[0]?.observed_at ?? null,
    latestOutcomeAt: outcomeRows[0]?.observed_at ?? null,
    windowLimit,
    hasMoreHistory: snapshots.data?.length === windowLimit + 1 || outcomes.data?.length === windowLimit + 1 || workItems.data?.length === windowLimit + 1,
    events,
  };
}

export async function fetchRecommendationOutcome(recommendationId: string): Promise<RecommendationOutcome | null> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase
    .from('recommendation_outcomes')
    .select('id,recommendation_key,decision_id,observed_at,expected_impact,actual_impact,outcome_quality,status,evidence')
    .eq('company_id', companyId)
    .eq('recommendation_key', recommendationId)
    .maybeSingle();
  if (error) throw error;
  return data ? data as RecommendationOutcome : null;
}
export type ReceivablesReportRow = { id:string; invoice_number:string; invoice_date:string; due_date:string|null; total:number|null; paid_amount:number|null; balance:number; status:string|null; customer:{id:string|null;name:string|null}|null };
export type ReceivablesReportPage = { status:'CALCULATED'|'NO_DATA'; page:number; page_size:number; total_rows:number; total_outstanding:number; rows:ReceivablesReportRow[] };
export async function fetchReceivablesReportPage(page=0,pageSize=25):Promise<ReceivablesReportPage>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const {data,error}=await supabase.rpc('get_receivables_report_page',{p_page:page,p_page_size:pageSize});if(error)throw error;if(!data||typeof data!=='object')throw new Error('REPORT_DATA_UNAVAILABLE: receivables snapshot missing');const p=data as Record<string,unknown>;if(!Array.isArray(p.rows))throw new Error('REPORT_DATA_UNAVAILABLE: receivables rows missing');return{status:p.status==='NO_DATA'?'NO_DATA':'CALCULATED',page:Number(p.page??page),page_size:Number(p.page_size??pageSize),total_rows:Number(p.total_rows??0),total_outstanding:Number(p.total_outstanding??0),rows:p.rows as ReceivablesReportRow[]};}
export type CanonicalExportRow = { [key:string]: string|number|null };
export async function fetchReceivablesExportRows():Promise<CanonicalExportRow[]>{const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const {data,error}=await supabase.rpc('get_receivables_export_rows',{p_company_id:companyId,p_max_rows:10000});if(error)throw error;const payload=(data??{}) as Record<string,unknown>;if(!Array.isArray(payload.rows))throw new Error('REPORT_DATA_UNAVAILABLE: receivables export rows missing');return payload.rows as CanonicalExportRow[];}
export async function fetchSalesInvoices(page=0,pageSize=20):Promise<{data:SalesInvoice[];count:number|null}>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>500)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const from=page*pageSize,to=from+pageSize-1,{data,count,error}=await supabase.from('sales_invoices').select('*, customer:customers(id,name)',{count:'exact'}).eq('company_id',companyId).order('invoice_date',{ascending:false}).order('created_at',{ascending:false}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as SalesInvoice[],count};}
export async function fetchPurchaseInvoices(page=0,pageSize=20):Promise<{data:PurchaseInvoice[];count:number|null}>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>500)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const from=page*pageSize,to=from+pageSize-1,{data,count,error}=await supabase.from('purchase_invoices').select('*, supplier:suppliers(id,name)',{count:'exact'}).eq('company_id',companyId).order('invoice_date',{ascending:false}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as PurchaseInvoice[],count};}
type ImportRecordInput = Omit<ImportRecord, 'id' | 'company_id' | 'created_at' | 'error_message' | 'completed_at'> & { source_object_path?: string; file_mime?: string };
type ImportRecordPatch = Partial<Pick<ImportRecord, 'status' | 'progress' | 'error_message' | 'completed_at'>> & { processed_rows?: number; valid_rows?: number; invalid_rows?: number; duplicate_rows?: number };
type ImportJobState = { total_rows: number | null; processed_rows: number | null; valid_rows: number | null; invalid_rows: number | null; duplicate_rows: number | null; progress: number | null; result_summary: Record<string, unknown> | null; };
const TERMINAL_IMPORT_STATUSES = new Set(['completed', 'partial', 'failed', 'cancelled']);
export async function createImportRecord(input: ImportRecordInput): Promise<ImportRecord> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); if (input.total_rows == null) throw new Error('IMPORT_TOTAL_ROWS_REQUIRED'); const { data, error } = await supabase.rpc('import_create_job', { p_company_id: companyId, p_entity_type: input.entity_type ?? 'import', p_total_rows: input.total_rows, p_source_object_path: input.source_object_path ?? null, p_file_name: input.file_name ?? null, p_file_size: input.file_size ?? null, p_file_mime: input.file_mime ?? null }); if (error) throw error; return { id: String(data), company_id: companyId, ...input, error_message: null, created_at: new Date().toISOString(), completed_at: null }; }
async function readImportJob(id: string, companyId: string): Promise<ImportJobState> { const { data, error } = await supabase.from('import_jobs').select('total_rows, processed_rows, valid_rows, invalid_rows, duplicate_rows, quarantined_rows, progress, result_summary').eq('id', id).eq('company_id', companyId).maybeSingle(); if (error) throw error; if (!data) throw new Error('IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'); return { total_rows: data.total_rows == null ? null : Number(data.total_rows), processed_rows: data.processed_rows == null ? null : Number(data.processed_rows), valid_rows: data.valid_rows == null ? null : Number(data.valid_rows), invalid_rows: data.invalid_rows == null ? null : Number(data.invalid_rows), duplicate_rows: data.duplicate_rows == null ? null : Number(data.duplicate_rows), progress: data.progress == null ? null : Number(data.progress), result_summary: (data.result_summary as Record<string, unknown> | null) ?? null }; }
export async function updateImportRecord(id: string, patch: ImportRecordPatch): Promise<void> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const current = await readImportJob(id, companyId); const hasCounters = patch.processed_rows !== undefined || patch.valid_rows !== undefined || patch.invalid_rows !== undefined || patch.duplicate_rows !== undefined; if (patch.progress !== undefined || hasCounters) { if (current.total_rows == null || current.processed_rows == null || current.valid_rows == null || current.invalid_rows == null || current.duplicate_rows == null) throw new Error('IMPORT_STATE_INSUFFICIENT_DATA'); const progress = patch.progress === undefined ? current.progress ?? 0 : Math.min(100, Math.max(0, Number(patch.progress))); const processedRows = patch.processed_rows === undefined ? (current.total_rows > 0 ? Math.min(current.total_rows, Math.max(current.processed_rows, Math.round(current.total_rows * progress / 100))) : current.processed_rows) : Math.min(current.total_rows, Math.max(current.processed_rows, Math.trunc(patch.processed_rows))); const validRows = patch.valid_rows === undefined ? current.valid_rows : Math.trunc(patch.valid_rows); const invalidRows = patch.invalid_rows === undefined ? current.invalid_rows : Math.trunc(patch.invalid_rows); const duplicateRows = patch.duplicate_rows === undefined ? current.duplicate_rows : Math.trunc(patch.duplicate_rows); if (processedRows < 0 || validRows < 0 || invalidRows < 0 || duplicateRows < 0 || validRows > processedRows || invalidRows > processedRows || duplicateRows > processedRows) throw new Error('IMPORT_PROGRESS_COUNTER_INVALID'); const { error } = await supabase.rpc('import_update_job_progress', { p_job_id: id, p_processed_rows: processedRows, p_valid_rows: validRows, p_invalid_rows: invalidRows, p_duplicate_rows: duplicateRows, p_status: TERMINAL_IMPORT_STATUSES.has(patch.status ?? '') ? 'processing' : (patch.status ?? 'processing') }); if (error) throw error; } if (patch.status && TERMINAL_IMPORT_STATUSES.has(patch.status)) { const { error } = await supabase.rpc('import_finish_job', { p_job_id: id, p_status: patch.status, p_result_summary: current.result_summary ?? {}, p_error_message: patch.error_message ?? null }); if (error) throw error; } else if (patch.error_message !== undefined && patch.status === undefined) { if (current.processed_rows == null || current.valid_rows == null || current.invalid_rows == null || current.duplicate_rows == null) throw new Error('IMPORT_STATE_INSUFFICIENT_DATA'); const { error } = await supabase.rpc('import_update_job_progress', { p_job_id: id, p_processed_rows: current.processed_rows, p_valid_rows: current.valid_rows, p_invalid_rows: current.invalid_rows, p_duplicate_rows: current.duplicate_rows, p_status: 'processing' }); if (error) throw error; } }
const MAX_IMPORT_RECORD_ROWS = 500;
export async function fetchImportRecords(limit = MAX_IMPORT_RECORD_ROWS, focusJobId?: string): Promise<ImportRecord[]> { if (!Number.isInteger(limit) || limit < 1 || limit > MAX_IMPORT_RECORD_ROWS) throw new Error('REPORT_QUERY_INVALID_IMPORT_LIMIT'); const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const { data, error } = await supabase.from('import_jobs').select('id, company_id, job_type, status, total_rows, valid_rows, invalid_rows, quarantined_rows, progress, error_message, created_at, completed_at, result_summary').eq('company_id', companyId).order('created_at', { ascending: false }).order('id', { ascending: true }).range(0, limit - 1); if (error) throw error; let rows = data ?? []; if (focusJobId && !rows.some(row => row.id === focusJobId)) { const { data: focusedRow, error: focusedError } = await supabase.from('import_jobs').select('id, company_id, job_type, status, total_rows, valid_rows, invalid_rows, quarantined_rows, progress, error_message, created_at, completed_at, result_summary').eq('company_id', companyId).eq('id', focusJobId).maybeSingle(); if (focusedError) throw focusedError; if (focusedRow) rows = [focusedRow, ...rows]; } return rows.map(row => ({ id: row.id, company_id: row.company_id, job_type: row.job_type, status: row.status, file_name: String((row.result_summary as Record<string, unknown> | null)?.file_name ?? row.job_type ?? 'import'), file_size: 0, source_type: 'import', total_rows: row.total_rows == null ? null : Number(row.total_rows), valid_rows: row.valid_rows == null ? null : Number(row.valid_rows), invalid_rows: row.invalid_rows == null ? null : Number(row.invalid_rows), quarantined_rows: row.quarantined_rows == null ? null : Number(row.quarantined_rows), entity_type: row.job_type ?? null, source_domain: typeof (row.result_summary as Record<string, unknown> | null)?.source_domain === 'string' ? String((row.result_summary as Record<string, unknown>).source_domain) : null, progress: row.progress == null ? null : Number(row.progress), error_message: row.error_message ?? null, created_at: row.created_at, completed_at: row.completed_at ?? null })); }
export async function markAlertRead(id: string): Promise<void> { if (!await resolveCurrentCompanyId()) throw new Error('TENANT_REQUIRED'); const { error } = await supabase.rpc('mark_alert_read', { p_alert_id: id }); if (error) throw error; }
export async function updateRecommendationStatus(id: string, status: string): Promise<void> { if (!await resolveCurrentCompanyId()) throw new Error('TENANT_REQUIRED'); const { error } = await supabase.rpc('update_recommendation_status', { p_recommendation_id: id, p_status: status }); if (error) throw error; }
export async function fetchForecasts(): Promise<Forecast[]> { const { data, error } = await supabase.rpc('get_forecast_snapshot', { p_limit: 500 }); if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: forecast snapshot missing'); const payload = data as Record<string, unknown>; if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: forecast rows missing'); return payload.rows as Forecast[]; }
export type CustomersPage = { data: Customer[]; count: number|null; page: number; page_size: number };
export async function fetchCustomersPage(page=0,pageSize=50,search=''):Promise<CustomersPage>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const normalized=search.trim().replace(/[,%()\\]/g,' ');const from=page*pageSize,to=from+pageSize-1;let query=supabase.from('customers').select('*',{count:'exact'}).eq('company_id',companyId);if(normalized)query=query.or(`name.ilike.%${normalized}%,code.ilike.%${normalized}%`);const {data,count,error}=await query.order('name',{ascending:true}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as Customer[],count,page,page_size:pageSize};}
export type ProductsPage = { data: Product[]; count: number|null; page: number; page_size: number };
export async function fetchProductsPage(page=0,pageSize=50,search=''):Promise<ProductsPage>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const normalized=search.trim().replace(/[,%()\\]/g,' ');const from=page*pageSize,to=from+pageSize-1;let query=supabase.from('products').select('*',{count:'exact'}).eq('company_id',companyId);if(normalized)query=query.or(`name.ilike.%${normalized}%,sku.ilike.%${normalized}%`);const {data,count,error}=await query.order('name',{ascending:true}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as Product[],count,page,page_size:pageSize};}
const MAX_ENTITY_ROWS = 500;
export async function fetchCustomers(): Promise<Customer[]> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const {data,count,error}=await supabase.from('customers').select('*',{count:'exact'}).eq('company_id',companyId).order('name',{ascending:true}).order('id',{ascending:true}).range(0,MAX_ENTITY_ROWS-1); if(error)throw error; if((count??0)>MAX_ENTITY_ROWS)throw new Error('REPORT_QUERY_LIMIT_EXCEEDED: customers require explicit pagination'); return (data??[]) as Customer[]; }
export async function fetchProducts(): Promise<Product[]> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const {data,count,error}=await supabase.from('products').select('*',{count:'exact'}).eq('company_id',companyId).order('name',{ascending:true}).order('id',{ascending:true}).range(0,MAX_ENTITY_ROWS-1); if(error)throw error; if((count??0)>MAX_ENTITY_ROWS)throw new Error('REPORT_QUERY_LIMIT_EXCEEDED: products require explicit pagination'); return (data??[]) as Product[]; }

export type SupplierRow = {
  id:string;
  name:string;
  code:string|null;
  phone:string|null;
  email:string|null;
  address:string|null;
  tax_id:string|null;
  payment_terms_days:number|null;
  created_at:string|null;
};
export type SuppliersPage = { data:SupplierRow[]; count:number|null; page:number; page_size:number };
export async function fetchSuppliersPage(page=0,pageSize=50,search=''):Promise<SuppliersPage>{
  if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');
  if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');
  const companyId=await resolveCurrentCompanyId();
  if(!companyId)throw new Error('TENANT_REQUIRED');
  const normalized=search.trim().replace(/[,%()\\]/g,' ');
  const from=page*pageSize,to=from+pageSize-1;
  let query=supabase.from('suppliers').select('id,name,code,phone,email,address,tax_id,payment_terms_days,created_at',{count:'exact'}).eq('company_id',companyId);
  if(normalized)query=query.or(`name.ilike.%${normalized}%,code.ilike.%${normalized}%`);
  const {data,count,error}=await query.order('name',{ascending:true}).order('id',{ascending:true}).range(from,to);
  if(error)throw error;
  return{data:(data??[]) as SupplierRow[],count,page,page_size:pageSize};
}

export type WorkerHealthSnapshot = {
  queued: number;
  active: number;
  expiredActive: number;
  activeReadComplete: boolean;
};

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