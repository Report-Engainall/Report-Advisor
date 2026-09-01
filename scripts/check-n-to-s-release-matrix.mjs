import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(); const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')); const scripts=pkg.scripts??{};
const required={N:['test:report-execution-e2e-contract','test:operational-file-pipeline','test:production-gate-runtime'],O:['test:production-scale','test:concurrent-analysis','test:bounded-concurrency','perf:budget'],P:['test:decision-dashboard','test:inventory-intelligence-ui'],Q:['test:file-engine-regressions','test:schema-intelligence','test:document-intelligence-hardening','test:report-truth'],R:['test:production-readiness','test:production-release-blockers','test:production-certification-contract'],S:['test:operational-resilience','test:release-resilience-manifest','test:continuous-trust']};
const missing=[]; for(const [phase,names] of Object.entries(required)) for(const name of names) if(!scripts[name]) missing.push(`${phase}:${name}`);
if(missing.length) throw new Error(`N→S release matrix missing: ${missing.join(', ')}`);
const q=fs.readFileSync(path.join(root,'.github/workflows/quality.yml'),'utf8');
for(const t of ['check-k-to-s-runtime-integration.mjs','test:k-to-s-deep-closure','test:production-run-policy']) if(!q.includes(t)) throw new Error(`quality missing ${t}`);
console.log('N→S release matrix contract: PASS');
