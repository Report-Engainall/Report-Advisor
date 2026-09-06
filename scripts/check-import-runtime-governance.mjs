import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dirs = ['src/lib', 'src/services'];
const files = [];
for (const dir of dirs) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) continue;
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) files.push(full);
    }
  }
}

const forbidden = /supabase\.from\(\s*['"](?:products|orders|import_job_rows|import_jobs)['"]\s*\)\s*\.\s*(?:insert|upsert|update)\s*\(/i;
const allowedMarkers = /import-upsert|unified-import|runImportJob/i;
const violations = [];
for (const file of files) {
  const body = fs.readFileSync(file, 'utf8');
  if (forbidden.test(body) && !allowedMarkers.test(body)) violations.push(file);
}
if (violations.length) throw new Error(`Runtime import governance violation:\n${violations.join('\n')}`);

const previewPath = path.join(root, 'src/pages/CanonicalImportPage.tsx');
const preview = fs.readFileSync(previewPath, 'utf8');
const requiredContracts = [
  ['sales_invoices', ['invoice_number', 'invoice_date', 'subtotal', 'tax_amount', 'total', 'paid_amount', 'status']],
  ['products', ['sku', 'name', 'unit', 'cost_price', 'selling_price', 'min_stock', 'reorder_point', 'is_active']],
  ['customers', ['name', 'segment', 'credit_limit', 'payment_terms_days']],
];
for (const [entity, fields] of requiredContracts) {
  for (const field of fields) {
    if (!preview.includes(`'${field}'`)) {
      throw new Error(`Import preview contract missing ${entity}.${field}`);
    }
  }
}
if (!preview.includes("['customer_id', 'customer_name']")) {
  throw new Error('Import preview contract must allow customer_id OR customer_name for sales invoices');
}
if (!preview.includes('invoiceCustomerIdentityMissing')) {
  throw new Error('Import preview must reject sales invoices without customer identity');
}
console.log(`Import runtime governance: PASS (${files.length} source files scanned; canonical preview contract verified)`);
