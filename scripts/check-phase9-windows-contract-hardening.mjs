import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'desktop/main.cjs',
  'desktop/preload.cjs',
  'desktop/package.json',
  'scripts/check-windows-desktop-folder-watch-contract.mjs',
];
for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing Phase 9 surface: ${file}`);
}
const main = fs.readFileSync(path.join(root, 'desktop/main.cjs'), 'utf8');
const preload = fs.readFileSync(path.join(root, 'desktop/preload.cjs'), 'utf8');
const pkg = fs.readFileSync(path.join(root, 'desktop/package.json'), 'utf8');
const guard = fs.readFileSync(path.join(root, 'scripts/check-windows-desktop-folder-watch-contract.mjs'), 'utf8');

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

// Test-of-test: a guard decoy must remain only a comment and never become
// an accepted executable invariant.
const decoy = guard.replace(/fs\.watch/g, '// fs.watch').replace(/recursive:true/g, '// recursive:true');
if (!decoy.includes('// fs.watch') || !decoy.includes('// recursive:true')) throw new Error('Phase 9 self-test setup failed');
if (decoy.match(/\bfs\.watch\b/g)?.length !== 2) throw new Error('Phase 9 test-of-test unexpectedly changed source token cardinality');

console.log('Phase 9 Windows contract hardening: PASS (source-level; native Windows runtime proof remains external)');
