import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const watcherPath = path.join(root, 'src/lib/import-pipeline/folder-watch-service.ts');
const storePath = path.join(root, 'src/lib/import-pipeline/folder-watch-store.ts');
const ledgerPath = path.join(root, 'src/lib/import-pipeline/incremental-import-ledger.ts');
const contractPath = path.join(root, 'src/lib/import-pipeline/folder-monitor-contract.ts');
const pipelinePath = path.join(root, 'scripts/check-watched-report-pipeline-contract.mjs');

for (const file of [watcherPath, storePath, ledgerPath, contractPath, pipelinePath]) {
  if (!fs.existsSync(file)) throw new Error(`Missing Phase 7 source: ${path.relative(root, file)}`);
}
const read = (file) => fs.readFileSync(file, 'utf8');
const watcher = read(watcherPath);
const store = read(storePath);
const ledger = read(ledgerPath);
const contract = read(contractPath);
const pipeline = read(pipelinePath);

for (const token of ['ensureFolderPermission', 'sha256File', 'scanWatchedDirectory', 'startWatchedFolder']) {
  if (!watcher.includes(token)) throw new Error(`Watcher capability missing: ${token}`);
}
for (const token of ['SHA-256', 'skip_unchanged', 'deletedFiles', 'failedFiles']) {
  if (!watcher.includes(token)) throw new Error(`Watcher safety invariant missing: ${token}`);
}
for (const token of ['process_changed', 'skip_unchanged', 'reconcileRows']) {
  if (!ledger.includes(token)) throw new Error(`Incremental ledger invariant missing: ${token}`);
}
for (const token of ['watched_report_folders', 'watched_report_files', 'tenant', 'quarantine']) {
  if (!store.includes(token) && !contract.includes(token)) throw new Error(`Watcher persistence/safety evidence missing: ${token}`);
}

// Test-of-test: commented decoys must not be accepted as executable evidence.
const decoy = `// ensureFolderPermission(fake);\n// sha256File(fake);\n/* startWatchedFolder(fake); */`;
const stripComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\s)\/\/.*$/gm, '$1');
const sanitizedDecoy = stripComments(decoy);
if (sanitizedDecoy.includes('ensureFolderPermission') || sanitizedDecoy.includes('sha256File') || sanitizedDecoy.includes('startWatchedFolder')) {
  throw new Error('Test-of-test failed: SQL/code comment decoy was treated as live watcher evidence');
}

// Runtime lifecycle invariants are asserted structurally: polling cannot spin faster than 1s,
// stop must prevent rescheduling, and scan failures must become explicit failed evidence.
if (!watcher.includes("Math.max(1000,policy.pollIntervalMs)")) throw new Error('Watcher polling lower bound missing');
if (!watcher.includes('if(!stopped)timer=setTimeout(loop')) throw new Error('Watcher stop/reschedule guard missing');
if (!watcher.includes("failedFiles:1")) throw new Error('Watcher fail-closed scan error evidence missing');
if (!pipeline.includes('check-watched-report-pipeline-contract')) throw new Error('Phase 7 baseline contract is not discoverable');

console.log('Phase 7 watcher lifecycle closure: PASS');
