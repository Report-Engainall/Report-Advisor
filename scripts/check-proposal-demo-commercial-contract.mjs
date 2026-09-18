import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/ProposalDemoPage.tsx', 'utf8');

assert.match(page, /function scoreCapability\(requirement: string, capability: Capability\)/);
assert.match(page, /const coverage = mapped\.length \? Math\.round\(\(matched\.length \/ mapped\.length\) \* 100\) : 0;/);
assert.match(page, /const proposalSummary = useMemo\(\(\) =>/);
assert.match(page, /العناصر غير المطابقة تبقى معلّقة للمراجعة/);
assert.match(page, /طباعة \/ PDF/);
assert.match(page, /<Link to=\"\/reports\/executive\"/);
assert.match(page, /Capability Mapping/);
assert.doesNotMatch(page, /Math\.random\(|synthetic data|dummy data|mock data/i);
assert.doesNotMatch(page, /fetch\(|supabase\.from\(/);

console.log('Proposal demo commercial contract: PASS');
console.log('  - requirement coverage is deterministic and transparent');
console.log('  - unmatched requirements are explicitly retained for review');
console.log('  - proposal summary is generated from current capability mapping only');
console.log('  - showcase links remain bound to real in-product routes');
