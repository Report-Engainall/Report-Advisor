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

const result = {
  exactHead, baseURL, browser: 'Chromium',
  startedAt: new Date().toISOString(),
  auth: 'NOT_PROVEN', tenant: 'NOT_PROVEN',
  routes: [], findings: [], actions: [], requests: [],
};
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
const consoleErrors = [];
const failedRequests = [];
const requests = [];

page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', error => consoleErrors.push(`[pageerror] ${error.message}`));
page.on('requestfailed', request => failedRequests.push({
  method: request.method(), url: request.url(), error: request.failure()?.errorText || 'unknown'
}));
page.on('request', request => requests.push({ method: request.method(), url: request.url() }));

async function login(targetPage, email, password) {
  await targetPage.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  const loginEmail = targetPage.locator('#login-email');
  if (!(await loginEmail.count())) throw new Error('LOGIN_FORM_NOT_FOUND');
  await loginEmail.fill(email);
  await targetPage.locator('#login-password').fill(password);
  await targetPage.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await targetPage.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await targetPage.waitForTimeout(1500);
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

async function authenticatedRest(targetPage, path, init = {}) {
  if (!supabaseURL || !supabaseAnonKey) throw new Error('SUPABASE_RUNTIME_ENV_MISSING');
  return targetPage.evaluate(async ({ url, anonKey, requestPath, requestInit }) => {
    const entry = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1];
    if (!entry) throw new Error('BROWSER_SESSION_NOT_FOUND');
    const session = JSON.parse(entry);
    const accessToken = session?.access_token;
    if (!accessToken) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND');
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${requestPath}`, {
      ...requestInit,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(requestInit.headers || {}),
      },
    });
    const body = await response.text();
    let parsed = null;
    try { parsed = body ? JSON.parse(body) : null; } catch { parsed = body; }
    return { status: response.status, ok: response.ok, body: parsed };
  }, { url: supabaseURL, anonKey: supabaseAnonKey, requestPath: path, requestInit: init });
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

function addFinding(id, status, severity, reason, extra = {}) {
  result.findings.push({ id, status, severity, reason, ...extra });
}

try {
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
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
    const dashboard = await page.getByText('لوحة القيادة').count();

    if (stillLogin) {
      result.auth = 'FAIL';
      addFinding('E2E-AUTH-002', 'FAIL', 'P0', 'Login did not establish an authenticated UI session.');
    } else if (tenantMissing) {
      result.auth = 'BLOCKED';
      addFinding('E2E-AUTH-003', 'BLOCKED', 'P0', 'Authenticated user has no resolvable active tenant in runtime.');
    } else if (appError) {
      result.auth = 'FAIL';
      addFinding('E2E-AUTH-004', 'FAIL', 'P0', 'Application error boundary rendered after authentication.');
    } else if (dashboard) {
      result.auth = 'PASS';
    } else {
      result.auth = 'NOT_PROVEN';
      addFinding('E2E-AUTH-005', 'NOT_PROVEN', 'P0', 'Login form disappeared but authenticated product state was not conclusively identified.');
    }

    if (result.auth === 'PASS') {
      try {
        result.tenantA = await authenticatedTenantId(page);
        result.tenant = 'PASS';
      } catch (error) {
        result.tenant = 'FAIL';
        addFinding('E2E-TENANT-001', 'FAIL', 'P0', error instanceof Error ? error.message : String(error));
      }

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

          if (result.tenantA !== result.tenantB) {
            const actorAProducts = await authenticatedRest(page, 'products?select=id,name&limit=1', { method: 'GET' });
            if (!actorAProducts.ok) {
              addFinding('E2E-TENANT-006', 'FAIL', 'P0',
                `Tenant A product seed query failed with HTTP ${actorAProducts.status}.`, { response: actorAProducts.body });
            } else if (!Array.isArray(actorAProducts.body) || !actorAProducts.body.length) {
              addFinding('E2E-TENANT-006', 'NOT_PROVEN', 'P0',
                'No Tenant A product exists, so a safe cross-tenant browser probe cannot be executed.');
            } else {
              const targetProduct = actorAProducts.body[0];
              const targetId = encodeURIComponent(targetProduct.id);
              const crossRead = await authenticatedRest(pageB, `products?id=eq.${targetId}&select=id,name`, { method: 'GET' });
              if (!crossRead.ok) {
                addFinding('E2E-TENANT-007', 'FAIL', 'P0',
                  `Tenant B cross-tenant read probe failed with HTTP ${crossRead.status}.`, { response: crossRead.body });
              } else if (Array.isArray(crossRead.body) && crossRead.body.length === 0) {
                addFinding('E2E-TENANT-007', 'PASS', 'P0',
                  'Tenant B could not read a Tenant A product through the authenticated browser session.');
              } else {
                addFinding('E2E-TENANT-007', 'FAIL', 'P0',
                  'Tenant B browser session returned a Tenant A product during the cross-tenant read probe.', { response: crossRead.body });
              }

              // Safe write probe: PATCH the Tenant A product with its existing name.
              // A correctly isolated tenant returns zero affected rows; no product value is changed.
              const crossWrite = await authenticatedRest(pageB, `products?id=eq.${targetId}`, {
                method: 'PATCH',
                headers: { Prefer: 'return=representation' },
                body: JSON.stringify({ name: targetProduct.name }),
              });
              if (!crossWrite.ok) {
                addFinding('E2E-TENANT-008', 'FAIL', 'P0',
                  `Tenant B cross-tenant write probe failed with HTTP ${crossWrite.status}.`, { response: crossWrite.body });
              } else if (Array.isArray(crossWrite.body) && crossWrite.body.length === 0) {
                addFinding('E2E-TENANT-008', 'PASS', 'P0',
                  'Tenant B could not affect a Tenant A product; the idempotent write probe returned zero rows.');
              } else {
                addFinding('E2E-TENANT-008', 'FAIL', 'P0',
                  'Tenant B browser session affected a Tenant A product during the cross-tenant write probe.', { response: crossWrite.body });
              }
            }
          }
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
        const beforeRequests = requests.length;
        const started = Date.now();
        let status = 'PASS'; let reason = '';
        let inspection = null;
        try {
          const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
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
        result.routes.push({ route, status, reason, durationMs: Date.now() - started, screenshot,
          consoleErrors: routeErrors, failedRequests: routeFailed, requests: routeRequests, interaction: inspection });
        result.actions.push({ route, buttonCount: inspection?.buttonCount ?? 0, buttons: inspection?.buttons ?? [],
          inputCount: inspection?.inputCount ?? 0, linkCount: inspection?.linkCount ?? 0 });
        if (status === 'FAIL') addFinding(`E2E-ROUTE-${String(i + 1).padStart(3, '0')}`, 'FAIL', 'P1', `${route}: ${reason}`);
        if (routeFailed.length) addFinding(`E2E-NET-${String(i + 1).padStart(3, '0')}`, 'FAIL', 'P1',
          `${route}: ${routeFailed.length} browser network request(s) failed.`, { requests: routeFailed });
        if (routeErrors.length) addFinding(`E2E-CONSOLE-${String(i + 1).padStart(3, '0')}`, 'FAIL', 'P1',
          `${route}: browser emitted ${routeErrors.length} console/page error(s).`, { errors: routeErrors });
      }

      // Persistence: refresh must preserve the same authenticated tenant context.
      try {
        await page.goto(`${baseURL}/`, { waitUntil: 'networkidle', timeout: 30000 });
        const beforeRefreshTenant = result.tenantA;
        await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
        const afterRefreshTenant = await authenticatedTenantId(page);
        if (beforeRefreshTenant !== afterRefreshTenant) {
          addFinding('E2E-AUTH-009', 'FAIL', 'P0', `Tenant changed across browser refresh: ${beforeRefreshTenant} -> ${afterRefreshTenant}.`);
        } else addFinding('E2E-AUTH-010', 'PASS', 'P0', 'Authenticated tenant context survived browser refresh.');
      } catch (error) {
        addFinding('E2E-AUTH-011', 'FAIL', 'P0', `Authenticated refresh persistence failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      await page.goto(`${baseURL}/`, { waitUntil: 'networkidle', timeout: 30000 });
      const logout = page.getByRole('button', { name: 'تسجيل الخروج' });
      if (await logout.count()) {
        await logout.click(); await page.waitForTimeout(1000);
        if (!(await page.locator('#login-email').count())) addFinding('E2E-AUTH-007', 'FAIL', 'P1', 'Logout did not return the browser to the unauthenticated login state.');
        else addFinding('E2E-AUTH-006', 'PASS', 'P1', 'Logout returned the browser to the unauthenticated login state.');
      } else addFinding('E2E-AUTH-008', 'NOT_PROVEN', 'P1', 'Logout control was not available in authenticated UI.');
    }
  }
} catch (error) {
  addFinding('E2E-HARNESS-001', 'FAIL', 'P0', error instanceof Error ? error.message : String(error));
} finally {
  result.finishedAt = new Date().toISOString();
  result.consoleErrors = consoleErrors;
  result.failedRequests = failedRequests;
  result.requests = requests;
  await fs.writeFile(`${reportDir}/result.json`, JSON.stringify(result, null, 2));
  await browser.close();
}

const counts = [...result.routes, ...result.findings].reduce((acc, x) => { acc[x.status] = (acc[x.status] || 0) + 1; return acc; }, {});
const blocked = result.findings.filter(x => x.status === 'BLOCKED').length;
const failed = result.findings.filter(x => x.status === 'FAIL').length;
console.log(JSON.stringify({ exactHead: result.exactHead, auth: result.auth, tenant: result.tenant,
  routesExecuted: result.routes.length, routesPassed: result.routes.filter(x => x.status === 'PASS').length,
  routesFailed: result.routes.filter(x => x.status === 'FAIL').length, counts, blocked, failed,
  findings: result.findings }, null, 2));

// No unresolved FAIL or critical external BLOCKED state may be reported as a green E2E run.
process.exitCode = failed ? 1 : (blocked ? 2 : 0);
