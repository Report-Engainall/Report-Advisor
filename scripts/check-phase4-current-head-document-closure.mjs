import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const required = [
  ['services/document-intelligence/app/contracts.py', ['ProcessingState','Provenance','DocumentEnvelope','DocumentParser','OCRProvider','TableExtractor','ValidationEngine','RoutingEngine']],
  ['services/document-intelligence/app/policy.py', ['require_validated','require_approved','RawDataBoundaryError']],
  ['src/lib/document-intelligence/schema-discovery.ts', ['ambiguous-top-candidates','Math.min(best, 0.69)','replace(/٫/g, ".")','replace(/٬/g, \'\')']],
  ['src/lib/document-intelligence/validation.ts', ['RECONCILIATION_INPUT_INVALID','VALIDATION_INPUT_INCOMPLETE','Number.isFinite(score)']],
  ['src/lib/document-intelligence/routing.ts', ["destination: 'quarantine'","decision.action = 'QUARANTINE'",'Number.isFinite(value)']],
  ['scripts/check-document-intelligence-hardening.mjs', ['behavioralChecks','Arabic decimal separator','NaN and Infinity']],
];
const failures=[];
for (const [file,tokens] of required) {
  if (!fs.existsSync(file)) { failures.push(`missing:${file}`); continue; }
  const source=read(file);
  for (const token of tokens) if (!source.includes(token)) failures.push(`${file}:missing:${token}`);
}
const testsDir='services/document-intelligence/tests';
if (!fs.existsSync(testsDir) || fs.readdirSync(testsDir).filter(f=>f.endsWith('.py')).length < 3) failures.push('document-intelligence service test suite is too small');
const workflow='.github/workflows/phase-4-document-intelligence.yml';
if (fs.existsSync(workflow)) {
  const w=read(workflow);
  for (const token of ['actions/checkout','actions/setup-node','actions/setup-python','git rev-parse HEAD','npm run test:document-intelligence-hardening','python -m unittest']) if(!w.includes(token)) failures.push(`workflow:missing:${token}`);
}
// Test the test: comments must never satisfy contract evidence.
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/(^|\n)\s*#.*$/gm,'$1');
const decoy='# RawDataBoundaryError\n# require_approved\n';
if (stripComments(decoy).includes('RawDataBoundaryError') || stripComments(decoy).includes('require_approved')) failures.push('comment decoy bypass');
if (failures.length) { console.error('PHASE4_CURRENT_HEAD_DOCUMENT_CLOSURE_FAIL\n'+failures.map(x=>`- ${x}`).join('\n')); process.exit(1); }
console.log(`PHASE4_CURRENT_HEAD_DOCUMENT_CLOSURE_PASS (${required.length} source boundaries + service tests + workflow + comment-bypass guard)`);
