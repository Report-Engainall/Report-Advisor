import process from 'node:process';

const SUPABASE_URL = process.env.REPORT_ADVISOR_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXACT_HEAD = process.env.EXACT_HEAD || 'UNKNOWN';
const REQUEST_TIMEOUT_MS = Number(process.env.REAL_CORPUS_REQUEST_TIMEOUT_MS || '25000');
const REQUEST_ATTEMPTS = 3;
const RETRYABLE_HTTP = new Set([408, 425, 429, 500, 502, 503, 504]);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error('REAL_CORPUS_PASSPORT_REFRESH_ENV_MISSING');
}
if (!Number.isFinite(REQUEST_TIMEOUT_MS) || REQUEST_TIMEOUT_MS < 1000) {
  throw new Error('REAL_CORPUS_REQUEST_TIMEOUT_MS_INVALID');
}

async function rest(path, init = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= REQUEST_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;
    let responseText;
    try {
      response = await fetch(SUPABASE_URL + path, {
        ...init,
        signal: controller.signal,
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: 'Bearer ' + SERVICE_ROLE,
          ...(init.headers || {}),
        },
      });
      responseText = await response.text();
    } catch (error) {
      lastError = new Error('REAL_CORPUS_REQUEST_FAILED:' + String(error?.message ?? error).slice(0, 300));
      if (attempt >= REQUEST_ATTEMPTS) throw lastError;
      console.log(JSON.stringify({ status: 'RETRY', phase: 'real-corpus-passport-refresh', attempt, reason: lastError.message, path }));
      await wait(Math.min(3000, 750 * (2 ** (attempt - 1))));
      continue;
    } finally {
      clearTimeout(timeout);
    }

    if (response.ok) {
      try { return responseText ? JSON.parse(responseText) : null; }
      catch (error) { throw new Error('REAL_CORPUS_RESPONSE_JSON_INVALID:' + String(error?.message ?? error).slice(0, 240)); }
    }

    lastError = new Error('SUPABASE_HTTP_' + response.status + ':' + String(responseText ?? '').slice(0, 1000));
    if (!RETRYABLE_HTTP.has(response.status) || attempt >= REQUEST_ATTEMPTS) throw lastError;
    console.log(JSON.stringify({ status: 'RETRY', phase: 'real-corpus-passport-refresh', attempt, httpStatus: response.status, path }));
    await wait(Math.min(3000, 750 * (2 ** (attempt - 1))));
  }
  throw lastError ?? new Error('REAL_CORPUS_REQUEST_RETRY_EXHAUSTED');
}

function isGovernedReal(metadata) {
  const value = metadata && typeof metadata === 'object' ? metadata : {};
  const corpus = value.report_corpus === true || String(value.report_corpus ?? '').toLowerCase() === 'true';
  const fixtureType = String(value.fixture_type ?? '').trim().toLowerCase();
  const catalogId = String(value.catalog_id ?? '').trim().toLowerCase();
  return corpus && fixtureType !== 'synthetic-realistic' && catalogId !== 'report-intelligence.48';
}

const configuredTenantIds = [...new Set(
  String(process.env.E2E_CORPUS_TENANT_IDS || process.env.E2E_CORPUS_TENANT_ID || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
)];
const targetTenantIds = configuredTenantIds.length ? configuredTenantIds : [];
if (!targetTenantIds.length) {
  throw new Error('REAL_CORPUS_TENANT_IDS_REQUIRED');
}

const tenantResults = [];
const results = [];
const seenLogicalJobs = new Set();
let logicalDuplicatesSkipped = 0;
console.log(JSON.stringify({ status: 'STARTED', phase: 'real-corpus-passport-refresh', exactHead: EXACT_HEAD, tenantCount: targetTenantIds.length, requestTimeoutMs: REQUEST_TIMEOUT_MS, maxAttempts: REQUEST_ATTEMPTS }));

for (const tenantId of targetTenantIds) {
  const companies = await rest('/rest/v1/companies?select=id,name,created_at&id=eq.' + encodeURIComponent(tenantId) + '&limit=1');
  const company = companies?.[0];
  if (!company?.id) throw new Error('REAL_CORPUS_TENANT_NOT_FOUND:' + tenantId);

  const files = await rest(
    '/rest/v1/file_records?company_id=eq.' + encodeURIComponent(company.id) +
    '&metadata-%3E%3Ereport_corpus=eq.true' +
    '&select=id,file_name,file_hash,status,metadata' +
    '&order=created_at.asc&limit=500'
  );
  const governedFiles = (files || []).filter(file => isGovernedReal(file.metadata));

  for (const file of governedFiles) {
    const jobs = await rest(
      '/rest/v1/report_execution_jobs?company_id=eq.' + encodeURIComponent(company.id) +
      '&source_hash=eq.' + encodeURIComponent(String(file.file_hash || '')) +
      '&status=eq.completed' +
      '&checkpoint-%3E%3Estage=eq.rendered' +
      '&select=id,company_id,source_path,source_hash,job_key,status,checkpoint,evidence,completed_at,updated_at' +
      '&order=updated_at.desc&limit=50'
    );

    for (const job of jobs || []) {
      const logicalKey = [
        company.id,
        String(job.source_hash ?? ''),
        String(job.source_path ?? ''),
        String(job.job_key ?? job.id),
      ].join('|');
      if (seenLogicalJobs.has(logicalKey)) {
        logicalDuplicatesSkipped += 1;
        continue;
      }
      seenLogicalJobs.add(logicalKey);
      console.log(JSON.stringify({
        status: 'REFRESHING',
        phase: 'real-corpus-passport-refresh',
        exactHead: EXACT_HEAD,
        tenantId: company.id,
        reportJobId: job.id,
        sourceHash: job.source_hash,
      }));
      try {
        const refreshed = await rest('/rest/v1/rpc/refresh_report_evidence_passport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_company_id: company.id, p_job_id: job.id }),
        });
        results.push({
          tenantId: company.id,
          tenantName: company.name,
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
          tenantId: company.id,
          tenantName: company.name,
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

  tenantResults.push({
    tenantId: company.id,
    tenantName: company.name,
    governedRealFiles: governedFiles.length,
    renderedCompletedJobsVisited: results.filter(row => row.tenantId === company.id).length,
  });
}const ready = results.filter(row => row.status === 'REFRESHED' && row.verificationStatus === 'VERIFIED' && row.decisionReadiness === 'READY');
const failed = results.filter(row => row.status === 'FAILED');

const summary = {
  exactHead: EXACT_HEAD,
  tenants: tenantResults,
  discoveredGovernedRealFiles: tenantResults.reduce((sum, tenant) => sum + tenant.governedRealFiles, 0),
  renderedCompletedJobsVisited: results.length,
  logicalDuplicatesSkipped,
  readyPassports: ready.length,
  failedRefreshes: failed.length,
  results,
};

console.log(JSON.stringify(summary, null, 2));
if (failed.length > 0) process.exitCode = 1;
