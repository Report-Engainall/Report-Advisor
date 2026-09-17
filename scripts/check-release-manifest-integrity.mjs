import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const p=path.join(root,'release-manifest.json');
if(!fs.existsSync(p)) throw new Error('Release manifest missing');
const m=JSON.parse(fs.readFileSync(p,'utf8'));
for(const k of ['schemaVersion','sourceSha','packageVersion','dependencyFingerprint','migrationFingerprint']) if(!m[k]) throw new Error(`Release manifest missing: ${k}`);
const expectedSourceSha=process.env.CERTIFICATION_SHA||process.env.GITHUB_SHA;
if(process.env.CI){
  if(!expectedSourceSha) throw new Error('Release manifest certification SHA context missing');
  if(m.sourceSha!==expectedSourceSha) throw new Error('Release manifest source SHA mismatch');
}
if(!/^[a-f0-9]{64}$/.test(m.dependencyFingerprint)||!/^[a-f0-9]{64}$/.test(m.migrationFingerprint)) throw new Error('Invalid release fingerprints');
console.log('RELEASE MANIFEST INTEGRITY: PASS');
