import fs from 'node:fs';
import path from 'node:path';

const targets = ['src/pages/ImportPage.tsx', 'src/pages/CanonicalImportPage.tsx'];
const forbidden = /supabase\s*\.\s*from\s*\([^)]*\)\s*\.(?:insert|upsert|update|delete)\s*\(/m;
const violations = [];

for (const target of targets) {
  const file = path.resolve(target);
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (forbidden.test(text)) violations.push(target);
  if (target === 'src/pages/CanonicalImportPage.tsx') {
    if (/\bupdateImportRecord\s*\(/.test(text)) violations.push(`${target}:updateImportRecord`);
    if (/supabase\s*\.\s*rpc\s*\(\s*['"]import_finish_job['"]/.test(text)) violations.push(`${target}:import_finish_job_direct_rpc`);
  }
}

if (violations.length) {
  console.error('Direct Supabase writes are forbidden in import UI paths:');
  for (const file of violations) console.error(` - ${file}`);
  process.exit(1);
}

console.log(`Import direct-write guard passed (${targets.length} files scanned).`);
