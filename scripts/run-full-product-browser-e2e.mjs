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
page.on('requestfailed', request => {
  const error = request.failure()?.errorText || 'unknown';
  if (error === 'net::ERR_ABORTED') return;
  failedRequests.push({ method: request.method(), url: request.url(), error });
});
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
  const attempts = [];
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const attemptStarted = Date.now();
    try {
      const response = await fetch(`${supabaseURL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
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
      attempts.push({ attempt, httpStatus: response.status, durationMs: Date.now() - attemptStarted, detail: detail ? String(detail).slice(0, 180) : undefined });
      if (response.ok) {
        return { status: 'PASS', httpStatus: response.status, durationMs: Date.now() - startedAt, attempts };
      }
    } catch (error) {
      attempts.push({
        attempt,
        durationMs: Date.now() - attemptStarted,
        error: error instanceof Error ? error.name + ':' + error.message.slice(0, 180) : String(error).slice(0, 180),
      });
    }
    if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
  }
  return { status: 'FAIL', durationMs: Date.now() - startedAt, attempts };
}
async function login(targetPage, email, password) {
  await targetPage.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const loginEmail = targetPage.locator('#login-email');
  await loginEmail.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
    throw new Error('LOGIN_FORM_NOT_READY');
  });
  await loginEmail.fill(email);
  await targetPage.locator('#login-password').fill(password);

  // Browser authentication is the authoritative proof for this browser E2E.
  // Keep the optional Node probe non-blocking so a parallel Auth gateway/rate-limit condition
  // cannot veto a real browser session that successfully receives the password-grant response.
  result.authNetworkProbe = { status: 'NOT_RUN', reason: 'BROWSER_AUTH_AUTHORITATIVE' };

  let authResponse = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    if (attempt > 1) {
      await targetPage.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await targetPage.locator('#login-email').waitFor({ state: 'visible', timeout: 30000 });
      await targetPage.locator('#login-email').fill(email);
      await targetPage.locator('#login-password').fill(password);
    }
    const authResponsePromise = targetPage.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url().includes('/auth/v1/token?grant_type=password'),
      { timeout: 60000 },
    ).catch(() => null);
    const loginSubmit = targetPage.locator('form button[type="submit"]');
    if (!(await loginSubmit.count())) throw new Error('LOGIN_SUBMIT_NOT_FOUND');
    await loginSubmit.click();
    const candidate = await authResponsePromise;
    if (candidate && [429, 500, 502, 503, 504].includes(candidate.status()) && attempt < 3) {
      await targetPage.waitForTimeout(5000 * attempt);
      continue;
    }
    authResponse = candidate;
    if (authResponse || attempt === 3) break;
    await targetPage.waitForTimeout(5000 * attempt);
  }

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
}

async function authenticatedTenantId(targetPage) {
  if (!supabaseURL || !supabaseAnonKey) throw new Error('SUPABASE_RUNTIME_ENV_MISSING');
  let lastError = null;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      return await targetPage.evaluate(async ({ url, anonKey }) => {
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
    } catch (error) {
      lastError = error;
      if (attempt < 8) await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw lastError || new Error('BROWSER_SESSION_CONVERGENCE_FAILED');
}

async function inspectPage(targetPage) {
  return targetPage.evaluate(() => {
    const text = document.body?.innerText?.trim() || '';
    const visible = selector => [...document.querySelectorAll(selector)].filter(el => {
      const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
    });
    const buttons = visible('button').map(el => (el.innerText || el.getAttribute('aria-label') || '').trim()).filter(Boolean);
    const links = visible('a').map(el => ({ text: (el.innerText || '').trim(), href: el.getAttribute('href') })).filter(x => x.text || x.href);
    const inputs = visible('input,textarea,select').map(el => ({
      tag: el.tagName.toLowerCase(), type: el.getAttribute('type'), name: el.getAttribute('name'),
      id: el.id, placeholder: el.getAttribute('placeholder')
    }));
    return {
      title: document.title, textLength: text.length,
      buttons: [...new Set(buttons)].slice(0, 80), buttonCount: buttons.length,
      linkCount: links.length, links: links.slice(0, 80),
      inputCount: inputs.length, inputs: inputs.slice(0, 80),
    };
  });
}

async function runWorkspacePersonalizationProbe(targetPage) {
  await targetPage.goto(`${baseURL}/settings`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await targetPage.getByRole('heading', { name: 'محرر مساحة العمل', exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const financePreset = targetPage.getByRole('button').filter({ hasText: 'المالية' }).first();
  await financePreset.waitFor({ state: 'visible', timeout: 15000 });
  await financePreset.click();

  const select = targetPage.locator('select').first();
  await select.selectOption('/reports/profitability');

  const kpiLabel = targetPage.locator('label').filter({ hasText: 'بطاقات المؤشرات' }).first();
  const kpiCheckbox = kpiLabel.locator('input[type="checkbox"]');
  if (await kpiCheckbox.isChecked()) await kpiCheckbox.uncheck();

  const persisted = await targetPage.evaluate(() => {
    const raw = localStorage.getItem('report-advisor.workspace-preferences');
    return raw ? JSON.parse(raw) : null;
  });
  if (persisted?.preset !== 'finance') throw new Error('WORKSPACE_PRESET_NOT_PERSISTED');
  if (persisted?.defaultLandingPath !== '/reports/profitability') throw new Error('WORKSPACE_LANDING_NOT_PERSISTED');
  if (persisted?.dashboardWidgets?.includes('kpis')) throw new Error('WORKSPACE_KPI_VISIBILITY_NOT_PERSISTED');

  await targetPage.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await targetPage.waitForTimeout(750);
  const redirectedPath = new URL(await targetPage.url()).pathname;
  if (redirectedPath !== '/reports/profitability') throw new Error(`WORKSPACE_LANDING_REDIRECT_FAILED:${redirectedPath}`);

  await targetPage.goto(`${baseURL}/settings`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await targetPage.getByRole('button', { name: 'إعادة الإعدادات الافتراضية' }).click();
  const reset = await targetPage.evaluate(() => {
    const raw = localStorage.getItem('report-advisor.workspace-preferences');
    return raw ? JSON.parse(raw) : null;
  });
  if (reset?.preset !== 'owner-executive') throw new Error('WORKSPACE_RESET_PRESET_FAILED');
  if (reset?.defaultLandingPath !== '/') throw new Error('WORKSPACE_RESET_LANDING_FAILED');
  if (!reset?.dashboardWidgets?.includes('kpis')) throw new Error('WORKSPACE_RESET_WIDGETS_FAILED');

  return {
    status: 'PASS',
    persistedPreset: persisted.preset,
    persistedLanding: persisted.defaultLandingPath,
    redirectedPath,
    resetPreset: reset.preset,
    resetLanding: reset.defaultLandingPath,
  };
}

function addFinding(id, status, severity, reason, extra = {}) {
  result.findings.push({ id, status, severity, reason, ...extra });
}

try {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.screenshot({ path: `${reportDir}/00-initial.png`, fullPage: true });
  const email = process.env.TEST_USER_A_EMAIL;
  const password = process.env.TEST_USER_A_PASSWORD;

  if (!email || !password) {
    result.auth = 'BLOCKED'; result.tenant = 'BLOCKED';
    addFinding('E2E-AUTH-001', 'BLOCKED', 'P0', 'Authenticated credentials are not available to the workflow.');
  } else {
    await login(page, email, password);
    await page.screenshot({ path: `${reportDir}/01-after-login.png`, fullPage: true });
    const stillLogin = await page.locator('#login-email').count();
    const tenantMissing = await page.getByText('لم يتم تحديد شركة للمستخدم').count();
    const appError = await page.getByText('حدث خطأ غير متوقع').count();
    let authenticatedTenant = null;

    if (!stillLogin && !tenantMissing && !appError) {
      try {
        authenticatedTenant = await authenticatedTenantId(page);
        result.tenantA = authenticatedTenant;
        result.auth = 'PASS';
        result.tenant = 'PASS';
        addFinding('E2E-AUTH-006', 'PASS', 'P0', 'Browser session established and current tenant resolved through authenticated runtime RPC.', { tenantId: authenticatedTenant });

        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        const refreshedTenant = await authenticatedTenantId(page);
        addFinding('E2E-AUTH-013', refreshedTenant === authenticatedTenant ? 'PASS' : 'FAIL', 'P0',
          refreshedTenant === authenticatedTenant
            ? 'Authenticated browser session and tenant survived an immediate full-page refresh.'
            : `Tenant changed after immediate full-page refresh: ${authenticatedTenant} -> ${refreshedTenant}.`,
          { tenantId: refreshedTenant });
      } catch (error) {
        result.auth = 'NOT_PROVEN';
        addFinding('E2E-AUTH-005', 'NOT_PROVEN', 'P0', 'Login form disappeared but browser session/tenant could not be conclusively resolved.', {
          reasonDetail: error instanceof Error ? error.message : String(error),
        });
      }
    } else if (stillLogin) {
      result.auth = 'FAIL';
      addFinding('E2E-AUTH-002', 'FAIL', 'P0', 'Login did not establish an authenticated UI session.');
    } else if (tenantMissing) {
      result.auth = 'BLOCKED';
      addFinding('E2E-AUTH-003', 'BLOCKED', 'P0', 'Authenticated user has no resolvable active tenant in runtime.');
    } else if (appError) {
      result.auth = 'FAIL';
      addFinding('E2E-AUTH-004', 'FAIL', 'P0', 'Application error boundary rendered after authentication.');
    }

    if (result.auth === 'PASS') {
      const primaryNavLink = page.locator('nav a[href="/import"], aside a[href="/import"]').first();
      let primaryNav = false;
      try {
        await primaryNavLink.waitFor({ state: 'visible', timeout: 15000 });
        primaryNav = true;
      } catch {
        primaryNav = false;
      }
      addFinding(
        'E2E-AUTH-012',
        primaryNav ? 'PASS' : 'NOT_PROVEN',
        'P1',
        primaryNav
          ? 'Authenticated application shell became visible after login and exposed the canonical import route from the navigation shell.'
          : 'Authenticated session is proven, but the navigation shell did not expose the canonical import route within the bounded 15-second convergence window.',
      );

      const emailB = process.env.TEST_USER_B_EMAIL;
      const passwordB = process.env.TEST_USER_B_PASSWORD;
      if (emailB && passwordB && result.tenant === 'PASS') {
        const contextB = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
        const pageB = await contextB.newPage();
        try {
          await login(pageB, emailB, passwordB);
          result.tenantB = await authenticatedTenantId(pageB);
          addFinding('E2E-TENANT-003', result.tenantA === result.tenantB ? 'FAIL' : 'PASS', 'P0',
            result.tenantA === result.tenantB
              ? 'Tenant A and Tenant B browser actors resolved to the same tenant.'
              : 'Tenant A and Tenant B browser actors resolved to distinct tenant contexts.');
        } catch (error) {
          addFinding('E2E-TENANT-004', 'BLOCKED', 'P0', error instanceof Error ? error.message : String(error));
        } finally { await pageB.close(); await contextB.close(); }
      } else {
        addFinding('E2E-TENANT-005', 'BLOCKED', 'P0', 'Tenant B credentials are not available; A/B isolation cannot be proven.');
      }

      for (let i = 0; i < routes.length; i += 1) {
        const route = routes[i];
        const beforeErrors = consoleErrors.length;
        const beforeFailed = failedRequests.length;
        const beforeFailedResponses = failedResponses.length;
        const beforeRequests = requests.length;
        const started = Date.now();
        let status = 'PASS'; let reason = '';
        let inspection = null;
        try {
          const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(500);
          const bodyText = (await page.locator('body').innerText()).trim();
          const appError = await page.getByText('حدث خطأ غير متوقع').count();
          const notFound = await page.getByText('الصفحة غير موجودة').count();
          inspection = await inspectPage(page);
          if (!response || response.status() >= 400) { status = 'FAIL'; reason = `HTTP ${response?.status() ?? 'NO_RESPONSE'}`; }
          else if (!bodyText) { status = 'FAIL'; reason = 'Blank body'; }
          else if (appError) { status = 'FAIL'; reason = 'App error boundary'; }
          else if (notFound) { status = 'FAIL'; reason = '404 page'; }
        } catch (error) {
          status = 'FAIL'; reason = error instanceof Error ? error.message : String(error);
        }

        const screenshot = `${reportDir}/${String(i + 2).padStart(2, '0')}-${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}.png`;
        await page.screenshot({ path: screenshot, fullPage: true }).catch(() => {});
        const routeRequests = requests.slice(beforeRequests).map(x => ({ method: x.method, url: x.url }));
        const routeErrors = consoleErrors.slice(beforeErrors);
        const routeFailed = failedRequests.slice(beforeFailed);
        const routeFailedResponses = failedResponses.slice(beforeFailedResponses);
        result.routes.push({ route, status, reason, durationMs: Date.now() - started, screenshot,
          consoleErrors: routeErrors, failedRequests: routeFailed, failedResponses: routeFailedResponses, requests: routeRequests, interaction: inspection });
        result.actions.push({ route, buttonCount: inspection?.buttonCount ?? 0, buttons: inspection?.buttons ?? [],
          inputCount: inspection?.inputCount ?? 0, linkCount: inspection?.linkCount ?? 0 });
        if (status === 'FAIL') addFinding(`E2E-ROUTE-${String(i + 1).padStart(3, '0')}`, 'FAIL', 'P1', `${route}: ${reason}`);
        if (routeFailed.length) addFinding(`E2E-NET-${String(i + 1).padStart(3, '0')}`, 'FAIL', 'P1',
          `${route}: ${routeFailed.length} browser network request(s) failed.`, { requests: routeFailed });
        if (routeFailedResponses.length) addFinding(`E2E-HTTP-${String(i + 1).padStart(3, '0')}`, 'FAIL', 'P1',
          `${route}: ${routeFailedResponses.length} relevant HTTP response(s) returned 4xx/5xx.`, { responses: routeFailedResponses });
        if (routeErrors.length) addFinding(`E2E-CONSOLE-${String(i + 1).padStart(3, '0')}`, 'FAIL', 'P1',
          `${route}: browser emitted ${routeErrors.length} console/page error(s).`, { errors: routeErrors });
      }

      try {
        const workspaceProbe = await runWorkspacePersonalizationProbe(page);
        addFinding('E2E-WORKSPACE-001', 'PASS', 'P1', 'Workspace personalization is proven through real browser interaction, persistence, landing redirect, and reset.', workspaceProbe);
      } catch (error) {
        addFinding('E2E-WORKSPACE-001', 'FAIL', 'P1', `Workspace personalization browser probe failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      try {
        await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const beforeRefreshTenant = result.tenantA;
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        const afterRefreshTenant = await authenticatedTenantId(page);
        if (beforeRefreshTenant !== afterRefreshTenant) {
          addFinding('E2E-AUTH-009', 'FAIL', 'P0', `Tenant changed across browser refresh: ${beforeRefreshTenant} -> ${afterRefreshTenant}.`);
        } else addFinding('E2E-AUTH-010', 'PASS', 'P0', 'Authenticated tenant context survived browser refresh.');
      } catch (error) {
        addFinding('E2E-AUTH-011', 'FAIL', 'P0', `Authenticated refresh persistence failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const logout = page.getByRole('button', { name: 'تسجيل الخروج' });
      await logout.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
      if (await logout.count() && await logout.isVisible().catch(() => false)) {
        await logout.click();
        try {
          await page.locator('#login-email').waitFor({ state: 'visible', timeout: 10000 });
          const residualAuthToken = await page.evaluate(() => Object.keys(localStorage).some(key => key.endsWith('-auth-token')));
          if (residualAuthToken) addFinding('E2E-AUTH-007', 'FAIL', 'P1', 'Logout UI reached login state but an auth token remained in browser storage.');
          else addFinding('E2E-AUTH-008', 'PASS', 'P1', 'Logout returned the browser to the unauthenticated login state and cleared the persisted auth token.');
        } catch {
          addFinding('E2E-AUTH-007', 'FAIL', 'P1', 'Logout did not return the browser to the unauthenticated login state within the bounded convergence window.');
        }
      } else addFinding('E2E-AUTH-009', 'NOT_PROVEN', 'P1', 'Logout control was not available in authenticated UI.');
    }
  }
} catch (error) {
  addFinding('E2E-HARNESS-001', 'FAIL', 'P0', error instanceof Error ? error.message : String(error));
} finally {
  result.finishedAt = new Date().toISOString();
  result.consoleErrors = consoleErrors;
  result.failedRequests = failedRequests;
  result.failedResponses = failedResponses;
  result.requests = requests;
  await fs.writeFile(`${reportDir}/result.json`, JSON.stringify(result, null, 2));
  await browser.close();
}

const counts = [...result.routes, ...result.findings].reduce((acc, x) => { acc[x.status] = (acc[x.status] || 0) + 1; return acc; }, {});
const blocked = result.findings.filter(x => x.status === 'BLOCKED').length;
const failed = result.findings.filter(x => x.status === 'FAIL').length;
const notProven = result.findings.filter(x => x.status === 'NOT_PROVEN').length;
console.log(JSON.stringify({ exactHead: result.exactHead, auth: result.auth, tenant: result.tenant,
  routesExecuted: result.routes.length, routesPassed: result.routes.filter(x => x.status === 'PASS').length,
  routesFailed: result.routes.filter(x => x.status === 'FAIL').length, counts, blocked, failed, notProven,
  findings: result.findings }, null, 2));

// Fail closed: unresolved FAIL or NOT_PROVEN findings are never green.
// BLOCKED remains exit 2 so environment/access blockers are distinguishable from test failures.
process.exitCode = failed || notProven ? 1 : (blocked ? 2 : 0);