import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

const checks = [
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

const scanRoots = ['src', 'scripts'];
const sourceFiles = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if /\.(ts|tsx|mjs|cjs)$/.test(entry.name)) sourceFiles.push(full);
  }
}
for (const root of scanRoots) walk(root);

const removedLegacyFiles = [
  'src/pages/IntelligencePages.tsx',
  'src/pages/ReceivablesReportPageCanonical.tsx',
];
for (const file of removedLegacyFiles) {
  if (fs.existsSync(path.join(root, file))) failures.push(`removed legacy module still exists: ${file}`);
}

const legacyReferences = [
  ['IntelligencePages.tsx', 'src/pages/IntelligencePages.tsx'],
  ['ReceivablesReportPageCanonical.tsx', 'src/pages/ReceivablesReportPageCanonical.tsx'],
  ['import-pipeline/folder-handle-store', 'src/lib/import-pipeline/folder-handle-store.ts'],
];
for (const [needle, legacyFile] of legacyReferences) {
  const consumers = [];
  for (const file of sourceFiles) {
    const normalized = file.replaceAll(path.sep, '/');
    if (normalized === legacyFile) continue;
    const source = fs.readFileSync(file, 'utf8');
    if (source.includes(needle)) consumers.push(normalized);
  }
  if (consumers.length) {
    console.log(JSON.stringify({ legacyFile, consumers }));
  } else {
    console.log(JSON.stringify({ legacyFile, consumers: [], orphanCandidate: true }));
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
  ['src/lib/import-pipeline/folder-handle-store.ts', 15],
];
for (const [file, maxLines] of wrapperLimits) {
  const lines = read(file).trim().split('\n').length;
  if (lines > maxLines) failures.push(`${file}: compatibility wrapper grew to ${lines} lines; keep it zero-logic`);
}

const canonicalIntelligence = read('src/pages/IntelligencePage.tsx');
if (canonicalIntelligence.includes('from \'@/pages/IntelligencePages\'') || canonicalIntelligence.includes('from \'./IntelligencePages\'')) failures.push('IntelligencePage.tsx: canonical module must not import or re-export the compatibility module');

if (failures.length) {
  console.error('Architecture consolidation guard FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Architecture consolidation guard: PASS');
