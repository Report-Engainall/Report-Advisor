import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const shared = read('src/server/canonical-import-execute.ts');
const vercel = read('api/canonical-import-execute.ts');
const netlify = read('netlify/functions/canonical-import-execute.mts');

const assert = (condition, message) => {
  if (!condition) throw new Error(`CANONICAL_IMPORT_SERVER_BOUNDARY_FAIL: ${message}`);
};

assert(vercel.includes("executeCanonicalImportServer"), 'Vercel adapter must delegate to the shared server boundary');
assert(netlify.includes("executeCanonicalImportServer"), 'Netlify adapter must delegate to the shared server boundary');
assert(!vercel.includes('runCanonicalImportThroughDurableRunner'), 'Vercel adapter must not own a second canonical execution path');
assert(!netlify.includes('runCanonicalImportThroughDurableRunner'), 'Netlify adapter must not own a second canonical execution path');
assert(shared.includes("serviceClient.storage"), 'shared boundary must re-read the authoritative source from storage');
assert(shared.includes("createHash('sha256')"), 'shared boundary must fingerprint the downloaded authoritative source');
assert(shared.includes('securityScan('), 'shared boundary must security-scan the authoritative source');
assert(shared.includes('detectFormat('), 'shared boundary must detect the authoritative source format');
assert(shared.includes('parseFile('), 'shared boundary must parse the authoritative source server-side');
assert(shared.includes('reconcileForCanonical('), 'shared boundary must reconcile server-authoritative rows through the canonical truth boundary');
assert(shared.includes('runCanonicalImportThroughDurableRunner('), 'shared boundary must use the existing durable runner');
assert(shared.includes("from('source_analysis_snapshots')"), 'shared boundary must preserve the existing source-analysis snapshot evidence');
assert(!shared.includes('rows?: unknown[]'), 'client-provided rows must not be part of the trusted server request contract');
assert(vercel.includes("supabaseUrl: process.env.SUPABASE_URL ?? ''"), 'Vercel must inject its existing runtime configuration');
assert(netlify.includes("supabaseUrl: env('VITE_SUPABASE_URL')"), 'Netlify must inject its existing runtime configuration');
assert(shared.includes("path: '/api/canonical-import-execute'") === false, 'route ownership stays in hosting adapters, not the shared business boundary');

console.log('Canonical import server boundary: PASS');
console.log('  - Vercel and Netlify adapters delegate to one authoritative implementation');
console.log('  - client-provided rows are not trusted by the server contract');
console.log('  - source download, hash, security, format detection, parsing, reconciliation, durable execution, and snapshot evidence remain in one path');
