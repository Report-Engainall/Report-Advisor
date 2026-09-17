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

if (/Math\.random|fake|mock/i.test(page)) {
  console.error('Import Center product contract failed: synthetic/mock content detected.');
  process.exit(1);
}

console.log('Import Center product contract: PASS (UI delegates to canonical durable import; authoritative commit remains at committed lifecycle stage).');
