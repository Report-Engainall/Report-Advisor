import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/commercial-upwork-demo';
for (const [name, value] of Object.entries({ supabaseURL, anonKey, email, password })) if (!value) throw new Error(`COMMERCIAL_UPWORK_E2E_ENV_MISSING:${name}`);
await fs.mkdir(reportDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
const evidence = { exactHead, baseURL, startedAt: new Date().toISOString(), status: 'NOT_PROVEN', failures: [] };

try {
  page.on('console', msg => { if (msg.type() === 'error') evidence.failures.push(`console:${msg.text()}`); });
  page.on('pageerror', error => evidence.failures.push(`pageerror:${error.message}`));
  page.on('requestfailed', request => { const reason = request.failure()?.errorText || 'unknown'; if (reason !== 'net::ERR_ABORTED') evidence.failures.push(`request:${request.method()} ${request.url()} ${reason}`); });
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await page.locator('#login-email').waitFor({ state: 'hidden', timeout: 30000 });
  await page.getByRole('button', { name: 'تسجيل الخروج' }).waitFor({ state: 'visible', timeout: 30000 });
  await page.goto(`${baseURL}/proposal-demo`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.getByRole('heading', { name: /حوّل متطلبات الوظيفة/ }).waitFor({ state: 'visible', timeout: 10000 });

  const title = 'Senior Business Intelligence Analyst';
  const client = 'Evidence-First Retail Client';
  const requirements = [
    'Dashboard with sales and financial KPIs',
    'Excel/CSV import and validation',
    'Receivables and aging analysis',
    'Inventory and demand forecasting',
    'Recommendations and decision support',
  ].join('\n');
  await page.locator('#proposal-demo-title').fill(title);
  await page.locator('#proposal-demo-client').fill(client);
  await page.locator('#proposal-demo-requirements').fill(requirements);

  const matchedCount = await page.locator('text=قدرة موجودة').count();
  assert.equal(matchedCount, 5, 'all five supplied requirements should map to existing capabilities');
  const reviewCount = await page.locator('text=يحتاج مراجعة بشرية').count();
  assert.equal(reviewCount, 0, 'known requirements must not be reported as unmatched');

  await page.screenshot({ path: `${reportDir}/proposal-demo.png`, fullPage: true });
  const demoLink = page.locator('a').filter({ hasText: 'Live Demo' }).first();
  await demoLink.click();
  await page.waitForURL(url => url.pathname === '/', { timeout: 10000 });
  await page.getByRole('heading', { name: /مركز القيادة|لوحة القيادة/ }).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  await page.screenshot({ path: `${reportDir}/live-demo-route.png`, fullPage: true });

  await page.goBack({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForURL(url => url.pathname === '/proposal-demo', { timeout: 10000 });
  await page.evaluate(() => document.fonts?.ready);
  const pdfPath = `${reportDir}/proposal-demo.pdf`;
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' } });
  const pdfTextPath = `${reportDir}/proposal-demo.txt`;
  execFileSync('pdftotext', [pdfPath, pdfTextPath]);
  const pdfText = await fs.readFile(pdfTextPath, 'utf8');
  assert.match(pdfText, /Senior Business Intelligence Analyst/);
  assert.match(pdfText, /Evidence-First Retail Client/);
  assert.match(pdfText, /Capability Mapping/);
  assert.match(pdfText, /Live Demo Sequence/);
  evidence.status = 'PASS';
  evidence.matchedCount = matchedCount;
  evidence.pdf = { verified: true, path: pdfPath };
} catch (error) {
  evidence.status = 'FAIL';
  evidence.error = error instanceof Error ? error.message : String(error);
  await page.screenshot({ path: `${reportDir}/failure.png`, fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  evidence.finishedAt = new Date().toISOString();
  await fs.writeFile(`${reportDir}/result.json`, JSON.stringify(evidence, null, 2));
  await browser.close();
}
console.log(JSON.stringify(evidence, null, 2));
