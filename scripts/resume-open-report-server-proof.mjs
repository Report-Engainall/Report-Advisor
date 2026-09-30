const SUPABASE_URL = process.env.REPORT_ADVISOR_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY;
const EMAIL = process.env.TEST_USER_A_EMAIL;
const PASSWORD = process.env.TEST_USER_A_PASSWORD;
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';
const JOB_ID = process.env.OPEN_REPORT_EXECUTION_JOB_ID;
const EXPECTED_HASH = process.env.OPEN_REPORT_EXPECTED_SOURCE_HASH;
const EXPECTED_ROWS = Number(process.env.OPEN_REPORT_EXPECTED_ROWS ?? '0');
const EXPECTED_FILE = process.env.OPEN_REPORT_FILE_NAME;

function required(name, value) {
  if (!value) throw new Error(name + '_MISSING');
  return value;
}
required('REPORT_ADVISOR_SUPABASE_URL', SUPABASE_URL);
required('REPORT_ADVISOR_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);
required('TEST_USER_A_EMAIL', EMAIL);
required('TEST_USER_A_PASSWORD', PASSWORD);
required('OPEN_REPORT_EXECUTION_JOB_ID', JOB_ID);
required('OPEN_REPORT_EXPECTED_SOURCE_HASH', EXPECTED_HASH);
required('OPEN_REPORT_FILE_NAME', EXPECTED_FILE);
if (!EXPECTED_ROWS) throw new Error('OPEN_REPORT_EXPECTED_ROWS_INVALID');

async function supabaseFetch(path, init = {}) {
  const response = await fetch(SUPABASE_URL + path, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) throw new Error('SUPABASE_HTTP_' + response.status + ':' + text.slice(0, 700));
  return { response, body };
}

async function rest(path, accessToken, init = {}) {
  return supabaseFetch('/rest/v1' + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + accessToken,
      ...(init.headers ?? {}),
    },
  });
}

const auth = await supabaseFetch('/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const accessToken = required('ACCESS_TOKEN', auth.body?.access_token);

const company = await rest('/rpc/current_company_id', accessToken, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}',
});
const companyId = required('COMPANY_ID', typeof company.body === 'string' ? company.body : null);

const before = await rest(
  '/report_execution_jobs?id=eq.' + encodeURIComponent(JOB_ID) +
  '&company_id=eq.' + encodeURIComponent(companyId) +
  '&select=id,status,source_path,source_hash,job_key,checkpoint,evidence',
  accessToken,
);
const beforeJob = before.body?.[0];
if (!beforeJob) throw new Error('OPEN_REPORT_JOB_NOT_FOUND');
if (beforeJob.source_path !== EXPECTED_FILE) throw new Error('OPEN_REPORT_SOURCE_PATH_MISMATCH');
if (beforeJob.source_hash !== EXPECTED_HASH) throw new Error('OPEN_REPORT_SOURCE_HASH_MISMATCH');

const run = await fetch(BASE_URL + '/api/canonical-import-execute', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + accessToken,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ resumeReportExecutionJobId: JOB_ID }),
});
const runText = await run.text();
let runBody = null;
try { runBody = runText ? JSON.parse(runText) : null; } catch {}
if (!run.ok) throw new Error('OPEN_REPORT_RESUME_FAILED_HTTP_' + run.status + ':' + runText.slice(0, 1200));
if (runBody?.jobId !== JOB_ID) throw new Error('OPEN_REPORT_RESUME_CREATED_OR_RETURNED_DIFFERENT_JOB');
if (runBody?.sourceHash !== EXPECTED_HASH) throw new Error('OPEN_REPORT_RESUME_HASH_MISMATCH');
if (Number(runBody?.authoritativeRowCount) !== EXPECTED_ROWS) throw new Error('OPEN_REPORT_RESUME_ROW_COUNT_MISMATCH');

const after = await rest(
  '/report_execution_jobs?id=eq.' + encodeURIComponent(JOB_ID) +
  '&company_id=eq.' + encodeURIComponent(companyId) +
  '&select=id,status,source_path,source_hash,job_key,checkpoint,evidence',
  accessToken,
);
const job = after.body?.[0];
if (!job || job.status !== 'completed') throw new Error('OPEN_REPORT_JOB_NOT_COMPLETED');
if (job.checkpoint?.stage !== 'rendered') throw new Error('OPEN_REPORT_CHECKPOINT_NOT_RENDERED');
if (!job.evidence?.renderedOutput) throw new Error('OPEN_REPORT_RENDERED_OUTPUT_MISSING');

const analysis = await rest(
  '/source_analysis_snapshots?company_id=eq.' + encodeURIComponent(companyId) +
  '&source_hash=eq.' + encodeURIComponent(EXPECTED_HASH) +
  '&row_count=eq.' + EXPECTED_ROWS +
  '&select=id,row_count,column_count,source_format,analysis_status' +
  '&order=created_at.desc&limit=1',
  accessToken,
);
if (!analysis.body?.[0]) throw new Error('OPEN_REPORT_ANALYSIS_NOT_FOUND');
if (Number(analysis.body[0].row_count) !== EXPECTED_ROWS) throw new Error('OPEN_REPORT_ANALYSIS_ROW_COUNT_MISMATCH');

const countResponse = await rest(
  '/canonical_dataset_records?company_id=eq.' + encodeURIComponent(companyId) +
  '&source_hash=eq.' + encodeURIComponent(EXPECTED_HASH) +
  '&select=row_number&limit=1',
  accessToken,
  { headers: { Prefer: 'count=exact' } },
);
const contentRange = countResponse.response.headers.get('content-range') ?? '';
const countMatch = contentRange.match(/\/(\d+)$/);
if (!countMatch || Number(countMatch[1]) !== EXPECTED_ROWS) {
  throw new Error('OPEN_REPORT_CANONICAL_ROW_COUNT_MISMATCH:' + contentRange);
}

const commits = await rest(
  '/canonical_import_commits?company_id=eq.' + encodeURIComponent(companyId) +
  '&source_hash=eq.' + encodeURIComponent(EXPECTED_HASH) +
  '&select=committed_count&order=committed_at.desc&limit=1',
  accessToken,
);
if (!commits.body?.[0] || Number(commits.body[0].committed_count) !== EXPECTED_ROWS) {
  throw new Error('OPEN_REPORT_CANONICAL_COMMIT_COUNT_MISMATCH');
}

const imports = await rest(
  '/import_jobs?id=eq.' + encodeURIComponent(runBody.importId ?? '') +
  '&company_id=eq.' + encodeURIComponent(companyId) +
  '&select=id,status,total_rows,processed_rows,valid_rows,invalid_rows,source_fingerprint',
  accessToken,
);
const importJob = imports.body?.[0];
if (!importJob || importJob.status !== 'completed' || Number(importJob.valid_rows) !== EXPECTED_ROWS) {
  throw new Error('OPEN_REPORT_IMPORT_JOB_NOT_COMPLETED_OR_ROW_MISMATCH');
}

const duplicateJobs = await rest(
  '/report_execution_jobs?company_id=eq.' + encodeURIComponent(companyId) +
  '&job_key=eq.' + encodeURIComponent(job.job_key) +
  '&select=id&limit=10',
  accessToken,
);
if (!Array.isArray(duplicateJobs.body) || duplicateJobs.body.length !== 1) {
  throw new Error('OPEN_REPORT_DUPLICATE_JOB_DETECTED:' + JSON.stringify(duplicateJobs.body));
}

console.log(JSON.stringify({
  status: 'PASS',
  report: EXPECTED_FILE,
  jobId: JOB_ID,
  sourceHash: EXPECTED_HASH,
  companyId,
  rowCount: EXPECTED_ROWS,
  canonicalRowCount: Number(countMatch[1]),
  canonicalCommitCount: Number(commits.body[0].committed_count),
  importStatus: importJob.status,
  checkpoint: job.checkpoint?.stage,
  rendered: Boolean(job.evidence?.renderedOutput),
  duplicateJobs: duplicateJobs.body.length,
}, null, 2));
