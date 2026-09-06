import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const runner = fs.readFileSync(path.join(root, 'src/lib/report-execution/durable-production-runner.ts'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'src/lib/report-execution/durable-worker-adapter.ts'), 'utf8');
const contract = fs.readFileSync(path.join(root, 'src/lib/report-execution/report-execution-contract.ts'), 'utf8');

const assertions = [
  ['production lifecycle is invoked only after checkpoint progression', /while\s*\(stage !== 'rendered'\)[\s\S]*?await store\.saveCheckpoint[\s\S]*?\}\n\n\s*const lifecycle = runProductionLifecycle/],
  ['completion evidence contains source hash', /store\.complete\([\s\S]*?sourceHash:\s*input\.sourceHash/],
  ['completion evidence records lineage count', /lineageCount:\s*lifecycle\.lineage\.length/],
  ['completion evidence records scenario', /scenario:\s*lifecycle\.scenario/],
  ['completion evidence records portfolio', /portfolio:\s*lifecycle\.portfolio/],
  ['completion evidence records autonomy', /autonomy:\s*lifecycle\.autonomy/],
  ['failure persists structured error message', /store\.fail\([\s\S]*?message:\s*error\s+instanceof\s+Error/],
  ['failure attempts retry only within attempt budget', /if\s*\(job\.attempt < job\.maxAttempts\)\s*await store\.retry/],
  ['request identity is tenant-scoped', /tenantId.*idempotencyKey/],
  ['request identity includes source snapshot when available', /sourceSnapshotId \?\? 'latest'/],
];

for (const [name, pattern] of assertions) {
  const source = name.includes('request identity') ? adapter : name.includes('completion') || name.includes('failure') || name.includes('production lifecycle') ? runner : contract;
  if (!pattern.test(source)) throw new Error(`evidence-boundary regression: ${name}`);
}

if (/complete\(jobId:\s*string,\s*workerId:\s*string,\s*evidence:\s*Record<string, unknown>\s*=\s*\{\},\s*tenantId\?:\s*string\)/.test(adapter) && !/p_company_id:\s*tenant/.test(adapter)) {
  throw new Error('completion RPC admission lost explicit tenant parameter');
}

console.log('Report execution evidence boundary contract: PASS');
console.log(`Evidence assertions: ${assertions.length} PASS`);
