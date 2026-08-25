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
const evidence = read('src/lib/secondary-evidence-ux.ts');
const evidenceLedger = read('src/lib/free-toolbox/evidence-ledger.ts');
const decisionEvidence = read('src/lib/product-intelligence/decision-evidence-ledger.ts');
const snapshot = read('src/lib/import-pipeline/report-snapshot-history.ts');
const documentGateway = read('src/lib/documentIntelligenceGateway.ts');
const reconciliation = read('src/lib/report-intelligence/reconciliation-engine.ts');
const dataQuality = read('src/lib/data-quality-queries.ts');
const golden = read('scripts/secondary-batch03-golden-harness.mjs');
const expectationsText = read('fixtures/secondary-batch02/expectations.json');

check('Data Quality uses authoritative boundary', runtime.includes("from '@/lib/data-quality-queries'") && dataQuality.includes('fetchDataQualityDatasets'), 'Secondary runtime must consume the existing Data Quality query boundary.');
check('Data Quality does not invent scores', runtime.includes("status: 'UNKNOWN'") && runtime.includes('authoritative quality score'), 'Unavailable dimension scores must remain UNKNOWN.');
check('Control Plane uses existing tables', ['business_state_snapshots','control_plane_optimization_runs','executive_kpi_lineage','control_plane_drift_events'].every(token => runtime.includes(`from('${token}')`)), 'Control Plane must use existing read signals.');
check('Document pipeline reuses gateway', runtime.includes("from '@/lib/documentIntelligenceGateway'") && documentGateway.includes('planDocumentIntelligence'), 'No parallel parser/import engine may exist in the secondary branch.');
check('Evidence ledger is authoritative', runtime.includes("from '@/lib/free-toolbox/evidence-ledger'") && evidenceLedger.includes('interface EvidenceLedger'), 'Evidence Workspace must consume the existing ledger.');
check('Decision evidence is authoritative', runtime.includes("from '@/lib/product-intelligence/decision-evidence-ledger'") && decisionEvidence.includes('DecisionEvidenceRecord'), 'Decision Replay must consume the existing decision evidence record.');
check('Report snapshot is authoritative', runtime.includes("from '@/lib/import-pipeline/report-snapshot-history'") && snapshot.includes('interface ReportSnapshot'), 'Snapshot UI must consume the existing snapshot contract.');
check('Reconciliation is authoritative', runtime.includes("from '@/lib/report-intelligence/reconciliation-engine'") && reconciliation.includes('interface ReconciliationResult'), 'Reconciliation UI must consume the existing reconciliation result.');
check('No duplicate reconciliation engine', !runtime.includes('function reconcileRows') && !runtime.includes('export function reconcileRows'), 'Secondary runtime must not implement reconciliation logic.');
check('No duplicate import engine', !runtime.includes('function parse') && !runtime.includes('function import'), 'Secondary runtime must not implement an import/parser engine.');
check('No unbounded secondary queries', !runtime.includes("select('*')") && !runtime.includes('select(`*`)'), 'Secondary runtime must not introduce select(*).');
check('No fabricated sourceRef fallback', runtime.includes("sourceRef: source_id") && !runtime.includes('sourceRef: source_id ?? id'), 'A missing authoritative source ID must not be replaced by an invented ID.');
check('Deep-link IDs remain optional', evidence.includes('source_id?: string') && evidence.includes('evidence_id?: string') && evidence.includes('snapshot_id?: string') && evidence.includes('lineage_id?: string'), 'Deep-link identifiers must remain optional and evidence-backed.');
check('Decision replay refuses missing evidence', runtime.includes("state: evidence.length && evidence.every"), 'Decision Replay must not be READY without evidence entries.');
check('Reconciliation refuses missing result', runtime.includes("status: 'UNKNOWN'") && runtime.includes('No authoritative reconciliation result'), 'No authoritative result must remain UNKNOWN.');
check('Document gateway preserves blocked state', documentGateway.includes("status: 'UNAVAILABLE'") && runtime.includes("status: blocked ? 'BLOCKED'"), 'Unavailable document capability must remain blocked.');
check('Golden expectations are executable', golden.includes('expectations.json') && expectationsText.includes('"cases"'), 'Golden Corpus must be driven by explicit expectations.');
check('Golden Corpus has 13 cases', (() => { try { return JSON.parse(expectationsText).cases.length === 13; } catch { return false; } })(), 'Batch 05 must preserve the 13-case corpus without expansion.');
check('Golden harness has tri-state result', golden.includes("'PASS'") && golden.includes("'FAIL'") && golden.includes("'SKIPPED'"), 'Golden harness must distinguish PASS/FAIL/SKIPPED.');
check('No paid providers', !/openai|anthropic|gemini|ocr\s*saas|paid\s*storage/i.test(runtime), 'Secondary runtime must remain Free/Local-first.');

const forbiddenUiLinks = ['href={node.sourceRef}', 'window.location=node.sourceRef', 'navigate(node.sourceRef)'];
check('Evidence UI has no fabricated direct route', !forbiddenUiLinks.some(token => read('src/components/secondary/EvidenceWorkspace.tsx').includes(token)), 'EvidenceWorkspace must not turn a raw reference into an executable route without an authoritative link contract.');

skip('Live tenant runtime', 'Requires deployed Supabase tenant context and real persisted data; static CI cannot certify production runtime evidence.');
skip('Browser accessibility execution', 'Requires a browser runner/DOM environment; contract CI only provides static guards.');
skip('End-to-end document persistence', 'Existing gateway currently plans capabilities; persisted extraction/quarantine/lineage evidence is owned by the primary runtime stream.');
skip('End-to-end reconciliation evidence', 'Existing reconciliation engine is pure/in-memory; persisted runtime inputs/results are owned by the primary import/report stream.');

const counts = checks.reduce((a, item) => { a[item.status] += 1; return a; }, { PASS: 0, FAIL: 0, SKIPPED: 0 });
console.log(JSON.stringify({ harness: 'secondary-batch05-runtime-audit', counts, checks, skipped, failures }, null, 2));
if (counts.FAIL > 0) process.exitCode = 1;
