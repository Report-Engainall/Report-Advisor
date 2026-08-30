import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
}
walk(path.join(root, 'src'));
const candidates = files.filter((f) => /(report|dashboard|analytics|summary|export|intelligence|inventory|receivable|forecast|decision|recommendation)/i.test(path.basename(f)));
if (!candidates.length) throw new Error('No business reporting/export surfaces discovered');
const source = candidates.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

if (/SELECT\s+\*\s+FROM\s+auth\.users/i.test(source)) throw new Error('Reporting/export surface directly reads auth.users');
const unsafe = /(?:Number|parseFloat|parseInt)\(\s*[^()\n]{0,240}\s*\)\s*\|\|\s*0\b/g;
for (const match of source.matchAll(unsafe)) throw new Error(`Silent numeric fallback detected: ${match[0]}`);
const missing = /\b(?:kpis|metrics|summary|totals|result|value)\??\.[A-Za-z_$][\w$]*\s*\|\|\s*0\b/g;
for (const match of source.matchAll(missing)) throw new Error(`Missing metric rendered as zero: ${match[0]}`);
if (/\b(?:export|download|csv|xlsx|report)\b/i.test(source) && !/current_company_id|company_id/i.test(source)) throw new Error('Export/report surface lacks visible tenant authority marker');

const decoy = `// Number(value) || 0\n/* metrics.total || 0 */`;
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
if (/Number\(|metrics\.total/.test(stripComments(decoy))) throw new Error('Test-of-test comment decoy bypass');

console.log(`Phase 8 report/export closure: PASS (${candidates.length} business surfaces scanned)`);
