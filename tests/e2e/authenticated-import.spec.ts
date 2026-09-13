import { test, expect } from '@playwright/test';
import path from 'node:path';

test('authenticated CanonicalImportPage imports canonical sales invoices', async ({ page }) => {
  const baseUrl = process.env.E2E_BASE_URL;
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  const supabaseUrl = process.env.E2E_SUPABASE_URL;
  const anonKey = process.env.E2E_SUPABASE_ANON_KEY;
  if (!baseUrl || !email || !password || !supabaseUrl || !anonKey) throw new Error('AUTHENTICATED_CERTIFICATION_ENV_MISSING');

  const fixture = path.resolve(process.cwd(), 'tests/fixtures/canonical_sales_invoices_2026.csv');
  const importPath = process.env.E2E_IMPORT_PATH ?? '/import';
  const apiBase = supabaseUrl.replace(/\/$/, '');
  const deploymentBase = new URL(baseUrl);
  const deploymentUrl = (pathname: string) => { const target = new URL(pathname, deploymentBase); target.search = deploymentBase.search; return target.toString(); };

  async function authenticatedRest(pathname: string, init: RequestInit = {}) {
    return page.evaluate(async ({ apiBase, anonKey, pathname, init }) => {
      const authEntry = Object.entries(localStorage).find(([key]) => key.includes('-auth-token'))?.[1];
      if (!authEntry) throw new Error('AUTH_SESSION_NOT_FOUND');
      const session = JSON.parse(authEntry);
      if (!session?.access_token) throw new Error('ACCESS_TOKEN_NOT_FOUND');
      const response = await fetch(`${apiBase}${pathname}`, { ...init, headers: { apikey: anonKey, Authorization: `Bearer ${session.access_token}`, ...(init.headers ?? {}) } });
      const text = await response.text();
      if (!response.ok) throw new Error(`REST_${response.status}: ${text}`);
      return text ? JSON.parse(text) : null;
    }, { apiBase, anonKey, pathname, init });
  }

  await page.goto(deploymentUrl('/login'), { waitUntil: 'networkidle' });
  await page.getByLabel(/email|البريد الإلكتروني/i).fill(email);
  await page.getByLabel(/password|كلمة المرور/i).fill(password);
  await page.getByRole('button', { name: /sign in|login|دخول|تسجيل/i }).click();
  await page.waitForFunction(() => Object.keys(localStorage).some((key) => key.includes('-auth-token')), undefined, { timeout: 15_000 });

  const authenticatedUser = await authenticatedRest('/auth/v1/user');
  const userId = String(authenticatedUser?.id ?? '');
  if (!userId) throw new Error('AUTHENTICATED_USER_ID_MISSING');
  const memberships = await authenticatedRest(`/rest/v1/company_memberships?select=company_id,user_id&user_id=eq.${encodeURIComponent(userId)}`);
  expect(memberships).toHaveLength(1);
  expect(String(memberships[0].user_id)).toBe(userId);
  const tenant = await authenticatedRest('/rest/v1/rpc/current_company_id', { method: 'POST' });
  const tenantId = String(tenant);
  expect(tenantId).toBe(String(memberships[0].company_id));

  const beforeImports = await authenticatedRest('/rest/v1/imports?select=id,company_id,file_name,status&file_name=eq.canonical_sales_invoices_2026.csv');
  const beforeInvoices = await authenticatedRest('/rest/v1/sales_invoices?select=id');
  expect(beforeImports).toHaveLength(0);
  const beforeInvoiceCount = beforeInvoices.length;

  await page.goto(deploymentUrl(importPath), { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(new RegExp(importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toHaveCount(1);
  await fileInput.setInputFiles(fixture);
  await expect(page.getByText(/canonical_sales_invoices_2026\.csv/i)).toBeVisible();
  await expect(page.getByText(/4 إجمالي/)).toBeVisible();
  const commitButton = page.getByRole('button', { name: /commit|import|استيراد|اعتماد|تنفيذ|تأكيد الاستيراد/i }).last();
  await expect(commitButton).toBeEnabled();
  await commitButton.click();
  await expect(page.getByText(/تم الاستيراد بنجاح|completed|success/i).first()).toBeVisible({ timeout: 30_000 });

  const afterImports = await authenticatedRest('/rest/v1/imports?select=id,company_id,file_name,status,total_rows,valid_rows,invalid_rows,entity_type&file_name=eq.canonical_sales_invoices_2026.csv');
  expect(afterImports).toHaveLength(1);
  expect(afterImports[0].company_id).toBe(tenantId);
  expect(afterImports[0].status).toBe('completed');
  expect(afterImports[0].total_rows).toBe(4);
  expect(afterImports[0].valid_rows).toBe(4);
  expect(afterImports[0].invalid_rows).toBe(0);
  expect(afterImports[0].entity_type).toBe('sales_invoices');

  const afterInvoices = await authenticatedRest('/rest/v1/sales_invoices?select=id,invoice_number,company_id');
  expect(afterInvoices.length).toBe(beforeInvoiceCount + 4);
  for (const invoiceNumber of ['INV-2026-001', 'INV-2026-002', 'INV-2026-003', 'INV-2026-004']) {
    const rows = afterInvoices.filter((row: { invoice_number: string; company_id: string }) => row.invoice_number === invoiceNumber);
    expect(rows).toHaveLength(1);
    expect(rows[0].company_id).toBe(tenantId);
  }

  const evidence = await authenticatedRest('/rest/v1/rpc/capture_kpi_evidence_snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_kpi_key: 'dashboard.total_sales', p_as_of: '2026-09-13', p_months: 6 }),
  });
  expect(evidence.company_id).toBe(tenantId);
  expect(evidence.kpi_key).toBe('dashboard.total_sales');
  expect(Number(evidence.value)).toBeGreaterThanOrEqual(0);
  expect(evidence.source_evidence.source_rpc).toBe('get_dashboard_snapshot');
  expect(evidence.source_evidence.company_id).toBe(tenantId);

  const evidenceRows = await authenticatedRest(`/rest/v1/kpi_evidence_snapshots?select=id,company_id,kpi_key,value,quality&id=eq.${encodeURIComponent(evidence.id)}`);
  expect(evidenceRows).toHaveLength(1);
  expect(evidenceRows[0].company_id).toBe(tenantId);
  expect(evidenceRows[0].kpi_key).toBe('dashboard.total_sales');

  await page.goto(deploymentUrl('/'), { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'لوحة القيادة' })).toBeVisible();
  await expect(page.getByText('إجمالي المبيعات')).toBeVisible();
  await expect(page.getByText('عدد الفواتير')).toBeVisible();
  await expect(page.getByText('بيانات محسوبة من المصدر')).toBeVisible();
});
