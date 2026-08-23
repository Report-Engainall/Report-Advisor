import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/lib/import-pipeline/report-file-contract.ts',
  'src/lib/import-pipeline/report-header-normalization.ts',
  'src/lib/import-pipeline/incremental-import-ledger.ts',
  'src/lib/import-pipeline/folder-watch-contract.ts',
];
for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing foundation file: ${file}`);
}
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const report = read(files[0]);
if (!report.includes("'.pdf'") || !report.includes("'.xlsx'") || !report.includes("'.csv'")) throw new Error('Supported report extensions contract is incomplete');
const headers = read(files[1]);
for (const token of ['رقم الصنف','السعر','رصيد المخزون','Customer Number']) if (!headers.includes(token)) throw new Error(`Header synonym missing: ${token}`);
const incremental = read(files[2]);
for (const token of ['skip_unchanged','process_changed','changedRows']) if (!incremental.includes(token)) throw new Error(`Incremental import contract missing: ${token}`);
const watcher = read(files[3]);
for (const token of ['created','changed','dead_letter','maxConcurrent']) if (!watcher.includes(token)) throw new Error(`Folder watcher contract missing: ${token}`);
console.log('Phase 1/2 import-folder foundation contract: PASS');
