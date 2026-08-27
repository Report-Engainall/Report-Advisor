import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const compatibilityPath = path.join(srcDir, 'lib', 'queries-compat.ts');

function readTree(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...readTree(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = readTree(srcDir);
const consumers = [];
const patterns = [
  /from\s+['"]@\/lib\/queries-compat['"]/g,
  /from\s+['"](?:\.\.\/)+lib\/queries-compat['"]/g,
  /from\s+['"]\.\/queries-compat['"]/g,
  /import\s*\(\s*['"][^'"]*queries-compat[^'"]*['"]\s*\)/g,
];

for (const file of files) {
  if (path.resolve(file) === path.resolve(compatibilityPath)) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    if (pattern.test(source)) consumers.push(path.relative(root, file));
    pattern.lastIndex = 0;
  }
}

if (consumers.length) {
  throw new Error(`queries-compat has active application consumers: ${[...new Set(consumers)].join(', ')}`);
}

if (!fs.existsSync(compatibilityPath)) {
  throw new Error('queries-compat compatibility boundary is unexpectedly missing; external-consumer review is required before removal');
}

const compatibility = fs.readFileSync(compatibilityPath, 'utf8');
if (!/Compatibility boundary only/i.test(compatibility)) {
  throw new Error('queries-compat must remain explicitly marked as compatibility-only while external-consumer risk is unresolved');
}

console.log('queries-compat internal consumer regression: PASS (zero application consumers; compatibility boundary retained for external-consumer caution)');
