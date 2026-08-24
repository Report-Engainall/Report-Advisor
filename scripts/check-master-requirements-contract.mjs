import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const roadmap=fs.readFileSync(path.join(root,'docs/IMPLEMENTATION_ROADMAP.md'),'utf8');
const required=[
 'Automatic watched-folder synchronization','Revised reports are fingerprinted','First-stage text-first extraction/reconstruction',
 'Extraction is a quality layer, not a single point of failure','Canonical report reconstruction must preserve','parse-once cache and report-version lineage',
 'Arabic/English digits, headers, units, currencies, dates','Product families and pack/weight variants','Demand horizon remains configurable',
 'Alternative-item groups must be weighted','Inventory recommendations must protect liquidity','AI is advisory and evidence-bound',
 'Reports, recommendations and decisions must preserve tenant isolation','Phase K — Production Intelligence & Autonomous Optimization'
];
const missing=required.filter(x=>!roadmap.includes(x));
if(missing.length)throw new Error(`Master requirements missing:\n${missing.join('\n')}`);
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(!pkg.scripts?.['test:master-requirements'])throw new Error('Master requirement gate is not registered');
const quality=fs.readFileSync(path.join(root,'.github/workflows/quality.yml'),'utf8');
if(!quality.includes('test:master-requirements'))throw new Error('Master requirement gate is not release-blocking in Quality');
console.log('Master requirements contract: PASS');
