import { test, expect } from '@playwright/test';
import path from 'node:path';

/**
 * Real authenticated Staging import certification.
 * Required secrets are deliberately injected only at runtime.
 */
test('authenticated CanonicalImportPage imports canonical sales invoices', async ({ page }) => {
  const baseUrl = process.env.E2E_BASE_URL;
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  const supabaseUrl = process.env.E2E_SUPABASE_URL;
  const anonKey = process.env.E2E_SUPABASE_ANON_KEY;
  const expectedTenantId = process.env.E2E_EXPECTED_TENANT_ID;

  if (!baseUrl || !email || !password || !supabaseUrl || !anonKey || !expectedTenantId) {
    throw new Error('AUTHENTICATED_CERTIFICATION_ENV_MISSING');
  }

  const fixture = path.resolve(process.cwd(), 'tests/fixtures/canonical_sales_invoices_2026.csv');
  const importPath = process.env.E2E_IMPORT_PATH ?? '/import';
  const apiBase = supabaseUrl.replace(/\/$/, '');

  async function authenticatedRest(pathname: string, init: RequestInit = {}) {
    return page.evaluate(async ({ apiBase, anonKey, pathname, init }) => {
      const authEntry = Object.entries(localStorage).find(([key]) => key.includes('-auth-token'))?.[1];
      if (!authEntry) throw new Error('AUTH_SESSION_NOT_FOUND');
      const session = JSON.parse(authEntry);
      if (!session?.access_token) throw new Error('ACCESS_TOKEN_NOT_FOUND');
      const response = await fetch(`${apiBase}${pathname}`, {
        ...init,
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${session.access_token}`,
          ...(init.headers ?? {}),
        },
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`REST_${response.status}: ${text}`);
      return text ? JSON.parse(text) : null;
    }, { apiBase, anonKey, pathname, init });
  }

  await page.goto(new URL('/login', baseUrl).toString(), { waitUntil: 'networkidle' });
  await page.getByLabel(/email|البريد الإلكتروني/i).fill(email);
  await page.getByLabel(/password|كلمة المرور/i).fill(password);
  await page.getByRole('button', { name: /sign in|login|دخول|تسجيل/i }).click();
  await page.waitForLoadState('networkidle');

  const tenant = await authenticatedRest('/rest/v1/rpc/current_company_id', { method: 'POST' });
  expect(String(tenant)).toBe(expectedTenantId);

  const beforeImports = await authenticatedRest(
    '/rest/v1/imports?select=id,company_id,file_name,status&file_name=eq.canonical_sales_invoices_2026.csv',
  );
  const beforeInvoices = await authenticatedRest('/rest/v1/sales_invoices?select=id');
  expect(beforeImports).toHaveLength(0);
  const beforeInvoiceCount = beforeInvoices.length;

  await page.goto(new URL(importPath, baseUrl).toString(), { waitUntil: 'networkidle' });
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

  const afterImports = await authenticatedRest(
    '/rest/v1/imports?select=id,company_id,file_name,status,total_rows,valid_rows,invalid_rows,entity_type&file_name=eq.canonical_sales_invoices_2026.csv',
  );
  expect(afterImports).toHaveLength(1);
  expect(afterImports[0].company_id).toBe(expectedTenantId);
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
    expect(rows[0].company_id).toBe(expectedTenantId);
  }

  await page.goto(new URL('/', baseUrl).toString(), { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'لوحة القيادة' })).toBeVisible();
  await expect(page.getByText('إجمالي المبيعات')).toBeVisible();
  await expect(page.getByText('عدد الفواتير')).toBeVisible();
  await expect(page.getByText('بيانات محسوبة من المصدر')).toBeVisible();
});
