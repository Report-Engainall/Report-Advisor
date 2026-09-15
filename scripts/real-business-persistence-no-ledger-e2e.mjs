import fs from 'node:fs/promises';

const originalPath = new URL('./real-business-persistence-original.mjs', import.meta.url);
const original = await fs.readFile(originalPath, 'utf8');
const needle = "await commit.waitFor({ state: 'visible', timeout: 30000 });\n  assert.equal(await commit.isEnabled(), true, `${entity} valid import must be enabled`);";
const replacement = "await commit.waitFor({ state: 'visible', timeout: 30000 });\n  const readinessDeadline = Date.now() + 30000;\n  while (Date.now() < readinessDeadline && !(await commit.isEnabled().catch(() => false))) await page.waitForTimeout(500);\n  assert.equal(await commit.isEnabled(), true, `${entity} valid import must be enabled after readiness settles`);";
if (!original.includes(needle)) throw new Error('PERSISTENCE_E2E_PATCH_ANCHOR_MISSING');
const patched = original.replace(needle, replacement);
const tempPath = new URL('./.real-business-persistence-readiness-fixed.mjs', import.meta.url);
await fs.writeFile(tempPath, patched, 'utf8');
try {
  await import(tempPath.href);
} finally {
  await fs.rm(tempPath, { force: true });
}
