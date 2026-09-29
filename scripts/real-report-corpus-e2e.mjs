import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const corpusRoot = path.resolve(process.env.REAL_REPORT_CORPUS_ROOT || 'tests/fixtures/realistic-reports');
const reportDir = path.resolve(process.env.E2E_REPORT_DIR || 'artifacts/real-report-corpus');

const supported = new Set(['.xlsx','.xls','.xlsm','.csv','.pdf','.docx','.json','.txt','.md','.tsv']);
const truthy = value => ['1','true','yes'].includes(String(value).toLowerCase());
const requiredEnv = { supabaseURL, anonKey, email, password };
for (const [name, value] of Object.entries(requiredEnv)) {
  if (!value) throw new Error('REAL_REPORT_CORPUS_ENV_MISSING:' + name);
}
if (exactHead === 'UNKNOWN') throw new Error('REAL_REPORT_CORPUS_EXACT_HEAD_MISSING');

await fs.mkdir(reportDir, { recursive: true });

async function discoverFiles(root) {
  const result = [];
  async function visit(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries.sort((a,b) => a.name.localeCompare(b.name, 'en'))) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (supported.has(ext) && entry.name.toLowerCase() !== 'readme.md') result.push(absolute);
      }
    }
  }
  await visit(root);
  return result;
}

function relativePath(file) {
  return path.relative(process.cwd(), file).split(path.sep).join('/');
}

function stableCompare(a,b) {
  return relativePath(a).localeCompare(relativePath(b), 'en', { numeric: false, sensitivity: 'base' });
}

async function sha256(file) {
  const buffer = await fs.readFile(file);
  return {
    bytes: buffer.byteLength,
    hash: 'sha256:' + crypto.createHash('sha256').update(buffer).digest('hex'),
  };
}

const files = (await discoverFiles(corpusRoot)).sort(stableCompare);
if (!files.length) throw new Error('REAL_REPORT_CORPUS_EMPTY');
console.log('REAL_REPORT_CORPUS_COUNT=' + files.length);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();

const ledger = {
  exact_sha: exactHead,
  corpus_root: relativePath(corpusRoot),
  corpus_count: files.length,
  started_at: new Date().toISOString(),
  processed: 0,
  closed: 0,
  review: 0,
  blocked: 0,
  remaining: files.length,
  reports: [],
};

async function accessToken() {
  return page.evaluate(() => {
    const raw = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1];
    if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND');
    const session = JSON.parse(raw);
    if (!session?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND');
    return session.access_token;
  });
}

async function restGet(table, filters = {}, select = '*', options = {}) {
  const token = await accessToken();
  const url = new URL(`${supabaseURL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  for (const [column, value] of Object.entries(filters)) url.searchParams.set(column, `eq.${value}`);
  if (options.order) url.searchParams.set('order', options.order);
  if (options.limit) url.searchParams.set('limit', String(options.limit));
  const response = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  const body = await response.text();
  assert.equal(response.ok, true, `${table} HTTP ${response.status}: ${body.slice(0,1000)}`);
  return body ? JSON.parse(body) : [];
}

async function currentTenant() {
  const token = await accessToken();
  const response = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  const body = await response.text();
  assert.equal(response.ok, true, `current_company_id HTTP ${response.status}: ${body}`);
  return body.replaceAll('"','').trim();
}

async function login() {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#login-email').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);

  const authResponsePromise = page.waitForResponse(
    response => response.request().method() === 'POST' && response.url().includes('/auth/v1/token?grant_type=password'),
    { timeout: 60000 },
  );
  await page.locator('form button[type="submit"]').click();
  const authResponse = await authResponsePromise;
  if (authResponse.status() >= 400) {
    const body = await authResponse.text().catch(() => '');
    throw new Error(`AUTH_TOKEN_HTTP_${authResponse.status()}:${body.slice(0,512)}`);
  }
  await page.locator('#login-email').waitFor({ state: 'hidden', timeout: 30000 });
  assert.equal(await page.getByText('حدث خطأ غير متوقع').count(), 0, 'application error boundary must not render');
}

async function openImport() {
  await page.goto(`${baseURL}/import`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('input[type=file]').first().waitFor({ state: 'attached', timeout: 30000 });
  await page.getByText('مركز المصادر', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
}

async function visibleQualityReview() {
  const approval = page.getByRole('checkbox', { name: /موافقة جودة صريحة/ }).first();
  if (!(await approval.count())) return false;
  return await approval.isVisible().catch(() => false);
}

async function waitImportJob(companyId, fileName, sourceHash) {
  const deadline = Date.now() + 180000;
  let last = null;
  while (Date.now() < deadline) {
    const imports = await restGet(
      'import_jobs',
      { company_id: companyId },
      'id,status,job_type,source_fingerprint,file_record_id,progress,processed_rows,valid_rows,invalid_rows,error_message,result_summary,created_at,updated_at',
      { order: 'created_at.desc', limit: 100 },
    );
    const candidates = imports.filter(item => item?.result_summary?.file_name === fileName || item?.result_summary?.source_file_name === fileName);
    if (sourceHash) {
      const byHash = candidates.find(item => item.source_fingerprint === sourceHash);
      if (byHash) {
        last = byHash;
        if (['failed','cancelled'].includes(byHash.status)) throw new Error(`IMPORT_TERMINAL_STATUS:${byHash.status}:${byHash.error_message || 'none'}`);
        if (byHash.status === 'completed' || byHash.status === 'partial') return byHash;
      }
    } else if (candidates[0]) {
      last = candidates[0];
      if (['failed','cancelled'].includes(last.status)) throw new Error(`IMPORT_TERMINAL_STATUS:${last.status}:${last.error_message || 'none'}`);
      if (last.status === 'completed' || last.status === 'partial') return last;
    }
    await page.waitForTimeout(2000);
  }
  throw new Error(`IMPORT_COMPLETION_TIMEOUT:${last?.id ?? 'NOT_FOUND'}:${last?.status ?? 'NOT_FOUND'}`);
}

const typedTables = new Set(['products','customers','sales_invoices','purchase_invoices','suppliers','inventory_balances','payments']);

async function verifyPersistedResult(companyId, job, expectedHash, fileName) {
  const [snapshots, fileRecords, durableJobs, commits] = await Promise.all([
    restGet('source_analysis_snapshots', { company_id: companyId, import_job_id: job.id }, 'id,company_id,import_job_id,source_hash,source_path,source_format,analysis_status,entity_type,quality_score,row_count,column_count,datasets,metadata,created_at', { order: 'created_at.desc', limit: 5 }),
    restGet('file_records', { company_id: companyId, id: job.file_record_id }, 'id,company_id,file_name,file_hash,file_mime,file_size,security_status,status,metadata'),
    restGet('report_execution_jobs', { company_id: companyId, source_path: fileName, source_hash: expectedHash }, 'id,company_id,source_path,source_hash,status,checkpoint,evidence,completed_at,updated_at', { order: 'updated_at.desc', limit: 10 }),
    restGet('canonical_import_commits', { company_id: companyId, source_hash: expectedHash }, 'id,company_id,entity_type,source_hash,committed_count,committed_at', { order: 'committed_at.desc', limit: 10 }),
  ]);

  assert.equal(fileRecords.length, 1, 'authoritative file_record must exist');
  assert.equal(fileRecords[0].company_id, companyId);
  assert.equal(fileRecords[0].file_hash, expectedHash);
  assert.equal(fileRecords[0].security_status, 'passed');
  assert.equal(fileRecords[0].status, 'ready');

  assert.equal(snapshots.length, 1, 'exactly one source analysis snapshot must be persisted');
  const snapshot = snapshots[0];
  assert.equal(snapshot.source_hash, expectedHash);
  assert.equal(snapshot.analysis_status, 'analyzed');
  assert.ok(Number(snapshot.row_count) > 0, 'source snapshot must contain authoritative rows');

  assert.ok(durableJobs.length > 0, 'durable report execution job must exist');
  const durableJob = durableJobs.find(item => item.status === 'completed') || durableJobs[0];
  if (durableJob.status !== 'completed') throw new Error(`DURABLE_JOB_NOT_COMPLETED:${durableJob.status}`);
  assert.equal(durableJob.checkpoint?.stage, 'rendered');
  assert.equal(durableJob.checkpoint?.sourceHash, expectedHash);
  assert.ok(durableJob.completed_at, 'durable job must expose completed_at');
  assert.ok(durableJob.evidence && typeof durableJob.evidence === 'object');
  const rendered = durableJob.evidence?.renderedOutput;
  assert.ok(rendered && rendered.sourceBound === true, 'rendered output must be source-bound');
  assert.equal(rendered.sourceHash, expectedHash);
  assert.equal(rendered.importId, job.id);
  assert.ok(Array.isArray(rendered.outputs) && rendered.outputs.length > 0, 'rendered output manifest must exist');
  assert.ok(rendered.outputs.every(output => output.sourceHash === expectedHash && output.importId === job.id && output.rendered === true), 'every rendered output must stay bound to the exact source');

  assert.ok(commits.length > 0, 'canonical import commit evidence must exist');
  assert.ok(commits.some(commit => Number(commit.committed_count) === Number(snapshot.row_count)), 'canonical commit count must match authoritative row count');

  let canonicalCount = null;
  if (snapshot.entity_type && typedTables.has(snapshot.entity_type)) {
    const rows = await restGet(snapshot.entity_type, { company_id: companyId }, 'id', { limit: 1 });
    canonicalCount = rows.length;
  } else {
    const rows = await restGet('canonical_dataset_records', { company_id: companyId, import_job_id: job.id }, 'id,company_id,import_job_id,source_hash,semantic_domain,row_number,provenance', { limit: 1000 });
    canonicalCount = rows.length;
    if (canonicalCount < Number(snapshot.row_count)) {
      throw new Error(`GENERIC_CANONICAL_ROWS_SHORT:${canonicalCount}:${snapshot.row_count}`);
    }
  }

  return {
    snapshot,
    durableJob,
    rendered,
    commits,
    canonicalCount,
  };
}

function verifyOutputApplicability(outputs, entityType, specialty) {
  const outputKeys = new Set(outputs.map(x => x.key));
  assert.ok(outputKeys.has('executive'), 'executive report output is mandatory');
  if (specialty === 'receivables' || entityType === 'generic:receivables') {
    assert.ok(outputKeys.has('receivables'), 'receivables specialty output must be rendered for receivables source');
    assert.ok(outputKeys.has('receivables-aging'), 'receivables aging intelligence must be rendered for receivables source');
  }
  return [...outputKeys];
}

async function verifyUiOutputs(importId, outputs) {
  await page.getByRole('heading', { name: 'تم اعتماد المصدر', exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const journey = page.locator('#post-import-journey');
  await journey.waitFor({ state: 'visible', timeout: 30000 });
  const executiveLink = page.locator(`a[href="/reports/executive?import=${encodeURIComponent(importId)}"]`);
  await executiveLink.waitFor({ state: 'visible', timeout: 15000 });

  const uiReports = [];
  for (const output of outputs) {
    const url = new URL(output.path, baseURL);
    url.searchParams.set('import', importId);
    const response = await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 30000 });
    const body = (await page.locator('body').innerText()).trim();
    const appError = await page.getByText('حدث خطأ غير متوقع').count();
    const notFound = await page.getByText('الصفحة غير موجودة').count();
    if (!response || response.status() >= 400 || !body || appError || notFound) {
      throw new Error(`REPORT_UI_RENDER_FAILED:${output.path}:http=${response?.status() ?? 'none'}:body=${body.slice(0,300)}`);
    }
    uiReports.push({ path: output.path, httpStatus: response.status(), bodyLength: body.length });
  }
  return uiReports;
}

async function processOne(file, index) {
  const rel = relativePath(file);
  const name = path.basename(file);
  const fingerprint = await sha256(file);
  const started = new Date().toISOString();
  const companyId = await currentTenant();

  const record = {
    ordinal: index + 1,
    path: rel,
    filename: name,
    fingerprint: fingerprint.hash,
    bytes: fingerprint.bytes,
    started_at: started,
    state: 'queued',
    status: 'OPEN',
  };

  console.log(`REPORT_START ${index + 1}/${files.length} ${rel} ${fingerprint.hash}`);

  await openImport();
  await page.locator('input[type=file]').first().setInputFiles(file);
  await page.getByText('المراجعة', { exact: true }).waitFor({ state: 'visible', timeout: 90000 });

  if (await visibleQualityReview()) {
    record.state = 'review';
    record.status = 'REVIEW';
    record.reason = 'QUALITY_APPROVAL_REQUIRED';
    record.finished_at = new Date().toISOString();
    await fs.writeFile(path.join(reportDir, `${String(index + 1).padStart(3,'0')}-checkpoint.json`), JSON.stringify(record, null, 2) + '\n');
    return record;
  }

  const approval = page.getByRole('checkbox', { name: /موافقة جودة صريحة/ }).first();
  if (await approval.count() && await approval.isVisible().catch(() => false)) {
    throw new Error('QUALITY_APPROVAL_SURFACE_UNEXPECTED');
  }

  const executeResponsePromise = page.waitForResponse(
    response => response.request().method() === 'POST' && (response.url().includes('/api/canonical-import-execute') || response.url().includes('/.netlify/functions/canonical-import-execute')),
    { timeout: 30000 },
  ).catch(() => null);

  const commitButton = page.getByRole('button', { name: /تأكيد الاستيراد/ });
  await commitButton.waitFor({ state: 'visible', timeout: 30000 });
  assert.equal(await commitButton.isEnabled(), true, 'real report import must reach an enabled canonical commit action');
  await commitButton.click();

  const executeResponse = await executeResponsePromise;
  if (!executeResponse) throw new Error('CANONICAL_IMPORT_EXECUTION_RESPONSE_NOT_OBSERVED');
  if (executeResponse.status() >= 400) {
    const detail = await executeResponse.text().catch(() => '');
    throw new Error(`CANONICAL_IMPORT_HTTP_${executeResponse.status()}:${detail.slice(0,1000)}`);
  }

  record.state = 'importing';
  const job = await waitImportJob(companyId, name, fingerprint.hash);
  record.import_job_id = job.id;
  record.job_status = job.status;

  if (job.status !== 'completed') {
    record.state = 'review';
    record.status = 'REVIEW';
    record.reason = 'IMPORT_NOT_VERIFIED:' + job.status;
    record.finished_at = new Date().toISOString();
    return record;
  }

  record.state = 'persisted';
  const persisted = await verifyPersistedResult(companyId, job, fingerprint.hash, name);
  record.snapshot_id = persisted.snapshot.id;
  record.entity_type = persisted.snapshot.entity_type;
  record.specialty = persisted.snapshot.metadata?.sourceSpecialty || null;
  record.quality_score = persisted.snapshot.quality_score;
  record.authoritative_row_count = persisted.snapshot.row_count;
  record.canonical_count_observed = persisted.canonicalCount;
  record.rendered_outputs = persisted.rendered.outputs.map(x => x.key);
  verifyOutputApplicability(persisted.rendered.outputs, persisted.snapshot.entity_type, record.specialty);

  record.state = 'rendered';
  const uiReports = await verifyUiOutputs(job.id, persisted.rendered.outputs);
  record.ui_reports = uiReports;

  record.state = 'closed';
  record.status = 'CLOSED';
  record.proof = {
    exact_sha: exactHead,
    source_file: rel,
    source_fingerprint: fingerprint.hash,
    import_job_id: job.id,
    snapshot_id: persisted.snapshot.id,
    durable_job_id: persisted.durableJob.id,
    durable_stage: persisted.durableJob.checkpoint?.stage,
    canonical_commit_ids: persisted.commits.map(x => x.id),
    rendered_output_count: persisted.rendered.outputs.length,
    rendered_output_keys: record.rendered_outputs,
    ui_outputs: uiReports.map(x => x.path),
  };
  record.finished_at = new Date().toISOString();
  return record;
}

try {
  await login();
  const tenant = await currentTenant();
  console.log('CORPUS_TENANT=' + tenant);
  ledger.tenant_id = tenant;

  for (let i = 0; i < files.length; i += 1) {
    const record = await processOne(files[i], i);
    ledger.reports.push(record);
    if (record.status === 'CLOSED') ledger.closed += 1;
    if (record.status === 'REVIEW') ledger.review += 1;
    if (record.status === 'BLOCKED') ledger.blocked += 1;
    ledger.processed += record.status === 'CLOSED' ? 1 : 0;
    ledger.remaining = files.length - ledger.closed - ledger.review - ledger.blocked;
    await fs.writeFile(path.join(reportDir, 'ledger.json'), JSON.stringify(ledger, null, 2) + '\n');

    console.log(`REPORT_RESULT ${record.ordinal}/${files.length} ${record.status} ${record.path}`);
    if (record.status !== 'CLOSED') {
      throw new Error(`REPORT_STOPPED_AT_${record.ordinal}:${record.status}:${record.reason || 'unknown'}`);
    }
  }

  ledger.finished_at = new Date().toISOString();
  ledger.remaining = 0;
  ledger.status = 'PASS';
  await fs.writeFile(path.join(reportDir, 'ledger.json'), JSON.stringify(ledger, null, 2) + '\n');
  console.log('REAL_REPORT_CORPUS_PASS', JSON.stringify({ exact_sha: exactHead, count: files.length, closed: ledger.closed }, null, 2));
} catch (error) {
  ledger.finished_at = new Date().toISOString();
  ledger.status = 'BLOCKED';
  ledger.blocker = error instanceof Error ? error.message : String(error);
  await fs.writeFile(path.join(reportDir, 'ledger.json'), JSON.stringify(ledger, null, 2) + '\n');
  console.error('REAL_REPORT_CORPUS_BLOCKED', ledger.blocker);
  process.exitCode = 2;
} finally {
  await browser.close();
}
