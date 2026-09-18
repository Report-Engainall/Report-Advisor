import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import process from 'node:process';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const supabaseURL = process.env.REPORT_ADVISOR_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e';
await fs.mkdir(reportDir, { recursive: true });

const routes = [
  '/', '/command-center', '/onboarding', '/decision-experience', '/metrics', '/reports',
  '/reports/sales', '/reports/purchases', '/reports/inventory',
  '/reports/inventory-intelligence', '/reports/demand-velocity',
  '/reports/receivables', '/reports/profitability', '/import', '/data-quality',
  '/analytics', '/analytics/rfm', '/analytics/abc', '/analytics/aging',
  '/intelligence', '/intelligence/recommendations', '/intelligence/forecasts',
  '/intelligence/scenarios', '/customers', '/products', '/inventory',
  '/alternative-groups', '/settings', '/settings/profile',
];

const result = {
  exactHead, baseURL, browser: 'Chromium',
  startedAt: new Date().toISOString(),
  auth: 'NOT_PROVEN', tenant: 'NOT_PROVEN',
  routes: [], findings: [], actions: [], requests: [], failedResponses: [],
  authNetworkProbe: null,
};
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
const consoleErrors = [];
const failedRequests = [];
const failedResponses = [];
const requests = [];

page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', error => consoleErrors.push(`[pageerror] ${error.message}`));
page.on('requestfailed', request => failedRequests.push({
  method: request.method(), url: request.url(), error: request.failure()?.errorText || 'unknown'
}));
page.on('response', async response => {
  if (response.status() < 400) return;
  const url = response.url();
  const relevant = !supabaseURL || url.startsWith(supabaseURL) || url.includes('/rest/v1/') || url.includes('/auth/v1/');
  if (!relevant) return;
  const body = await response.text().catch(() => '');
  failedResponses.push({ method: response.request().method(), status: response.status(), url, body: body.slice(0, 2000) });
});
page.on('request', request => requests.push({ method: request.method(), url: request.url() }));

async function probeAuthFromNode(email, password) {
  if (!supabaseURL || !supabaseAnonKey) return { status: 'BLOCKED', reason: 'SUPABASE_RUNTIME_ENV_MISSING' };
  const startedAt = Date.now();
  try {
    const response = await fetch(`${supabaseURL.replace(/\\/$/, '')}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(15000),
    });
    const bodyText = await response.text();
    let detail = '';
    if (!response.ok) {
      try {
        const body = JSON.parse(bodyText);
        detail = body?.error_code || body?.error || body?.msg || body?.message || '';
      } catch {}
    }
    return {
      status: response.ok ? 'PASS' : 'FAIL',
      httpStatus: response.status,
      durationMs: Date.now() - startedAt,
      detail: detail ? String(detail).slice(0, 180) : undefined,
    };
  } catch (error) {
    return {
      status: 'FAIL',
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.name + ':' + error.message.slice(0, 180) : String(error).slice(0, 180),
    };
  }
}

async function login(targetPage, email, password) {
  await targetPage.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  const loginEmail = targetPage.locator('#login-email');
  if (!(await loginEmail.count())) throw new Error('LOGIN_FORM_NOT_FOUND');
  await loginEmail.fill(email);
  await targetPage.locator('#login-password').fill(password);

  const authResponsePromise = targetPage.waitForResponse(
    response =>
      response.request().method() === 'POST' &&
      response.url().includes('/auth/v1/token?grant_type=password'),
    { timeout: 30000 },
  ).catch(() => null);

  const loginSubmit = targetPage.locator('form button[type="submit"]');
  if (!(await loginSubmit.count())) throw new Error('LOGIN_SUBMIT_NOT_FOUND');
  await loginSubmit.click();

  const nodeProbe = await probeAuthFromNode(email, password);
  result.authNetworkProbe = nodeProbe;
  const authResponse = await authResponsePromise;
  if (!authResponse) {
    throw new Error('AUTH_TOKEN_RESPONSE_TIMEOUT');
  }

  const authStatus = authResponse.status();
  if (authStatus >= 400) {
    let detail = '';
    try {
      const body = await authResponse.json();
      detail = body?.error_code || body?.error || body?.msg || body?.message || '';
    } catch {
      detail = '';
    }
    throw new Error('AUTH_TOKEN_HTTP_' + authStatus + (detail ? '_' + detail : ''));
  }

  try {
    await targetPage.locator('#login-email').waitFor({ state: 'hidden', timeout: 30000 });
  } catch {
    const alertText = await targetPage.getByRole('alert').first().textContent().catch(() => '');
    const loading = await targetPage.getByRole('button', { name: 'جارٍ التحقق...' }).count();
    const detail = alertText?.trim() ? ':' + alertText.trim().slice(0, 180) : '';
    throw new Error(
      loading
        ? 'AUTH_UI_SESSION_CONVERGENCE_TIMEOUT' + detail
        : 'AUTH_UI_SESSION_NOT_ESTABLISHED' + detail,
    );
  }