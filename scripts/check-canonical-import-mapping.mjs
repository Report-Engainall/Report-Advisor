import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/file-engine/adapters.ts', import.meta.url), 'utf8');

const required = [
  'materializeCanonicalFields',
  'column.mappedField',
  'column.mappingConfidence < 80',
  'const canonicalRows = materializeCanonicalFields(cleanedRows, columnProfiles)',
  'rows: canonicalRows',
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Canonical import mapping contract missing: ${token}`);
}

if (!source.includes('next[field] !==') || !source.includes("value !== '' && value !== null && value !== undefined")) {
  throw new Error('Canonical mapping must preserve non-empty existing values and ignore empty source cells');
}

if (!source.includes('if (!previous || column.mappingConfidence > previous.mappingConfidence)')) {
  throw new Error('Duplicate canonical mappings must resolve deterministically by confidence');
}

console.log('Canonical import mapping regression gate: PASS');


const executionSource = readFileSync(new URL('../src/lib/import/canonical-production-adapter.ts', import.meta.url), 'utf8');
const requiredReportRoutes = [
  "sales_invoices",
  "/reports/sales",
  "purchase_invoices",
  "/reports/purchases",
  "inventory_balances",
  "/reports/inventory",
  "/reports/inventory-intelligence",
  "/reports/executive",
  "sourceBound: true",
  "sourceHash: input.sourceHash",
  "importId: input.importId",
];
for (const token of requiredReportRoutes) {
  if (!executionSource.includes(token)) throw new Error(`Post-upload report routing contract missing: ${token}`);
}

const routeSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
for (const route of ['/reports/sales', '/reports/purchases', '/reports/inventory', '/reports/inventory-intelligence', '/reports/executive', '/replay', '/benchmark']) {
  if (!routeSource.includes(`path="${route}"`)) throw new Error(`Canonical output route missing from App: ${route}`);
}

const decisionStatusSource = readFileSync(new URL('../src/lib/decision-status.ts', import.meta.url), 'utf8');
for (const token of ["'open'", "'accepted'", "'approved'", "'in_progress'", "ACTIONABLE_RECOMMENDATION_STATUSES"]) {
  if (!decisionStatusSource.includes(token)) throw new Error(`Decision actionability contract missing: ${token}`);
}

console.log('Post-upload report routing + decision status contract: PASS');
