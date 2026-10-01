import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const emailA = process.env.TEST_USER_A_EMAIL?.trim();
const passwordA = process.env.TEST_USER_A_PASSWORD;
const emailB = process.env.TEST_USER_B_EMAIL?.trim();
const passwordB = process.env.TEST_USER_B_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e-business';
for (const [name, value] of Object.entries({ supabaseURL, anonKey, emailA, passwordA, emailB, passwordB })) if (!value) throw new Error(`BUSINESS_E2E_ENV_MISSING:${name}`);
await fs.mkdir(reportDir, { recursive: true });
const evidence = { exactHead, baseURL, browser: 'Chromium', startedAt: new Date().toISOString(), status: 'NOT_PROVEN', tenantA: null, tenantB: null, persisted: {}, steps: [], failures: [] };
const browser = await chromium.launch({ headless: true });
const contextA = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const pageA = await contextA.newPage();
function attachRuntimeCapture(page) { page.on('console', msg => { if (msg.type() === 'error') evidence.failures.push(`console:${msg.text()}`); }); page.on('pageerror', error => evidence.failures.push(`pageerror:${error.message}`)); page.on('requestfailed', request => { const error = request.failure()?.errorText || 'unknown'; if (error !== 'net::ERR_ABORTED') evidence.failures.push(`request:${request.method()} ${request.url()} ${error}`); }); page.on('response', async response => { if (response.status() < 400) return; const url = response.url(); const relevant = !supabaseURL || url.startsWith(supabaseURL) || url.includes('/rest/v1/') || url.includes('/auth/v1/') || url.includes('/api/canonical-import-execute') || url.includes('/.netlify/functions/canonical-import-execute'); if (!relevant) return; const body = await response.text().catch(() => ''); evidence.failures.push(`response:${response.request().method()} ${response.status()} ${url} body=${body.slice(0, 4000)}`); }); }
attachRuntimeCapture(pageA);
async function accessToken(page) { return page.evaluate(() => { const raw = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1]; if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND'); const session = JSON.parse(raw); if (!session?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND'); return session.access_token; }); }
async function currentTenant(page) { const token = await accessToken(page); const response = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' }); const body = await response.text(); assert.equal(response.ok, true, `current_company_id HTTP ${response.status}: ${body}`); const tenantId = body.replaceAll('"', '').trim(); assert.ok(tenantId, 'current_company_id must resolve a tenant'); return tenantId; }
async function restSelect(page, table, filters, select, options = {}) {
  const token = await accessToken(page);
  const url = new URL(`${supabaseURL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  for (const [column, value] of Object.entries(filters)) url.searchParams.set(column, `eq.${value}`);
  if (options.order) url.searchParams.set('order', options.order);
  if (options.limit) url.searchParams.set('limit', String(options.limit));
  const response = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  const body = await response.text();
  assert.equal(response.ok, true, `${table} read HTTP ${response.status}: ${body}`);
  return body ? JSON.parse(body) : [];
}
async function restUpdate(page, table, id, payload) { const token = await accessToken(page); const url = new URL(`${supabaseURL}/rest/v1/${table}`); url.searchParams.set('id', `eq.${id}`); const response = await fetch(url, { method: 'PATCH', headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) }); const body = await response.text(); assert.equal(response.ok, true, `${table} cross-tenant update HTTP ${response.status}: ${body}`); return body ? JSON.parse(body) : []; }
async function login(page, email, password) {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#login-email').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  let authResponse = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    if (attempt > 1) {
      await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('#login-email').waitFor({ state: 'visible', timeout: 30000 });
      await page.locator('#login-email').fill(email);
      await page.locator('#login-password').fill(password);
    }
    const authResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url().includes('/auth/v1/token?grant_type=password'),
      { timeout: 60000 },
    ).catch(() => null);
    await page.locator('form button[type="submit"]').click();
    const candidate = await authResponsePromise;
    if (candidate && [429, 500, 502, 503, 504].includes(candidate.status()) && attempt < 3) {
      await page.waitForTimeout(5000 * attempt);
      continue;
    }
    authResponse = candidate;
    if (authResponse || attempt === 3) break;
    await page.waitForTimeout(5000 * attempt);
  }
  if (!authResponse) throw new Error('AUTH_TOKEN_RESPONSE_TIMEOUT');
  const authStatus = authResponse.status();
  if (authStatus >= 400) {
    let detail = '';
    try {
      const body = await authResponse.json();
      detail = body?.error_code || body?.error || body?.msg || body?.message || '';
    } catch {}
    throw new Error('AUTH_TOKEN_HTTP_' + authStatus + (detail ? '_' + detail : ''));
  }
  try {
    await page.locator('#login-email').waitFor({ state: 'hidden', timeout: 30000 });
  } catch {
    const alertText = await page.getByRole('alert').first().textContent().catch(() => '');
    throw new Error('AUTH_UI_SESSION_NOT_ESTABLISHED' + (alertText?.trim() ? ':' + alertText.trim().slice(0, 180) : ''));
  }
  assert.equal(await page.getByText('حدث خطأ غير متوقع').count(), 0, 'application error boundary must not render');
}
function csvBuffer(fields) { const headers = Object.keys(fields); const values = Object.values(fields).map(value => String(value).replaceAll(',', ' ')); return Buffer.from(`\ufeff${headers.join(',')}\n${values.join(',')}\n`, 'utf8'); }
async function openImportSource(page) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    await page.goto(`${baseURL}/import`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try {
      await page.getByText('مركز المصادر', { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
      await page.locator('input[type=file]').first().waitFor({ state: 'attached', timeout: 10000 });
      evidence.steps.push({ step: 'unified-import-source-entry', status: 'PASS' });
      return;
    } catch {
      const diagnostics = await page.evaluate(() => ({
        href: location.href,
        readyState: document.readyState,
        bodyText: document.body?.innerText?.slice(0, 500) || '',
      })).catch(() => ({ href: 'unavailable', readyState: 'unavailable', bodyText: '' }));
      if (attempt === 1 && !diagnostics.bodyText.trim()) {
        await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
        continue;
      }
      throw new Error(`UNIFIED_IMPORT_ROUTE_NOT_READY:attempt=${attempt}:href=${diagnostics.href}:readyState=${diagnostics.readyState}:body=${JSON.stringify(diagnostics.bodyText)}`);
    }
  }
  throw new Error('UNIFIED_IMPORT_ROUTE_NOT_READY:exhausted');
}
async function waitForAuthoritativeImportCompletion(page, companyId, marker) {
  const fileName = marker + '.csv';
  const deadline = Date.now() + 120000;
  let lastImport = null;
  let candidateJobId = null;

  while (Date.now() < deadline) {
    const sourceFiles = await restSelect(
      page,
      'file_records',
      { company_id: companyId, file_name: fileName },
      'id,company_id,file_name,file_hash,status,security_status,created_at',
      { order: 'created_at.desc', limit: 5 },
    );

    const source = sourceFiles[0] ?? null;
    if (source?.id) {
      const imports = await restSelect(
        page,
        'import_jobs',
        candidateJobId
          ? { company_id: companyId, id: candidateJobId }
          : { company_id: companyId, file_record_id: source.id },
        'id,file_record_id,status,job_type,progress,processed_rows,valid_rows,invalid_rows,error_message,result_summary,created_at',
        candidateJobId
          ? { limit: 1 }
          : { order: 'created_at.desc', limit: 10 },
      );

      const candidate = candidateJobId ? imports[0] ?? null : imports[0] ?? null;
      if (candidate) {
        candidateJobId ??= candidate.id;
        lastImport = candidate;

        if (candidate.file_record_id !== source.id) {
          throw new Error(
            'UNIFIED_IMPORT_SOURCE_RECORD_MISMATCH:' +
            candidate.id + ':' + candidate.file_record_id + ':' + source.id
          );
        }

        if (candidate.job_type !== 'generic:source-data') {
          throw new Error('UNIFIED_IMPORT_WRONG_JOB_TYPE:' + (candidate.job_type || 'missing'));
        }

        if (candidate.status === 'failed' || candidate.status === 'cancelled') {
          throw new Error(
            'IMPORT_TERMINAL_STATUS:job=' + candidate.id +
            ':status=' + candidate.status +
            ':error=' + (candidate.error_message || 'none')
          );
        }

        if (candidate.status === 'completed') {
          evidence.steps.push({
            step: 'unified-import-authoritative-complete',
            status: 'PASS',
            importJobId: candidate.id,
            sourceRecordId: source.id,
          });
          return candidate;
        }
      }
    }

    await page.waitForTimeout(2000);
  }

  throw new Error(
    'IMPORT_COMPLETION_TIMEOUT:importJob=' + (lastImport?.id ?? 'NOT_FOUND') +
    ':status=' + (lastImport?.status ?? 'NOT_FOUND') +
    ':progress=' + (lastImport?.progress ?? 'NOT_OBSERVED')
  );
}
async function importOne(page, label, fields, marker) {
  await openImportSource(page);
  await page.locator('input[type=file]').first().setInputFiles({
    name: `${marker}.csv`,
    mimeType: 'text/csv',
    buffer: csvBuffer(fields),
  });
  await page.getByText('المراجعة', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });

  const commit = page.getByRole('button', { name: /تأكيد الاستيراد/ });
  const qualityApproval = page.getByRole('checkbox', { name: /موافقة جودة صريحة/ });

  if (await qualityApproval.count() === 1 && await qualityApproval.isVisible()) {
    await qualityApproval.check();
    evidence.steps.push({ step: `unified-import-quality-approval:${label}`, status: 'PASS' });
  }

  assert.equal(await commit.isEnabled(), true, 'valid unified source import must be enabled');
  const importExecutionResponse = page.waitForResponse(
    response => response.request().method() === 'POST' && (response.url().includes('/api/canonical-import-execute') || response.url().includes('/.netlify/functions/canonical-import-execute')),
    { timeout: 30000 },
  ).catch(() => null);
  await commit.click();
  const executionResponse = await importExecutionResponse;
  if (executionResponse && executionResponse.status() >= 400) {
    const body = await executionResponse.text().catch(() => '');
    evidence.failures.push(`canonical-import-execute:${executionResponse.status()}:${body.slice(0, 4000)}`);
  }

  const companyId = evidence.tenantA ?? await currentTenant(page);
  const job = await waitForAuthoritativeImportCompletion(page, companyId, marker);

  const canonicalRows = await restSelect(
    page,
    'canonical_dataset_records',
    { company_id: companyId, import_job_id: job.id },
    'id,company_id,import_job_id,source_hash,semantic_domain,row_number,record_key,data,provenance',
  );
  assert.equal(canonicalRows.length, 1, 'unified import must persist one canonical source row for the test file');
  assert.equal(canonicalRows[0].company_id, companyId);
  assert.equal(canonicalRows[0].import_job_id, job.id);
  assert.equal(canonicalRows[0].semantic_domain, 'source-data');
  assert.equal(canonicalRows[0].row_number, 1);
  assert.equal(canonicalRows[0].provenance?.tenantId, companyId);
  assert.equal(canonicalRows[0].provenance?.sourceDocumentId, job.id);
  evidence.persisted[label] = { job, canonical: canonicalRows[0] };
  evidence.steps.push({
    step: `unified-import-canonical-persistence:${label}`,
    status: 'PASS',
    importJobId: job.id,
    canonicalRecordId: canonicalRows[0].id,
  });

  const historySource = await restSelect(
    page,
    'file_records',
    { company_id: companyId, id: job.file_record_id },
    'id,company_id,file_name,file_hash,status,security_status',
    { limit: 1 },
  );
  assert.equal(historySource.length, 1, 'import history readback must resolve the persisted source record');
  assert.equal(historySource[0].file_name, marker + '.csv');
  assert.equal(historySource[0].company_id, companyId);
  evidence.steps.push({
    step: 'unified-import-history-readback:' + label,
    status: 'PASS',
    sourceRecordId: historySource[0].id,
  });

  return { job, canonical: canonicalRows[0] };
}


async function waitForRenderedSmartReport(page, companyId, sourceHash) {
  const deadline = Date.now() + 120000;
  let lastRows = [];
  while (Date.now() < deadline) {
    const rows = await restSelect(
      page,
      'report_execution_jobs',
      { company_id: companyId, source_hash: sourceHash },
      'id,status,source_path,source_hash,job_key,checkpoint,evidence,completed_at',
      { order: 'completed_at.desc', limit: 20 },
    );
    lastRows = rows;
    const candidate = rows.find(row =>
      row?.status === 'completed' &&
      String(row?.job_key ?? '').startsWith('canonical-import:generic:') &&
      row?.evidence?.renderedOutput
    );
    if (candidate) return candidate;
    const terminal = rows.find(row =>
      ['failed', 'cancelled'].includes(String(row?.status ?? ''))
    );
    if (terminal) {
      throw new Error(
        'SMART_REPORT_TERMINAL_FAILURE:' + String(terminal.id) + ':' + String(terminal.status)
      );
    }
    await page.waitForTimeout(2000);
  }
  throw new Error(
    'SMART_REPORT_RENDER_TIMEOUT:sourceHash=' + sourceHash + ':jobs=' + JSON.stringify(lastRows)
  );
}

async function proveSmartReportAndEvidence(page, companyId, importResult, label) {
  const sourceHash = String(importResult.canonical?.source_hash ?? '');
  if (!sourceHash) {
    throw new Error('SMART_REPORT_SOURCE_HASH_MISSING:' + label);
  }

  const reportJob = await waitForRenderedSmartReport(page, companyId, sourceHash);
  const rendered = reportJob?.evidence?.renderedOutput ?? {};

  if (String(rendered.evidenceStatus ?? '') === 'VERIFIED') {
    throw new Error('SMART_REPORT_EVIDENCE_PROMOTED_UNEXPECTEDLY:' + label);
  }

  if (!['AWAITING_EVIDENCE_SNAPSHOT', 'PENDING_EVIDENCE'].includes(String(rendered.evidenceStatus ?? ''))) {
    throw new Error(
      'SMART_REPORT_EVIDENCE_STATE_UNEXPECTED:' + label + ':' + String(rendered.evidenceStatus)
    );
  }

  const tasks = await restSelect(
    page,
    'report_execution_tasks',
    { company_id: companyId, report_execution_job_id: reportJob.id },
    'ordinal,stage,status,attempt',
    { order: 'ordinal.asc', limit: 20 },
  );

  if (tasks.length < 9 || tasks.some(task => task.status !== 'completed')) {
    throw new Error(
      'SMART_REPORT_STAGES_NOT_COMPLETE:' + label + ':' + JSON.stringify(tasks)
    );
  }

  await page.goto(baseURL + '/reports/smart/' + reportJob.id, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.getByText('EVIDENCE INSPECTOR', { exact: true }).waitFor({
    state: 'visible',
    timeout: 30000,
  });

  const beforeRefreshText = (await page.locator('body').innerText()).trim();
  assert.ok(
    beforeRefreshText.includes(sourceHash.slice(0, 24)),
    'Smart Report must display the persisted source fingerprint'
  );
  assert.ok(
    beforeRefreshText.includes('موثوق') || beforeRefreshText.includes('Trusted Source'),
    'Smart Report must expose source trust'
  );
  assert.ok(
    beforeRefreshText.includes('بانتظار لقطة الدليل') ||
    beforeRefreshText.includes('بانتظار الدليل') ||
    beforeRefreshText.includes('Pending Evidence'),
    'Smart Report must expose the canonical pending-evidence state label'
  );

  await page.screenshot({
    path: reportDir + '/smart-report-' + label + '-before-refresh.png',
    fullPage: true,
  });

  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.getByText('EVIDENCE INSPECTOR', { exact: true }).waitFor({
    state: 'visible',
    timeout: 30000,
  });

  const afterRefreshText = (await page.locator('body').innerText()).trim();
  assert.ok(
    afterRefreshText.includes(sourceHash.slice(0, 24)),
    'Smart Report fingerprint must survive browser refresh'
  );
  assert.ok(
    afterRefreshText.includes('EVIDENCE'),
    'Smart Report evidence surface must survive browser refresh'
  );

  await page.screenshot({
    path: reportDir + '/smart-report-' + label + '-after-refresh.png',
    fullPage: true,
  });

  const readback = await restSelect(
    page,
    'report_execution_jobs',
    { company_id: companyId, id: reportJob.id },
    'id,status,source_hash,checkpoint,evidence,completed_at',
    { limit: 1 },
  );

  assert.equal(readback.length, 1, 'Rendered smart report must be persisted and tenant-scoped');
  assert.equal(readback[0].status, 'completed');
  assert.equal(readback[0].source_hash, sourceHash);
  assert.ok(
    readback[0].evidence?.renderedOutput,
    'Rendered smart report readback must contain renderedOutput'
  );

  evidence.steps.push({
    step: 'smart-report-evidence-trust-refresh-readback:' + label,
    status: 'PASS',
    reportJobId: reportJob.id,
    sourceHash,
    evidenceStatus: readback[0].evidence?.renderedOutput?.evidenceStatus ?? null,
    trustState: readback[0].evidence?.renderedOutput?.trustState ?? null,
    stageCount: tasks.length,
  });

  return reportJob;
}

const CURRENT_REPORT_SOURCE_PATH = process.env.CURRENT_REPORT_SOURCE_PATH?.trim() || 'تسعيرة الاصناف حسب رقم الصنف.pdf';
const CURRENT_REPORT_SOURCE_HASH = process.env.CURRENT_REPORT_SOURCE_HASH?.trim() || 'sha256:aeee5e6a7c5c5b23891bf68169de6acf9683267b3ac9828c6cea430128b2d300';
const CURRENT_REPORT_ROW_COUNT = Number(process.env.CURRENT_REPORT_ROW_COUNT || '735');
const CURRENT_REPORT_TASK_COUNT = 9;
const CURRENT_REPORT_ENTITY_TYPE = 'generic:inventory';

function assertCurrentReportText(text, label) {
  assert.ok(text.includes(CURRENT_REPORT_SOURCE_PATH), label + ': source path missing');
  assert.ok(text.includes(CURRENT_REPORT_SOURCE_HASH), label + ': source hash missing');
  assert.ok(text.includes(String(CURRENT_REPORT_ROW_COUNT)), label + ': row count missing');
  assert.ok(text.includes('موثوق') || text.includes('TRUSTED'), label + ': trust state missing');
}

async function readCurrentPersistedReport(page, companyId) {
  const jobs = await restSelect(page, 'report_execution_jobs', { company_id: companyId, source_path: CURRENT_REPORT_SOURCE_PATH, source_hash: CURRENT_REPORT_SOURCE_HASH, job_key: 'canonical-import:' + CURRENT_REPORT_ENTITY_TYPE + ':' + CURRENT_REPORT_SOURCE_HASH, status: 'completed' }, 'id,company_id,job_key,source_path,source_hash,status,checkpoint,evidence,completed_at', { order: 'completed_at.desc', limit: 20 });
  const uniqueJobs = [...new Map(jobs.map(job => [String(job.id), job])).values()];
  assert.equal(uniqueJobs.length, 1, 'CURRENT_REPORT_JOB_MUST_BE_UNAMBIGUOUS');
  const job = uniqueJobs[0];
  assert.equal(job.id, 'f0880ab8-8c7c-4c26-b5b6-edf8d3bb25c0', 'CURRENT_REPORT_JOB_ID_CHANGED');
  assert.equal(job.status, 'completed');
  assert.equal(job.source_hash, CURRENT_REPORT_SOURCE_HASH);
  assert.equal(job.source_path, CURRENT_REPORT_SOURCE_PATH);
  const rendered = job.evidence?.renderedOutput;
  assert.ok(rendered && typeof rendered === 'object', 'CURRENT_REPORT_RENDERED_OUTPUT_MISSING');
  assert.equal(rendered.sourceHash, CURRENT_REPORT_SOURCE_HASH);
  assert.equal(rendered.sourceBound, true);
  assert.equal(Number(rendered.rowCount), CURRENT_REPORT_ROW_COUNT);
  assert.equal(Number(rendered.authoritativeCurrentRowCount), CURRENT_REPORT_ROW_COUNT);
  const tasks = await restSelect(page, 'report_execution_tasks', { company_id: companyId, report_execution_job_id: job.id }, 'ordinal,stage,status,attempt,completed_at', { order: 'ordinal.asc', limit: 20 });
  assert.equal(tasks.length, CURRENT_REPORT_TASK_COUNT);
  assert.deepEqual(tasks.map(task => Number(task.ordinal)), [1,2,3,4,5,6,7,8,9]);
  assert.equal(tasks.filter(task => task.status === 'completed').length, CURRENT_REPORT_TASK_COUNT);
  const importId = String(rendered.importId || '');
  assert.ok(importId, 'CURRENT_REPORT_IMPORT_ID_MISSING');
  const imports = await restSelect(page, 'import_jobs', { company_id: companyId, id: importId }, 'id,company_id,file_record_id,status,total_rows,processed_rows,valid_rows,invalid_rows,source_fingerprint', { limit: 1 });
  assert.equal(imports.length, 1);
  assert.equal(imports[0].status, 'completed');
  assert.equal(Number(imports[0].total_rows), CURRENT_REPORT_ROW_COUNT);
  assert.equal(Number(imports[0].processed_rows), CURRENT_REPORT_ROW_COUNT);
  assert.equal(imports[0].source_fingerprint, CURRENT_REPORT_SOURCE_HASH);
  const canonicalRows = await restSelect(page, 'canonical_dataset_records', { company_id: companyId, import_job_id: importId, source_hash: CURRENT_REPORT_SOURCE_HASH }, 'id,company_id,import_job_id,source_hash,row_number,semantic_domain,record_key', { order: 'row_number.asc', limit: 1000 });
  assert.equal(canonicalRows.length, CURRENT_REPORT_ROW_COUNT);
  assert.equal(Number(canonicalRows[0].row_number), 1);
  assert.equal(Number(canonicalRows[canonicalRows.length - 1].row_number), CURRENT_REPORT_ROW_COUNT);
  assert.ok(canonicalRows.every(row => row.company_id === companyId && row.source_hash === CURRENT_REPORT_SOURCE_HASH));
  const commits = await restSelect(page, 'canonical_import_commits', { company_id: companyId, entity_type: CURRENT_REPORT_ENTITY_TYPE, source_hash: CURRENT_REPORT_SOURCE_HASH }, 'id,committed_count,committed_ids', { limit: 20 });
  const committedCount = commits.reduce((sum, row) => sum + Number(row.committed_count || 0), 0);
  assert.equal(committedCount, CURRENT_REPORT_ROW_COUNT);
  const analyses = await restSelect(page, 'source_analysis_snapshots', { company_id: companyId, source_hash: CURRENT_REPORT_SOURCE_HASH, import_job_id: importId }, 'id,import_job_id,source_format,analysis_status,quality_score,row_count,column_count,datasets,created_at', { order: 'created_at.desc', limit: 20 });
  assert.ok(analyses.length > 0, 'CURRENT_REPORT_ANALYSIS_MISSING');
  assert.equal(Number(analyses[0].row_count), CURRENT_REPORT_ROW_COUNT);
  assert.equal(Number(analyses[0].column_count), 7);
  assert.equal(Number(analyses[0].quality_score), Number(rendered.qualityScore));
  const fileRecords = await restSelect(page, 'file_records', { company_id: companyId, id: imports[0].file_record_id }, 'id,company_id,file_name,file_hash,detected_format,status', { limit: 1 });
  assert.equal(fileRecords.length, 1);
  assert.equal(fileRecords[0].file_name, CURRENT_REPORT_SOURCE_PATH);
  assert.equal(fileRecords[0].file_hash, CURRENT_REPORT_SOURCE_HASH);
  return { job, rendered, tasks, importJob: imports[0], canonicalRows, commits, analysis: analyses[0], fileRecord: fileRecords[0], reportJobId: job.id, sourceHash: CURRENT_REPORT_SOURCE_HASH };
}

async function waitForCurrentJobResponse(page, jobId) {
  return page.waitForResponse(response => {
    if (response.request().method() !== 'GET') return false;
    try { const url = new URL(response.url()); return url.pathname.endsWith('/rest/v1/report_execution_jobs') && url.searchParams.get('id') === 'eq.' + jobId; } catch { return false; }
  }, { timeout: 30000 }).catch(() => null);
}

async function proveCurrentSmartReport(page, report) {
  const responsePromise = waitForCurrentJobResponse(page, report.reportJobId);
  await page.goto(baseURL + '/reports/smart/' + report.reportJobId, { waitUntil: 'networkidle', timeout: 30000 });
  const response = await responsePromise;
  assert.ok(response, 'CURRENT_REPORT_SMART_BROWSER_JOB_READBACK_MISSING');
  const jobRows = await response.json();
  assert.equal(jobRows.length, 1); assert.equal(jobRows[0].id, report.reportJobId); assert.equal(jobRows[0].source_hash, CURRENT_REPORT_SOURCE_HASH); assert.equal(jobRows[0].source_path, CURRENT_REPORT_SOURCE_PATH);
  await page.getByText('EVIDENCE INSPECTOR', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const before = (await page.locator('body').innerText()).trim();
  assertCurrentReportText(before, 'current smart report');
  assert.ok(before.includes('EVIDENCE INSPECTOR'));
  assert.ok(before.includes(String(Number(report.rendered.qualityScore)) + '%'));
  assert.ok(
    before.includes('موثق') ||
    before.includes('Verified') ||
    before.includes('VERIFIED') ||
    before.includes('بانتظار لقطة الدليل') ||
    before.includes('بانتظار الدليل') ||
    before.includes('Pending Evidence')
  );
  assert.ok(before.includes('ماذا استنتج النظام من هذا التقرير؟'), 'Smart Report intelligence panel missing');
  assert.ok(before.includes('الإشارات المكتشفة'), 'Smart Report signals section missing');
  assert.ok(before.includes('ما الذي ينصح به النظام؟'), 'Smart Report recommendations section missing');
  assert.ok(before.includes('التنبؤ'), 'Smart Report forecast section missing');
  assert.ok(before.includes('GUIDANCE'), 'Smart Report guidance section missing');
  await page.screenshot({ path: reportDir + '/current-report-smart-before-refresh.png', fullPage: true });
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.getByText('EVIDENCE INSPECTOR', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const after = (await page.locator('body').innerText()).trim();
  assertCurrentReportText(after, 'current smart report refresh');
  assert.ok(after.includes('EVIDENCE INSPECTOR'));
  assert.ok(after.includes(String(Number(report.rendered.qualityScore)) + '%'));
  assert.ok(
    after.includes('موثق') ||
    after.includes('Verified') ||
    after.includes('VERIFIED') ||
    after.includes('بانتظار لقطة الدليل') ||
    after.includes('بانتظار الدليل') ||
    after.includes('Pending Evidence')
  );
  await page.screenshot({ path: reportDir + '/current-report-smart-after-refresh.png', fullPage: true });
  evidence.steps.push({ step: 'current-report-smart-report-refresh-readback', status: 'PASS', reportJobId: report.reportJobId, sourceHash: CURRENT_REPORT_SOURCE_HASH, rowCount: CURRENT_REPORT_ROW_COUNT, qualityScore: Number(report.rendered.qualityScore), trustState: report.rendered.trustState, evidenceState: report.rendered.evidenceStatus });
}

async function proveSourceBoundSurface(page, report, surface) {
  const target = baseURL + surface.path + (surface.path.includes('?') ? '&' : '?') + 'reportJobId=' + encodeURIComponent(report.reportJobId) + '&sourceHash=' + encodeURIComponent(CURRENT_REPORT_SOURCE_HASH);
  const responsePromise = waitForCurrentJobResponse(page, report.reportJobId);
  const response = await page.goto(target, { waitUntil: 'networkidle', timeout: 30000 });
  assert.ok(response && response.status() < 400, surface.label + ': HTTP ' + (response?.status() ?? 'NO_RESPONSE'));
  const jobResponse = await responsePromise; assert.ok(jobResponse, surface.label + ': same report job browser readback missing');
  const rows = await jobResponse.json(); assert.equal(rows.length, 1); assert.equal(rows[0].id, report.reportJobId); assert.equal(rows[0].source_hash, CURRENT_REPORT_SOURCE_HASH); assert.equal(rows[0].source_path, CURRENT_REPORT_SOURCE_PATH);
  const body = (await page.locator('body').innerText()).trim();
  assertCurrentReportText(body, surface.label);
  assert.equal(new URL(page.url()).searchParams.get('reportJobId'), report.reportJobId); assert.equal(new URL(page.url()).searchParams.get('sourceHash'), CURRENT_REPORT_SOURCE_HASH);
  if (surface.label === 'executive') assert.ok(body.includes('هذه هي نتيجة المصدر نفسه'));
  if (surface.label === 'trust') assert.ok(body.includes('EVIDENCE PASSPORT'));
  if (surface.label === 'decision') assert.ok(body.includes('مسار القرار لهذا التقرير فقط'));
  if (surface.label === 'work') assert.ok(body.includes('DURABLE LIFECYCLE') && body.includes('العرض'));
  assert.ok(body.includes('ماذا استنتج النظام من هذا التقرير؟'), surface.label + ': intelligence panel missing');
  assert.ok(body.includes('ما الذي ينصح به النظام؟'), surface.label + ': recommendations section missing');
  assert.ok(body.includes('GUIDANCE'), surface.label + ': guidance section missing');
  if (surface.label === 'inventory') assert.ok(body.includes('SOURCE-BOUND DOMAIN ANALYSIS') && body.includes('هذه الشاشة مربوطة مباشرة بنتيجة التقرير'));
  await page.screenshot({ path: reportDir + '/current-report-' + surface.label + '.png', fullPage: true });
  evidence.steps.push({ step: 'source-bound-surface:' + surface.label, status: 'PASS', reportJobId: report.reportJobId, sourceHash: CURRENT_REPORT_SOURCE_HASH, rowCount: CURRENT_REPORT_ROW_COUNT });
}

async function proveContextPreservedSurface(page, report, surface) {
  const target = baseURL + surface.path;
  const responsePromise = waitForCurrentJobResponse(page, report.reportJobId);
  const response = await page.goto(target, { waitUntil: 'networkidle', timeout: 30000 });
  assert.ok(response && response.status() < 400, surface.label + ': HTTP ' + (response?.status() ?? 'NO_RESPONSE'));
  const jobResponse = await responsePromise;
  assert.ok(jobResponse, surface.label + ': saved-context report readback missing');
  const rows = await jobResponse.json();
  assert.equal(rows.length, 1, surface.label + ': expected one source-bound job');
  assert.equal(rows[0].id, report.reportJobId);
  assert.equal(rows[0].source_hash, CURRENT_REPORT_SOURCE_HASH);
  assert.equal(rows[0].source_path, CURRENT_REPORT_SOURCE_PATH);
  const body = (await page.locator('body').innerText()).trim();
  assertCurrentReportText(body, surface.label + ' saved-context');
  assert.ok(body.includes('ماذا استنتج النظام من هذا التقرير؟'), surface.label + ': intelligence panel missing after context-only navigation');
  assert.ok(body.includes('ما الذي ينصح به النظام؟'), surface.label + ': recommendations missing after context-only navigation');
  assert.ok(body.includes('GUIDANCE'), surface.label + ': guidance missing after context-only navigation');
  assert.equal(new URL(page.url()).searchParams.get('reportJobId'), null, surface.label + ': URL must not be the source of truth for saved-context navigation');
  assert.equal(new URL(page.url()).searchParams.get('sourceHash'), null, surface.label + ': URL must not carry sourceHash for saved-context navigation');
  evidence.steps.push({
    step: 'saved-context-surface:' + surface.label,
    status: 'PASS',
    reportJobId: report.reportJobId,
    sourceHash: CURRENT_REPORT_SOURCE_HASH,
    rowCount: CURRENT_REPORT_ROW_COUNT,
  });
  await page.screenshot({ path: reportDir + '/current-report-saved-context-' + surface.label + '.png', fullPage: true });
}

async function uiSearch(page, route, placeholder, value, step) { await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 30000 }); const input = page.getByPlaceholder(placeholder); await input.fill(value); await page.waitForTimeout(300); await page.getByText(value, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 }); evidence.steps.push({ step, status: 'PASS', value }); }
try {
  await login(pageA, emailA, passwordA);
  evidence.tenantA = await currentTenant(pageA);
  evidence.steps.push({ step: 'tenant-A-authenticated', status: 'PASS', tenantId: evidence.tenantA });
  const currentReport = await readCurrentPersistedReport(pageA, evidence.tenantA);
  evidence.persisted.currentReport = { reportJobId: currentReport.reportJobId, sourcePath: CURRENT_REPORT_SOURCE_PATH, sourceHash: CURRENT_REPORT_SOURCE_HASH, sourceRowCount: CURRENT_REPORT_ROW_COUNT, authoritativeCanonicalCount: currentReport.canonicalRows.length, canonicalCommitCount: currentReport.commits.reduce((sum,row)=>sum+Number(row.committed_count||0),0), taskCount: currentReport.tasks.length, completedTaskCount: currentReport.tasks.filter(task=>task.status==='completed').length, importJobId: currentReport.importJob.id, fileRecordId: currentReport.fileRecord.id, qualityScore: Number(currentReport.rendered.qualityScore), trustState: currentReport.rendered.trustState, evidenceState: currentReport.rendered.evidenceStatus, checkpointStage: currentReport.job.checkpoint?.stage ?? null };
  evidence.steps.push({ step: 'current-persisted-report-durable-proof', status: 'PASS', reportJobId: currentReport.reportJobId, sourceHash: CURRENT_REPORT_SOURCE_HASH, sourcePath: CURRENT_REPORT_SOURCE_PATH, jobStatus: currentReport.job.status, durableTaskCount: currentReport.tasks.length, completedTaskCount: currentReport.tasks.filter(task=>task.status==='completed').length, sourceRowCount: CURRENT_REPORT_ROW_COUNT, authoritativeCanonicalCount: currentReport.canonicalRows.length, canonicalCommitCount: currentReport.commits.reduce((sum,row)=>sum+Number(row.committed_count||0),0), renderedOutput: true, analysisColumns: Number(currentReport.analysis.column_count), qualityScore: Number(currentReport.rendered.qualityScore), trustState: currentReport.rendered.trustState, evidenceState: currentReport.rendered.evidenceStatus });
  await proveCurrentSmartReport(pageA, currentReport);
  await proveSourceBoundSurface(pageA, currentReport, { label: 'executive', path: '/reports/executive' });
  await proveSourceBoundSurface(pageA, currentReport, { label: 'trust', path: '/trust' });
  await proveSourceBoundSurface(pageA, currentReport, { label: 'decision', path: '/decision-experience?stage=evidence' });
  await proveSourceBoundSurface(pageA, currentReport, { label: 'work', path: '/work-center' });
  await proveSourceBoundSurface(pageA, currentReport, { label: 'inventory', path: '/reports/inventory' });
  await pageA.goto(baseURL + '/reports/smart/' + currentReport.reportJobId, { waitUntil: 'networkidle', timeout: 30000 });
  await pageA.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await proveContextPreservedSurface(pageA, currentReport, { label: 'executive-saved-context', path: '/reports/executive' });
  await proveContextPreservedSurface(pageA, currentReport, { label: 'trust-saved-context', path: '/trust' });
  await proveContextPreservedSurface(pageA, currentReport, { label: 'decision-saved-context', path: '/decision-experience?stage=evidence' });
  await proveContextPreservedSurface(pageA, currentReport, { label: 'work-saved-context', path: '/work-center' });
  await proveContextPreservedSurface(pageA, currentReport, { label: 'inventory-saved-context', path: '/reports/inventory' });
  await pageA.goto(baseURL + '/reports/smart/' + currentReport.reportJobId, { waitUntil: 'networkidle', timeout: 30000 });
  await pageA.reload({ waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(await currentTenant(pageA), evidence.tenantA, 'CURRENT_REPORT_TENANT_CHANGED_ACROSS_REFRESH');
  await pageA.getByText('EVIDENCE INSPECTOR', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const finalBody = (await pageA.locator('body').innerText()).trim();
  assertCurrentReportText(finalBody, 'current report final readback'); assert.ok(finalBody.includes('EVIDENCE INSPECTOR'));
  evidence.steps.push({ step: 'current-report-final-refresh-readback', status: 'PASS', reportJobId: currentReport.reportJobId, sourceHash: CURRENT_REPORT_SOURCE_HASH, rowCount: CURRENT_REPORT_ROW_COUNT });
  await pageA.goto(baseURL + '/operations', { waitUntil: 'networkidle', timeout: 30000 });
  await pageA.getByText('مركز العمليات', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const operationsBody = (await pageA.locator('body').innerText()).trim();
  assert.ok(operationsBody.includes('ORDER → FULFILLMENT'), 'TRANSACTIONAL_SPINE_ORDER_SURFACE_MISSING');
  assert.ok(operationsBody.includes('INVOICE → PAYMENT'), 'TRANSACTIONAL_SPINE_PAYMENT_SURFACE_MISSING');
  assert.ok(operationsBody.includes('PRICING TRUTH'), 'TRANSACTIONAL_SPINE_PRICING_SURFACE_MISSING');
  assert.ok(operationsBody.includes('SUPPLIER OPERATIONS'), 'TRANSACTIONAL_SPINE_SUPPLIER_SURFACE_MISSING');
  assert.ok(operationsBody.includes('FULFILLMENT / WAREHOUSE'), 'TRANSACTIONAL_SPINE_WAREHOUSE_SURFACE_MISSING');
  assert.ok(operationsBody.includes('AUDIT / TRACE'), 'TRANSACTIONAL_SPINE_AUDIT_TRACE_SURFACE_MISSING');
  assert.ok(operationsBody.includes('READBACK CONTRACT'), 'TRANSACTIONAL_SPINE_READBACK_CONTRACT_MISSING');
  await pageA.screenshot({ path: reportDir + '/transactional-spine-surface.png', fullPage: true });
  evidence.steps.push({
    step: 'transactional-spine-surface-shell',
    status: 'PASS',
    ordersSurface: true,
    invoicesPaymentsSurface: true,
    pricingSurface: true,
    supplierSurface: true,
    warehouseSurface: true,
    auditTraceSurface: true,
    readbackContractSurface: true,
  });
  const contextB = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
  const pageB = await contextB.newPage(); attachRuntimeCapture(pageB);
  try {
    await login(pageB, emailB, passwordB); evidence.tenantB = await currentTenant(pageB); assert.notEqual(evidence.tenantB, evidence.tenantA, 'TENANT_A_AND_B_MUST_BE_DISTINCT'); evidence.steps.push({ step: 'tenant-B-authenticated', status: 'PASS', tenantId: evidence.tenantB });
    const hiddenJob = await restSelect(pageB, 'report_execution_jobs', { company_id: evidence.tenantA, id: currentReport.reportJobId }, 'id,company_id,source_path,source_hash,status', { limit: 1 }); assert.equal(hiddenJob.length, 0, 'TENANT_B_MUST_NOT_READ_TENANT_A_REPORT_JOB'); evidence.steps.push({ step: 'tenant-B-report-job-isolation', status: 'PASS' });
    const hiddenCanonical = await restSelect(pageB, 'canonical_dataset_records', { company_id: evidence.tenantA, id: currentReport.canonicalRows[0].id }, 'id,company_id,import_job_id,source_hash,row_number', { limit: 1 }); assert.equal(hiddenCanonical.length, 0, 'TENANT_B_MUST_NOT_READ_TENANT_A_CANONICAL_ROWS'); evidence.steps.push({ step: 'tenant-B-canonical-row-isolation', status: 'PASS' });
    const hiddenHistory = await restSelect(pageB, 'file_records', { company_id: evidence.tenantA, id: currentReport.fileRecord.id }, 'id,company_id,file_name,file_hash,status', { limit: 1 }); assert.equal(hiddenHistory.length, 0, 'TENANT_B_MUST_NOT_READ_TENANT_A_SOURCE_HISTORY'); evidence.steps.push({ step: 'tenant-B-source-history-isolation', status: 'PASS' });
    await pageB.goto(baseURL + '/reports/smart/' + currentReport.reportJobId, { waitUntil: 'networkidle', timeout: 30000 });
    const tenantBSmartBody = (await pageB.locator('body').innerText()).trim(); assert.equal(tenantBSmartBody.includes(CURRENT_REPORT_SOURCE_PATH), false, 'TENANT_B_SMART_REPORT_MUST_NOT_SHOW_TENANT_A_SOURCE'); assert.equal(tenantBSmartBody.includes(CURRENT_REPORT_SOURCE_HASH), false, 'TENANT_B_SMART_REPORT_MUST_NOT_SHOW_TENANT_A_HASH'); assert.equal(await pageB.getByText('EVIDENCE INSPECTOR', { exact: true }).count(), 0, 'TENANT_B_SMART_REPORT_MUST_NOT_RENDER_TENANT_A_EVIDENCE'); await pageB.screenshot({ path: reportDir + '/tenant-b-current-report-denied.png', fullPage: true }); evidence.steps.push({ step: 'tenant-B-smart-report-open-isolation', status: 'PASS' });
    await pageB.goto(baseURL + '/reports', { waitUntil: 'networkidle', timeout: 30000 }); const tenantBReportsBody = (await pageB.locator('body').innerText()).trim(); assert.equal(tenantBReportsBody.includes(CURRENT_REPORT_SOURCE_PATH), false, 'TENANT_B_REPORTS_CATALOG_MUST_NOT_SHOW_TENANT_A_SOURCE'); evidence.steps.push({ step: 'tenant-B-reports-catalog-ui-isolation', status: 'PASS' });
    await pageB.getByRole('button', { name: 'تسجيل الخروج' }).click(); await pageB.locator('#login-email').waitFor({ state: 'visible', timeout: 10000 }); evidence.steps.push({ step: 'tenant-B-logout', status: 'PASS' });
  } finally { await pageB.close(); await contextB.close(); }
  await pageA.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 }); const logoutA = pageA.getByRole('button', { name: 'تسجيل الخروج' }); assert.equal(await logoutA.count(), 1, 'TENANT_A_LOGOUT_CONTROL_MISSING'); await logoutA.click(); await pageA.locator('#login-email').waitFor({ state: 'visible', timeout: 10000 }); evidence.steps.push({ step: 'tenant-A-logout', status: 'PASS' });
  if (evidence.failures.length) throw new Error('BROWSER_RUNTIME_ERRORS:' + evidence.failures.join(' | ')); evidence.status = evidence.steps.some(step=>step.status!=='PASS') ? 'NOT_PROVEN' : 'PASS';
} catch (error) { evidence.status = error instanceof Error && /_MISSING$|NOT_PROVEN/.test(error.message) ? 'NOT_PROVEN' : 'FAIL'; evidence.error = error instanceof Error ? error.message : String(error); await pageA.screenshot({ path: reportDir + '/failure.png', fullPage: true }).catch(() => {}); }
finally { evidence.finishedAt = new Date().toISOString(); await fs.writeFile(reportDir + '/result.json', JSON.stringify(evidence, null, 2)); await browser.close(); }
console.log(JSON.stringify(evidence, null, 2)); process.exitCode = evidence.status === 'PASS' ? 0 : 1;
