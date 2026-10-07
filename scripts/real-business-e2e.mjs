import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const emailA = process.env.TEST_USER_A_EMAIL?.trim();
const passwordA = process.env.TEST_USER_A_PASSWORD;
const emailB = process.env.TEST_USER_B_EMAIL?.trim();
const passwordB = process.env.TEST_USER_B_PASSWORD;
const emailC = process.env.TEST_USER_C_EMAIL?.trim();
const passwordC = process.env.TEST_USER_C_PASSWORD;
const approverEmail = process.env.TEST_APPROVER_EMAIL?.trim();
const approverPassword = process.env.TEST_APPROVER_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e-business';
const REAL_SMART_REPORT_COMPANY_ID = '99e33354-cc45-4317-8eb3-0d486b6c5932';
const REAL_SMART_REPORT_JOB_ID = '16709d80-e012-40ef-9c12-6fd8255897f8';
const REAL_SMART_REPORT_SOURCE_PATH = 'تقارير ادارية.xlsx';
const REAL_SMART_REPORT_SOURCE_HASH = 'sha256:587f2d3dbdc7ec1ccc8c988ccad72f84b6cf2b794fcbce6711ffe5ecf9d6b313';
const REAL_SMART_REPORT_ROW_COUNT = 332;
const configuredRealSmartReportCompany = process.env.REAL_SMART_REPORT_COMPANY_ID?.trim();
if (configuredRealSmartReportCompany && configuredRealSmartReportCompany !== REAL_SMART_REPORT_COMPANY_ID) {
  throw new Error('REAL_SMART_REPORT_COMPANY_ID_LINEAGE_DRIFT:' + configuredRealSmartReportCompany);
}
for (const [name, value] of Object.entries({ supabaseURL, anonKey, emailA, passwordA, emailB, passwordB, emailC, passwordC, approverEmail, approverPassword })) if (!value) throw new Error(`BUSINESS_E2E_ENV_MISSING:${name}`);
await fs.mkdir(reportDir, { recursive: true });
const evidence = { exactHead, baseURL, browser: 'Chromium', startedAt: new Date().toISOString(), status: 'NOT_PROVEN', tenantA: null, tenantB: null, tenantReal: null, persisted: {}, steps: [], failures: [] };
const browser = await chromium.launch({ headless: true });
const contextA = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const pageA = await contextA.newPage();
const contextC = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const pageC = await contextC.newPage();
function attachRuntimeCapture(page) { page.on('console', msg => { if (msg.type() === 'error') evidence.failures.push(`console:${msg.text()}`); }); page.on('pageerror', error => evidence.failures.push(`pageerror:${error.message}`)); page.on('requestfailed', request => { const error = request.failure()?.errorText || 'unknown'; if (error !== 'net::ERR_ABORTED') evidence.failures.push(`request:${request.method()} ${request.url()} ${error}`); }); page.on('response', async response => { if (response.status() < 400) return; const url = response.url(); const relevant = !supabaseURL || url.startsWith(supabaseURL) || url.includes('/rest/v1/') || url.includes('/auth/v1/') || url.includes('/api/canonical-import-execute') || url.includes('/.netlify/functions/canonical-import-execute'); if (!relevant) return; const body = await response.text().catch(() => ''); evidence.failures.push(`response:${response.request().method()} ${response.status()} ${url} body=${body.slice(0, 4000)}`); }); }
attachRuntimeCapture(pageA);
attachRuntimeCapture(pageC);
async function accessToken(page) { return page.evaluate(() => { const raw = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1]; if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND'); const session = JSON.parse(raw); if (!session?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND'); return session.access_token; }); }
async function currentUserId(page) {
  const token = await accessToken(page);
  const response = await fetch(`${supabaseURL}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  const body = await response.text();
  assert.equal(response.ok, true, `auth user HTTP ${response.status}: ${body}`);
  const user = body ? JSON.parse(body) : null;
  assert.ok(user?.id, 'AUTH_USER_ID_MISSING');
  return String(user.id);
}
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
async function restRpc(page, functionName, payload) {
  const token = await accessToken(page);
  const response = await fetch(supabaseURL + '/rest/v1/rpc/' + functionName, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  assert.equal(response.ok, true, 'rpc ' + functionName + ' HTTP ' + response.status + ': ' + body);
  return body ? JSON.parse(body) : null;
}

async function restUpdate(page, table, id, payload) { const token = await accessToken(page); const url = new URL(`${supabaseURL}/rest/v1/${table}`); url.searchParams.set('id', `eq.${id}`); const response = await fetch(url, { method: 'PATCH', headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) }); const body = await response.text(); assert.equal(response.ok, true, `${table} cross-tenant update HTTP ${response.status}: ${body}`); return body ? JSON.parse(body) : []; }
async function login(page, email, password) {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#login-email').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  let authResponse = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
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
    if (candidate && [429, 500, 502, 503, 504].includes(candidate.status()) && attempt < 6) {
      await page.waitForTimeout(Math.min(5000 * attempt, 20000));
      continue;
    }
    authResponse = candidate;
    if (authResponse || attempt === 6) break;
    await page.waitForTimeout(Math.min(5000 * attempt, 20000));
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
  assert.ok(
    /\/reports\/smart\/[^/]+/.test(page.url()),
    'SMART_REPORT_BROWSER_ROUTE_MUST_REMAIN_SOURCE_BOUND'
  );
  await page.getByText('EVIDENCE PASSPORT', { exact: false }).first().waitFor({
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

  assert.ok(beforeRefreshText.includes('لوحة القرار التنفيذي') || beforeRefreshText.includes('ماذا يحدث في هذا التقرير؟'), 'Executive decision summary must be visible on the real Smart Report');
  assert.ok(beforeRefreshText.includes('ما الذي ثبت وما الذي لم يُثبت'), 'Smart Report truth-state section must be visible');
  assert.ok(beforeRefreshText.includes('EVIDENCE PASSPORT'), 'Smart Report evidence passport must be visible');
  assert.ok(beforeRefreshText.includes('التفاصيل الكاملة للتقرير'), 'Smart Report detailed evidence disclosure must be visible');
  assert.ok(beforeRefreshText.includes('التوصية'), 'Smart Report recommendation state must be visible');
  assert.ok(beforeRefreshText.includes('القرار'), 'Smart Report decision state must be visible');

  await page.screenshot({
    path: reportDir + '/smart-report-' + label + '-before-refresh.png',
    fullPage: true,
  });

  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  assert.ok(
    /\/reports\/smart\/[^/]+/.test(page.url()),
    'SMART_REPORT_REFRESH_ROUTE_MUST_REMAIN_SOURCE_BOUND'
  );
  await page.getByText('EVIDENCE PASSPORT', { exact: false }).waitFor({
    state: 'visible',
    timeout: 30000,
  });

  const afterRefreshText = (await page.locator('body').innerText()).trim();
  assert.ok(
    afterRefreshText.includes(sourceHash.slice(0, 24)),
    'Smart Report fingerprint must survive browser refresh'
  );
  assert.ok(
    afterRefreshText.includes('EVIDENCE PASSPORT'),
    'Smart Report evidence passport must survive browser refresh'
  );
  assert.ok(
    afterRefreshText.includes('ما الذي ثبت وما الذي لم يُثبت'),
    'Smart Report truth-state section must survive browser refresh'
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

const CURRENT_REPORT_SOURCE_PATH = REAL_SMART_REPORT_SOURCE_PATH;
const CURRENT_REPORT_SOURCE_HASH = REAL_SMART_REPORT_SOURCE_HASH;
const CURRENT_REPORT_ROW_COUNT = REAL_SMART_REPORT_ROW_COUNT;
const CURRENT_REPORT_TASK_COUNT = 9;
const CURRENT_REPORT_ENTITY_TYPE = 'generic:inventory';

function assertCurrentReportText(text, label) {
  assert.ok(text.includes(CURRENT_REPORT_SOURCE_PATH), label + ': source path missing');
  assert.ok(text.includes(CURRENT_REPORT_SOURCE_HASH), label + ': source hash missing');
  assert.ok(text.includes(String(CURRENT_REPORT_ROW_COUNT)), label + ': row count missing');
  assert.ok(text.includes('موثوق') || text.includes('TRUSTED'), label + ': trust state missing');
}

async function readCurrentPersistedReport(page, companyId) {
  const jobs = await restSelect(page, 'report_execution_jobs', { company_id: companyId, source_path: CURRENT_REPORT_SOURCE_PATH, source_hash: CURRENT_REPORT_SOURCE_HASH, status: 'completed' }, 'id,company_id,job_key,source_path,source_hash,status,checkpoint,evidence,completed_at', { order: 'completed_at.desc', limit: 20 });
  const authoritativeJobs = jobs.filter(job => String(job.job_key ?? '').startsWith('canonical-import:' + CURRENT_REPORT_ENTITY_TYPE + ':' + CURRENT_REPORT_SOURCE_HASH + ':'));
  assert.ok(authoritativeJobs.length > 0, 'CERTIFIED_REPORT_AUTHORITATIVE_JOB_NOT_FOUND');
  const uniqueJobs = [...new Map(authoritativeJobs.map(job => [String(job.id), job])).values()];
  assert.equal(uniqueJobs.length, 1, 'CURRENT_REPORT_JOB_MUST_BE_UNAMBIGUOUS');
  const job = uniqueJobs[0];
  assert.equal(job.id, '16709d80-e012-40ef-9c12-6fd8255897f8', 'CURRENT_REPORT_JOB_ID_CHANGED');
  assert.equal(job.status, 'completed');
  assert.equal(job.source_hash, CURRENT_REPORT_SOURCE_HASH);
  assert.equal(job.source_path, CURRENT_REPORT_SOURCE_PATH);
  const rendered = job.evidence?.renderedOutput;
  assert.ok(rendered && typeof rendered === 'object', 'CURRENT_REPORT_RENDERED_OUTPUT_MISSING');
  assert.equal(rendered.sourceHash, CURRENT_REPORT_SOURCE_HASH);
  assert.equal(rendered.sourceBound, true);
  assert.equal(Number(rendered.rowCount), CURRENT_REPORT_ROW_COUNT);
  assert.equal(Number(rendered.rowCount), CURRENT_REPORT_ROW_COUNT);
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
  assert.equal(Number(analyses[0].column_count), 18, 'CURRENT_REPORT_COLUMN_COUNT_CHANGED');
  assert.equal(Number(analyses[0].quality_score), Number(rendered.qualityScore));
  const fileRecords = await restSelect(page, 'file_records', { company_id: companyId, id: imports[0].file_record_id }, 'id,company_id,file_name,file_hash,detected_format,status', { limit: 1 });
  assert.equal(fileRecords.length, 1);
  assert.equal(fileRecords[0].file_name, CURRENT_REPORT_SOURCE_PATH);
  assert.equal(fileRecords[0].file_hash, CURRENT_REPORT_SOURCE_HASH);
  return { job, rendered, tasks, importJob: imports[0], canonicalRows, commits, analysis: analyses[0], fileRecord: fileRecords[0], reportJobId: job.id, sourcePath: job.source_path, sourceHash: CURRENT_REPORT_SOURCE_HASH };
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
  await page.getByText('EVIDENCE PASSPORT', { exact: false }).waitFor({ state: 'visible', timeout: 30000 });
  const before = (await page.locator('body').innerText()).trim();
  assertCurrentReportText(before, 'current smart report');
  assert.ok(before.includes('EVIDENCE PASSPORT'));
  assert.ok(before.includes(String(Number(report.rendered.qualityScore)) + '%'));
  assert.ok(before.includes(REAL_SMART_REPORT_JOB_ID), 'Smart Report certified job id missing from DOM');
  assert.ok(before.includes(REAL_SMART_REPORT_SOURCE_HASH), 'Smart Report certified source hash missing from DOM');
  assert.ok(before.includes(REAL_SMART_REPORT_SOURCE_PATH), 'Smart Report certified source path missing from DOM');
  assert.equal(await page.locator('[data-testid="smart-report-job-id"]').count(), 1, 'Smart Report job id DOM proof missing or duplicated');
  assert.equal(await page.locator('[data-testid="smart-report-source-hash"]').count(), 1, 'Smart Report source hash DOM proof missing or duplicated');
  assert.ok(before.includes('التقرير موثق') || before.includes('الدليل موثق') || before.includes('موثّق') || before.includes('TRUSTED'), 'Smart Report trust state missing');
  assert.ok(before.includes('WHAT → WHY → SO WHAT → IMPACT → WHAT NEXT → PROOF'), 'Smart Report decision chain missing');
  assert.ok(await page.locator('[data-testid="smart-report-decision-chain"]').count() === 1, 'Smart Report decision chain DOM surface missing');
  assert.ok(before.includes('ماذا يقول هذا التقرير فعليًا؟') || before.includes('ماذا يحدث في هذا التقرير؟'), 'Smart Report executive summary missing');
  assert.ok(before.includes('التفاصيل الكاملة للتقرير'), 'Smart Report evidence disclosure missing');
  assert.ok(before.includes('التوصية'), 'Smart Report recommendation state missing');
  assert.ok(before.includes('القرار'), 'Smart Report decision state missing');
  await page.screenshot({ path: reportDir + '/current-report-smart-before-refresh.png', fullPage: true });
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.getByText('EVIDENCE PASSPORT', { exact: false }).waitFor({ state: 'visible', timeout: 30000 });
  const after = (await page.locator('body').innerText()).trim();
  assertCurrentReportText(after, 'current smart report refresh');
  assert.ok(after.includes('EVIDENCE PASSPORT'));
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

async function proveReportsCenterRealSurface(page, report) {
  const responsePromise = waitForCurrentJobResponse(page, report.reportJobId);
  const response = await page.goto(baseURL + '/reports', { waitUntil: 'networkidle', timeout: 30000 });
  assert.ok(response && response.status() < 400, 'REPORTS_CENTER_HTTP_FAILURE');
  const jobResponse = await responsePromise;
  assert.ok(jobResponse, 'REPORTS_CENTER_CURRENT_JOB_READBACK_MISSING');
  const rows = await jobResponse.json();
  assert.equal(rows.length, 1, 'REPORTS_CENTER_EXPECTED_ONE_CURRENT_REPORT_JOB');
  assert.equal(rows[0].id, report.reportJobId, 'REPORTS_CENTER_JOB_ID_MISMATCH');
  assert.equal(rows[0].source_hash, CURRENT_REPORT_SOURCE_HASH, 'REPORTS_CENTER_SOURCE_HASH_MISMATCH');
  assert.equal(rows[0].source_path, CURRENT_REPORT_SOURCE_PATH, 'REPORTS_CENTER_SOURCE_PATH_MISMATCH');

  await page.getByText('ماذا استنتج النظام من هذا التقرير؟', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText('استكشف الصفوف التي صنعت التقرير', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });

  const body = (await page.locator('body').innerText()).trim();
  assertCurrentReportText(body, 'reports center');
  assert.ok(body.includes('ما الذي ينصح به النظام؟'), 'REPORTS_CENTER_RECOMMENDATIONS_MISSING');
  assert.ok(body.includes('بحث داخل الصفوف: اسم صنف، عميل، رقم، قيمة...'), 'REPORTS_CENTER_ROW_SEARCH_MISSING');
  assert.ok(body.includes('كل السجلات'), 'REPORTS_CENTER_ROW_SUMMARY_MISSING');
  assert.ok(body.includes('انقر صفًا لفتح تفاصيله.'), 'REPORTS_CENTER_ROW_DETAIL_HANDOFF_MISSING');
  assert.ok(body.includes(REAL_SMART_REPORT_JOB_ID), 'REPORTS_CENTER_JOB_ID_NOT_VISIBLE');
  assert.ok(body.includes(REAL_SMART_REPORT_SOURCE_HASH), 'REPORTS_CENTER_SOURCE_HASH_NOT_VISIBLE');
  assert.ok(body.includes(REAL_SMART_REPORT_SOURCE_PATH), 'REPORTS_CENTER_SOURCE_PATH_NOT_VISIBLE');
  assert.ok(
    body.includes('التوصية') &&
    (body.includes('القرار') || body.includes('مراجعة مطلوبة')),
    'REPORTS_CENTER_DECISION_STATE_MISSING',
  );

  const expectedContextLinks = [
    '/intelligence',
    '/advisor-cases',
    '/work-center',
    '/replay',
    '/benchmark',
    '/trust',
    '/decision-experience',
  ];
  for (const route of expectedContextLinks) {
    const link = page.locator('a[href^="' + route + '?"]');
    assert.ok(await link.count() >= 1, 'REPORT_CONTEXT_LINK_MISSING:' + route);
    const hrefs = await link.evaluateAll(nodes => nodes.map(node => node.getAttribute('href') || ''));
    assert.ok(
      hrefs.some(href => href.includes('reportJobId=' + encodeURIComponent(report.reportJobId)) && href.includes('sourceHash=' + encodeURIComponent(CURRENT_REPORT_SOURCE_HASH))),
      'REPORT_CONTEXT_LINK_LINEAGE_MISSING:' + route,
    );
  }

  await page.screenshot({ path: reportDir + '/current-report-center-real-surface.png', fullPage: true });
  evidence.steps.push({
    step: 'current-report-center-real-intelligence-and-source-rows',
    status: 'PASS',
    reportJobId: report.reportJobId,
    sourceHash: CURRENT_REPORT_SOURCE_HASH,
    sourcePath: CURRENT_REPORT_SOURCE_PATH,
    rowCount: CURRENT_REPORT_ROW_COUNT,
    qualityScore: Number(report.rendered.qualityScore),
  });
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

async function proveTransactionalMutationAndAudit(page) {
  await page.goto(baseURL + '/operations', { waitUntil: 'networkidle', timeout: 30000 });
  await page.getByRole('heading', { name: 'مركز العمليات', exact: true }).waitFor({ state: 'visible', timeout: 30000 });

  const e2eOrders = await restSelect(
    page,
    'orders',
    { company_id: evidence.tenantA },
    'id,company_id,status,warehouse_id,customer_id,order_number,idempotency_key,total,currency',
    { order: 'created_at.asc', limit: 50 },
  );
  const expectedFixtureKey = process.env.E2E_TRANSACTION_ORDER_IDEMPOTENCY_KEY?.trim();
  const e2eFixture = expectedFixtureKey
    ? e2eOrders.find((row) => String(row.idempotency_key ?? '') === expectedFixtureKey)
    : e2eOrders.find((row) => String(row.idempotency_key ?? '').startsWith('E2E-ORDER-'));
  if (!e2eFixture) {
    evidence.steps.push({ step: 'transactional-real-mutation', status: 'NOT_PROVEN', reason: 'E2E_FIXTURE_ORDER_MISSING', actionSurfaceVisible: true });
    return;
  }

  const beforePrepare = {
    status: String(e2eFixture.status),
    invoiceCount: (await restSelect(page, 'sales_invoices', { company_id: evidence.tenantA, order_id: e2eFixture.id }, 'id', { limit: 20 })).length,
  };
  assert.equal(beforePrepare.status, 'pending', 'E2E_TRANSACTION_FIXTURE_NOT_PENDING');
  const orderId = String(e2eFixture.id);

  await page.goto(baseURL + '/operations', { waitUntil: 'networkidle', timeout: 30000 });
  await page.getByRole('heading', { name: 'مركز العمليات', exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const first = page.locator('[data-testid="advance-order-' + orderId + '"]');
  assert.equal(await first.count(), 1, 'TRANSACTIONAL_E2E_ORDER_ACTION_MISSING');
  const beforeBody = (await page.locator('body').innerText()).trim();

  const initialOrderRows = await restSelect(page, 'orders', { company_id: evidence.tenantA, id: orderId }, 'id,company_id,status,total,currency,order_number,idempotency_key', { limit: 1 });
  assert.equal(initialOrderRows.length, 1, 'TRANSACTIONAL_ORDER_DB_ROW_MISSING_BEFORE');
  assert.equal(initialOrderRows[0].company_id, evidence.tenantA);

  let orderStatus = String(initialOrderRows[0].status);
  const transitions = [];
  for (let step = 0; step < 6; step += 1) {
    const button = page.locator('[data-testid="advance-order-' + orderId + '"]');
    if (await button.count() === 0) break;
    const fromStatus = orderStatus;
    await button.click();
    await page.getByText('تم حفظ انتقال الطلب وإعادة قراءة الحالة من المصدر.', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
    const afterOrderRows = await restSelect(page, 'orders', { company_id: evidence.tenantA, id: orderId }, 'id,company_id,status,total,currency', { limit: 1 });
    assert.equal(afterOrderRows.length, 1, 'TRANSACTIONAL_ORDER_DB_ROW_MISSING_AFTER_TRANSITION');
    assert.equal(afterOrderRows[0].company_id, evidence.tenantA);
    assert.notEqual(String(afterOrderRows[0].status), fromStatus, 'TRANSACTIONAL_ORDER_STATUS_DID_NOT_PERSIST');
    orderStatus = String(afterOrderRows[0].status);
    transitions.push({ from: fromStatus, to: orderStatus });
    if (orderStatus === 'completed') break;
  }
  assert.equal(orderStatus, 'completed', 'TRANSACTIONAL_ORDER_NOT_COMPLETED_FOR_INVOICE_FLOW');

  const createInvoiceButton = page.locator('[data-testid="create-invoice-' + orderId + '"]');
  assert.equal(await createInvoiceButton.count(), 1, 'TRANSACTIONAL_CREATE_INVOICE_BUTTON_MISSING');
  await createInvoiceButton.click();
  await page.getByText('تم تثبيت/قراءة الفاتورة المرتبطة بالطلب من المصدر.', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });

  const invoiceRows = await restSelect(page, 'sales_invoices', { company_id: evidence.tenantA, order_id: orderId }, 'id,company_id,order_id,status,total,paid_amount,currency', { order: 'invoice_date.desc', limit: 5 });
  assert.ok(invoiceRows.length >= 1, 'TRANSACTIONAL_INVOICE_DB_READBACK_MISSING');
  const invoice = invoiceRows[0];
  const invoiceId = String(invoice.id);
  assert.equal(invoice.company_id, evidence.tenantA);
  assert.equal(invoice.order_id, orderId);
  const beforePaid = Number(invoice.paid_amount ?? 0);
  const outstanding = Number(invoice.total) - beforePaid;
  assert.ok(Number.isFinite(outstanding) && outstanding > 0, 'TRANSACTIONAL_INVOICE_HAS_NO_POSITIVE_BALANCE_TO_PAY');

  const invoiceButton = page.locator('[data-testid="invoice-' + invoiceId + '"]');
  assert.equal(await invoiceButton.count(), 1, 'TRANSACTIONAL_INVOICE_UI_READBACK_MISSING');
  await invoiceButton.click();
  const paymentForm = page.locator('[data-testid="payment-form-' + invoiceId + '"]');
  await paymentForm.waitFor({ state: 'visible', timeout: 30000 });
  const paymentAmount = Math.min(1, outstanding);
  await paymentForm.locator('[data-testid="payment-amount"]').fill(String(paymentAmount));

  const paymentsBefore = await restSelect(page, 'payments', { company_id: evidence.tenantA, invoice_id: invoiceId }, 'id,company_id,invoice_id,amount,method,reference,payment_date', { order: 'created_at.desc', limit: 20 });
  await paymentForm.getByRole('button', { name: /تسجيل الدفعة وإعادة القراءة/ }).click();
  await page.getByText('تم تسجيل الدفعة وإعادة قراءة الفاتورة والرصيد من المصدر.', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });

  const invoiceAfterPayment = await restSelect(page, 'sales_invoices', { company_id: evidence.tenantA, id: invoiceId }, 'id,company_id,order_id,status,total,paid_amount,currency', { limit: 1 });
  assert.equal(invoiceAfterPayment.length, 1, 'TRANSACTIONAL_INVOICE_READBACK_AFTER_PAYMENT_MISSING');
  const afterPaid = Number(invoiceAfterPayment[0].paid_amount ?? 0);
  assert.ok(afterPaid > beforePaid, 'TRANSACTIONAL_PAYMENT_DID_NOT_PERSIST_TO_INVOICE');
  assert.equal(invoiceAfterPayment[0].company_id, evidence.tenantA);

  const paymentsAfter = await restSelect(page, 'payments', { company_id: evidence.tenantA, invoice_id: invoiceId }, 'id,company_id,invoice_id,amount,method,reference,payment_date', { order: 'created_at.desc', limit: 20 });
  assert.ok(paymentsAfter.length > paymentsBefore.length, 'TRANSACTIONAL_PAYMENT_ROW_NOT_PERSISTED');
  const payment = paymentsAfter[0];
  assert.equal(payment.company_id, evidence.tenantA);
  assert.equal(payment.invoice_id, invoiceId);

  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.getByRole('heading', { name: 'مركز العمليات', exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const afterBody = (await page.locator('body').innerText()).trim();
  assert.ok(afterBody.includes('AUDIT / TRACE'), 'TRANSACTIONAL_AUDIT_TRACE_SECTION_MISSING_AFTER_MUTATION');
  assert.notEqual(afterBody, beforeBody, 'TRANSACTIONAL_UI_READBACK_DID_NOT_CHANGE');
  const auditTrace = page.locator('[data-testid="operations-audit-trace"]');
  await auditTrace.waitFor({ state: 'visible', timeout: 30000 });
  const auditText = await auditTrace.innerText();
  assert.ok(auditText.includes('order_status_changed') || auditText.includes('order_created'), 'TRANSACTIONAL_ORDER_AUDIT_ROW_MISSING');
  assert.ok(auditText.includes('invoice_created'), 'TRANSACTIONAL_INVOICE_AUDIT_ROW_MISSING');

  const orderAudit = await restSelect(page, 'audit_logs', { company_id: evidence.tenantA, entity_id: orderId }, 'id,company_id,action,entity_type,entity_id,source,user_label,correlation_id,created_at', { order: 'created_at.desc', limit: 20 });
  const invoiceAudit = await restSelect(page, 'audit_logs', { company_id: evidence.tenantA, entity_id: invoiceId }, 'id,company_id,action,entity_type,entity_id,source,user_label,correlation_id,created_at', { order: 'created_at.desc', limit: 20 });
  const paymentAudit = await restSelect(page, 'audit_logs', { company_id: evidence.tenantA, entity_id: String(payment.id) }, 'id,company_id,action,entity_type,entity_id,source,user_label,correlation_id,created_at', { order: 'created_at.desc', limit: 20 });
  assert.ok(orderAudit.length > 0, 'TRANSACTIONAL_ORDER_AUDIT_DB_ROW_MISSING');
  assert.ok(invoiceAudit.length > 0, 'TRANSACTIONAL_INVOICE_AUDIT_DB_ROW_MISSING');
  assert.ok(paymentAudit.length > 0, 'TRANSACTIONAL_PAYMENT_AUDIT_DB_ROW_MISSING');

  await page.screenshot({ path: reportDir + '/transactional-real-mutation-invoice-payment-audit.png', fullPage: true });
  evidence.steps.push({ step: 'transactional-real-mutation', status: 'PASS', orderId, fixtureKey: String(e2eFixture.idempotency_key), beforePrepare, prepareContract: 'prepare_e2e_order', transitions, finalOrderStatus: orderStatus, invoiceId, invoicePersistence: true, invoiceReadback: true, paymentId: String(payment.id), paymentPersistence: true, paymentReadback: true, auditOrderReadback: true, auditInvoiceReadback: true, auditPaymentReadback: true, tenantId: evidence.tenantA });
}
async function proveDecisionActionSurface(page, report) {
  const target = baseURL + '/decision-experience?stage=decision&reportJobId=' + encodeURIComponent(report.reportJobId) + '&sourceHash=' + encodeURIComponent(CURRENT_REPORT_SOURCE_HASH);
  const response = await page.goto(target, { waitUntil: 'networkidle', timeout: 30000 });
  assert.ok(response && response.status() < 400, 'decision-action: HTTP ' + (response?.status() ?? 'NO_RESPONSE'));
  const body = (await page.locator('body').innerText()).trim();
  assertCurrentReportText(body, 'decision action');
  assert.ok(body.includes('مسار القرار لهذا التقرير فقط'), 'SOURCE_BOUND_DECISION_SURFACE_MISSING');

  const createDecisionButton = page.getByRole('button', { name: /حفظ القرار والقضية|حفظ كقرار مقترح|حفظ كتوصية ثم قرار/, exact: false }).first();
  const createDecisionButtonCount = await createDecisionButton.count();
  const approvalButton = page.getByRole('button', { name: /طلب الموافقة|استكمال مسار الموافقة/, exact: false }).first();
  const approvalButtonCount = await approvalButton.count();
  const emptyDecisionState = body.includes('لا توجد قرارات مصدرية محفوظة بعد لهذا المصدر.');
  const persistedDecisionState =
    body.includes('DECISION → ACTION → OUTCOME → LEARNING') ||
    body.includes('APPROVED') ||
    body.includes('القضية نفسها ما زالت مرتبطة بالتقرير');

  const decisionState =
    createDecisionButtonCount === 1
      ? 'CREATE_PERSIST_READY'
      : approvalButtonCount === 1
        ? 'APPROVAL_READY'
        : emptyDecisionState
          ? 'EMPTY_AWAITING_CREATION'
          : persistedDecisionState
            ? 'PERSISTED_DECISION_READY'
            : 'UNKNOWN';

  assert.notEqual(decisionState, 'UNKNOWN', 'SOURCE_BOUND_DECISION_STATE_MISSING');
  assert.ok(
    body.includes('لا يوجد اعتماد تلقائي') ||
    body.includes('بانتظار صاحب الصلاحية') ||
    body.includes('طلب الموافقة') ||
    body.includes('استكمال مسار الموافقة') ||
    createDecisionButtonCount === 1 ||
    emptyDecisionState,
    'DECISION_APPROVAL_GUARDRAIL_MISSING'
  );

  await page.screenshot({ path: reportDir + '/decision-action-surface.png', fullPage: true });
  evidence.steps.push({
    step: 'decision-action-surface',
    status: 'PASS',
    reportJobId: report.reportJobId,
    sourceHash: CURRENT_REPORT_SOURCE_HASH,
    persistenceAction: createDecisionButtonCount === 1,
    approvalActionAvailable: approvalButtonCount === 1,
    approvalGuardrail: true,
    prePersistedDecisionState: decisionState,
  });
}

async function proveDecisionApprovalActionOutcome(page, report) {
  await page.goto(baseURL + '/reports/smart/' + report.reportJobId, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText('ماذا استنتج النظام من هذا التقرير؟', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });

  const proposalButton = page.getByRole('button', { name: /حفظ القرار والقضية|حفظ كقرار مقترح|حفظ كتوصية ثم قرار/, exact: false }).first();
  if (await proposalButton.count() === 0) {
    evidence.steps.push({ step: 'decision-approval-action-outcome', status: 'NOT_PROVEN', reason: 'SOURCE_SIGNAL_NOT_AVAILABLE', reportJobId: report.reportJobId });
    return;
  }

  const userAId = await currentUserId(page);
  await proposalButton.click();
  await page.getByText(/تم حفظ القرار والقضية|تم حفظ القرار المقترح|تم حفظ التوصية والقرار/, { exact: false }).first().waitFor({ state: 'visible', timeout: 30000 });

  const decisionTarget = baseURL + '/decision-experience?stage=decision&reportJobId=' + encodeURIComponent(report.reportJobId) + '&sourceHash=' + encodeURIComponent(report.sourceHash);
  await page.goto(decisionTarget, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const decisionRows = await restSelect(
    page,
    'business_intelligence_decisions',
    { company_id: evidence.tenantA },
    'id,company_id,status,decision_key,recommendation_id,created_at,approved_at,approved_by',
    { order: 'created_at.desc', limit: 100 },
  );
  const sourceDecisions = decisionRows.filter((row) => String(row.decision_key ?? '').startsWith('source-intelligence:' + report.sourceHash + ':'));
  if (sourceDecisions.length === 0) {
    evidence.steps.push({ step: 'decision-approval-action-outcome', status: 'NOT_PROVEN', reason: 'SOURCE_DECISION_ROW_NOT_AVAILABLE', reportJobId: report.reportJobId });
    return;
  }

  const decision = sourceDecisions[0];
  const decisionId = String(decision.id);
  assert.equal(String(decision.company_id), evidence.tenantA, 'DECISION_TENANT_MISMATCH');
  assert.ok(decision.recommendation_id, 'DECISION_RECOMMENDATION_LINK_MISSING');

  const approvals = await restSelect(
    page,
    'decision_approvals',
    { company_id: evidence.tenantA, decision_id: decisionId },
    'id,company_id,decision_id,status,requested_by,decided_by',
    { order: 'requested_at.desc', limit: 1 },
  );
  let approvalId = approvals.length ? String(approvals[0].id) : null;
  let approvalStatus = approvals.length ? String(approvals[0].status) : null;

  if (decision.status === 'EXECUTED') {
    const workRows = await restSelect(page, 'decision_work_items', { company_id: evidence.tenantA, decision_id: decisionId }, 'id,status,assignee_id,actual_impact', { order: 'created_at.desc', limit: 1 });
    const outcomeRows = await restSelect(workPage, 'recommendation_outcomes', { company_id: evidence.tenantA, decision_id: decisionId }, 'id,company_id,decision_id,status,outcome_quality,actual_impact,observed_at', { order: 'observed_at.desc', limit: 1 });
    const recommendationRows = await restSelect(workPage, 'recommendations', { company_id: evidence.tenantA, id: String(decision.recommendation_id) }, 'id,company_id,decision_id,evidence_snapshot_id', { limit: 1 });
    assert.equal(workRows.length, 1, 'DECISION_EXECUTED_WORK_ITEM_MISSING');
    assert.equal(workRows[0].status, 'COMPLETED');
    assert.equal(String(workRows[0].assignee_id), userAId);
    assert.equal(outcomeRows.length, 1, 'DECISION_EXECUTED_OUTCOME_MISSING');
    assert.equal(recommendationRows.length, 1, 'DECISION_RECOMMENDATION_READBACK_MISSING');
    assert.equal(String(recommendationRows[0].decision_id), decisionId);
    const decisionAudit = await restSelect(workPage, 'audit_logs', { company_id: evidence.tenantA, entity_id: decisionId }, 'id,entity_type,action,source', { order: 'created_at.desc', limit: 20 });
    const approvalRows = await restSelect(page, 'decision_approvals', { company_id: evidence.tenantA, decision_id: decisionId }, 'id', { order: 'requested_at.desc', limit: 1 });
    assert.equal(approvalRows.length, 1, 'DECISION_EXECUTED_APPROVAL_MISSING');
    const approvalAudit = await restSelect(workPage, 'audit_logs', { company_id: evidence.tenantA, entity_id: String(approvalRows[0].id) }, 'id,entity_type,action,source', { order: 'created_at.desc', limit: 20 });
    const workAudit = await restSelect(workPage, 'audit_logs', { company_id: evidence.tenantA, entity_id: String(workRows[0].id) }, 'id,entity_type,action,source', { order: 'created_at.desc', limit: 20 });
    const outcomeAudit = await restSelect(workPage, 'audit_logs', { company_id: evidence.tenantA, entity_id: String(outcomeRows[0].id) }, 'id,entity_type,action,source', { order: 'created_at.desc', limit: 20 });
    assert.ok(decisionAudit.length > 0, 'DECISION_AUDIT_READBACK_MISSING');
    assert.ok(approvalAudit.length > 0, 'APPROVAL_AUDIT_READBACK_MISSING');
    assert.ok(workAudit.length > 0, 'WORK_AUDIT_READBACK_MISSING');
    assert.ok(outcomeAudit.length > 0, 'OUTCOME_AUDIT_READBACK_MISSING');
    await page.screenshot({ path: reportDir + '/decision-approval-action-outcome-reused.png', fullPage: true });
    evidence.steps.push({
      step: 'decision-approval-action-outcome',
      status: 'PASS',
      reportJobId: report.reportJobId,
      sourceHash: report.sourceHash,
      decisionId,
      approvalId,
      approvalStatus,
      workItemId: String(workRows[0].id),
      workStatus: String(workRows[0].status),
      outcomeId: String(outcomeRows[0].id),
      outcomeStatus: String(outcomeRows[0].status ?? ''),
      finalDecisionStatus: String(decision.status),
      reusedPersistedDecision: true,
    });
    return;
  }

  if (decision.status === 'REJECTED' || decision.status === 'CANCELLED') {
    evidence.steps.push({ step: 'decision-approval-action-outcome', status: 'NOT_PROVEN', reason: 'SOURCE_DECISION_TERMINAL_NON_EXECUTED', decisionId, status: decision.status });
    return;
  }

  if (decision.status === 'PROPOSED' && approvalStatus !== 'PENDING') {
    const requestButton = page.locator('[data-testid="request-approval-' + decisionId + '"]');
    await requestButton.waitFor({ state: 'visible', timeout: 30000 });
    await requestButton.click();
    await page.getByText(/تم طلب الموافقة|PENDING · بانتظار صاحب صلاحية آخر/, { exact: false }).first().waitFor({ state: 'visible', timeout: 30000 });

    const refreshedApprovals = await restSelect(
      page,
      'decision_approvals',
      { company_id: evidence.tenantA, decision_id: decisionId },
      'id,company_id,decision_id,status,requested_by,decided_by',
      { order: 'requested_at.desc', limit: 1 },
    );
    assert.equal(refreshedApprovals.length, 1, 'DECISION_APPROVAL_ROW_MISSING_AFTER_REQUEST');
    approvalId = String(refreshedApprovals[0].id);
    approvalStatus = String(refreshedApprovals[0].status);
    assert.equal(approvalStatus, 'PENDING');
    assert.equal(String(refreshedApprovals[0].requested_by), userAId);
  }

  let workActorContext = null;
  let workActorPage = null;
  let workActorId = null;

  const createWorkAsAdminActor = async () => {
    if (workActorPage && workActorId) return;
    workActorContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
    workActorPage = await workActorContext.newPage();
    attachRuntimeCapture(workActorPage);
    await login(workActorPage, approverEmail, approverPassword);
    const adminTenant = await currentTenant(workActorPage);
    workActorId = await currentUserId(workActorPage);
    assert.equal(adminTenant, evidence.tenantA, 'WORK_CREATOR_TENANT_MUST_MATCH_REQUEST_TENANT');
    assert.notEqual(workActorId, userAId, 'WORK_CREATOR_MUST_DIFFER_FROM_REQUESTER');
    const membership = await restSelect(workActorPage,'company_memberships',{ company_id: evidence.tenantA, user_id: workActorId, is_active: true },'role',{ limit: 1 });
    const role = membership[0]?.role == null ? '' : String(membership[0].role).toLowerCase();
    assert.ok(['owner','admin','administrator'].includes(role), 'WORK_CREATOR_ADMIN_BOUNDARY_MISSING');
    await workActorPage.goto(decisionTarget, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const button = workActorPage.locator('[data-testid="create-work-' + decisionId + '"]');
    await button.waitFor({ state: 'visible', timeout: 30000 });
    await button.click();
    await workActorPage.waitForTimeout(500);
    const created = await restSelect(workActorPage,'decision_work_items',{ company_id: evidence.tenantA, decision_id: decisionId },'id,status,assignee_id,actual_impact',{ order: 'created_at.desc', limit: 1 });
    assert.equal(created.length, 1, 'DECISION_WORK_ITEM_DB_ROW_MISSING_AFTER_ADMIN_CREATION');
    assert.equal(String(created[0].assignee_id), String(workActorId), 'WORK_CREATOR_ASSIGNEE_MISMATCH');
  };
  if (approvalStatus === 'PENDING') {
    const approverContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
    const approverPage = await approverContext.newPage();
    attachRuntimeCapture(approverPage);
    try {
      await login(approverPage, approverEmail, approverPassword);
      const approverTenant = await currentTenant(approverPage);
      const approverId = await currentUserId(approverPage);
      assert.equal(approverTenant, evidence.tenantA, 'APPROVER_TENANT_MUST_MATCH_REQUEST_TENANT');
      assert.notEqual(approverId, userAId, 'APPROVER_MUST_DIFFER_FROM_REQUESTER');

      await approverPage.goto(decisionTarget, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const approveButton = approverPage.locator('[data-testid="approve-decision-' + decisionId + '"]');
      await approveButton.waitFor({ state: 'visible', timeout: 30000 });
      await approveButton.click();
      await approverPage.waitForTimeout(500);

      const approvedRows = await restSelect(approverPage, 'decision_approvals', { company_id: evidence.tenantA, id: approvalId }, 'id,company_id,decision_id,status,requested_by,decided_by', { limit: 1 });
      assert.equal(approvedRows.length, 1, 'DECISION_APPROVAL_READBACK_MISSING');
      assert.equal(approvedRows[0].status, 'APPROVED');
      assert.equal(String(approvedRows[0].requested_by), userAId);
      assert.equal(String(approvedRows[0].decided_by), approverId);
      approvalStatus = 'APPROVED';

    } finally {
      await approverPage.close().catch(() => {});
      await approverContext.close().catch(() => {});
    }
  }

  await page.goto(decisionTarget, { waitUntil: 'domcontentloaded', timeout: 30000 });
  let existingWork = await restSelect(
    page,
    'decision_work_items',
    { company_id: evidence.tenantA, decision_id: decisionId },
    'id,status,assignee_id,actual_impact',
    { order: 'created_at.desc', limit: 1 },
  );
  if (existingWork.length === 0 || existingWork[0].status === 'COMPLETED') {
    await createWorkAsAdminActor();
    existingWork = await restSelect(
      page,
      'decision_work_items',
      { company_id: evidence.tenantA, decision_id: decisionId },
      'id,status,assignee_id,actual_impact',
      { order: 'created_at.desc', limit: 1 },
    );
    assert.ok(existingWork.length === 1, 'DECISION_WORK_ITEM_DB_ROW_MISSING_AFTER_ADMIN_CREATION');
  }

  let workPage = workActorPage || page;
  if (existingWork.length === 1 && existingWork[0].status === 'OPEN' && String(existingWork[0].assignee_id) !== String(userAId) && !workActorPage) {
    workActorContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
    workActorPage = await workActorContext.newPage();
    attachRuntimeCapture(workActorPage);
    await login(workActorPage, approverEmail, approverPassword);
    const existingWorkActorTenant = await currentTenant(workActorPage);
    workActorId = await currentUserId(workActorPage);
    assert.equal(existingWorkActorTenant, evidence.tenantA, 'EXISTING_WORK_ACTOR_TENANT_MISMATCH');
    assert.equal(String(workActorId), String(existingWork[0].assignee_id), 'EXISTING_WORK_ASSIGNEE_ACTOR_UNAVAILABLE');
    await workActorPage.goto(decisionTarget, { waitUntil: 'domcontentloaded', timeout: 30000 });
    workPage = workActorPage;
  }
  workPage = workActorPage || page;
  const workRowsOpen = await restSelect(workPage, 'decision_work_items', { company_id: evidence.tenantA, decision_id: decisionId }, 'id,company_id,decision_id,recommendation_id,status,assignee_id,assignee_label,evidence_refs', { order: 'created_at.desc', limit: 1 });
  assert.equal(workRowsOpen.length, 1, 'DECISION_WORK_ITEM_DB_ROW_MISSING');
  const workItemId = String(workRowsOpen[0].id);
  assert.ok(String(workRowsOpen[0].assignee_id), 'WORK_ITEM_ASSIGNEE_MISSING');
  assert.equal(String(workRowsOpen[0].recommendation_id), String(decision.recommendation_id), 'WORK_RECOMMENDATION_LINK_MISSING');
  const workEvidenceRefs = Array.isArray(workRowsOpen[0].evidence_refs) ? workRowsOpen[0].evidence_refs : [];
  const sourceRef = workEvidenceRefs.find((ref) => ref && typeof ref === 'object' && ref.type === 'SOURCE_REPORT');
  assert.ok(sourceRef, 'WORK_SOURCE_REPORT_REF_MISSING');
  assert.equal(String(sourceRef.sourceHash), report.sourceHash, 'WORK_SOURCE_HASH_MISMATCH');
  assert.equal(String(sourceRef.reportExecutionJobId), report.reportJobId, 'WORK_REPORT_JOB_MISMATCH');
  assert.ok(String(sourceRef.evidenceSnapshotId || ''), 'WORK_EVIDENCE_SNAPSHOT_MISSING');
  const workStatusBefore = String(workRowsOpen[0].status);

  if (workStatusBefore === 'OPEN') {
    const startButton = workPage.locator('[data-testid="start-work-' + decisionId + '"]');
    await startButton.waitFor({ state: 'visible', timeout: 30000 });
    await startButton.click();
  }

  const workRowsInProgress = await restSelect(workPage, 'decision_work_items', { company_id: evidence.tenantA, id: workItemId }, 'id,status,decision_id,assignee_id', { limit: 1 });
  assert.equal(workRowsInProgress.length, 1, 'DECISION_WORK_ITEM_READBACK_AFTER_START_MISSING');

  if (workRowsInProgress[0].status === 'IN_PROGRESS') {
    const completeButton = workPage.locator('[data-testid="complete-work-' + decisionId + '"]');
    await completeButton.waitFor({ state: 'visible', timeout: 30000 });
    await completeButton.click();
  }

  const workRowsCompleted = await restSelect(workPage, 'decision_work_items', { company_id: evidence.tenantA, id: workItemId }, 'id,status,decision_id,assignee_id,actual_impact', { limit: 1 });
  assert.equal(workRowsCompleted.length, 1, 'DECISION_WORK_ITEM_READBACK_AFTER_COMPLETE_MISSING');
  assert.equal(workRowsCompleted[0].status, 'COMPLETED');

  const outcomeRows = await restSelect(page, 'recommendation_outcomes', { company_id: evidence.tenantA, decision_id: decisionId }, 'id,company_id,decision_id,status,outcome_quality,actual_impact,observed_at', { order: 'observed_at.desc', limit: 1 });
  assert.equal(outcomeRows.length, 1, 'DECISION_OUTCOME_DB_ROW_MISSING');
  const recommendationRows = await restSelect(page, 'recommendations', { company_id: evidence.tenantA, id: String(decision.recommendation_id) }, 'id,company_id,decision_id,evidence_snapshot_id', { limit: 1 });
  assert.equal(recommendationRows.length, 1, 'DECISION_RECOMMENDATION_READBACK_MISSING');
  assert.equal(String(recommendationRows[0].decision_id), decisionId);
  assert.ok(String(recommendationRows[0].evidence_snapshot_id), 'RECOMMENDATION_EVIDENCE_SNAPSHOT_MISSING');
  const decisionAfter = await restSelect(workPage, 'business_intelligence_decisions', { company_id: evidence.tenantA, id: decisionId }, 'id,company_id,status,approved_at,approved_by,recommendation_id', { limit: 1 });
  assert.equal(decisionAfter.length, 1, 'DECISION_FINAL_READBACK_MISSING');
  assert.equal(decisionAfter[0].status, 'EXECUTED');
  assert.equal(String(decisionAfter[0].recommendation_id), String(decision.recommendation_id));

  const decisionAudit = await restSelect(page, 'audit_logs', { company_id: evidence.tenantA, entity_id: decisionId }, 'id,entity_type,action,source', { order: 'created_at.desc', limit: 20 });
  const approvalAudit = await restSelect(page, 'audit_logs', { company_id: evidence.tenantA, entity_id: approvalId }, 'id,entity_type,action,source', { order: 'created_at.desc', limit: 20 });
  const workAudit = await restSelect(page, 'audit_logs', { company_id: evidence.tenantA, entity_id: workItemId }, 'id,entity_type,action,source', { order: 'created_at.desc', limit: 20 });
  const outcomeAudit = await restSelect(page, 'audit_logs', { company_id: evidence.tenantA, entity_id: String(outcomeRows[0].id) }, 'id,entity_type,action,source', { order: 'created_at.desc', limit: 20 });
  assert.ok(decisionAudit.length > 0, 'DECISION_AUDIT_READBACK_MISSING');
  assert.ok(approvalAudit.length > 0, 'APPROVAL_AUDIT_READBACK_MISSING');
  assert.ok(workAudit.length > 0, 'WORK_AUDIT_READBACK_MISSING');
  assert.ok(outcomeAudit.length > 0, 'OUTCOME_AUDIT_READBACK_MISSING');

  await workPage.screenshot({ path: reportDir + '/decision-approval-action-outcome.png', fullPage: true });
  evidence.steps.push({
    step: 'decision-approval-action-outcome',
    status: 'PASS',
    reportJobId: report.reportJobId,
    sourceHash: report.sourceHash,
    decisionId,
    recommendationId: String(decision.recommendation_id),
    approvalId,
    workItemId,
    approvalStatus: 'APPROVED',
    workStatus: String(workRowsCompleted[0].status),
    outcomeId: String(outcomeRows[0].id),
    outcomeStatus: String(outcomeRows[0].status ?? ''),
    finalDecisionStatus: String(decisionAfter[0].status),
    reusedPersistedDecision: false,
  });
  if (workActorContext) await workActorContext.close().catch(() => {});
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
  assert.notEqual(evidence.tenantA, REAL_SMART_REPORT_COMPANY_ID, 'SYNTHETIC_TENANT_A_MUST_NOT_EQUAL_CERTIFIED_REPORT_COMPANY');
  const syntheticCertifiedJobRead = await restSelect(
    pageA,
    'report_execution_jobs',
    { company_id: evidence.tenantA, id: REAL_SMART_REPORT_JOB_ID },
    'id,company_id,source_path,source_hash,status',
    { limit: 1 },
  );
  assert.equal(syntheticCertifiedJobRead.length, 0, 'SYNTHETIC_TENANT_A_MUST_NOT_READ_CERTIFIED_REPORT_JOB');
  evidence.steps.push({ step: 'tenant-A-authenticated-synthetic', status: 'PASS', tenantId: evidence.tenantA });
  evidence.steps.push({ step: 'tenant-A-certified-report-isolation', status: 'PASS', deniedJobId: REAL_SMART_REPORT_JOB_ID, certifiedCompanyId: REAL_SMART_REPORT_COMPANY_ID });

  await login(pageC, emailC, passwordC);
  evidence.tenantReal = await currentTenant(pageC);
  assert.equal(evidence.tenantReal, REAL_SMART_REPORT_COMPANY_ID, 'CERTIFIED_REPORT_ACTOR_MUST_RESOLVE_COMPANY_99');
  evidence.steps.push({ step: 'certified-report-tenant-authenticated', status: 'PASS', companyId: evidence.tenantReal, reportJobId: REAL_SMART_REPORT_JOB_ID });

  const currentReport = await readCurrentPersistedReport(pageC, evidence.tenantReal);
  assert.equal(currentReport.reportJobId, REAL_SMART_REPORT_JOB_ID, 'CERTIFIED_REPORT_JOB_ID_MISMATCH');
  assert.equal(currentReport.sourcePath, REAL_SMART_REPORT_SOURCE_PATH, 'CERTIFIED_REPORT_SOURCE_PATH_MISMATCH');
  assert.equal(currentReport.sourceHash, REAL_SMART_REPORT_SOURCE_HASH, 'CERTIFIED_REPORT_SOURCE_HASH_MISMATCH');
  assert.equal(currentReport.canonicalRows.length, REAL_SMART_REPORT_ROW_COUNT, 'CERTIFIED_REPORT_ROW_COUNT_MISMATCH');
  assert.equal(Number(currentReport.analysis.quality_score), 98, 'CERTIFIED_REPORT_QUALITY_MISMATCH');
  evidence.persisted.currentReport = { reportJobId: currentReport.reportJobId, companyId: evidence.tenantReal, sourcePath: REAL_SMART_REPORT_SOURCE_PATH, sourceHash: REAL_SMART_REPORT_SOURCE_HASH, sourceRowCount: REAL_SMART_REPORT_ROW_COUNT, authoritativeCanonicalCount: currentReport.canonicalRows.length, canonicalCommitCount: currentReport.commits.reduce((sum,row)=>sum+Number(row.committed_count||0),0), taskCount: currentReport.tasks.length, completedTaskCount: currentReport.tasks.filter(task=>task.status==='completed').length, importJobId: currentReport.importJob.id, fileRecordId: currentReport.fileRecord.id, qualityScore: Number(currentReport.rendered.qualityScore), trustState: currentReport.rendered.trustState, evidenceState: currentReport.rendered.evidenceStatus, checkpointStage: currentReport.job.checkpoint?.stage ?? null };
  evidence.steps.push({ step: 'certified-report-durable-proof', status: 'PASS', reportJobId: currentReport.reportJobId, companyId: evidence.tenantReal, sourceHash: REAL_SMART_REPORT_SOURCE_HASH, sourcePath: REAL_SMART_REPORT_SOURCE_PATH, jobStatus: currentReport.job.status, sourceRowCount: REAL_SMART_REPORT_ROW_COUNT, authoritativeCanonicalCount: currentReport.canonicalRows.length, qualityScore: Number(currentReport.rendered.qualityScore), evidenceState: currentReport.rendered.evidenceStatus });

  await proveCurrentSmartReport(pageC, currentReport);
  await proveReportsCenterRealSurface(pageC, currentReport);
  await proveSourceBoundSurface(pageC, currentReport, { label: 'executive', path: '/reports/executive' });
  await proveSourceBoundSurface(pageC, currentReport, { label: 'trust', path: '/trust' });
  await proveSourceBoundSurface(pageC, currentReport, { label: 'decision', path: '/decision-experience?stage=evidence' });
  await proveSourceBoundSurface(pageC, currentReport, { label: 'work', path: '/work-center' });
  await proveSourceBoundSurface(pageC, currentReport, { label: 'inventory', path: '/reports/inventory' });
  await pageC.goto(baseURL + '/reports/smart/' + currentReport.reportJobId, { waitUntil: 'networkidle', timeout: 30000 });
  await pageC.reload({ waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(await currentTenant(pageC), REAL_SMART_REPORT_COMPANY_ID, 'CERTIFIED_REPORT_TENANT_CHANGED_ACROSS_REFRESH');
  await pageC.getByText('EVIDENCE INSPECTOR', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const finalBody = (await pageC.locator('body').innerText()).trim();
  assertCurrentReportText(finalBody, 'certified report final readback');
  assert.ok(finalBody.includes('EVIDENCE INSPECTOR'));
  assert.ok(finalBody.includes(REAL_SMART_REPORT_JOB_ID), 'CERTIFIED_REPORT_JOB_ID_NOT_VISIBLE_IN_BROWSER');
  assert.ok(finalBody.includes(REAL_SMART_REPORT_SOURCE_HASH), 'CERTIFIED_REPORT_SOURCE_HASH_NOT_VISIBLE_IN_BROWSER');
  assert.ok(finalBody.includes(REAL_SMART_REPORT_SOURCE_PATH), 'CERTIFIED_REPORT_SOURCE_PATH_NOT_VISIBLE_IN_BROWSER');
  assert.equal(await pageC.locator('[data-testid="smart-report-job-id"]').count(), 1, 'CERTIFIED_REPORT_JOB_ID_DOM_PROOF_MISSING_OR_DUPLICATE');
  assert.equal(await pageC.locator('[data-testid="smart-report-source-hash"]').count(), 1, 'CERTIFIED_REPORT_SOURCE_HASH_DOM_PROOF_MISSING_OR_DUPLICATE');
  evidence.steps.push({ step: 'certified-report-final-refresh-readback', status: 'PASS', reportJobId: currentReport.reportJobId, companyId: evidence.tenantReal, sourcePath: REAL_SMART_REPORT_SOURCE_PATH, sourceHash: REAL_SMART_REPORT_SOURCE_HASH, rowCount: REAL_SMART_REPORT_ROW_COUNT, qualityScore: Number(currentReport.rendered.qualityScore) });

  await proveTransactionalMutationAndAudit(pageA);
  await pageA.goto(baseURL + '/operations', { waitUntil: 'networkidle', timeout: 30000 });
  await pageA.getByRole('heading', { name: 'مركز العمليات', exact: true }).waitFor({ state: 'visible', timeout: 30000 });
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
  assert.ok(await pageA.locator('[dir="rtl"]').count(), 'OPERATIONS_RTL_ROOT_MISSING');
  assert.ok(await pageA.getByRole('button', { name: 'تحديث' }).isVisible(), 'OPERATIONS_RETRY_ACTION_MISSING');
  const desktopOverflow = await pageA.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(desktopOverflow, false, 'OPERATIONS_DESKTOP_HORIZONTAL_OVERFLOW');

  await pageA.setViewportSize({ width: 390, height: 844 });
  await pageA.goto(baseURL + '/operations', { waitUntil: 'networkidle', timeout: 30000 });
  await pageA.getByRole('heading', { name: 'مركز العمليات', exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const mobileBody = (await pageA.locator('body').innerText()).trim();
  assert.ok(mobileBody.includes('AUDIT / TRACE'), 'OPERATIONS_MOBILE_AUDIT_TRACE_MISSING');
  assert.ok(await pageA.getByRole('button', { name: 'تحديث' }).isVisible(), 'OPERATIONS_MOBILE_RETRY_MISSING');
  const mobileOverflow = await pageA.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(mobileOverflow, false, 'OPERATIONS_MOBILE_HORIZONTAL_OVERFLOW');
  await pageA.screenshot({ path: reportDir + '/transactional-spine-mobile.png', fullPage: true });
  evidence.steps.push({
    step: 'transactional-spine-responsive-rtl',
    status: 'PASS',
    rtlRoot: true,
    desktopOverflow: false,
    mobileOverflow: false,
    retryAction: true,
  });

  await pageA.setViewportSize({ width: 1440, height: 1000 });
  const contextB = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
  const pageB = await contextB.newPage(); attachRuntimeCapture(pageB);
  try {
    await login(pageB, emailB, passwordB); evidence.tenantB = await currentTenant(pageB); assert.notEqual(evidence.tenantB, evidence.tenantA, 'TENANT_A_AND_B_MUST_BE_DISTINCT'); evidence.steps.push({ step: 'tenant-B-authenticated', status: 'PASS', tenantId: evidence.tenantB });
    assert.notEqual(evidence.tenantB, REAL_SMART_REPORT_COMPANY_ID, 'SYNTHETIC_TENANT_B_MUST_NOT_BE_CERTIFIED_REPORT_COMPANY');
    assert.notEqual(evidence.tenantA, evidence.tenantB, 'TENANT_A_AND_B_MUST_BE_DISTINCT');
    evidence.steps.push({
      step: 'synthetic-A-B-isolation',
      status: 'PASS',
      tenantA: evidence.tenantA,
      tenantB: evidence.tenantB,
      certifiedReportCompanyId: REAL_SMART_REPORT_COMPANY_ID,
      certifiedReportUsedOnlyBy: 'tenantReal',
    });
    await pageB.getByRole('button', { name: 'تسجيل الخروج' }).click(); await pageB.locator('#login-email').waitFor({ state: 'visible', timeout: 10000 }); evidence.steps.push({ step: 'tenant-B-logout', status: 'PASS' });
  } finally { await pageB.close(); await contextB.close(); }
  await pageA.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 }); const logoutA = pageA.getByRole('button', { name: 'تسجيل الخروج' }); assert.equal(await logoutA.count(), 1, 'TENANT_A_LOGOUT_CONTROL_MISSING'); await logoutA.click(); await pageA.locator('#login-email').waitFor({ state: 'visible', timeout: 10000 }); evidence.steps.push({ step: 'tenant-A-logout', status: 'PASS' });
  if (evidence.failures.length) throw new Error('BROWSER_RUNTIME_ERRORS:' + evidence.failures.join(' | '));
  const real48 = spawnSync(process.execPath, ['--experimental-strip-types', '--experimental-loader', './scripts/node-ts-extension-loader.mjs', 'scripts/real-48-archetype-proof.mjs'], { env: process.env, stdio: 'pipe', encoding: 'utf8' });
  evidence.steps.push({
    step: 'real-source-48-archetype-proof',
    status: real48.status === 0 ? 'PASS' : 'FAIL',
    outputTail: String(real48.stdout || '').slice(-6000),
    errorTail: String(real48.stderr || '').slice(-6000),
  });
  if (real48.status !== 0) throw new Error('REAL_48_ARCHETYPE_PROOF_FAILED');
  evidence.status = evidence.steps.some(step=>step.status!=='PASS') ? 'NOT_PROVEN' : 'PASS';
} catch (error) { evidence.status = error instanceof Error && /_MISSING$|NOT_PROVEN/.test(error.message) ? 'NOT_PROVEN' : 'FAIL'; evidence.error = error instanceof Error ? error.message : String(error); await pageA.screenshot({ path: reportDir + '/failure.png', fullPage: true }).catch(() => {}); }
finally {
  evidence.finishedAt = new Date().toISOString();
  await fs.writeFile(reportDir + '/result.json', JSON.stringify(evidence, null, 2));
  await pageC.close().catch(() => {});
  await contextC.close().catch(() => {});
  await browser.close();
}
console.log(JSON.stringify(evidence, null, 2)); process.exitCode = evidence.status === 'PASS' ? 0 : 1;
