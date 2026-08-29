import { spawn } from 'node:child_process';

const stages = [
  ['01-build-typecheck', 'typecheck'],
  ['02-lint', 'lint'],
  ['03-architecture', 'test:contracts'],
  ['04-auth-tenant', 'test:auth-tenant-convergence'],
  ['05-rls', 'test:global-tenant-rls'],
  ['06-migration-schema', 'test:migration-schema-audit'],
  ['07-migration-dependencies', 'test:migration-dependencies'],
  ['08-import-security', 'test:import-direct-write-guard'],
  ['09-import-transaction', 'test:import-transaction-contract'],
  ['10-import-runtime', 'test:import-runtime-governance'],
  ['11-file-intelligence', 'test:file-engine-capability-contract'],
  ['12-schema-intelligence', 'test:schema-intelligence'],
  ['13-document-intelligence', 'test:document-intelligence-closure'],
  ['14-data-truth', 'test:data-quality-projections'],
  ['15-business-intelligence', 'test:consolidated-intelligence'],
  ['16-decision-intelligence', 'test:decision-intelligence-closure'],
  ['17-watched-folder', 'test:cross-platform-folder-capability'],
  ['18-production-resilience', 'test:production-readiness'],
  ['19-performance-scale', 'test:production-scale'],
  ['20-release-blockers', 'test:production-release-blockers'],
];

const maxParallel = Math.max(1, Number(process.env.READINESS_PARALLELISM ?? 5));
const results = new Map();
let cursor = 0;

function runStage([name, script]) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', script], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk.toString(); });
    child.stderr.on('data', (chunk) => { output += chunk.toString(); });
    child.on('close', (code, signal) => {
      const status = code === 0 ? 'PASS' : 'FAIL';
      results.set(name, { status, script, code, signal, durationMs: Date.now() - started, output });
      resolve();
    });
    child.on('error', (error) => {
      results.set(name, { status: 'FAIL', script, code: null, signal: null, durationMs: Date.now() - started, output: `${output}\n${error.message}` });
      resolve();
    });
  });
}

async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= stages.length) return;
    const stage = stages[index];
    console.log(`START ${stage[0]} :: npm run ${stage[1]}`);
    await runStage(stage);
    const result = results.get(stage[0]);
    console.log(`${result.status} ${stage[0]} (${result.durationMs}ms)`);
  }
}

await Promise.all(Array.from({ length: Math.min(maxParallel, stages.length) }, worker));

const ordered = stages.map(([name]) => [name, results.get(name)]);
const failed = ordered.filter(([, result]) => result.status !== 'PASS');
console.log('\n=== 20-STAGE RELEASE READINESS ===');
for (const [name, result] of ordered) {
  console.log(`${result.status.padEnd(4)} ${name} :: ${result.script} :: ${result.durationMs}ms`);
}
console.log(`TOTAL=${stages.length} PASS=${stages.length - failed.length} FAIL=${failed.length}`);

if (failed.length) {
  console.error('\nRelease readiness is NOT PROVEN. Failed stages:');
  for (const [name, result] of failed) {
    console.error(`\n--- ${name} / ${result.script} ---\n${result.output.slice(-6000)}`);
  }
  process.exitCode = 1;
}
