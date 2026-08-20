import fs from 'node:fs';

const files = {
  data: fs.readFileSync('src/lib/universalDataContract.ts', 'utf8'),
  imports: fs.readFileSync('src/lib/universalImportContract.ts', 'utf8'),
  metrics: fs.readFileSync('src/lib/metricSSOT.ts', 'utf8'),
};

const required = [
  ['data', ['CanonicalDataset', 'ProvenanceRef', 'ZERO', 'MISSING', 'UNKNOWN', 'normalizeArabicEnglishDigits', 'dedupeByStableKey']],
  ['imports', ['IMPORT_ROUTES', 'IMPORT_PROFILES', 'resolveImportRoute', 'matchImportProfile', 'pdf-table', 'image-ocr']],
  ['metrics', ['METRIC_CONTRACTS', 'version', 'decisionSafe', 'requiredEvidence', 'validateMetricContract']],
];

for (const [name, tokens] of required) for (const token of tokens) {
  if (!files[name].includes(token)) throw new Error(`${name} contract missing: ${token}`);
}

const sourceKinds = ['excel', 'csv', 'pdf', 'word', 'image', 'api', 'database', 'manual'];
for (const kind of sourceKinds) if (!files.imports.includes(`sourceKind: '${kind}'`)) throw new Error(`Missing import source: ${kind}`);

console.log('Universal foundation contracts: PASS');
