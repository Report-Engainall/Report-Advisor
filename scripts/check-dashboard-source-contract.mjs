import fs from 'node:fs';
const cockpit = fs.readFileSync('src/pages/BusinessCockpitPage.tsx','utf8');
const source = fs.readFileSync('src/lib/canonicalDashboard.ts','utf8');
for (const token of ['fetchCanonicalDashboard', 'generatedAt', 'Tenant-safe', 'Canonical metrics']) if (!cockpit.includes(token)) throw new Error(`Cockpit canonical source missing: ${token}`);
for (const token of ['COMPANY_ID', "eq('company_id', COMPANY_ID)", 'evaluateMetric', 'invoiceIds', 'generatedAt']) if (!source.includes(token)) throw new Error(`Canonical dashboard contract missing: ${token}`);
for (const forbidden of ['12.84M', '38.6M', '9.42M', '1,284', 'salesTrend = [', 'const risks = [', 'const recommendations = [']) if (cockpit.includes(forbidden)) throw new Error(`Demo/dashboard hardcoded data detected: ${forbidden}`);
console.log('Dashboard canonical source contract: PASS');
