import { test, expect } from '@playwright/test';
import path from 'node:path';

/**
 * Real authenticated Staging import certification.
 *
 * Required environment:
 *   E2E_BASE_URL
 *   E2E_EMAIL
 *   E2E_PASSWORD
 *
 * Optional selectors can be overridden if the deployed UI changes:
 *   E2E_IMPORT_PATH (default: /canonical-import)
 */

test('authenticated CanonicalImportPage imports canonical sales invoices', async ({ page }) => {
  const baseUrl = process.env.E2E_BASE_URL;
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  test.skip(!baseUrl || !email || !password, 'Missing E2E_BASE_URL/E2E_EMAIL/E2E_PASSWORD; refusing unauthenticated certification');

  const fixture = path.resolve(process.cwd(), 'tests/fixtures/canonical_sales_invoices_2026.csv');
  const importPath = process.env.E2E_IMPORT_PATH ?? '/canonical-import';

  await page.goto(new URL('/login', baseUrl).toString(), { waitUntil: 'networkidle' });
  await page.getByLabel(/email/i).fill(email!);
  await page.getByLabel(/password/i).fill(password!);
  await page.getByRole('button', { name: /sign in|login|دخول|تسجيل/i }).click();
  await page.waitForLoadState('networkidle');

  await page.goto(new URL(importPath, baseUrl).toString(), { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(new RegExp(importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toHaveCount(1);
  await fileInput.setInputFiles(fixture);

  // CanonicalImportPage must expose the preview before commit.
  await expect(page.getByText(/canonical_sales_invoices_2026\.csv/i)).toBeVisible();
  await expect(page.getByText(/4/).first()).toBeVisible();

  const commitButton = page.getByRole('button', { name: /commit|import|استيراد|اعتماد|تنفيذ/i }).last();
  await expect(commitButton).toBeEnabled();
  await commitButton.click();

  await expect(page.getByText(/completed|success|اكتمل|تم الاستيراد|نجاح/i).first()).toBeVisible({ timeout: 30_000 });
});
