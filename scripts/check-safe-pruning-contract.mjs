import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const IGNORE = new Set(['node_modules', '.git', 'dist', 'coverage']);
const CANDIDATES = [
  { id: 'inventory-page', legacyModule: 'src/pages/EntityPages.tsx', legacyExport: 'InventoryPage', canonicalModule: 'src/pages/InventoryPageCanonical.tsx', canonicalExport: 'InventoryPageCanonical', route: '/inventory' },
  { id: 'receivables-page', legacyModule: 'src/pages/ReportsPage.tsx', legacyExport: 'ReceivablesReportPage', canonicalModule: 'src/pages/ReceivablesReportPageCanonical.tsx', canonicalExport: 'ReceivablesReportPageCanonical', route: '/reports/receivables' },
];
function walk(dir, out = []) { if (!fs.existsSync(dir)) return out; for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { if (IGNORE.has(entry.name)) continue; const full = path.join(dir, entry.name); if (entry.isDirectory()) walk(full, out); else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) out.push(full); } return out; }
function stripComments(text) { return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1'); }
function rel(file) { return path.relative(ROOT, file).replaceAll(path.sep, '/'); }
function prove(candidate, files) {
  const failures = [];
  const canonicalPath = path.join(ROOT, candidate.canonicalModule);
  const legacyPath = path.join(ROOT, candidate.legacyModule);
  if (!fs.existsSync(canonicalPath)) failures.push('canonical implementation missing');
  else if (!new RegExp(`(?:export\\s+)?function\\s+${candidate.canonicalExport}\\b`).test(stripComments(fs.readFileSync(canonicalPath, 'utf8')))) failures.push('canonical export not proven');
  if (!fs.existsSync(legacyPath)) failures.push('legacy module missing');
  else if (!new RegExp(`(?:export\\s+(?:function|const|let|var|class)\\s+${candidate.legacyExport}\\b|export\\s*\\{[^}]*\\b${candidate.legacyExport}\\b)`).test(stripComments(fs.readFileSync(legacyPath, 'utf8')))) failures.push('legacy export not found; candidate mapping is stale');
  const consumers = [];
  for (const file of files) {
    const fileRel = rel(file); if (fileRel === candidate.canonicalModule || fileRel === candidate.legacyModule) continue;
    const code = stripComments(fs.readFileSync(file, 'utf8'));
    const symbol = new RegExp(`\\b${candidate.legacyExport}\\b`).test(code);
    const dynamic = new RegExp(`(?:import|require)\\([^)]*(?:${candidate.legacyExport}|${candidate.legacyModule.split('/').pop().replace(/\\.tsx$/, '')})[^)]*\\)`).test(code);
    const routeOutsideApp = fileRel !== 'src/App.tsx' && code.includes(candidate.route);
    if (symbol || dynamic || routeOutsideApp) consumers.push(fileRel);
  }
  if (consumers.length) failures.push(`active consumers remain: ${consumers.join(', ')}`);
  const barrel = files.some(file => { const fileRel = rel(file); if (fileRel === candidate.legacyModule) return false; const code = stripComments(fs.readFileSync(file, 'utf8')); return new RegExp(`export\\s*\\{[^}]*\\b${candidate.legacyExport}\\b`).test(code); });
  if (barrel) failures.push('legacy export is re-exported by a barrel/public entrypoint');
  return { failures };
}
const files = walk(SRC);
const results = CANDIDATES.map(candidate => ({ candidate, ...prove(candidate, files) }));
const unsafe = results.filter(result => result.failures.length);
for (const result of results) { if (result.failures.length) { console.error(`ABORT DELETE [${result.candidate.id}]`); for (const failure of result.failures) console.error(`  - ${failure}`); } else console.log(`SAFE-TO-PRUNE-PROVEN [${result.candidate.id}]`); }
if (unsafe.length) { console.error('FAIL CLOSED: deletion is forbidden until every proof is positive.'); process.exit(1); }
console.log('PASS: canonical exists, legacy has zero detected consumers, and no barrel/dynamic dependency is present.');
