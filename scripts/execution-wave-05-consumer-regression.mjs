import fs from 'node:fs';

const analytics = fs.readFileSync('src/pages/AnalyticsPage.tsx', 'utf8');
const canonical = fs.readFileSync('src/lib/canonical-analytics.ts', 'utf8');
const failures = [];

if (!analytics.includes("from '@/lib/canonical-analytics'")) failures.push('Analytics pages must import the canonical analytics service.');
if (/from ['"]@\/lib\/supabase['"]/.test(analytics)) failures.push('AnalyticsPage must not access Supabase directly.');
if (analytics.includes('resolveCurrentCompanyId')) failures.push('AnalyticsPage must not derive tenant authority locally.');
for (const fn of ['fetchRFMAnalysis', 'fetchABCAnalysis', 'fetchAgingAnalysis']) {
  if (!canonical.includes(`export async function ${fn}`)) failures.push(`Missing canonical analytics function: ${fn}`);
}
if (!canonical.includes('resolveCurrentCompanyId')) failures.push('Canonical analytics service must derive tenant authority server-side/client-auth context, not from page input.');
if (canonical.includes('localStorage') || canonical.includes('sessionStorage')) failures.push('Canonical analytics service must not use browser storage as tenant authority.');

const result = { schemaVersion: 1, analyticsPageCanonical: failures.length === 0, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
