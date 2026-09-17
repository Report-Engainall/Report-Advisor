import fs from 'node:fs';

const files = ['src/pages/DecisionExperiencePage.tsx', 'src/lib/queries.ts'];
const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const required = [
  'Decision Workspace',
  'updateRecommendationStatus',
  'p_recommendation_id',
  'accepted',
  'rejected',
  'Authenticated runtime',
  'tenant authority',
  'Outcome & Learning',
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`DECISION_LIFECYCLE_CONTRACT_MISSING:${token}`);
}
if (/Math\.random|fake|mock|synthetic/i.test(source)) throw new Error('DECISION_LIFECYCLE_SYNTHETIC_DATA_FORBIDDEN');
if (/APPROVED.*local|approved.*locally/i.test(source)) throw new Error('DECISION_LIFECYCLE_LOCAL_APPROVAL_FORBIDDEN');
console.log('Decision lifecycle UI contract: PASS');
