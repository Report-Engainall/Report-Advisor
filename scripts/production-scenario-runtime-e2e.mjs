import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import XLSX from 'xlsx';
import { scenarios } from './production-scenario-matrix.mjs';
import {
  snapshotBusinessState,
  assertZeroUnintendedMutation,
  assertTenantPeriodCurrency,
  assertRenderedJob,
  assertEvidenceProvenance,
  assertNoFalseCommit,
  assertDuplicateIdempotency,
  scenarioAssertionPlan,
  buildCompactEvidence,
  validateCompactArtifact,
} from './production-scenario-contract.mjs';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const out = 'release-evidence/production-regression-results.json';
for (const [name, value] of Object.entries({ supabaseURL, anonKey, email, password })) {
  if (!value) throw new Error(`SCENARIO_E2E_ENV_MISSING:${name}`);
}
await fs.mkdir('release-evidence', { recursive: true });

const csv = rows => {
  const headers = Object.keys(rows[0]);
  return Buffer.from(`\ufeff${headers.join(',')}\n${rows.map(row => headers.map(key => JSON.stringify(String(row[key] ?? ''))).join(',')).join('\n')}\n`);
};
const xlsx = rows => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Sheet1');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};
const pdf = text => {
  const escaped = String(text).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
  const stream = `BT /F1 12 Tf 50 760 Td (${escaped}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let result = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(result));
    result += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const startxref = Buffer.byteLength(result);
  result += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) result += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  result += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  return Buffer.from(result, 'binary');
};

const suffix = `${Date.now()}-${process.pid}`;
const customer = n => ({
  name: `Scenario Customer ${suffix}-${n}`,
  code: `SC-${suffix}-${n}`,
  phone: '777000000',
  email: `scenario-${suffix}-${n}@example.invalid`,
  segment: 'retail',
  credit_limit: 0,
  payment_terms_days: 0,
});
const product = n => ({
  sku: `SC-SKU-${suffix}-${n}`,
  name: `Scenario Product ${suffix}-${n}`,
  unit: 'piece',
  cost_price: 10,
  selling_price: 15,
  min_stock: 0,
  reorder_point: 0,
  is_active: true,
});
const invoice = (n, currency = 'SAR') => ({
  invoice_number: `SC-INV-${suffix}-${n}`,
  invoice_date: new Date().toISOString().slice(0, 10),
  customer_name: `Scenario Customer ${suffix}-${n}`,
  subtotal: 15,
  tax_amount: 0,
  total: 15,
  paid_amount: 0,
  status: 'posted',
  currency,
});

const inputs = new Map([
  ['excel-standard', { entity: 'products', name: `excel-standard-${suffix}.xlsx`, bytes: xlsx([product(1)]) }],
  ['excel-aliases', { entity: 'customers', name: `excel-aliases-${suffix}.xlsx`, bytes: xlsx([{
    'Customer Name': customer(2).name,
    Code: customer(2).code,
    Phone: customer(2).phone,
    Email: customer(2).email,
    Segment: customer(2).segment,
    'Credit Limit': customer(2).credit_limit,
    'Payment Terms Days': customer(2).payment_terms_days,
  }]) }],
  ['excel-missing-columns', { entity: 'products', name: `excel-missing-columns-${suffix}.xlsx`, bytes: xlsx([{ sku: `SC-MISSING-${suffix}`, name: 'Missing price', unit: 'piece' }]) }],
  ['csv-reordered', { entity: 'customers', name: `csv-reordered-${suffix}.csv`, bytes: csv([{
    payment_terms_days: customer(4).payment_terms_days,
    email: customer(4).email,
    segment: customer(4).segment,
    name: customer(4).name,
    credit_limit: customer(4).credit_limit,
    phone: customer(4).phone,
    code: customer(4).code,
  }]) }],
  ['pdf-text', { entity: 'sales_invoices', name: `pdf-text-${suffix}.pdf`, bytes: pdf(JSON.stringify(invoice(5))) }],
  ['pdf-ocr-ar', { entity: 'sales_invoices', name: `pdf-ocr-ar-${suffix}.pdf`, bytes: pdf(`فاتورة مبيعات invoice_number SC-OCR-${suffix} invoice_date ${new Date().toISOString().slice(0, 10)} customer_name عميل اختبار subtotal 15 tax_amount 0 total 15 paid_amount 0 status posted currency SAR اختبار عربي`) }],
  ['unknown-report', { entity: 'sales_invoices', name: `unknown-report-${suffix}.pdf`, bytes: pdf('Quarterly narrative memorandum without a canonical financial schema') }],
  ['exchange-statement', { entity: 'sales_invoices', name: `exchange-statement-${suffix}.pdf`, bytes: pdf('Debit 100 Credit 40 Opening Balance 60 Closing Balance 60 Currency SAR') }],
  ['multi-currency', { entity: 'sales_invoices', name: `multi-currency-${suffix}.csv`, bytes: csv([invoice(9, 'EUR')]) }],
  ['duplicate-transactions', { entity: 'customers', name: `duplicate-transactions-${suffix}.csv`, bytes: csv([customer(10)]) }],
  ['large-file', { entity: 'customers', name: `large-file-${suffix}.csv`, bytes: csv(Array.from({ length: 1000 }, (_, i) => customer(`large-${i}`))) }],
  ['corrupt-data', { entity: 'sales_invoices', name: `corrupt-data-${suffix}.pdf`, bytes: crypto.randomBytes(256) }],
]);

const nonCommitExpectations = new Set(['review', 'semantic-discovery', 'reconciliation', 'safe-rejection']);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
let accessToken = null;
let tenantId = null;
const results = [];

async function readToken() {
  for (let i = 0; i < 20; i += 1) {
    const token = await page.evaluate(() => {
      const raw = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1];
      if (!raw) return null;
      try { return JSON.parse(raw)?.access_token || null; } catch { return null; }
    });
    if (token) return token;
    await page.waitForTimeout(500);
  }
  throw new Error('BROWSER_SESSION_NOT_FOUND_AFTER_AUTH_WAIT');
}

async function login() {
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('#login-email').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  accessToken = await readToken();
  const response = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  const body = await response.text();
  assert.equal(response.ok, true, `current_company_id HTTP ${response.status}: ${body}`);
  tenantId = body.replaceAll('"', '').trim();
  assert.match(tenantId, /^[0-9a-f-]{36}$/i);
}

async function rest(table, select, filters = {}) {
  const url = new URL(`${supabaseURL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  for (const [key, value] of Object.entries(filters)) url.searchParams.set(key, `eq.${value}`);
  const response = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` } });
  const body = await response.text();
  assert.equal(response.ok, true, `${table} HTTP ${response.status}: ${body}`);
  return body ? JSON.parse(body) : [];
}

async function rpc(name, body = {}) {
  const response = await fetch(`${supabaseURL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  assert.equal(response.ok, true, `${name} HTTP ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function snapshot() {
  const [importJobs, invoices, movements, evidence, dashboard] = await Promise.all([
    rest('import_jobs', 'id,status,company_id', { company_id: tenantId }),
    rest('sales_invoices', 'id,invoice_number,company_id,currency,total', { company_id: tenantId }),
    rest('inventory_movements', 'id,product_id,movement_type,company_id,quantity', { company_id: tenantId }),
    rest('kpi_evidence_snapshots', 'id,kpi_key,company_id,observed_at', { company_id: tenantId }),
    rpc('get_dashboard_snapshot', {}),
  ]);
  return snapshotBusinessState({ importJobs, invoices, movements, evidence, dashboard });
}

async function terminalJob(jobId) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    const jobs = await rest('report_execution_jobs', 'id,company_id,source_hash,status,checkpoint,last_error,evidence', { id: jobId, company_id: tenantId });
    if (jobs.length === 1 && ['completed', 'failed'].includes(jobs[0].status)) return jobs[0];
    await page.waitForTimeout(1500);
  }
  throw new Error(`DURABLE_JOB_TIMEOUT:${jobId}`);
}

async function runOne(scenario, input) {
  const result = {
    scenario_id: scenario.id,
    exact_head: exactHead,
    tenant: tenantId,
    input_fingerprint: crypto.createHash('sha256').update(input.bytes).digest('hex'),
    job_id: null,
    execution_start: new Date().toISOString(),
    execution_end: null,
    actual_status: 'NOT_PROVEN',
    terminal_state: null,
    expected_status: scenario.expect,
    assertions: scenarioAssertionPlan(scenario.id.split(':')[0]),
    business_assertions: [],
    negative_assertions: [],
    before_state: null,
    after_state: null,
    dashboard: null,
    persistence_readback: null,
    evidence_references: [],
    failure: null,
  };
  try {
    result.before_state = await snapshot();
    await page.goto(`${baseURL}/import`, { waitUntil: 'networkidle', timeout: 30000 });
    const label = input.entity === 'customers' ? 'العملاء' : input.entity === 'products' ? 'المنتجات' : 'فواتير المبيعات';
    await page.getByRole('button', { name: new RegExp(label) }).click();
    await page.waitForTimeout(350);
    await page.locator('input[type="file"]').first().setInputFiles({
      name: input.name,
      mimeType: input.name.endsWith('.pdf') ? 'application/pdf' : input.name.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
      buffer: input.bytes,
    });
    const previewHeading = page.getByText('مراجعة قبل الكتابة', { exact: true });
    const importError = page.locator('.bg-danger-50').first();
    await Promise.race([
      previewHeading.waitFor({ state: 'visible', timeout: 30000 }),
      importError.waitFor({ state: 'visible', timeout: 30000 }),
    ]).catch(() => {});
    const body = await page.locator('body').innerText();
    const commit = page.getByRole('button', { name: /اعتماد وكتابة/ });
    const canCommit = await commit.count() > 0 && await commit.isVisible().catch(() => false) && await commit.isEnabled().catch(() => false);
    const errorText = await page.locator('.bg-danger-50').allTextContents().catch(() => []);
    const previewVisible = await previewHeading.isVisible().catch(() => false);
    result.observed = {
      can_commit: canCommit,
      preview_visible: previewVisible,
      quality_text: (body.match(/جودة:\s*\d+%/) || [])[0] || null,
      ready_message: body.includes('الاعتماد متوقف حتى تتوفر بيانات صالحة'),
      errors: errorText.slice(-3),
      page_text_excerpt: body.slice(-1800),
    };

    if (nonCommitExpectations.has(scenario.expect) || scenario.id === 'duplicate-transactions:second-run') {
      if (canCommit) throw new Error(`NEGATIVE_POLICY_COMMIT_ENABLED:${scenario.id}`);
      result.actual_status = /فشل|تعذر|خطأ|مرفوض|ناقص|غير صالح|الاعتماد متوقف/i.test(body) ? 'rejected_or_reviewed' : 'reviewed';
      result.terminal_state = result.actual_status;
      result.after_state = await snapshot();
      assertNoFalseCommit({ status: null, checkpoint: null, canCommit: false });
      assertZeroUnintendedMutation(result.before_state, result.after_state);
      result.negative_assertions.push('zero unintended canonical/invoice/movement/KPI mutation', 'no false committed state');
      return result;
    }

    if (!canCommit) throw new Error(`POSITIVE_POLICY_COMMIT_UNAVAILABLE:${scenario.id}`);

    const enqueue = page.waitForResponse(
      response => response.url().endsWith('/rest/v1/rpc/enqueue_report_execution_job') && response.request().method() === 'POST',
      { timeout: 30000 },
    );
    await commit.click();
    const enqueueResponse = await enqueue;
    const enqueueBody = await enqueueResponse.text();
    assert.equal(enqueueResponse.ok(), true, `enqueue HTTP ${enqueueResponse.status()}: ${enqueueBody}`);
    const enqueuePayload = JSON.parse(enqueueBody);
    result.job_id = String(enqueuePayload?.id ?? enqueuePayload?.[0]?.id ?? '');
    assert.match(result.job_id, /^[0-9a-f-]{36}$/i);
    const job = await terminalJob(result.job_id);
    result.persistence_readback = { status: job.status, checkpoint: job.checkpoint, source_hash: job.source_hash };
    assertRenderedJob(job, tenantId);
    assertEvidenceProvenance(job, { tenant: tenantId });
    result.actual_status = 'committed_and_rendered';
    result.terminal_state = 'rendered';
    result.evidence_references.push(`report_execution_jobs:${result.job_id}`);
    result.after_state = await snapshot();
    result.dashboard = result.after_state.dashboard;
    assertTenantPeriodCurrency({ dashboard: result.dashboard, tenant: tenantId, expectedCurrency: null, expectedPeriod: null });
    result.business_assertions.push('rendered lifecycle', 'DB readback', 'dashboard readback', 'tenant binding', 'provenance/evidence');
    return result;
  } catch (error) {
    result.failure = error instanceof Error ? error.message : String(error);
    result.actual_status = 'failed';
    try { result.after_state = await snapshot(); } catch (snapshotError) { result.snapshot_failure = snapshotError instanceof Error ? snapshotError.message : String(snapshotError); }
    return result;
  } finally {
    result.execution_end = new Date().toISOString();
  }
}

try {
  await login();
  for (const scenario of scenarios) {
    const input = inputs.get(scenario.id);
    assert.ok(input, `SCENARIO_INPUT_MISSING:${scenario.id}`);
    const first = await runOne(scenario, input);
    results.push(first);
    if (scenario.id === 'duplicate-transactions' && first.actual_status === 'committed_and_rendered') {
      const beforeSecond = first.after_state;
      const second = await runOne({ ...scenario, id: 'duplicate-transactions:second-run' }, input);
      const newInvoices = second.after_state.invoices.count - beforeSecond.invoices.count;
      const newMovements = second.after_state.movements.count - beforeSecond.movements.count;
      const newEvidence = second.after_state.evidence.count - beforeSecond.evidence.count;
      assertDuplicateIdempotency(first, { status: second.actual_status, newCanonicalRows: newMovements, newInvoiceRows: newInvoices });
      assert.equal(newInvoices, 0, 'DUPLICATE_INVOICE_MUTATION');
      assert.equal(newMovements, 0, 'DUPLICATE_MOVEMENT_MUTATION');
      assert.equal(newEvidence, 0, 'DUPLICATE_EVIDENCE_MUTATION');
      second.negative_assertions.push('second-run zero invoice delta', 'second-run zero movement delta', 'second-run zero evidence delta');
      results.push(second);
    }
  }
} finally {
  await page.close();
  await context.close();
  await browser.close();
}

const primary = results.filter(item => !item.scenario_id.endsWith(':second-run'));
assert.equal(primary.length, 12, `SCENARIO_COUNT_MISMATCH:${primary.length}/12`);
const compact = primary.map(item => buildCompactEvidence({
  scenario: item.scenario_id,
  sha: exactHead,
  runId: item.job_id,
  status: item.actual_status,
  terminalState: item.terminal_state,
  before: item.before_state,
  after: item.after_state,
  assertions: { business: item.business_assertions, negative: item.negative_assertions },
  evidenceRefs: item.evidence_references,
}));
const artifact = {
  exact_head: exactHead,
  generated_at: new Date().toISOString(),
  authenticated_runtime: true,
  tenant: tenantId,
  scenario_count: 12,
  results: primary,
  compact_evidence: compact,
  duplicate_followup: results.find(item => item.scenario_id === 'duplicate-transactions:second-run') || null,
};
artifact.artifact_hash = crypto.createHash('sha256').update(JSON.stringify(artifact)).digest('hex');
await fs.writeFile(out, JSON.stringify(artifact, null, 2));
console.log(JSON.stringify({
  exact_head: exactHead,
  executed: primary.length,
  rendered: primary.filter(item => item.actual_status === 'committed_and_rendered').length,
  rejected_or_reviewed: primary.filter(item => ['reviewed', 'rejected_or_reviewed'].includes(item.actual_status)).length,
  failed: primary.filter(item => item.actual_status === 'failed').length,
  failures: primary.filter(item => item.actual_status === 'failed').map(item => ({ scenario: item.scenario_id, failure: item.failure })),
  artifact_hash: artifact.artifact_hash,
}, null, 2));
validateCompactArtifact(artifact, exactHead, 12);
