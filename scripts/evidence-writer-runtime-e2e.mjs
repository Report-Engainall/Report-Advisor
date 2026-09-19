import { createClient } from '@supabase/supabase-js';

const required = [
  'REPORT_ADVISOR_SUPABASE_URL',
  'REPORT_ADVISOR_SUPABASE_ANON_KEY',
  'TEST_USER_A_EMAIL',
  'TEST_USER_A_PASSWORD',
];
for (const name of required) if (!process.env[name]) throw new Error(`MISSING_ENV:${name}`);

const url = process.env.REPORT_ADVISOR_SUPABASE_URL;
const anon = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY;
const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });

const { error: authError } = await client.auth.signInWithPassword({
  email: process.env.TEST_USER_A_EMAIL,
  password: process.env.TEST_USER_A_PASSWORD,
});
if (authError) throw authError;

async function expectBlocked(label, fn) {
  const result = await fn();
  if (!result?.error) throw new Error(`DIRECT_WRITER_NOT_BLOCKED:${label}`);
  const detail = `${result.error.code ?? ''} ${result.error.message ?? ''}`;
  if (!/42501|permission denied|row-level security|not authorized/i.test(detail)) {
    throw new Error(`WRONG_DIRECT_WRITER_REJECTION:${label}:${detail}`);
  }
  console.log(`NEGATIVE PASS: ${label}`);
}

const { data: snapshot, error: captureError } = await client.rpc('capture_kpi_evidence_snapshot', {
  p_kpi_key: 'dashboard.total_sales',
  p_as_of: new Date().toISOString().slice(0, 10),
  p_months: 6,
});
if (captureError || !snapshot?.id) throw captureError ?? new Error('CANONICAL_EVIDENCE_WRITER_FAILED');

for (const table of ['kpi_evidence_snapshots', 'report_row_lineage', 'report_source_versions']) {
  await expectBlocked(`${table} INSERT`, () => client.from(table).insert({}));
  await expectBlocked(`${table} UPDATE`, () => client.from(table).update({}).eq('id', crypto.randomUUID()));
  await expectBlocked(`${table} DELETE`, () => client.from(table).delete().eq('id', crypto.randomUUID()));
  console.log(`DIRECT DML BLOCKED: ${table}`);
}

const { data: readBack, error: readError } = await client
  .from('kpi_evidence_snapshots')
  .select('id,kpi_key,value,quality,company_id,source_evidence')
  .eq('id', snapshot.id)
  .single();
if (readError || !readBack) throw readError ?? new Error('EVIDENCE_READBACK_FAILED');
if (readBack.kpi_key !== 'dashboard.total_sales') throw new Error('EVIDENCE_IDENTITY_READBACK_FAILED');
if (readBack.source_evidence?.source_rpc !== 'get_dashboard_snapshot') throw new Error('EVIDENCE_SOURCE_PROVENANCE_READBACK_FAILED');

console.log(JSON.stringify({
  status: 'PASS',
  canonicalWriter: 'capture_kpi_evidence_snapshot',
  snapshotId: snapshot.id,
  tested: [
    'kpi_evidence_snapshots INSERT/UPDATE/DELETE blocked',
    'report_row_lineage INSERT/UPDATE/DELETE blocked',
    'report_source_versions INSERT/UPDATE/DELETE blocked',
    'canonical evidence writer PASS',
    'evidence readback provenance verified',
  ],
}, null, 2));
