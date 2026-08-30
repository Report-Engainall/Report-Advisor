import fs from 'node:fs';
const workflow=fs.readFileSync('.github/workflows/desktop-windows.yml','utf8');
const desktop=fs.readFileSync('desktop/package.json','utf8');
const watcher=fs.readFileSync('scripts/check-windows-desktop-folder-watch-contract.mjs','utf8');
const failures=[];const must=(x,m)=>{if(!x)failures.push(m)};
for(const t of ['windows-latest','npm run build','smoke:native','package:win','upload-artifact'])must(workflow.includes(t),`Windows production workflow missing ${t}`);
must(workflow.includes('Native watcher contract'),'native watcher contract must run before smoke');
must(workflow.includes('if: always()'),'diagnostics must be retained on failure');
must(desktop.includes('smoke:native'),'desktop package must expose native smoke');
must(desktop.includes('package:win'),'desktop package must expose Windows packaging');
must(watcher.includes('watch'),'native watcher contract must verify watch capability');
const decoy='// smoke:native succeeded\n// package:win succeeded';must(!/succeeded/.test(decoy.replace(/\/\/[^\n]*/g,'')),'comment decoy must not satisfy Windows proof');
if(failures.length){console.error('PHASE9_WINDOWS_PRODUCTION_CLOSURE_FAIL\n'+failures.map(x=>'- '+x).join('\n'));process.exit(1)}
console.log('PHASE9_WINDOWS_PRODUCTION_CLOSURE_PASS');
