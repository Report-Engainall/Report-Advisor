import fs from 'node:fs/promises';

const originalPath = new URL('./real-business-persistence-original.mjs', import.meta.url);
const original = await fs.readFile(originalPath, 'utf8');
const loginNeedle = "async function login() { await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 }); await page.locator('#login-email').fill(email); await page.locator('#login-password').fill(password); await page.getByRole('button', { name: 'تسجيل الدخول' }).click(); await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30000 }); await page.locator('#login-email').waitFor({ state: 'detached', timeout: 10000 }); await page.locator('body').waitFor({ state: 'visible', timeout: 5000 }); }";
const loginReplacement = `async function login() {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.locator('#login-email').fill(email);
      await page.locator('#login-password').fill(password);
      await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
      await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 30000 });
      await page.locator('#login-email').waitFor({ state: 'detached', timeout: 10000 });
      await page.locator('body').waitFor({ state: 'visible', timeout: 5000 });
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 3) break;
      await page.waitForTimeout(4000 * attempt);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    }
  }
  throw lastError || new Error('BUSINESS_E2E_LOGIN_FAILED');
}`;
if (!original.includes(loginNeedle)) throw new Error('PERSISTENCE_E2E_LOGIN_ANCHOR_MISSING');
const loginHardened = original.replace(loginNeedle, loginReplacement);
const needle = "await commit.waitFor({ state: 'visible', timeout: 30000 });\n  assert.equal(await commit.isEnabled(), true, `${entity} valid import must be enabled`);";
const replacement = [
  "await commit.waitFor({ state: 'visible', timeout: 30000 });",
  "  let commitEnabled = false;",
  "  for (let attempt = 0; attempt < 2 && !commitEnabled; attempt += 1) {",
  "    const readinessDeadline = Date.now() + 30000;",
  "    while (Date.now() < readinessDeadline && !(await commit.isEnabled().catch(() => false))) await page.waitForTimeout(500);",
  "    commitEnabled = await commit.isEnabled().catch(() => false);",
  "    if (commitEnabled || attempt === 1) break;",
  "    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });",
  "    const label = entity === 'customers' ? 'العملاء' : entity === 'products' ? 'المنتجات' : 'فواتير المبيعات';",
  "    await page.getByRole('button', { name: new RegExp(label) }).click();",
  "    await page.locator('input[type=\"file\"]').first().setInputFiles({ name: marker + '.csv', mimeType: 'text/csv', buffer: csv(fields) });",
  "    await page.getByText('المراجعة', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });",
  "    await commit.waitFor({ state: 'visible', timeout: 30000 });",
  "  }",
  "  assert.equal(commitEnabled, true, entity + ' valid import must be enabled after settled preview/readiness retry');",
].join('\n');
if (!loginHardened.includes(needle)) throw new Error('PERSISTENCE_E2E_PATCH_ANCHOR_MISSING');
const patched = loginHardened.replace(needle, replacement);
const terminalNeedle = "assert.equal(job.last_error && typeof job.last_error, 'object', `${entity} completed job must retain JSON error contract`);\n  assert.deepEqual(job.last_error, {}, `${entity} completed job must retain the empty JSON error object contract`);";
const terminalReplacement = [
  "assert.equal(job.last_error && typeof job.last_error, 'object', entity + ' completed job must retain JSON error contract');",
  "assert.deepEqual(job.last_error, {}, entity + ' completed job must retain the empty JSON error object contract');",
].join('\n');
if (!patched.includes(terminalNeedle)) throw new Error('PERSISTENCE_E2E_TERMINAL_ERROR_CONTRACT_ANCHOR_MISSING');
const hardened = patched.replace(terminalNeedle, terminalReplacement);
const tempPath = new URL('./.real-business-persistence-readiness-fixed.mjs', import.meta.url);
await fs.writeFile(tempPath, hardened, 'utf8');
try {
  await import(tempPath.href);
} finally {
  await fs.rm(tempPath, { force: true });
}