import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Validate that watched-folder ingestion preserves the canonical import commit path and required UI controls. */
function read(file) {
  return readFileSync(resolve(file), 'utf8');
}

const engine = read('src/lib/import/batch-folder.ts');
const ui = read('src/components/FolderBatchImportPanel.tsx');
const page = read('src/pages/ImportPage.tsx');
const requiredEngine = ['scanDirectory', 'processFolderFiles', 'securityScan', 'computeSHA256', 'checkDuplicate', 'parseFile', 'commitImportBatch'];
const requiredUi = ['selectDirectory', 'start', 'desktopFolderWatch', 'سحب ومزامنة التقارير من مجلد', 'مسار', 'المجلد'];
const missing = [...requiredEngine.filter((token) => !engine.includes(token)), ...requiredUi.filter((token) => !ui.includes(token))];
if (missing.length) {
  console.error(`Folder batch import contract failed: ${missing.join(', ')}`);
  process.exit(1);
}
if (!page.includes('FolderBatchImportPanel') || !page.includes('CanonicalImportPage')) {
  console.error('Manual and folder import paths must coexist.');
  process.exit(1);
}
if (engine.includes("supabase.from('") && !engine.includes('commitImportBatch')) {
  console.error('Folder importer must not bypass canonical commit.');
  process.exit(1);
}

console.log('Folder batch import contract: PASS');
