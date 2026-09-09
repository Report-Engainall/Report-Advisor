import fs from 'node:fs';

const file = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
const required = [
  'مركز الاستيراد',
  'Stepper',
  'securityScan',
  'computeSHA256',
  'checkDuplicate',
  'reconcileForCanonical',
  'commitImportBatch',
  'أمان: ناجح',
  'الكتابة متوقفة لحماية البيانات',
  'اعتماد وكتابة',
  'سجل الاستيرادات',
  'لن يتم السماح بكتابة مكررة',
];

const missing = required.filter(token => !file.includes(token));
if (missing.length) {
  console.error(`Import Center product contract failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

if (/Math\.random|fake|mock/i.test(file)) {
  console.error('Import Center product contract failed: synthetic/mock content detected.');
  process.exit(1);
}

console.log('Import Center product contract: PASS (repository/UI contract only; not live runtime evidence).');
