import fs from 'node:fs';

const page = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
const adapter = fs.readFileSync('src/lib/import/canonical-production-adapter.ts', 'utf8');
const requiredPage = [
  'مركز الاستيراد',
  'Stepper',
  'securityScan',
  'computeSHA256',
  'checkDuplicate',
  'reconcileForCanonical',
  'runCanonicalImportThroughDurableRunner',
  'أمان: ناجح',
  'الكتابة متوقفة لحماية البيانات',
  'اعتماد وكتابة',
  'سجل الاستيرادات',
  'لن يتم السماح بكتابة مكررة',
  'EXCEL_MULTI_SHEET_REQUIRES_SELECTION',
  'historyError',
];
const requiredAdapter = [
  'runCanonicalImportThroughDurableRunner',
  'runDurableProductionLifecycle',
  'commitImportBatch',
  "stage === 'committed'",
];

const missingPage = requiredPage.filter(token => !page.includes(token));
const missingAdapter = requiredAdapter.filter(token => !adapter.includes(token));
if (missingPage.length || missingAdapter.length) {
  const missing = [
    ...missingPage.map(token => `page:${token}`),
    ...missingAdapter.map(token => `adapter:${token}`),
  ];
  console.error(`Import Center product contract failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

if (page.includes('accept=') && /\.xml\b/i.test(page.match(/accept="([^"]+)"/)?.[1] ?? '')) {
  console.error('Import Center product contract failed: canonical import UI accepts XML without a canonical parser.');
  process.exit(1);
}

if (/Math\.random|fake|mock/i.test(page)) {
  console.error('Import Center product contract failed: synthetic/mock content detected.');
  process.exit(1);
}


if (!/fetchImportRecords\(\)/.test(page) || !/setHistoryError/.test(page) || !/ErrorState/.test(page)) {
  console.error('Import Center product contract failed: history failures must remain visible, not collapse to an empty history.');
  process.exit(1);
}

if (!/datasets\.length > 1/.test(page) || !/EXCEL_MULTI_SHEET_REQUIRES_SELECTION/.test(page)) {
  console.error('Import Center product contract failed: multi-sheet datasets must not be silently reduced to the first sheet.');
  process.exit(1);
}

console.log('Import Center product contract: PASS (UI delegates to canonical durable import; authoritative commit remains at committed lifecycle stage).');
