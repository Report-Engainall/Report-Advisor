import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const skipped = [];
const checks = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) { failures.push(`${rel}: missing`); return ''; }
  return fs.readFileSync(full, 'utf8');
}
function check(name, condition, detail) {
  checks.push({ name, status: condition ? 'PASS' : 'FAIL', detail });
  if (!condition) failures.push(`${name}: ${detail}`);
}
function skip(name, reason) {
  skipped.push({ name, reason });
  checks.push({ name, status: 'SKIPPED', detail: reason });
}

const runtime = read('src/lib/secondary-batch03-runtime.ts');
const batch02 = read('src/lib/secondary-batch02.ts');
const evidence = read('src/lib/secondary-evidence-ux.ts');
const decision = read('src/lib/product-intelligence/decision-evidence-ledger.ts');
const reconciliation = read('src/lib/report-intelligence/reconciliation-engine.ts');
const quality = read('src/lib/data-quality-queries.ts');
const golden = read('scripts/secondary-batch03-golden-harness.mjs');

check('authoritative Data Quality import', runtime.includes("from '@/lib/data-quality-queries'"), 'Runtime adapter must reuse the existing Data Quality query boundary.');
check('authoritative Document Intelligence import', runtime.includes("from '@/lib/documentIntelligenceGateway'"), 'Runtime adapter must reuse documentIntelligenceGateway.');
check('authoritative Evidence Ledger import', runtime.includes("from '@/lib/free-toolbox/evidence-ledger'"), 'Runtime adapter must reuse the existing evidence ledger.');
check('authoritative Decision Evidence contract exists', decision.includes('DecisionEvidenceRecord'), 'Decision Replay must consume the existing decision evidence record when wired.');
check('authoritative Reconciliation contract exists', reconciliation.includes('ReconciliationResult') && reconciliation.includes('reconcileRows'), 'Reconciliation UI must consume the existing reconciliation engine result, never duplicate it.');
check('Data Quality projection is bounded', !quality.includes("select('*')"), 'Data Quality query boundary must not use select(*).');
check('Secondary runtime has no select(*)', !runtime.includes("select('*')") && !runtime.includes('select(`*`)'), 'Secondary runtime must not introduce unbounded projections.');
check('No fake success in runtime adapter', !/status:\s*['\"]HEALTHY['\"][^\n]*UNKNOWN/i.test(runtime), 'UNKNOWN conditions must not be emitted as HEALTHY.');
check('UNKNOWN preserved in secondary contract', batch02.includes("'UNKNOWN'"), 'Secondary read models must retain UNKNOWN state.');
check('Evidence references remain optional', evidence.includes('evidence_id?: string') && evidence.includes('source_id?: string'), 'Deep-link IDs must not be fabricated.');
check('Golden harness has explicit tri-state', golden.includes("'PASS'") && golden.includes("'FAIL'") && golden.includes("'SKIPPED'"), 'Golden harness must distinguish PASS/FAIL/SKIPPED.');
check('Golden harness fails on mismatch', golden.includes('process.exitCode = 1'), 'Golden harness must fail CI on a contract mismatch.');
check('Golden harness uses expectations', golden.includes('expectations.json'), 'Fixture presence alone is insufficient; expectations must be executable.');
check('No paid provider added by Batch 04 files', !runtime.includes('openai') && !runtime.includes('anthropic') && !runtime.includes('gemini'), 'No paid provider dependency may enter the secondary runtime adapter.');

const secondaryFiles = [
  'src/lib/secondary-batch03-runtime.ts',
  'src/lib/secondary-batch02.ts',
  'src/lib/secondary-evidence-ux.ts',
  'src/components/secondary/Batch02Workspaces.tsx',
  'src/components/secondary/DecisionReplay.tsx'
];
for (const rel of secondaryFiles) {
  const text = read(rel);
  check(`${rel}: no unlimited evidence fetch marker`, !/\.from\([^)]*evidence[^)]*\)[\s\S]{0,180}\.select\([^)]*\*[^)]*\)/i.test(text), 'No select(*) evidence fetch may be introduced.');
}

const fixtureRoot = path.join(root, 'fixtures', 'secondary-batch02');
if (fs.existsSync(fixtureRoot)) {
  const entries = fs.readdirSync(fixtureRoot);
  check('Golden Corpus contains expectations', entries.includes('expectations.json'), 'Executable expectations file must be present.');
  const forbidden = entries.filter(name => /\.env|secret|customer|client|production/i.test(name));
  check('Golden Corpus filenames contain no sensitive markers', forbidden.length === 0, `Potentially sensitive fixture names: ${forbidden.join(', ') || 'none'}`);
} else {
  failures.push('Golden Corpus directory missing');
}

// These checks require browser/DOM or live tenant data and are intentionally reported as SKIPPED here.
skip('Browser accessibility regression', 'Requires a browser runner/DOM environment; no browser execution surface is available to this script.');
skip('Live tenant RLS verification', 'Must run in the primary runtime environment with real tenant context.');
skip('Live reconciliation wiring', 'Requires authoritative runtime input rows; the secondary branch must not invent them.');
skip('Live document extraction', 'Requires actual document pipeline execution and evidence persistence.');

const counts = checks.reduce((a, item) => { a[item.status] += 1; return a; }, { PASS: 0, FAIL: 0, SKIPPED: 0 });
console.log(JSON.stringify({ harness: 'secondary-batch04-regression', counts, checks, skipped }, null, 2));
if (counts.FAIL > 0) process.exitCode = 1;
