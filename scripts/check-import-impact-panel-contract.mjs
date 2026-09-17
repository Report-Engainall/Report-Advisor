import fs from 'node:fs';

const files = [
  'src/components/import/ImportImpactPanel.tsx',
  'src/pages/ImportPage.tsx',
];
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const required = [
  'fetchDashboardSnapshot',
  'fetchImportRecords',
  'المصدر القانوني',
  'بدون اختلاق فروقات',
  'ImportImpactPanel',
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`IMPORT_IMPACT_CONTRACT_MISSING:${token}`);
}
if (/Math\.random|fake|mock|synthetic/i.test(source)) throw new Error('IMPORT_IMPACT_SYNTHETIC_DATA_FORBIDDEN');
console.log('Import impact panel contract: PASS');
