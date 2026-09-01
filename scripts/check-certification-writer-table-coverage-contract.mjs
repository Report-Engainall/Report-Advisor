import fs from 'node:fs';
const source = fs.readFileSync('scripts/check-certification-evidence-writer-boundary.mjs', 'utf8');
const expected = ['trust_certifications', 'autonomy_certification_runs', 'backup_verification_runs', 'autonomy_rollback_drills'];
for (const table of expected) {
  if (!source.includes(table)) throw new Error(`CERTIFICATION_WRITER_TABLE_MISSING:${table}`);
}
console.log('CERTIFICATION_WRITER_TABLE_COVERAGE_PASS');
