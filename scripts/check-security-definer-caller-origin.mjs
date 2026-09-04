import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  'autonomy_runtime_gate',
  'can_enter_phase_l_autonomy',
  'complete_decision_work_item',
  'record_watched_report_file',
];
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'coverage']);
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.sql']);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(path.join(dir, entry.name));
      continue;
    }
    if (extensions.has(path.extname(entry.name))) files.push(path.join(dir, entry.name));
  }
}
walk(root);

const rows = [];
for (const target of targets) {
  const matches = [];
  for (const file of files) {
    const rel = path.relative(root, file).replaceAll('\\', '/');
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.includes(target)) matches.push({ file: rel, line: index + 1, text: line.trim() });
    });
  }
  rows.push({ target, matches });
}

console.log('SECURITY DEFINER CALLER-ORIGIN MATRIX');
for (const row of rows) {
  console.log(`\nFUNCTION: ${row.target}`);
  console.log(`MATCH COUNT: ${row.matches.length}`);
  for (const match of row.matches) console.log(`  ${match.file}:${match.line} ${match.text}`);
  if (!row.matches.length) console.log('  NO SOURCE OCCURRENCE FOUND');
}

// Discovery gate only: absence of a source occurrence is a blocker, never a pass.
const unresolved = rows.filter((row) => row.matches.length === 0);
if (unresolved.length) throw new Error(`Caller-origin unresolved: ${unresolved.map((r) => r.target).join(', ')}`);
console.log('\nCaller-origin discovery: COMPLETE (matrix emitted; certification is not implied).');
