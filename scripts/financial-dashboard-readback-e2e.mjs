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

for (const [name, value] of Object.entries({ supabaseURL, anonKey, email, password })) {
  if (!value) throw new Error(`FINANCIAL_READBACK_ENV_MISSING:${name}`);
}

await fs.mkdir(reportDir, { recursive: true });
const evidence = { exactHead, status: 'NOT_PROVEN', checks: [], startedAt: new Date().toISOString() };
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });

async function token() {
  return page.evaluate(() => {
    const raw = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1];
    if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND');
    const session = JSON.parse(raw);
    if (!session?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND');
    return session.access_token;
  });
}

async function rpc(name, body) {
  const accessToken = await token();
  const response = await fetch(`${supabaseURL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  assert.equal(response.ok, true, `${name} HTTP ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

function numericText(text) {
  const match = text.replace(/[^0-9.-]/g, ' ').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

async function kpiCard(label) {
  const labelNode = page.getByText(label, { exact: true }).first();
  await labelNode.waitFor({ state: 'visible', timeout: 15000 });
  const card = labelNode.locator('..').locator('..');
  const text = await card.innerText();
  const value = numericText(text.replace(label, ''));
  assert.notEqual(value, null, `${label} must render a numeric KPI, got: ${text}`);
  return { text, value };
}

try {
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await page.getByText('إجمالي المبيعات', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });

  const snapshot = await rpc('get_dashboard_snapshot', {
    p_months: 6,
    p_as_of: new Date().toISOString().slice(0, 10),
  });
  assert.ok(snapshot && typeof snapshot === 'object', 'dashboard snapshot must be an object');
  assert.equal(snapshot.status, 'CALCULATED', `dashboard snapshot status must be CALCULATED, got ${snapshot.status}`);
  assert.equal(typeof snapshot.totalSales, 'number', 'dashboard totalSales must be numeric');
  assert.equal(typeof snapshot.invoiceCount, 'number', 'dashboard invoiceCount must be numeric');
  assert.ok(snapshot.quality && typeof snapshot.quality === 'object', 'dashboard quality must be present');
  for (const [key, value] of Object.entries(snapshot.quality)) {
    assert.equal(value, 0, `dashboard quality ${key} must be zero, got ${value}`);
  }
  evidence.snapshot = {
    totalSales: snapshot.totalSales,
    invoiceCount: snapshot.invoiceCount,
    status: snapshot.status,
    asOf: snapshot.asOf,
    months: snapshot.months,
    quality: snapshot.quality,
  };
  evidence.checks.push({ name: 'canonical-dashboard-rpc', status: 'PASS' });
  evidence.checks.push({ name: 'canonical-dashboard-quality', status: 'PASS', quality: snapshot.quality });

  const accessToken = await token();
  const tenantResponse = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, {
    method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: '{}',
  });
  assert.equal(tenantResponse.ok, true, 'current_company_id must resolve for financial readback');
  const tenantId = (await tenantResponse.text()).replaceAll('"', '').trim();
  assert.ok(tenantId, 'tenant id must be resolved');
  evidence.tenantId = tenantId;

  const intelligence = await rpc('get_dashboard_intelligence', { p_limit: 100 });
  assert.ok(intelligence && typeof intelligence === 'object', 'dashboard intelligence must be an object');
  assert.ok(Array.isArray(intelligence.recommendations), 'dashboard intelligence recommendations must be an array');
  assert.ok(Array.isArray(intelligence.alerts), 'dashboard intelligence alerts must be an array');
  assert.ok(intelligence.recommendations.every(item => item?.company_id === tenantId), 'recommendations must be tenant-scoped');
  assert.ok(intelligence.alerts.every(item => item?.company_id === tenantId), 'alerts must be tenant-scoped');
  evidence.intelligence = { recommendationCount: intelligence.recommendations.length, alertCount: intelligence.alerts.length, limit: intelligence.limit };
  evidence.checks.push({ name: 'dashboard-intelligence-tenant-scope', status: 'PASS', tenantId });

  const sales = await kpiCard('إجمالي المبيعات');
  assert.equal(sales.value, snapshot.totalSales, `UI sales ${sales.value} must equal canonical snapshot ${snapshot.totalSales}`);
  evidence.checks.push({ name: 'ui-sales-equals-canonical', status: 'PASS', ui: sales.value, canonical: snapshot.totalSales });

  const invoices = await kpiCard('عدد الفواتير');
  assert.equal(invoices.value, snapshot.invoiceCount, `UI invoice count ${invoices.value} must equal canonical snapshot ${snapshot.invoiceCount}`);
  evidence.checks.push({ name: 'ui-invoice-count-equals-canonical', status: 'PASS', ui: invoices.value, canonical: snapshot.invoiceCount });

  const invoiceResponse = await fetch(`${supabaseURL}/rest/v1/sales_invoices?select=id&company_id=eq.${encodeURIComponent(tenantId)}&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, Prefer: 'count=exact' },
  });
  assert.equal(invoiceResponse.ok, true, `sales invoice count HTTP ${invoiceResponse.status}`);
  const range = invoiceResponse.headers.get('content-range') || '';
  const countMatch = range.match(/\/(\d+|\*)$/);
  if (countMatch && countMatch[1] !== '*') {
    const dbCount = Number(countMatch[1]);
    assert.equal(snapshot.invoiceCount, dbCount, `canonical invoice count ${snapshot.invoiceCount} must equal DB count ${dbCount}`);
    evidence.checks.push({ name: 'canonical-invoice-count-equals-db', status: 'PASS', canonical: snapshot.invoiceCount, db: dbCount });
  } else {
    evidence.checks.push({ name: 'canonical-invoice-count-equals-db', status: 'NOT_PROVEN', reason: 'PostgREST Content-Range count unavailable' });
  }

  evidence.status = evidence.checks.some(check => check.status === 'NOT_PROVEN') ? 'NOT_PROVEN' : 'PASS';
  if (evidence.status !== 'PASS') process.exitCode = 1;
} catch (error) {
  evidence.status = 'FAIL';
  evidence.error = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  evidence.finishedAt = new Date().toISOString();
  await fs.writeFile(`${reportDir}/financial-dashboard-readback.json`, JSON.stringify(evidence, null, 2));
  await browser.close();
}

console.log(JSON.stringify(evidence, null, 2));
