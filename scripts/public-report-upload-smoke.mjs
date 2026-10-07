import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const fixture = resolve(root, 'tests/fixtures/realistic-reports/28-inventory-stockout-reorder.csv');
const previewArgs = ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4176'];
const command = process.platform === 'win32' ? (process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe') : 'npm';
const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm ' + previewArgs.join(' ')] : previewArgs;
const child = spawn(command, args, {
  cwd: root,
  env: { ...process.env, VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
try {
  let ready = false;
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch('http://127.0.0.1:4176/try-report');
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await wait(250);
  }
  if (!ready) throw new Error('TRY_REPORT_SERVER_NOT_READY');

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));

  await page.goto('http://127.0.0.1:4176/try-report', { waitUntil: 'networkidle' });
  await page.locator('input[type="file"]').setInputFiles(fixture);
  await page.getByText('تم التعرف على المصدر', { exact: false }).waitFor({ state: 'visible', timeout: 30000 });

  const body = (await page.locator('body').innerText()).replace(/\\s+/g, ' ').trim();
  const required = [
    '28-inventory-stockout-reorder.csv',
    'بصمة SHA-256',
    'الصفوف',
    'الأعمدة',
    'التقرير الاستشاري الأولي',
    'ماذا نفعل الآن؟',
    'حد الدليل',
    'تحويل إلى تقرير ذكي'
  ];
  for (const item of required) {
    if (!body.includes(item)) throw new Error('TRY_REPORT_MISSING:' + item);
  }
  const dataRows = await page.locator('table').last().locator('tbody tr').count();
  if (dataRows !== 12) throw new Error('TRY_REPORT_ROW_COUNT:' + dataRows);
  const tableText = await page.locator('table').last().innerText();
  if (!tableText.includes('DOC-28-001') || !tableText.includes('DOC-28-012')) throw new Error('TRY_REPORT_SOURCE_RANGE_MISSING');
  if (!tableText.includes('SKU-1') || !tableText.includes('WH-1') || !tableText.includes('صنف 1')) throw new Error('TRY_REPORT_SOURCE_TEXT_CORRUPTED');
  if (!body.includes('1.84') && !body.includes('تغطية 1.84')) throw new Error('TRY_REPORT_ADVISOR_COVERAGE_MISSING');
  if (!body.includes('إعادة الطلب')) throw new Error('TRY_REPORT_ADVISOR_ACTION_MISSING');
  if (errors.length) throw new Error('TRY_REPORT_PAGEERROR:' + errors[0]);
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (metrics.scrollWidth > metrics.clientWidth + 2) throw new Error('TRY_REPORT_HORIZONTAL_OVERFLOW');

  console.log('TRY_REPORT_UPLOAD_PASS rows=12 columns=11');
  console.log('public-report-upload-smoke: PASS');
  await browser.close();
} finally {
  child.kill('SIGTERM');
  await wait(250);
}
