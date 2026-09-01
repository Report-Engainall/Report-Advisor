import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src/lib/report-execution/production-coordinator-bridge.ts');
if (!fs.existsSync(file)) throw new Error('production coordinator bridge missing');

const source = fs.readFileSync(file, 'utf8');
const requiredCanonicalTokens = [
  'diffRows',
  'consolidateRuntime',
  'chooseScenario',
  'prioritizeDecisions',
  'canAutonomouslyExecute',
  'assertProductionCheckpoint',
];

for (const token of requiredCanonicalTokens) {
  if (!source.includes(token)) throw new Error(`bridge contract missing canonical API: ${token}`);
}

console.log('Production coordinator bridge contract: PASS');
