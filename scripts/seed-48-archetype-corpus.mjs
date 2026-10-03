import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const url = process.env.REPORT_ADVISOR_SUPABASE_URL?.trim();
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const exactHead = process.env.EXACT_HEAD?.trim() || 'UNKNOWN';
if (!url || !serviceRole) throw new Error('48_FIXTURE_SEED_ENV_MISSING');

const service = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const fixtureDir = fileURLToPath(new URL('../tests/fixtures/realistic-reports/48-archetypes/', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'manifest.json'), 'utf8'));
if (manifest.count !== 48 || manifest.catalogId !== 'report-intelligence.48') {
  throw new Error('48_FIXTURE_SEED_MANIFEST_INVALID');
}

const corpusQuery = await service
  .from('file_records')
  .select('company_id,metadata')
  .eq('metadata->>report_corpus', 'true')
  .limit(200);
if (corpusQuery.error) throw corpusQuery.error;

const seedRecord = (corpusQuery.data ?? []).find((row) =>
  row?.company_id &&
  row?.metadata?.uploaded_by &&
  row?.metadata?.storage_bucket,
);
if (!seedRecord) throw new Error('48_FIXTURE_SEED_NO_CORPUS_TENANT');

const companyId = String(seedRecord.company_id);
const uploadedBy = String(seedRecord.metadata.uploaded_by);
const bucket = String(seedRecord.metadata.storage_bucket || 'documents');
if (bucket !== 'documents') throw new Error('48_FIXTURE_SEED_UNEXPECTED_BUCKET');

const results = [];
for (const entry of manifest.files) {
  const fileName = path.basename(String(entry.path));
  const absolute = path.join(fixtureDir, fileName);
  const bytes = fs.readFileSync(absolute);
  const sourceHash = 'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex');

  const existing = await service
    .from('file_records')
    .select('id,status,metadata')
    .eq('company_id', companyId)
    .eq('file_hash', sourceHash)
    .limit(1)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    results.push({
      fileName,
      archetypeId: entry.archetypeId,
      sourceHash,
      status: 'EXISTS',
      fileRecordId: existing.data.id,
    });
    continue;
  }

  const storagePath = companyId + '/imports/' + crypto.randomUUID() + '.csv';
  const upload = await service.storage.from(bucket).upload(storagePath, bytes, {
    contentType: 'text/csv; charset=utf-8',
    upsert: false,
  });
  if (upload.error) throw new Error('48_FIXTURE_STORAGE_UPLOAD_FAILED:' + fileName + ':' + upload.error.message);

  const insert = await service
    .from('file_records')
    .insert({
      company_id: companyId,
      file_name: fileName,
      file_extension: 'csv',
      file_mime: 'text/csv',
      file_size: bytes.byteLength,
      file_hash: sourceHash,
      security_status: 'passed',
      status: 'uploaded',
      metadata: {
        repository: 'Report-Engainall/Report-Advisor',
        source_path: entry.path,
        source_commit: exactHead,
        storage_bucket: bucket,
        storage_path: storagePath,
        report_corpus: true,
        archetype_id: entry.archetypeId,
        fixture_number: entry.number,
        fixture_rows: entry.rows,
        uploaded_by: uploadedBy,
        fixture_type: 'synthetic-realistic',
        catalog_id: 'report-intelligence.48',
      },
    })
    .select('id')
    .single();

  if (insert.error) {
    await service.storage.from(bucket).remove([storagePath]).catch(() => undefined);
    throw new Error('48_FIXTURE_FILE_RECORD_INSERT_FAILED:' + fileName + ':' + insert.error.message);
  }

  results.push({
    fileName,
    archetypeId: entry.archetypeId,
    sourceHash,
    status: 'SEEDED',
    fileRecordId: insert.data.id,
  });
}

const summary = {
  exactHead,
  companyId,
  fixtureCount: manifest.files.length,
  seeded: results.filter((row) => row.status === 'SEEDED').length,
  existing: results.filter((row) => row.status === 'EXISTS').length,
  results,
};
fs.mkdirSync('artifacts/legacy-corpus', { recursive: true });
fs.writeFileSync(
  'artifacts/legacy-corpus/48-archetype-fixture-seed.json',
  JSON.stringify(summary, null, 2) + '\n',
  'utf8',
);
console.log(JSON.stringify({
  status: 'PASS',
  exactHead,
  companyId,
  fixtureCount: summary.fixtureCount,
  seeded: summary.seeded,
  existing: summary.existing,
}));
