import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIRS = ['src', 'services'];
const EXCLUDE = new Set(['node_modules', '.git', 'dist', 'coverage']);
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(mjs|cjs|js|ts|tsx|py)$/.test(entry.name)) files.push(full);
  }
}
for (const dir of SOURCE_DIRS) walk(path.join(ROOT, dir));

const text = new Map(files.map(f => [f, fs.readFileSync(f, 'utf8')]));
const rel = f => path.relative(ROOT, f).replaceAll(path.sep, '/');
const findings = [];
const add = (kind, file, detail) => findings.push({ kind, file: rel(file), detail });

const consumerTerms = [
  ['Dashboard', /dashboard|Dashboard|kpi|KPI/i],
  ['Reports', /report|Report/i],
  ['Exports', /export|Export|download|Download/i],
  ['Decisions', /decision|Decision/i],
  ['BI', /business.?intelligence|\bBI\b|grossProfit|grossMargin|totalSales/i],
  ['Notifications', /notification|Notification/i],
  ['Search/Filters', /search|Search|filter|Filter/i],
];

const consumerInventory = [];
for (const [file, body] of text) {
  if (!/src\/(pages|components)\//.test(rel(file))) continue;
  const surfaces = consumerTerms.filter(([, re]) => re.test(body)).map(([name]) => name);
  if (!surfaces.length) continue;
  const directDb = /supabase\.(from|rpc|storage)|createClient\(/.test(body);
  const formulas = ['grossProfit', 'grossMargin', 'totalSales'].filter(k => new RegExp(`\\b${k}\\b`).test(body));
  consumerInventory.push({ consumer: rel(file), surfaces, directDb, formulas });
  if (directDb) add('DIRECT_DB_CONSUMER', file, 'UI/page/component contains direct Supabase access; review service/canonical authority boundary.');
  if (formulas.length) add('LOCAL_BUSINESS_FORMULA', file, formulas.join(', '));
}

const authorityPatterns = [
  { kind: 'CLIENT_TENANT_AUTHORITY', re: /(localStorage|sessionStorage).{0,160}(company|tenant)|(?:company|tenant).{0,100}(localStorage|sessionStorage)/is },
  { kind: 'CLIENT_OBJECT_PATH', re: /(storage|bucket|objectPath|object_path|signedUrl|signed_url).{0,180}(company|tenant|user|id)/is },
  { kind: 'CLIENT_RECIPIENT', re: /(recipient|recipientId|recipient_id).{0,100}(searchParams|request|body|params|query)/is },
  { kind: 'CLIENT_REPORT_ID', re: /(reportId|report_id|decisionId|decision_id|outcomeId|outcome_id).{0,100}(searchParams|request|body|params|query)/is },
  { kind: 'FALLBACK_TENANT', re: /(company_id|tenant_id).{0,120}(fallback|default|localStorage|sessionStorage)/is },
];
for (const [file, body] of text) {
  if (/scripts\//.test(rel(file))) continue;
  for (const p of authorityPatterns) if (p.re.test(body)) add(p.kind, file, 'Potential indirect authority path; server-derived tenant/object authorization must dominate client input.');
}

const provenancePatterns = [
  { kind: 'VALUE_WITHOUT_EVIDENCE', re: /(normalized|canonical|extracted|parsed)[A-Za-z0-9_]*\s*[:=].{0,120}(confidence|score)/is },
  { kind: 'CONFIDENCE_WITHOUT_EVIDENCE', re: /confidence.{0,180}(normalized|canonical|value|output)/is },
  { kind: 'DECISION_DIRECT_WRITE', re: /(decision|Decision).{0,120}(supabase\.(from|rpc)|insert\(|create)/is },
];
for (const [file, body] of text) {
  if (!/src\//.test(rel(file))) continue;
  for (const p of provenancePatterns) if (p.re.test(body)) add(p.kind, file, 'Review provenance/authority path; value confidence must remain evidence-backed and decision creation must use canonical graph.');
}

const requiredCanonical = [
  'src/lib/decision-feedback-graph.ts',
  'src/lib/observability/trace-context.ts',
];
for (const required of requiredCanonical) {
  if (!fs.existsSync(path.join(ROOT, required))) add('MISSING_CANONICAL', path.join(ROOT, required), 'Canonical implementation expected by Wave 04 proof gate.');
}

const report = {
  schemaVersion: 1,
  consumerInventory,
  findings,
  counts: {
    filesScanned: files.length,
    consumers: consumerInventory.length,
    directDbConsumers: consumerInventory.filter(x => x.directDb).length,
    localFormulaConsumers: consumerInventory.filter(x => x.formulas.length).length,
    authorityFindings: findings.filter(x => x.kind.includes('AUTHORITY') || x.kind.includes('OBJECT') || x.kind.includes('RECIPIENT') || x.kind.includes('REPORT_ID') || x.kind.includes('FALLBACK')).length,
    provenanceFindings: findings.filter(x => x.kind.includes('EVIDENCE') || x.kind.includes('DECISION')).length,
  },
};
console.log(JSON.stringify(report, null, 2));

// Wave 04 deliberately fails only on high-confidence unsafe patterns. Inventory-only
// observations remain visible without weakening the gate.
const blocking = findings.filter(f => [
  'CLIENT_TENANT_AUTHORITY',
  'FALLBACK_TENANT',
  'CLIENT_RECIPIENT',
].includes(f.kind));
if (blocking.length) {
  console.error(`Wave 04 authority proof failed: ${blocking.length} blocking finding(s).`);
  process.exit(1);
}
