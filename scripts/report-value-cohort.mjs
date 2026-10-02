import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const url = process.env.REPORT_ADVISOR_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const companyId = process.env.REPORT_ADVISOR_COMPANY_ID;
if (!url || !serviceRole || !companyId) {
  throw new Error('REPORT_VALUE_COHORT_ENV_REQUIRED');
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: jobs, error: jobsError } = await supabase
  .from('report_execution_jobs')
  .select('id,source_path,source_hash,checkpoint,evidence')
  .eq('company_id', companyId)
  .eq('status', 'completed')
  .order('updated_at', { ascending: false })
  .limit(500);
if (jobsError) throw jobsError;

const sourceJobs = [];
const seen = new Set();
for (const job of jobs ?? []) {
  const pathName = String(job.source_path ?? '');
  const hash = String(job.source_hash ?? '');
  if (!hash || seen.has(hash) || /^(customer|product|invoice)-\\d+/i.test(pathName)) continue;
  if (!/\\.(xlsx|xls|xlsm|csv|tsv|ods|pdf|docx|doc|rtf|json|jsonl|txt|md|markdown|jpg|jpeg|png|webp|tiff|bmp)$/i.test(pathName)) continue;
  seen.add(hash);
  sourceJobs.push(job);
  if (sourceJobs.length === 40) break;
}

if (sourceJobs.length !== 40) throw new Error('REPORT_VALUE_COHORT_INCOMPLETE:' + sourceJobs.length + '/40');

const hashes = sourceJobs.map((job) => String(job.source_hash));
const jobIds = sourceJobs.map((job) => String(job.id));

const { data: passports, error: passportError } = await supabase
  .from('report_evidence_passports')
  .select('id,report_execution_job_id,evidence_snapshot_id,source_hash,acceptance_status,verification_status,decision_readiness,evidence')
  .eq('company_id', companyId)
  .in('source_hash', hashes);
if (passportError) throw passportError;

const { data: recommendations, error: recommendationError } = await supabase
  .from('recommendations')
  .select('id,decision_id,evidence_snapshot_id,evidence,status,expected_impact')
  .eq('company_id', companyId)
  .in('evidence_snapshot_id', (passports ?? []).map((row) => row.evidence_snapshot_id));
if (recommendationError) throw recommendationError;

const { data: decisions, error: decisionError } = await supabase
  .from('business_intelligence_decisions')
  .select('id,recommendation_id,status,evidence,approved_at,expected_impact,confidence')
  .eq('company_id', companyId);
if (decisionError) throw decisionError;

const decisionIds = (decisions ?? []).map((row) => String(row.id));
const { data: approvals, error: approvalError } = decisionIds.length
  ? await supabase.from('decision_approvals').select('id,decision_id,status').eq('company_id', companyId).in('decision_id', decisionIds)
  : { data: [], error: null };
if (approvalError) throw approvalError;

const { data: workItems, error: workError } = decisionIds.length
  ? await supabase.from('decision_work_items').select('id,decision_id,status,evidence_refs').eq('company_id', companyId).in('decision_id', decisionIds)
  : { data: [], error: null };
if (workError) throw workError;

const { data: outcomes, error: outcomeError } = decisionIds.length
  ? await supabase.from('recommendation_outcomes').select('id,decision_id,status,expected_impact,actual_impact,evidence').eq('company_id', companyId).in('decision_id', decisionIds)
  : { data: [], error: null };
if (outcomeError) throw outcomeError;

const passportByHash = new Map((passports ?? []).map((row) => [String(row.source_hash), row]));
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
  const passport = passportByHash.get(hash);
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

console.log(JSON.stringify({ summary, reports: result }, null, 2));
