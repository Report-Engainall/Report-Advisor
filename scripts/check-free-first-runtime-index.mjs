import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const workflowsDir = path.join(ROOT, '.github', 'workflows');
const scriptsDir = path.join(ROOT, 'scripts');
const productRef = fs.readFileSync(path.join(ROOT, 'docs', 'MASTER_PRODUCT_REFERENCE.md'), 'utf8');
const index = fs.readFileSync(path.join(ROOT, 'docs', 'MASTER_EXECUTION_INDEX.md'), 'utf8');

const allDeps = {
  ...(pkg.dependencies ?? {}),
  ...(pkg.devDependencies ?? {}),
};

const paidOrHostedPatterns = [
  /openai/i,
  /anthropic/i,
  /gemini/i,
  /vertex/i,
  /cohere/i,
  /mistral/i,
  /groq/i,
  /replicate/i,
  /lovable/i,
  /vercel-ai/i,
];

const suspicious = Object.keys(allDeps).filter((name) => paidOrHostedPatterns.some((re) => re.test(name)));
if (suspicious.length) {
  throw new Error(`Potential paid/hosted AI dependency detected: ${suspicious.join(', ')}`);
}

if (!productRef.includes('free-first/open-source-first')) {
  throw new Error('MASTER_PRODUCT_REFERENCE is missing the free-first/open-source-first guardrail');
}
if (!productRef.includes('never silently starts paid usage')) {
  throw new Error('AI quota guardrail is missing from MASTER_PRODUCT_REFERENCE');
}
if (!productRef.includes('Ollama is optional')) {
  throw new Error('Ollama optionality guardrail is missing');
}

const requiredScripts = [
  'check-data-quality-projections.mjs',
  'check-tenant-security-contract.mjs',
  'check-global-tenant-rls.mjs',
  'check-import-rpc-tenant-context.mjs',
  'check-document-intelligence-closure.mjs',
  'check-production-gate-integrity.mjs',
  'check-phase-m-certification-contract.mjs',
];
for (const file of requiredScripts) {
  if (!fs.existsSync(path.join(scriptsDir, file))) {
    throw new Error(`Required canonical verification script is missing: scripts/${file}`);
  }
}

const workflowFiles = fs.existsSync(workflowsDir)
  ? fs.readdirSync(workflowsDir).filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
  : [];
if (!workflowFiles.length) throw new Error('No CI workflow files found');

if (!index.includes('Quality is the CI primary path') && !index.includes('Quality هو مسار CI الأساسي')) {
  throw new Error('Master execution index must preserve Quality as the primary CI path');
}
if (!index.includes('do not add another push-triggered production workflow')) {
  throw new Error('Master execution index must preserve workflow proliferation guardrail');
}

console.log('Free-first/runtime-index contract: PASS');
console.log(`  - dependencies inspected: ${Object.keys(allDeps).length}`);
console.log(`  - workflows discovered: ${workflowFiles.length}`);
console.log(`  - canonical verification scripts present: ${requiredScripts.length}`);
console.log('  - paid AI fallback guardrails present');
console.log('  - Quality/workflow topology guardrails present');
