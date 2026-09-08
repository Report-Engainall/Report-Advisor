import fs from 'node:fs';

const panel = fs.readFileSync('src/components/FolderBatchImportPanel.tsx', 'utf8');
const runtime = fs.readFileSync('src/lib/import/folder-universal-sync.ts', 'utf8');
const store = fs.readFileSync('src/lib/import/folder-sync-session-store.ts', 'utf8');

const required = [
  ['panel uses universal runtime', panel.includes("processFolderFilesUniversal")],
  ['panel no longer selects a fixed entity', !panel.includes("useState<BatchEntityType>") && !panel.includes('فواتير المبيعات')],
  ['panel restores persisted session', panel.includes('loadFolderSyncSession')],
  ['panel persists progress', panel.includes('saveFolderSyncSession')],
  ['runtime infers entity', runtime.includes('function inferEntity')],
  ['runtime supports document analysis without fake import failure', runtime.includes("'document_analysis'") && runtime.includes('تم تحليل الوثيقة')],
  ['runtime analyzes every dataset', runtime.includes('for (const dataset of datasets)')],
  ['runtime preserves duplicate detection', runtime.includes('checkDuplicate')],
  ['session store uses localStorage', store.includes("localStorage.setItem(KEY") && store.includes("localStorage.getItem(KEY)")],
];
const failed = required.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Folder sync universal guard failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log(`Folder sync universal guard PASS (${required.length}/${required.length})`);
