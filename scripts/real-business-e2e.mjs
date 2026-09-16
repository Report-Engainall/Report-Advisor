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
function capture(page) {
  page.on('console', m => { if (m.type() === 'error') evidence.failures.push(`console:${m.text()}`); });
  page.on('pageerror', e => evidence.failures.push(`pageerror:${e.message}`));
  page.on('requestfailed', r => { const e = r.failure()?.errorText || 'unknown'; if (e !== 'net::ERR_ABORTED') evidence.failures.push(`request:${r.method()} ${r.url()} ${e}`); });
}
capture(pageA);
async function token(page) {
  return page.evaluate(() => { const raw = Object.entries(localStorage).find(([k]) => k.endsWith('-auth-token'))?.[1]; if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND'); const s = JSON.parse(raw); if (!s?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND'); return s.access_token; });
}
async function tenant(page) {
  const t = await token(page); const r = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: '{}' }); const b = await r.text(); assert.equal(r.ok, true, `current_company_id HTTP ${r.status}: ${b}`); return b.replaceAll('"', '').trim();
}
async function select(page, table, filters, fields) {
  const u = new URL(`${supabaseURL}/rest/v1/${table}`); u.searchParams.set('select', fields); for (const [k, v] of Object.entries(filters)) u.searchParams.set(k, `eq.${v}`); const r = await fetch(u, { headers: { apikey: anonKey, Authorization: `Bearer ${await token(page)}` } }); const b = await r.text(); assert.equal(r.ok, true, `${table} read HTTP ${r.status}: ${b}`); return b ? JSON.parse(b) : [];
}
async function update(page, table, id, payload) {
  const u = new URL(`${supabaseURL}/rest/v1/${table}`); u.searchParams.set('id', `eq.${id}`); const r = await fetch(u, { method: 'PATCH', headers: { apikey: anonKey, Authorization: `Bearer ${await token(page)}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) }); const b = await r.text(); assert.equal(r.ok, true, `${table} update HTTP ${r.status}: ${b}`); return b ? JSON.parse(b) : [];
}
async function login(page, email, password) {
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 }); await page.locator('#login-email').fill(email); await page.locator('#login-password').fill(password); await page.getByRole('button', { name: 'تسجيل الدخول' }).click(); await page.waitForTimeout(1200); assert.equal(await page.locator('#login-email').count(), 0, 'login form must disappear after auth');
}
function csv(fields) { return Buffer.from(`\ufeff${Object.keys(fields).join(',')}\n${Object.values(fields).map(v => String(v).replaceAll(',', ' ')).join(',')}\n`, 'utf8'); }
async function importOne(page, entity, fields, marker) {
  await page.goto(`${baseURL}/import`, { waitUntil: 'networkidle', timeout: 30000 }); const label = entity === 'customers' ? 'العملاء' : entity === 'products' ? 'المنتجات' : 'فواتير المبيعات'; await page.getByRole('button', { name: new RegExp(label) }).click(); await page.locator('input[type="file"]').first().setInputFiles({ name: `${marker}.csv`, mimeType: 'text/csv', buffer: csv(fields) }); await page.getByText('المراجعة', { exact: true }).waitFor({ state: 'visible', timeout: 30000 }); const commit = page.getByRole('button', { name: /اعتماد وكتابة/ }); await commit.waitFor({ state: 'visible', timeout: 30000 }); assert.equal(await commit.count(), 1); assert.equal(await commit.isEnabled(), true, `${entity} valid import must be enabled`); await commit.click();
  const resultStep = page.getByText('النتيجة', { exact: true }).locator('..');
  await resultStep.waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForFunction(() => { const el = [...document.querySelectorAll('[aria-label="مراحل الاستيراد"] div')].find(e => e.textContent?.trim() === 'النتيجة'); return !!el?.parentElement?.className.includes('border-success-200'); });
  assert.equal(await page.getByText(/فشل الاستيراد:/).count(), 0, `${entity} import must not return to failure state`);
  evidence.steps.push({ step: `import:${entity}`, status: 'PASS' });
}
async function searchUI(page, route, placeholder, value, step) { await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 30000 }); await page.getByPlaceholder(placeholder).fill(value); await page.waitForTimeout(300); await page.getByText(value, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 }); evidence.steps.push({ step, status: 'PASS', value }); }
try {
  await login(pageA, emailA, passwordA); evidence.tenantA = await tenant(pageA); evidence.steps.push({ step: 'tenant-A-resolution', status: 'PASS', tenantId: evidence.tenantA });
  const suffix = `${Date.now()}-${process.pid}`, customerCode = `E2E-C-${suffix}`, customerName = `E2E عميل ${suffix}`, sku = `E2E-SKU-${suffix}`, productName = `E2E منتج ${suffix}`, invoiceNumber = `E2E-INV-${suffix}`, invoiceDate = new Date().toISOString().slice(0, 10);
  await importOne(pageA, 'customers', { name: customerName, code: customerCode, phone: '777000000', email: `e2e-${suffix}@example.invalid`, segment: 'retail', credit_limit: 0, payment_terms_days: 0 }, `customer-${suffix}`);
  const customers = await select(pageA, 'customers', { company_id: evidence.tenantA, code: customerCode }, 'id,name,code,company_id'); assert.equal(customers.length, 1, 'customer persistence must produce exactly one row'); assert.equal(customers[0].company_id, evidence.tenantA); evidence.persisted.customer = customers[0]; await searchUI(pageA, '/customers', 'بحث عن عميل...', customerCode, 'customer-ui-readback');
  await importOne(pageA, 'products', { sku, name: productName, unit: 'قطعة', barcode: `E2E-BAR-${suffix}`, cost_price: 10, selling_price: 15, min_stock: 0, reorder_point: 0, is_active: true }, `product-${suffix}`);
  const products = await select(pageA, 'products', { company_id: evidence.tenantA, sku }, 'id,name,sku,company_id,selling_price'); assert.equal(products.length, 1, 'product persistence must produce exactly one row'); assert.equal(products[0].company_id, evidence.tenantA); assert.equal(Number(products[0].selling_price), 15); evidence.persisted.product = products[0]; await searchUI(pageA, '/products', 'بحث عن منتج...', sku, 'product-ui-readback');
  await importOne(pageA, 'sales_invoices', { invoice_number: invoiceNumber, invoice_date: invoiceDate, customer_id: customers[0].id, customer_name: customerName, subtotal: 15, tax_amount: 0, total: 15, paid_amount: 15, status: 'posted' }, `invoice-${suffix}`);
  const invoices = await select(pageA, 'sales_invoices', { company_id: evidence.tenantA, invoice_number: invoiceNumber }, 'id,company_id,invoice_number,customer_id,total,status'); assert.equal(invoices.length, 1, 'invoice persistence must produce exactly one row'); assert.equal(invoices[0].company_id, evidence.tenantA); assert.equal(invoices[0].customer_id, customers[0].id); assert.equal(Number(invoices[0].total), 15); evidence.persisted.invoice = invoices[0]; await pageA.goto(`${baseURL}/reports/sales`, { waitUntil: 'networkidle', timeout: 30000 }); await pageA.getByText(invoiceNumber, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 }); evidence.steps.push({ step: 'sales-report-readback', status: 'PASS' });
  const before = await tenant(pageA); await pageA.reload({ waitUntil: 'networkidle', timeout: 30000 }); assert.equal(await tenant(pageA), before); evidence.steps.push({ step: 'refresh-session-tenant', status: 'PASS' });
  const contextB = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' }), pageB = await contextB.newPage(); capture(pageB);
  try {
    await login(pageB, emailB, passwordB); evidence.tenantB = await tenant(pageB); assert.notEqual(evidence.tenantB, evidence.tenantA); evidence.steps.push({ step: 'tenant-B-resolution', status: 'PASS', tenantId: evidence.tenantB });
    for (const [table, filter] of [['customers', { company_id: evidence.tenantA, code: customerCode }], ['products', { company_id: evidence.tenantA, sku }], ['sales_invoices', { company_id: evidence.tenantA, invoice_number: invoiceNumber }]]) assert.equal((await select(pageB, table, filter, 'id,company_id')).length, 0, `Tenant B must not read Tenant A ${table}`);
    evidence.steps.push({ step: 'A-to-B-rest-read-isolation', status: 'PASS' });
    for (const [table, id, payload] of [['customers', customers[0].id, { name: customerName }], ['products', products[0].id, { name: productName }], ['sales_invoices', invoices[0].id, { status: invoices[0].status }]]) assert.equal((await update(pageB, table, id, payload)).length, 0, `Tenant B must not mutate Tenant A ${table}`);
    evidence.steps.push({ step: 'B-to-A-rest-mutation-isolation', status: 'PASS' });
    await pageB.goto(`${baseURL}/customers`, { waitUntil: 'networkidle', timeout: 30000 }); await pageB.getByPlaceholder('بحث عن عميل...').fill(customerCode); assert.equal(await pageB.getByText(customerCode, { exact: true }).count(), 0); await pageB.goto(`${baseURL}/products`, { waitUntil: 'networkidle', timeout: 30000 }); await pageB.getByPlaceholder('بحث عن منتج...').fill(sku); assert.equal(await pageB.getByText(sku, { exact: true }).count(), 0); evidence.steps.push({ step: 'A-to-B-ui-isolation', status: 'PASS' });
  } finally { await pageB.close(); await contextB.close(); }
  await pageA.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 }); await pageA.getByRole('button', { name: 'تسجيل الخروج' }).click(); await pageA.locator('#login-email').waitFor({ state: 'visible', timeout: 10000 }); evidence.steps.push({ step: 'logout-A', status: 'PASS' }); if (evidence.failures.length) throw new Error(`BROWSER_RUNTIME_ERRORS:${evidence.failures.join(' | ')}`); evidence.status = 'PASS';
} catch (error) { evidence.status = 'FAIL'; evidence.error = error instanceof Error ? error.message : String(error); await pageA.screenshot({ path: `${reportDir}/failure.png`, fullPage: true }).catch(() => {}); process.exitCode = 1; } finally { evidence.finishedAt = new Date().toISOString(); await fs.writeFile(`${reportDir}/result.json`, JSON.stringify(evidence, null, 2)); await browser.close(); }
console.log(JSON.stringify(evidence, null, 2));