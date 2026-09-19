import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const checks = [
  ['queries-compat forwarding only', () => {
    const c = read('src/lib/queries-compat.ts');
    return c.includes("export * from './queries';") && !/supabase\.(from|rpc)\(/.test(c);
  }],
  ['alert unavailable is distinct', () => {
    const app = read('src/App.tsx');
    const header = read('src/components/Header.tsx');
    return /useState<'loading'\\|'ready'\\|'unavailable'>\('loading'\)/.test(app) && app.includes('alertState={alertState}') &&
      header.includes('alertsUnavailable') && /خدمة التنبيهات غير متاحة/.test(header);
  }],
  ['import history pagination', () => {
    const q = read('src/lib/queries.ts');
    const p = read('src/pages/CanonicalImportPage.tsx');
    return q.includes('fetchImportRecordPage') && q.includes('.range(from, to)') &&
      p.includes('historyPage') && p.includes('fetchImportRecordPage');
  }],
  ['server request byte boundary', () => {
    const a = read('api/canonical-import-execute.ts');
    return a.includes('MAX_REQUEST_BYTES') && a.includes('assertRequestSize(req)') && a.includes('request_too_large');
  }],
  ['server provenance gate exists', () => {
    const a = read('api/canonical-import-execute.ts');
    const b = read('src/lib/import/canonical-truth-boundary.ts');
    return a.includes('assertCanonicalImportProvenance') && b.includes('CANONICAL_LINEAGE_ID_MISMATCH');
  }],
  ['real analysis and decision evidence', () => {
    const a = read('src/lib/import/canonical-production-adapter.ts');
    const r = read('src/lib/report-execution/durable-production-runner.ts');
    return a.includes('IMPORT_ANALYSIS_BUSINESS_KEY_COLLISION') && a.includes('IMPORT_DECISION_NOT_ELIGIBLE') &&
      a.includes('analysis:entity=') && a.includes('decision:commit_eligible=true') &&
      r.includes('stageEvidence') && r.includes('evidenceKeys');
  }],
  ['source-content durable identity', () => read('src/lib/import/canonical-production-adapter.ts').includes('const jobKey = `canonical-import:${input.entityType}:${input.sourceHash}`;')],
  ['canonical business identity single algorithm', () => {
    const truth = read('src/lib/import/canonical-truth-boundary.ts');
    const adapter = read('src/lib/import/canonical-production-adapter.ts');
    return truth.includes('export function normalizeImportKey') &&
      truth.includes('normalizeBusinessKey(value)') &&
      adapter.includes('normalizeImportKey(value)') &&
      !/function rowKey[\\s\\S]*?toLowerCase\(\)/.test(adapter);
  }],
  ['evidence writer integrity migration', () => {
    const dir = fs.readdirSync('supabase/migrations');
    const file = dir.find(name => /harden_evidence_writer_integrity/i.test(name));
    if (!file) return false;
    const sql = read(`supabase/migrations/${file}`);
    const tables = ['kpi_evidence_snapshots','report_row_lineage','report_source_versions'];
    return tables.every(t => sql.includes(`REVOKE ALL ON TABLE public.${t} FROM authenticated`) &&
      sql.includes(`GRANT SELECT ON TABLE public.${t} TO authenticated`)) &&
      sql.includes('CREATE POLICY kpi_evidence_select_tenant') &&
      sql.includes('CREATE POLICY report_row_lineage_select_tenant') &&
      sql.includes('CREATE POLICY report_source_versions_select_tenant');
  }],
  ['storage bucket boundary migration', () => {
    const dir = fs.readdirSync('supabase/migrations');
    const file = dir.find(name => /harden_documents_storage_bucket_boundary/i.test(name));
    if (!file) return false;
    const sql = read(`supabase/migrations/${file}`);
    return sql.includes("bucket_id = 'documents'") &&
      sql.includes('documents_storage_select_tenant') &&
      sql.includes('documents_storage_insert_tenant') &&
      sql.includes('documents_storage_update_tenant_owner') &&
      sql.includes('documents_storage_delete_tenant_owner') &&
      sql.includes('file_size_limit') && sql.includes('allowed_mime_types');
  }],
  ['canonical report routes', () => {
    const app = read('src/App.tsx');
    const page = read('src/pages/ReportsPage.tsx');
    return app.includes('@/pages/SalesReportCanonicalPage') &&
      app.includes('@/pages/PurchasesReportCanonicalPage') &&
      app.includes('@/pages/InventoryReportCanonicalPage') &&
      page.includes('ReportsCenterPage');
  }],
  ['PWA static shell', () => {
    const sw = read('public/sw.js');
    return sw.includes('SHELL_URLS') && sw.includes("request.mode === 'navigate'");
  }],
  ['security headers declared', () => {
    const net = read('netlify.toml');
    const vercel = read('vercel.json');
    return net.includes('Content-Security-Policy') && net.includes('X-Content-Type-Options') &&
      vercel.includes('"headers"') && vercel.includes('"X-Frame-Options"');
  }],
  ['document model canonical', () => {
    const contracts = read('services/document-intelligence/app/contracts.py');
    const intermediate = read('services/document-intelligence/app/intermediate_model.py');
    const main = read('services/document-intelligence/app/main.py');
    return contracts.includes('class DocumentEnvelope') && contracts.includes('class Provenance') &&
      intermediate.includes('from .contracts import') && !intermediate.includes('class DocumentEnvelope') &&
      main.includes('from .contracts import');
  }],
];
for (const [name, check] of checks) {
  const ok = check();
  console.log(ok ? 'PASS' : 'FAIL', name);
  if (!ok) process.exitCode = 1;
}
if (process.exitCode) throw new Error('Canonical truth hardening gate failed');
console.log('Canonical truth hardening gate: PASS');
