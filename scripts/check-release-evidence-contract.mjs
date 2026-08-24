import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const sql = fs.readFileSync(path.join(root,'supabase/migrations/20260825070000_release_evidence_manifest.sql'),'utf8');
for (const token of ['release_evidence_manifests','source_sha','migration_fingerprint','dependency_fingerprint','artifact_fingerprint','certification_id','candidate','canary','verified','blocked','rolled_back','authenticated_release_evidence_tenant','company_id = public.current_company_id()']) if (!sql.includes(token)) throw new Error(`Release evidence contract missing: ${token}`);
const workflow = fs.readFileSync(path.join(root,'.github/workflows/quality.yml'),'utf8');
if (!workflow.includes('test:release-resilience-manifest')) throw new Error('Release resilience gate not wired');
console.log('Release evidence contract: PASS');
