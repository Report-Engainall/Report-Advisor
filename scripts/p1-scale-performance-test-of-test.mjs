import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = new URL('../', import.meta.url).pathname;
const tmp = await mkdtemp(join(tmpdir(), 'report-advisor-perf-mutation-'));

async function expectFailure(sourcePath, mutate, label) {
  const source = await readFile(sourcePath, 'utf8');
  const mutated = mutate(source);
  assert.notEqual(mutated, source, `${label}: mutation did not change source`);
  const target = join(tmp, `${label}.mjs`);
  await writeFile(target, mutated, 'utf8');
  await assert.rejects(
    exec(process.execPath, ['--expose-gc', target], { timeout: 120_000 }),
    undefined,
    `${label}: weakened implementation was not detected`,
  );
}

await expectFailure(
  join(root, 'scripts/p1-scale-performance-closure.mjs'),
  (source) => source.replace(
    'assert.ok(result.maxActive >= 1 && result.maxActive <= concurrency);',
    'assert.ok(result.maxActive >= 1);',
  ).replace(
    'const runners = Array.from({ length: limit }, async () => {',
    'const runners = Array.from({ length: limit * 2 }, async () => {',
  ),
  'concurrency-admission',
);

const bounded = await readFile(join(root, 'scripts/check-bounded-concurrency.mjs'), 'utf8');
const weakenedBounded = bounded.replace(
  "if (this.queue.length >= this.maxQueue) return Promise.reject(new Error('queue limit'));",
  '',
);
assert.notEqual(weakenedBounded, bounded);
const boundedTarget = join(tmp, 'bounded-queue.mjs');
await writeFile(boundedTarget, weakenedBounded, 'utf8');
await assert.rejects(
  exec(process.execPath, [boundedTarget], { timeout: 30_000 }),
  undefined,
  'bounded-queue: removed queue guard was not detected',
);

const concurrent = await readFile(join(root, 'scripts/check-concurrent-analysis.mjs'), 'utf8');
const weakenedConcurrent = concurrent.replace(
  'return `${revision.tenantId}:${revision.key}`;',
  'return `${revision.key}`;',
);
assert.notEqual(weakenedConcurrent, concurrent);
const concurrentTarget = join(tmp, 'tenant-key.mjs');
await writeFile(concurrentTarget, weakenedConcurrent, 'utf8');
await assert.rejects(
  exec(process.execPath, [concurrentTarget], { timeout: 30_000 }),
  undefined,
  'tenant-key: removed tenant dimension was not detected',
);

await rm(tmp, { recursive: true, force: true });
console.log('P1 SCALE TEST-OF-TEST PASS (concurrency admission, bounded queue, tenant key isolation)');
