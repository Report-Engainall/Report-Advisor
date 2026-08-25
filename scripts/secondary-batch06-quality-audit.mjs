import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [];
const skipped = [];
const failures = [];

function read(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`${rel}: missing`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}
function check(name, condition, detail) {
  const status = condition ? 'PASS' : 'FAIL';
  checks.push({ name, status, detail });
  if (!condition) failures.push(`${name}: ${detail}`);
}
function skip(name, reason) {
  skipped.push({ name, reason });
  checks.push({ name, status: 'SKIPPED', detail: reason });
}

const runtime = read('src/lib/secondary-batch03-runtime.ts');
const model = read('src/lib/secondary-batch02.ts');
const evidence = read('src/lib/secondary-evidence-ux.ts');
const palette = read('src/components/CommandPalette.tsx');
const workspace = read('src/components/secondary/EvidenceWorkspace.tsx');
const decisionReplay = read('src/components/secondary/DecisionReplay.tsx');
const queries = read('src/lib/queries.ts');
const workflow = read('.github/workflows/secondary-agent-batch04.yml');

check('secondary runtime has no implicit any', !/\bany\b/.test(runtime), 'Batch 06 must not hide type errors with any in the secondary runtime.');
check('secondary read model has no implicit any', !/\bany\b/.test(model), 'Secondary read-model contracts must remain explicit.');
check('evidence contract keeps authoritative IDs optional', ['source_id?: string', 'evidence_id?: string', 'snapshot_id?: string', 'lineage_id?: string'].every(token => evidence.includes(token)), 'Missing authoritative identifiers must remain representable as unavailable.');
check('no fabricated source fallback', runtime.includes("sourceRef: source_id") && !runtime.includes('sourceRef: source_id ?? id'), 'A local identifier must never become an authoritative source reference.');
check('unknown reconciliation remains fail-closed', runtime.includes("status: 'UNKNOWN'") && runtime.includes('No authoritative reconciliation result'), 'Missing reconciliation evidence must remain UNKNOWN.');
check('unknown data quality remains fail-closed', runtime.includes("status: 'UNKNOWN'") && runtime.includes('authoritative quality score'), 'Missing quality scores must not become zero or healthy.');
check('no secondary reconciliation engine', !/function\s+reconcileRows|class\s+.*ReconciliationEngine/.test(runtime), 'The existing reconciliation engine remains authoritative.');
check('no secondary import engine', !/function\s+(parse|import)\b|class\s+.*ImportEngine/.test(runtime), 'The existing import pipeline remains authoritative.');
check('no unbounded secondary query', !/\.select\(['"`]\*['"`]\)/.test(runtime), 'Secondary runtime must not introduce select(*).');
check('command palette exposes combobox semantics', palette.includes('role="combobox"') && palette.includes('aria-controls'), 'Command Palette accessibility semantics must remain explicit.');
check('command palette supports keyboard navigation', palette.includes('Home') && palette.includes('End') && palette.includes('Escape'), 'Keyboard navigation guards must remain present.');
check('evidence workspace does not fabricate executable routes', !/navigate\([^)]*sourceRef|window\.location[^=]*sourceRef|href=\{[^}]*sourceRef/.test(workspace), 'Evidence references require an authoritative executable-link contract.');
check('decision replay remains read-only', !/supabase\.(from|rpc)\([^)]*\.(insert|update|upsert|delete)/s.test(decisionReplay), 'Decision Replay must not execute writes.');
check('dashboard category contract exists on branch baseline', queries.includes('export async function fetchCategoryBreakdown'), 'If absent this is a mainline dependency; do not invent a duplicate query.');
check('free-first secondary runtime', !/openai|anthropic|gemini|paid\s*(api|ai|ocr|storage|saas)/i.test(runtime), 'No paid provider or silent paid fallback may enter the secondary runtime.');
check('CI runs independent quality checks', workflow.includes('fail-fast: false') && workflow.includes('typecheck') && workflow.includes('lint') && workflow.includes('build'), 'TypeScript, lint, and build must remain independently observable.');

skip('Browser accessibility certification', 'Requires real browser/DOM execution; static checks cannot certify focus order, screen-reader behavior, or responsive RTL layout.');
skip('Live Evidence Graph persistence', 'Requires authoritative primary-runtime persisted IDs for page/table/row/column/cell/entity/canonical/metric/report/decision/action/outcome.');
skip('Live document extraction persistence', 'Requires the primary document/import runtime to execute and persist extraction, validation, quarantine, and lineage evidence.');
skip('Live reconciliation persistence', 'Requires authoritative runtime reconciliation inputs/results and persisted evidence.');

const counts = checks.reduce((acc, item) => { acc[item.status] += 1; return acc; }, { PASS: 0, FAIL: 0, SKIPPED: 0 });
console.log(JSON.stringify({ harness: 'secondary-batch06-quality-audit', counts, checks, skipped, failures }, null, 2));
if (counts.FAIL > 0) process.exitCode = 1;
