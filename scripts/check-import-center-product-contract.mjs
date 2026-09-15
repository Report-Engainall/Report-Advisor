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
  'runCanonicalProductionImport',
  'أمان: ناجح',
  'الكتابة متوقفة لحماية البيانات',
  'اعتماد وكتابة',
  'سجل الاستيرادات',
  'لن يتم السماح بكتابة مكررة',
];
const requiredAdapter = [
  'runCanonicalProductionImport',
  'commitImportBatch',
  'runDurableProductionLifecycle',
  'enqueue_report_execution_job',
  "stage === 'committed'",
  'import_finish_job',
];

const missingPage = requiredPage.filter(token => !page.includes(token));
if (missingPage.length) {
  console.error(`Import Center product contract failed. Missing page contract: ${missingPage.join(', ')}`);
  process.exit(1);
}
const missingAdapter = requiredAdapter.filter(token => !adapter.includes(token));
if (missingAdapter.length) {
  console.error(`Import Center product contract failed. Missing production adapter contract: ${missingAdapter.join(', ')}`);
  process.exit(1);
}

if (/Math\.random|fake|mock/i.test(page) || /Math\.random|fake|mock/i.test(adapter)) {
  console.error('Import Center product contract failed: synthetic/mock content detected.');
  process.exit(1);
}

console.log('Import Center product contract: PASS (UI → canonical production adapter → existing durable runner → atomic commit contract; not live runtime evidence).');
