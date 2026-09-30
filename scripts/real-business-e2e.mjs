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
    beforeRefreshText.includes('بانتظار الدليل') || beforeRefreshText.includes('Pending Evidence'),
    'Smart Report must expose pending evidence state'
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

async function uiSearch(page, route, placeholder, value, step) { await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 30000 }); const input = page.getByPlaceholder(placeholder); await input.fill(value); await page.waitForTimeout(300); await page.getByText(value, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 }); evidence.steps.push({ step, status: 'PASS', value }); }
try {
  await login(pageA, emailA, passwordA);
  evidence.tenantA = await currentTenant(pageA);
  evidence.steps.push({ step: 'tenant-A-resolution', status: 'PASS', tenantId: evidence.tenantA });

  const suffix = `${Date.now()}-${process.pid}`;
  const customerName = `E2E عميل ${suffix}`;
  const customerNumber = `E2E-CUST-${suffix}`;
  const customerPhone = `+967770${String(Date.now()).slice(-6)}`;
  const customerEmail = `e2e-${suffix}@example.invalid`;
  const sku = `E2E-SKU-${suffix}`;
  const productName = `E2E منتج ${suffix}`;
  const invoiceNumber = `E2E-INV-${suffix}`;
  const invoiceDate = new Date().toISOString().slice(0, 10);

  await importOne(pageA, 'customer-source', {
    name: customerName,
    code: customerNumber,
    phone: customerPhone,
    email: customerEmail,
    segment: 'retail',
    credit_limit: 0,
    payment_terms_days: 0,
  }, `customer-${suffix}`);

  await importOne(pageA, 'product-source', {
    sku,
    name: productName,
    unit: 'قطعة',
    cost_price: 10,
    selling_price: 15,
    min_stock: 0,
    reorder_point: 0,
    is_active: true,
  }, `product-${suffix}`);

  const salesImport = await importOne(pageA, 'sales-source', {
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    customer_name: customerName,
    subtotal: 15,
    tax_amount: 0,
    total: 15,
    paid_amount: 15,
    status: 'posted',
  }, `invoice-${suffix}`);

  await proveSmartReportAndEvidence(pageA, evidence.tenantA, salesImport, 'sales-source');

  const tenantBeforeRefresh = await currentTenant(pageA);
  await pageA.reload({ waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(await currentTenant(pageA), tenantBeforeRefresh, 'tenant context must survive refresh');
  evidence.steps.push({ step: 'refresh-session-tenant', status: 'PASS' });

  const contextB = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
  const pageB = await contextB.newPage();
  attachRuntimeCapture(pageB);
  try {
    await login(pageB, emailB, passwordB);
    evidence.tenantB = await currentTenant(pageB);
    assert.notEqual(evidence.tenantB, evidence.tenantA, 'A and B must resolve distinct tenants');
    evidence.steps.push({ step: 'tenant-B-resolution', status: 'PASS', tenantId: evidence.tenantB });

    for (const [label, persisted] of Object.entries(evidence.persisted)) {
      const rows = await restSelect(
        pageB,
        'canonical_dataset_records',
        { company_id: evidence.tenantA, id: persisted.canonical.id },
        'id,company_id,import_job_id',
      );
      assert.equal(rows.length, 0, `Tenant B must not read Tenant A canonical ${label} source row`);
    }
    evidence.steps.push({ step: 'A-to-B-canonical-read-isolation', status: 'PASS' });

    await pageB.goto(`${baseURL}/import`, { waitUntil: 'networkidle', timeout: 30000 });
    for (const persisted of Object.values(evidence.persisted)) {
      const marker = String(persisted.job?.result_summary?.file_name || '');
      if (marker) assert.equal(await pageB.getByText(marker, { exact: true }).count(), 0, 'Tenant B UI must not show Tenant A source history');
    }
    evidence.steps.push({ step: 'A-to-B-ui-import-history-isolation', status: 'PASS' });

    const logoutB = pageB.getByRole('button', { name: 'تسجيل الخروج' });
    assert.equal(await logoutB.count(), 1, 'Tenant B logout control must exist');
    await logoutB.click();
    await pageB.locator('#login-email').waitFor({ state: 'visible', timeout: 10000 });
    evidence.steps.push({ step: 'logout-B', status: 'PASS' });
  } finally {
    await pageB.close();
    await contextB.close();
  }

  await pageA.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  const logoutA = pageA.getByRole('button', { name: 'تسجيل الخروج' });
  assert.equal(await logoutA.count(), 1, 'Tenant A logout control must exist');
  await logoutA.click();
  await pageA.locator('#login-email').waitFor({ state: 'visible', timeout: 10000 });
  evidence.steps.push({ step: 'logout-A', status: 'PASS' });

if (evidence.failures.length) throw new Error(`BROWSER_RUNTIME_ERRORS:${evidence.failures.join(' | ')}`); evidence.status = 'PASS'; } catch (error) { evidence.status = 'FAIL'; evidence.error = error instanceof Error ? error.message : String(error); await pageA.screenshot({ path: `${reportDir}/failure.png`, fullPage: true }).catch(() => {}); process.exitCode = 1; } finally { evidence.finishedAt = new Date().toISOString(); await fs.writeFile(`${reportDir}/result.json`, JSON.stringify(evidence, null, 2)); await browser.close(); }
console.log(JSON.stringify(evidence, null, 2));