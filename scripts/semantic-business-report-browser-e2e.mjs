import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const supabaseURL = process.env.REPORT_ADVISOR_SUPABASE_URL;
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY;
const email = process.env.TEST_USER_A_EMAIL;
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const outDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e';

await fs.mkdir(outDir, { recursive: true });

for (const [name, value] of Object.entries({ supabaseURL, anonKey, email, password })) {
  if (!value) {
    console.error(`SEMANTIC_E2E_BLOCKED:MISSING_${name}`);
    process.exit(2);
  }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
const evidence = { exactHead, baseURL, flows: [], startedAt: new Date().toISOString() };

async function token() {
  const raw = await page.evaluate(() => Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1] || null);
  assert.ok(raw, 'BROWSER_SESSION_NOT_FOUND');
  const parsed = JSON.parse(raw);
  assert.ok(parsed?.access_token, 'BROWSER_ACCESS_TOKEN_NOT_FOUND');
  return parsed.access_token;
}

async function rpc(name, args = {}) {
  const accessToken = await token();
  const response = await page.evaluate(async ({ url, key, accessToken, name, args }) => {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });
    return { status: res.status, body: await res.text() };
  }, { url: supabaseURL, key: anonKey, accessToken, name, args });
  assert.ok(response.status < 400, `RPC_${name}_HTTP_${response.status}:${response.body}`);
  return response.body ? JSON.parse(response.body) : null;
}

async function goto(path) {
  const response = await page.goto(`${baseURL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
  assert.ok(response && response.status() < 400, `PAGE_HTTP_${response?.status()}:${path}`);
  await page.waitForTimeout(500);
}

async function body() { return (await page.locator('body').innerText()).trim(); }

async function login() {
  await goto('/');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(900);
  await token();
  assert.ok(!(await page.locator('#login-email').count()), 'LOGIN_FORM_STILL_VISIBLE');
}

function normalizeNumber(text) {
  if (text.includes('—')) return null;
  const normalized = text.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  return normalized ? Number(normalized) : null;
}

async function cardValue(label) {
  const card = page.locator('div.card').filter({ hasText: label }).first();
  assert.ok(await card.count(), `CARD_NOT_FOUND:${label}`);
  const value = card.locator('div.text-xl,div.text-2xl').first();
  assert.ok(await value.count(), `CARD_VALUE_NOT_FOUND:${label}`);
  return (await value.innerText()).trim();
}

async function recordFlow(id, name, fn) {
  const row = { id, name, status: 'PASS' };
  try {
    await fn(row);
  } catch (error) {
    row.status = 'FAIL';
    row.error = error instanceof Error ? error.message : String(error);
    evidence.flows.push(row);
    throw error;
  }
  evidence.flows.push(row);
}

await login();

await recordFlow('SEM-007', 'Inventory semantic truth', async (row) => {
  const rpc = await rpc('get_inventory_report_snapshot', { p_page: 0, p_page_size: 25, p_filter: 'all' });
  const payload = rpc ?? {};
  await goto('/reports/inventory');
  const uiValue = normalizeNumber(await cardValue('قيمة المخزون'));
  const uiRows = normalizeNumber(await cardValue('عدد الأصناف'));
  const uiLow = normalizeNumber(await cardValue('مخزون منخفض'));
  const uiOut = normalizeNumber(await cardValue('نفد المخزون'));
  assert.equal(uiValue, payload.totalValue ?? null, 'INVENTORY_TOTAL_VALUE_MISMATCH');
  assert.equal(uiRows, payload.totalRows ?? null, 'INVENTORY_TOTAL_ROWS_MISMATCH');
  assert.equal(uiLow, payload.lowStock ?? null, 'INVENTORY_LOW_STOCK_MISMATCH');
  assert.equal(uiOut, payload.outOfStock ?? null, 'INVENTORY_OUT_OF_STOCK_MISMATCH');
  if (payload.dataStatus === 'INSUFFICIENT_DATA') assert.match(await body(), /بيانات غير كافية/);
  row.rpc = { status: payload.dataStatus, totalValue: payload.totalValue ?? null, totalRows: payload.totalRows ?? null };
  row.ui = { totalValue: uiValue, totalRows: uiRows, lowStock: uiLow, outOfStock: uiOut };
  row.semantic = 'DB/RPC snapshot values equal rendered UI values';
});

await recordFlow('SEM-008', 'Sales semantic truth', async (row) => {
  const rpcData = await rpc('get_dashboard_snapshot', { p_months: 6, p_as_of: new Date().toISOString().slice(0, 10) });
  const payload = rpcData ?? {};
  await goto('/reports/sales');
  const uiSales = normalizeNumber(await cardValue('إجمالي المبيعات'));
  const uiCount = normalizeNumber(await cardValue('عدد الفواتير'));
  const uiAvg = normalizeNumber(await cardValue('متوسط قيمة الفاتورة'));
  assert.equal(uiSales, payload.totalSales ?? null, 'SALES_TOTAL_MISMATCH');
  assert.equal(uiCount, payload.invoiceCount ?? null, 'SALES_INVOICE_COUNT_MISMATCH');
  assert.equal(uiAvg, payload.avgInvoiceValue ?? null, 'SALES_AVG_MISMATCH');
  if (payload.status === 'INSUFFICIENT_DATA') assert.match(await body(), /بيانات غير كافية/);
  row.rpc = { status: payload.status, totalSales: payload.totalSales ?? null, invoiceCount: payload.invoiceCount ?? null, avgInvoiceValue: payload.avgInvoiceValue ?? null };
  row.ui = { totalSales: uiSales, invoiceCount: uiCount, avgInvoiceValue: uiAvg };
  row.semantic = 'Canonical dashboard snapshot equals rendered sales report metrics';
});

await recordFlow('SEM-009', 'Purchase semantic truth', async (row) => {
  const rpcData = await rpc('get_purchase_summary');
  const payload = rpcData ?? {};
  await goto('/reports/purchases');
  const uiTotal = normalizeNumber(await cardValue('إجمالي المشتريات'));
  const uiCount = normalizeNumber(await cardValue('عدد الفواتير'));
  const uiSuppliers = normalizeNumber(await cardValue('الموردين النشطين'));
  const uiAvg = normalizeNumber(await cardValue('متوسط الفاتورة'));
  assert.equal(uiTotal, payload.total ?? null, 'PURCHASE_TOTAL_MISMATCH');
  assert.equal(uiCount, payload.count ?? null, 'PURCHASE_COUNT_MISMATCH');
  assert.equal(uiSuppliers, payload.supplier_count ?? null, 'PURCHASE_SUPPLIER_COUNT_MISMATCH');
  assert.equal(uiAvg, payload.average ?? null, 'PURCHASE_AVERAGE_MISMATCH');
  row.rpc = payload;
  row.ui = { total: uiTotal, count: uiCount, supplier_count: uiSuppliers, average: uiAvg };
  row.semantic = 'Canonical purchase summary equals rendered UI metrics';
});

await recordFlow('SEM-010', 'Receivables semantic truth', async (row) => {
  const rpcData = await rpc('get_receivables_report_page', { p_page: 0, p_page_size: 25 });
  const payload = rpcData ?? {};
  await goto('/reports/receivables');
  const uiOutstanding = normalizeNumber(await cardValue('إجمالي الذمم'));
  const uiRows = normalizeNumber(await cardValue('عدد الفواتير المستحقة'));
  assert.equal(uiOutstanding, payload.total_outstanding ?? null, 'RECEIVABLES_TOTAL_MISMATCH');
  assert.equal(uiRows, payload.total_rows ?? null, 'RECEIVABLES_ROWS_MISMATCH');
  row.rpc = payload;
  row.ui = { total_outstanding: uiOutstanding, total_rows: uiRows };
  row.semantic = 'Canonical receivables page equals rendered UI metrics';
});

await recordFlow('SEM-011', 'Dashboard semantic truth', async (row) => {
  const rpcData = await rpc('get_dashboard_snapshot', { p_months: 6, p_as_of: new Date().toISOString().slice(0, 10) });
  const payload = rpcData ?? {};
  await goto('/command-center');
  const labels = ['إجمالي المبيعات', 'إجمالي الربح', 'الذمم المدينة', 'قيمة المخزون', 'عدد العملاء', 'عدد المنتجات', 'عدد الفواتير', 'معدل التحصيل'];
  const ui = Object.fromEntries(await Promise.all(labels.map(async (label) => [label, normalizeNumber(await cardValue(label))])));
  const expected = {
    'إجمالي المبيعات': payload.totalSales ?? null,
    'إجمالي الربح': payload.grossProfit ?? null,
    'الذمم المدينة': payload.totalReceivables ?? null,
    'قيمة المخزون': payload.inventoryValue ?? null,
    'عدد العملاء': payload.totalCustomers ?? null,
    'عدد المنتجات': payload.totalProducts ?? null,
    'عدد الفواتير': payload.invoiceCount ?? null,
    'معدل التحصيل': payload.collectionRate ?? null,
  };
  for (const label of labels) assert.equal(ui[label], expected[label], `DASHBOARD_${label}_MISMATCH`);
  if (payload.status === 'INSUFFICIENT_DATA') {
    assert.match(await body(), /بيانات غير كافية/);
    for (const label of ['إجمالي المبيعات', 'إجمالي الربح', 'الذمم المدينة']) assert.equal(ui[label], null, `DASHBOARD_INVALID_MONETARY_OUTPUT:${label}`);
  }
  row.rpc = { status: payload.status, ...expected };
  row.ui = ui;
  row.semantic = 'Canonical dashboard RPC values equal semantic UI values';
});

await fs.writeFile(`${outDir}/semantic-business-report-browser-e2e.json`, JSON.stringify(evidence, null, 2), 'utf8');
await browser.close();
console.log(JSON.stringify({ exact_head: exactHead, status: 'PASS', flows: evidence.flows }, null, 2));
