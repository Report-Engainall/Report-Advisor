import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['src'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.html', '.css']);
const FORBIDDEN = ['العامري', 'محلات العامري'];

function walk(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (EXTENSIONS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

const hits = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const token of FORBIDDEN) {
      if (source.includes(token)) hits.push(`${file}:${token}`);
    }
  }
}

if (hits.length) throw new Error(`BRAND_IDENTITY_SOURCE_SWEEP_FAIL:${hits.join('|')}`);
console.log(`BRAND_IDENTITY_SOURCE_SWEEP_PASS:${walk('src').length}`);
