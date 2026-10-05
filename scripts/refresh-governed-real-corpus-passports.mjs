import process from 'node:process';

const SUPABASE_URL = process.env.REPORT_ADVISOR_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXACT_HEAD = process.env.EXACT_HEAD || 'UNKNOWN';

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error('REAL_CORPUS_PASSPORT_REFRESH_ENV_MISSING');
}

async function rest(path, init = {}) {
  const response = await fetch(SUPABASE_URL + path, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: 'Bearer ' + SERVICE_ROLE,
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) {
    throw new Error('SUPABASE_HTTP_' + response.status + ':' + text.slice(0, 1000));
  }
  return body;
}

function isGovernedReal(metadata) {
  const value = metadata && typeof metadata === 'object' ? metadata : {};
  const corpus = value.report_corpus === true || String(value.report_corpus ?? '').toLowerCase() === 'true';
  const fixtureType = String(value.fixture_type ?? '').trim().toLowerCase();
  const catalogId = String(value.catalog_id ?? '').trim().toLowerCase();
  return corpus && fixtureType !== 'synthetic-realistic' && catalogId !== 'report-intelligence.48';
}

const companies = await rest('/rest/v1/companies?select=id,name,created_at&name=like.Aghbari%20Report%20Corpus%20CI%20%25&order=created_at.desc&limit=1');
const company = companies?.[0];
if (!company?.id) throw new Error('REAL_CORPUS_TENANT_NOT_FOUND');

const files = await rest(
  '/rest/v1/file_records?company_id=eq.' + encodeURIComponent(company.id) +
  '&metadata-%3E%3Ereport_corpus=eq.true' +
  '&select=id,file_name,file_hash,status,metadata' +
  '&order=created_at.asc&limit=500'
);
const governedFiles = (files || []).filter(file => isGovernedReal(file.metadata));
const results = [];

for (const file of governedFiles) {
  const jobs = await rest(
    '/rest/v1/report_execution_jobs?company_id=eq.' + encodeURIComponent(company.id) +
    '&source_hash=eq.' + encodeURIComponent(String(file.file_hash || '')) +
    '&status=eq.completed' +
    '&checkpoint-%3E%3Estage=eq.rendered' +
    '&select=id,company_id,source_path,source_hash,status,checkpoint,evidence' +
    '&order=updated_at.desc&limit=50'
  );

  for (const job of jobs || []) {
    try {
      const refreshed = await rest('/rest/v1/rpc/refresh_report_evidence_passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_company_id: company.id, p_job_id: job.id }),
      });
      results.push({
        fileRecordId: file.id,
        fileName: file.file_name,
        reportJobId: job.id,
        sourceHash: file.file_hash,
        verificationStatus: refreshed?.verificationStatus ?? null,
        decisionReadiness: refreshed?.decisionReadiness ?? null,
        canonicalCoverage: refreshed?.canonicalCoverage ?? null,
        status: 'REFRESHED',
      });
    } catch (error) {
      results.push({
        fileRecordId: file.id,
        fileName: file.file_name,
        reportJobId: job.id,
        sourceHash: file.file_hash,
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

const ready = results.filter(row => row.status === 'REFRESHED' && row.verificationStatus === 'VERIFIED' && row.decisionReadiness === 'READY');
const failed = results.filter(row => row.status === 'FAILED');

const summary = {
  exactHead: EXACT_HEAD,
  tenant: { id: company.id, name: company.name },
  discoveredGovernedRealFiles: governedFiles.length,
  renderedCompletedJobsVisited: results.length,
  readyPassports: ready.length,
  failedRefreshes: failed.length,
  results,
};

console.log(JSON.stringify(summary, null, 2));
if (failed.length > 0) process.exitCode = 1;
