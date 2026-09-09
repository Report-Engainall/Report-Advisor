import fs from 'node:fs';

const page = fs.readFileSync(new URL('../src/pages/ImportPage.tsx', import.meta.url), 'utf8');
const required = [
  "to: '/'",
  "to: '/intelligence'",
  "to: '/reports/executive'",
  'CanonicalImportPage',
  'FolderBatchImportPanel',
  'بدون بيانات مصطنعة',
];

const missing = required.filter(token => !page.includes(token));
if (missing.length) {
  console.error(`Import decision bridge contract failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

if (/Math\.random|fake|mock/i.test(page)) {
  console.error('Import decision bridge contract failed: synthetic data token detected.');
  process.exit(1);
}

console.log('Import decision bridge contract: PASS (repository contract only).');
