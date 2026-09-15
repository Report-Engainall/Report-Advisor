import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const dir = process.env.E2E_REPORT_DIR || 'artifacts/e2e-business';
await fs.mkdir(dir, { recursive: true });

const evidence = { exactHead, status: 'NOT_PROVEN', responses: [], console: [], pageErrors: [], ui: {}, lifecycle: [] };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: 'ar-SA' });
const page = await context.newPage();
let diagnosticError = null;
page.on('response', async (response) => {
  const url = response.url();
  if (response.status() >= 400 || /\/rpc\/(enqueue_report_execution_job|claim_report_execution_job|advance_report_execution_checkpoint|complete_report_execution_job|fail_report_execution_job|import_commit_batch)/.test(url) || /\/auth\/v1\/(token|user)/.test(url)) {
    let body = ''; try { body = (await response.text()).slice(0, 6000); } catch {}
    evidence.responses.push({ status: response.status(), method: response.request().method(), url, body });
  }
});
page.on('requestfailed', (request) => {
  const url = request.url();
  if (/\/auth\/v1\//.test(url) || /\/rest\/v1\//.test(url)) evidence.responses.push({ status: 0, method: request.method(), url, body: `REQUEST_FAILED:${request.failure()?.errorText || 'unknown'}` });
});
page.on('console', (message) => { if (message.type() === 'error') evidence.console.push(message.text()); });
page.on('pageerror', (error) => evidence.pageErrors.push(error.message));
async function login() {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.locator('#login-email').fill(email); await page.locator('#login-password').fill(password);
      await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
      await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30000 });
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 3) break;
      await page.waitForTimeout(4000 * attempt);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    }
  }
  throw lastError || new Error('DIAGNOSTIC_LOGIN_FAILED');
}
try {
  await login();
  await page.goto(`${baseURL}/import`, { waitUntil: 'networkidle', timeout: 30000 });
  const customerButton = page.getByRole('button', { name: /(?:العملاء|Customers)/i }).first();
  await customerButton.waitFor({ state: 'visible', timeout: 30000 });
  await customerButton.click();
  const suffix = `${Date.now()}-${process.pid}`;
  const csv = Buffer.from(`\ufeffname,code,phone,email,segment,credit_limit,payment_terms_days\nE2E Diagnose ${suffix},E2E-D-${suffix},777000000,e2e-${suffix}@example.invalid,retail,0,0\n`, 'utf8');
  await page.locator('input[type="file"]').first().setInputFiles({ name: `diagnostic-${suffix}.csv`, mimeType: 'text/csv', buffer: csv });
  await page.getByText('المراجعة', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  const commit = page.getByRole('button', { name: /اعتماد وكتابة/ }); await commit.waitFor({ state: 'visible', timeout: 30000 });
  evidence.commitButton = { text: await commit.innerText(), disabled: await commit.isDisabled() };
  if (await commit.isDisabled()) throw new Error(`COMMIT_BUTTON_DISABLED:${evidence.commitButton.text}`);
  await commit.click(); evidence.lifecycle.push({ stage: 'commit-clicked', at: new Date().toISOString() });
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    const bodyText = await page.locator('body').innerText(); const failed = bodyText.includes('فشل الاستيراد:');
    const done = bodyText.includes('اكتملت عملية الاستيراد') || bodyText.includes('تم الاستيراد بنجاح') || bodyText.includes('إعادة استيراد');
    if (failed || done) { evidence.ui = { failed, done, errorText: failed ? (bodyText.match(/فشل الاستيراد:[^\n]*/)?.[0] || null) : null, stepText: bodyText.includes('النتيجة') ? 'done' : bodyText.includes('الكتابة') ? 'committing' : 'unknown' }; break; }
    await page.waitForTimeout(1000);
  }
  evidence.lifecycle.push({ stage: 'ui-settled-or-timeout', at: new Date().toISOString(), ui: evidence.ui }); evidence.status = 'CAPTURED';
} catch (error) {
  diagnosticError = error instanceof Error ? error : new Error(String(error)); evidence.status = 'FAIL'; evidence.error = diagnosticError.stack || diagnosticError.message;
} finally {
  evidence.finishedAt = new Date().toISOString(); await fs.writeFile(`${dir}/real-business-persistence-diagnostic.json`, JSON.stringify(evidence, null, 2));
  await page.close(); await context.close(); await browser.close();
}

if (diagnosticError) throw diagnosticError;
