import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const registry=fs.readFileSync(path.join(root,'src/lib/semantic-metric-registry.ts'),'utf8');
const ssot=fs.readFileSync(path.join(root,'src/lib/semanticMetrics.ts'),'utf8');
const errors=[];
for(const token of ['metricId','version','owner','certificationStatus','timeSemantic','freshness','consumers','tests','evidence','SEMANTIC_METRIC_REGISTRY','validateSemanticMetricRegistry']) if(!registry.includes(token)) errors.push(`Registry contract missing: ${token}`);
if(!/from '\.\/semanticMetrics(?:\.ts)?'/.test(registry)) errors.push('Registry does not reuse semanticMetrics SSOT.');
if(!ssot.includes('BUSINESS_METRICS')) errors.push('BUSINESS_METRICS SSOT not found.');
if(!registry.includes("'dashboard', 'reports', 'chatbi', 'forecast', 'recommendations', 'decision-engine'")) errors.push('Required consumers are not declared.');
if(!registry.includes('source-derived')) errors.push('Freshness contract is missing.');
if(errors.length){console.error('Semantic metric registry contract: FAIL');console.error(errors.join('\n'));process.exit(1);}
console.log('Semantic metric registry contract: PASS');
