import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const previewArgs = ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4174'];
const command = process.platform === 'win32' ? (process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe') : 'npm';
const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm ' + previewArgs.join(' ')] : previewArgs;
const child = spawn(command, args, {
  cwd: root,
  env: { ...process.env, VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const logs = [];
child.stdout.on('data', chunk => logs.push(String(chunk)));
child.stderr.on('data', chunk => logs.push(String(chunk)));

try {
  let ready = false;
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch('http://127.0.0.1:4174/');
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await wait(250);
  }
  if (!ready) throw new Error('PUBLIC_PREVIEW_SERVER_NOT_READY');

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const cases = [
    ['/proposal-demo', 'العرض التجاري'],
    ['/reports/inventory?demo=1', 'تقرير المخزون'],
    ['/reports/sales?demo=1', 'المبيعات'],
    ['/decision-experience?demo=1', 'تجربة القرار'],
    ['/try-report', 'مختبر الملفات والبيانات'],
  ];

  for (const [path, expected] of cases) {
    const errors = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4174' + path, { waitUntil: 'networkidle' });
    const text = (await page.locator('body').innerText()).replace(/\\s+/g, ' ').trim();
    if (!text) throw new Error('PUBLIC_PREVIEW_BLANK:' + path);
    if (errors.length) throw new Error('PUBLIC_PREVIEW_PAGEERROR:' + path + ':' + errors[0]);
    if (!text.includes(expected)) throw new Error('PUBLIC_PREVIEW_MISSING_TEXT:' + path + ':' + expected);
    console.log('PUBLIC_PREVIEW_PASS', path);
  }

  await browser.close();
  console.log('public-preview-smoke: PASS');
} finally {
  child.kill('SIGTERM');
  await wait(250);
}
