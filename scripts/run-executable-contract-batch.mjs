import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const files = (await readdir('scripts')).filter(f => f.startsWith('check-') && f.endsWith('.mjs')).sort();
const excluded = new Set(['check-certification-lock.mjs']);
const targets = files.filter(f => !excluded.has(f));
const results = [];
for (const file of targets) {
  const result = await new Promise(resolve => {
    const p = spawn(process.execPath, [`scripts/${file}`], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; let err = '';
    p.stdout.on('data', d => out += d);
    p.stderr.on('data', d => err += d);
    p.on('close', code => resolve({ file, code, output: (out + err).trim().split('\n').slice(-2).join(' | ') }));
  });
  results.push(result);
}
const failed = results.filter(r => r.code !== 0);
console.log(`EXECUTABLE_CONTRACT_COUNT=${results.length}`);
for (const r of results) console.log(`${r.code === 0 ? 'PASS' : 'FAIL'} ${r.file}${r.output ? ` :: ${r.output}` : ''}`);
if (failed.length) { console.error(`FAILED_COUNT=${failed.length}`); process.exit(1); }
console.log('EXECUTABLE_CONTRACT_BATCH=PASS');
