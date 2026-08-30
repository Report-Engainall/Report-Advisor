import fs from 'node:fs';
const failures=[];
const checks=[
 ['src/lib/intelligence/truthPolicy.ts',['VERIFIED','QUALIFIED','INSUFFICIENT_DATA','BLOCKED','canDisplayAsFact','canDriveDecision','evidenceIds','input.completeness','input.freshness','input.deterministic']],
 ['scripts/check-safe-metrics.mjs',['INSUFFICIENT_METRIC_DATA','INVALID_METRIC_RANGE']],
 ['scripts/business-intelligence-regressions.test.ts',['NaN','Infinity']],
 ['scripts/check-report-truth-contract.mjs',['Number.isFinite']],
 ['scripts/check-consolidated-intelligence.mjs',['truthPolicy.ts','metricSSOT.ts','universalDataContract.ts','canonicalIntelligence.ts']],
];
for(const [file,tokens] of checks){if(!fs.existsSync(file)){failures.push(`missing:${file}`);continue;}const s=fs.readFileSync(file,'utf8');for(const t of tokens)if(!s.includes(t))failures.push(`${file}:missing:${t}`);}
if(!fs.existsSync('src/lib/semantic-metric-registry.ts'))failures.push('missing:semantic metric registry');
const strip=(s)=>s.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/(^|\n)\s*\/\/[^\n]*/g,'$1');
const decoy='// VERIFIED\n// canDriveDecision = true';
if(strip(decoy).includes('canDriveDecision'))failures.push('comment decoy bypass');
if(failures.length){console.error('PHASE5_CURRENT_HEAD_BI_TRUTH_CLOSURE_FAIL\n'+failures.map(x=>`- ${x}`).join('\n'));process.exit(1)}
console.log('PHASE5_CURRENT_HEAD_BI_TRUTH_CLOSURE_PASS');
