import fs from 'node:fs';
const files = {
  'src/lib/report-execution/execution-ledger.ts': ['ReportExecutionCoordinator','assertReportExecutionReady','assertNoQuarantine','IdempotencyRegistry','InMemoryReportQueue','immutable: true'],
};
for (const [file,tokens] of Object.entries(files)) { const s=fs.readFileSync(file,'utf8'); for (const token of tokens) if(!s.includes(token)) throw new Error(`${file}: missing ${token}`); }
const srcRoot = new URL('../src/', import.meta.url);
const allowedInMemoryFiles = new Set([
  'lib/report-execution/execution-ledger.ts',
  'lib/report-execution/queue.ts',
]);
const forbiddenProductionTokens = [
  'new InMemoryReportQueue(',
  'import { InMemoryReportQueue',
  'import { ReportExecutionCoordinator',
  'from \'./queue\'',
];
function scanSourceTree(dir, relative = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const nextRelative = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      scanSourceTree(new URL(`../src/${nextRelative}/`, import.meta.url).pathname, nextRelative);
      continue;
    }
    if (!/\\.(ts|tsx|js|jsx)$/.test(entry.name)) continue;
    if (allowedInMemoryFiles.has(nextRelative)) continue;
    const source = fs.readFileSync(new URL(`../src/${nextRelative}`, import.meta.url), 'utf8');
    for (const token of forbiddenProductionTokens) {
      if (source.includes(token)) throw new Error(`Production source references in-memory report execution surface: ${nextRelative}: ${token}`);
    }
  }
}
scanSourceTree(new URL('../src/', import.meta.url).pathname);

const migration = 'supabase/migrations/20260830021624_harden_report_execution_claim_boundary.sql';
if (!fs.existsSync(migration)) throw new Error(`Missing report execution claim boundary migration: ${migration}`);
const migrationSql = fs.readFileSync(migration,'utf8');
for (const token of ["claim_report_execution_job(uuid,text,integer)", 'revoke execute', 'from authenticated', 'from anon', 'from public']) {
  if (!migrationSql.includes(token)) throw new Error(`${migration}: missing ${token}`);
}
console.log('report execution coordinator contract: PASS');
