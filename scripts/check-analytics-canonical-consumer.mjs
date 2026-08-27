import fs from 'node:fs';

const file = 'src/pages/AnalyticsPage.tsx';
const source = fs.readFileSync(file, 'utf8');

const requiredImports = [
  'fetchRFMSnapshot',
  'fetchABCSnapshot',
  'fetchAgingSnapshot',
  "@/lib/dashboard-canonical",
];
for (const marker of requiredImports) {
  if (!source.includes(marker)) {
    throw new Error(`Analytics canonical consumer missing required marker: ${marker}`);
  }
}

const forbidden = [
  "supabase.from('",
  'from(\'sales',
  'quantity * unit_cost',
  'aging.reduce(',
  'transactions.reduce(',
  'sales.reduce(',
];
for (const marker of forbidden) {
  if (source.includes(marker)) {
    throw new Error(`AnalyticsPage contains forbidden business-truth calculation/data access: ${marker}`);
  }
}

if (!source.includes("status==='INSUFFICIENT_DATA'")) {
  throw new Error('AnalyticsPage must preserve explicit INSUFFICIENT_DATA state');
}

if (!source.includes('unknownRows')) {
  throw new Error('AnalyticsPage must surface unknown/incomplete rows instead of manufacturing values');
}

console.log('Analytics canonical consumer contract: PASS');
