import fs from 'node:fs';

const files = ['src/lib/brand.ts', 'src/pages/LoginPage.tsx', 'src/components/Sidebar.tsx', 'index.html'];
const forbidden = ['العامري', 'محلات العامري'];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const token of forbidden) if (content.includes(token)) throw new Error(`BRAND_RENAME_FORBIDDEN:${file}:${token}`);
}
const brand = fs.readFileSync('src/lib/brand.ts', 'utf8');
for (const token of ['الأغبري', 'منصة الأغبري لذكاء الأعمال والقرار']) if (!brand.includes(token)) throw new Error(`BRAND_SOURCE_REQUIRED:${token}`);
for (const file of ['src/pages/LoginPage.tsx', 'src/components/Sidebar.tsx']) if (!fs.readFileSync(file, 'utf8').includes("@/lib/brand")) throw new Error(`BRAND_SOURCE_NOT_USED:${file}`);
const index = fs.readFileSync('index.html', 'utf8');
for (const token of ['الأغبري', 'منصة ذكاء الأعمال والقرار']) if (!index.includes(token)) throw new Error(`BRAND_INDEX_REQUIRED:${token}`);
console.log('BRAND_RENAME_CONTRACT_PASS');
