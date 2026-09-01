import fs from 'node:fs';
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
const required=['test:execution-index-integrity','test:worker-index-contract','test:release-boundary-contract','test:closure-track-contract','test:no-certification-overclaim','test:execution-guard-selftest'];
const missing=required.filter(k=>typeof p.scripts?.[k]!=='string');
if(missing.length){missing.forEach(x=>console.error('FAIL: missing script '+x));process.exit(1)}
console.log('PASS: package test wiring ('+required.length+'/'+required.length+')');