import fs from 'node:fs';

const index = fs.readFileSync('src/lib/metricSSOT.ts', 'utf8');
const lineage = fs.readFileSync('src/lib/dataLineage.ts', 'utf8');
const manifest = fs.readFileSync('src/lib/free-toolbox/export-manifest.ts', 'utf8');
const required = [
  ['metric SSOT', index, 'METRIC_CONTRACTS'],
  ['metric dependency closure', index, 'metricDependencyClosure'],
  ['metric validation', index, 'validateMetricContract'],
  ['lineage', lineage, 'provenance'],
  ['export manifest', manifest, 'export'],
];
for (const [name, text, token] of required) {
  if (!text.toLowerCase().includes(token.toLowerCase())) throw new Error(`Missing cross-surface contract anchor: ${name} (${token})`);
}

const pageFiles = ['src/pages/DashboardPage.tsx', 'src/pages/ReportsPage.tsx', 'src/pages/AnalyticsPage.tsx', 'src/pages/ExecutiveCommandCenterPage.tsx'];
for (const file of pageFiles) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (/\.reduce\s*\(/.test(text) && /(total|profit|revenue|receivable|payable|count|quantity)/i.test(text)) {
    throw new Error(`Potential browser business aggregation remains in ${file}; migrate to canonical truth before closing this family.`);
  }
}

console.log('Cross-surface truth contract: PASS (SSOT/lineage/export anchors present; no known page-level business reduce pattern)');
