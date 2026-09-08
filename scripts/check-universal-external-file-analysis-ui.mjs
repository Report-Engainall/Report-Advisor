import fs from 'node:fs';

const page = fs.readFileSync('src/pages/ExternalFileAnalysisPage.tsx', 'utf8');
const importPage = fs.readFileSync('src/pages/ImportPage.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

for (const token of ['detectFormat(', 'securityScan(', 'computeSHA256(', 'parseFile(', 'اختيار ملف للتحليل', 'لا يكتب أي بيانات في قاعدة البيانات']) {
  if (!page.includes(token)) throw new Error(`Universal analysis surface missing: ${token}`);
}
for (const format of ['xlsx','csv','json','jsonl','pdf','docx','jpg','png','webp','txt']) {
  if (!page.includes(`.${format}`)) throw new Error(`Universal analysis UI does not advertise ${format}`);
}
if (!importPage.includes('ExternalFileAnalysisPage')) throw new Error('Import center does not expose universal external analysis');
if (!sidebar.includes('استيراد وتحليل الملفات')) throw new Error('Sidebar does not expose universal file analysis');
console.log('Universal external file analysis UI contract: PASS');
