import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const sha256 = (x) => crypto.createHash('sha256').update(x).digest('hex');
const manifestPath = path.join(root, 'release-manifest.json');

// PR certification validates repository contracts. The immutable release
// manifest is created/consumed only by the dedicated release certification
// flow, where its source/dependency/migration fingerprints can be verified.
if (!fs.existsSync(manifestPath)) {
  if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
    console.log('RELEASE DRIFT CHECK: SKIP (release manifest is release-only)');
    process.exit(0);
  }
  throw new Error('Release manifest missing');
}

const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const lock = fs.readFileSync(path.join(root, 'package-lock.json'));
const migrationsDir = path.join(root, 'supabase/migrations');
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
const migrationHash = sha256(
  Buffer.concat(files.flatMap((f) => [Buffer.from(`${f}\n`), fs.readFileSync(path.join(migrationsDir, f))])),
);
const dependencyHash = sha256(lock);
if (m.dependencyFingerprint !== dependencyHash) throw new Error('RELEASE STALE: dependency fingerprint drift detected');
if (m.migrationFingerprint !== migrationHash) throw new Error('RELEASE STALE: migration fingerprint drift detected');
if (process.env.CI && m.sourceSha !== process.env.GITHUB_SHA) throw new Error('RELEASE STALE: source SHA drift detected');
console.log('RELEASE DRIFT CHECK: PASS');
