import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const workflowDir = path.join(root, '.github', 'workflows');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const scripts = new Set(Object.keys(packageJson.scripts ?? {}));
const files = fs.readdirSync(workflowDir).filter((f) => /\.ya?ml$/.test(f));
const missing = new Set();
const re = /npm\s+run\s+([A-Za-z0-9:_-]+)/g;
for (const file of files) {
  const text = fs.readFileSync(path.join(workflowDir, file), 'utf8');
  for (const match of text.matchAll(re)) {
    if (!scripts.has(match[1])) missing.add(`${file}: npm run ${match[1]}`);
  }
}
if (missing.size) {
  console.error('Workflow command integrity FAILED');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}
console.log(`Workflow command integrity PASS (${files.length} workflows)`);
