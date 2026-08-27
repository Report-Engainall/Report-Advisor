import fs from 'node:fs';

const files = [
  'src/pages/ReportsPage.tsx',
  'src/lib/free-toolbox/export-manifest.ts',
];
const text = files.filter(fs.existsSync).map(f => fs.readFileSync(f, 'utf8')).join('\n');
const failures = [];

if (!text.includes('export')) failures.push('export surface missing');
if (/تصدير الصفحة|export.*current.*page/i.test(text)) failures.push('page-only export wording remains in canonical export surface');
if (!/filters|filter/i.test(text)) failures.push('export contract has no filter propagation anchor');
if (!/manifest/i.test(text)) failures.push('export manifest anchor missing');

// Prevent a superficially complete export that simply serializes the currently loaded page.
const reports = fs.existsSync('src/pages/ReportsPage.tsx') ? fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8') : '';
if (/invoices\.map|rows\.map|data\.map/.test(reports) && /export|csv|xlsx/i.test(reports)) {
  failures.push('report export appears to serialize an in-memory paginated collection directly');
}

if (failures.length) {
  console.error('EXPORT_COMPLETENESS_CONTRACT_FAIL');
  failures.forEach(x => console.error(`- ${x}`));
  process.exit(1);
}
console.log('EXPORT_COMPLETENESS_CONTRACT_PASS');
