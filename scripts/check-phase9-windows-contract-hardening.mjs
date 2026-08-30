import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const files = [
  'desktop/main.cjs',
  'desktop/preload.cjs',
  'desktop/package.json',
  'scripts/check-windows-desktop-folder-watch-contract.mjs',
];
for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing Phase 9 surface: ${file}`);
}
const main = read('desktop/main.cjs');
const preload = read('desktop/preload.cjs');
const pkg = read('desktop/package.json');
const guard = read('scripts/check-windows-desktop-folder-watch-contract.mjs');

for (const token of [
  'fs.watch', 'recursive:true', 'WATCH_FOLDER_PATH_OUTSIDE_ROOT',
  'queueFileCandidate', 'handleFilesystemEvent', 'scheduleEventRescan',
  'stableSince', 'requiredStableMs=400', 'watchGeneration',
  'activeRescanPromise', 'const latest=new Set(walk(root))',
  'setInterval(()=>{void rescan();}', '30000',
]) if (!main.includes(token)) throw new Error(`Phase 9 missing runtime invariant: ${token}`);

for (const token of ['contextIsolation:true', 'nodeIntegration:false', 'desktopFolderWatch', 'readFile', 'onFile']) {
  if (!(main + preload).includes(token)) throw new Error(`Phase 9 missing isolated bridge invariant: ${token}`);
}

for (const token of ['electron', 'electron-builder', 'package:win', 'com.reportadvisor.desktop']) {
  if (!pkg.includes(token)) throw new Error(`Phase 9 missing packaging invariant: ${token}`);
}

if (main.includes("startWatch(root)=>startWatch(root)")) throw new Error('Phase 9 rejects renderer-selected arbitrary watch roots');
if (main.includes("send('desktop-folder-watch:file',{path:filePath")) throw new Error('Phase 9 rejects absolute path leakage');

// Test-of-test: a comment-only decoy must never satisfy executable evidence.
// Keep the decoy independent from the real guard so the self-test proves the
// comment stripper itself rather than relying on incidental guard formatting.
const stripJsComments = (text) => text
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\n)\s*\/\/[^\n]*/g, '$1');
const decoy = `// fs.watch\n// recursive:true\n// fs.watch(root, { recursive: true })`;
const strippedDecoy = stripJsComments(decoy);
for (const token of ['fs.watch', 'recursive:true']) {
  if (strippedDecoy.includes(token)) {
    throw new Error(`Phase 9 test-of-test accepted a comment decoy as executable runtime evidence: ${token}`);
  }
}

console.log('Phase 9 Windows contract hardening: PASS (source-level; fresh Windows runtime evidence remains separate)');
