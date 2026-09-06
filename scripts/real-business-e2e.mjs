import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const emailB = process.env.TEST_USER_B_EMAIL?.trim();
const passwordB = process.env.TEST_USER_B_PASSWORD;
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e-business';
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';

for (const [name, value] of Object.entries({ E2E_BASE_URL: baseURL, REPORT_ADVISOR_SUPABASE_URL: supabaseURL, REPORT_ADVISOR_SUPABASE_ANON_KEY: anonKey, TEST_USER_A_EMAIL: email, TEST_USER_A_PASSWORD: password, TEST_USER_B_EMAIL: emailB, TEST_USER_B_PASSWORD: passwordB })) {
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

async function accessToken(targetPage = page) {
  return targetPage.evaluate(() => {
    const entry = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1];
    if (!entry) throw new Error('BROWSER_SESSION_NOT_FOUND');
    const session = JSON.parse(entry);
    if (!session?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND');
    return session.access_token;
  });
}
async function currentTenant(targetPage = page) {
  const token = await accessToken(targetPage);
  const response = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' });
  const body = await response.text();
  assert.equal(response.ok, true, `current_company_id HTTP ${response.status}: ${body}`);
  const value = body.replaceAll('"', '').trim();
  assert.ok(value, 'current_company_id must return a tenant');
  return value;
}
async function restSelect(targetPage, table, filters, select) {
  const token = await accessToken(targetPage);
  const url = new URL(`${supabaseURL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  for (const [column, value] of Object.entries(filters)) url.searchParams.set(column, `eq.${value}`);
  const response = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  const body = await response.text();
  assert.equal(response.ok, true, `${table} read HTTP ${response.status}: ${body}`);
  return body ? JSON.parse(body) : [];
}
async function restAttemptUpdate(targetPage, table, id, payload) {
  const token = await accessToken(targetPage);
  const url = new URL(`${supabaseURL}/rest/v1/${table}`);
  url.searchParams.set('id', `eq.${id}`);
  const response = await fetch(url, { method: 'PATCH', headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) });
  const body = await response.text();
  assert.equal(response.ok, true, `${table} cross-tenant update HTTP ${response.status}: ${body}`);
  return body ? JSON.parse(body) : [];
}
async function login(targetPage, targetEmail, targetPassword) {
  await targetPage.goto(`${baseURL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await targetPage.locator('#login-email').fill(targetEmail);
  await targetPage.locator('#login-password').fill(targetPassword);
  await targetPage.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await targetPage.waitForTimeout(1200);
  assert.equal(await targetPage.locator('#login-email').count(), 0, 'login form must disappear after authentication');
  assert.equal(await targetPage.getByText('حدث خطأ غير متوقع').count(), 0, 'application error boundary must not render after login');
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
  await login(page, email, password);
  const companyId = await currentTenant(page);
  evidence.tenantId = companyId;
  evidence.steps.push({ step: 'tenant-resolution-A', status: 'PASS', tenantId: companyId });
  const suffix = `${Date.now()}-${process.pid}`;
  const customerName = `E2E عميل ${suffix}`;
  const customerCode = `E2E-C-${suffix}`;
  const productName = `E2E منتج ${suffix}`;
  const sku = `E2E-SKU-${suffix}`;
  const invoiceNumber = `E2E-INV-${suffix}`;
  const today = new Date().toISOString().slice(0, 10);

  await importOne('customers', { name: customerName, code: customerCode, phone: '777000000', email: `e2e-${suffix}@example.invalid`, segment: 'regular', credit_limit: 100000, payment_terms_days: 30 }, `customer-${suffix}`);
  const customers = await restSelect(page, 'customers', { company_id: companyId, code: customerCode }, 'id,name,code,company_id');
  assert.equal(customers.length, 1, 'customer import must persist exactly one tenant-scoped row');
  assert.equal(customers[0].name, customerName); assert.equal(customers[0].company_id, companyId);
  evidence.persisted.customer = customers[0];
  await uiReadBack('/customers', 'بحث عن عميل...', customerCode, 'customer');

  await importOne('products', { sku, name: productName, unit: 'قطعة', cost_price: 10, selling_price: 15, min_stock: 1, reorder_point: 2, is_active: true }, `product-${suffix}`);
  const products = await restSelect(page, 'products', { company_id: companyId, sku }, 'id,name,sku,company_id,selling_price');
  assert.equal(products.length, 1, 'product import must persist exactly one tenant-scoped row');
  assert.equal(products[0].name, productName); assert.equal(Number(products[0].selling_price), 15); assert.equal(products[0].company_id, companyId);
  evidence.persisted.product = products[0];
  await uiReadBack('/products', 'بحث عن منتج...', sku, 'product');

  await importOne('sales_invoices', { invoice_number: invoiceNumber, invoice_date: today, customer_id: customers[0].id, customer_name: customerName, subtotal: 15, tax_amount: 0, total: 15, paid_amount: 0, status: 'posted' }, `invoice-${suffix}`);
  const invoices = await restSelect(page, 'sales_invoices', { company_id: companyId, invoice_number: invoiceNumber }, 'id,company_id,invoice_number,customer_id,total,status');
  assert.equal(invoices.length, 1, 'invoice import must persist exactly one tenant-scoped row');
  assert.equal(invoices[0].customer_id, customers[0].id); assert.equal(Number(invoices[0].total), 15); assert.equal(invoices[0].company_id, companyId);
  evidence.persisted.invoice = invoices[0];
  await page.goto(`${baseURL}/reports/sales`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.getByText(invoiceNumber, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 });
  evidence.steps.push({ step: 'sales-report-readback', status: 'PASS', invoiceNumber });

  const tenantBeforeRefresh = await currentTenant(page);
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(await currentTenant(page), tenantBeforeRefresh, 'tenant context must survive browser refresh');
  evidence.steps.push({ step: 'refresh-session-and-tenant', status: 'PASS', tenantId: tenantBeforeRefresh });

  const contextB = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
  const pageB = await contextB.newPage();
  try {
    await login(pageB, emailB, passwordB);
    const tenantB = await currentTenant(pageB);
    evidence.tenantBId = tenantB;
    assert.notEqual(tenantB, companyId, 'Tenant A and Tenant B must resolve to distinct tenants');
    evidence.steps.push({ step: 'tenant-resolution-B', status: 'PASS', tenantId: tenantB });

    const customerSeenByB = await restSelect(pageB, 'customers', { company_id: companyId, code: customerCode }, 'id,company_id,code');
    const productSeenByB = await restSelect(pageB, 'products', { company_id: companyId, sku }, 'id,company_id,sku');
    const invoiceSeenByB = await restSelect(pageB, 'sales_invoices', { company_id: companyId, invoice_number: invoiceNumber }, 'id,company_id,invoice_number');
    assert.equal(customerSeenByB.length, 0, 'Tenant B must not read Tenant A customer');
    assert.equal(productSeenByB.length, 0, 'Tenant B must not read Tenant A product');
    assert.equal(invoiceSeenByB.length, 0, 'Tenant B must not read Tenant A invoice');
    evidence.steps.push({ step: 'tenant-isolation-A-to-B-read', status: 'PASS' });

    const customerMutation = await restAttemptUpdate(pageB, 'customers', customers[0].id, { name: customerName });
    const productMutation = await restAttemptUpdate(pageB, 'products', products[0].id, { name: productName });
    const invoiceMutation = await restAttemptUpdate(pageB, 'sales_invoices', invoices[0].id, { status: invoices[0].status });
    assert.equal(customerMutation.length, 0, 'Tenant B must not update Tenant A customer');
    assert.equal(productMutation.length, 0, 'Tenant B must not update Tenant A product');
    assert.equal(invoiceMutation.length, 0, 'Tenant B must not update Tenant A invoice');
    evidence.steps.push({ step: 'tenant-isolation-B-to-A-mutation', status: 'PASS' });

    await pageB.goto(`${baseURL}/customers`, { waitUntil: 'networkidle', timeout: 30000 });
    await pageB.getByPlaceholder('بحث عن عميل...').fill(customerCode);
    assert.equal(await pageB.getByText(customerCode, { exact: true }).count(), 0, 'Tenant B UI must not expose Tenant A customer');
    await pageB.goto(`${baseURL}/products`, { waitUntil: 'networkidle', timeout: 30000 });
    await pageB.getByPlaceholder('بحث عن منتج...').fill(sku);
    assert.equal(await pageB.getByText(sku, { exact: true }).count(), 0, 'Tenant B UI must not expose Tenant A product');
    evidence.steps.push({ step: 'tenant-isolation-A-to-B-ui', status: 'PASS' });
  } finally {
    await pageB.close();
    await contextB.close();
  }

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
