import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

export const REQUIRED_RULES = [
  'E-01 — Parallelism before reporting', 'E-02 — NEXT+1 / NEXT+2 consumption', 'E-03 — Blocker isolation', 'E-04 — Discovery is not closure', 'E-05 — Gate integrity', 'E-06 — Exact-SHA evidence boundary', 'E-07 — Runtime truth separation', 'E-08 — Test-of-test requirement', 'E-09 — Remaining-work accounting', 'E-10 — Index governance', 'E-11 — True-stop gate', 'E-12 — Automatic protocol evolution', 'E-13 — Behavioral enforcement matrix', 'E-14 — Execution Debt zero-gate', 'E-15 — Release Velocity truth metric', 'E-TIME — Waiting-Time Parallelization', 'E-MAX — Maximum Safe Parallelism', 'E-SCHED — Dependency-Aware Scheduling', 'E-INDEX-HEAD — Current-Head Index Gate', 'E-DEBT — Actionable vs External Debt', 'E-UTIL — Execution Utilization', 'E-EVOLVE — Automatic Protocol Evolution', 'E-16 — Compact Evidence / Auditability', 'E-17 — Project Identity / Old Branding Integrity', 'E-18 — Certification Configuration Provenance', 'E-19 — Production Safety Boundary',
];
const REQUIRED_BEHAVIORAL_CASES = ['CASE A:', 'CASE B:', 'CASE C:', 'CASE D:', 'CASE E:', 'CASE F:', 'CASE G:', 'CASE H:'];
const REQUIRED_CONTRACT_ANCHORS = ['EXECUTION DEBT', 'EXECUTION DEBT = 0', 'ACTIONABLE DEBT', 'EXTERNAL DEBT', 'RELEASE VELOCITY', 'EXECUTION UTILIZATION', 'WAITING-TIME PARALLELIZATION', 'MAXIMUM SAFE PARALLELISM', 'DEPENDENCY-AWARE SCHEDULING', 'INDEX DRIFT', 'Built', 'Integrated', 'Verified', 'Runtime Proven', 'Production Certified', 'MUST NOT stop', 'MUST NOT be promoted', 'NEXT+1', 'NEXT+2', 'READY + INDEPENDENT = EXECUTE NOW', 'Layer precedence', 'v4.0 governance binding', 'Compact Evidence', 'minimum lineage', 'Project Identity', 'الأغبري', 'العامري', 'OWNER INPUT REQUIRED', 'Production Safety Boundary', 'Protocol-first execution order'];
const GOVERNANCE_FILE = 'docs/ADAPTIVE_EXECUTION_GOVERNANCE.md';
const REQUIRED_GOVERNANCE_ANCHORS = ['LAYER 1', 'LAYER 2', 'LAYER 3', 'P0 — Safety / Security / Evidence Integrity', 'P1 — Exact-SHA / Truth / Certification Integrity', 'P2 — Current Master Execution Index', 'P3 — Adaptive Execution Governance', 'P4 — Programmer Execution Protocol', 'EXECUTION PERFORMANCE LEDGER', 'EXECUTION EFFECTIVENESS', 'UNDER-EXECUTION EVENT', 'LOW-VALUE EXECUTION', 'COMMAND QUALITY FEEDBACK', 'STRATEGY MEMORY', 'BASELINE', 'RESULT', 'SMART FRONT PRIORITIZATION', 'OBSERVATION → EVIDENCE → RCA → PROPOSED RULE → CONFLICT CHECK → TEST → ADVERSARIAL → ACCEPT → VERSION → INDEX UPDATE', 'REAL MEASURED DATA > ESTIMATE > NO CLAIM', 'HIGH | MEDIUM | LOW | UNPROVEN', 'Protocol changes must never be silently introduced.', 'ONE-OFF INCIDENT → RECORD', 'REPEATED PATTERN → CANDIDATE STRATEGY/RULE', 'PROVEN SYSTEMIC FAILURE → MANDATORY ENFORCEMENT RULE', 'DISCOVERY ≠ CLOSURE', 'EVIDENCE IS EXACT-SHA BOUND', 'UNPROVEN ≠ PASS', 'EXTERNAL BLOCKER ≠ LOCAL STOP', 'INDEX-ONLY BOUNDARY', 'INDEX UPDATE ≠ CAPABILITY CLOSURE'];
const FORBIDDEN_WEAKENING_PATTERNS = [/historical\s+pass[\s\S]{0,120}\btransfer(?:s|red)?\b\s+automatically/i, /unproven[\s\S]{0,120}\b(?:be\s+)?(?:promoted|converted)\s+to\s+pass/i, /blocker[\s\S]{0,120}\b(?:may|can|could|should)\s+stop\s+unrelated/i, /next\s*\+\s*1[\s\S]{0,80}\b(?:is\s+)?optional\b/i, /next\s*\+\s*2[\s\S]{0,80}\b(?:is\s+)?optional\b/i, /execution\s+debt[\s\S]{0,100}\b(?:may|can|could|should)\s+be\s+ignored/i, /index\s+update[\s\S]{0,100}\bcounts\s+as\s+(?:execution\s+)?closure/i, /true\s*stop[\s\S]{0,80}\bis\s+allowed before/i, /waiting\s+(?:for|on)\s+(?:ci|test|deployment|workflow)[\s\S]{0,120}\b(?:may|can|could|should)\s+(?:stop|return|report)\b/i, /parallel\s+work[\s\S]{0,100}\b(?:optional|unnecessary|may\s+be\s+skipped)\b/i, /external\s+blocker[\s\S]{0,120}\b(?:may|can|could|should)\s+(?:clear|erase|satisfy)\s+execution\s+debt/i];
const stripComments = value => value.replace(/<!--[\s\S]*?-->/g, '').replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '$1');
const normalize = value => value.replaceAll('\r\n', '\n').replace(/[`]/g, '').replace(/[ \t]+/g, ' ').trim().toLowerCase();

export function validateExecutionEnforcementProtocol(protocol) {
  if (typeof protocol !== 'string' || protocol.trim().length === 0) throw new Error('Execution enforcement protocol rejected: empty/non-string contract');
  const normalized = normalize(stripComments(protocol));
  const missingRules = REQUIRED_RULES.filter(rule => !normalized.includes(normalize(rule)));
  if (missingRules.length) throw new Error(`Execution enforcement protocol rejected: missing rules: ${missingRules.join(', ')}`);
  const missingAnchors = REQUIRED_CONTRACT_ANCHORS.filter(anchor => !normalized.includes(normalize(anchor)));
  if (missingAnchors.length) throw new Error(`Execution enforcement protocol rejected: missing contract anchors: ${missingAnchors.join(', ')}`);
  const missingCases = REQUIRED_BEHAVIORAL_CASES.filter(marker => !normalized.includes(marker.toLowerCase()));
  if (missingCases.length) throw new Error(`Execution enforcement protocol rejected: missing behavioral cases: ${missingCases.join(', ')}`);
  for (const pattern of FORBIDDEN_WEAKENING_PATTERNS) if (pattern.test(normalized)) throw new Error(`Execution enforcement protocol rejected: weakening pattern: ${pattern}`);
  const trueStopIndex = normalized.indexOf('true stop');
  const debtIndex = normalized.indexOf('execution debt = 0');
  if (trueStopIndex === -1 || debtIndex === -1 || debtIndex > trueStopIndex + 5000) throw new Error('Execution enforcement protocol rejected: TRUE STOP is not explicitly gated by zero execution debt');
  if (!normalized.includes('waiting-time parallelization') || !normalized.includes('result must be consumed immediately')) throw new Error('Execution enforcement protocol rejected: async waiting window is not enforceably consumed');
  return true;
}

export function validateAdaptiveGovernance(governance) {
  if (typeof governance !== 'string' || governance.trim().length === 0) throw new Error('Adaptive governance rejected: empty/non-string contract');
  const normalized = normalize(stripComments(governance));
  const missing = REQUIRED_GOVERNANCE_ANCHORS.filter(anchor => !normalized.includes(normalize(anchor)));
  if (missing.length) throw new Error(`Adaptive governance rejected: missing anchors: ${missing.join(', ')}`);
  if (!/^.*layer 1.*programmer execution protocol.*$/mi.test(normalized) || !/^.*layer 2.*master execution index.*$/mi.test(normalized) || !/^.*layer 3.*adaptive execution governance.*$/mi.test(normalized)) throw new Error('Adaptive governance rejected: explicit layer separation is missing or malformed');
  if (!normalized.includes('one-off incident') || !normalized.includes('repeated pattern') || !normalized.includes('proven systemic failure')) throw new Error('Adaptive governance rejected: evolution threshold is incomplete');
  if (!normalized.includes('commits, lines changed, report size, index size, and test count are not progress metrics')) throw new Error('Adaptive governance rejected: activity/progress separation missing');
  if (!normalized.includes('lower-priority instruction must not override a higher-priority')) throw new Error('Adaptive governance rejected: precedence binding missing');
  const requiredSections = ['## execution performance ledger', '## execution effectiveness', '## under-execution detection', '## over-execution / low-value execution', '## command quality feedback', '## adaptive strategy rules', '## controlled protocol evolution', '## strategy memory', '## baseline / result', '## smart front prioritization', '## release-relevant progress', '## governance truth invariants'];
  const missingSections = requiredSections.filter(section => !normalized.includes(section));
  if (missingSections.length) throw new Error(`Adaptive governance rejected: missing structural sections: ${missingSections.join(', ')}`);
  const underSection = normalized.indexOf('## under-execution detection');
  const overSection = normalized.indexOf('## over-execution / low-value execution');
  const underEvent = normalized.indexOf('under-execution event');
  if (underSection === -1 || overSection === -1 || underEvent < underSection || underEvent > overSection) throw new Error('Adaptive governance rejected: UNDER-EXECUTION DETECTION section is missing or structurally incomplete');
  const lowValue = normalized.indexOf('low-value execution');
  if (lowValue < overSection) throw new Error('Adaptive governance rejected: LOW-VALUE EXECUTION anchor is not inside its required section');
  const requiredTruthInvariants = ['discovery ≠ closure: an executable fix must be executed and verified before closure is claimed.', 'evidence is exact-sha bound: evidence from an older sha must not be transferred to a newer sha.', 'unproven ≠ pass: missing runtime/operational proof remains unproven.', 'external blocker ≠ local stop: external blockers isolate only dependent work; independent actionable work must continue.', 'index-only boundary: a current head may differ from the indexed code/test head only when ancestry is verified and every changed path is exactly docs/master_execution_index.md; otherwise it is index drift.', 'index update ≠ capability closure: documentation/history synchronization never counts as product capability progress by itself.'];
  const missingTruthInvariants = requiredTruthInvariants.filter(invariant => !normalized.includes(invariant));
  if (missingTruthInvariants.length) throw new Error(`Adaptive governance rejected: governance truth invariant weakened: ${missingTruthInvariants.join(' | ')}`);
  return true;
}

export function validateCurrentHeadIndex(index, currentHead, parentHead = '', changedFiles = null) {
  const head = normalize(currentHead);
  if (!head || !/^[0-9a-f]{40}$/.test(head)) throw new Error('Index current-head gate rejected: invalid repository HEAD');
  const currentState = index.match(/(?:CURRENT PROJECT STATE|CURRENT EXECUTION BOUNDARY)[\s\S]{0,2500}/i)?.[0] ?? index;
  const candidatePatterns = [
    /CURRENT CODE\/TEST CANDIDATE\s*:?\s*`([0-9a-f]{40})`/i,
    /Exact candidate\s*:?\s*`([0-9a-f]{40})`/i,
    /Exact code\/test head\s*:?\s*`([0-9a-f]{40})`/i,
    /Current (?:code\/test )?(?:head|candidate)\s*:?\s*`([0-9a-f]{40})`/i,
  ];
  const indexedHead = candidatePatterns.map(pattern => currentState.match(pattern)?.[1]).find(Boolean)?.toLowerCase();
  const boundaryMatch = index.match(/Current repository index boundary head[^`]*`([0-9a-f]{40})`/i);
  const indexedBoundaryHead = boundaryMatch?.[1]?.toLowerCase();
  if (!indexedHead) throw new Error('Index current-head gate rejected: indexed code/test candidate missing');
  if (indexedHead === head) return true;
  if (changedFiles !== null) {
    if (!Array.isArray(changedFiles) || changedFiles.length === 0 || changedFiles.some(file => file !== 'docs/MASTER_EXECUTION_INDEX.md')) {
      throw new Error(`Index current-head gate rejected: INDEX BOUNDARY NOT ANCESTOR (index=${indexedHead}, boundary=${indexedBoundaryHead ?? 'missing'}, head=${currentHead}, parent=${parentHead || 'unknown'})`);
    }
  }
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', indexedHead, head], { stdio: 'ignore' });
    return true;
  } catch {
    throw new Error(`Index current-head gate rejected: INDEX BOUNDARY NOT ANCESTOR (index=${indexedHead}, boundary=${indexedBoundaryHead ?? 'missing'}, head=${currentHead}, parent=${parentHead || 'unknown'})`);
  }
}

const debtLedger = fs.readFileSync('docs/EXECUTION_DEBT_AND_RELEASE_VELOCITY.md', 'utf8');
for (const anchor of ['EXECUTION DEBT', 'ACTIONABLE DEBT', 'EXTERNAL DEBT', 'RELEASE VELOCITY', 'EXECUTION UTILIZATION', 'TRUE STOP', 'Built', 'Integrated', 'Verified', 'Runtime Proven', 'Production Certified']) if (!normalize(stripComments(debtLedger)).includes(normalize(anchor))) throw new Error(`Execution enforcement protocol rejected: debt/velocity ledger missing ${anchor}`);

export function validateProjectIdentity() {
  const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const surfaces = tracked.filter(file => file === 'index.html' || file === 'package.json' || file === 'README.md' || file.startsWith('src/') || file.startsWith('public/'));
  const legacy = surfaces.filter(file => { try { return fs.readFileSync(file, 'utf8').includes('العامري'); } catch { return false; } });
  if (legacy.length) throw new Error(`Project identity rejected: legacy branding found in current frontend surface(s): ${legacy.join(', ')}`);
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  if (!indexHtml.includes('الأغبري')) throw new Error('Project identity rejected: canonical frontend identity الأغبري missing from index.html');
  return true;
}

const adaptiveGovernance = fs.readFileSync(GOVERNANCE_FILE, 'utf8');
validateAdaptiveGovernance(adaptiveGovernance);

if (process.argv[1] && process.argv[1].endsWith('check-execution-enforcement-protocol.mjs')) {
  const protocol = fs.readFileSync('docs/EXECUTION_ENFORCEMENT_PROTOCOL.md', 'utf8');
  validateExecutionEnforcementProtocol(protocol);
  validateProjectIdentity();
  if (process.env.ENFORCE_INDEX_HEAD_GATE === '1') {
    const index = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');
    let currentHead = ''; let parentHead = '';
    try { currentHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); parentHead = execFileSync('git', ['rev-parse', 'HEAD^'], { encoding: 'utf8' }).trim(); } catch { currentHead = process.env.GITHUB_SHA?.trim() ?? ''; parentHead = process.env.GITHUB_PARENT_SHA?.trim() ?? ''; }
    validateCurrentHeadIndex(index, currentHead, parentHead);
    console.log(`PASS index-head gate: frozen Index boundary is valid for current HEAD ${currentHead}; equality is not required before deployment/runtime certification`);
  }
  console.log(`PASS execution enforcement protocol: ${REQUIRED_RULES.length} mandatory rules, behavioral cases, v4 governance layer, scheduling controls, debt/velocity ledger, and versioned index-head certification gate active`);
}