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
  '/', '/command-center', '/decision-experience', '/metrics', '/reports',
  '/reports/sales', '/reports/purchases', '/reports/inventory',
  '/reports/inventory-intelligence', '/reports/demand-velocity',
  '/reports/receivables', '/reports/profitability', '/import', '/data-quality',
  '/analytics', '/analytics/rfm', '/analytics/abc', '/analytics/aging',
  '/intelligence', '/intelligence/recommendations', '/intelligence/forecasts',
  '/intelligence/scenarios', '/customers', '/products', '/inventory',
  '/alternative-groups', '/settings', '/settings/profile',
];

const result = { exactHead, baseURL, startedAt: new Date().toISOString(), auth: 'NOT_PROVEN', tenant: 'NOT_PROVEN', routes: [], findings: [] };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
const consoleErrors = [];
const failedRequests = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', error => consoleErrors.push(`[pageerror] ${error.message}`));
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' }));

async function login(targetPage, email, password) {
  await targetPage.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  const loginEmail = targetPage.locator('#login-email');
  if (!(await loginEmail.count())) throw new Error('LOGIN_FORM_NOT_FOUND');
  await loginEmail.fill(email);
  await targetPage.locator('#login-password').fill(password);
  await targetPage.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await targetPage.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await targetPage.waitForTimeout(1200);
}

async function authenticatedTenantId(targetPage) {
  if (!supabaseURL || !supabaseAnonKey) throw new Error('SUPABASE_RUNTIME_ENV_MISSING');
  return targetPage.evaluate(async ({ url, anonKey }) => {
    const entry = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1];
    if (!entry) throw new Error('BROWSER_SESSION_NOT_FOUND');
    const session = JSON.parse(entry);
    const accessToken = session?.access_token;
    if (!accessToken) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND');
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/current_company_id`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    const body = await response.text();
    if (!response.ok) throw new Error(`CURRENT_COMPANY_ID_HTTP_${response.status}:${body}`);
    if (!body || body === 'null') throw new Error('CURRENT_COMPANY_ID_EMPTY');
    return body.replaceAll('"', '');
  }, { url: supabaseURL, anonKey: supabaseAnonKey });
}

try {
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: `${reportDir}/00-initial.png`, fullPage: true });
  const email = process.env.TEST_USER_A_EMAIL;
  const password = process.env.TEST_USER_A_PASSWORD;

  if (!email || !password) {
    result.auth = 'BLOCKED'; result.tenant = 'BLOCKED';
    result.findings.push({ id: 'E2E-AUTH-001', status: 'BLOCKED', severity: 'P0', reason: 'Authenticated credentials are not available to the workflow.' });
  } else {
    await login(page, email, password);
    await page.screenshot({ path: `${reportDir}/01-after-login.png`, fullPage: true });
    const stillLogin = await page.locator('#login-email').count();
    const tenantMissing = await page.getByText('لم يتم تحديد شركة للمستخدم').count();
    const appError = await page.getByText('حدث خطأ غير متوقع').count();
    const dashboard = await page.getByText('لوحة القيادة').count();

    if (stillLogin) { result.auth = 'FAIL'; result.findings.push({ id: 'E2E-AUTH-002', status: 'FAIL', severity: 'P0', reason: 'Login did not establish an authenticated UI session.' }); }
    else if (tenantMissing) { result.auth = 'BLOCKED'; result.findings.push({ id: 'E2E-AUTH-003', status: 'BLOCKED', severity: 'P0', reason: 'Authenticated user has no resolvable active tenant in runtime.' }); }
    else if (appError) { result.auth = 'FAIL'; result.findings.push({ id: 'E2E-AUTH-004', status: 'FAIL', severity: 'P0', reason: 'Application error boundary rendered after authentication.' }); }
    else if (dashboard) { result.auth = 'PASS'; }
    else { result.auth = 'NOT_PROVEN'; result.findings.push({ id: 'E2E-AUTH-005', status: 'NOT_PROVEN', severity: 'P0', reason: 'Login form disappeared but authenticated product state was not conclusively identified.' }); }

    if (result.auth === 'PASS') {
      try { result.tenantA = await authenticatedTenantId(page); result.tenant = 'PASS'; }
      catch (error) { result.tenant = 'FAIL'; result.findings.push({ id: 'E2E-TENANT-001', status: 'FAIL', severity: 'P0', reason: error instanceof Error ? error.message : String(error) }); }

      const emailB = process.env.TEST_USER_B_EMAIL;
      const passwordB = process.env.TEST_USER_B_PASSWORD;
      if (emailB && passwordB && result.tenant === 'PASS') {
        const contextB = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
        const pageB = await contextB.newPage();
        try {
          await login(pageB, emailB, passwordB);
          result.tenantB = await authenticatedTenantId(pageB);
          result.findings.push(result.tenantA === result.tenantB
            ? { id: 'E2E-TENANT-002', status: 'FAIL', severity: 'P0', reason: 'Tenant A and Tenant B browser actors resolved to the same tenant.' }
            : { id: 'E2E-TENANT-003', status: 'PASS', severity: 'P0', reason: 'Tenant A and Tenant B browser actors resolved to distinct tenant contexts.' });
        } catch (error) {
          result.findings.push({ id: 'E2E-TENANT-004', status: 'BLOCKED', severity: 'P0', reason: error instanceof Error ? error.message : String(error) });
        } finally { await pageB.close(); await contextB.close(); }
      } else result.findings.push({ id: 'E2E-TENANT-005', status: 'BLOCKED', severity: 'P0', reason: 'Tenant B credentials are not available; A/B isolation cannot be proven.' });

      for (let i = 0; i < routes.length; i += 1) {
        const route = routes[i]; const beforeErrors = consoleErrors.length; const beforeFailed = failedRequests.length; const started = Date.now();
        let status = 'PASS'; let reason = '';
        try {
          const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(500);
          const bodyText = (await page.locator('body').innerText()).trim();
          const appError = await page.getByText('حدث خطأ غير متوقع').count();
          const notFound = await page.getByText('الصفحة غير موجودة').count();
          if (!response || response.status() >= 400) { status = 'FAIL'; reason = `HTTP ${response?.status() ?? 'NO_RESPONSE'}`; }
          else if (!bodyText) { status = 'FAIL'; reason = 'Blank body'; }
          else if (appError) { status = 'FAIL'; reason = 'App error boundary'; }
          else if (notFound) { status = 'FAIL'; reason = '404 page'; }
        } catch (error) { status = 'FAIL'; reason = error instanceof Error ? error.message : String(error); }
        const screenshot = `${reportDir}/${String(i + 2).padStart(2, '0')}-${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}.png`;
        await page.screenshot({ path: screenshot, fullPage: true }).catch(() => {});
        result.routes.push({ route, status, reason, durationMs: Date.now() - started, consoleErrors: consoleErrors.slice(beforeErrors), failedRequests: failedRequests.slice(beforeFailed), screenshot });
        if (status === 'FAIL') result.findings.push({ id: `E2E-ROUTE-${String(i + 1).padStart(3, '0')}`, status: 'FAIL', severity: 'P1', reason: `${route}: ${reason}` });
      }

      await page.goto(`${baseURL}/`, { waitUntil: 'networkidle', timeout: 30000 });
      const logout = page.getByRole('button', { name: 'تسجيل الخروج' });
      if (await logout.count()) { await logout.click(); await page.waitForTimeout(1000); if (!(await page.locator('#login-email').count())) result.findings.push({ id: 'E2E-AUTH-007', status: 'FAIL', severity: 'P1', reason: 'Logout did not return the browser to the unauthenticated login state.' }); }
      else result.findings.push({ id: 'E2E-AUTH-008', status: 'NOT_PROVEN', severity: 'P1', reason: 'Logout control was not available in authenticated UI.' });
    }
  }
} catch (error) { result.findings.push({ id: 'E2E-HARNESS-001', status: 'FAIL', severity: 'P0', reason: error instanceof Error ? error.message : String(error) }); }
finally {
  result.finishedAt = new Date().toISOString(); result.consoleErrors = consoleErrors; result.failedRequests = failedRequests;
  await fs.writeFile(`${reportDir}/result.json`, JSON.stringify(result, null, 2)); await browser.close();
}

const counts = [...result.routes, ...result.findings].reduce((acc, x) => { acc[x.status] = (acc[x.status] || 0) + 1; return acc; }, {});
console.log(JSON.stringify({ exactHead: result.exactHead, auth: result.auth, tenant: result.tenant, routeCounts: counts, findings: result.findings }, null, 2));
process.exitCode = result.findings.some(x => x.status === 'FAIL') ? 1 : 0;
