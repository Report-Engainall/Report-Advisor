import fs from 'node:fs';

export const REQUIRED_RULES = [
  'E-01 — Parallelism before reporting',
  'E-02 — NEXT+1 / NEXT+2 consumption',
  'E-03 — Blocker isolation',
  'E-04 — Discovery is not closure',
  'E-05 — Gate integrity',
  'E-06 — Exact-SHA evidence boundary',
  'E-07 — Runtime truth separation',
  'E-08 — Test-of-test requirement',
  'E-09 — Remaining-work accounting',
  'E-10 — Index governance',
  'E-11 — True-stop gate',
  'E-12 — Automatic protocol evolution',
];

const REQUIRED_BEHAVIORAL_CASES = [
  'CASE A:', 'CASE B:', 'CASE C:', 'CASE D:',
  'CASE E:', 'CASE F:', 'CASE G:', 'CASE H:',
];

const REQUIRED_CONTRACT_ANCHORS = [
  'EXECUTION DEBT',
  'EXECUTION DEBT = 0',
  'RELEASE VELOCITY',
  'Built', 'Integrated', 'Verified', 'Runtime Proven', 'Production Certified',
  'MUST NOT stop',
  'MUST NOT be promoted',
  'NEXT+1', 'NEXT+2',
];

const FORBIDDEN_WEAKENING_PATTERNS = [
  /historical\s+pass[\s\S]{0,120}\btransfer(?:s|red)?\b\s+automatically/i,
  /unproven[\s\S]{0,120}\b(?:be\s+)?(?:promoted|converted)\s+to\s+pass/i,
  /blocker[\s\S]{0,120}\b(?:may|can|could|should)\s+stop\s+unrelated/i,
  /next\s*\+\s*1[\s\S]{0,80}\b(?:is\s+)?optional\b/i,
  /next\s*\+\s*2[\s\S]{0,80}\b(?:is\s+)?optional\b/i,
  /execution\s+debt[\s\S]{0,100}\b(?:may|can|could|should)\s+be\s+ignored/i,
  /index\s+update[\s\S]{0,100}\bcounts\s+as\s+(?:execution\s+)?closure/i,
  /true\s*stop[\s\S]{0,80}\bis\s+allowed\s+before/i,
];

const stripComments = (value) => value
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '$1');

const normalize = (value) => value
  .replaceAll('\r\n', '\n')
  .replace(/[ \t]+/g, ' ')
  .trim()
  .toLowerCase();

export function validateExecutionEnforcementProtocol(protocol) {
  if (typeof protocol !== 'string' || protocol.trim().length === 0) {
    throw new Error('Execution enforcement protocol rejected: empty/non-string contract');
  }

  const normalized = normalize(stripComments(protocol));
  const missingRules = REQUIRED_RULES.filter(rule => !normalized.includes(normalize(rule)));
  if (missingRules.length) {
    throw new Error(`Execution enforcement protocol rejected: missing rules: ${missingRules.join(', ')}`);
  }

  const missingAnchors = REQUIRED_CONTRACT_ANCHORS.filter(anchor => !normalized.includes(normalize(anchor)));
  if (missingAnchors.length) {
    throw new Error(`Execution enforcement protocol rejected: missing contract anchors: ${missingAnchors.join(', ')}`);
  }

  const missingCases = REQUIRED_BEHAVIORAL_CASES.filter(marker => !normalized.includes(marker.toLowerCase()));
  if (missingCases.length) {
    throw new Error(`Execution enforcement protocol rejected: missing behavioral cases: ${missingCases.join(', ')}`);
  }

  for (const pattern of FORBIDDEN_WEAKENING_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error(`Execution enforcement protocol rejected: weakening pattern: ${pattern}`);
    }
  }

  const trueStopIndex = normalized.indexOf('true stop');
  const debtIndex = normalized.indexOf('execution debt = 0');
  if (trueStopIndex === -1 || debtIndex === -1 || debtIndex > trueStopIndex + 5000) {
    throw new Error('Execution enforcement protocol rejected: TRUE STOP is not explicitly gated by zero execution debt');
  }

  return true;
}

const debtLedgerPath = 'docs/EXECUTION_DEBT_AND_RELEASE_VELOCITY.md';
const debtLedger = fs.readFileSync(debtLedgerPath, 'utf8');
for (const anchor of ['EXECUTION DEBT', 'RELEASE VELOCITY', 'TRUE STOP', 'Built', 'Integrated', 'Verified', 'Runtime Proven', 'Production Certified']) {
  if (!normalize(stripComments(debtLedger)).includes(normalize(anchor))) {
    throw new Error(`Execution enforcement protocol rejected: debt/velocity ledger missing ${anchor}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('check-execution-enforcement-protocol.mjs')) {
  const protocol = fs.readFileSync('docs/EXECUTION_ENFORCEMENT_PROTOCOL.md', 'utf8');
  validateExecutionEnforcementProtocol(protocol);
  console.log(`PASS execution enforcement protocol: ${REQUIRED_RULES.length} mandatory rules, behavioral cases, debt/velocity ledger, and weakening rejection active`);
}
