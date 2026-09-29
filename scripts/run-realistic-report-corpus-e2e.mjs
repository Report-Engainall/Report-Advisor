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
const outDir = path.resolve(process.env.E2E_REPORT_DIR || 'artifacts/realistic-report-corpus-e2e');
await fs.mkdir(outDir, { recursive: true });

if (!supabaseURL || !anonKey || !email || !password) throw new Error('REAL_REPORT_CORPUS_E2E_CREDENTIALS_OR_SUPABASE_MISSING');

const sortNfc = (a, b) => a.normalize('NFC').localeCompare(b.normalize('NFC'), 'en');
const sha256 = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const allowed = /\.(xlsx|xls|csv|pdf|docx|json|txt)$/i;

const names = (await fs.readdir(fixtureRoot))
  .filter(name => name !== 'README.md')
  .filter(name => allowed.test(name))
  .sort(sortNfc);

if (!names.length) throw new Error('REAL_REPORT_CORPUS_EMPTY');

const result = {
  exactHead,
  browser: 'Microsoft Edge',
  corpusCount: names.length,
  discovered: names.length,
  registered: names.length,
  processed: 0,
  blockedOrReview: 0,
  failed: 0,
  reports: [],
  startedAt: new Date().toISOString(),
};

const persist = async () => {
  result.processed = result.reports.filter(r => r.state === 'COMPLETED').length;
  result.blockedOrReview = result.reports.filter(r => r.state === 'BLOCKED' || r.state === 'REVIEW').length;
  result.failed = result.reports.filter(r => r.state === 'FAILED').length;
  await fs.writeFile(path.join(outDir, 'checkpoint.json'), JSON.stringify(result, null, 2));
};

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
page.on('console', msg => { if (msg.type() === 'error') result.lastConsoleError = msg.text(); });
page.on('pageerror', err => { result.lastPageError = err.message; });

async function login() {
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
}

async function token() {
  return page.evaluate(() => {
    const raw = Object.entries(localStorage).find(([key]) => key.endsWith('-auth-token'))?.[1];
    if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND');
    const accessToken = JSON.parse(raw)?.access_token;
    if (!accessToken) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND');
    return accessToken;
  });
}

async function canonicalRecords(importId) {
  const accessToken = await token();
  return page.evaluate(async ({ url, key, bearer, jobId }) => {
    const endpoint = url.replace(/\/$/, '') + '/rest/v1/canonical_dataset_records?select=id,row_number,semantic_domain,source_hash,import_job_id,data&import_job_id=eq.' + encodeURIComponent(jobId) + '&order=row_number.asc&limit=50000';
    const response = await fetch(endpoint, { headers: { apikey: key, Authorization: 'Bearer ' + bearer } });
    const body = await response.text();
    if (!response.ok) throw new Error('CANONICAL_RECORDS_HTTP_' + response.status + ':' + body.slice(0, 500));
    return JSON.parse(body);
  }, { url: supabaseURL, key: anonKey, bearer: accessToken, jobId: importId });
}

async function surfaceProof(importId) {
  const target = await context.newPage();
  const errors = [];
  target.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  target.on('pageerror', err => errors.push(err.message));
  try {
    await target.goto(baseURL + '/reports/imported/' + encodeURIComponent(importId), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await target.getByText('Evidence Passport', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
    const body = await target.locator('body').innerText();
    for (const marker of ['Executive Report', 'Evidence Passport', 'Domain Report', 'Decision Surface / Work Center', 'Benchmark / Learning']) {
      if (!body.includes(marker)) throw new Error('SOURCE_RESULT_SURFACE_MARKER_MISSING:' + marker);
    }
    return { path: '/reports/imported/' + importId, bodyLength: body.length, consoleErrors: errors };
  } finally {
    await target.close();
  }
}

try {
  await login();
  for (let index = 0; index < names.length; index += 1) {
    const name = names[index];
    const fixturePath = path.join(fixtureRoot, name);
    const bytes = await fs.readFile(fixturePath);
    const fingerprint = sha256(bytes);
    const record = {
      index: index + 1,
      path: path.relative(process.cwd(), fixturePath).replaceAll('\\', '/'),
      filename: name,
      byteSize: bytes.length,
      sha256: fingerprint,
      browser: 'Microsoft Edge',
      state: 'FAILED',
      startedAt: new Date().toISOString(),
    };
    try {
      await page.goto(baseURL + '/import', { waitUntil: 'domcontentloaded', timeout: 30000 });
      const input = page.locator('input[type="file"]').first();
      await input.setInputFiles(fixturePath);

      const ready = page.getByText('مراجعة قبل الاعتماد', { exact: false });
      let previewReady = false;
      try {
        await ready.waitFor({ state: 'visible', timeout: 180000 });
        previewReady = true;
      } catch {
        previewReady = false;
      }

      const bodyBeforeCommit = await page.locator('body').innerText();
      if (!previewReady) {
        if (bodyBeforeCommit.includes('جودة البيانات أقل من 50%') || bodyBeforeCommit.includes('الملف فارغ') || bodyBeforeCommit.includes('تعذر تحديد صيغة الملف')) {
          record.state = 'BLOCKED';
        } else if (bodyBeforeCommit.includes('موافقة جودة صريحة') || bodyBeforeCommit.includes('يحتاج موافقة')) {
          record.state = 'REVIEW';
        } else {
          record.state = 'FAILED';
        }
        record.reason = bodyBeforeCommit.slice(-1600);
        result.reports.push(record);
        await persist();
        continue;
      }

      const approval = page.locator('label').filter({ hasText: 'موافقة جودة صريحة' }).locator('input[type="checkbox"]');
      if (await approval.count() && await approval.isVisible()) await approval.check();

      const commitButton = page.getByRole('button', { name: /اعتماد المصدر/ }).first();
      await commitButton.waitFor({ state: 'visible', timeout: 30000 });
      if (await commitButton.isDisabled()) {
        record.state = 'REVIEW';
        record.reason = 'REAL_REPORT_IMPORT_COMMIT_BUTTON_DISABLED';
        result.reports.push(record);
        await persist();
        continue;
      }

      await commitButton.click();
      const success = page.getByText('تم اعتماد المصدر وربطه بمسار العمل', { exact: false });
      const failure = page.locator('text=/تعذر اعتماد المصدر|لم يكتمل التنفيذ الخادمي|المصدر يحتاج موافقة مراجعة/').first();
      try {
        await Promise.race([
          success.waitFor({ state: 'visible', timeout: 180000 }),
          failure.waitFor({ state: 'visible', timeout: 180000 }),
        ]);
      } catch {
        throw new Error('IMPORT_COMMIT_RESULT_TIMEOUT');
      }

      if (!(await success.count()) || !(await success.isVisible().catch(() => false))) {
        const failureText = await page.locator('body').innerText();
        record.state = failureText.includes('موافقة مراجعة') ? 'REVIEW' : 'FAILED';
        record.reason = failureText.slice(-1600);
        result.reports.push(record);
        await persist();
        continue;
      }

      const bodyAfterCommit = await page.locator('body').innerText();
      const importMatch = bodyAfterCommit.match(/Import Job:\s*([^\n]+)/);
      const importId = importMatch?.[1]?.trim();
      if (!importId || importId === 'غير متاح') throw new Error('REAL_REPORT_IMPORT_JOB_ID_MISSING');

      const records = await canonicalRecords(importId);
      if (!records.length) throw new Error('REAL_REPORT_CANONICAL_RECORDS_EMPTY');
      if (records.some(row => row.source_hash !== 'sha256:' + fingerprint)) throw new Error('REAL_REPORT_CANONICAL_SOURCE_HASH_MISMATCH');
      if (records.some(row => String(row.import_job_id) !== importId)) throw new Error('REAL_REPORT_CANONICAL_IMPORT_JOB_MISMATCH');

      const sourceSurface = await surfaceProof(importId);
      record.state = 'COMPLETED';
      record.importJobId = importId;
      record.snapshotId = bodyAfterCommit.match(/Snapshot:\s*([^\n]+)/)?.[1]?.trim() ?? null;
      record.executionJobId = bodyAfterCommit.match(/Execution Job:\s*([^\n]+)/)?.[1]?.trim() ?? null;
      record.canonicalRowCount = records.length;
      record.semanticDomains = [...new Set(records.map(row => row.semantic_domain))];
      record.surface = sourceSurface;
      result.reports.push(record);
      await persist();
    } catch (error) {
      record.state = 'FAILED';
      record.reason = error instanceof Error ? error.message : String(error);
      result.reports.push(record);
      await persist();
    }
  }

  const unhandled = result.discovered - result.reports.length;
  const unaccounted = result.discovered - (result.processed + result.blockedOrReview + result.failed);
  result.final = {
    unhandled,
    unaccounted,
    noFileLeftBehind: unhandled === 0 && unaccounted === 0,
    processed: result.processed,
    blockedOrReview: result.blockedOrReview,
    failed: result.failed,
  };
  result.status = result.final.noFileLeftBehind && result.failed === 0 ? 'PASS' : 'FAIL';
  result.completedAt = new Date().toISOString();
  await persist();
  if (result.status !== 'PASS') throw new Error('REAL_REPORT_CORPUS_GATE_FAILED:' + JSON.stringify(result.final));
} finally {
  await browser.close().catch(() => {});
}
