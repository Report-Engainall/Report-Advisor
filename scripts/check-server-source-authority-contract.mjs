import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../api/canonical-import-execute.ts', import.meta.url), 'utf8');
assert.match(source, /storage\.from\(storageBucket\)\.download\(storagePath\)/);
assert.match(source, /computeSHA256\(buffer\)/);
assert.match(source, /serverSourceAuthority/);
assert.match(source, /resumeReportExecutionJobId/);
assert.match(source, /parseFile\(buffer, fileName, detection\.format\)/);
assert.match(source, /reconcileForCanonical\(/);
assert.match(source, /source_analysis_snapshots/);
assert.match(source, /file_hash: sourceHash/);
console.log('SERVER_SOURCE_AUTHORITY_CONTRACT_PASS');
