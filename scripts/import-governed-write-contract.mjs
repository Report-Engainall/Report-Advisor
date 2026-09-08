import fs from 'node:fs';

const canonical = fs.readFileSync(new URL('../src/lib/import/canonical-commit.ts', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../src/pages/CanonicalImportPage.tsx', import.meta.url), 'utf8');
const panel = fs.readFileSync(new URL('../src/components/ImportResolutionReviewPanel.tsx', import.meta.url), 'utf8');

const assertions = [
  ['canonical writer requires authenticated tenant context', canonical.includes('resolveCurrentCompanyId()') && canonical.includes("No authenticated tenant context")],
  ['canonical writer re-resolves against tenant rows', canonical.includes('fetchExistingRows(entityType, companyId, payload)') && canonical.includes('resolveRows(dataset, existingRows)')],
  ['canonical writer blocks non-new resolutions', canonical.includes("resolution.outcome !== 'new'") && canonical.includes('IMPORT_RESOLUTION_BLOCKED')],
  ['canonical writer uses governed RPC only', canonical.includes("supabase.rpc('import_commit_batch_governed'")],
  ['page never writes directly to target tables', !page.includes("supabase.from('products').insert") && !page.includes("supabase.from('customers').insert") && !page.includes("supabase.from('sales_invoices').insert")],
  ['page blocks unresolved decisions before commit', page.includes('resolutions.some(r => r.outcome !== \'new\')') && page.includes('blocked > 0')],
  ['review panel exposes all four resolution states', ['skip_exact', 'candidate_duplicate', 'conflict', 'new'].every((value) => panel.includes(value))],
  ['review panel explicitly states no silent merge/update', panel.includes('لا يوجد حذف أو تحديث تلقائي')],
];

const failures = assertions.filter(([, ok]) => !ok).map(([name]) => name);
if (failures.length) {
  console.error('Governed import contract: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Governed import contract: PASS (${assertions.length} assertions)`);
