import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const workflowDir = path.join(root, '.github', 'workflows');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const scripts = new Set(Object.keys(pkg.scripts ?? {}));
const files = fs.readdirSync(workflowDir).filter((f) => /\.ya?ml$/i.test(f));
const missing = new Set();
const patterns = [
  /(?:npm|pnpm|yarn)\s+(?:run\s+)?([A-Za-z0-9:_-]+)/g,
  /(?:npm|pnpm|yarn)\s+run\s+([A-Za-z0-9:_-]+)/g,
];
for (const file of files) {
  const text = fs.readFileSync(path.join(workflowDir, file), 'utf8');
  for (const re of patterns) for (const m of text.matchAll(re)) {
    const cmd = m[1];
    if (['install','ci','exec','dlx','test','build','lint','typecheck','run'].includes(cmd)) continue;
    if (!scripts.has(cmd)) missing.add(`${file}: ${cmd}`);
  }
}
if (missing.size) {
  console.error('Extended workflow command integrity FAILED');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}
console.log(`Extended workflow command integrity PASS (${files.length} workflows)`);
