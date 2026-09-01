import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(); const workflow=fs.readFileSync(path.join(root,'.github/workflows/release-certification.yml'),'utf8');
for(const t of ['release-evidence/manifest.json','source_sha','migrations_fingerprint','dependency_lock_fingerprint','artifact_fingerprint','manifest_id']) if(!workflow.includes(t)) throw new Error(`Release evidence workflow invariant missing: ${t}`);
for(const f of ['scripts/check-release-drift.mjs','scripts/check-release-decision-provenance.mjs','scripts/check-release-artifact-integrity.mjs']) if(!fs.existsSync(path.join(root,f))) throw new Error(`Evidence snapshot dependency missing: ${f}`);
console.log('release-evidence-snapshot workflow contract: PASS');