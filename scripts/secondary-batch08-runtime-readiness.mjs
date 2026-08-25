import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const pass = (name, detail) => checks.push({ status: 'PASS', name, detail });
const gap = (name, detail) => checks.push({ status: 'GAP', name, detail });
const blocked = (name, detail) => checks.push({ status: 'BLOCKED', name, detail });
const fail = (name, detail) => checks.push({ status: 'FAIL', name, detail });

function requireText(file, patterns, label) {
  const text = read(file);
  const missing = patterns.filter((pattern) => !text.includes(pattern));
  if (missing.length) fail(label, `${file}: missing ${missing.join(', ')}`);
  else pass(label, file);
}

requireText('src/lib/documentIntelligenceGateway.ts', [
  'DocumentExtractionEnvelope', 'stage:', 'warnings:', 'facts:', 'confidence', 'source', 'page', 'mayCostMoney'
], 'Document extraction envelope contract');

const envelope = read('src/lib/documentIntelligenceGateway.ts');
for (const field of ['document', 'block', 'table', 'row', 'column', 'cell', 'coordinates', 'parserVersion', 'sourceHash']) {
  if (envelope.includes(field)) pass(`Document lineage field: ${field}`, 'present in current gateway source');
  else gap(`Document lineage field: ${field}`, 'not represented by the current envelope; mainline runtime/persistence required');
}

requireText('src/lib/data-quality-queries.ts', [
  "from('customers').select('name,phone,code')",
  "from('products').select('sku,name,cost_price,selling_price,reorder_point')",
  "from('sales_invoices').select('total,paid_amount,customer_id,invoice_date,invoice_number')",
  "from('inventory_balances').select('quantity,unit_cost,product_id,warehouse_id')",
  'Supabase RLS/current_company_id'
], 'Data Quality bounded tenant-native projection');

const dq = read('src/lib/data-quality-queries.ts');
if (/select\(\s*['"]\*['"]\s*\)/.test(dq)) fail('Data Quality select(*) guard', 'unbounded projection detected');
else pass('Data Quality select(*) guard', 'no select(*) in authoritative query boundary');

requireText('src/lib/file-engine/reconciliation.ts', [
  'ReconciliationResult', 'ReconciliationSummary', 'conflict', 'error', 'stableImportFingerprint'
], 'Authoritative reconciliation contract');

requireText('src/lib/phase-kl-supabase-runtime.ts', [
  'record_control_plane_health', 'record_executive_evidence_edge'
], 'Phase K/L runtime persistence boundary');

const migrationDir = path.join(root, 'supabase/migrations');
const migrations = fs.readdirSync(migrationDir).join('\n');
for (const marker of [
  '20260822212000_canonical_tenant_membership.sql',
  '20260822210000_import_rpc_fail_closed.sql',
  '20260825142000_phase_kl_runtime_closure.sql',
  '20260825150000_phase_m_certification_bundle.sql'
]) {
  if (migrations.includes(marker)) pass(`Migration inventory: ${marker}`, 'present in repository');
  else fail(`Migration inventory: ${marker}`, 'expected migration missing');
}

const secondaryFiles = [
  'scripts/secondary-batch05-runtime-audit.mjs',
  'scripts/secondary-batch06-quality-audit.mjs',
  'scripts/secondary-batch07-runtime-inventory.mjs',
  'scripts/secondary-batch07-safe-surfaces.test.mjs',
  'src/lib/secondary-batch07-safe-surfaces.ts',
  '.github/workflows/secondary-agent-batch04.yml'
].filter((file) => fs.existsSync(path.join(root, file)));
const paidMarkers = /api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com|lovable/i;
const paidHits = secondaryFiles.filter((file) => paidMarkers.test(read(file)));
if (paidHits.length) fail('Free-first secondary surface guard', `paid/provider marker found in ${paidHits.join(', ')}`);
else pass('Free-first secondary surface guard', 'no known paid-provider marker in secondary surfaces');

const tenantMatrix = [
  'two-company read isolation',
  'two-company write isolation',
  'no membership fail-closed',
  'inactive membership',
  'default company resolution',
  'cross-tenant Import RPC rejection'
];
for (const name of tenantMatrix) blocked(`Tenant certification: ${name}`, 'LIVE REQUIRED; a real isolated Supabase environment is required and is not available to this branch audit');

const evidenceNodes = ['Source File', 'Page', 'Table', 'Row', 'Column', 'Cell', 'Extracted Value', 'Normalized Value', 'Entity', 'Canonical Record', 'Metric', 'Report', 'Decision', 'Action', 'Outcome'];
for (const node of evidenceNodes) {
  if (['Source File', 'Extracted Value', 'Normalized Value', 'Decision'].includes(node)) pass(`Evidence node readiness: ${node}`, 'contract/presentation support exists; runtime proof remains separate');
  else blocked(`Evidence node readiness: ${node}`, 'authoritative persisted identifier/runtime evidence is not proven by static inspection');
}

const counts = checks.reduce((acc, item) => {
  acc[item.status] = (acc[item.status] ?? 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({
  status: checks.some((c) => c.status === 'FAIL') ? 'FAIL' : 'GATED',
  counts,
  checks
}, null, 2));

if (checks.some((c) => c.status === 'FAIL')) process.exitCode = 1;
