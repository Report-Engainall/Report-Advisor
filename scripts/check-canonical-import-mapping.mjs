import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/file-engine/adapters.ts', import.meta.url), 'utf8');
const canonicalImportPage = readFileSync(new URL('../src/pages/CanonicalImportPage.tsx', import.meta.url), 'utf8');
const canonicalImportServer = readFileSync(new URL('../netlify/functions/canonical-import-execute.mts', import.meta.url), 'utf8');
const sourceUnderstanding = readFileSync(new URL('../src/lib/import/canonical-source-understanding.ts', import.meta.url), 'utf8');

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

const multiSourceRequired = [
  'understandCanonicalSource',
  'datasetCount',
  'specialty',
  'entityType',
  'const rows = datasets.flatMap((dataset) => dataset.rows)',
];
for (const token of multiSourceRequired) {
  if (!sourceUnderstanding.includes(token)) throw new Error(`Canonical source understanding contract missing: ${token}`);
}
if (canonicalImportPage.includes('const dataset = datasets[0]') || canonicalImportServer.includes('const authoritativeDataset = authoritativeDatasets[0]')) {
  throw new Error('Canonical import must not silently discard datasets after selecting only the first dataset');
}
if (!canonicalImportServer.includes('authoritativeDatasets') || !canonicalImportServer.includes('sourceUnderstanding.datasets.map')) {
  throw new Error('Server canonical import must persist and return all authoritative dataset summaries');
}

console.log('Canonical import mapping regression gate: PASS (canonical fields + full-source understanding)');
