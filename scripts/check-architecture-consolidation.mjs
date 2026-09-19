import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

const checks = [
  ['src/pages/IntelligencePages.tsx', [
    "export { RecommendationsPage, ForecastsPage } from './IntelligencePage';",
    '@deprecated Compatibility surface only.',
  ]],
  ['src/pages/ReceivablesReportPageCanonical.tsx', [
    "export { ReceivablesReportCanonicalPage as ReceivablesReportPageCanonical } from './ReceivablesReportCanonicalPage';",
    '@deprecated Compatibility surface only.',
  ]],
  ['src/lib/import-pipeline/folder-handle-store.ts', [
    "} from '../import/folder-handle-store';",
    '@deprecated Compatibility surface only.',
  ]],
  ['src/lib/free-toolbox/data-quality-gate.ts', [
    "from './data-quality-score';",
    'qualityScore(dimensions).overall',
  ]],
];

for (const [file, required] of checks) {
  try {
    const source = read(file);
    for (const token of required) {
      if (!source.includes(token)) failures.push(`${file}: missing canonicalization token ${token}`);
    }
  } catch {
    failures.push(`${file}: missing`);
  }
}

const app = read('src/App.tsx');
for (const token of [
  "import('@/pages/IntelligencePage')",
  "import('@/pages/ReceivablesReportCanonicalPage')",
]) {
  if (!app.includes(token)) failures.push(`App.tsx: route surface no longer points at canonical page ${token}`);
}

const qualityGate = read('src/lib/free-toolbox/data-quality-gate.ts');
for (const token of ['reduce(', 'Math.max(0,Math.min(100']) {
  if (qualityGate.includes(token)) failures.push(`data-quality-gate.ts: duplicate scoring arithmetic detected: ${token}`);
}

const wrapperLimits = [
  ['src/pages/IntelligencePages.tsx', 15],
  ['src/pages/ReceivablesReportPageCanonical.tsx', 15],
  ['src/lib/import-pipeline/folder-handle-store.ts', 15],
];
for (const [file, maxLines] of wrapperLimits) {
  const lines = read(file).trim().split('\n').length;
  if (lines > maxLines) failures.push(`${file}: compatibility wrapper grew to ${lines} lines; keep it zero-logic`);
}

if (failures.length) {
  console.error('Architecture consolidation guard FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Architecture consolidation guard: PASS');
