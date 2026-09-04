import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbidden = ['العامري'];
const ignored = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'coverage']);
const allowedExt = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.mdx', '.html', '.css']);
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) walk(path.join(dir, entry.name));
      continue;
    }
    if (!allowedExt.has(path.extname(entry.name))) continue;
    const file = path.join(dir, entry.name);
    const text = fs.readFileSync(file, 'utf8');
    for (const token of forbidden) {
      if (text.includes(token)) hits.push({ file: path.relative(root, file).replaceAll('\\', '/'), token });
    }
  }
}

walk(root);
if (hits.length) {
  console.error('Forbidden legacy product branding detected:');
  for (const hit of hits) console.error(`- ${hit.file}: ${hit.token}`);
  process.exit(1);
}
console.log('Product branding contract: PASS (no forbidden legacy product identity in scanned product scope).');
