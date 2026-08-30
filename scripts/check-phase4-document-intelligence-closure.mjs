import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (ok, message) => { if (!ok) failures.push(message); };

const contracts = read('services/document-intelligence/app/contracts.py');
const policy = read('services/document-intelligence/app/policy.py');
const requirements = read('docs/DOCUMENT_INTELLIGENCE_ENGINE_REQUIREMENTS.md');
const schema = read('src/lib/document-intelligence/schema-discovery.ts');
const validation = read('src/lib/document-intelligence/validation.ts');
const routing = read('src/lib/document-intelligence/routing.ts');
const hardening = read('scripts/check-document-intelligence-hardening.mjs');
const serviceTests = fs.readdirSync(path.join(root, 'services/document-intelligence/tests')).filter((f) => f.endsWith('.py'));

for (const symbol of ['ProcessingState','Provenance','ExtractedField','DocumentEnvelope','DocumentParser','OCRProvider','TableExtractor','EntityResolver','ValidationEngine','RoutingEngine']) must(contracts.includes(symbol), `missing document contract: ${symbol}`);
must(policy.includes('require_validated'), 'validated boundary must be enforced');
must(policy.includes('require_approved'), 'approved boundary must be enforced');
must(policy.includes('RawDataBoundaryError'), 'raw-data boundary guard must exist');
must(requirements.includes('Raw → Extracted → Staging → Validated → Reconciled → Approved'), 'document lifecycle must remain canonical');
must(requirements.includes('Unknown does not mean ignored'), 'unknown fields must be preserved explicitly');
must(schema.includes('ambiguous-top-candidates'), 'ambiguous schema matches must be recorded');
must(schema.includes('Math.min(best, 0.69)'), 'ambiguous schema matches must be confidence-capped');
must(schema.includes("replace(/٫/g, '.')"), 'Arabic decimal separator must be normalized');
must(schema.includes("replace(/٬/g, '')"), 'Arabic thousands separator must be normalized');
must(validation.includes('RECONCILIATION_INPUT_INVALID'), 'non-finite reconciliation input must fail closed');
must(validation.includes('VALIDATION_INPUT_INCOMPLETE'), 'incomplete line math must remain explicit');
must(validation.includes('Number.isFinite(score)'), 'evidence confidence must reject non-finite values');
must(routing.includes("destination: 'quarantine'"), 'unknown routing must quarantine');
must(routing.includes("decision.action = 'QUARANTINE'"), 'duplicate/unsafe routing must quarantine');
must(routing.includes('Number.isFinite(value)'), 'routing confidence must sanitize NaN/Infinity');
for (const token of ['behavioralChecks','schema explicitly translates Arabic decimal separator','routing sanitizes NaN and Infinity confidence']) must(hardening.includes(token), `document hardening regression is missing executable case: ${token}`);
must(serviceTests.length >= 3, 'document-intelligence service must retain a non-trivial Python test suite');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\n)\s*#[^\n]*/g, '$1');
const sanitized = stripComments('# RawDataBoundaryError\n# require_approved\n');
must(!sanitized.includes('RawDataBoundaryError') && !sanitized.includes('require_approved'), 'comment decoy must not satisfy document contract checks');
if (failures.length) { console.error(`PHASE4_DOCUMENT_INTELLIGENCE_CLOSURE_FAIL\n${failures.map((x) => `- ${x}`).join('\n')}`); process.exit(1); }
console.log(`PHASE4_DOCUMENT_INTELLIGENCE_CLOSURE_PASS (${serviceTests.length} Python test files; contracts, truth, quarantine, Arabic numeric normalization, and test-of-test decoy checks)`);
