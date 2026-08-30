import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  watcher: 'src/lib/import-pipeline/folder-watch-service.ts',
  store: 'src/lib/import-pipeline/folder-watch-store.ts',
  ledger: 'src/lib/import-pipeline/incremental-import-ledger.ts',
  contract: 'src/lib/import-pipeline/folder-monitor-contract.ts',
  baseline: 'scripts/check-watched-report-pipeline-contract.mjs',
};
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing Phase 7 source (${name}): ${file}`);
}
const watcher = read(files.watcher);
const store = read(files.store);
const ledger = read(files.ledger);
const contract = read(files.contract);
const baseline = read(files.baseline);

for (const token of ['ensureFolderPermission', 'sha256File', 'scanWatchedDirectory', 'startWatchedFolder']) {
  if (!watcher.includes(token)) throw new Error(`Watcher capability missing: ${token}`);
}
for (const token of ['SHA-256', 'skip_unchanged', 'deletedFiles', 'failedFiles']) {
  if (!watcher.includes(token)) throw new Error(`Watcher safety invariant missing: ${token}`);
}
for (const token of ['process_changed', 'skip_unchanged', 'reconcileRows']) {
  if (!ledger.includes(token)) throw new Error(`Incremental ledger invariant missing: ${token}`);
}
for (const token of ['watched_report_folders', 'watched_report_files']) {
  if (!store.includes(token)) throw new Error(`Watcher persistence invariant missing: ${token}`);
}
for (const token of ['quarantine', 'acceptedExtensions']) {
  if (!contract.includes(token)) throw new Error(`Watcher policy invariant missing: ${token}`);
}

if (!watcher.includes("Math.max(1000,policy.pollIntervalMs)")) throw new Error('Polling lower bound missing');
if (!watcher.includes('if(!stopped)timer=setTimeout(loop')) throw new Error('Stop/reschedule guard missing');
if (!watcher.includes('failedFiles:1')) throw new Error('Fail-closed scan error evidence missing');
if (!baseline.includes('SHA-256') || !baseline.includes('process_changed')) throw new Error('Baseline watcher contract is incomplete');

// Adversarial test-of-test: comments must never count as live implementation evidence.
const decoy = `// ensureFolderPermission(fake)\n// sha256File(fake)\n/* startWatchedFolder(fake) */`;
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
const sanitized = stripComments(decoy);
if (/ensureFolderPermission|sha256File|startWatchedFolder/.test(sanitized)) {
  throw new Error('Comment-decoy bypass detected');
}

console.log('Phase 7 watcher lifecycle closure: PASS');
