import fs from 'node:fs';\n\nconst read = (p) => fs.readFileSync(p, 'utf8');\nconst required = [\n  ['queries-compat forwarding only', () => {\n    const c = read('src/lib/queries-compat.ts');\n    return c.includes("export * from './queries';") && !c.includes('supabase.from') && !c.includes('supabase.rpc');\n  }],\n  ['alert unavailable is distinct', () => {\n    const app = read('src/App.tsx');\n    const header = read('src/components/Header.tsx');\n    return app.includes("alertState === 'unavailable'") && app.includes('alertState={alertState}') && header.includes('alertsUnavailable') && header.includes('خدمة التنبيهات غير متاحة');\n  }],\n  ['import history pagination', () => {\n    const q = read('src/lib/queries.ts');\n    const p = read('src/pages/CanonicalImportPage.tsx');\n    return q.includes('fetchImportRecordPage') && q.includes('.range(from, to)') && p.includes('historyPage') && p.includes('fetchImportRecordPage');\n  }],\n  ['server request byte boundary', () => {\n    const a = read('api/canonical-import-execute.ts');\n    return a.includes('MAX_REQUEST_BYTES') && a.includes('assertRequestSize(req)') && a.includes('request_too_large');\n  }],\n  ['server provenance authority', () => {\n    const a = read('api/canonical-import-execute.ts');\n    const b = read('src/lib/import/canonical-truth-boundary.ts');\n    return a.includes('assertCanonicalImportProvenance') && a.includes('sourceId: importJob.file_name') && b.includes('CANONICAL_LINEAGE_ID_MISMATCH');\n  }],\n  ['real analysis and decision evidence', () => {\n    const a = read('src/lib/import/canonical-production-adapter.ts');\n    const r = read('src/lib/report-execution/durable-production-runner.ts');\n    return a.includes('IMPORT_ANALYSIS_BUSINESS_KEY_COLLISION') && a.includes('IMPORT_DECISION_NOT_ELIGIBLE') && a.includes('analysis:entity=') && a.includes('decision:commit_eligible=true') && r.includes('stageEvidence') && r.includes('evidenceKeys');\n  }],\n  ['source-content durable identity', () => read('src/lib/import/canonical-production-adapter.ts').includes('const jobKey = `canonical-import:${input.entityType}:${input.sourceHash}`;')],
  ['canonical business identity single algorithm', () => {
    const truth = read('src/lib/import/canonical-truth-boundary.ts');
    const adapter = read('src/lib/import/canonical-production-adapter.ts');
    return truth.includes('export function normalizeImportKey') &&
      truth.includes('.trim().toLowerCase().replace(/\\s+/g, \'\')') &&
      adapter.includes('normalizeImportKey(value)') &&
      !/function rowKey[\\s\\S]*?toLowerCase\\(\\)/.test(adapter);
  }],
  ['evidence writer integrity migration', () => {
    const dir = fs.readdirSync('supabase/migrations');
    const file = dir.filter(name => /harden_evidence_writer_integrity/i.test(name)).sort().at(-1);
    if (!file) return false;
    const sql = read(`supabase/migrations/${file}`);
    const tables = ['kpi_evidence_snapshots','report_row_lineage','report_source_versions'];
    return tables.every(t => sql.includes(`REVOKE ALL ON TABLE public.${t} FROM authenticated`) &&
      sql.includes(`GRANT SELECT ON public.${t} TO authenticated`)) &&
      sql.includes('CREATE POLICY kpi_evidence_select_tenant') &&
      sql.includes('CREATE POLICY report_row_lineage_select_tenant') &&
      sql.includes('CREATE POLICY report_source_versions_select_tenant');
  }],
  ['storage bucket boundary migration', () => {
    const dir = fs.readdirSync('supabase/migrations');
    const file = dir.filter(name => /harden_documents_storage_bucket_boundary/i.test(name)).sort().at(-1);
    if (!file) return false;
    const sql = read(`supabase/migrations/${file}`);
    return sql.includes('DROP POLICY IF EXISTS storage_objects_select_current_tenant ON storage.objects') &&
      sql.includes(`bucket_id = 'documents'`) &&
      sql.includes('documents_storage_select_tenant') &&
      sql.includes('documents_storage_insert_tenant') &&
      sql.includes('documents_storage_update_tenant_owner') &&
      sql.includes('documents_storage_delete_tenant_owner') &&
      sql.includes('file_size_limit') &&
      sql.includes('allowed_mime_types');
  }],\n  ['canonical report routes', () => {\n    const app = read('src/App.tsx');\n    const page = read('src/pages/ReportsPage.tsx');\n    return app.includes('@/pages/SalesReportCanonicalPage') && app.includes('@/pages/PurchasesReportCanonicalPage') && app.includes('@/pages/InventoryReportCanonicalPage') && page.includes('ReportsCenterPage');\n  }],\n  ['PWA static shell', () => {\n    const sw = read('public/sw.js');\n    return sw.includes('SHELL_URLS') && sw.includes("request.mode === 'navigate'");\n  }],\n  ['security headers declared', () => {\n    const net = read('netlify.toml');\n    const vercel = read('vercel.json');\n    return net.includes('Content-Security-Policy') && net.includes('X-Content-Type-Options') && vercel.includes('"headers"') && vercel.includes('"X-Frame-Options"');\n  }],\n  ['document model canonical', () => {\n    const contracts = read('services/document-intelligence/app/contracts.py');\n    const intermediate = read('services/document-intelligence/app/intermediate_model.py');\n    const main = read('services/document-intelligence/app/main.py');\n    return contracts.includes('class DocumentEnvelope') && contracts.includes('class Provenance') && intermediate.includes('from .contracts import') && !intermediate.includes('class DocumentEnvelope') && main.includes('from .contracts import');\n  }],\n];\n\nfor (const [name, check] of required) {\n  const ok = check();\n  console.log(ok ? 'PASS' : 'FAIL', name);\n  if (!ok) process.exitCode = 1;\n}\nif (process.exitCode) throw new Error('Canonical truth hardening gate failed');\nconsole.log('Canonical truth hardening gate: PASS');\n