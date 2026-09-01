import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const engine = readFileSync(resolve('src/lib/import/batch-folder.ts'), 'utf8');
const ui = readFileSync(resolve('src/components/FolderBatchImportPanel.tsx'), 'utf8');
const page = readFileSync(resolve('src/pages/ImportPage.tsx'), 'utf8');
const requiredEngine = ['scanDirectory', 'processFolderFiles', 'securityScan', 'computeSHA256', 'checkDuplicate', 'parseFile', 'commitImportBatch'];
const requiredUi = ['showDirectoryPicker', 'سحب ومزامنة التقارير من مجلد', 'المسار', 'المجلد'];
const missing = [...requiredEngine.filter(x => !engine.includes(x)), ...requiredUi.filter(x => !ui.includes(x))];
if (missing.length) { console.error(`Folder batch import contract failed: ${missing.join(', ')}`); process.exit(1); }
if (!page.includes('FolderBatchImportPanel') || !page.includes('CanonicalImportPage')) { console.error('Manual and folder import paths must coexist.'); process.exit(1); }
if (engine.includes("supabase.from('") && !engine.includes('commitImportBatch')) { console.error('Folder importer must not bypass canonical commit.'); process.exit(1); }
console.log('Folder batch import contract: PASS');
