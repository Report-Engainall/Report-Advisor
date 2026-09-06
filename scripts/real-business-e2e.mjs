import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e-business';
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';

for (const [name, value] of Object.entries({ E2E_BASE_URL: baseURL, REPORT_ADVISOR_SUPABASE_URL: supabaseURL, REPORT_ADVISOR_SUPABASE_ANON_KEY: anonKey, TEST_USER_A_EMAIL: email, TEST_USER_A_PASSWORD: password })) {
  if (!value) throw new Error(`BUSINESS_E2E_ENV_MISSING:${name}`);
}
await fs.mkdir(reportDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
const evidence = { exactHead, startedAt: new Date().toISOString(), actor: 'Tenant A', status: 'NOT_PROVEN', steps: [], persisted: {}, failures: [] };
page.on('console', msg => { if (msg.type() === 'error') evidence.failures.push(`console:${msg.text()}`); });
page.on('pageerror', error => evidence.failures.push(`pageerror:${error.message}`));
page.on('requestfailed', request => evidence.failures.push(`request:${request.method()} ${request.url()} ${request.failure()?.errorText || 'unknown'}`));

async function accessToken() {
  return page.evaluate(() => {
    const entry = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1];
    if (!entry) throw new Error('BROWSER_SESSION_NOT_FOUND');
    const session = JSON.parse(entry);
    if (!session?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND');
    return session.access_token;
  });
}
async function currentTenant() {
  const token = await accessToken();
  const response = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' });
  const body = await response.text();
  assert.equal(response.ok, true, `current_company_id HTTP ${response.status}: ${body}`);
  const value = body.replaceAll('"', '').trim();
  assert.ok(value, 'current_company_id must return a tenant');
  return value;
}
async function restSelect(table, filters, select) {
  const token = await accessToken();
  const url = new URL(`${supabaseURL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  for (const [column, value] of Object.entries(filters)) url.searchParams.set(column, `eq.${value}`);
  const response = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  const body = await response.text();
  assert.equal(response.ok, true, `${table} read HTTP ${response.status}: ${body}`);
  return body ? JSON.parse(body) : [];
}
async function login() {
  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('#login-email').count(), 0, 'login form must disappear after authentication');
  assert.equal(await page.getByText('حدث خطأ غير متوقع').count(), 0, 'application error boundary must not render after login');
  evidence.steps.push({ step: 'login', status: 'PASS' });
}
async function importOne(entity, fields, marker) {
  await page.goto(`${baseURL}/import`, { waitUntil: 'networkidle', timeout: 30000 });
  const label = entity === 'customers' ? 'العملاء' : entity === 'products' ? 'المنتجات' : 'فواتير المبيعات';
  await page.getByRole('button', { name: new RegExp(label) }).click();
  const headers = Object.keys(fields);
  const values = Object.values(fields).map(value => String(value).replaceAll(',', ' '));
  const csv = `\ufeff${headers.join(',')}\n${values.join(',')}\n`;
  await page.locator('input[type="file"]').first().setInputFiles({ name: `${marker}.csv`, mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') });
  await page.getByText('معاينة البيانات').waitFor({ state: 'visible', timeout: 30000 });
  const commit = page.getByRole('button', { name: /تأكيد الاستيراد/ });
  assert.equal(await commit.isEnabled(), true, `${entity} valid import must be committable`);
  await commit.click();
  await page.getByText('تم الاستيراد بنجاح').waitFor({ state: 'visible', timeout: 30000 });
  evidence.steps.push({ step: `import:${entity}`, status: 'PASS', marker });
}
async function uiReadBack(route, placeholder, value, marker) {
  await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.getByPlaceholder(placeholder).fill(value);
  await page.waitForTimeout(250);
  await page.getByText(value, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 });
  evidence.steps.push({ step: `ui-readback:${marker}`, status: 'PASS', value });
}

try {
  await login();
  const companyId = await currentTenant();
  evidence.tenantId = companyId;
  evidence.steps.push({ step: 'tenant-resolution', status: 'PASS', tenantId: companyId });
  const suffix = `${Date.now()}-${process.pid}`;
  const customerName = `E2E عميل ${suffix}`;
  const customerCode = `E2E-C-${suffix}`;
  const productName = `E2E منتج ${suffix}`;
  const sku = `E2E-SKU-${suffix}`;
  const invoiceNumber = `E2E-INV-${suffix}`;
  const today = new Date().toISOString().slice(0, 10);

  await importOne('customers', { name: customerName, code: customerCode, phone: '777000000', email: `e2e-${suffix}@example.invalid`, segment: 'regular', credit_limit: 100000, payment_terms_days: 30 }, `customer-${suffix}`);
  const customers = await restSelect('customers', { company_id: companyId, code: customerCode }, 'id,name,code,company_id');
  assert.equal(customers.length, 1, 'customer import must persist exactly one tenant-scoped row');
  assert.equal(customers[0].name, customerName); assert.equal(customers[0].company_id, companyId);
  evidence.persisted.customer = customers[0];
  await uiReadBack('/customers', 'بحث عن عميل...', customerCode, 'customer');

  await importOne('products', { sku, name: productName, unit: 'قطعة', cost_price: 10, selling_price: 15, min_stock: 1, reorder_point: 2, is_active: true }, `product-${suffix}`);
  const products = await restSelect('products', { company_id: companyId, sku }, 'id,name,sku,company_id,selling_price');
  assert.equal(products.length, 1, 'product import must persist exactly one tenant-scoped row');
  assert.equal(products[0].name, productName); assert.equal(Number(products[0].selling_price), 15); assert.equal(products[0].company_id, companyId);
  evidence.persisted.product = products[0];
  await uiReadBack('/products', 'بحث عن منتج...', sku, 'product');

  await importOne('sales_invoices', { invoice_number: invoiceNumber, invoice_date: today, customer_id: customers[0].id, customer_name: customerName, subtotal: 15, tax_amount: 0, total: 15, paid_amount: 0, status: 'posted' }, `invoice-${suffix}`);
  const invoices = await restSelect('sales_invoices', { company_id: companyId, invoice_number: invoiceNumber }, 'id,company_id,invoice_number,customer_id,total,status');
  assert.equal(invoices.length, 1, 'invoice import must persist exactly one tenant-scoped row');
  assert.equal(invoices[0].customer_id, customers[0].id); assert.equal(Number(invoices[0].total), 15); assert.equal(invoices[0].company_id, companyId);
  evidence.persisted.invoice = invoices[0];

  await page.goto(`${baseURL}/reports/sales`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.getByText(invoiceNumber, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 });
  evidence.steps.push({ step: 'sales-report-readback', status: 'PASS', invoiceNumber });

  const tenantBeforeRefresh = await currentTenant();
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(await currentTenant(), tenantBeforeRefresh, 'tenant context must survive browser refresh');
  evidence.steps.push({ step: 'refresh-session-and-tenant', status: 'PASS', tenantId: tenantBeforeRefresh });

  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  await page.locator('#login-email').waitFor({ state: 'visible', timeout: 10000 });
  evidence.steps.push({ step: 'logout', status: 'PASS' });

  if (evidence.failures.length) throw new Error(`BROWSER_RUNTIME_ERRORS:${evidence.failures.join(' | ')}`);
  evidence.status = 'PASS';
} catch (error) {
  evidence.status = 'FAIL'; evidence.error = error instanceof Error ? error.message : String(error);
  await page.screenshot({ path: `${reportDir}/failure.png`, fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  evidence.finishedAt = new Date().toISOString();
  await fs.writeFile(`${reportDir}/result.json`, JSON.stringify(evidence, null, 2));
  await browser.close();
}
console.log(JSON.stringify(evidence, null, 2));
