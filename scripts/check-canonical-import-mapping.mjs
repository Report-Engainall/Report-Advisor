import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/file-engine/adapters.ts', import.meta.url), 'utf8');
const canonicalImportPage = readFileSync(new URL('../src/pages/CanonicalImportPage.tsx', import.meta.url), 'utf8');
const canonicalImportServer = readFileSync(new URL('../netlify/functions/canonical-import-execute.mts', import.meta.url), 'utf8');
const sourceUnderstanding = readFileSync(new URL('../src/lib/import/canonical-source-understanding.ts', import.meta.url), 'utf8');
const queriesSource = readFileSync(new URL('../src/lib/queries.ts', import.meta.url), 'utf8');
const trustEvidencePage = readFileSync(new URL('../src/pages/TrustEvidencePage.tsx', import.meta.url), 'utf8');
const decisionExperiencePage = readFileSync(new URL('../src/pages/DecisionExperiencePage.tsx', import.meta.url), 'utf8');

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
if (!sourceUnderstanding.includes('const mixedSpecialtySource = new Set(summaries.map((summary) => summary.specialty)).size > 1')) {
  throw new Error('Mixed-specialty sources must be detected explicitly before canonical entity selection');
}
if (!sourceUnderstanding.includes("entityType: mixedSpecialtySource ? 'generic:source-data' : inferEntityType(specialty, datasets)")) {
  throw new Error('Mixed-specialty sources must fail closed to the generic canonical boundary');
}

for (const token of [
  'fetchImportEvidenceSnapshot',
  ".from('source_analysis_snapshots')",
  "import_job_id",
]) {
  if (!queriesSource.includes(token)) throw new Error(`Imported source evidence query contract missing: ${token}`);
}
for (const token of [
  'EVIDENCE PASSPORT',
  'sourceSnapshot',
  "PARTIAL / NOT PROVEN",
  'fetchImportEvidenceSnapshot(importJobId)',
]) {
  if (!trustEvidencePage.includes(token)) throw new Error(`Evidence Passport UI contract missing: ${token}`);
}
for (const token of [
  'importJobId',
  'sourceSnapshot',
  'IMPORTED SOURCE CONTEXT',
  'safeNext',
  'fetchImportEvidenceSnapshot(importJobId)',
]) {
  if (!decisionExperiencePage.includes(token)) throw new Error(`Decision source-context gate missing: ${token}`);
}
if (!canonicalImportPage.includes('Evidence Passport') || !canonicalImportPage.includes('/trust?import=') || !canonicalImportPage.includes('/data-quality') || !canonicalImportPage.includes('/decision-experience?stage=evidence&import=')) {
  throw new Error('Post-import UI must carry the import identity through Evidence Passport, Data Quality, and Decision Experience');
}

console.log('Canonical import mapping regression gate: PASS (canonical fields + full-source understanding + post-import evidence/decision continuity)');
