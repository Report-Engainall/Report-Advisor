import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = ['src', 'scripts', 'supabase/migrations'];
const files = [];
const selfPath = path.join(root, 'scripts/check-executive-metrics-zero-consumer.mjs');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.git')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:ts|tsx|js|jsx|mjs|sql)$/.test(entry.name) && full !== selfPath) files.push(full);
  }
}
for (const target of targets) walk(path.join(root, target));

const definition = /(?:CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION|DROP\s+FUNCTION)[^;]*\bget_executive_metrics\s*\(/i;
const invocation = /\bget_executive_metrics\s*\(/i;
const consumerFindings = [];

for (const file of files) {
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  const text = fs.readFileSync(file, 'utf8');
  if (!invocation.test(text)) continue;
  if (rel.startsWith('supabase/migrations/') && definition.test(text)) continue;
  consumerFindings.push(rel);
}

if (consumerFindings.length) {
  console.error('EXECUTIVE_METRICS_ZERO_CONSUMER: FAIL');
  for (const file of consumerFindings) console.error(`- runtime/reference consumer: ${file}`);
  process.exit(1);
}

console.log(`EXECUTIVE_METRICS_ZERO_CONSUMER: PASS (${files.length} source/runtime files scanned; no runtime consumer)`);
console.log('The legacy caller-shaped get_executive_metrics(uuid,date,date) function is eligible for exact-signature removal.');
