import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e-business';
for (const [name, value] of Object.entries({ supabaseURL, anonKey, email, password })) if (!value) throw new Error(`BUSINESS_PERSISTENCE_E2E_ENV_MISSING:${name}`);
await fs.mkdir(reportDir, { recursive: true });
const evidence = { exactHead, status: 'NOT_PROVEN', tenant: null, entities: {}, steps: [], failures: [] };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'ar-SA' });
const page = await context.newPage();
page.on('console', m => { if (m.type() === 'error') evidence.failures.push(`console:${m.text()}`); });
page.on('pageerror', e => evidence.failures.push(`pageerror:${e.message}`));
page.on('requestfailed', r => { const e = r.failure()?.errorText || 'unknown'; if (e !== 'net::ERR_ABORTED') evidence.failures.push(`request:${r.method()} ${r.url()} ${e}`); });
async function token() { return page.evaluate(() => { const raw = Object.entries(localStorage).find(([k]) => k.endsWith('-auth-token'))?.[1]; if (!raw) throw new Error('BROWSER_SESSION_NOT_FOUND'); const s = JSON.parse(raw); if (!s?.access_token) throw new Error('BROWSER_ACCESS_TOKEN_NOT_FOUND'); return s.access_token; }); }
async function rest(table, fields, filters = {}) { const u = new URL(`${supabaseURL}/rest/v1/${table}`); u.searchParams.set('select', fields); for (const [k, v] of Object.entries(filters)) u.searchParams.set(k, `eq.${v}`); const r = await fetch(u, { headers: { apikey: anonKey, Authorization: `Bearer ${await token()}` } }); const b = await r.text(); assert.equal(r.ok, true, `${table} read HTTP ${r.status}: ${b}`); return b ? JSON.parse(b) : []; }
async function tenant() { const r = await fetch(`${supabaseURL}/rest/v1/rpc/current_company_id`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' }, body: '{}' }); const b = await r.text(); assert.equal(r.ok, true, `current_company_id HTTP ${r.status}: ${b}`); return b.replaceAll('"', '').trim(); }
function csv(fields) { return Buffer.from(`\ufeff${Object.keys(fields).join(',')}\n${Object.values(fields).map(v => String(v).replaceAll(',', ' ')).join(',')}\n`, 'utf8'); }
async function login() { await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 }); await page.locator('#login-email').fill(email); await page.locator('#login-password').fill(password); await page.getByRole('button', { name: 'تسجيل الدخول' }).click(); await page.waitForTimeout(1000); assert.equal(await page.locator('#login-email').count(), 0); }
async function importOne(entity, fields, marker) { const buffer = csv(fields); await page.goto(`${baseURL}/import`, { waitUntil: 'networkidle', timeout: 30000 }); const label = entity === 'customers' ? 'العملاء' : entity === 'products' ? 'المنتجات' : 'فواتير المبيعات'; await page.getByRole('button', { name: new RegExp(label) }).click(); await page.locator('input[type="file"]').first().setInputFiles({ name: `${marker}.csv`, mimeType: 'text/csv', buffer }); await page.getByText('المراجعة', { exact: true }).waitFor({ state: 'visible', timeout: 30000 }); const commit = page.getByRole('button', { name: /اعتماد وكتابة/ }); await commit.waitFor({ state: 'visible', timeout: 30000 }); assert.equal(await commit.isEnabled(), true); await commit.click(); await page.getByText('النتيجة', { exact: true }).locator('..').waitFor({ state: 'visible', timeout: 30000 }); await page.waitForFunction(() => { const el = [...document.querySelectorAll('[aria-label="مراحل الاستيراد"] div')].find(e => e.textContent?.trim() === 'النتيجة'); return !!el?.parentElement?.className.includes('border-success-200'); }); assert.equal(await page.getByText(/فشل الاستيراد:/).count(), 0); const line = await page.getByText(/معرّف التنفيذ المتين:/).textContent(); const jobId = line?.split(':').slice(1).join(':').trim() || ''; assert.match(jobId, /^[0-9a-f-]{36}$/i); return { jobId, buffer };
}
async function assertJob(jobId, entity, expectedCount) { const jobs = await rest('report_execution_jobs', 'id,company_id,source_hash,status,checkpoint,last_error', { id: jobId, company_id: evidence.tenant }); assert.equal(jobs.length, 1); const job = jobs[0]; assert.equal(job.status, 'completed'); assert.equal(job.checkpoint?.stage, 'rendered'); assert.equal(job.last_error, null); assert.equal(job.checkpoint?.sourceHash, job.source_hash); assert.ok(Array.isArray(job.checkpoint?.evidenceKeys)); assert.ok(job.checkpoint.evidenceKeys.includes(`canonical-import:${job.source_hash}:source`)); assert.ok(job.checkpoint.evidenceKeys.includes(`canonical-import:${job.source_hash}:reconciliation`)); evidence.steps.push({ step: `job:${entity}`, status: 'PASS', jobId, sourceHash: job.source_hash, checkpoint: job.checkpoint }); return job.source_hash; }
try {
  await login();
  evidence.tenant = await tenant();
  assert.match(evidence.tenant, /^[0-9a-f-]{36}$/i);
  const suffix = `${Date.now()}-${process.pid}`;
  const customerCode = `E2E-C-${suffix}`;
  const customer = { name: `E2E عميل ${suffix}`, code: customerCode, phone: '777000000', email: `e2e-${suffix}@example.invalid`, segment: 'retail', credit_limit: 0, payment_terms_days: 0 };
  const first = await importOne('customers', customer, `customer-${suffix}`);
  const sourceHash = await assertJob(first.jobId, 'customers', 1);
  const persisted = await rest('customers', 'id,name,code,company_id', { company_id: evidence.tenant, code: customerCode });
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0].company_id, evidence.tenant);
  evidence.entities.customer = persisted[0];
  evidence.steps.push({ step: 'customer-db-readback', status: 'PASS', id: persisted[0].id });
  const duplicate = await importOne('customers', customer, `customer-duplicate-${suffix}`);
  const duplicateHash = await assertJob(duplicate.jobId, 'customers', 1);
  assert.equal(duplicateHash, sourceHash);
  const afterDuplicate = await rest('customers', 'id,name,code,company_id', { company_id: evidence.tenant, code: customerCode });
  assert.equal(afterDuplicate.length, 1, 'duplicate import must not create a second canonical customer');
  assert.equal(afterDuplicate[0].id, persisted[0].id, 'idempotent duplicate must resolve to the original canonical row');
  evidence.steps.push({ step: 'server-idempotency-readback', status: 'PASS', sourceHash, originalId: persisted[0].id, duplicateJobId: duplicate.jobId });
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(await tenant(), evidence.tenant);
  evidence.steps.push({ step: 'refresh-session-readback', status: 'PASS' });
  evidence.status = 'PASS';
} catch (error) { evidence.failures.push(error instanceof Error ? error.stack || error.message : String(error)); evidence.status = 'FAIL'; throw error; } finally { evidence.finishedAt = new Date().toISOString(); await fs.writeFile(`${reportDir}/real-business-persistence-no-ledger.json`, JSON.stringify(evidence, null, 2)); await page.close(); await context.close(); await browser.close(); }
