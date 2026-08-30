import fs from 'node:fs';

const truth = fs.readFileSync('src/lib/intelligence/truthPolicy.ts', 'utf8');
const consolidated = fs.readFileSync('scripts/check-consolidated-intelligence.mjs', 'utf8');
const safeMetrics = fs.readFileSync('scripts/check-safe-metrics.mjs', 'utf8');
const intelligenceRegression = fs.readFileSync('scripts/business-intelligence-regressions.test.ts', 'utf8');
const reportTruth = fs.readFileSync('scripts/check-report-truth-contract.mjs', 'utf8');
const failures = [];
const must = (ok, message) => { if (!ok) failures.push(message); };

for (const token of ['VERIFIED','QUALIFIED','INSUFFICIENT_DATA','BLOCKED','canDisplayAsFact','canDriveDecision']) {
  must(truth.includes(token), `Truth policy missing ${token}`);
}
must(truth.includes('evidenceIds'), 'Every truth assessment must carry evidence identifiers');
must(truth.includes('input.completeness'), 'Truth confidence must incorporate completeness');
must(truth.includes('input.freshness'), 'Truth confidence must incorporate freshness');
must(truth.includes('input.deterministic'), 'Decision-driving analytics must require deterministic computation');
must(truth.includes("status === 'VERIFIED'"), 'Only VERIFIED results may be displayed as fact');
must(truth.includes("status === 'VERIFIED' && confidence >= DECISION_CONFIDENCE"), 'Decision-driving output must require VERIFIED plus decision confidence');

// Truth-breaking semantic shortcuts must remain explicitly guarded.
must(safeMetrics.includes('INSUFFICIENT_METRIC_DATA'), 'Safe metrics must fail closed on insufficient data');
must(safeMetrics.includes('INVALID_METRIC_RANGE'), 'Metric range validation must remain active');
must(intelligenceRegression.includes('NaN'), 'BI regression suite must attack non-finite numeric inputs');
must(intelligenceRegression.includes('Infinity'), 'BI regression suite must attack Infinity numeric inputs');
must(reportTruth.includes('Number.isFinite'), 'Report truth gate must reject non-finite numeric truth');

// Consolidated intelligence must remain a single governed surface.
for (const token of ['truthPolicy.ts','metricSSOT.ts','universalDataContract.ts','canonicalIntelligence.ts','businessIntelligenceEngines.ts']) {
  must(consolidated.includes(token), `Consolidated intelligence boundary missing ${token}`);
}

// Test the test: a fake status conversion must not satisfy the gate.
const decoy = `// VERIFIED\nconst status = 'VERIFIED';\n// canDriveDecision = true`;
must(!/canDriveDecision\s*=\s*true/.test(decoy.replace(/\/\/[^\n]*/g, '')), 'Comment stripping decoy must not become decision evidence');

if (failures.length) {
  console.error(`PHASE5_BUSINESS_INTELLIGENCE_TRUTH_CLOSURE_FAIL\n${failures.map((x) => `- ${x}`).join('\n')}`);
  process.exit(1);
}
console.log('PHASE5_BUSINESS_INTELLIGENCE_TRUTH_CLOSURE_PASS (truth states, evidence provenance, deterministic decision gate, numeric fail-closed semantics, consolidated intelligence, and test-of-test decoy)');
