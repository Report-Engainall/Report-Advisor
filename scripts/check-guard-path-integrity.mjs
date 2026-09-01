import fs from 'node:fs';
const files=['scripts/check-execution-index-integrity.mjs','scripts/check-worker-index-contract.mjs','scripts/check-release-boundary-contract.mjs','scripts/check-closure-track-contract.mjs','scripts/check-no-certification-overclaim.mjs','scripts/check-execution-guard-selftest.mjs'];
const missing=files.filter(f=>!fs.existsSync(f));
if(missing.length){missing.forEach(x=>console.error('FAIL: missing guard '+x));process.exit(1)}
console.log('PASS: guard path integrity ('+files.length+'/'+files.length+')');