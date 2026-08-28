import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const findings = [];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

if (exists('.bolt')) failures.push('PRODUCTION RISK: .bolt remains in current repository tree');

const packageJson = JSON.parse(read('package.json'));
if (packageJson.name !== 'report-advisor') failures.push(`PRODUCTION RISK: package name is ${packageJson.name}`);
if (packageJson.name.includes('starter')) failures.push('PRODUCTION RISK: starter package identity remains');

const lock = JSON.parse(read('package-lock.json'));
if (lock.name !== packageJson.name || lock.version !== packageJson.version || lock.packages?.['']?.name !== packageJson.name || lock.packages?.['']?.version !== packageJson.version) {
  findings.push(`LOCKFILE DRIFT: package.json=${packageJson.name}@${packageJson.version}; package-lock root=${lock.name}@${lock.version}; locked package=${lock.packages?.['']?.name}@${lock.packages?.['']?.version}`);
}

const index = read('index.html');
for (const token of ['bolt.new', 'vite.svg', 'og_default.png']) {
  if (index.toLowerCase().includes(token.toLowerCase())) failures.push(`PRODUCTION RISK: index.html references ${token}`);
}
if (!index.includes('/favicon.svg')) failures.push('PRODUCTION RISK: first-party favicon is not wired');
if (!index.includes('Report-Advisor')) failures.push('PRODUCTION RISK: application identity missing from index.html');

const productionRoots = ['src', 'services', 'supabase'];
const forbidden = [/bolt\.new/i, /\bbolt\b/i, /vite-react-typescript-starter/i, /og_default\.png/i];
const extensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.sql', '.py', '.html', '.css']);
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name))) {
      const text = fs.readFileSync(full, 'utf8');
      for (const pattern of forbidden) if (pattern.test(text)) failures.push(`PRODUCTION RISK: ${path.relative(root, full)} matches ${pattern}`);
    }
  }
}
for (const dir of productionRoots) if (exists(dir)) walk(path.join(root, dir));

const viteConfig = read('vite.config.ts');
if (/template|starter/i.test(viteConfig)) findings.push('CONFIG REVIEW: vite.config.ts contains template/starter wording; verify whether it is semantic or historical.');

if (findings.length) {
  console.log('FORENSIC FINDINGS');
  for (const finding of findings) console.log(`- ${finding}`);
}
if (failures.length) {
  console.error('FORENSIC FAILURES');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('REPOSITORY FORENSICS PASS: no Bolt/starter production artifacts detected; identity and first-party metadata checks passed.');
