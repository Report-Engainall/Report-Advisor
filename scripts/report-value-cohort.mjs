import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const url = process.env.REPORT_ADVISOR_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const explicitCompanyId = process.env.REPORT_ADVISOR_COMPANY_ID?.trim() || '';
if (!url || !serviceRole) {
  throw new Error('REPORT_VALUE_COHORT_ENV_REQUIRED');
}

const RETRYABLE_HTTP = new Set([408, 425, 429, 500, 502, 503, 504]);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const resilientFetch = async (input, init = {}) => {
  let last;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (!RETRYABLE_HTTP.has(response.status) || attempt === 5) return response;
      last = new Error('SUPABASE_RETRYABLE_HTTP_' + response.status);
    } catch (error) {
      last = error;
      if (attempt === 5) throw error;
    }
    await wait(1000 * 2 ** (attempt - 1));
  }
  throw last ?? new Error('SUPABASE_RETRY_EXHAUSTED');
};

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: resilientFetch },
});

const TARGET_COHORT_SIZE = 40;
const eligiblePath = /\.(xlsx|xls|xlsm|csv|tsv|ods|pdf|docx|doc|rtf|json|jsonl|txt|md|markdown|jpg|jpeg|png|webp|tiff|bmp)$/i;
const syntheticPath = /^(customer|product|invoice)-\d+/i;
const syntheticCanonicalPath = /^canonical-import:/i;
const supportedGenericJob = /^canonical-import:generic:/i;

function isRealReportJob(row) {
  const sourcePath = String(row.source_path ?? '').trim();
  const sourceHash = String(row.source_hash ?? '').trim();
  const jobKey = String(row.job_key ?? '').trim();
  return Boolean(
    row.company_id &&
    sourceHash &&
    /^sha256:[0-9a-fA-F]{64}$/.test(sourceHash) &&
    eligiblePath.test(sourcePath) &&
    !syntheticPath.test(sourcePath) &&
    !syntheticCanonicalPath.test(sourcePath) &&
    supportedGenericJob.test(jobKey),
  );
}

async function selectCohortJobs() {
  let query = supabase
    .from('report_execution_jobs')
    .select('id,company_id,source_path,source_hash,job_key,checkpoint,evidence,updated_at')
    .eq('status', 'completed')
    .not('company_id', 'is', null)
    .not('source_hash', 'is', null)
    .order('updated_at', { ascending: true })
    .limit(5000);

  if (explicitCompanyId) query = query.eq('company_id', explicitCompanyId);

  const { data, error } = await query;
  if (error) throw error;

  const rawJobs = (data ?? []).filter((job) =>
    isRealReportJob(job) &&
    String(job.checkpoint?.stage ?? '') === 'rendered' &&
    /^[0-9a-fA-F-]{36}$/.test(String(job.evidence?.renderedOutput?.importId ?? '')),
  );

  const chunk = (items, size = 50) => {
    const out = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
  };

  const sourceHashes = [...new Set(rawJobs.map((job) => String(job.source_hash)))];
  const fileRows = [];
  for (const batch of chunk(sourceHashes)) {
    const result = await supabase
      .from('file_records')
      .select('id,company_id,file_hash,status,security_status')
      .in('file_hash', batch)
      .limit(1000);
    if (result.error) throw result.error;
    fileRows.push(...(result.data ?? []));
  }

  const eligibleFiles = new Map(
    fileRows
      .filter((file) => ['ready', 'processed', 'verified'].includes(String(file.status)) && String(file.security_status) === 'passed')
      .map((file) => [String(file.company_id) + '|' + String(file.file_hash), file]),
  );

  const importIds = [...new Set(
    rawJobs
      .map((job) => String(job.evidence?.renderedOutput?.importId ?? ''))
      .filter(Boolean),
  )];

  const importRows = [];
  for (const batch of chunk(importIds)) {
    const result = await supabase
      .from('import_jobs')
      .select('id,company_id,file_record_id,status')
      .in('id', batch)
      .limit(1000);
    if (result.error) throw result.error;
    importRows.push(...(result.data ?? []));
  }

  const eligibleImports = new Map(
    importRows
      .filter((item) => ['completed', 'processed', 'verified', 'ready'].includes(String(item.status ?? '')))
      .map((item) => [String(item.id), item]),
  );

  const analysisRows = [];
  for (const batch of chunk(importIds)) {
    const result = await supabase
      .from('source_analysis_snapshots')
      .select('id,company_id,import_job_id,analysis_status')
      .in('import_job_id', batch)
      .eq('analysis_status', 'analyzed')
      .limit(1000);
    if (result.error) throw result.error;
    analysisRows.push(...(result.data ?? []));
  }

  const eligibleAnalyses = new Set(
    analysisRows.map((item) => String(item.company_id) + '|' + String(item.import_job_id)),
  );

  const refreshable = rawJobs.filter((job) => {
    const companyId = String(job.company_id);
    const hash = String(job.source_hash);
    const importId = String(job.evidence?.renderedOutput?.importId ?? '');
    const file = eligibleFiles.get(companyId + '|' + hash);
    const importJob = eligibleImports.get(importId);
    return Boolean(file && importJob && String(importJob.company_id) === companyId && String(importJob.file_record_id) === String(file.id) && eligibleAnalyses.has(companyId + '|' + importId));
  });

  const sorted = refreshable.sort((a, b) => {
    const left = [String(a.source_path ?? '').normalize('NFKC').toLocaleLowerCase(), String(a.source_hash ?? ''), String(a.company_id ?? ''), String(a.id ?? '')];
    const right = [String(b.source_path ?? '').normalize('NFKC').toLocaleLowerCase(), String(b.source_hash ?? ''), String(b.company_id ?? ''), String(b.id ?? '')];
    for (let i = 0; i < left.length; i += 1) {
      const cmp = left[i].localeCompare(right[i], 'ar');
      if (cmp !== 0) return cmp;
    }
    return 0;
  });

  const selectedByHash = new Map();
  for (const job of sorted) {
    const hash = String(job.source_hash);
    if (!selectedByHash.has(hash)) selectedByHash.set(hash, job);
    if (selectedByHash.size === TARGET_COHORT_SIZE) break;
  }

  const sourceJobs = [...selectedByHash.values()];
  if (sourceJobs.length !== TARGET_COHORT_SIZE) {
    throw new Error('REPORT_VALUE_COHORT_INCOMPLETE:' + sourceJobs.length + '/' + TARGET_COHORT_SIZE + ':refreshableUniqueRealReportHashes');
  }

  console.log(JSON.stringify({
    candidateCounts: {
      rawRealReports: rawJobs.length,
      refreshableReports: refreshable.length,
      refreshableUniqueHashes: new Set(refreshable.map((job) => String(job.source_hash))).size,
    },
  }));

  return sourceJobs;
}

const sourceJobs = await selectCohortJobs();
const tenantCount = new Set(sourceJobs.map((job) => String(job.company_id))).size;
console.log(JSON.stringify({
  cohortMode: explicitCompanyId ? 'EXPLICIT_TENANT' : 'CROSS_TENANT_UNIQUE_SOURCE_HASH',
  cohortSize: sourceJobs.length,
  tenantCount,
  tenants: [...new Set(sourceJobs.map((job) => String(job.company_id)))].sort(),
  deterministicOrder: 'sourcePath_ASC_NORMALIZED → sourceHash_ASC → companyId_ASC',
}));

const refreshResults = [];
for (let offset = 0; offset < sourceJobs.length; offset += 4) {
  const batch = sourceJobs.slice(offset, offset + 4);
  const batchResults = await Promise.all(batch.map(async (job) => {
    const { data, error } = await supabase.rpc('refresh_report_evidence_passport', {
      p_company_id: String(job.company_id),
      p_job_id: String(job.id),
    });
    if (error) {
      return {
        jobId: String(job.id),
        source: String(job.source_path ?? ''),
        status: 'REVIEW',
        reason: String(error.message || error),
      };
    }
    return {
      jobId: String(job.id),
      source: String(job.source_path ?? ''),
      status: String(data?.verificationStatus ?? 'REVIEW'),
      decisionReadiness: String(data?.decisionReadiness ?? 'REVIEW'),
      coverage: String(data?.canonicalCoverage ?? 'UNKNOWN'),
      passportId: data?.passportId ? String(data.passportId) : null,
    };
  }));
  refreshResults.push(...batchResults);
  console.log(JSON.stringify({ refreshBatch: offset / 4 + 1, results: batchResults }));
}

const refreshSummary = {
  attempted: refreshResults.length,
  verified: refreshResults.filter((row) => row.status === 'VERIFIED').length,
  review: refreshResults.filter((row) => row.status === 'REVIEW').length,
  unverified: refreshResults.filter((row) => row.status === 'UNVERIFIED').length,
};

if (refreshSummary.attempted !== TARGET_COHORT_SIZE || refreshSummary.verified !== TARGET_COHORT_SIZE || refreshResults.some((row) => row.decisionReadiness !== 'READY' || row.coverage !== 'FULL')) {
  throw new Error('REPORT_VALUE_COHORT_PASSPORT_NOT_CLOSED:' + JSON.stringify(refreshSummary) + ':' + JSON.stringify(refreshResults.filter((row) => row.status !== 'VERIFIED' || row.decisionReadiness !== 'READY' || row.coverage !== 'FULL')));
}

const jobIds = sourceJobs.map((job) => String(job.id));

const { data: passports, error: passportError } = await supabase
  .from('report_evidence_passports')
  .select('id,company_id,report_execution_job_id,evidence_snapshot_id,source_hash,acceptance_status,verification_status,decision_readiness,evidence')
  .in('report_execution_job_id', jobIds);
if (passportError) throw passportError;

const snapshotIds = [...new Set((passports ?? []).map((row) => row.evidence_snapshot_id).filter(Boolean).map(String))];
const { data: recommendations, error: recommendationError } = snapshotIds.length
  ? await supabase
      .from('recommendations')
      .select('id,company_id,decision_id,evidence_snapshot_id,evidence,status,expected_impact')
      .in('evidence_snapshot_id', snapshotIds)
  : { data: [], error: null };
if (recommendationError) throw recommendationError;

const recommendationIds = [...new Set((recommendations ?? []).map((row) => row.id).filter(Boolean).map(String))];
const { data: decisions, error: decisionError } = recommendationIds.length
  ? await supabase
      .from('business_intelligence_decisions')
      .select('id,company_id,recommendation_id,status,evidence,approved_at,expected_impact,confidence')
      .in('recommendation_id', recommendationIds)
  : { data: [], error: null };
if (decisionError) throw decisionError;

const decisionIds = [...new Set((decisions ?? []).map((row) => String(row.id)))];
const { data: approvals, error: approvalError } = decisionIds.length
  ? await supabase.from('decision_approvals').select('id,company_id,decision_id,status').in('decision_id', decisionIds)
  : { data: [], error: null };
if (approvalError) throw approvalError;

const { data: workItems, error: workError } = decisionIds.length
  ? await supabase.from('decision_work_items').select('id,company_id,decision_id,status,evidence_refs').in('decision_id', decisionIds)
  : { data: [], error: null };
if (workError) throw workError;

const { data: outcomes, error: outcomeError } = decisionIds.length
  ? await supabase.from('recommendation_outcomes').select('id,company_id,decision_id,status,expected_impact,actual_impact,evidence').in('decision_id', decisionIds)
  : { data: [], error: null };
if (outcomeError) throw outcomeError;

const passportByJobId = new Map((passports ?? []).map((row) => [String(row.report_execution_job_id), row]));
const recommendationsBySnapshot = new Map();
for (const row of recommendations ?? []) {
  const key = String(row.evidence_snapshot_id);
  const list = recommendationsBySnapshot.get(key) ?? [];
  list.push(row);
  recommendationsBySnapshot.set(key, list);
}

const decisionsByRecommendation = new Map();
for (const row of decisions ?? []) {
  if (!row.recommendation_id) continue;
  decisionsByRecommendation.set(String(row.recommendation_id), row);
}

const result = sourceJobs.map((job) => {
  const hash = String(job.source_hash);
  const tenantId = String(job.company_id);
  const passport = passportByJobId.get(String(job.id));
  const snapshotId = passport ? String(passport.evidence_snapshot_id) : '';
  const sourceRecommendations = snapshotId ? (recommendationsBySnapshot.get(snapshotId) ?? []) : [];
  const sourceDecisionIds = sourceRecommendations.map((row) => String(row.id)).map((id) => decisionsByRecommendation.get(id)).filter(Boolean);
  const sourceDecision = sourceDecisionIds.find((row) => {
    const evidence = row.evidence && typeof row.evidence === 'object' ? row.evidence : {};
    return String(evidence.sourceHash ?? '') === hash;
  }) ?? null;
  const decisionId = sourceDecision ? String(sourceDecision.id) : '';
  const approval = decisionId ? (approvals ?? []).find((row) => String(row.decision_id) === decisionId) : null;
  const sourceWork = decisionId
    ? (workItems ?? []).find((row) => {
        if (String(row.decision_id) !== decisionId) return false;
        const refs = Array.isArray(row.evidence_refs) ? row.evidence_refs : [];
        return refs.some((ref) => ref && typeof ref === 'object' && String(ref.sourceHash ?? '') === hash);
      })
    : null;
  const outcome = decisionId ? (outcomes ?? []).find((row) => String(row.decision_id) === decisionId) : null;

  const rendered = job.evidence?.renderedOutput && typeof job.evidence.renderedOutput === 'object'
    ? job.evidence.renderedOutput
    : {};
  const signals = Array.isArray(passport?.evidence?.businessSignals) ? passport.evidence.businessSignals : [];
  const learning = outcome?.evidence && typeof outcome.evidence === 'object' && outcome.evidence.learning
    ? 'PASS'
    : outcome ? 'REVIEW' : 'NOT APPLICABLE';
  const benchmark = String(rendered.benchmarkStatus ?? '') === 'INSUFFICIENT_SAMPLE'
    ? 'INSUFFICIENT SAMPLE'
    : rendered.benchmarkStatus
      ? 'REVIEW'
      : 'NOT APPLICABLE';

  return {
    source: String(job.source_path ?? ''),
    companyId: tenantId,
    passport: passport?.verification_status === 'VERIFIED' ? 'PASS' : passport?.acceptance_status === 'REVIEW' ? 'REVIEW' : 'BLOCKED',
    signals: signals.length ? 'PASS' : 'REVIEW',
    recommendation: sourceRecommendations.length ? 'PASS' : 'REVIEW',
    decision: sourceDecision ? 'PASS' : 'REVIEW',
    approval: approval?.status === 'APPROVED' ? 'PASS' : approval ? 'REVIEW' : 'REVIEW',
    work: sourceWork?.status === 'COMPLETED' ? 'PASS' : sourceWork ? 'REVIEW' : 'REVIEW',
    outcome: outcome ? 'PASS' : 'REVIEW',
    learning,
    benchmark,
  };
});

const summary = {
  cohort: result.length,
  uniqueSourceHashes: new Set(sourceJobs.map((job) => String(job.source_hash))).size,
  tenants: new Set(result.map((row) => row.companyId)).size,
  evidencePassport: result.filter((row) => row.passport === 'PASS').length,
  signals: result.filter((row) => row.signals === 'PASS').length,
  recommendations: result.filter((row) => row.recommendation === 'PASS').length,
  decisions: result.filter((row) => row.decision === 'PASS').length,
  approvals: result.filter((row) => row.approval === 'PASS').length,
  work: result.filter((row) => row.work === 'PASS').length,
  outcomes: result.filter((row) => row.outcome === 'PASS').length,
  learning: result.filter((row) => row.learning === 'PASS').length,
  benchmarkReady: result.filter((row) => row.benchmark === 'PASS').length,
};

console.log(JSON.stringify({ summary, refreshSummary, refreshResults, reports: result }, null, 2));
