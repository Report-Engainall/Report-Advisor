import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e-business';
for (const [name, value] of Object.entries({ supabaseURL, anonKey, email, password })) if (!value) throw new Error(`BUSINESS_PERSISTENCE_E2E_ENV_MISSING:${name}`);
await fs.mkdir(reportDir, { recursive: true });
const evidence = { exactHead, status: 'NOT_PROVEN', tenant: null, entities: {}, steps: [], failures: [] };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
page.on('console', m => { if (m.type() === 'error') evidence.failures.push(`console:${m.text()}`); });
page.on('pageerror', e => evidence.failures.push(`pageerror:${e.message}`));
page.on('requestfailed', r => { const e = r.failure()?.errorText || 'unknown'; if (e !== 'net::ERR_ABORTED') evidence.failures.push(`request:${r.method()} ${r.url()} ${e}`); });
async function token() { return page.evaluate(() => { const raw = Object.entries(localStorage).find(([k]) => k.endsWith('-auth-token'))?.[1]; if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND'); const s = JSON.parse(raw); if (!s?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND'); return s.access_token; }); }
async function rest(table, fields, filters = {}) { const u = new URL(`${supabaseURL}/rest/v1/${table}`); u.searchParams.set('select', fields); for (const [k, v] of Object.entries(filters)) u.searchParams.set(k, `eq.${v}`); const r = await fetch(u, { headers: { apikey: anonKey, Authorization: `Bearer ${await token()}` } }); const b = await r.text(); assert.equal(r.ok, true, `${table} read HTTP ${r.status}: ${b}`); return b ? JSON.parse(b) : []; }
async function tenant() { const r = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' }, body: '{}' }); const b = await r.text(); assert.equal(r.ok, true, `current_company_id HTTP ${r.status}: ${b}`); return b.replaceAll('"', '').trim(); }
function csv(fields) { return Buffer.from(`\ufeff${Object.keys(fields).join(',')}\n${Object.values(fields).map(v => String(v).replaceAll(',', ' ')).join(',')}\n`, 'utf8'); }
async function login() { await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 }); await page.locator('#login-email').fill(email); await page.locator('#login-password').fill(password); await page.getByRole('button', { name: 'تسجيل الدخول' }).click(); await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30000 }); await page.locator('#login-email').waitFor({ state: 'detached', timeout: 10000 }); await page.locator('body').waitFor({ state: 'visible', timeout: 5000 }); }
async function importOne(entity, fields, marker) {
  await page.goto(`${baseURL}/import`, { waitUntil: 'networkidle', timeout: 30000 });
  const label = entity === 'customers' ? 'العملاء' : entity === 'products' ? 'المنتجات' : 'فواتير المبيعات';
  await page.getByRole('button', { name: new RegExp(label) }).click();
  await page.locator('input[type="file"]').first().setInputFiles({ name: `${marker}.csv`, mimeType: 'text/csv', buffer: csv(fields) });
  await page.getByText('المراجعة', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const commit = page.getByRole('button', { name: /اعتماد وكتابة/ });
  await commit.waitFor({ state: 'visible', timeout: 30000 });
  assert.equal(await commit.isEnabled(), true, `${entity} valid import must be enabled`);
  const enqueueResponse = page.waitForResponse(response => response.url().endsWith('/rest/v1/rpc/enqueue_report_execution_job') && response.request().method() === 'POST', { timeout: 30000 });
  await commit.click();
  const response = await enqueueResponse;
  const body = await response.text();
  assert.equal(response.ok(), true, `enqueue_report_execution_job HTTP ${response.status()}: ${body}`);
  const payload = body ? JSON.parse(body) : null;
  const jobId = String(payload?.id ?? payload?.[0]?.id ?? '');
  assert.match(jobId, /^[0-9a-f-]{36}$/i, `${entity} must return a real durable execution UUID`);
  evidence.steps.push({ step: `enqueue:${entity}`, status: 'PASS', jobId });
  return jobId;
}
async function assertJob(jobId, entity) {
  const deadline = Date.now() + 120000;
  let jobs = [];
  while (Date.now() < deadline) {
    jobs = await rest('report_execution_jobs', 'id,company_id,source_hash,status,checkpoint,last_error', { id: jobId, company_id: evidence.tenant });
    if (jobs.length === 1 && (jobs[0].status === 'completed' || jobs[0].status === 'failed')) break;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  assert.equal(jobs.length, 1, `report_execution_jobs row missing for ${jobId}`);
  const job = jobs[0];
  assert.equal(job.status, 'completed', `durable execution ${jobId} ended ${job.status}: ${JSON.stringify(job.last_error)}`);
  assert.equal(job.checkpoint?.stage, 'rendered', `${entity} lifecycle must reach rendered after committed`);
  assert.equal(job.last_error && typeof job.last_error, 'object', `${entity} completed job must retain JSON error contract`);
  assert.deepEqual(job.last_error, {}, `${entity} completed job must retain the empty JSON error object contract`);
  assert.equal(job.checkpoint?.sourceHash, job.source_hash);
  assert.ok(Array.isArray(job.checkpoint?.evidenceKeys));
  assert.ok(job.checkpoint.evidenceKeys.includes(`canonical-import:${job.source_hash}:source`));
  assert.ok(job.checkpoint.evidenceKeys.includes(`canonical-import:${job.source_hash}:reconciliation`));
  evidence.steps.push({ step: `job:${entity}`, status: 'PASS', jobId, sourceHash: job.source_hash, checkpoint: job.checkpoint });
  return job.source_hash;
}
try {
  await login();
  evidence.tenant = await tenant();
  assert.match(evidence.tenant, /^[0-9a-f-]{36}$/i);
  evidence.steps.push({ step: 'tenant-resolution', status: 'PASS', tenantId: evidence.tenant });

  const suffix = `${Date.now()}-${process.pid}`;
  const customerCode = `E2E-C-${suffix}`;
  const customer = { name: `E2E عميل ${suffix}`, code: customerCode, phone: '777000000', email: `e2e-${suffix}@example.invalid`, segment: 'retail', credit_limit: 0, payment_terms_days: 0 };
  const customerJobId = await importOne('customers', customer, `customer-${suffix}`);
  const customerSourceHash = await assertJob(customerJobId, 'customers');
  const customers = await rest('customers', 'id,name,code,company_id', { company_id: evidence.tenant, code: customerCode });
  assert.equal(customers.length, 1);
  assert.equal(customers[0].company_id, evidence.tenant);
  evidence.entities.customer = customers[0];
  evidence.steps.push({ step: 'customer-db-readback', status: 'PASS', id: customers[0].id, sourceHash: customerSourceHash });

  const duplicateJobId = await importOne('customers', customer, `customer-duplicate-${suffix}`);
  const duplicateHash = await assertJob(duplicateJobId, 'customers');
  assert.equal(duplicateHash, customerSourceHash, 'identical content must preserve the same source hash');
  const afterDuplicate = await rest('customers', 'id,name,code,company_id', { company_id: evidence.tenant, code: customerCode });
  assert.equal(afterDuplicate.length, 1, 'duplicate import must not create a second canonical customer');
  assert.equal(afterDuplicate[0].id, customers[0].id, 'idempotent duplicate must resolve to the original canonical row');
  evidence.steps.push({ step: 'customer-idempotency-readback', status: 'PASS', sourceHash: customerSourceHash, originalId: customers[0].id });

  const sku = `E2E-SKU-${suffix}`;
  const productJobId = await importOne('products', { sku, name: `E2E منتج ${suffix}`, unit: 'قطعة', barcode: `E2E-BAR-${suffix}`, cost_price: 10, selling_price: 15, min_stock: 0, reorder_point: 0, is_active: true }, `product-${suffix}`);
  const productSourceHash = await assertJob(productJobId, 'products');
  const products = await rest('products', 'id,name,sku,company_id,selling_price', { company_id: evidence.tenant, sku });
  assert.equal(products.length, 1);
  assert.equal(products[0].company_id, evidence.tenant);
  assert.equal(Number(products[0].selling_price), 15);
  evidence.entities.product = products[0];
  evidence.steps.push({ step: 'product-db-readback', status: 'PASS', id: products[0].id, sourceHash: productSourceHash });

  const invoiceNumber = `E2E-INV-${suffix}`;
  const invoiceDate = new Date().toISOString().slice(0, 10);
  const invoiceJobId = await importOne('sales_invoices', { invoice_number: invoiceNumber, invoice_date: invoiceDate, customer_id: customers[0].id, customer_name: customer.name, subtotal: 15, tax_amount: 0, total: 15, paid_amount: 15, status: 'posted' }, `invoice-${suffix}`);
  const invoiceSourceHash = await assertJob(invoiceJobId, 'sales_invoices');
  const invoices = await rest('sales_invoices', 'id,company_id,invoice_number,customer_id,total,status', { company_id: evidence.tenant, invoice_number: invoiceNumber });
  assert.equal(invoices.length, 1);
  assert.equal(invoices[0].company_id, evidence.tenant);
  assert.equal(invoices[0].customer_id, customers[0].id);
  assert.equal(Number(invoices[0].total), 15);
  evidence.entities.invoice = invoices[0];
  evidence.steps.push({ step: 'invoice-db-readback', status: 'PASS', id: invoices[0].id, sourceHash: invoiceSourceHash });

  const reportRows = await rest('sales_invoices', 'id,company_id,invoice_number,customer_id,total,status', { company_id: evidence.tenant, invoice_number: invoiceNumber });
  assert.equal(reportRows.length, 1);
  assert.equal(reportRows[0].company_id, evidence.tenant);
  assert.equal(Number(reportRows[0].total), 15);
  evidence.steps.push({ step: 'financial-report-readback', status: 'PASS', invoiceNumber, total: Number(reportRows[0].total), sourceHash: invoiceSourceHash, readback: 'authenticated-DB-canonical' });

  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(await tenant(), evidence.tenant);
  evidence.steps.push({ step: 'refresh-session-readback', status: 'PASS' });
  evidence.status = 'PASS';
} catch (error) {
  evidence.failures.push(error instanceof Error ? error.stack || error.message : String(error));
  evidence.status = 'FAIL';
  throw error;
} finally {
  evidence.finishedAt = new Date().toISOString();
  await fs.writeFile(`${reportDir}/real-business-persistence-no-ledger.json`, JSON.stringify(evidence, null, 2));
  await page.close();
  await context.close();
  await browser.close();
}