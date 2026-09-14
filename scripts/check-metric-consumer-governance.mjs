import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoots = ['src'];
const allowedFiles = new Set([
  path.normalize('src/lib/semanticMetrics.ts'),
  path.normalize('src/lib/semantic-metric-registry.ts'),
]);

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'build'].includes(entry.name)) files.push(...collectFiles(full));
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const violations = [];

for (const sourceRoot of sourceRoots) {
  for (const file of collectFiles(path.join(root, sourceRoot))) {
    const relative = path.relative(root, file);
    const normalized = path.normalize(relative);
    if (allowedFiles.has(normalized)) continue;

    const text = fs.readFileSync(file, 'utf8');
    if (/\bBUSINESS_METRICS\b/.test(text)) {
      violations.push(`${relative}: direct BUSINESS_METRICS consumer; use requireSemanticMetric/registry instead`);
    }

    if (/(?:['\"\`])metric\.cash(?:['\"\`])/.test(text)) {
      violations.push(`${relative}: direct legacy metric ID "metric.cash"; resolve through the canonical metric resolver`);
    }
  }
}

if (violations.length) {
  console.error('Metric consumer governance: FAIL');
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log(`Metric consumer governance: PASS (scanned ${sourceRoots.join(', ')}; legacy metric.cash and BUSINESS_METRICS bypasses protected)`);