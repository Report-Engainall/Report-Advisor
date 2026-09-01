import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const p=path.join(root,'release-manifest.json');
if(process.env.GITHUB_EVENT_NAME==='pull_request') {
  console.log('RELEASE MANIFEST INTEGRITY: SKIP (release manifest is release-only)');
  process.exit(0);
}
if(!fs.existsSync(p)) throw new Error('Release manifest missing');
const m=JSON.parse(fs.readFileSync(p,'utf8'));
for(const k of ['schemaVersion','sourceSha','packageVersion','dependencyFingerprint','migrationFingerprint']) if(!m[k]) throw new Error(`Release manifest missing: ${k}`);
if(process.env.CI && m.sourceSha!==process.env.GITHUB_SHA) throw new Error('Release manifest source SHA mismatch');
if(!/^[a-f0-9]{64}$/.test(m.dependencyFingerprint)||!/^[a-f0-9]{64}$/.test(m.migrationFingerprint)) throw new Error('Invalid release fingerprints');
console.log('RELEASE MANIFEST INTEGRITY: PASS');
