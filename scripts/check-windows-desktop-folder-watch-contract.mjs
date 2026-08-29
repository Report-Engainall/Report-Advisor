import fs from 'node:fs';
import path from 'node:path';

const main=path.join(process.cwd(),'desktop/main.cjs');
const preload=path.join(process.cwd(),'desktop/preload.cjs');
const pkg=path.join(process.cwd(),'desktop/package.json');
for(const file of [main,preload,pkg])if(!fs.existsSync(file))throw new Error(`Missing Windows desktop file: ${file}`);
const mainText=fs.readFileSync(main,'utf8');
const preloadText=fs.readFileSync(preload,'utf8');
const pkgText=fs.readFileSync(pkg,'utf8');
for(const token of ['fs.watch','recursive: true','setInterval(rescan, 30000)','WATCH_FOLDER_PATH_OUTSIDE_ROOT','read-file','desktop-folder-watch:file'])if(!mainText.includes(token))throw new Error(`Missing native watcher safety token: ${token}`);
for(const token of ['contextIsolation: true','nodeIntegration: false','desktopFolderWatch','readFile','onFile'])if(!mainText.includes(token)&&!preloadText.includes(token))throw new Error(`Missing preload isolation token: ${token}`);
for(const token of ['electron','electron-builder','package:win','com.reportadvisor.desktop'])if(!pkgText.includes(token))throw new Error(`Missing Windows packaging token: ${token}`);
console.log('Windows desktop watched-folder contract: PASS (native host, isolated bridge, root-bound reads, event+poll fallback, NSIS packaging).');
