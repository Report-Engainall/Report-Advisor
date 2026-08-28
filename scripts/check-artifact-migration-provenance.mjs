import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { verifyCanonicalManifest } from './check-canonical-certification-migrations.mjs';
const root=process.cwd(); const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')); const lock=fs.readFileSync(path.join(root,'package-lock.json'),'utf8');
const canonical=verifyCanonicalManifest(path.join(root,'docs/CANONICAL_CERTIFICATION_MIGRATIONS.json')); const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
if(!pkg.version) throw new Error('Package version missing from release provenance'); const sourceSha=process.env.GITHUB_SHA; if(process.env.CI&&!sourceSha) throw new Error('CI release provenance requires GITHUB_SHA');
console.log(JSON.stringify({contract:'artifact-migration-provenance',packageVersion:pkg.version,dependencyFingerprint:sha256(lock),migrationsFingerprint:canonical.fingerprint,migrationAnchorCommit:canonical.anchorCommit,migrationAnchorTreeSha:canonical.anchorTreeSha,sourceSha:sourceSha||'local'}));
