import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const exists=p=>fs.existsSync(path.join(root,p));
const required=[
 ['N','scripts/check-e2e-readiness.mjs'],
 ['O','scripts/check-performance-regression.mjs'],
 ['P','scripts/check-ux-production.mjs'],
 ['Q','scripts/check-data-ai-hardening.mjs'],
 ['R','scripts/check-production-readiness.mjs'],
 ['S','scripts/check-post-production-readiness.mjs'],
];
const missing=required.filter(([,p])=>!exists(p));
if(missing.length) throw new Error(`N→S release matrix missing: ${missing.map(x=>x.join(':')).join(', ')}`);
const q=fs.readFileSync(path.join(root,'.github/workflows/quality.yml'),'utf8');
for(const t of ['test:k-to-s-deep-closure','test:k-to-s-runtime-integration','test:production-run-policy']) if(!q.includes(t)) throw new Error(`quality missing ${t}`);
console.log('N→S release matrix contract: PASS');
