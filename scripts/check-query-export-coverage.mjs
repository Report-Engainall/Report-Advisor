import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcRoot = path.join(root, 'src');
const queryFile = path.join(srcRoot, 'lib', 'queries.ts');

function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const queries = fs.readFileSync(queryFile, 'utf8');
const exports = new Set();
for (const match of queries.matchAll(/export\s+(?:async\s+)?(?:type\s+)?(?:function|const|type|interface|class)\s+([A-Za-z0-9_]+)/g)) {
  exports.add(match[1]);
}
for (const match of queries.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
  for (const part of match[1].split(',')) {
    const name = part.trim().split(/\s+as\s+/)[0];
    if (name) exports.add(name);
  }
}

const missing = [];
for (const file of walk(srcRoot)) {
  if (path.resolve(file) === path.resolve(queryFile)) continue;
  const source = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  for (const match of source.matchAll(/import\s*\{([\s\S]*?)\}\s*from\s*['"]@\/lib\/queries['"]/g)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0];
      if (name && !exports.has(name)) {
        missing.push({ file: path.relative(root, file), name });
      }
    }
  }
}

if (missing.length) {
  for (const item of missing) console.error(`Missing @/lib/queries export: ${item.file} → ${item.name}`);
  process.exit(1);
}

console.log(`query export coverage: PASS (${exports.size} exports checked across source imports)`);
