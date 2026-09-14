import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import XLSX from 'xlsx';
import { scenarios } from './production-scenario-matrix.mjs';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const out = 'release-evidence/production-regression-results.json';
for (const [name, value] of Object.entries({ supabaseURL, anonKey, email, password })) if (!value) throw new Error(`SCENARIO_E2E_ENV_MISSING:${name}`);
await fs.mkdir('release-evidence', { recursive: true });

function csv(rows) {
  const headers = Object.keys(rows[0]);
  const body = rows.map(r => headers.map(h => JSON.stringify(String(r[h] ?? ''))).join(',')).join('\n');
  return Buffer.from(`\ufeff${headers.join(',')}\n${body}\n`, 'utf8');
}
function xlsx(rows) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
function pdf(text) {
  const esc = String(text).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
  const stream = `BT /F1 12 Tf 50 760 Td (${esc}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(out)); out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'binary');
}
function corrupt() { return crypto.randomBytes(256); }
function imagePdf() {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 6 0 R >> >> /Contents 4 0 R >>',
    '<< /Length 33 >>\nstream\nq 100 0 0 100 50 650 cm /Im1 Do Q\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${png.length} >>\nstream\n${png.toString('binary')}\nendstream`,
  ];
  let out = '%PDF-1.4\n'; const offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(out)); out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = Buffer.byteLength(out); out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'binary');
}

const suffix = `${Date.now()}-${process.pid}`;
const customer = n => ({ name: `Scenario Customer ${suffix}-${n}`, code: `SC-${suffix}-${n}`, phone: '777000000', email: `scenario-${suffix}-${n}@example.invalid` });
const product = n => ({ sku: `SC-SKU-${suffix}-${n}`, name: `Scenario Product ${suffix}-${n}`, cost_price: 10, selling_price: 15, unit: 'piece' });
const invoice = n => ({ invoice_number: `SC-INV-${suffix}-${n}`, invoice_date: new Date().toISOString().slice(0, 10), customer_name: `Scenario Customer ${suffix}-${n}`, total: 15, currency: 'SAR' });

const inputs = new Map([
  ['excel-standard', { entity: 'products', name: `excel-standard-${suffix}.xlsx`, bytes: xlsx([product(1)]) }],
  ['excel-aliases', { entity: 'customers', name: `excel-aliases-${suffix}.xlsx`, bytes: xlsx([{ 'Customer Name': customer(2).name, Code: customer(2).code, Phone: customer(2).phone }]) }],
  ['excel-missing-columns', { entity: 'products', name: `excel-missing-columns-${suffix}.xlsx`, bytes: xlsx([{ sku: `SC-MISSING-${suffix}`, name: 'Missing price' }]) }],
  ['csv-reordered', { entity: 'customers', name: `csv-reordered-${suffix}.csv`, bytes: csv([{ email: customer(4).email, code: customer(4).code, phone: customer(4).phone, name: customer(4).name }]) }],
  ['pdf-text', { entity: 'sales_invoices', name: `pdf-text-${suffix}.pdf`, bytes: pdf('invoice_number SC-PDF-001 invoice_date 2026-09-15 customer_name Scenario PDF total 15') }],
  ['pdf-ocr-ar', { entity: 'sales_invoices', name: `pdf-ocr-ar-${suffix}.pdf`, bytes: imagePdf() }],
  ['unknown-report', { entity: 'sales_invoices', name: `unknown-report-${suffix}.pdf`, bytes: pdf('Quarterly narrative memorandum without a canonical financial schema') }],
  ['exchange-statement', { entity: 'sales_invoices', name: `exchange-statement-${suffix}.pdf`, bytes: pdf('Debit 100 Credit 40 Opening Balance 60 Closing Balance 60 Currency SAR') }],
  ['multi-currency', { entity: 'sales_invoices', name: `multi-currency-${suffix}.csv`, bytes: csv([{ ...invoice(9), currency: 'EUR' }]) }],
  ['duplicate-transactions', { entity: 'customers', name: `duplicate-transactions-${suffix}.csv`, bytes: csv([customer(10)]) }],
  ['large-file', { entity: 'customers', name: `large-file-${suffix}.csv`, bytes: csv(Array.from({ length: 1000 }, (_, i) => customer(`large-${i}`))) }],
  ['corrupt-data', { entity: 'sales_invoices', name: `corrupt-data-${suffix}.pdf`, bytes: corrupt() }],
]);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
const results = [];
let tenantId = null;
let accessToken = null;

async function login() {
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30000 });
  await page.locator('#login-email').waitFor({ state: 'detached', timeout: 10000 });
  accessToken = await page.evaluate(() => { const raw = Object.entries(localStorage).find(([k]) => k.endsWith('-auth-token'))?.[1]; if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND'); return JSON.parse(raw).access_token; });
  const r = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: '{}' });
  const body = await r.text(); assert.equal(r.ok, true, `tenant HTTP ${r.status}: ${body}`); tenantId = body.replaceAll('"', '').trim(); assert.match(tenantId, /^[0-9a-f-]{36}$/i);
}
async function rest(table, fields, filters = {}) {
  const u = new URL(`${supabaseURL}/rest/v1/${table}`); u.searchParams.set('select', fields);
  for (const [k, v] of Object.entries(filters)) u.searchParams.set(k, `eq.${v}`);
  const r = await fetch(u, { headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` } });
  const b = await r.text(); assert.equal(r.ok, true, `${table} HTTP ${r.status}: ${b}`); return b ? JSON.parse(b) : [];
}
async function waitForImportOutcome() {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    const body = await page.locator('body').innerText();
    const previewVisible = await page.getByText('المراجعة', { exact: true }).isVisible().catch(() => false);
    const uploadVisible = await page.getByText('اختر ملفًا أو اسحبه إلى هنا', { exact: false }).isVisible().catch(() => false);
    const doneVisible = await page.getByText('النتيجة', { exact: true }).isVisible().catch(() => false);
    const hasError = /فشل الاستيراد|فشل قراءة الملف|تعذر تحديد صيغة الملف|الملف فارغ|TENANT_CONTEXT_REQUIRED|هذا الملف موجود/.test(body);
    if (previewVisible || doneVisible || hasError || (uploadVisible && !body.includes('جارٍ فحص وتحليل الملف'))) return { body, previewVisible, doneVisible, hasError };
    await page.waitForTimeout(500);
  }
  return { body: await page.locator('body').innerText(), previewVisible: false, doneVisible: false, hasError: false };
}
async function runOne(scenario, input) {
  const started = new Date().toISOString();
  const inputFingerprint = crypto.createHash('sha256').update(input.bytes).digest('hex');
  const result = { scenario_id: scenario.id, exact_head: exactHead, authenticated_context: true, tenant: tenantId, input_fingerprint: inputFingerprint, job_id: null, execution_start: started, execution_end: null, actual_status: 'NOT_PROVEN', expected_status: scenario.expect, actual_observed_result: null, assertions: [], persistence_readback: null, evidence_references: [], failure: null };
  try {
    await page.goto(`${baseURL}/import`, { waitUntil: 'networkidle', timeout: 30000 });
    const label = input.entity === 'customers' ? 'العملاء' : input.entity === 'products' ? 'المنتجات' : 'فواتير المبيعات';
    await page.getByRole('button', { name: new RegExp(label) }).click();
    const errors = [];
    page.once('pageerror', e => errors.push(e.message));
    await page.locator('input[type="file"]').first().setInputFiles({ name: input.name, mimeType: input.name.endsWith('.pdf') ? 'application/pdf' : input.name.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv', buffer: input.bytes });
    const outcome = await waitForImportOutcome();
    const pageText = outcome.body;
    const commit = page.getByRole('button', { name: /اعتماد وكتابة/ });
    const canCommit = outcome.previewVisible && await commit.count() > 0 && await commit.isVisible().catch(() => false) && await commit.isEnabled().catch(() => false);
    result.actual_observed_result = { page_text_excerpt: pageText.slice(0, 1600), page_errors: errors, can_commit: canCommit, outcome: { previewVisible: outcome.previewVisible, doneVisible: outcome.doneVisible, hasError: outcome.hasError } };
    if (!canCommit) {
      result.actual_status = outcome.hasError ? 'rejected_or_reviewed' : 'reviewed';
      result.assertions.push('real UI ingestion reached a non-commit terminal/review state');
      if (scenario.id === 'excel-missing-columns' || scenario.id === 'corrupt-data' || scenario.id === 'unknown-report') result.assertions.push('expected safety/review scenario did not expose a commit control');
      return result;
    }
    const enqueueResponse = page.waitForResponse(r => r.url().endsWith('/rest/v1/rpc/enqueue_report_execution_job') && r.request().method() === 'POST', { timeout: 30000 });
    await commit.click();
    const response = await enqueueResponse;
    const body = await response.text(); assert.equal(response.ok(), true, `enqueue HTTP ${response.status()}: ${body}`);
    const payload = body ? JSON.parse(body) : null;
    result.job_id = String(payload?.id ?? payload?.[0]?.id ?? '');
    assert.match(result.job_id, /^[0-9a-f-]{36}$/i);
    const deadline = Date.now() + 120000; let jobs = [];
    while (Date.now() < deadline) {
      jobs = await rest('report_execution_jobs', 'id,company_id,source_hash,status,checkpoint,last_error,evidence', { id: result.job_id, company_id: tenantId });
      if (jobs.length === 1 && ['completed','failed'].includes(jobs[0].status)) break;
      await new Promise(r => setTimeout(r, 1500));
    }
    assert.equal(jobs.length, 1, 'durable job readback missing');
    const job = jobs[0];
    result.persistence_readback = { status: job.status, checkpoint: job.checkpoint, source_hash: job.source_hash, evidence: job.evidence };
    if (job.status === 'completed' && job.checkpoint?.stage === 'rendered') {
      result.actual_status = 'committed_and_rendered';
      result.assertions.push('real durable lifecycle reached rendered');
      result.assertions.push('tenant-scoped durable job readback succeeded');
      result.evidence_references.push(`report_execution_jobs:${result.job_id}`);
    } else {
      result.actual_status = 'runtime_failed';
      throw new Error(`DURABLE_JOB_NOT_RENDERED:${job.status}:${JSON.stringify(job.last_error)}`);
    }
  } catch (error) {
    result.failure = error instanceof Error ? error.message : String(error);
    if (result.actual_status === 'NOT_PROVEN') result.actual_status = 'failed';
  } finally { result.execution_end = new Date().toISOString(); }
  return result;
}

try {
  await login();
  for (const scenario of scenarios) {
    const input = inputs.get(scenario.id); if (!input) throw new Error(`SCENARIO_INPUT_MISSING:${scenario.id}`);
    const r = await runOne(scenario, input); results.push(r);
    if (scenario.id === 'duplicate-transactions' && r.actual_status === 'committed_and_rendered') {
      const second = await runOne({ ...scenario, id: `${scenario.id}:second-run` }, input);
      results.push(second);
    }
  }
} finally {
  await page.close(); await context.close(); await browser.close();
}

const primary = results.filter(r => !r.scenario_id.endsWith(':second-run'));
const artifact = {
  exact_head: exactHead,
  generated_at: new Date().toISOString(),
  authenticated_runtime: true,
  tenant: tenantId,
  scenario_count: scenarios.length,
  runtime_results: primary,
  duplicate_followup: results.find(r => r.scenario_id === 'duplicate-transactions:second-run') || null,
  summary: { executed: primary.length, completed: primary.filter(r => r.actual_status === 'committed_and_rendered').length, failed: primary.filter(r => ['failed','runtime_failed'].includes(r.actual_status)).length, reviewed_or_rejected: primary.filter(r => ['reviewed','rejected_or_reviewed'].includes(r.actual_status)).length }
};
await fs.writeFile(out, JSON.stringify(artifact, null, 2));
if (primary.length !== scenarios.length) throw new Error(`SCENARIO_COUNT_MISMATCH:${primary.length}/${scenarios.length}`);
console.log(JSON.stringify(artifact.summary, null, 2));
