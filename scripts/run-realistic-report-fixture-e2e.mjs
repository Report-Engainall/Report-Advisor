import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const supabaseURL = process.env.REPORT_ADVISOR_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.TEST_USER_A_EMAIL;
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const fixtureRoot = path.resolve('tests/fixtures/realistic-reports');
const outDir = path.resolve(process.env.E2E_REPORT_DIR || 'artifacts/realistic-report-e2e');
await fs.mkdir(outDir, { recursive: true });

if (!supabaseURL || !anonKey || !email || !password) throw new Error('REAL_REPORT_E2E_CREDENTIALS_OR_SUPABASE_MISSING');

function codePointSort(a, b) {
  const aa = a.normalize('NFC'); const bb = b.normalize('NFC');
  if (aa < bb) return -1; if (aa > bb) return 1; return 0;
}
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }

const names = (await fs.readdir(fixtureRoot))
  .filter(name => name !== 'README.md')
  .filter(name => /\.(xlsx|xls|csv|pdf|docx|json|txt)$/i.test(name))
  .sort(codePointSort);
if (!names.length) throw new Error('REAL_REPORT_CORPUS_EMPTY');
const firstName = names[0];
const fixturePath = path.join(fixtureRoot, firstName);
const bytes = await fs.readFile(fixturePath);
const fingerprint = sha256(bytes);

const result = {
  exactHead,
  fixtureCount: names.length,
  selectedIndex: 0,
  fixture: { name: firstName, relativePath: path.relative(process.cwd(), fixturePath), byteSize: bytes.length, sha256: fingerprint },
  browser: 'Microsoft Edge',
  routes: [],
  canonicalRecords: [],
  consoleErrors: [],
  failedResponses: [],
};

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
page.on('console', msg => { if (msg.type() === 'error') result.consoleErrors.push(msg.text()); });
page.on('pageerror', err => result.consoleErrors.push('[pageerror] ' + err.message));
page.on('response', async response => {
  if (response.status() < 400) return;
  const url = response.url();
  if (url.includes('/rest/v1/') || url.includes('/auth/v1/') || url.includes('/api/')) {
    result.failedResponses.push({ status: response.status(), method: response.request().method(), url, body: (await response.text().catch(() => '')).slice(0, 1000) });
  }
});

try {
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#login-email').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  const authResponse = page.waitForResponse(
    r => r.request().method() === 'POST' && r.url().includes('/auth/v1/token?grant_type=password'),
    { timeout: 60000 },
  );
  await page.locator('form button[type="submit"]').click();
  const auth = await authResponse;
  if (auth.status() >= 400) throw new Error('AUTH_HTTP_' + auth.status());
  await page.locator('#login-email').waitFor({ state: 'hidden', timeout: 30000 });

  await page.goto(baseURL + '/import', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles(fixturePath);

  await page.getByText('مراجعة قبل الاعتماد', { exact: false }).waitFor({ state: 'visible', timeout: 120000 });
  if (!(await page.getByText(firstName, { exact: true }).count())) throw new Error('REAL_REPORT_FILE_NOT_RECOGNIZED_IN_IMPORT_UI');

  const approval = page.locator('label').filter({ hasText: 'موافقة جودة صريحة' }).locator('input[type="checkbox"]');
  if (await approval.count() && await approval.isVisible()) await approval.check();

  const commitButton = page.getByRole('button', { name: /اعتماد المصدر/ }).first();
  await commitButton.waitFor({ state: 'visible', timeout: 30000 });
  if (await commitButton.isDisabled()) throw new Error('REAL_REPORT_IMPORT_COMMIT_BUTTON_DISABLED');

  await commitButton.click();
  await page.getByText('تم اعتماد المصدر وربطه بمسار العمل', { exact: false }).waitFor({ state: 'visible', timeout: 180000 });

  const doneText = await page.locator('body').innerText();
  const snapshotMatch = doneText.match(/Snapshot:\s*([^\n]+)/);
  const importMatch = doneText.match(/Import Job:\s*([^\n]+)/);
  const jobMatch = doneText.match(/Execution Job:\s*([^\n]+)/);
  const importId = importMatch?.[1]?.trim();
  result.snapshotId = snapshotMatch?.[1]?.trim() || null;
  result.importJobId = importId || null;
  result.executionJobId = jobMatch?.[1]?.trim() || null;
  result.importUI = {
    fileRecognized: true,
    successRendered: true,
    links: await page.locator('a').evaluateAll(anchors => anchors.map(a => ({ text: (a.textContent || '').trim(), href: a.getAttribute('href') })).filter(x => x.href)),
  };

  if (!importId || importId === 'غير متاح') throw new Error('REAL_REPORT_IMPORT_JOB_ID_MISSING');

  const authState = await page.evaluate(() => {
    const raw = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1];
    if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND');
    const parsed = JSON.parse(raw);
    return { accessToken: parsed?.access_token || null };
  });
  if (!authState.accessToken) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND');

  const records = await page.evaluate(async ({ url, key, token, jobId }) => {
    const endpoint = url.replace(/\/$/, '') + '/rest/v1/canonical_dataset_records?select=id,row_number,semantic_domain,source_hash,import_job_id&import_job_id=eq.' + encodeURIComponent(jobId) + '&order=row_number.asc&limit=500';
    const response = await fetch(endpoint, { headers: { apikey: key, Authorization: 'Bearer ' + token } });
    const body = await response.text();
    if (!response.ok) throw new Error('CANONICAL_RECORDS_HTTP_' + response.status + ':' + body.slice(0, 500));
    return JSON.parse(body);
  }, { url: supabaseURL, key: anonKey, token: authState.accessToken, jobId: importId });
  result.canonicalRecords = records;
  if (!records.length) throw new Error('REAL_REPORT_CANONICAL_RECORDS_EMPTY');
  if (records.some(row => row.source_hash !== 'sha256:' + result.fixture.sha256)) throw new Error('REAL_REPORT_CANONICAL_SOURCE_HASH_MISMATCH');

  const linkedHrefs = [...new Set(result.importUI.links.map(x => x.href).filter(h => ['/reports','/reports/executive','/trust','/decision-experience','/work-center','/data-quality'].includes(h)))];
  const domainHref = result.importUI.links.find(x => /\/reports\//.test(x.href || ''))?.href;
  for (const href of [...new Set([...linkedHrefs, domainHref].filter(Boolean))]) {
    const target = await context.newPage();
    const errors = [];
    target.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    target.on('pageerror', e => errors.push(e.message));
    await target.goto(new URL(href, baseURL).toString(), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await target.waitForTimeout(800);
    const bodyLength = (await target.locator('body').innerText()).trim().length;
    const route = new URL(target.url()).pathname;
    result.routes.push({ href, route, bodyLength, consoleErrors: errors });
    if (!bodyLength) throw new Error('EMPTY_RESULT_SURFACE:' + route);
    await target.close();
  }

  if (result.consoleErrors.length) throw new Error('REAL_REPORT_BROWSER_CONSOLE_ERRORS:' + result.consoleErrors.slice(0, 5).join(' | '));
  result.status = 'PASS';
} catch (error) {
  result.status = 'FAIL';
  result.error = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await fs.writeFile(path.join(outDir, 'result.json'), JSON.stringify(result, null, 2));
  await page.screenshot({ path: path.join(outDir, 'final.png'), fullPage: true }).catch(() => {});
  await browser.close();
}
