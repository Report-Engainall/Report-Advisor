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

for (const [name, value] of Object.entries({ supabaseURL, anonKey, emailA, passwordA, emailB, passwordB })) {
  if (!value) throw new Error(`BUSINESS_E2E_ENV_MISSING:${name}`);
}

await fs.mkdir(reportDir, { recursive: true });

const evidence = {
  exactHead,
  baseURL,
  browser: 'Chromium',
  startedAt: new Date().toISOString(),
  status: 'NOT_PROVEN',
  tenantA: null,
  tenantB: null,
  persisted: {},
  steps: [],
  failures: [],
};

const browser = await chromium.launch({ headless: true });
const contextA = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const pageA = await contextA.newPage();

function attachRuntimeCapture(page) {
  page.on('console', msg => {
    if (msg.type() === 'error') evidence.failures.push(`console:${msg.text()}`);
  });
  page.on('pageerror', error => evidence.failures.push(`pageerror:${error.message}`));
  page.on('requestfailed', request => evidence.failures.push(`request:${request.method()} ${request.url()} ${request.failure()?.errorText || 'unknown'}`));
}

attachRuntimeCapture(pageA);

async function accessToken(page) {
  return page.evaluate(() => {
    const candidates = Object.entries(localStorage).filter(([key]) => key.endsWith('-auth-token'));
    const raw = candidates.find(([_, value]) => {
      try {
        const parsed = JSON.parse(value);
        return Boolean(parsed?.access_token);
      } catch {
        return false;
      }
    })?.[1];
    if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND');
    const session = JSON.parse(raw);
    if (!session?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND');
    return session.access_token;
  });
}

async function currentTenant(page) {
  const token = await accessToken(page);
  const response = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  const body = await response.text();
  assert.equal(response.ok, true, `current_company_id HTTP ${response.status}: ${body}`);
  const tenantId = body.replaceAll('"', '').trim();
  assert.ok(tenantId, 'current_company_id must resolve a tenant');
  return tenantId;
}

async function restSelect(page, table, filters, select) {
  const token = await accessToken(page);
  const url = new URL(`${supabaseURL}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  for (const [column, value] of Object.entries(filters)) url.searchParams.set(column, `eq.${value}`);
  const response = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
  const body = await response.text();
  assert.equal(response.ok, true, `${table} read HTTP ${response.status}: ${body}`);
  return body ? JSON.parse(body) : [];
}

async function restUpdate(page, table, id, payload) {
  const token = await accessToken(page);
  const url = new URL(`${supabaseURL}/rest/v1/${table}`);
  url.searchParams.set('id', `eq.${id}`);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  if (response.status === 401 || response.status === 403) {
    return { rows: [], status: response.status, body, denied: true };
  }
  assert.equal(response.ok, true, `${table} cross-tenant update HTTP ${response.status}: ${body}`);
  const rows = body ? JSON.parse(body) : [];
  assert.equal(Array.isArray(rows), true, `${table} cross-tenant update must return a row array`);
  return { rows, status: response.status, body, denied: false };
}

async function login(page, email, password) {
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('#login-email').count(), 0, 'login form must disappear after auth');
  assert.equal(await page.getByText('حدث خطأ غير متوقع').count(), 0, 'application error boundary must not render');
}

function csvBuffer(fields) {
  const headers = Object.keys(fields);
  const values = Object.values(fields).map(value => String(value).replaceAll(',', ' '));
  return Buffer.from(`\ufeff${headers.join(',')}\n${values.join(',')}\n`, 'utf8');
}

async function importOne(page, entity, fields, marker) {
  await page.goto(`${baseURL}/import`, { waitUntil: 'networkidle', timeout: 30000 });
  const label = entity === 'customers' ? 'العملاء' : entity === 'products' ? 'المنتجات' : 'فواتير المبيعات';
  await page.getByRole('button', { name: new RegExp(label) }).click();
  await page.locator('input[type="file"]').first().setInputFiles({ name: `${marker}.csv`, mimeType: 'text/csv', buffer: csvBuffer(fields) });
  await page.getByText('معاينة البيانات').waitFor({ state: 'visible', timeout: 30000 });
  const commit = page.getByRole('button', { name: /تأكيد الاستيراد/ });
  assert.equal(await commit.isEnabled(), true, `${entity} valid import must be enabled`);
  await commit.click();
  await page.getByText('تم الاستيراد بنجاح').waitFor({ state: 'visible', timeout: 30000 });
  evidence.steps.push({ step: `import:${entity}`, status: 'PASS' });
}

async function uiSearch(page, route, placeholder, value, step) {
  await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
  const input = page.getByPlaceholder(placeholder);
  await input.fill(value);
  await page.waitForTimeout(300);
  await page.getByText(value, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 });
  evidence.steps.push({ step, status: 'PASS', value });
}

try {
  await login(pageA, emailA, passwordA);
  evidence.tenantA = await currentTenant(pageA);
  evidence.steps.push({ step: 'tenant-A-resolution', status: 'PASS', tenantId: evidence.tenantA });

  const suffix = `${Date.now()}-${process.pid}`;
  const customerCode = `E2E-C-${suffix}`;
  const customerName = `E2E عميل ${suffix}`;
  const sku = `E2E-SKU-${suffix}`;
  const productName = `E2E منتج ${suffix}`;
  const invoiceNumber = `E2E-INV-${suffix}`;
  const invoiceDate = new Date().toISOString().slice(0, 10);

  await importOne(pageA, 'customers', {
    name: customerName,
    code: customerCode,
    phone: '777000000',
    email: `e2e-${suffix}@example.invalid`,
    segment: 'regular',
    credit_limit: 100000,
    payment_terms_days: 30,
  }, `customer-${suffix}`);
  const customers = await restSelect(pageA, 'customers', { company_id: evidence.tenantA, code: customerCode }, 'id,name,code,company_id');
  assert.equal(customers.length, 1, 'customer persistence must produce exactly one row');
  assert.equal(customers[0].company_id, evidence.tenantA);
  evidence.persisted.customer = customers[0];
  await uiSearch(pageA, '/customers', 'بحث عن عميل...', customerCode, 'customer-ui-readback');

  await importOne(pageA, 'products', {
    sku,
    name: productName,
    unit: 'قطعة',
    cost_price: 10,
    selling_price: 15,
    min_stock: 1,
    reorder_point: 2,
    is_active: true,
  }, `product-${suffix}`);
  const products = await restSelect(pageA, 'products', { company_id: evidence.tenantA, sku }, 'id,name,sku,company_id,selling_price');
  assert.equal(products.length, 1, 'product persistence must produce exactly one row');
  assert.equal(products[0].company_id, evidence.tenantA);
  assert.equal(Number(products[0].selling_price), 15);
  evidence.persisted.product = products[0];
  await uiSearch(pageA, '/products', 'بحث عن منتج...', sku, 'product-ui-readback');

  await importOne(pageA, 'sales_invoices', {
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    customer_id: customers[0].id,
    customer_name: customerName,
    subtotal: 15,
    tax_amount: 0,
    total: 15,
    paid_amount: 0,
    status: 'posted',
  }, `invoice-${suffix}`);
  const invoices = await restSelect(pageA, 'sales_invoices', { company_id: evidence.tenantA, invoice_number: invoiceNumber }, 'id,company_id,invoice_number,customer_id,total,status');
  assert.equal(invoices.length, 1, 'invoice persistence must produce exactly one row');
  assert.equal(invoices[0].company_id, evidence.tenantA);
  assert.equal(invoices[0].customer_id, customers[0].id);
  assert.equal(Number(invoices[0].total), 15);
  evidence.persisted.invoice = invoices[0];
  await pageA.goto(`${baseURL}/reports/sales`, { waitUntil: 'networkidle', timeout: 30000 });
  await pageA.getByText(invoiceNumber, { exact: true }).first().waitFor({ state: 'visible', timeout: 10000 });
  evidence.steps.push({ step: 'sales-report-readback', status: 'PASS' });

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

    for (const [table, filter, label] of [
      ['customers', { company_id: evidence.tenantA, code: customerCode }, 'customer'],
      ['products', { company_id: evidence.tenantA, sku }, 'product'],
      ['sales_invoices', { company_id: evidence.tenantA, invoice_number: invoiceNumber }, 'invoice'],
    ]) {
      const rows = await restSelect(pageB, table, filter, table === 'sales_invoices' ? 'id,company_id,invoice_number' : 'id,company_id');
      assert.equal(rows.length, 0, `Tenant B must not read Tenant A ${label}`);
    }
    evidence.steps.push({ step: 'A-to-B-rest-read-isolation', status: 'PASS' });

    for (const [table, id, payload, label] of [
      ['customers', customers[0].id, { name: customerName }, 'customer'],
      ['products', products[0].id, { name: productName }, 'product'],
      ['sales_invoices', invoices[0].id, { status: invoices[0].status }, 'invoice'],
    ]) {
      const result = await restUpdate(pageB, table, id, payload);
      assert.equal(result.rows.length, 0, `Tenant B must not mutate Tenant A ${label}`);
      evidence.steps.push({ step: `cross-tenant-update:${label}`, status: 'PASS', httpStatus: result.status, denied: result.denied });
    }
    evidence.steps.push({ step: 'B-to-A-rest-mutation-isolation', status: 'PASS' });

    await pageB.goto(`${baseURL}/customers`, { waitUntil: 'networkidle', timeout: 30000 });
    await pageB.getByPlaceholder('بحث عن عميل...').fill(customerCode);
    assert.equal(await pageB.getByText(customerCode, { exact: true }).count(), 0, 'Tenant B UI must not show Tenant A customer');
    await pageB.goto(`${baseURL}/products`, { waitUntil: 'networkidle', timeout: 30000 });
    await pageB.getByPlaceholder('بحث عن منتج...').fill(sku);
    assert.equal(await pageB.getByText(sku, { exact: true }).count(), 0, 'Tenant B UI must not show Tenant A product');
    evidence.steps.push({ step: 'A-to-B-ui-isolation', status: 'PASS' });

    await pageB.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
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
  if (evidence.failures.length) throw new Error(`BROWSER_RUNTIME_ERRORS:${evidence.failures.join(' | ')}`);
  evidence.status = 'PASS';
} catch (error) {
  evidence.status = 'FAIL';
  evidence.error = error instanceof Error ? error.message : String(error);
  await pageA.screenshot({ path: `${reportDir}/failure.png`, fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  evidence.finishedAt = new Date().toISOString();
  await fs.writeFile(`${reportDir}/result.json`, JSON.stringify(evidence, null, 2));
  await browser.close();
}

console.log(JSON.stringify(evidence, null, 2));